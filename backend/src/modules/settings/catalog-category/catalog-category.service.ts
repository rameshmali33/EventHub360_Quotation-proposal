import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateCatalogCategoryDto,
  UpdateCatalogCategoryDto,
} from './catalog-category.dto';

const TENANT_ID = 1n;
const DEFAULT_CATEGORIES = [
  {
    code: 'VENUES',
    label: 'Venues',
    description: 'Venue and location rate cards.',
    sort_order: 10,
  },
  {
    code: 'PACKAGES',
    label: 'Packages',
    description: 'Bundled event packages.',
    sort_order: 20,
  },
  {
    code: 'FLORAL_DECORATION',
    label: 'Floral & Decoration',
    description: 'Floral, decor, styling, and stage items.',
    sort_order: 30,
  },
  {
    code: 'VENDORS',
    label: 'Vendors',
    description: 'Third-party vendor and partner services.',
    sort_order: 40,
  },
  {
    code: 'SERVICES',
    label: 'Services',
    description: 'General event services and add-ons.',
    sort_order: 50,
  },
];

const serialize = (item: any) => ({
  ...item,
  category_id: Number(item.category_id),
  tenant_id: Number(item.tenant_id),
});

@Injectable()
export class CatalogCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDefaults() {
    await this.prisma.catalogCategoryMaster.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        tenant_id: TENANT_ID,
        ...category,
        is_system: true,
        is_active: true,
      })),
      skipDuplicates: true,
    });
  }

  async findAll(includeInactive = false) {
    await this.ensureDefaults();
    const data = await this.prisma.catalogCategoryMaster.findMany({
      where: {
        tenant_id: TENANT_ID,
        ...(includeInactive ? {} : { is_active: true }),
      },
      orderBy: [{ sort_order: 'asc' }, { label: 'asc' }],
    });
    return { data: data.map(serialize), total: data.length };
  }

  async create(dto: CreateCatalogCategoryDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.catalogCategoryMaster.findUnique({
      where: { tenant_id_code: { tenant_id: TENANT_ID, code } },
    });
    if (existing)
      throw new ConflictException(`Catalog category ${code} already exists`);

    const created = await this.prisma.catalogCategoryMaster.create({
      data: {
        tenant_id: TENANT_ID,
        code,
        label: dto.label.trim(),
        description: dto.description?.trim() || null,
        sort_order: dto.sortOrder ?? 100,
        is_active: dto.isActive ?? true,
        is_system: false,
      },
    });
    return serialize(created);
  }

  async update(id: number, dto: UpdateCatalogCategoryDto) {
    const existing = await this.prisma.catalogCategoryMaster.findFirst({
      where: { category_id: BigInt(id), tenant_id: TENANT_ID },
    });
    if (!existing)
      throw new NotFoundException(`Catalog category ${id} not found`);

    const updated = await this.prisma.catalogCategoryMaster.update({
      where: { category_id: BigInt(id) },
      data: {
        label: dto.label?.trim(),
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
        sort_order: dto.sortOrder,
        is_active: dto.isActive,
      },
    });
    return serialize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.catalogCategoryMaster.findFirst({
      where: { category_id: BigInt(id), tenant_id: TENANT_ID },
    });
    if (!existing)
      throw new NotFoundException(`Catalog category ${id} not found`);
    if (existing.is_system) {
      throw new BadRequestException(
        'System catalog categories cannot be deleted. Deactivate the category instead.',
      );
    }

    const rateCardCount = await this.prisma.rateCard.count({
      where: { item_type: existing.code, is_active: true },
    });
    if (rateCardCount > 0) {
      throw new BadRequestException(
        `Cannot delete ${existing.label} while ${rateCardCount} active rate card(s) use it. Deactivate it instead.`,
      );
    }

    await this.prisma.catalogCategoryMaster.delete({
      where: { category_id: BigInt(id) },
    });
    return { message: `Catalog category ${existing.code} deleted` };
  }
}
