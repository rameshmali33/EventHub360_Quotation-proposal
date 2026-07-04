import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuotationService } from '../quotation/quotation.service';
import { QuotationStatus } from '../quotation/dto/create-quotation.dto';
import { RequestApprovalDto } from './dto/request-approval.dto';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { ApprovalCommentDto } from './dto/approval-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export enum ApprovalTier {
  AUTO_APPROVED = 'AUTO_APPROVED',
  SALES_MANAGER = 'Sales Manager',
  COMPANY_OWNER = 'Company Owner',
}

export interface QuoteApproval {
  approval_id: number;
  tenant_id: number;
  company_id: number;
  branch_id: number;
  quotation_id: number;
  approver_id: number;
  status: ApprovalStatus;
  required_role: ApprovalTier;
  discount_percent: number;
  margin_percent: number;
  notes?: string;
  decided_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface ApprovalComment {
  comment_id: number;
  approval_id: number;
  comment: string;
  created_by: number;
  created_at: Date;
}

export interface ApprovalHistory {
  history_id: number;
  approval_id: number;
  action: string;
  performed_by: string;
  notes?: string;
  created_at: Date;
}

function serializeDbObject(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDbObject(item));
  }
  const serialized = { ...obj };
  for (const key of Object.keys(serialized)) {
    if (typeof serialized[key] === 'bigint') {
      serialized[key] = Number(serialized[key]);
    } else if (
      serialized[key] &&
      typeof serialized[key].toNumber === 'function'
    ) {
      serialized[key] = serialized[key].toNumber();
    } else if (
      typeof serialized[key] === 'object' &&
      serialized[key] !== null &&
      !(serialized[key] instanceof Date)
    ) {
      serialized[key] = serializeDbObject(serialized[key]);
    }
  }
  return serialized;
}

