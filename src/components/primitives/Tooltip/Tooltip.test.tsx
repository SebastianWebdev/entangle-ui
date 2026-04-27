import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  describe('Reduced motion', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    });

    it('emits transition: none on the popup when prefers-reduced-motion: reduce, regardless of animation prop', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const user = userEvent.setup({ delay: null });
      renderWithTheme(
        <Tooltip
          title="Tip"
          testId="tt"
          animation={{ animated: true, duration: 200, easing: 'ease-out' }}
          delay={0}
        >
          <button>Trigger</button>
        </Tooltip>
      );

      await user.hover(screen.getByText('Trigger'));
      const popup = await screen.findByTestId('tt');
      expect(popup).toHaveStyle({ transition: 'none' });
    });

    it('emits an animated transition when reduced motion is not requested', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithTheme(
        <Tooltip
          title="Tip"
          testId="tt"
          animation={{ animated: true, duration: 200, easing: 'ease-out' }}
          delay={0}
        >
          <button>Trigger</button>
        </Tooltip>
      );

      await user.hover(screen.getByText('Trigger'));
      const popup = await screen.findByTestId('tt');
      // 200ms ease-out is what the component composes from the animation prop.
      expect(popup.getAttribute('style')).toContain('200ms ease-out');
    });
  });
});
