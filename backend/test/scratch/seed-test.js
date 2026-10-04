const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestTransactions() {
  console.log('Seeding fake transactions for tool calling test...');
  
  // Need a statement
  const user = await prisma.user.findFirst();
  const statement = await prisma.statementUpload.create({
    data: {
      userId: user.id,
      fileName: 'test.pdf',
      filePath: '/tmp/test.pdf',
      parseStatus: 'COMPLETED'
    }
  });

  // Need categories
  const food = await prisma.category.findFirst({ where: { name: 'Food & Dining' } });
  const shopping = await prisma.category.findFirst({ where: { name: 'Shopping' } });
  
  await prisma.transaction.createMany({
    data: [
      {
        statementId: statement.id,
        txnDate: new Date('2026-06-01T12:00:00Z'),
        description: 'RAZ*SWIGGYBengaluru',
        maskedDescription: 'RAZ*SWIGGYBengaluru',
        normalizedDescription: 'Swiggy',
        amountSigned: -450.00,
        direction: 'DEBIT',
        categoryId: food.id,
      },
      {
        statementId: statement.id,
        txnDate: new Date('2026-06-02T19:00:00Z'),
        description: 'WWW ZOMATO COM',
        maskedDescription: 'WWW ZOMATO COM',
        normalizedDescription: 'Zomato',
        amountSigned: -800.00,
        direction: 'DEBIT',
        categoryId: food.id,
      },
      {
        statementId: statement.id,
        txnDate: new Date('2026-06-05T14:00:00Z'),
        description: 'APPLE STORE INDIA',
        maskedDescription: 'APPLE STORE INDIA',
        normalizedDescription: 'Apple Store',
        amountSigned: -145000.00, // Massive anomaly!
        direction: 'DEBIT',
        categoryId: shopping.id,
      }
    ]
  });

  console.log('Done!');
}

seedTestTransactions().finally(() => prisma.$disconnect());
