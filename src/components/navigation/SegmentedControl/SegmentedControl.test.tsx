import { screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { SegmentedControl } from './SegmentedControl';
import { SegmentedControlItem } from './SegmentedControlItem';

const Basic = ({
  value,
  defaultValue,
  onChange,
  disabled,
  size,
  variant,
  orientation,
  fullWidth,
  ariaLabel,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'solid' | 'outline';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  ariaLabel?: string;
}) => (
  <SegmentedControl
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    disabled={disabled}
    size={size}
    variant={variant}
    orientation={orientation}
    fullWidth={fullWidth}
    aria-label={ariaLabel}
  >
    <SegmentedControlItem value="a">Alpha</SegmentedControlItem>
    <SegmentedControlItem value="b">Bravo</SegmentedControlItem>
    <SegmentedControlItem value="c">Charlie</SegmentedControlItem>
  </SegmentedControl>
);

const getItem = (label: string): HTMLButtonElement =>
  screen.getByText(label).closest('button') as HTMLButtonElement;

describe('SegmentedControl', () => {
  describe('Rendering', () => {
    it('renders a group with the default aria-label', () => {
      renderWithTheme(<Basic defaultValue="a" />);
      const group = screen.getByRole('group', { name: 'Segmented control' });
      expect(group).toBeInTheDocument();
    });

    it('uses custom aria-label when provided', () => {
      renderWithTheme(<Basic defaultValue="a" ariaLabel="View mode" />);
      expect(
        screen.getByRole('group', { name: 'View mode' })
      ).toBeInTheDocument();
    });

    it('renders each item as a button', () => {
      renderWithTheme(<Basic defaultValue="a" />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('forwards testId to the root element', () => {
      renderWithTheme(
        <SegmentedControl defaultValue="x" testId="seg">
          <SegmentedControlItem value="x">X</SegmentedControlItem>
        </SegmentedControl>
      );
      expect(screen.getByTestId('seg')).toBeInTheDocument();
    });

    it('reflects orientation via aria-orientation', () => {
      renderWithTheme(<Basic defaultValue="a" orientation="vertical" />);
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Selection', () => {
    it('marks the controlled value as pressed', () => {
      renderWithTheme(<Basic value="b" />);
      expect(getItem('Bravo')).toHaveAttribute('aria-pressed', 'true');
      expect(getItem('Alpha')).toHaveAttribute('aria-pressed', 'false');
    });

    it('marks the defaultValue as pressed in uncontrolled mode', () => {
      renderWithTheme(<Basic defaultValue="c" />);
      expect(getItem('Charlie')).toHaveAttribute('aria-pressed', 'true');
    });

    it('updates internal state when uncontrolled item is clicked', () => {
      renderWithTheme(<Basic defaultValue="a" />);
      fireEvent.click(getItem('Bravo'));
      expect(getItem('Bravo')).toHaveAttribute('aria-pressed', 'true');
      expect(getItem('Alpha')).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not update internal state when controlled', () => {
      renderWithTheme(<Basic value="a" />);
      fireEvent.click(getItem('Bravo'));
      expect(getItem('Alpha')).toHaveAttribute('aria-pressed', 'true');
      expect(getItem('Bravo')).toHaveAttribute('aria-pressed', 'false');
    });

    it('fires onChange with the new value', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      fireEvent.click(getItem('Bravo'));
      expect(handle).toHaveBeenCalledWith('b');
    });

    it('does not fire onChange when re-clicking the active item', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      fireEvent.click(getItem('Alpha'));
      expect(handle).not.toHaveBeenCalled();
    });
  });

  describe('Disabled', () => {
    it('disables every item when the group is disabled', () => {
      renderWithTheme(<Basic defaultValue="a" disabled />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => expect(btn).toBeDisabled());
    });

    it('marks the group with aria-disabled', () => {
      renderWithTheme(<Basic defaultValue="a" disabled />);
      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('does not call onChange when a disabled group item is clicked', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" disabled onChange={handle} />);
      fireEvent.click(getItem('Bravo'));
      expect(handle).not.toHaveBeenCalled();
    });

    it('disables only the targeted item via item-level disabled', () => {
      renderWithTheme(
        <SegmentedControl defaultValue="a">
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b" disabled>
            B
          </SegmentedControlItem>
          <SegmentedControlItem value="c">C</SegmentedControlItem>
        </SegmentedControl>
      );
      expect(getItem('A')).not.toBeDisabled();
      expect(getItem('B')).toBeDisabled();
      expect(getItem('C')).not.toBeDisabled();
    });

    it('item-level disabled blocks onChange for that item only', () => {
      const handle = vi.fn();
      renderWithTheme(
        <SegmentedControl defaultValue="a" onChange={handle}>
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b" disabled>
            B
          </SegmentedControlItem>
          <SegmentedControlItem value="c">C</SegmentedControlItem>
        </SegmentedControl>
      );
      fireEvent.click(getItem('B'));
      expect(handle).not.toHaveBeenCalled();
      fireEvent.click(getItem('C'));
      expect(handle).toHaveBeenCalledWith('c');
    });
  });

  describe('Roving tabindex', () => {
    it('only the selected item is tabbable', () => {
      renderWithTheme(<Basic defaultValue="b" />);
      expect(getItem('Alpha')).toHaveAttribute('tabindex', '-1');
      expect(getItem('Bravo')).toHaveAttribute('tabindex', '0');
      expect(getItem('Charlie')).toHaveAttribute('tabindex', '-1');
    });

    it('falls back to the first non-disabled item when nothing is selected', () => {
      renderWithTheme(
        <SegmentedControl>
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b">B</SegmentedControlItem>
        </SegmentedControl>
      );
      // Layout effect promotes the first item to tabIndex 0
      expect(getItem('A').tabIndex).toBe(0);
    });
  });

  describe('Keyboard navigation', () => {
    it('ArrowRight moves focus to the next item and selects it', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      const alpha = getItem('Alpha');
      alpha.focus();
      fireEvent.keyDown(alpha, { key: 'ArrowRight' });
      expect(handle).toHaveBeenCalledWith('b');
      expect(document.activeElement).toBe(getItem('Bravo'));
    });

    it('ArrowLeft moves focus to the previous item with wrap-around', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      const alpha = getItem('Alpha');
      alpha.focus();
      fireEvent.keyDown(alpha, { key: 'ArrowLeft' });
      expect(handle).toHaveBeenCalledWith('c');
      expect(document.activeElement).toBe(getItem('Charlie'));
    });

    it('ArrowRight wraps from last to first', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="c" onChange={handle} />);
      const charlie = getItem('Charlie');
      charlie.focus();
      fireEvent.keyDown(charlie, { key: 'ArrowRight' });
      expect(handle).toHaveBeenCalledWith('a');
    });

    it('Home jumps to the first item', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="c" onChange={handle} />);
      const charlie = getItem('Charlie');
      charlie.focus();
      fireEvent.keyDown(charlie, { key: 'Home' });
      expect(handle).toHaveBeenCalledWith('a');
      expect(document.activeElement).toBe(getItem('Alpha'));
    });

    it('End jumps to the last item', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      const alpha = getItem('Alpha');
      alpha.focus();
      fireEvent.keyDown(alpha, { key: 'End' });
      expect(handle).toHaveBeenCalledWith('c');
      expect(document.activeElement).toBe(getItem('Charlie'));
    });

    it('Arrow keys skip disabled items', () => {
      const handle = vi.fn();
      renderWithTheme(
        <SegmentedControl defaultValue="a" onChange={handle}>
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b" disabled>
            B
          </SegmentedControlItem>
          <SegmentedControlItem value="c">C</SegmentedControlItem>
        </SegmentedControl>
      );
      const a = getItem('A');
      a.focus();
      fireEvent.keyDown(a, { key: 'ArrowRight' });
      expect(handle).toHaveBeenCalledWith('c');
    });

    it('uses ArrowDown / ArrowUp when orientation is vertical', () => {
      const handle = vi.fn();
      renderWithTheme(
        <Basic defaultValue="a" orientation="vertical" onChange={handle} />
      );
      const alpha = getItem('Alpha');
      alpha.focus();
      fireEvent.keyDown(alpha, { key: 'ArrowDown' });
      expect(handle).toHaveBeenCalledWith('b');
    });

    it('ignores unrelated keys', () => {
      const handle = vi.fn();
      renderWithTheme(<Basic defaultValue="a" onChange={handle} />);
      const alpha = getItem('Alpha');
      alpha.focus();
      fireEvent.keyDown(alpha, { key: 'Tab' });
      expect(handle).not.toHaveBeenCalled();
    });
  });

  describe('Variants and sizes', () => {
    it.each(['subtle', 'solid', 'outline'] as const)(
      'renders %s variant',
      variant => {
        renderWithTheme(<Basic defaultValue="a" variant={variant} />);
        expect(screen.getByRole('group')).toBeInTheDocument();
      }
    );

    it.each(['sm', 'md', 'lg'] as const)('renders size %s', size => {
      renderWithTheme(<Basic defaultValue="a" size={size} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('fullWidth applies a flex layout to the root', () => {
      renderWithTheme(<Basic defaultValue="a" fullWidth />);
      const group = screen.getByRole('group');
      // recipe sets display: flex when fullWidth
      const styles = window.getComputedStyle(group);
      expect(['flex', 'inline-flex']).toContain(styles.display);
    });
  });
});

describe('SegmentedControlItem', () => {
  it('throws when used outside a SegmentedControl', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderWithTheme(<SegmentedControlItem value="a">A</SegmentedControlItem>)
    ).toThrow(/SegmentedControlItem must be used within/);
    spy.mockRestore();
  });

  it('renders icon plus label when both provided', () => {
    renderWithTheme(
      <SegmentedControl defaultValue="a">
        <SegmentedControlItem value="a" icon={<span data-testid="icon" />}>
          List
        </SegmentedControlItem>
      </SegmentedControl>
    );
    const button = screen.getByRole('button');
    expect(within(button).getByTestId('icon')).toBeInTheDocument();
    expect(within(button).getByText('List')).toBeInTheDocument();
  });

  it('renders an icon-only segment when no children are provided', () => {
    renderWithTheme(
      <SegmentedControl defaultValue="a">
        <SegmentedControlItem
          value="a"
          icon={<span data-testid="icon" />}
          aria-label="Align left"
        />
      </SegmentedControl>
    );
    const button = screen.getByRole('button', { name: 'Align left' });
    expect(within(button).getByTestId('icon')).toBeInTheDocument();
  });

  it('falls back to the tooltip string as aria-label for icon-only segments', () => {
    renderWithTheme(
      <SegmentedControl defaultValue="a">
        <SegmentedControlItem
          value="a"
          icon={<span data-testid="icon" />}
          tooltip="Wireframe"
        />
      </SegmentedControl>
    );
    expect(
      screen.getByRole('button', { name: 'Wireframe' })
    ).toBeInTheDocument();
  });

  it('passes onClick through and forwards click events', () => {
    const handle = vi.fn();
    renderWithTheme(
      <SegmentedControl defaultValue="a">
        <SegmentedControlItem value="a" onClick={handle}>
          A
        </SegmentedControlItem>
      </SegmentedControl>
    );
    fireEvent.click(getItem('A'));
    expect(handle).toHaveBeenCalledTimes(1);
  });

  describe('icon-only dev warnings', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when an icon-only segment has no tooltip or aria-label', () => {
      renderWithTheme(
        <SegmentedControl defaultValue="a">
          <SegmentedControlItem value="a" icon={<span data-testid="icon" />} />
        </SegmentedControl>
      );
      expect(warnSpy).toHaveBeenCalled();
    });

    it('does not warn when a tooltip is provided', () => {
      renderWithTheme(
        <SegmentedControl defaultValue="a">
          <SegmentedControlItem
            value="a"
            icon={<span data-testid="icon" />}
            tooltip="Hello"
          />
        </SegmentedControl>
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
