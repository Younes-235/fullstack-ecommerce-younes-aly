import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import { server } from '../mocks/server';
import Login from './Login';
import { renderWithProviders } from '../test-utils';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  test('successfully logs in with valid credentials and redirects to products', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('*/login', async ({ request }) => {
        const body = await request.json();
        if (body.email === 'user@example.com' && body.password === 'password123') {
          return HttpResponse.json({ token: 'fake-jwt-token' });
        }
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      })
    );

    renderWithProviders(<Login />);

    await user.type(screen.getByPlaceholderText(/email address/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });
});