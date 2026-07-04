import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateRateCardDto,
  UpdateRateCardDto,
} from './dto/create-rate-card.dto';
import { CatalogListQueryDto, SortOrder } from './dto/catalog-list-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

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

@Injectable()
export class RateCardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(priceBookId: number, createDto: CreateRateCardDto) {
    // Validate priceBookId foreign key
    const priceBook = await this.prisma.priceBook.findFirst({
      where: { price_book_id: BigInt(priceBookId), is_active: true },
    });
    if (!priceBook) {
      throw new NotFoundException(
        `Price Book with ID ${priceBookId} not found`,
      );
    }

    const created = await this.prisma.rateCard.create({
      data: {
        tenant_id: 1,
        company_id: 1,
        branch_id: 1,
        price_book_id: BigInt(priceBookId),
        item_name: createDto.itemName,
        item_type: createDto.itemType,
        image_url: createDto.imageUrl || null,
        uom: createDto.uom,
        rate: createDto.rate,
        cost: createDto.cost,
        is_active: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });
    return serializeDbObject(created);
  }

  async findAllByPriceBook(priceBookId: number, query: CatalogListQueryDto) {
    // Validate priceBookId
    const priceBook = await this.prisma.priceBook.findFirst({
      where: { price_book_id: BigInt(priceBookId), is_active: true },
    });
    if (!priceBook) {
      throw new NotFoundException(
        `Price Book with ID ${priceBookId} not found`,
      );
    }

    const search = query.search
      ? { item_name: { contains: query.search, mode: 'insensitive' as const } }
      : {};
    const where = {
      price_book_id: BigInt(priceBookId),
      is_active: true,
      ...search,
    };
    const total = await this.prisma.rateCard.count({ where });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'created_at';
    const order = query.sortOrder === SortOrder.DESC ? 'desc' : 'asc';

    const data = await this.prisma.rateCard.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: order },
    });

    return {
      data: serializeDbObject(data),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const rateCard = await this.prisma.rateCard.findFirst({
      where: { rate_card_id: BigInt(id), is_active: true },
    });
    if (!rateCard) {
      throw new NotFoundException(`Rate Card with ID ${id} not found`);
    }
    return serializeDbObject(rateCard);
  }

  async update(id: number, updateDto: UpdateRateCardDto) {
    await this.findOne(id);
    const updated = await this.prisma.rateCard.update({
      where: { rate_card_id: BigInt(id) },
      data: {
        item_name: updateDto.itemName,
        item_type: updateDto.itemType,
        image_url: updateDto.imageUrl,
        uom: updateDto.uom,
        rate: updateDto.rate,
        cost: updateDto.cost,
        is_active: updateDto.isActive,
        updated_at: new Date(),
      },
    });
    return serializeDbObject(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.rateCard.update({
      where: { rate_card_id: BigInt(id) },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
    return { message: `Rate Card ${id} soft deleted` };
  }
}
