import { PrismaClient, CategoryType, RuleSource, Direction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default categories, system rules, and demo user...');

  // 1. Create or update default user
  const passwordHash = await bcrypt.hash('password123', 10);
  const encryptionSalt = crypto.randomBytes(16).toString('hex');

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash,
      name: 'Default User',
      encryptionSalt,
      defaultCurrency: 'INR',
    },
  });

  console.log(`✓ User ready: ${user.email}`);

  // 2. Define standard financial categories with colors & icons
  const categoriesData: Array<{
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
  }> = [
    { name: 'Food & Dining', type: 'EXPENSE', color: '#EF4444', icon: 'Utensils' },
    { name: 'Groceries & Essentials', type: 'EXPENSE', color: '#10B981', icon: 'ShoppingCart' },
    { name: 'Shopping', type: 'EXPENSE', color: '#F97316', icon: 'ShoppingBag' },
    { name: 'Transport', type: 'EXPENSE', color: '#3B82F6', icon: 'Car' },
    { name: 'Utilities & Bills', type: 'EXPENSE', color: '#EAB308', icon: 'Zap' },
    { name: 'Entertainment', type: 'EXPENSE', color: '#A855F7', icon: 'Film' },
    { name: 'Health & Wellness', type: 'EXPENSE', color: '#EC4899', icon: 'HeartPulse' },
    { name: 'Salary', type: 'INCOME', color: '#22C55E', icon: 'Banknote' },
    { name: 'Investments', type: 'NEUTRAL', color: '#6366F1', icon: 'TrendingUp' },
    { name: 'Transfers', type: 'NEUTRAL', color: '#64748B', icon: 'ArrowLeftRight' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      },
      create: {
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      },
    });
    categories[cat.name] = category.id;
  }
  console.log(`✓ Created/verified ${Object.keys(categories).length} standard categories`);

  // 3. Define 40+ high-accuracy default system rules
  const systemRulesData: Array<{
    name: string;
    categoryKey: string;
    conditions: {
      descriptionContains?: string;
      normalizedMerchantContains?: string;
      direction?: Direction;
      amountGreaterThan?: number;
      amountLessThan?: number;
    };
    tags: string[];
    priority: number;
  }> = [
    // --- Food & Dining ---
    {
      name: 'Swiggy Food',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Swiggy', direction: 'DEBIT' },
      tags: ['food', 'delivery'],
      priority: 10,
    },
    {
      name: 'Zomato Food',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Zomato', direction: 'DEBIT' },
      tags: ['food', 'delivery'],
      priority: 10,
    },
    {
      name: 'Starbucks Coffee',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Starbucks', direction: 'DEBIT' },
      tags: ['food', 'cafe'],
      priority: 10,
    },
    {
      name: 'Blue Tokai Cafe',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Blue Tokai', direction: 'DEBIT' },
      tags: ['food', 'cafe'],
      priority: 10,
    },
    {
      name: 'McDonalds / Burger Fast Food',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'McDonald', direction: 'DEBIT' },
      tags: ['food', 'fastfood'],
      priority: 10,
    },
    {
      name: 'Dominos Pizza',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Dominos', direction: 'DEBIT' },
      tags: ['food', 'dining'],
      priority: 10,
    },
    {
      name: 'Chai Point',
      categoryKey: 'Food & Dining',
      conditions: { descriptionContains: 'Chai Point', direction: 'DEBIT' },
      tags: ['food', 'cafe'],
      priority: 10,
    },

    // --- Groceries & Quick Commerce ---
    {
      name: 'Blinkit Groceries',
      categoryKey: 'Groceries & Essentials',
      conditions: { descriptionContains: 'Blinkit', direction: 'DEBIT' },
      tags: ['groceries', 'quick-commerce'],
      priority: 15,
    },
    {
      name: 'Zepto Groceries',
      categoryKey: 'Groceries & Essentials',
      conditions: { descriptionContains: 'Zepto', direction: 'DEBIT' },
      tags: ['groceries', 'quick-commerce'],
      priority: 15,
    },
    {
      name: 'Instamart Groceries',
      categoryKey: 'Groceries & Essentials',
      conditions: { descriptionContains: 'Instamart', direction: 'DEBIT' },
      tags: ['groceries', 'quick-commerce'],
      priority: 15,
    },
    {
      name: 'BigBasket Essentials',
      categoryKey: 'Groceries & Essentials',
      conditions: { descriptionContains: 'BigBasket', direction: 'DEBIT' },
      tags: ['groceries', 'online'],
      priority: 10,
    },
    {
      name: 'Nature Basket / Supermarket',
      categoryKey: 'Groceries & Essentials',
      conditions: { descriptionContains: 'Nature Basket', direction: 'DEBIT' },
      tags: ['groceries', 'supermarket'],
      priority: 10,
    },

    // --- Shopping & Retail ---
    {
      name: 'Amazon Shopping',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Amazon', direction: 'DEBIT' },
      tags: ['shopping', 'ecommerce'],
      priority: 10,
    },
    {
      name: 'Flipkart Shopping',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Flipkart', direction: 'DEBIT' },
      tags: ['shopping', 'ecommerce'],
      priority: 10,
    },
    {
      name: 'Myntra Fashion',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Myntra', direction: 'DEBIT' },
      tags: ['shopping', 'fashion'],
      priority: 10,
    },
    {
      name: 'Nykaa Beauty',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Nykaa', direction: 'DEBIT' },
      tags: ['shopping', 'beauty'],
      priority: 10,
    },
    {
      name: 'Ajio Clothing',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Ajio', direction: 'DEBIT' },
      tags: ['shopping', 'fashion'],
      priority: 10,
    },
    {
      name: 'Zara Retail',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Zara', direction: 'DEBIT' },
      tags: ['shopping', 'apparel'],
      priority: 10,
    },
    {
      name: 'Decathlon Sports',
      categoryKey: 'Shopping',
      conditions: { descriptionContains: 'Decathlon', direction: 'DEBIT' },
      tags: ['shopping', 'sports'],
      priority: 10,
    },

    // --- Transport & Commute ---
    {
      name: 'Uber Cabs',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Uber', direction: 'DEBIT' },
      tags: ['transport', 'cab'],
      priority: 10,
    },
    {
      name: 'Ola Cabs',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Ola', direction: 'DEBIT' },
      tags: ['transport', 'cab'],
      priority: 10,
    },
    {
      name: 'Rapido Bike Taxi',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Rapido', direction: 'DEBIT' },
      tags: ['transport', 'taxi'],
      priority: 10,
    },
    {
      name: 'IRCTC Railway Booking',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Irctc', direction: 'DEBIT' },
      tags: ['transport', 'railway'],
      priority: 10,
    },
    {
      name: 'MakeMyTrip Travel',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'MakeMyTrip', direction: 'DEBIT' },
      tags: ['transport', 'travel'],
      priority: 10,
    },
    {
      name: 'IndiGo Flights',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Indigo', direction: 'DEBIT' },
      tags: ['transport', 'flights'],
      priority: 10,
    },
    {
      name: 'Fastag Toll Tollway',
      categoryKey: 'Transport',
      conditions: { descriptionContains: 'Fastag', direction: 'DEBIT' },
      tags: ['transport', 'toll'],
      priority: 10,
    },

    // --- Utilities & Bills ---
    {
      name: 'Airtel Broadband & Mobile',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'Airtel', direction: 'DEBIT' },
      tags: ['utilities', 'telecom'],
      priority: 10,
    },
    {
      name: 'Jio Telecom & Fiber',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'Jio', direction: 'DEBIT' },
      tags: ['utilities', 'telecom'],
      priority: 10,
    },
    {
      name: 'Vodafone Idea Bill',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'Vi', direction: 'DEBIT' },
      tags: ['utilities', 'telecom'],
      priority: 10,
    },
    {
      name: 'Bescom Electricity',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'Bescom', direction: 'DEBIT' },
      tags: ['utilities', 'electricity'],
      priority: 10,
    },
    {
      name: 'Tata Power Electricity',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'Tata Power', direction: 'DEBIT' },
      tags: ['utilities', 'electricity'],
      priority: 10,
    },
    {
      name: 'Indraprastha Gas IGL',
      categoryKey: 'Utilities & Bills',
      conditions: { descriptionContains: 'IGL', direction: 'DEBIT' },
      tags: ['utilities', 'gas'],
      priority: 10,
    },

    // --- Entertainment & Subscriptions ---
    {
      name: 'Netflix Subscription',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'Netflix', direction: 'DEBIT' },
      tags: ['entertainment', 'subscription', 'streaming'],
      priority: 10,
    },
    {
      name: 'Spotify Music',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'Spotify', direction: 'DEBIT' },
      tags: ['entertainment', 'subscription', 'music'],
      priority: 10,
    },
    {
      name: 'Disney+ Hotstar',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'Hotstar', direction: 'DEBIT' },
      tags: ['entertainment', 'subscription', 'streaming'],
      priority: 10,
    },
    {
      name: 'BookMyShow Cinema',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'BookMyShow', direction: 'DEBIT' },
      tags: ['entertainment', 'movies'],
      priority: 10,
    },
    {
      name: 'PVR Inox Cinemas',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'PVR', direction: 'DEBIT' },
      tags: ['entertainment', 'movies'],
      priority: 10,
    },
    {
      name: 'Apple Services Billing',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'Apple', direction: 'DEBIT' },
      tags: ['entertainment', 'subscription'],
      priority: 10,
    },
    {
      name: 'Google Play Digital',
      categoryKey: 'Entertainment',
      conditions: { descriptionContains: 'Google Play', direction: 'DEBIT' },
      tags: ['entertainment', 'apps'],
      priority: 10,
    },

    // --- Health & Wellness ---
    {
      name: 'Apollo Pharmacy Medicines',
      categoryKey: 'Health & Wellness',
      conditions: { descriptionContains: 'Apollo Pharmacy', direction: 'DEBIT' },
      tags: ['health', 'pharmacy'],
      priority: 10,
    },
    {
      name: 'PharmEasy Healthcare',
      categoryKey: 'Health & Wellness',
      conditions: { descriptionContains: 'PharmEasy', direction: 'DEBIT' },
      tags: ['health', 'pharmacy'],
      priority: 10,
    },
    {
      name: 'Cult Fit Fitness & Gym',
      categoryKey: 'Health & Wellness',
      conditions: { descriptionContains: 'Cult', direction: 'DEBIT' },
      tags: ['health', 'fitness'],
      priority: 10,
    },

    // --- Investments & Wealth ---
    {
      name: 'Zerodha Broking Stock/MF',
      categoryKey: 'Investments',
      conditions: { descriptionContains: 'Zerodha' },
      tags: ['investments', 'stocks'],
      priority: 10,
    },
    {
      name: 'Groww Investments',
      categoryKey: 'Investments',
      conditions: { descriptionContains: 'Groww' },
      tags: ['investments', 'mutual-funds'],
      priority: 10,
    },

    // --- Salary & Income ---
    {
      name: 'Salary Credit',
      categoryKey: 'Salary',
      conditions: { descriptionContains: 'Salary', direction: 'CREDIT' },
      tags: ['income', 'salary'],
      priority: 20,
    },
    {
      name: 'Payroll Credit',
      categoryKey: 'Salary',
      conditions: { descriptionContains: 'Payroll', direction: 'CREDIT' },
      tags: ['income', 'salary'],
      priority: 20,
    },
  ];

  for (const rule of systemRulesData) {
    const categoryId = categories[rule.categoryKey];
    if (!categoryId) {
      console.warn(`Category "${rule.categoryKey}" missing for rule "${rule.name}"! Skipping.`);
      continue;
    }

    const existingRule = await prisma.classificationRule.findFirst({
      where: { name: rule.name },
    });

    if (existingRule) {
      await prisma.classificationRule.update({
        where: { id: existingRule.id },
        data: {
          categoryId,
          conditions: rule.conditions,
          tags: rule.tags,
          priority: rule.priority,
          isSystem: true,
          source: 'SYSTEM' as RuleSource,
        },
      });
    } else {
      await prisma.classificationRule.create({
        data: {
          userId: user.id,
          name: rule.name,
          categoryId,
          conditions: rule.conditions,
          tags: rule.tags,
          priority: rule.priority,
          isSystem: true,
          source: 'SYSTEM' as RuleSource,
        },
      });
    }
  }

  console.log(`✓ Seeded ${systemRulesData.length} system rules successfully`);
  console.log('Seeding completed cleanly!');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
