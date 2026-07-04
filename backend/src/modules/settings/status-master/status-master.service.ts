import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateStatusMasterDto,
  UpdateStatusMasterDto,
} from './status-master.dto';

const TENANT_ID = 1n;

const DEFAULT_STATUSES = [
  {
    code: 'DRAFT',
    label: 'Draft',
    description: 'Quotation is being prepared and can still be edited.',
    color: 'gray',
    sort_order: 10,
  },
  {
    code: 'PENDING_APPROVAL',
    label: 'Pending Approval',
    description: 'Quotation is waiting for management approval.',
    color: 'indigo',
    sort_order: 20,
  },
  {
    code: 'CHANGES_REQUESTED',
    label: 'Changes Requested',
    description: 'Approver requested updates before approval.',
    color: 'amber',
    sort_order: 30,
  },
  {
    code: 'APPROVED',
    label: 'Approved',
    description: 'Quotation has completed the approval workflow.',
    color: 'emerald',
    sort_order: 40,
  },
  {
    code: 'SENT',
    label: 'Sent',
    description: 'Proposal or quotation has been sent to the client.',
    color: 'blue',
    sort_order: 50,
  },
  {
    code: 'ACCEPTED',
    label: 'Accepted',
    description: 'Client accepted the quotation or proposal.',
    color: 'emerald',
    sort_order: 60,
  },
  {
    code: 'REJECTED',
    label: 'Rejected',
    description: 'Quotation was rejected by an approver or client.',
    color: 'red',
    sort_order: 70,
  },
  {
    code: 'EXPIRED',
    label: 'Expired',
    description: 'Quotation validity period has ended.',
    color: 'orange',
    sort_order: 80,
  },
];

const serialize = (item: any) => ({
  ...item,
  status_id: Number(item.status_id),
  tenant_id: Number(item.tenant_id),
});

@Injectable()
export class StatusMasterService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDefaults() {
    await this.prisma.quotationStatusMaster.createMany({
      data: DEFAULT_STATUSES.map((status) => ({
        tenant_id: TENANT_ID,
        ...status,
        is_system: true,
        is_active: true,
      })),
      skipDuplicates: true,
    });
  }

  async findAll(includeInactive = false) {
    await this.ensureDefaults();
    const data = await this.prisma.quotationStatusMaster.findMany({
      where: {
        tenant_id: TENANT_ID,
        ...(includeInactive ? {} : { is_active: true }),
      },
      orderBy: [{ sort_order: 'asc' }, { label: 'asc' }],
    });
    return { data: data.map(serialize), total: data.length };
  }

  async create(dto: CreateStatusMasterDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.quotationStatusMaster.findUnique({
      where: { tenant_id_code: { tenant_id: TENANT_ID, code } },
    });
    if (existing)
      throw new ConflictException(`Quotation status ${code} already exists`);

    const created = await this.prisma.quotationStatusMaster.create({
      data: {
        tenant_id: TENANT_ID,
        code,
        label: dto.label.trim(),
        description: dto.description?.trim() || null,
        color: dto.color || 'gray',
        sort_order: dto.sortOrder ?? 100,
        is_active: dto.isActive ?? true,
        is_system: false,
      },
    });
    return serialize(created);
  }

  async update(id: number, dto: UpdateStatusMasterDto) {
    const existing = await this.prisma.quotationStatusMaster.findFirst({
      where: { status_id: BigInt(id), tenant_id: TENANT_ID },
    });
    if (!existing)
      throw new NotFoundException(`Quotation status ${id} not found`);

    const updated = await this.prisma.quotationStatusMaster.update({
      where: { status_id: BigInt(id) },
      data: {
        label: dto.label?.trim(),
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
        color: dto.color,
        sort_order: dto.sortOrder,
        is_active: dto.isActive,
      },
    });
    return serialize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.quotationStatusMaster.findFirst({
      where: { status_id: BigInt(id), tenant_id: TENANT_ID },
    });
    if (!existing)
      throw new NotFoundException(`Quotation status ${id} not found`);
    if (existing.is_system) {
      throw new BadRequestException(
        'System workflow statuses cannot be deleted. Deactivate the status instead.',
      );
    }

    await this.prisma.quotationStatusMaster.delete({
      where: { status_id: BigInt(id) },
    });
    return { message: `Quotation status ${existing.code} deleted` };
  }
}
