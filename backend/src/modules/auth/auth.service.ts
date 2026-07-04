import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { AppRole, normalizeRole } from '../../common/auth/roles';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.userAccount.findUnique({
      where: { email },
    });
    if (existing)
      throw new BadRequestException(
        'An account with this email already exists',
      );

    const passwordHash = await this.hashPassword(dto.password);
    const baseSlug = this.slugify(dto.organizationName) || 'eventhub-workspace';
    const subdomain = await this.uniqueSubdomain(baseSlug);

    const user = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.organizationName.trim(), subdomain },
      });
      const company = await tx.company.create({
        data: {
          tenant_id: tenant.tenant_id,
          name: dto.organizationName.trim(),
        },
      });
      await tx.branch.create({
        data: {
          tenant_id: tenant.tenant_id,
          company_id: company.company_id,
          name: 'Main Office',
        },
      });
      const role = await tx.role.create({
        data: { tenant_id: tenant.tenant_id, name: AppRole.CLIENT },
      });
      return tx.userAccount.create({
        data: {
          tenant_id: tenant.tenant_id,
          email,
          password_hash: passwordHash,
          first_name: dto.firstName.trim(),
          last_name: dto.lastName.trim(),
          user_roles: { create: { role_id: role.role_id } },
        },
        include: { tenant: true, user_roles: { include: { role: true } } },
      });
    });

    return this.createSession(user);
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { tenant: true, user_roles: { include: { role: true } } },
    });
    if (!user || !user.is_active || !user.tenant.is_active) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!(await this.verifyPassword(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createSession(user);
  }

  async requestPasswordReset(dto: ForgotPasswordDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    const message =
      'If an active account exists for this email, password reset instructions are ready.';
    if (!user || !user.is_active) return { message };

    const resetToken = await this.jwtService.signAsync(
      {
        sub: Number(user.user_id),
        email: user.email,
        purpose: 'password-reset',
      },
      { expiresIn: '15m' },
    );

    return {
      message,
      ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.token, {
        secret: process.env.JWT_SECRET || 'eventhub360-development-secret',
      });
    } catch {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }
    if (payload.purpose !== 'password-reset' || !payload.sub) {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }

    const user = await this.prisma.userAccount.findUnique({
      where: { user_id: BigInt(payload.sub) },
    });
    if (!user || !user.is_active || user.email !== payload.email) {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }

    await this.prisma.userAccount.update({
      where: { user_id: user.user_id },
      data: {
        password_hash: await this.hashPassword(dto.password),
        updated_by: user.user_id,
      },
    });
    return { message: 'Password reset successfully. You can now sign in.' };
  }
  async getProfile(userId: number) {
    const user = await this.prisma.userAccount.findUnique({
      where: { user_id: BigInt(userId) },
      include: { tenant: true, user_roles: { include: { role: true } } },
    });
    if (!user || !user.is_active)
      throw new UnauthorizedException('Your session is no longer active');
    return this.serializeUser(user);
  }

  async listUsers() {
    const users = await this.prisma.userAccount.findMany({
      include: { tenant: true, user_roles: { include: { role: true } } },
      orderBy: { created_at: 'desc' },
    });
    return users.map((user) => ({
      ...this.serializeUser(user),
      isActive: user.is_active,
      createdAt: user.created_at,
    }));
  }

  async assignRole(userId: number, dto: AssignRoleDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { user_id: BigInt(userId) },
      include: { tenant: true, user_roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User account not found');

    const currentRoles = user.user_roles.map((entry) =>
      normalizeRole(entry.role.name),
    );
    if (
      currentRoles.includes(AppRole.ADMINISTRATOR) ||
      (userId === 1 && currentRoles.length === 0)
    ) {
      throw new BadRequestException(
        'The main Super Admin role cannot be changed',
      );
    }

    let role = await this.prisma.role.findFirst({
      where: { tenant_id: user.tenant_id, name: dto.role, is_active: true },
    });
    if (!role) {
      role = await this.prisma.role.create({
        data: { tenant_id: user.tenant_id, name: dto.role },
      });
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { user_id: user.user_id } }),
      this.prisma.userRole.create({
        data: { user_id: user.user_id, role_id: role.role_id },
      }),
    ]);

    return this.getProfile(userId);
  }

  private async createSession(user: any) {
    const serialized = this.serializeUser(user);
    const accessToken = await this.jwtService.signAsync({
      sub: serialized.id,
      email: serialized.email,
      tenantId: serialized.tenantId,
      role: serialized.role,
    });
    return { accessToken, user: serialized };
  }

  private serializeUser(user: any) {
    const storedRole = user.user_roles?.[0]?.role?.name;
    const role =
      normalizeRole(storedRole) ||
      (Number(user.user_id) === 1 ? AppRole.ADMINISTRATOR : AppRole.CLIENT);
    return {
      id: Number(user.user_id),
      tenantId: Number(user.tenant_id),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role,
      organizationName: user.tenant?.name || '',
    };
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, stored: string) {
    const [scheme, salt, hash] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const storedBuffer = Buffer.from(hash, 'hex');
    const derived = (await scrypt(
      password,
      salt,
      storedBuffer.length,
    )) as Buffer;
    return (
      storedBuffer.length === derived.length &&
      timingSafeEqual(storedBuffer, derived)
    );
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64);
  }

  private async uniqueSubdomain(base: string) {
    let candidate = base;
    let suffix = 1;
    while (
      await this.prisma.tenant.findUnique({ where: { subdomain: candidate } })
    ) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }
}
