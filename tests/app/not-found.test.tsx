import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../../app/not-found';

describe('NotFound Page', () => {
  it('should render 404 message', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<NotFound />);

    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });

  it('should render quick links', () => {
    render(<NotFound />);

    expect(screen.getByRole('link', { name: /our school/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /results/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /apply now/i })).toBeInTheDocument();
  });
});
