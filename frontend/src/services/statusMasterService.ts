import { fetchJson } from './api';

export type QuotationStatusMasterItem = {
  status_id: number;
  code: string;
  label: string;
  description?: string | null;
  color: string;
  sort_order: number;
  is_system: boolean;
  is_active: boolean;
};

export type QuotationStatusPayload = {
  code?: string;
  label: string;
  description?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export const defaultQuotationStatuses: QuotationStatusMasterItem[] = [
  { status_id: -1, code: 'DRAFT', label: 'Draft', description: '', color: 'gray', sort_order: 10, is_system: true, is_active: true },
  { status_id: -2, code: 'PENDING_APPROVAL', label: 'Pending Approval', description: '', color: 'indigo', sort_order: 20, is_system: true, is_active: true },
  { status_id: -3, code: 'CHANGES_REQUESTED', label: 'Changes Requested', description: '', color: 'amber', sort_order: 30, is_system: true, is_active: true },
  { status_id: -4, code: 'APPROVED', label: 'Approved', description: '', color: 'emerald', sort_order: 40, is_system: true, is_active: true },
  { status_id: -5, code: 'SENT', label: 'Sent', description: '', color: 'blue', sort_order: 50, is_system: true, is_active: true },
  { status_id: -6, code: 'ACCEPTED', label: 'Accepted', description: '', color: 'emerald', sort_order: 60, is_system: true, is_active: true },
  { status_id: -7, code: 'REJECTED', label: 'Rejected', description: '', color: 'red', sort_order: 70, is_system: true, is_active: true },
  { status_id: -8, code: 'EXPIRED', label: 'Expired', description: '', color: 'orange', sort_order: 80, is_system: true, is_active: true },
];

export const statusMasterService = {
  list(includeInactive = false) {
    return fetchJson<{ data: QuotationStatusMasterItem[]; total: number }>(
      `/quotation-statuses${includeInactive ? '?includeInactive=true' : ''}`,
    );
  },
  create(payload: QuotationStatusPayload) {
    return fetchJson<QuotationStatusMasterItem>('/quotation-statuses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id: number, payload: QuotationStatusPayload) {
    return fetchJson<QuotationStatusMasterItem>(`/quotation-statuses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  remove(id: number) {
    return fetchJson<{ message: string }>(`/quotation-statuses/${id}`, { method: 'DELETE' });
  },
};