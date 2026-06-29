import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageDto, UpdatePackageDto } from './dto/create-package.dto';
import { CatalogListQueryDto, SortOrder } from './dto/catalog-list-query.dto';
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

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePackageDto) {
    const created = await this.prisma.package.create({
      data: {
        tenant_id: 1,
        company_id: 1,
        branch_id: 1,
        name: createDto.packageName,
        base_price: createDto.basePrice,
        is_active: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });
    return serializeDbObject(created);
  }

  async findAll(query: CatalogListQueryDto) {
    const search = query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {};
    const where = { is_active: true, ...search };
    const total = await this.prisma.package.count({ where });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'created_at';
    const order = query.sortOrder === SortOrder.DESC ? 'desc' : 'asc';

    const data = await this.prisma.package.findMany({
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
    const pkg = await this.prisma.package.findFirst({
      where: { package_id: BigInt(id), is_active: true },
    });
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return serializeDbObject(pkg);
  }

  async update(id: number, updateDto: UpdatePackageDto) {
    await this.findOne(id);
    const updated = await this.prisma.package.update({
      where: { package_id: BigInt(id) },
      data: {
        name: updateDto.packageName,
        base_price: updateDto.basePrice,
        is_active: updateDto.isActive,
        updated_at: new Date(),
      },
    });
    return serializeDbObject(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.package.update({
      where: { package_id: BigInt(id) },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
    return { message: `Package ${id} soft deleted` };
  }
}

