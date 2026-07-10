const request = require('supertest');
const app = require('../app.js'); 

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mock-img.png' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock-supabase.co/mock-img.png' } })
      })
    }
  })
}));
// Intercept your real auth middleware file so it bypasses JWT and Role checks during tests
jest.mock('../middleware/authMiddleware', () => {
  return {
    // 1. Mock the protect middleware
    protect: (req, res, next) => {
      req.user = { id: 'mock-user-id', role: 'admin' };
      next();
    },
    // 2. Mock the restrictTo function so it returns a working middleware function
    restrictTo: (...allowedRoles) => {
      return (req, res, next) => {
        next(); // Pass straight through without checking roles
      };
    }
  };
});
// 3. COMPLETE PRISMA MOCK
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(({ data }) => {
        // Mimic Prisma's strict validation: crash if required fields are missing
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
      // --- ADD THIS LINE TO BYPASS AUTHENTICATION MIDDLEWARE ---
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
    const response = await request(app)
      .post('/api/products')
      // --- ADD THIS LINE HERE AS WELL ---
      .set('Authorization', 'Bearer mock-valid-admin-token') 
      .send({}); 

    expect(response.status).toBe(400);
  });
});