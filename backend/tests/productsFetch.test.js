const request = require('supertest');
const app = require('../app');

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        $transaction: jest.fn((cb) => typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb)),
        product: {
            findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Item' }]),
            count: jest.fn().mockResolvedValue(1),
        }
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Products Test', () => {
    test('GET /api/products - success', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
    });
});