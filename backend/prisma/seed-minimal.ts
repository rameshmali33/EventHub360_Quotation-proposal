import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting minimal DB seed cleanup...');

  // Delete in dependency order to avoid foreign key violations
  await prisma.proposalSignature.deleteMany({});
  await prisma.proposalView.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.quoteApprovalComment.deleteMany({});
  await prisma.quoteApprovalHistory.deleteMany({});
  await prisma.quoteApproval.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.quotationLine.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.rateCard.deleteMany({});
  await prisma.priceBook.deleteMany({});
  await prisma.taxRule.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.userAccount.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Cleanup completed. Seeding minimal foundation data...');

  // 1. Seed Tenant (autoincrement, will get ID 1)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Demo Tenant',
      subdomain: 'default',
    },
  });

  // 2. Seed Company (will get ID 1)
  const company = await prisma.company.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'EventHub 360 Inc.',
    },
  });

  // 3. Seed Branch (will get ID 1)
  const branch = await prisma.branch.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      name: 'Mumbai HQ',
    },
  });

  // 4. Seed User Account (will get ID 1)
  await prisma.userAccount.create({
    data: {
      tenant_id: tenant.tenant_id,
      email: 'admin@eventhub360.com',
      password_hash: '$2b$10$Y5n2b.Ua9oR.E1Z.l5E8f.eM1C.JmY7Q5q5', // Dummy bcrypt hash
      first_name: 'Ramesh',
      last_name: 'Admin',
    },
  });

  // 5. Seed Lead (will get ID 1)
  await prisma.lead.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Acme Corporate Event Lead',
    },
  });

  // 6. Seed Tax Rule (will get ID 1)
  await prisma.taxRule.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Standard GST 18%',
      rate_percent: 18.0,
    },
  });

  console.log('Minimal DB seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