async function enrichApproval(prisma: PrismaService, approval: any) {
  if (!approval) return approval;
  const quotation = await prisma.quotation.findFirst({
    where: { quotation_id: BigInt(approval.quotation_id) },
  });
  const subtotal = quotation ? Number(quotation.subtotal) : 0;
  const margin = quotation ? Number(quotation.margin) : 0;
  const marginPercent = subtotal > 0 ? (margin / subtotal) * 100 : 0;

  // Read discount percent and notes from history log if possible
  const firstHistory = await prisma.quoteApprovalHistory.findFirst({
    where: { approval_id: BigInt(approval.approval_id), action: 'REQUESTED' },
    orderBy: { created_at: 'asc' },
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

  let requiredRole = ApprovalTier.SALES_MANAGER;
  if (discountPercent > 15 || marginPercent < 10) {
    requiredRole = ApprovalTier.COMPANY_OWNER;
  }

  return {
    ...serializeDbObject(approval),
    required_role: requiredRole,
    discount_percent: discountPercent,
    margin_percent: parseFloat(marginPercent.toFixed(2)),
    notes,
  };
}

@Injectable()
export class QuoteApprovalService {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const dbApprovals = await this.prisma.quoteApproval.findMany({
      where: { is_active: true },
    });
    const enriched: any[] = [];
    for (const app of dbApprovals) {
      enriched.push(await enrichApproval(this.prisma, app));
    }
    return enriched;
  }

  async findOne(id: number) {
    const approval = await this.prisma.quoteApproval.findFirst({
      where: { approval_id: BigInt(id), is_active: true },
    });
    if (!approval) {
      throw new NotFoundException(`Quote approval with ID ${id} not found`);
    }
    return await enrichApproval(this.prisma, approval);
  }

  async requestApproval(quotationId: number, requestDto: RequestApprovalDto) {
    const quotation = await this.quotationService.findOne(quotationId);

    const existingPending = await this.prisma.quoteApproval.findFirst({
      where: {
        quotation_id: BigInt(quotationId),
        status: ApprovalStatus.PENDING,
        is_active: true,
      },
    });
    if (existingPending) {
      throw new BadRequestException(
        `Quotation ${quotationId} already has a pending approval request`,
      );
    }

    const subtotal = Number(quotation.subtotal) || 0;
    const margin = Number(quotation.margin) || 0;
    const marginPercent = subtotal > 0 ? (margin / subtotal) * 100 : 0;
    const discountPercent =
      requestDto.discountPercent !== undefined ? requestDto.discountPercent : 0;

    let requiredRole: ApprovalTier = ApprovalTier.SALES_MANAGER;
    if (discountPercent > 15 || marginPercent < 10) {
      requiredRole = ApprovalTier.COMPANY_OWNER;
    }

    const status = ApprovalStatus.PENDING;

    const parentQtn = await this.prisma.quotation.findFirst({
      where: { quotation_id: BigInt(quotationId) },
    });
    if (!parentQtn) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    const newApproval = await this.prisma.quoteApproval.create({
      data: {
        tenant_id: parentQtn.tenant_id,
        company_id: parentQtn.company_id,
        branch_id: parentQtn.branch_id,
        quotation_id: BigInt(quotationId),
        approver_id: BigInt(0),
        status,
        decided_at: null,
        is_active: true,
      },
    });

    const newQuoteStatus = QuotationStatus.PENDING_APPROVAL;
    await this.quotationService.update(quotationId, { status: newQuoteStatus });

    const historyNotes = `Approval requested. Required Tier: ${requiredRole}. Margin: ${marginPercent.toFixed(2)}%, Discount: ${discountPercent}%. Notes: ${requestDto.notes || 'None'}`;

    await this.prisma.quoteApprovalHistory.create({
      data: {
        approval_id: newApproval.approval_id,
        action: 'REQUESTED',
        performed_by: 'Sales Executive',
        notes: historyNotes,
      },
    });

    return await enrichApproval(this.prisma, newApproval);
  }

  async approve(approvalId: number, actionDto: ApprovalActionDto) {
    const approval = await this.findOne(approvalId);
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Approval is not in PENDING status (current: ${approval.status})`,
      );
    }

    const updated = await this.prisma.quoteApproval.update({
      where: { approval_id: BigInt(approvalId) },
      data: {
        status: ApprovalStatus.APPROVED,
        decided_at: new Date(),
        updated_at: new Date(),
      },
    });

    await this.quotationService.update(Number(approval.quotation_id), {
      status: QuotationStatus.APPROVED,
    });

    await this.prisma.quoteApprovalHistory.create({
      data: {
        approval_id: BigInt(approvalId),
        action: 'APPROVED',
        performed_by:
          approval.required_role === ApprovalTier.COMPANY_OWNER
            ? 'Company Owner'
            : 'Sales Manager',
        notes: actionDto.reason
          ? `Approved. Reason: ${actionDto.reason}`
          : 'Approved.',
      },
    });

    return await enrichApproval(this.prisma, updated);
  }

  async reject(approvalId: number, actionDto: ApprovalActionDto) {
    const approval = await this.findOne(approvalId);
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Approval is not in PENDING status (current: ${approval.status})`,
      );
    }

    const updated = await this.prisma.quoteApproval.update({
      where: { approval_id: BigInt(approvalId) },
      data: {
        status: ApprovalStatus.REJECTED,
        decided_at: new Date(),
        updated_at: new Date(),
      },
    });

    await this.quotationService.update(Number(approval.quotation_id), {
      status: QuotationStatus.REJECTED,
    });

    await this.prisma.quoteApprovalHistory.create({
      data: {
        approval_id: BigInt(approvalId),
        action: 'REJECTED',
        performed_by:
          approval.required_role === ApprovalTier.COMPANY_OWNER
            ? 'Company Owner'
            : 'Sales Manager',
        notes: actionDto.reason
          ? `Rejected. Reason: ${actionDto.reason}`
          : 'Rejected.',
      },
    });

    return await enrichApproval(this.prisma, updated);
  }

  async requestChanges(approvalId: number, actionDto: ApprovalActionDto) {
    const approval = await this.findOne(approvalId);
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Approval is not in PENDING status (current: ${approval.status})`,
      );
    }

    const updated = await this.prisma.quoteApproval.update({
      where: { approval_id: BigInt(approvalId) },
      data: {
        status: ApprovalStatus.CHANGES_REQUESTED,
        decided_at: new Date(),
        updated_at: new Date(),
      },
    });

    await this.quotationService.update(Number(approval.quotation_id), {
      status: QuotationStatus.CHANGES_REQUESTED,
    });

    await this.prisma.quoteApprovalHistory.create({
      data: {
        approval_id: BigInt(approvalId),
        action: 'CHANGES_REQUESTED',
        performed_by:
          approval.required_role === ApprovalTier.COMPANY_OWNER
            ? 'Company Owner'
            : 'Sales Manager',
        notes: actionDto.reason
          ? `Changes Requested. Reason: ${actionDto.reason}`
          : 'Changes Requested.',
      },
    });

    return await enrichApproval(this.prisma, updated);
  }

  async addComment(approvalId: number, commentDto: ApprovalCommentDto) {
    await this.findOne(approvalId);

    const createdComment = await this.prisma.quoteApprovalComment.create({
      data: {
        approval_id: BigInt(approvalId),
        comment: commentDto.comment,
        created_by: BigInt(1),
      },
    });

    await this.prisma.quoteApprovalHistory.create({
      data: {
        approval_id: BigInt(approvalId),
        action: 'COMMENT_ADDED',
        performed_by: 'User',
        notes: `Added comment: "${commentDto.comment}"`,
      },
    });

    return serializeDbObject(createdComment);
  }

  async getHistory(approvalId: number) {
    await this.findOne(approvalId); // Verify existence
    const historyList = await this.prisma.quoteApprovalHistory.findMany({
      where: { approval_id: BigInt(approvalId) },
      orderBy: { created_at: 'asc' },
    });
    return serializeDbObject(historyList);
  }
}
