import { renderWithProviders } from '../test-utils';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import ProductDetail from './ProductDetail';

describe('ProductDetail Component', () => {
  test('renders specific product details based on URL param', async () => {
    server.use(
      http.get('*/api/products/:id', ({ params }) => {
        return HttpResponse.json({
          id: params.id,
          name: 'Pro Wireless Mouse',
          price: 49.99,
          description: 'High precision gaming mouse',
          category: 'Electronics',
          stock: 15,
        });
      }),
      http.get('*/api/products/:id/reviews', () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<ProductDetail />, {
      route: '/products/1',
    });

    const heading = await screen.findByRole('heading', { name: /pro wireless mouse/i });
    expect(heading).toBeInTheDocument();
  });
});