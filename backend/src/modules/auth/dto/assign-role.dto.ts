import { IsIn } from 'class-validator';
import { ASSIGNABLE_ROLES, AppRole } from '../../../common/auth/roles';

export class AssignRoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role: Exclude<AppRole, AppRole.ADMINISTRATOR>;
}
