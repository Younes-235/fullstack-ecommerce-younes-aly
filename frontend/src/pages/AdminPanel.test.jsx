import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderWithProviders } from '../test-utils';
import AdminPanel from './AdminPanel';

describe('AdminPanel Component', () => {
  test('renders user count accurately', async () => {
    server.use(
      http.get('*/admin/stats', () => {
        return HttpResponse.json({
          data: {
            users: 1250,
            products: 45,
            orders: 310,
          },
        });
      })
    );

    renderWithProviders(<AdminPanel />);

    const userStat = await screen.findByText(/1,?250/);
    expect(userStat).toBeInTheDocument();
  });
});