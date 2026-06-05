import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { PathBar } from './PathBar';

// Mock Base UI Menu to avoid @floating-ui positioning loops in jsdom and to
// keep the sibling-dropdown content mounted so items can be queried without
// driving the popup open. The Trigger honors `render` so the caret IconButton
// (and its aria-label) is preserved.
vi.mock('@base-ui/react/menu', async () => {
  const { createElement, Fragment, forwardRef, isValidElement } =
    await import('react');

  interface MockProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler;
    disabled?: boolean;
    render?: React.ReactElement;
    'data-testid'?: string;
  }

  const Frag = ({ children }: MockProps) =>
    createElement(Fragment, null, children);
  const Div = ({ children }: MockProps) => createElement('div', null, children);
  const Pass = forwardRef<HTMLDivElement, MockProps>(
    ({ children, className, onClick, disabled, 'data-testid': testId }, ref) =>
      createElement(
        'div',
        {
          ref,
          className,
          onClick,
          'data-disabled': disabled ? '' : undefined,
          'data-testid': testId,
        },
        children
      )
  );
  Pass.displayName = 'Pass';
  const Trigger = ({ children, render }: MockProps) =>
    isValidElement(render)
      ? render
      : createElement('button', { type: 'button' }, children);

  return {
    Menu: {
      Root: Frag,
      Trigger,
      Portal: Frag,
      Positioner: Div,
      Popup: Pass,
      Group: Frag,
      GroupLabel: Div,
      Separator: Pass,
      RadioGroup: Frag,
      RadioItem: Pass,
      RadioItemIndicator: Frag,
      CheckboxItem: Pass,
      CheckboxItemIndicator: Frag,
      Item: Pass,
      SubmenuRoot: Frag,
      SubmenuTrigger: Pass,
    },
  };
});

const FILE_PATH = 'src/components/Button.tsx';

