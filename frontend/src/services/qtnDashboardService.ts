import { fetchJson } from './api';

export const qtnDashboardService = {
  async getStats() {
    return fetchJson('/qtn/dashboard/stats');
  },
  async getMonthlyQuotations() {
    return fetchJson('/qtn/dashboard/monthly-quotations');
  },
  async getStatusSummary() {
    return fetchJson('/qtn/dashboard/status-summary');
  },
  async getConversionFunnel() {
    return fetchJson('/qtn/dashboard/conversion-funnel');
  },
  async getPendingApprovals() {
    return fetchJson('/qtn/dashboard/pending-approvals');
  },
  async getRecentQuotations() {
    return fetchJson('/qtn/dashboard/recent-quotations');
  },
  async getTopSalesExecutives() {
    return fetchJson('/qtn/dashboard/top-sales-executives');
  },
};
