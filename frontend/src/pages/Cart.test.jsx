import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import { server } from '../mocks/server';
import Cart from './Cart';

describe('Cart Component', () => {
  test('calculates total and completes checkout', async () => {
    const user = userEvent.setup();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    server.use(
      http.post('*/orders', () => {
        return HttpResponse.json({ success: true, message: 'Order created' });
      })
    );

    render(<Cart />);

    expect(await screen.findByText(/total:\s*\$199\.98/i)).toBeInTheDocument();

    const checkoutBtn = screen.getByRole('button', { name: /complete order/i });
    await user.click(checkoutBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/checkout completely successful!/i)
      );
    });

    alertSpy.mockRestore();
  });
});