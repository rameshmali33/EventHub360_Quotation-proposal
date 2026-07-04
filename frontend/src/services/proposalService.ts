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

const toNumber = (value: unknown) => Number(value || 0);

const normalizeLine = (line: any): ProposalLine => {
  const qty = toNumber(line?.qty ?? line?.quantity);
  const rate = toNumber(line?.rate ?? line?.unitPrice ?? line?.unit_price);
  return {
    lineId: toNumber(line?.lineId ?? line?.line_id ?? line?.id),
    itemType: String(line?.itemType ?? line?.item_type ?? line?.type ?? 'SERVICE'),
    description: String(line?.description ?? line?.item_name ?? line?.name ?? 'Quotation item'),
    qty,
    rate,
    amount: toNumber(line?.amount ?? line?.total) || qty * rate,
  };
};

const normalizeQuotation = (quotation: any, fallbackQuotationId = 0): ProposalQuotation | undefined => {
  if (!quotation) return undefined;
  const quotationId = toNumber(quotation.quotationId ?? quotation.quotation_id ?? fallbackQuotationId);
  return {
    quotationId,
    quoteRef: String(quotation.quoteRef ?? quotation.quote_ref ?? `QTN-${String(quotationId).padStart(5, '0')}`),
    clientName: String(quotation.clientName ?? quotation.client_name ?? quotation.lead?.name ?? 'Client'),
    currency: String(quotation.currency || 'INR'),
    subtotal: toNumber(quotation.subtotal),
    taxTotal: toNumber(quotation.taxTotal ?? quotation.tax_total),
    total: toNumber(quotation.total),
    margin: toNumber(quotation.margin),
    status: String(quotation.status || 'APPROVED'),
    expiresAt: quotation.expiresAt ?? quotation.expires_at ?? null,
    createdAt: String(quotation.createdAt ?? quotation.created_at ?? new Date().toISOString()),
    lines: Array.isArray(quotation.lines) ? quotation.lines.map(normalizeLine) : [],
  };
};

const normalizeProposal = (proposal: any): Proposal => {
  const quotationId = toNumber(proposal?.quotationId ?? proposal?.quotation_id ?? proposal?.quotation?.quotation_id);
  return {
    id: toNumber(proposal?.id ?? proposal?.proposal_id),
    quotationId,
    publicHash: String(proposal?.publicHash ?? proposal?.public_hash ?? ''),
    createdAt: String(proposal?.createdAt ?? proposal?.created_at ?? new Date().toISOString()),
    sentAt: proposal?.sentAt ?? proposal?.sent_at ?? null,
    status: String(proposal?.status || 'DRAFT').toUpperCase() as Proposal['status'],
    quotation: normalizeQuotation(proposal?.quotation, quotationId),
  };
};

export const proposalService = {
  async getProposals(): Promise<Proposal[]> {
    const response: any = await fetchJson('/proposals');
    const proposals = Array.isArray(response) ? response : response?.data || [];
    return proposals.map(normalizeProposal);
  },

  async generateProposal(quotationId: number | string): Promise<Proposal> {
    const response = await fetchJson(`/quotations/${quotationId}/proposal`, { method: 'POST' });
    return normalizeProposal(response);
  },

  async getProposalByQuotationId(quotationId: number | string): Promise<Proposal> {
    const response = await fetchJson(`/quotations/${quotationId}/proposal`);
    return normalizeProposal(response);
  },

  async sendProposalToClient(quotationId: number | string, payload?: { email: string; notes?: string }): Promise<Proposal> {
    const email = payload?.email || 'client@example.com';
    const notes = payload?.notes || 'Please review the event plan and sign.';
    const response = await fetchJson(`/quotations/${quotationId}/send-to-client`, {
      method: 'POST',
      body: JSON.stringify({ email, notes }),
    });
    return normalizeProposal(response);
  },
};