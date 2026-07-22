import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero title, description, and CTA button', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /welcome to swiftshop/i })).toBeInTheDocument();
    expect(screen.getByText(/discover our curated collection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore products now/i })).toBeInTheDocument();
  });

  it('navigates to /products when CTA button is clicked', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole('button', { name: /explore products now/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });
});