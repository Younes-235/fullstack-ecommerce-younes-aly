import { renderWithProviders } from '../test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import Register from './Register';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Register Component', () => {
  test('submits registration form and redirects after timeout', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('*/register', () => {
        return HttpResponse.json({ success: true, message: 'User created' });
      })
    );

    renderWithProviders(<Register />);

    await user.type(screen.getByPlaceholderText(/full name/i), 'Jane Doe');
    await user.type(screen.getByPlaceholderText(/email address/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/create password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register account/i }));

    expect(await screen.findByText(/account registered successfully/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });
});