const { protect, restrictTo } = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('protect middleware', () => {
        it('should return 401 if no Authorization header is provided', async () => {
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() when a valid Bearer token is provided', async () => {
            req.headers.authorization = 'Bearer valid-jwt-token';
            jwt.verify.mockReturnValue({ id: 'user-123', role: 'admin' });

            await protect(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe('user-123');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('restrictTo middleware', () => {
        it('should return 403 if user role is not allowed', () => {
            req.user = { role: 'user' };
            const middleware = restrictTo('admin');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() if user role matches allowed roles', () => {
            req.user = { role: 'admin' };
            const middleware = restrictTo('admin', 'manager');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});