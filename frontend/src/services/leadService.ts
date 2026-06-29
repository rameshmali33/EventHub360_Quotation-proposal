import { fetchJson } from './api';

export interface LeadOption {
  lead_id: number;
  name: string;
}

export const leadService = {
  async createLead(name: string): Promise<LeadOption> {
    return fetchJson('/leads', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async searchLeads(search: string): Promise<LeadOption[]> {
    return fetchJson(`/leads?search=${encodeURIComponent(search)}`);
  },
};
