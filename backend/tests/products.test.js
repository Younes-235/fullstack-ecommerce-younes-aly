const request = require('supertest');
const app = require('../app.js'); 

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'mock-user-id', role: 'admin' };
    next();
  },
  restrictTo: (...allowedRoles) => {
    return (req, res, next) => {
      next(); 
    };
  }
}));

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(({ data }) => {
        if (!data.name || Number.isNaN(data.price)) {
          return Promise.reject(new Error('PrismaClientValidationError'));
        }
        return Promise.resolve({ id: 99, ...data });
      })
    }
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('POST /api/products Integration Layer', () => {

  it('should process multi-part payload data and files flawlessly', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer mock-valid-admin-token') 
      .field('name', 'Retro Mechanical Keyboard')
      .field('description', 'Clicky click keyboard')
      .field('price', '85.50')
      .field('category', 'Electronics')
      .field('stock', '12')
      .attach('image', Buffer.from('mock-binary-bits'), 'keyboard.png');

    expect(response.status).toBe(201);
  });

  it('should reject requests with missing payload components with status 400', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer mock-valid-admin-token') 
      .send({}); 

    expect(response.status).toBe(400);

    consoleSpy.mockRestore(); 
  });
});