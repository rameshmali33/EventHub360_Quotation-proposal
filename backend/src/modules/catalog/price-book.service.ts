import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePriceBookDto,
  UpdatePriceBookDto,
} from './dto/create-price-book.dto';
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
export class PriceBookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePriceBookDto) {
    const created = await this.prisma.priceBook.create({
      data: {
        tenant_id: 1,
        company_id: 1,
        branch_id: 1,
        name: createDto.name,
        valid_from: createDto.validFrom ? new Date(createDto.validFrom) : null,
        valid_to: createDto.validTo ? new Date(createDto.validTo) : null,
        is_active: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });
    return serializeDbObject(created);
  }

  async findAll(query: CatalogListQueryDto) {
    const search = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};
    const where = {
      ...(query.includeInactive ? {} : { is_active: true }),
      ...search,
    };
    const total = await this.prisma.priceBook.count({ where });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'created_at';
    const order = query.sortOrder === SortOrder.DESC ? 'desc' : 'asc';

    const data = await this.prisma.priceBook.findMany({
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
    const priceBook = await this.prisma.priceBook.findFirst({
      where: { price_book_id: BigInt(id), is_active: true },
    });
    if (!priceBook) {
      throw new NotFoundException(`Price Book with ID ${id} not found`);
    }
    return serializeDbObject(priceBook);
  }

  async update(id: number, updateDto: UpdatePriceBookDto) {
    const existing = await this.prisma.priceBook.findFirst({
      where: { price_book_id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException(`Price Book with ID ${id} not found`);
    }
    const updated = await this.prisma.priceBook.update({
      where: { price_book_id: BigInt(id) },
      data: {
        name: updateDto.name,
        valid_from: updateDto.validFrom
          ? new Date(updateDto.validFrom)
          : undefined,
        valid_to: updateDto.validTo ? new Date(updateDto.validTo) : undefined,
        is_active: updateDto.isActive,
        updated_at: new Date(),
      },
    });
    return serializeDbObject(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.priceBook.findFirst({
      where: { price_book_id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException(`Price Book with ID ${id} not found`);
    }
    await this.prisma.priceBook.update({
      where: { price_book_id: BigInt(id) },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
    return { message: `Price Book ${id} soft deleted` };
  }
}
