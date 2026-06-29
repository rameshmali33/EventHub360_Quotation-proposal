import { fetchJson } from './api';

export interface ProposalLine {
  lineId: number;
  itemType: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface ProposalQuotation {
  quotationId: number;
  quoteRef: string;
  clientName: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  margin: number;
  status: string;
  expiresAt?: string | null;
  createdAt: string;
  lines: ProposalLine[];
}

export interface Proposal {
  id: number;
  quotationId: number;
  publicHash: string;
  createdAt: string;
  sentAt?: string | null;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
  quotation?: ProposalQuotation;
}

export const proposalService = {
  async getProposals(): Promise<Proposal[]> {
    return fetchJson('/proposals');
  },

  async generateProposal(quotationId: number | string): Promise<Proposal> {
    return fetchJson(`/quotations/${quotationId}/proposal`, {
      method: 'POST',
    });
  },

  async getProposalByQuotationId(quotationId: number | string): Promise<Proposal> {
    return fetchJson(`/quotations/${quotationId}/proposal`);
  },

  async sendProposalToClient(quotationId: number | string, payload?: { email: string; notes?: string }): Promise<Proposal> {
    const email = payload?.email || 'client@example.com';
    const notes = payload?.notes || 'Please review the event plan and sign.';
    return fetchJson(`/quotations/${quotationId}/send-to-client`, {
      method: 'POST',
      body: JSON.stringify({ email, notes }),
    });
  },
};
