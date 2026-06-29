import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardStats {
  totalQuotations: number;
  draftQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  approvedQuotations: number;
  rejectedQuotations: number;
  expiredQuotations: number;
  pendingApprovals: number;
  totalRevenue: number;
  averageDealValue: number;
  acceptanceRate: number;
  averageMargin: number;
}

export interface MonthlyQuotation {
  month: string;
  created: number;
  sent: number;
  accepted: number;
  rejected: number;
  revenue: number;
}

export interface StatusSummary {
  status: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnel {
  leads: number;
  quotationsCreated: number;
  quotationsSent: number;
  quotationsAccepted: number;
  bookingsConverted: number;
}

export interface PendingApprovalItem {
  approvalId: number;
  quotationId: number;
  quoteRef: string;
  clientName: string;
  total: number;
  discountPercent: number;
  marginPercent: number;
  requestedBy: string;
  requestedAt: Date;
  requiredTier: string;
}

export interface RecentQuotationItem {
  quotationId: number;
  quoteRef: string;
  clientName: string;
  eventType: string;
  status: string;
  total: number;
  createdAt: Date;
}

export interface TopSalesExecutive {
  userId: number;
  name: string;
  quotationsCreated: number;
  quotationsAccepted: number;
  revenue: number;
  acceptanceRate: number;
}

@Injectable()
export class QtnDashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true }
    });

    const total = quotations.length;
    if (total === 0) {
      return {
        totalQuotations: 0,
        draftQuotations: 0,
        sentQuotations: 0,
        acceptedQuotations: 0,
        approvedQuotations: 0,
        rejectedQuotations: 0,
        expiredQuotations: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        averageDealValue: 0,
        acceptanceRate: 0,
        averageMargin: 0,
      };
    }

    const sentProposalRecords = await this.prisma.proposal.findMany({
      where: { status: { in: ['SENT', 'VIEWED'] } },
      select: { quotation_id: true },
    });
    const sentProposalQuoteIds = new Set(sentProposalRecords.map(item => Number(item.quotation_id)));

    const draft = quotations.filter(q => q.status === 'DRAFT').length;
    const sent = quotations.filter(q => q.status === 'SENT' || sentProposalQuoteIds.has(Number(q.quotation_id))).length;
    const approved = quotations.filter(q => q.status === 'APPROVED').length;
    const accepted = quotations.filter(q => q.status === 'ACCEPTED').length;
    const approvedOrAccepted = quotations.filter(q => ['APPROVED', 'ACCEPTED'].includes(q.status));
    const rejected = quotations.filter(q => q.status === 'REJECTED').length;
    const expired = quotations.filter(q => q.status === 'EXPIRED').length;
    const pending = quotations.filter(q => q.status === 'PENDING_APPROVAL').length;
    
    const totalRevenue = approvedOrAccepted.reduce((sum, q) => sum + Number(q.total || 0), 0);
    const averageDealValue = quotations.reduce((sum, q) => sum + Number(q.total || 0), 0) / total;
    const acceptanceRate = (approvedOrAccepted.length / total) * 100;

    const totalMarginPercent = quotations.reduce((sum, q) => {
      const subtotal = Number(q.subtotal) || 0;
      const margin = Number(q.margin) || 0;
      const marginPercent = subtotal > 0 ? (margin / subtotal) * 100 : 0;
      return sum + marginPercent;
    }, 0);
    const averageMargin = totalMarginPercent / total;

    return {
      totalQuotations: total,
      draftQuotations: draft,
      sentQuotations: sent,
      acceptedQuotations: accepted,
      approvedQuotations: approved,
      rejectedQuotations: rejected,
      expiredQuotations: expired,
      pendingApprovals: pending,
      totalRevenue,
      averageDealValue: parseFloat(averageDealValue.toFixed(2)),
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      averageMargin: parseFloat(averageMargin.toFixed(2)),
    };
  }

  async getMonthlyQuotations(): Promise<MonthlyQuotation[]> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groups: { [key: string]: MonthlyQuotation } = {};

    quotations.forEach(q => {
      const date = new Date(q.created_at);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = { month: key, created: 0, sent: 0, accepted: 0, rejected: 0, revenue: 0 };
      }

      groups[key].created++;
      if (q.status === 'SENT') groups[key].sent++;
      if (['APPROVED', 'ACCEPTED'].includes(q.status)) {
        groups[key].accepted++;
        groups[key].revenue += Number(q.total || 0);
      }
      if (q.status === 'REJECTED') groups[key].rejected++;
    });

    return Object.values(groups);
  }

  async getStatusSummary(): Promise<StatusSummary[]> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true }
    });

    const counts: { [status: string]: number } = {};
    quotations.forEach(q => {
      counts[q.status] = (counts[q.status] || 0) + 1;
    });

    const total = quotations.length;
    if (total === 0) return [];

    return Object.keys(counts).map(status => ({
      status,
      count: counts[status],
      percentage: parseFloat(((counts[status] / total) * 100).toFixed(2)),
    }));
  }

  async getConversionFunnel(): Promise<ConversionFunnel> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true }
    });

    const created = quotations.length;
    const sent = quotations.filter(q => ['SENT', 'APPROVED', 'ACCEPTED', 'REJECTED'].includes(q.status)).length;
    const accepted = quotations.filter(q => ['APPROVED', 'ACCEPTED'].includes(q.status)).length;
    const bookings = accepted;

    const leadCount = await this.prisma.lead.count({
      where: { is_active: true }
    });

    return {
      leads: leadCount,
      quotationsCreated: created,
      quotationsSent: sent,
      quotationsAccepted: accepted,
      bookingsConverted: bookings,
    };
  }

  async getPendingApprovals(): Promise<PendingApprovalItem[]> {
    const pendingApprovals = await this.prisma.quoteApproval.findMany({
      where: { status: 'PENDING', is_active: true },
      include: {
        quotation: {
          include: {
            lead: true
          }
        }
      }
    });

    const items: PendingApprovalItem[] = [];
    for (const app of pendingApprovals) {
      const firstHistory = await this.prisma.quoteApprovalHistory.findFirst({
        where: { approval_id: app.approval_id, action: 'REQUESTED' },
        orderBy: { created_at: 'asc' }
      });

      let discountPercent = 0;
      let notes = 'Requested approval';
      if (firstHistory) {
        const discMatch = firstHistory.notes?.match(/Discount:\s*([\d.]+)/);
        if (discMatch) discountPercent = parseFloat(discMatch[1]);
        
        const notesMatch = firstHistory.notes?.match(/Notes:\s*(.*)$/);
        if (notesMatch) notes = notesMatch[1];
        else notes = firstHistory.notes || notes;
      }

      const subtotal = app.quotation ? Number(app.quotation.subtotal) : 0;
      const margin = app.quotation ? Number(app.quotation.margin) : 0;
      const marginPercent = subtotal > 0 ? (margin / subtotal) * 100 : 0;

      let requiredRole = 'Sales Manager';
      if (discountPercent > 15 || marginPercent < 10) {
        requiredRole = 'Company Owner';
      }

      items.push({
        approvalId: Number(app.approval_id),
        quotationId: Number(app.quotation_id),
        quoteRef: `QTN-${app.quotation_id.toString().padStart(5, '0')}`,
        clientName: app.quotation?.lead?.name || `Lead Account #${app.quotation?.lead_id}`,
        total: app.quotation ? Number(app.quotation.total) : 0,
        discountPercent,
        marginPercent: parseFloat(marginPercent.toFixed(2)),
        requestedBy: 'Sales Representative',
        requestedAt: app.created_at,
        requiredTier: requiredRole,
      });
    }

    return items;
  }

  async getRecentQuotations(): Promise<RecentQuotationItem[]> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        lead: true
      }
    });

    return quotations.map(q => ({
      quotationId: Number(q.quotation_id),
      quoteRef: `QTN-${q.quotation_id.toString().padStart(5, '0')}`,
      clientName: q.lead?.name || `Lead Account #${q.lead_id}`,
      eventType: 'Event Service Quote',
      status: q.status,
      total: Number(q.total || 0),
      createdAt: q.created_at,
    }));
  }

  async getTopSalesExecutives(): Promise<TopSalesExecutive[]> {
    const quotations = await this.prisma.quotation.findMany({
      where: { is_active: true },
      include: {
        tenant: {
          include: {
            users: {
              where: { is_active: true },
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (quotations.length === 0) {
      return [];
    }

    const executivesMap: { [userId: number]: { name: string; created: number; accepted: number; revenue: number } } = {};

    quotations.forEach(q => {
      const execId = Number(q.created_by || 0);
      if (!execId) return;

      const user = q.tenant.users.find(u => Number(u.user_id) === execId);
      const name = user ? `${user.first_name} ${user.last_name}` : `User #${execId}`;

      if (!executivesMap[execId]) {
        executivesMap[execId] = { name, created: 0, accepted: 0, revenue: 0 };
      }

      executivesMap[execId].created++;
      if (['APPROVED', 'ACCEPTED'].includes(q.status)) {
        executivesMap[execId].accepted++;
        executivesMap[execId].revenue += Number(q.total || 0);
      }
    });

    return Object.keys(executivesMap)
      .map(id => {
        const execId = Number(id);
        const data = executivesMap[execId];
        const rate = data.created > 0 ? (data.accepted / data.created) * 100 : 0;
        return {
          userId: execId,
          name: data.name,
          quotationsCreated: data.created,
          quotationsAccepted: data.accepted,
          revenue: data.revenue,
          acceptanceRate: parseFloat(rate.toFixed(2)),
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.quotationsCreated - a.quotationsCreated)
      .slice(0, 5);
  }
}


