import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default user
  const passwordHash = await bcrypt.hash('password', 10);
  const encryptionSalt = crypto.randomBytes(16).toString('hex');
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash,
      name: 'Default User',
      encryptionSalt,
    },
  });

  console.log(`User created: ${user.email}`);

  // Create categories
  const categoriesData = [
    { name: 'Food', type: 'EXPENSE' as const },
    { name: 'Transport', type: 'EXPENSE' as const },
    { name: 'Salary', type: 'INCOME' as const },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        type: cat.type,
      },
    });
    categories[cat.name] = category.id;
    console.log(`Category created/exists: ${cat.name}`);
  }

  // Create classification rules
  const rulesData = [
    {
      name: 'Zomato -> Food',
      categoryId: categories['Food'],
      conditions: {
        keyword: 'Zomato',
      },
    },
    {
      name: 'Swiggy -> Food',
      categoryId: categories['Food'],
      conditions: {
        keyword: 'Swiggy',
      },
    },
    {
      name: 'Uber -> Transport',
      categoryId: categories['Transport'],
      conditions: {
        keyword: 'Uber',
      },
    },
  ];

  for (const rule of rulesData) {
    await prisma.classificationRule.create({
      data: {
        userId: user.id,
        name: rule.name,
        categoryId: rule.categoryId,
        conditions: rule.conditions,
      },
    });
    console.log(`Rule created: ${rule.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
