const request = require('supertest');
const app     = require('../app');
const prisma  = require('../config/db');

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 1, email: 'user@example.com', role: 'admin' };
    next();
  },
  restrictTo: () => (req, res, next) => next() 
}));

jest.mock('../config/db', () => {
  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    product: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, price: 10, stock: 5 }),
      update: jest.fn().mockResolvedValue({}),
    },
    order: { create: jest.fn().mockResolvedValue({ id: 101, customerEmail: 'user@example.com' }) },
    cart: { update: jest.fn().mockResolvedValue({}) },
  };
  return mockPrisma;
});

describe('Orders API', () => {
  afterEach(() => jest.clearAllMocks());

  test('POST /api/orders - success', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, quantity: 1 }] });

    expect(res.status).toBe(201);
  });
});