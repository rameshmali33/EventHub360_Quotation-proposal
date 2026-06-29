import { fetchJson } from './api';

export const approvalService = {
  async getApprovals() {
    return fetchJson('/quote-approvals');
  },
  async getApproval(id: number) {
    return fetchJson(`/quote-approvals/${id}`);
  },
  async getHistory(id: number) {
    return fetchJson(`/quote-approvals/${id}/history`);
  },
  async requestApproval(quotationId: number, payload: { discountPercent?: number; notes?: string }) {
    return fetchJson(`/quotations/${quotationId}/approval`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async approve(id: number, payload: { reason?: string } = {}) {
    return fetchJson(`/quote-approvals/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async reject(id: number, payload: { reason?: string } = {}) {
    return fetchJson(`/quote-approvals/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async requestChanges(id: number, payload: { reason?: string } = {}) {
    return fetchJson(`/quote-approvals/${id}/request-changes`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async addComment(id: number, payload: { comment: string }) {
    return fetchJson(`/quote-approvals/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
