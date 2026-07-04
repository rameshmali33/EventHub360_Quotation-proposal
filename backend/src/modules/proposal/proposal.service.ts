import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { QuotationService } from '../quotation/quotation.service';
import { QuotationStatus } from '../quotation/dto/create-quotation.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { ProposalSignatureDto } from './dto/proposal-signature.dto';
import { ProposalActionDto } from './dto/proposal-action.dto';
import { PrismaService } from '../../prisma/prisma.service';

export interface Proposal {
  id: number;
  quotationId: number;
  publicHash: string;
  createdAt: Date;
  sentAt?: Date | null;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
}

export interface ProposalView {
  proposalId: number;
  viewedAt: Date;
  ipAddress: string;
}

export interface ProposalSignature {
  proposalId: number;
  signerName: string;
  signatureData: string;
  timestamp: Date;
  ipAddress: string;
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

function mapQuotationToDto(quotation: any): any {
  if (!quotation) return undefined;
  const serialized = serializeDbObject(quotation);
  return {
    quotationId: serialized.quotation_id,
    quoteRef: `QTN-${String(serialized.quotation_id).padStart(5, '0')}`,
    clientName: serialized.lead?.name || 'Client',
    currency: serialized.currency || 'INR',
    subtotal: Number(serialized.subtotal || 0),
    taxTotal: Number(serialized.tax_total || 0),
    total: Number(serialized.total || 0),
    margin: Number(serialized.margin || 0),
    status: serialized.status,
    expiresAt: serialized.expires_at,
    createdAt: serialized.created_at,
    lines: (serialized.lines || [])
      .filter((line: any) => line.is_active !== false)
      .map((line: any) => ({
        lineId: line.line_id,
        itemType: line.item_type,
        description: line.description,
        qty: Number(line.qty || 0),
        rate: Number(line.rate || 0),
        amount: Number(line.amount || 0),
      })),
  };
}

function mapDbProposalToDto(dbProposal: any): any {
  if (!dbProposal) return dbProposal;
  const serialized = serializeDbObject(dbProposal);
  return {
    id: serialized.proposal_id,
    quotationId: serialized.quotation_id,
    publicHash: serialized.public_hash,
    createdAt: serialized.created_at,
    sentAt: serialized.updated_at,
    status: serialized.status,
    quotation: mapQuotationToDto(serialized.quotation),
  };
}

const proposalDetailsInclude = {
  quotation: {
    include: {
      lead: true,
      lines: {
        where: { is_active: true },
        orderBy: { line_id: 'asc' as const },
      },
    },
  },
};

function mapDbSignatureToDto(dbSig: any): any {
  if (!dbSig) return dbSig;
  const serialized = serializeDbObject(dbSig);
  return {
    proposalId: serialized.proposal_id,
    signerName: serialized.signer_name,
    signatureData: serialized.signature_data,
    timestamp: serialized.signed_at,
    ipAddress: serialized.signature_ip,
  };
}

@Injectable()
export class ProposalService {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(createdBy?: number) {
    const proposals = await this.prisma.proposal.findMany({
      where: createdBy ? { quotation: { created_by: BigInt(createdBy) } } : {},
      include: proposalDetailsInclude,
      orderBy: { updated_at: 'desc' },
    });
    return proposals.map((item) => mapDbProposalToDto(item));
  }
  async create(quotationId: number) {
    const quotation = await this.quotationService.findOne(quotationId);

    if (quotation.status !== QuotationStatus.APPROVED) {
      throw new BadRequestException(
        `Proposal can be generated only after quotation approval. Current status: ${quotation.status}`,
      );
    }

    const existing = await this.prisma.proposal.findFirst({
      where: { quotation_id: BigInt(quotationId) },
      include: proposalDetailsInclude,
    });
    if (existing) {
      return mapDbProposalToDto(existing);
    }

    const parentQtn = await this.prisma.quotation.findFirst({
      where: { quotation_id: BigInt(quotationId) },
    });
    if (!parentQtn) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    const publicHash = crypto.randomBytes(32).toString('hex');
    const created = await this.prisma.proposal.create({
      data: {
        tenant_id: parentQtn.tenant_id,
        company_id: parentQtn.company_id,
        quotation_id: BigInt(quotationId),
        public_hash: publicHash,
        status: 'DRAFT',
      },
      include: proposalDetailsInclude,
    });
    return mapDbProposalToDto(created);
  }

