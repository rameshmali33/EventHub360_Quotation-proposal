import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../../prisma/prisma.service';
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
    const existing = await this.prisma.userAccount.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('An account with this email already exists');

    const passwordHash = await this.hashPassword(dto.password);
    const baseSlug = this.slugify(dto.organizationName) || 'eventhub-workspace';
    const subdomain = await this.uniqueSubdomain(baseSlug);

    const user = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.organizationName.trim(), subdomain },
      });
      const company = await tx.company.create({
        data: { tenant_id: tenant.tenant_id, name: dto.organizationName.trim() },
      });
      await tx.branch.create({
        data: {
          tenant_id: tenant.tenant_id,
          company_id: company.company_id,
          name: 'Main Office',
        },
      });
      const role = await tx.role.create({
        data: { tenant_id: tenant.tenant_id, name: 'Administrator' },
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

  async getProfile(userId: number) {
    const user = await this.prisma.userAccount.findUnique({
      where: { user_id: BigInt(userId) },
      include: { tenant: true, user_roles: { include: { role: true } } },
    });
    if (!user || !user.is_active) throw new UnauthorizedException('Your session is no longer active');
    return this.serializeUser(user);
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
    return {
      id: Number(user.user_id),
      tenantId: Number(user.tenant_id),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_roles?.[0]?.role?.name || 'Team Member',
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
    const derived = (await scrypt(password, salt, storedBuffer.length)) as Buffer;
    return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived);
  }

  private slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
  }

  private async uniqueSubdomain(base: string) {
    let candidate = base;
    let suffix = 1;
    while (await this.prisma.tenant.findUnique({ where: { subdomain: candidate } })) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }
}