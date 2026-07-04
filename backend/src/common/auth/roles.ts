export enum AppRole {
  ADMINISTRATOR = 'Super Admin',
  OWNER = 'Company Owner',
  MANAGER = 'Sales Manager',
  EXECUTIVE = 'Sales Executive',
  FINANCE = 'Finance Manager',
  EVENT_MANAGER = 'Event Manager',
  AUDITOR = 'Auditor',
  CLIENT = 'Client',
}

export const ASSIGNABLE_ROLES = [
  AppRole.OWNER,
  AppRole.MANAGER,
  AppRole.EXECUTIVE,
  AppRole.FINANCE,
  AppRole.EVENT_MANAGER,
  AppRole.AUDITOR,
  AppRole.CLIENT,
] as const;

export function normalizeRole(role?: string | null): AppRole | null {
  const value = (role || '').trim().toLowerCase();
  if (['super admin', 'administrator', 'admin'].includes(value))
    return AppRole.ADMINISTRATOR;
  if (['company owner', 'owner'].includes(value)) return AppRole.OWNER;
  if (['sales manager', 'manager', 'sales director'].includes(value))
    return AppRole.MANAGER;
  if (['sales executive', 'executive', 'sales exec', 'exec'].includes(value))
    return AppRole.EXECUTIVE;
  if (['finance manager', 'finance', 'finance user'].includes(value))
    return AppRole.FINANCE;
  if (['event manager', 'event mgr'].includes(value))
    return AppRole.EVENT_MANAGER;
  if (value === 'auditor') return AppRole.AUDITOR;
  if (['client', 'customer'].includes(value)) return AppRole.CLIENT;
  return null;
}
