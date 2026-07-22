import { renderWithProviders } from '../test-utils';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import Products from './Products';

describe('Products Component', () => {
  test('renders products list without router errors', async () => {
    server.use(
      http.get('*/products/categories', () => {
        return HttpResponse.json(['Electronics', 'Clothing', 'Accessories']);
      }),
      http.get('*/products', () => {
        return HttpResponse.json({
          data: [
            { id: '1', name: 'Wireless Mouse', price: 29.99, category: 'Electronics', stock: 10 },
          ],
          meta: { currentPage: 1, totalPages: 1 },
        });
      })
    );

    renderWithProviders(<Products />);

    expect(await screen.findByText(/wireless mouse/i)).toBeInTheDocument();
  });
});