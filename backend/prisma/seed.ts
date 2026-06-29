import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting DB seed cleanup...');

  // Delete in dependency order
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

  console.log('Cleanup completed. Seeding new data...');

  // 1. Seed Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Demo Tenant',
      subdomain: 'default',
    },
  });

  // 2. Seed Company
  const company = await prisma.company.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'EventHub 360 Inc.',
    },
  });

  // 3. Seed Branch
  const branch = await prisma.branch.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      name: 'Mumbai HQ',
    },
  });

  // 4. Seed User Account
  const user = await prisma.userAccount.create({
    data: {
      tenant_id: tenant.tenant_id,
      email: 'admin@eventhub360.com',
      password_hash: '$2b$10$Y5n2b.Ua9oR.E1Z.l5E8f.eM1C.JmY7Q5q5.d3J5Lz6K1N0Y1Q5q5', // Dummy bcrypt hash
      first_name: 'Ramesh',
      last_name: 'Admin',
    },
  });

  // 5. Seed Lead
  const lead = await prisma.lead.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Acme Corporate Event Lead',
    },
  });

  // 6. Seed Tax Rule
  const taxRule = await prisma.taxRule.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Standard GST 18%',
      rate_percent: 18.0,
    },
  });

  // 7. Seed Price Books
  const pb1 = await prisma.priceBook.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Standard 2026 Price Book',
      valid_from: new Date('2026-01-01T00:00:00Z'),
      valid_to: new Date('2026-12-31T23:59:59Z'),
    },
  });

  const pb2 = await prisma.priceBook.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Premium Corporate Price Book',
      valid_from: new Date('2026-01-01T00:00:00Z'),
      valid_to: new Date('2026-12-31T23:59:59Z'),
    },
  });

  // 8. Seed Rate Cards
  const rc1 = await prisma.rateCard.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      price_book_id: pb1.price_book_id,
      item_name: 'Photographer - Full Day',
      uom: 'Day',
      rate: 50000.0,
      cost: 35000.0,
    },
  });

  const rc2 = await prisma.rateCard.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      price_book_id: pb1.price_book_id,
      item_name: 'Stage Decoration - Premium',
      uom: 'Setup',
      rate: 150000.0,
      cost: 100000.0,
    },
  });

  const rc3 = await prisma.rateCard.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      price_book_id: pb2.price_book_id,
      item_name: 'Luxury Stage Mapping',
      uom: 'Event',
      rate: 250000.0,
      cost: 180000.0,
    },
  });

  const rc4 = await prisma.rateCard.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      price_book_id: pb2.price_book_id,
      item_name: 'Premium Drone Videography',
      uom: 'Day',
      rate: 80000.0,
      cost: 55000.0,
    },
  });

  // 9. Seed Packages
  const pkg1 = await prisma.package.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Standard Wedding Package',
      base_price: 300000.0,
    },
  });

  const pkg2 = await prisma.package.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Premium Wedding Package',
      base_price: 500000.0,
    },
  });

  // 10. Seed Quotation
  const quotation = await prisma.quotation.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      lead_id: lead.lead_id,
      version: 1,
      currency: 'INR',
      subtotal: 200000.0,
      tax_total: 36000.0,
      total: 236000.0,
      cost_total: 135000.0,
      margin: 65000.0,
      status: 'APPROVED',
      expires_at: new Date('2026-08-31T23:59:59Z'),
    },
  });

  // 11. Seed Quotation Lines
  await prisma.quotationLine.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      quotation_id: quotation.quotation_id,
      item_type: 'RateCard',
      ref_id: rc1.rate_card_id,
      description: 'Photography services for main day',
      qty: 1,
      rate: rc1.rate,
      cost: rc1.cost,
      tax_rule_id: taxRule.tax_rule_id,
      amount: rc1.rate,
    },
  });

  await prisma.quotationLine.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      quotation_id: quotation.quotation_id,
      item_type: 'RateCard',
      ref_id: rc2.rate_card_id,
      description: 'Premium floral stage design',
      qty: 1,
      rate: rc2.rate,
      cost: rc2.cost,
      tax_rule_id: taxRule.tax_rule_id,
      amount: rc2.rate,
    },
  });

  // 12. Seed Quote Approval
  const quoteApproval = await prisma.quoteApproval.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      quotation_id: quotation.quotation_id,
      approver_id: user.user_id,
      status: 'APPROVED',
      decided_at: new Date(),
    },
  });

  // 13. Seed Proposal
  const proposal = await prisma.proposal.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      quotation_id: quotation.quotation_id,
      public_hash: 'demo_proposal_public_hash_2026',
      status: 'SENT',
    },
  });

  // 14. Seed Proposal View
  await prisma.proposalView.create({
    data: {
      proposal_id: proposal.proposal_id,
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  console.log('DB seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
