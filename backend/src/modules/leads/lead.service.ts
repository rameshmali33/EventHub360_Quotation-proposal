import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function serializeLead(lead: { lead_id: bigint; name: string }) {
  return {
    lead_id: Number(lead.lead_id),
    name: lead.name,
  };
}

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const trimmedName = name.trim();
    const existing = await this.prisma.lead.findFirst({
      where: {
        is_active: true,
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
      select: {
        lead_id: true,
        name: true,
      },
    });

    if (existing) {
      return serializeLead(existing);
    }

    let tenant = await this.prisma.tenant.findFirst({
      where: { is_active: true },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'EventHub360 Demo',
          subdomain: `eventhub360-${Date.now()}`,
          is_active: true,
        },
      });
    }

    const created = await this.prisma.lead.create({
      data: {
        tenant_id: tenant.tenant_id,
        name: trimmedName,
        is_active: true,
      },
      select: {
        lead_id: true,
        name: true,
      },
    });

    return serializeLead(created);
  }

  async search(search = '') {
    const trimmedSearch = search.trim();

    const leads = await this.prisma.lead.findMany({
      where: {
        is_active: true,
        ...(trimmedSearch
          ? {
              name: {
                contains: trimmedSearch,
                mode: 'insensitive' as const,
              },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 8,
      select: {
        lead_id: true,
        name: true,
      },
    });

    return leads.map(serializeLead);
  }
}
