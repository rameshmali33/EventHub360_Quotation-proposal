const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});

async function main() {
  console.log('Starting DB seed...');

  // 1. Seed Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Tenant',
      subdomain: 'default',
    },
  });

  // 2. Seed Company
  const company = await prisma.company.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Main Company',
    },
  });

  // 3. Seed Branch
  const branch = await prisma.branch.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      name: 'HQ Branch',
    },
  });

  // 4. Seed Tax Rule
  const taxRule = await prisma.taxRule.create({
    data: {
      tenant_id: tenant.tenant_id,
      name: 'Standard GST 18%',
      rate_percent: 18.0,
    },
  });

  // 5. Seed Price Book
  const priceBook = await prisma.priceBook.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Standard 2026 Price Book',
      valid_from: new Date('2026-01-01T00:00:00Z'),
      valid_to: new Date('2026-12-31T23:59:59Z'),
    },
  });

  // 6. Seed Rate Cards
  await prisma.rateCard.createMany({
    data: [
      {
        tenant_id: tenant.tenant_id,
        company_id: company.company_id,
        branch_id: branch.branch_id,
        price_book_id: priceBook.price_book_id,
        item_name: 'Photographer - Full Day',
        uom: 'Day',
        rate: 50000.0,
        cost: 35000.0,
      },
      {
        tenant_id: tenant.tenant_id,
        company_id: company.company_id,
        branch_id: branch.branch_id,
        price_book_id: priceBook.price_book_id,
        item_name: 'Stage Decoration - Premium',
        uom: 'Setup',
        rate: 150000.0,
        cost: 100000.0,
      },
    ],
  });

  // 7. Seed Package
  await prisma.package.create({
    data: {
      tenant_id: tenant.tenant_id,
      company_id: company.company_id,
      branch_id: branch.branch_id,
      name: 'Premium Wedding Package',
      base_price: 500000.0,
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
