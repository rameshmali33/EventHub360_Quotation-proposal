import { SetMetadata } from '@nestjs/common';
import { AppRole } from './roles';

export const APP_ROLES_KEY = 'app_roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(APP_ROLES_KEY, roles);