describe('PathBar', () => {
  describe('Rendering', () => {
    it('renders a breadcrumb navigation landmark', () => {
      renderWithTheme(<PathBar value={FILE_PATH} />);

      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
    });

    it('renders one crumb per path segment from a string path', () => {
      renderWithTheme(<PathBar value={FILE_PATH} />);

      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('components')).toBeInTheDocument();
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    });

    it('marks the last segment as the current location', () => {
      renderWithTheme(<PathBar value={FILE_PATH} />);

      expect(
        screen.getByText('Button.tsx').closest('[aria-current]')
      ).toHaveAttribute('aria-current', 'page');
      // The leaf is not a navigation target.
      expect(screen.queryByRole('button', { name: 'Button.tsx' })).toBeNull();
    });

    it('renders folder segments as interactive crumbs', () => {
      renderWithTheme(<PathBar value={FILE_PATH} />);

      expect(screen.getByRole('button', { name: 'src' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'components' })
      ).toBeInTheDocument();
    });

    it('accepts a structured segments array with per-segment icons', () => {
      renderWithTheme(
        <PathBar
          value={[
            { label: 'Home', icon: <svg data-testid="seg-icon" /> },
            'projects',
          ]}
        />
      );

      expect(screen.getByTestId('seg-icon')).toBeInTheDocument();
      expect(screen.getByText('projects')).toBeInTheDocument();
    });

    it('renders the rootIcon on the first segment', () => {
      renderWithTheme(
        <PathBar value={FILE_PATH} rootIcon={<svg data-testid="root-icon" />} />
      );

      expect(screen.getByTestId('root-icon')).toBeInTheDocument();
    });

    it('inserts a separator between each pair of segments', () => {
      const { container } = renderWithTheme(<PathBar value={FILE_PATH} />);

      // Three segments → two separators (decorative list items).
      expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(
        2
      );
    });
  });

  describe('Interactions', () => {
    it('fires onNavigate with the path, segment, and index on click', () => {
      const onNavigate = vi.fn();
      renderWithTheme(<PathBar value={FILE_PATH} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByRole('button', { name: 'components' }));

      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith(
        'src/components',
        expect.objectContaining({
          label: 'components',
          value: 'src/components',
        }),
        1
      );
    });

    it('fires onNavigate on keyboard activation', () => {
      const onNavigate = vi.fn();
      renderWithTheme(<PathBar value={FILE_PATH} onNavigate={onNavigate} />);

      fireEvent.keyDown(screen.getByRole('button', { name: 'src' }), {
        key: 'Enter',
      });

      expect(onNavigate).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ label: 'src', value: 'src' }),
        0
      );
    });

    it('truncates the trail to the clicked ancestor when uncontrolled', () => {
      renderWithTheme(<PathBar defaultValue={FILE_PATH} />);

      fireEvent.click(screen.getByRole('button', { name: 'components' }));

      // 'components' is now the current leaf; everything below it is dropped.
      expect(screen.queryByText('Button.tsx')).toBeNull();
      expect(
        screen.getByText('components').closest('[aria-current]')
      ).toHaveAttribute('aria-current', 'page');
    });

    it('does not mutate the trail when controlled', () => {
      const onNavigate = vi.fn();
      renderWithTheme(<PathBar value={FILE_PATH} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByRole('button', { name: 'components' }));

      // Controlled: the consumer owns the path, so the leaf stays put.
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sibling dropdown', () => {
    const getSiblings = (
      _segment: { label: string },
      index: number
    ): string[] => (index === 2 ? ['Input.tsx', 'Card.tsx'] : []);

    it('renders a sibling-dropdown trigger only for segments with siblings', () => {
      renderWithTheme(<PathBar value={FILE_PATH} getSiblings={getSiblings} />);

      expect(
        screen.getByRole('button', { name: 'Browse Button.tsx siblings' })
      ).toBeInTheDocument();
      // Folder segments without siblings get no caret.
      expect(
        screen.queryByRole('button', { name: 'Browse src siblings' })
      ).toBeNull();
    });

    it('renders no dropdown trigger when getSiblings is omitted', () => {
      renderWithTheme(<PathBar value={FILE_PATH} />);

      expect(
        screen.queryByRole('button', { name: /Browse .* siblings/ })
      ).toBeNull();
    });

    it('fires onNavigate with the sibling value when a sibling is chosen', () => {
      const onNavigate = vi.fn();
      renderWithTheme(
        <PathBar
          value={FILE_PATH}
          getSiblings={getSiblings}
          onNavigate={onNavigate}
        />
      );

      fireEvent.click(screen.getByText('Input.tsx'));

      expect(onNavigate).toHaveBeenCalledWith(
        'src/components/Input.tsx',
        expect.objectContaining({
          label: 'Input.tsx',
          value: 'src/components/Input.tsx',
        }),
        2
      );
    });

    it('swaps the segment for the chosen sibling when uncontrolled', () => {
      const { container } = renderWithTheme(
        <PathBar defaultValue={FILE_PATH} getSiblings={getSiblings} />
      );

      fireEvent.click(screen.getByText('Card.tsx'));

      // 'Card.tsx' is now the current leaf (it also still appears as its own
      // sibling in the always-mounted mock menu, so scope to aria-current).
      expect(screen.queryByText('Button.tsx')).toBeNull();
      expect(
        container.querySelector('[aria-current="page"]')
      ).toHaveTextContent('Card.tsx');
    });
  });

  describe('Collapse', () => {
    it('collapses long paths using the Breadcrumbs ellipsis', () => {
      renderWithTheme(
        <PathBar value="a/b/c/d/e/file.tsx" maxItems={3} expandable />
      );

      expect(screen.getByLabelText('Show all breadcrumbs')).toBeInTheDocument();
      // A middle segment is hidden until expanded.
      expect(screen.queryByText('c')).toBeNull();

      fireEvent.click(screen.getByLabelText('Show all breadcrumbs'));

      expect(screen.getByText('c')).toBeInTheDocument();
    });
  });
});
