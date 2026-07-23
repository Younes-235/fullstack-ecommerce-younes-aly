const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const Feedback = require('../models/Feedback'); 
const ActivityLog = require('../models/ActivityLog'); 

async function main() {
  console.log('🌱 Starting database seeding...');

  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI; 
    await mongoose.connect(mongoUri);
    console.log('🔌 Connected to MongoDB...');
  }

  console.log('🧹 Cleaning old records...');
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  await Feedback.deleteMany({});
  await ActivityLog.deleteMany({});

  console.log('👤 Seeding users (Customer & Admin)...');
  const hashedCustomerPassword = await bcrypt.hash("password123", 10);
  const hashedAdminPassword = await bcrypt.hash("AdminSecure123!", 10);

  const customer = await prisma.user.create({
    data: {
      name: 'Younes',
      email: 'customer@example.com',
      password: hashedCustomerPassword,
      role: 'user',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  console.log('📦 Seeding product...');
  const product1 = await prisma.product.create({
    data: {
      name: 'Wireless Headphones',
      description: 'High-quality noise-canceling over-ear wireless headphones.',
      price: 99.99,
      category: 'Electronics',
      stock: 50,
      imageUrl: '/uploads/headphones.jpg',
    },
  });

  console.log('🛒 Seeding cart & cart item...');
  const cart = await prisma.cart.create({
    data: {
      customerEmail: customer.email,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product1.id,
      quantity: 2,
    },
  });

  console.log('💬 Seeding MongoDB feedback...');
  await Feedback.create({
    productId: product1.id,
    userId: customer.id,
    username: customer.name,
    rating: 5,
    comment: 'Amazing sound quality, highly recommend!',
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });