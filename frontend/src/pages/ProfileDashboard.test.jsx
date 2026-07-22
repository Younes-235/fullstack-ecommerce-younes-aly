import { renderWithProviders } from '../test-utils';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import ProfileDashboard from './ProfileDashboard';

describe('ProfileDashboard Component', () => {
  test('fetches and displays user profile data', async () => {
    server.use(
      http.get('*/api/users/profile', () => {
        return HttpResponse.json({
          name: 'Jane Doe',
          email: 'jane@example.com',
        });
      })
    );

    renderWithProviders(<ProfileDashboard />);

    const nameInput = await screen.findByDisplayValue('Jane Doe');
    expect(nameInput).toBeInTheDocument();
  });
});