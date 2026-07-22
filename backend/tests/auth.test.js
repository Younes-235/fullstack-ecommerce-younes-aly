const request = require('supertest');
const app = require('../app');
const prisma = require('../config/db');

jest.mock('../config/db', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    }
}));

jest.mock('../utils/welcomeEmail', () => {
    const mockFn = jest.fn().mockResolvedValue(true);
    mockFn.sendWelcomeEmail = mockFn; 
    return mockFn;
});

describe('Auth Tests', () => {
    afterEach(() => jest.clearAllMocks());

    test('POST /api/register - success', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({ id: 1, email: 'test@example.com' });

        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test@example.com', password: '123' });

        expect(res.status).toBe(201);
    });

    test('POST /api/register - email already exists', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1 });

        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test@example.com', password: '123' });

        expect(res.status).toBe(400);
    });
});