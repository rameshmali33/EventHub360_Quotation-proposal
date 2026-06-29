import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQuotationDto, QuotationStatus } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationListQueryDto, SortOrder } from './dto/quotation-list-query.dto';
import { CreateQuotationLineDto } from './dto/create-quotation-line.dto';
import { UpdateQuotationLineDto } from './dto/update-quotation-line.dto';
import { PricingService, QuotePricingInput, PricingLineInput } from '../pricing/pricing.service';
import { PrismaService } from '../../prisma/prisma.service';

function serializeDbObject(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDbObject(item));
  }
  const serialized = { ...obj };
  for (const key of Object.keys(serialized)) {
    if (typeof serialized[key] === 'bigint') {
      serialized[key] = Number(serialized[key]);
    } else if (serialized[key] && typeof serialized[key].toNumber === 'function') {
      serialized[key] = serialized[key].toNumber();
    } else if (typeof serialized[key] === 'object' && serialized[key] !== null && !(serialized[key] instanceof Date)) {
      serialized[key] = serializeDbObject(serialized[key]);
    }
  }
  return serialized;
}

const DEFAULT_COST_RATIOS: Record<string, number> = {
  VENUE: 0.68,
  FLORAL: 0.62,
  DECORATION: 0.62,
  CATERING: 0.72,
  ENTERTAINMENT: 0.70,
  SERVICE: 0.70,
  PACKAGE: 0.72,
  RATE_CARD: 0.70,
  CUSTOM: 0.70,
};

function getDefaultCostRatio(itemType = '', description = '') {
  const type = itemType.toUpperCase();
  const desc = description.toLowerCase();

  if (DEFAULT_COST_RATIOS[type]) return DEFAULT_COST_RATIOS[type];
  if (desc.includes('venue') || desc.includes('ballroom') || desc.includes('plaza')) return DEFAULT_COST_RATIOS.VENUE;
  if (desc.includes('floral') || desc.includes('decor') || desc.includes('flower')) return DEFAULT_COST_RATIOS.FLORAL;
  if (desc.includes('catering') || desc.includes('buffet') || desc.includes('drink') || desc.includes('food')) return DEFAULT_COST_RATIOS.CATERING;
  if (desc.includes('entertainment') || desc.includes('sound') || desc.includes('music') || desc.includes('band')) return DEFAULT_COST_RATIOS.ENTERTAINMENT;

  return DEFAULT_COST_RATIOS.CUSTOM;
}

const DEFAULT_TAX_PERCENT = 18;

function resolveUnitCost(rate: number, cost: number | null | undefined, itemType = '', description = '') {
  const numericRate = Number(rate) || 0;
  const numericCost = Number(cost) || 0;

  if (numericRate <= 0) return 0;

  // If the caller sends no cost, zero cost, or cost equal to selling rate,
  // infer a vendor cost so margin can be calculated from the quotation category.
  if (numericCost <= 0 || numericCost >= numericRate) {
    return numericRate * getDefaultCostRatio(itemType, description);
  }

  return numericCost;
}

@Injectable()
export class QuotationService {
  private quotations: any[] = [];
  private quotationLines: any[] = [];
  private idCounter = 1;
  private lineIdCounter = 1;

