import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'user@example.com' && body.password === 'password123') {
      return HttpResponse.json({ token: 'fake-jwt-token' });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get('*/admin/stats', () => {
    return HttpResponse.json({
      data: {
        users: 1250,
        products: 45,
        orders: 310,
      },
    });
  }),

  http.get('*/cart', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          productId: '1',
          quantity: 2,
          product: { name: 'Wireless Headphones', price: 99.99 },
        },
      ],
    });
  }),

  http.post('*/orders', () => {
    return HttpResponse.json({ success: true, message: 'Order created' });
  }),

  http.get('*/products', () => {
    return HttpResponse.json([
      { id: '1', name: 'Wireless Headphones', price: 99.99 },
    ]);
  }),
];