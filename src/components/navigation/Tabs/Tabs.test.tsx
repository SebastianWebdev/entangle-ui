import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Tabs } from './Tabs';
import { TabList } from './TabList';
import { Tab } from './Tab';
import { TabPanel } from './TabPanel';

const BasicTabs = ({
  value,
  defaultValue,
  onChange,
  variant,
  size,
  orientation,
  fullWidth,
  pillsFrame,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  pillsFrame?: boolean;
}) => (
  <Tabs
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    variant={variant}
    size={size}
    orientation={orientation}
    fullWidth={fullWidth}
    pillsFrame={pillsFrame}
  >
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
      <Tab value="tab3">Tab 3</Tab>
    </TabList>
    <TabPanel value="tab1">Content 1</TabPanel>
    <TabPanel value="tab2">Content 2</TabPanel>
    <TabPanel value="tab3">Content 3</TabPanel>
  </Tabs>
);

describe('Tabs', () => {
  describe('Rendering', () => {
    it('renders tabs and panels', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('renders first tab active by default', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(
        <Tabs defaultValue="tab1" testId="my-tabs">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );
      expect(screen.getByTestId('my-tabs')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects value prop', () => {
      renderWithTheme(<BasicTabs value="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      const tab2Button = screen.getByText('Tab 2').closest('[role="tab"]');
      expect(tab2Button).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onChange when tab is clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(<BasicTabs value="tab1" onChange={handleChange} />);

      fireEvent.click(screen.getByText('Tab 2'));
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('does not change displayed panel without value update', () => {
      renderWithTheme(<BasicTabs value="tab1" />);
      fireEvent.click(screen.getByText('Tab 2'));

      // Still shows tab1 content because controlled
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled', () => {
    it('manages state from defaultValue', () => {
      renderWithTheme(<BasicTabs defaultValue="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('switches panel on tab click', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      fireEvent.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Tab activation', () => {
    it('shows correct panel when tab is clicked', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      fireEvent.click(screen.getByText('Tab 3'));
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('marks clicked tab as selected', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      fireEvent.click(screen.getByText('Tab 2'));
      const tab2Button = screen.getByText('Tab 2').closest('[role="tab"]');
      expect(tab2Button).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard (horizontal)', () => {
    it('moves focus right with ArrowRight', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab2 = screen
        .getByText('Tab 2')
        .closest('[role="tab"]') as HTMLElement;
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });

      expect(tab2).toHaveFocus();
    });

    it('moves focus left with ArrowLeft', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab2 = screen
        .getByText('Tab 2')
        .closest('[role="tab"]') as HTMLElement;
      tab2.focus();
      fireEvent.keyDown(tab2, { key: 'ArrowLeft' });

      expect(tab1).toHaveFocus();
    });

    it('wraps from last to first with ArrowRight', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab3 = screen
        .getByText('Tab 3')
        .closest('[role="tab"]') as HTMLElement;
      tab3.focus();
      fireEvent.keyDown(tab3, { key: 'ArrowRight' });

      expect(tab1).toHaveFocus();
    });

    it('wraps from first to last with ArrowLeft', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab3 = screen
        .getByText('Tab 3')
        .closest('[role="tab"]') as HTMLElement;
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'ArrowLeft' });

      expect(tab3).toHaveFocus();
    });

    it('jumps to first tab with Home', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab3 = screen
        .getByText('Tab 3')
        .closest('[role="tab"]') as HTMLElement;
      tab3.focus();
      fireEvent.keyDown(tab3, { key: 'Home' });

      expect(tab1).toHaveFocus();
    });

    it('jumps to last tab with End', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab3 = screen
        .getByText('Tab 3')
        .closest('[role="tab"]') as HTMLElement;
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'End' });

      expect(tab3).toHaveFocus();
    });

    it('activates tab with Enter', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <BasicTabs defaultValue="tab1" onChange={handleChange} />
      );

      const tab2 = screen
        .getByText('Tab 2')
        .closest('[role="tab"]') as HTMLElement;
      tab2.focus();
      fireEvent.keyDown(tab2, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('activates tab with Space', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <BasicTabs defaultValue="tab1" onChange={handleChange} />
      );

      const tab3 = screen
        .getByText('Tab 3')
        .closest('[role="tab"]') as HTMLElement;
      tab3.focus();
      fireEvent.keyDown(tab3, { key: ' ' });

      expect(handleChange).toHaveBeenCalledWith('tab3');
    });
  });

  describe('Keyboard (vertical)', () => {
    it('moves focus down with ArrowDown', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" orientation="vertical" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab2 = screen
        .getByText('Tab 2')
        .closest('[role="tab"]') as HTMLElement;
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'ArrowDown' });

      expect(tab2).toHaveFocus();
    });

    it('moves focus up with ArrowUp', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" orientation="vertical" />);

      const tab1 = screen
        .getByText('Tab 1')
        .closest('[role="tab"]') as HTMLElement;
      const tab2 = screen
        .getByText('Tab 2')
        .closest('[role="tab"]') as HTMLElement;
      tab2.focus();
      fireEvent.keyDown(tab2, { key: 'ArrowUp' });

      expect(tab1).toHaveFocus();
    });
  });

  describe('Disabled tab', () => {
    it('is not activatable', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Tabs defaultValue="tab1" onChange={handleChange}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>
              Tab 2
            </Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel value="tab1">Content 1</TabPanel>
          <TabPanel value="tab2">Content 2</TabPanel>
          <TabPanel value="tab3">Content 3</TabPanel>
        </Tabs>
      );

      fireEvent.click(screen.getByText('Tab 2'));
      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('has aria-disabled attribute', () => {
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>
              Tab 2
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content 1</TabPanel>
          <TabPanel value="tab2">Content 2</TabPanel>
        </Tabs>
      );

      const tab2 = screen.getByText('Tab 2').closest('[role="tab"]');
      expect(tab2).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Closable', () => {
    it('renders close button', () => {
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" closable onClose={vi.fn()}>
              Tab 1
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      expect(screen.getByLabelText('Close Tab 1')).toBeInTheDocument();
    });

    it('fires onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" closable onClose={handleClose}>
              Tab 1
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      fireEvent.click(screen.getByLabelText('Close Tab 1'));
      expect(handleClose).toHaveBeenCalledWith('tab1');
    });

    it('does not activate tab when close button is clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Tabs defaultValue="tab1" onChange={handleChange}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" closable onClose={vi.fn()}>
              Tab 2
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content 1</TabPanel>
          <TabPanel value="tab2">Content 2</TabPanel>
        </Tabs>
      );

      fireEvent.click(screen.getByLabelText('Close Tab 2'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('fires onClose with Delete key when focused', () => {
      const handleClose = vi.fn();
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" closable onClose={handleClose}>
              Tab 1
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      const tab = screen.getByRole('tab');
      tab.focus();
      fireEvent.keyDown(tab, { key: 'Delete' });

      expect(handleClose).toHaveBeenCalledWith('tab1');
    });
  });

  describe('Variants', () => {
    it('renders underline variant', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" variant="underline" />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders pills variant', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" variant="pills" />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders pills variant without frame when pillsFrame is false', () => {
      renderWithTheme(
        <BasicTabs defaultValue="tab1" variant="pills" pillsFrame={false} />
      );

      expect(screen.getByRole('tablist')).toHaveStyle({
        border: 'none',
        background: 'transparent',
      });
    });

    it('renders enclosed variant', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" variant="enclosed" />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders %s size', size => {
      renderWithTheme(<BasicTabs defaultValue="tab1" size={size} />);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });
  });

  describe('fullWidth', () => {
    it('renders with fullWidth', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" fullWidth />);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });
  });

  describe('keepMounted', () => {
    it('keeps inactive panel in DOM when keepMounted', () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanel value="tab1" keepMounted>
            Content 1
          </TabPanel>
          <TabPanel value="tab2" keepMounted>
            Content 2
          </TabPanel>
        </Tabs>
      );

      // Both panels should be in the DOM (query directly since hidden panels
      // are excluded from accessibility tree)
      const panels = container.querySelectorAll('[role="tabpanel"]');
      expect(panels).toHaveLength(2);

      // Active panel is visible
      expect(screen.getByText('Content 1')).toBeVisible();

      // Inactive panel has hidden attribute
      const hiddenPanel = Array.from(panels).find(p =>
        p.hasAttribute('hidden')
      );
      expect(hiddenPanel).toBeDefined();
    });

    it('does not keep inactive panel when not keepMounted', () => {
      renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanel value="tab1">Content 1</TabPanel>
          <TabPanel value="tab2">Content 2</TabPanel>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('sets aria-orientation on tablist', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" orientation="vertical" />);

      expect(screen.getByRole('tablist')).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });

    it('defaults to horizontal orientation', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      expect(screen.getByRole('tablist')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });
  });

  describe('Accessibility', () => {
    it('has role="tablist" on the tab list', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has role="tab" on each tab', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('has role="tabpanel" on the active panel', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('has aria-selected on active tab', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen.getByText('Tab 1').closest('[role="tab"]');
      const tab2 = screen.getByText('Tab 2').closest('[role="tab"]');
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('has aria-controls linking tab to panel', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tabEl = screen.getByText('Tab 1').closest('[role="tab"]');
      const panel = screen.getByRole('tabpanel');
      const controlsId = tabEl?.getAttribute('aria-controls');

      expect(controlsId).toBeTruthy();
      expect(panel.id).toBe(controlsId);
    });

    it('has aria-labelledby linking panel to tab', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tabEl = screen.getByText('Tab 1').closest('[role="tab"]');
      const panel = screen.getByRole('tabpanel');

      expect(panel.getAttribute('aria-labelledby')).toBe(tabEl?.id);
    });

    it('active tab has tabIndex 0, inactive tabs have tabIndex -1', () => {
      renderWithTheme(<BasicTabs defaultValue="tab1" />);

      const tab1 = screen.getByText('Tab 1').closest('[role="tab"]');
      const tab2 = screen.getByText('Tab 2').closest('[role="tab"]');
      const tab3 = screen.getByText('Tab 3').closest('[role="tab"]');
      expect(tab1).toHaveAttribute('tabindex', '0');
      expect(tab2).toHaveAttribute('tabindex', '-1');
      expect(tab3).toHaveAttribute('tabindex', '-1');
    });
  });
});
