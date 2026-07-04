export type AppRole =
  | 'Super Admin'
  | 'Company Owner'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Finance Manager'
  | 'Event Manager'
  | 'Auditor'
  | 'Client';

export const ASSIGNABLE_ROLES: Exclude<AppRole, 'Super Admin'>[] = [
  'Client',
  'Sales Executive',
  'Sales Manager',
  'Company Owner',
  'Finance Manager',
  'Event Manager',
  'Auditor',
];

export function normalizeRole(role?: string | null): AppRole {
  const value = (role || '').trim().toLowerCase();
  if (['super admin', 'administrator', 'admin'].includes(value)) return 'Super Admin';
  if (['company owner', 'owner'].includes(value)) return 'Company Owner';
  if (['sales manager', 'manager', 'sales director'].includes(value)) return 'Sales Manager';
  if (['sales executive', 'executive', 'sales exec', 'exec'].includes(value)) return 'Sales Executive';
  if (['finance manager', 'finance'].includes(value)) return 'Finance Manager';
  if (['event manager', 'event mgr'].includes(value)) return 'Event Manager';
  if (value === 'auditor') return 'Auditor';
  return 'Client';
}

export const canCreateQuotes = (role?: string | null) =>
  ['Super Admin', 'Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalizeRole(role));

export const canEditDrafts = canCreateQuotes;

export const canApproveDiscounts = (role?: string | null) =>
  ['Super Admin', 'Company Owner', 'Sales Manager'].includes(normalizeRole(role));

export const canSendToClient = (role?: string | null) =>
  ['Super Admin', 'Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalizeRole(role));

export function roleHome(role?: string | null) {
  const normalized = normalizeRole(role);
  if (normalized === 'Finance Manager') return '/margin-analysis';
  if (['Event Manager', 'Auditor'].includes(normalized)) return '/quotations';
  if (normalized === 'Client') return '/client-portal';
  return '/';
}

export function canAccessPath(role: string | null | undefined, pathname: string) {
  const normalized = normalizeRole(role);
  if (normalized === 'Super Admin') return true;
  if (['/profile', '/support', '/notifications', '/activity-timeline'].includes(pathname)) return true;
  if (pathname.startsWith('/client-portal')) return normalized === 'Client';
  if (pathname.startsWith('/margin-analysis')) return ['Sales Manager', 'Finance Manager'].includes(normalized);
  if (pathname.includes('approval')) return ['Company Owner', 'Sales Manager'].includes(normalized);
  if (pathname.startsWith('/price-book')) return ['Company Owner', 'Sales Manager'].includes(normalized);
  if (pathname.startsWith('/proposals')) return ['Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalized);
  if (pathname.startsWith('/templates')) return ['Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalized);
  if (pathname.startsWith('/settings/price-books')) return ['Company Owner', 'Sales Manager'].includes(normalized);
  if (pathname.startsWith('/settings/catalog-categories')) return ['Company Owner', 'Sales Manager'].includes(normalized);
  if (
    pathname.startsWith('/settings/tax-configuration') ||
    pathname.startsWith('/settings/service-charge') ||
    pathname.startsWith('/settings/business-rules') ||
    pathname.startsWith('/settings/currency')
  ) return ['Company Owner', 'Sales Manager'].includes(normalized);
  if (pathname.startsWith('/settings')) return false;
  if (pathname === '/quotations/new') return canCreateQuotes(normalized);
  if (pathname.startsWith('/quotation-builder') || pathname.startsWith('/quotations')) {
    return ['Company Owner', 'Sales Manager', 'Sales Executive', 'Finance Manager', 'Event Manager', 'Auditor'].includes(normalized);
  }
  if (pathname === '/') return ['Company Owner', 'Sales Manager', 'Sales Executive'].includes(normalized);
  return false;
}