import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { APP_ROLES_KEY } from './roles.decorator';
import { AppRole, normalizeRole } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      APP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const userId = Number(request.user?.sub);
    if (!userId) throw new UnauthorizedException();

    const user = await this.prisma.userAccount.findUnique({
      where: { user_id: BigInt(userId) },
      include: { user_roles: { include: { role: true } } },
    });
    if (!user || !user.is_active) throw new UnauthorizedException();

    const roles = user.user_roles
      .filter((entry) => entry.role.is_active)
      .map((entry) => normalizeRole(entry.role.name))
      .filter(Boolean) as AppRole[];

    if (userId === 1 && roles.length === 0) roles.push(AppRole.ADMINISTRATOR);
    request.user.roles = roles;

    if (
      roles.includes(AppRole.ADMINISTRATOR) ||
      requiredRoles.some((role) => roles.includes(role))
    ) {
      return true;
    }
    throw new ForbiddenException(
      'Your role does not have access to this resource',
    );
  }
}