  constructor(
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createDto: CreateQuotationDto) {
    console.log("QTN DB MODE: Creating quotation in PostgreSQL");

    // 1. Validate lead_id exists, fallback to first available or create default if not found
    let lead = await this.prisma.lead.findFirst({
      where: { lead_id: BigInt(createDto.lead_id), is_active: true }
    });
    if (!lead) {
      lead = await this.prisma.lead.findFirst({
        where: { is_active: true }
      });
    }
    if (!lead) {
      let tenant = await this.prisma.tenant.findFirst({ where: { is_active: true } });
      if (!tenant) {
        tenant = await this.prisma.tenant.create({
          data: { 
            name: 'EventHub 360 Tenant',
            subdomain: `default-${Date.now()}`
          }
        });
      }
      lead = await this.prisma.lead.create({
        data: {
          tenant_id: tenant.tenant_id,
          name: 'Default Concierge Lead',
          is_active: true
        }
      });
    }

    // Resolve Company dynamically to avoid foreign key violations
    let company = await this.prisma.company.findFirst({
      where: { tenant_id: lead.tenant_id, is_active: true }
    });
    if (!company) {
      company = await this.prisma.company.findFirst({
        where: { is_active: true }
      });
    }
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          tenant_id: lead.tenant_id,
          name: 'EventHub 360 Company',
          is_active: true
        }
      });
    }

    // Resolve Branch dynamically to avoid foreign key violations
    let branch = await this.prisma.branch.findFirst({
      where: { company_id: company.company_id, is_active: true }
    });
    if (!branch) {
      branch = await this.prisma.branch.findFirst({
        where: { is_active: true }
      });
    }
    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          tenant_id: lead.tenant_id,
          company_id: company.company_id,
          name: 'EventHub 360 Mumbai Branch',
          is_active: true
        }
      });
    }

    // 2. Validate parent_quotation_id exists if provided
    if (createDto.parent_quotation_id) {
      const parentQuote = await this.prisma.quotation.findFirst({
        where: { quotation_id: BigInt(createDto.parent_quotation_id), is_active: true }
      });
      if (!parentQuote) {
        throw new NotFoundException(`Parent quotation with ID ${createDto.parent_quotation_id} not found`);
      }
    }

    // 3. Validate each line if lines are passed
    if (createDto.lines && createDto.lines.length > 0) {
      for (const line of createDto.lines) {
        if (line.tax_rule_id) {
          const taxRule = await this.prisma.taxRule.findFirst({
            where: { tax_rule_id: BigInt(line.tax_rule_id), is_active: true }
          });
          if (!taxRule) {
            throw new NotFoundException(`Tax Rule with ID ${line.tax_rule_id} not found`);
          }
        }
        if (line.item_type === 'PACKAGE') {
          const pkg = await this.prisma.package.findFirst({
            where: { package_id: BigInt(line.ref_id), is_active: true }
          });
          if (!pkg) {
            throw new NotFoundException(`Package with ID ${line.ref_id} not found`);
          }
        } else if (line.item_type === 'RATE_CARD') {
          const rateCard = await this.prisma.rateCard.findFirst({
            where: { rate_card_id: BigInt(line.ref_id), is_active: true }
          });
          if (!rateCard) {
            throw new NotFoundException(`Rate Card with ID ${line.ref_id} not found`);
          }
        }
      }
    }

    const quotation = await this.prisma.quotation.create({
      data: {
        tenant_id: lead.tenant_id,
        company_id: company.company_id,
        branch_id: branch.branch_id,
        lead_id: lead.lead_id,
        version: 1,
        currency: createDto.currency || 'INR',
        subtotal: 0,
        tax_total: 0,
        total: 0,
        cost_total: 0,
        margin: 0,
        status: QuotationStatus.DRAFT,
        expires_at: createDto.expires_at ? new Date(createDto.expires_at) : null,
        parent_quotation_id: createDto.parent_quotation_id ? BigInt(createDto.parent_quotation_id) : null,
        is_active: true,
        created_by: BigInt(1),
        updated_by: BigInt(1),
      }
    });

    if (createDto.lines && createDto.lines.length > 0) {
      for (const line of createDto.lines) {
        await this.prisma.quotationLine.create({
          data: {
            tenant_id: lead.tenant_id,
            company_id: company.company_id,
            branch_id: branch.branch_id,
            quotation_id: quotation.quotation_id,
            item_type: line.item_type,
            ref_id: BigInt(line.ref_id),
            description: line.description,
            qty: line.qty,
            rate: line.rate,
            cost: resolveUnitCost(line.rate, line.cost, line.item_type, line.description),
            tax_rule_id: line.tax_rule_id ? BigInt(line.tax_rule_id) : null,
            amount: line.qty * line.rate,
            is_active: true,
            created_by: BigInt(1),
            updated_by: BigInt(1),
          }
        });
      }
      return await this.calculate(Number(quotation.quotation_id));
    }
    return await this.findOne(Number(quotation.quotation_id));
  }

  async findAll(query: QuotationListQueryDto) {
    const searchTerm = query.search?.trim();
    const searchFilters: any[] = [];

    if (searchTerm) {
      const quoteNumberMatch = searchTerm.match(/\d+/);
      if (quoteNumberMatch) {
        searchFilters.push({ quotation_id: BigInt(quoteNumberMatch[0]) });
      }

      searchFilters.push({
        lead: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      });
    }

    const search = searchFilters.length > 0 ? { OR: searchFilters } : {};
    const statusFilter = query.status ? { status: query.status } : {};
    const where = { is_active: true, ...search, ...statusFilter };
    const total = await this.prisma.quotation.count({ where });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const allowedSortFields = ['quotation_id', 'created_at', 'total', 'status'];
    const sortField = (allowedSortFields.includes(query.sortBy || '') ? query.sortBy : 'created_at') as string;
    const normalizedSortOrder = String(query.sortOrder || SortOrder.DESC).toLowerCase();
    const order = normalizedSortOrder === SortOrder.ASC ? 'asc' : 'desc';

    const data = await this.prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: order },
      include: {
        lead: {
          select: { lead_id: true, name: true }
        },
        lines: {
          where: { is_active: true }
        }
      }
    });

    return {
      data: serializeDbObject(data),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { quotation_id: BigInt(id), is_active: true },
      include: {
        lead: {
          select: { lead_id: true, name: true }
        },
        lines: {
          where: { is_active: true },
          include: {
            tax_rule: true
          }
        }
      }
    });
    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    return serializeDbObject(quotation);
  }

  async update(id: number, updateDto: UpdateQuotationDto) {
    const quotation = await this.findOne(id);
    if (quotation.status === QuotationStatus.PENDING_APPROVAL) {
      const keys = Object.keys(updateDto).filter(k => updateDto[k] !== undefined);
      const isOnlyStatusUpdate = keys.length === 1 && keys[0] === 'status';
      if (!isOnlyStatusUpdate && keys.length > 0) {
        throw new BadRequestException('Quotation is locked pending approval');
      }
    }

    const dataToUpdate: any = {};
    if (updateDto.status) dataToUpdate.status = updateDto.status;
    if (updateDto.currency) dataToUpdate.currency = updateDto.currency;
    if (updateDto.expires_at) dataToUpdate.expires_at = new Date(updateDto.expires_at);

    const hasMetadataChanges = updateDto.currency !== undefined || updateDto.expires_at !== undefined;
    if (hasMetadataChanges && !updateDto.status && quotation.status !== QuotationStatus.DRAFT) {
      dataToUpdate.status = QuotationStatus.DRAFT;
    }

    await this.prisma.quotation.update({
      where: { quotation_id: BigInt(id) },
      data: dataToUpdate,
    });
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.quotation.update({
      where: { quotation_id: BigInt(id) },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
    return { message: `Quotation ${id} soft deleted` };
  }

  async addLine(quotationId: number, lineDto: CreateQuotationLineDto) {
    const quotation = await this.findOne(quotationId);
    if (quotation.status === QuotationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Quotation is locked pending approval');
    }

    if (quotation.status !== QuotationStatus.DRAFT) {
      await this.prisma.quotation.update({
        where: { quotation_id: BigInt(quotationId) },
        data: { status: QuotationStatus.DRAFT }
      });
    }

    // Validate tax rule if provided
    if (lineDto.tax_rule_id) {
      const taxRule = await this.prisma.taxRule.findFirst({
        where: { tax_rule_id: BigInt(lineDto.tax_rule_id), is_active: true }
      });
      if (!taxRule) {
        throw new NotFoundException(`Tax Rule with ID ${lineDto.tax_rule_id} not found`);
      }
    }

    // Validate item reference
    if (lineDto.item_type === 'PACKAGE') {
      const pkg = await this.prisma.package.findFirst({
        where: { package_id: BigInt(lineDto.ref_id), is_active: true }
      });
      if (!pkg) {
        throw new NotFoundException(`Package with ID ${lineDto.ref_id} not found`);
      }
    } else if (lineDto.item_type === 'RATE_CARD') {
      const rateCard = await this.prisma.rateCard.findFirst({
        where: { rate_card_id: BigInt(lineDto.ref_id), is_active: true }
      });
      if (!rateCard) {
        throw new NotFoundException(`Rate Card with ID ${lineDto.ref_id} not found`);
      }
    }

    const parentQtn = await this.prisma.quotation.findFirst({
      where: { quotation_id: BigInt(quotationId) }
    });
    if (!parentQtn) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    const created = await this.prisma.quotationLine.create({
      data: {
        tenant_id: parentQtn.tenant_id,
        company_id: parentQtn.company_id,
        branch_id: parentQtn.branch_id,
        quotation_id: BigInt(quotationId),
        item_type: lineDto.item_type,
        ref_id: BigInt(lineDto.ref_id),
        description: lineDto.description,
        qty: lineDto.qty,
        rate: lineDto.rate,
        cost: resolveUnitCost(lineDto.rate, lineDto.cost, lineDto.item_type, lineDto.description),
        tax_rule_id: lineDto.tax_rule_id ? BigInt(lineDto.tax_rule_id) : null,
        amount: lineDto.qty * lineDto.rate,
        is_active: true,
      }
    });

    await this.calculate(quotationId);
    return serializeDbObject(created);
  }

  async updateLine(quotationId: number, lineId: number, updateLineDto: UpdateQuotationLineDto) {
    const quotation = await this.findOne(quotationId);
    if (quotation.status === QuotationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Quotation is locked pending approval');
    }

    if (quotation.status !== QuotationStatus.DRAFT) {
      await this.prisma.quotation.update({
        where: { quotation_id: BigInt(quotationId) },
        data: { status: QuotationStatus.DRAFT }
      });
    }

    const line = await this.prisma.quotationLine.findFirst({
      where: { line_id: BigInt(lineId), quotation_id: BigInt(quotationId), is_active: true }
    });
    if (!line) {
      throw new NotFoundException(`Quotation Line ${lineId} not found`);
    }

    // Validate tax rule if provided
    if (updateLineDto.tax_rule_id !== undefined) {
      if (updateLineDto.tax_rule_id !== null) {
        const taxRule = await this.prisma.taxRule.findFirst({
          where: { tax_rule_id: BigInt(updateLineDto.tax_rule_id), is_active: true }
        });
        if (!taxRule) {
          throw new NotFoundException(`Tax Rule with ID ${updateLineDto.tax_rule_id} not found`);
        }
      }
    }

    // Validate item reference if either item_type or ref_id is updated
    const currentItemType = updateLineDto.item_type !== undefined ? updateLineDto.item_type : line.item_type;
    const currentRefId = updateLineDto.ref_id !== undefined ? updateLineDto.ref_id : line.ref_id;

    if (updateLineDto.item_type !== undefined || updateLineDto.ref_id !== undefined) {
      if (currentItemType === 'PACKAGE') {
        const pkg = await this.prisma.package.findFirst({
          where: { package_id: BigInt(currentRefId), is_active: true }
        });
        if (!pkg) {
          throw new NotFoundException(`Package with ID ${currentRefId} not found`);
        }
      } else if (currentItemType === 'RATE_CARD') {
        const rateCard = await this.prisma.rateCard.findFirst({
          where: { rate_card_id: BigInt(currentRefId), is_active: true }
        });
        if (!rateCard) {
          throw new NotFoundException(`Rate Card with ID ${currentRefId} not found`);
        }
      }
    }

    const dataToUpdate: any = {};
    if (updateLineDto.qty !== undefined) dataToUpdate.qty = updateLineDto.qty;
    if (updateLineDto.rate !== undefined) dataToUpdate.rate = updateLineDto.rate;
    if (updateLineDto.description !== undefined) dataToUpdate.description = updateLineDto.description;
    if (updateLineDto.tax_rule_id !== undefined) dataToUpdate.tax_rule_id = updateLineDto.tax_rule_id ? BigInt(updateLineDto.tax_rule_id) : null;
    if (updateLineDto.item_type !== undefined) dataToUpdate.item_type = updateLineDto.item_type;
    if (updateLineDto.ref_id !== undefined) dataToUpdate.ref_id = BigInt(updateLineDto.ref_id);

    const currentQty = updateLineDto.qty !== undefined ? updateLineDto.qty : Number(line.qty);
    const currentRate = updateLineDto.rate !== undefined ? Number(updateLineDto.rate) : Number(line.rate);
    const currentCost = updateLineDto.cost !== undefined ? Number(updateLineDto.cost) : Number(line.cost);
    const currentDescription = updateLineDto.description !== undefined ? updateLineDto.description : line.description;
    dataToUpdate.cost = resolveUnitCost(currentRate, currentCost, currentItemType, currentDescription);
    dataToUpdate.amount = currentQty * currentRate;

    const updated = await this.prisma.quotationLine.update({
      where: { line_id: BigInt(lineId) },
      data: dataToUpdate,
    });

    await this.calculate(quotationId);
    return serializeDbObject(updated);
  }

  async removeLine(quotationId: number, lineId: number) {
    const quotation = await this.findOne(quotationId);
    if (quotation.status === QuotationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Quotation is locked pending approval');
    }

    if (quotation.status !== QuotationStatus.DRAFT) {
      await this.prisma.quotation.update({
        where: { quotation_id: BigInt(quotationId) },
        data: { status: QuotationStatus.DRAFT }
      });
    }

    const line = await this.prisma.quotationLine.findFirst({
      where: { line_id: BigInt(lineId), quotation_id: BigInt(quotationId), is_active: true }
    });
    if (!line) {
      throw new NotFoundException(`Quotation Line ${lineId} not found`);
    }

    await this.prisma.quotationLine.update({
      where: { line_id: BigInt(lineId) },
      data: { is_active: false }
    });

    await this.calculate(quotationId);
    return { message: `Quotation Line ${lineId} soft deleted` };
  }

  async calculate(quotationId: number) {
    const quote = await this.findOne(quotationId);
    
    const pricingLines: PricingLineInput[] = quote.lines.map(line => ({
      qty: line.qty,
      rate: line.rate,
      cost: resolveUnitCost(Number(line.rate), Number(line.cost), line.item_type, line.description),
      taxPercent: line.tax_rule ? Number(line.tax_rule.rate_percent) : DEFAULT_TAX_PERCENT,
      lineDiscountPercent: 0,
    }));

    const pricingInput: QuotePricingInput = {
      lines: pricingLines,
      globalDiscountAmount: 0,
      serviceChargeAmount: 0,
    };

    const result = this.pricingService.calculateQuotePricing(pricingInput);

    await this.prisma.quotation.update({
      where: { quotation_id: BigInt(quotationId) },
      data: {
        subtotal: result.subtotal,
        tax_total: result.totalTax,
        total: result.grandTotal,
        cost_total: result.totalCost,
        margin: result.margin,
        updated_at: new Date(),
      }
    });

    return this.findOne(quotationId);
  }
}

