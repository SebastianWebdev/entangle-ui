import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Stat } from './Stat';

describe('Stat', () => {
  describe('Rendering', () => {
    it('renders label and value', () => {
      renderWithTheme(<Stat label="Revenue" value="$12,400" />);
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('$12,400')).toBeInTheDocument();
    });

    it('renders delta when provided', () => {
      renderWithTheme(
        <Stat
          label="Revenue"
          value="$12,400"
          delta={{ value: '+8.2%', direction: 'up' }}
        />
      );
      expect(screen.getByText('+8.2%')).toBeInTheDocument();
    });

    it('omits delta when not provided', () => {
      const { container } = renderWithTheme(
        <Stat label="Revenue" value="$12,400" />
      );
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });

    it('renders helper text when provided', () => {
      renderWithTheme(
        <Stat label="Latency" value="120ms" helper="last 24h" />
      );
      expect(screen.getByText('last 24h')).toBeInTheDocument();
    });

    it('renders custom icon', () => {
      renderWithTheme(
        <Stat
          label="Users"
          value="1,234"
          icon={<svg data-testid="user-icon" aria-hidden="true" />}
        />
      );
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  describe('Semantics', () => {
    it('default (positive) up direction renders green delta', () => {
      const { container } = renderWithTheme(
        <Stat
          label="Signups"
          value="1,000"
          delta={{ value: '+10%', direction: 'up' }}
        />
      );
      const delta = container.querySelector('[style*="--"]');
      expect(delta).not.toBeNull();
      // The CSS var should resolve to the success color.
      expect(delta?.getAttribute('style') ?? '').toContain('var(--etui-color-accent-success');
    });

    it('negative semantics flips the color so up=bad', () => {
      const { container } = renderWithTheme(
        <Stat
          label="Errors"
          value="32"
          delta={{ value: '+4', direction: 'up', semantics: 'negative' }}
        />
      );
      const delta = container.querySelector('[style*="--"]');
      expect(delta?.getAttribute('style') ?? '').toContain('var(--etui-color-accent-error');
    });

    it('neutral semantics uses muted color regardless of direction', () => {
      const { container } = renderWithTheme(
        <Stat
          label="Visits"
          value="1k"
          delta={{ value: '0', direction: 'up', semantics: 'neutral' }}
        />
      );
      const delta = container.querySelector('[style*="--"]');
      expect(delta?.getAttribute('style') ?? '').toContain('var(--etui-color-text-muted');
    });
  });
});