  async findOneByQuotationId(quotationId: number) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { quotation_id: BigInt(quotationId) },
      include: proposalDetailsInclude,
    });
    if (!proposal) {
      throw new NotFoundException(
        `Proposal for quotation ${quotationId} not found`,
      );
    }
    return mapDbProposalToDto(proposal);
  }

  async send(quotationId: number, _sendDto: SendProposalDto) {
    const proposal = await this.findOneByQuotationId(quotationId);
    if (proposal.status !== 'DRAFT') {
      throw new BadRequestException(
        `Proposal cannot be sent. Current status: ${proposal.status}`,
      );
    }

    const updated = await this.prisma.proposal.update({
      where: { proposal_id: BigInt(proposal.id) },
      data: {
        status: 'SENT',
        updated_at: new Date(),
      },
      include: proposalDetailsInclude,
    });

    await this.quotationService.update(quotationId, {
      status: QuotationStatus.SENT,
    });

    return mapDbProposalToDto(updated);
  }

  async findByHash(publicHash: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { public_hash: publicHash },
      include: {
        views: true,
        signature: true,
      },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with hash ${publicHash} not found`);
    }

    const quotation = await this.quotationService.findOne(
      Number(proposal.quotation_id),
    );
    const signature = proposal.signature
      ? mapDbSignatureToDto(proposal.signature)
      : null;

    return {
      proposal: mapDbProposalToDto(proposal),
      quotation,
      signature,
      viewsCount: proposal.views.length,
    };
  }

  async recordView(publicHash: string, ipAddress: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { public_hash: publicHash },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with hash ${publicHash} not found`);
    }

    await this.prisma.proposalView.create({
      data: {
        proposal_id: proposal.proposal_id,
        ip_address: ipAddress,
        user_agent: 'Client Browser',
      },
    });

    let updated = proposal;
    if (proposal.status === 'DRAFT' || proposal.status === 'SENT') {
      updated = await this.prisma.proposal.update({
        where: { proposal_id: proposal.proposal_id },
        data: {
          status: 'VIEWED',
          view_count: { increment: 1 },
        },
      });
    } else {
      updated = await this.prisma.proposal.update({
        where: { proposal_id: proposal.proposal_id },
        data: {
          view_count: { increment: 1 },
        },
      });
    }

    return mapDbProposalToDto(updated);
  }

  async sign(
    publicHash: string,
    signatureDto: ProposalSignatureDto,
    ipAddress: string,
  ) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { public_hash: publicHash },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with hash ${publicHash} not found`);
    }

    if (proposal.status === 'ACCEPTED' || proposal.status === 'REJECTED') {
      throw new BadRequestException(
        `Proposal is read-only (Current Status: ${proposal.status})`,
      );
    }

    await this.prisma.proposalSignature.deleteMany({
      where: { proposal_id: proposal.proposal_id },
    });

    const createdSig = await this.prisma.proposalSignature.create({
      data: {
        proposal_id: proposal.proposal_id,
        signer_name: signatureDto.signerName,
        signer_email: 'client@example.com',
        signature_ip: signatureDto.ipAddress || ipAddress,
        signature_data: signatureDto.signatureData,
      },
    });

    return mapDbSignatureToDto(createdSig);
  }

  async accept(publicHash: string, _ipAddress: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { public_hash: publicHash },
      include: {
        views: true,
        signature: true,
      },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with hash ${publicHash} not found`);
    }

    if (proposal.status === 'ACCEPTED' || proposal.status === 'REJECTED') {
      throw new BadRequestException(
        `Proposal is read-only (Current Status: ${proposal.status})`,
      );
    }

    const isViewed = proposal.views.length > 0;
    if (!isViewed && proposal.status !== 'VIEWED') {
      throw new BadRequestException(
        'Proposal must be viewed before it can be accepted',
      );
    }

    if (!proposal.signature) {
      throw new BadRequestException(
        'Proposal must be signed before it can be accepted',
      );
    }

    await this.quotationService.update(Number(proposal.quotation_id), {
      status: QuotationStatus.ACCEPTED,
    });

    const updated = await this.prisma.proposal.update({
      where: { proposal_id: proposal.proposal_id },
      data: {
        status: 'ACCEPTED',
        accepted_at: new Date(),
      },
    });

    return {
      proposal: mapDbProposalToDto(updated),
      signature: mapDbSignatureToDto(proposal.signature),
      message: 'Proposal successfully signed and accepted',
    };
  }

  async reject(
    publicHash: string,
    _actionDto: ProposalActionDto,
    _ipAddress: string,
  ) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { public_hash: publicHash },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with hash ${publicHash} not found`);
    }

    if (proposal.status === 'ACCEPTED' || proposal.status === 'REJECTED') {
      throw new BadRequestException(
        `Proposal is read-only (Current Status: ${proposal.status})`,
      );
    }

    await this.quotationService.update(Number(proposal.quotation_id), {
      status: QuotationStatus.REJECTED,
    });

    const updated = await this.prisma.proposal.update({
      where: { proposal_id: proposal.proposal_id },
      data: {
        status: 'REJECTED',
      },
    });

    return mapDbProposalToDto(updated);
  }
}
