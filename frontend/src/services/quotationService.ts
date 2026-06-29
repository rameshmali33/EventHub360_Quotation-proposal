import { fetchJson } from './api';

export interface CreateQuotationLine {
  item_type: string;
  ref_id: number;
  description: string;
  qty: number;
  rate: number;
  cost: number;
  tax_rule_id?: number;
}

export interface CreateQuotationPayload {
  lead_id: number;
  currency?: string;
  expires_at?: string;
  lines?: CreateQuotationLine[];
}

export interface QuotationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const quotationService = {
  async createQuotation(payload: CreateQuotationPayload) {
    return fetchJson('/quotations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getQuotations(params: QuotationQuery = {}) {
    const queryParts = [];
    if (params.page !== undefined) queryParts.push(`page=${params.page}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.status && params.status !== 'active') queryParts.push(`status=${encodeURIComponent(params.status.toUpperCase())}`);
    if (params.sortBy) queryParts.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${encodeURIComponent(params.sortOrder)}`);

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return fetchJson(`/quotations${query}`);
  },

  async getQuotation(id: number) {
    return fetchJson(`/quotations/${id}`);
  },

  async updateQuotation(id: number, payload: any) {
    return fetchJson(`/quotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteQuotation(id: number) {
    return fetchJson(`/quotations/${id}`, {
      method: 'DELETE',
    });
  },

  async addLine(quotationId: number, linePayload: any) {
    return fetchJson(`/quotations/${quotationId}/lines`, {
      method: 'POST',
      body: JSON.stringify(linePayload),
    });
  },

  async updateLine(quotationId: number, lineId: number, linePayload: any) {
    return fetchJson(`/quotations/${quotationId}/lines/${lineId}`, {
      method: 'PATCH',
      body: JSON.stringify(linePayload),
    });
  },

  async removeLine(quotationId: number, lineId: number) {
    return fetchJson(`/quotations/${quotationId}/lines/${lineId}`, {
      method: 'DELETE',
    });
  },

  async calculate(quotationId: number) {
    return fetchJson(`/quotations/${quotationId}/calculate`, {
      method: 'POST',
    });
  },
};
