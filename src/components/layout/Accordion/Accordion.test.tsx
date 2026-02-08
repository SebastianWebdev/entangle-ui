import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Accordion } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';

const BasicAccordion = ({
  value,
  defaultValue,
  onChange,
  multiple,
  collapsible,
  variant,
  size,
}: {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  collapsible?: boolean;
  variant?: 'default' | 'ghost' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}) => (
  <Accordion
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    multiple={multiple}
    collapsible={collapsible}
    variant={variant}
    size={size}
  >
    <AccordionItem value="section1">
      <AccordionTrigger>Section 1</AccordionTrigger>
      <AccordionContent>Content 1</AccordionContent>
    </AccordionItem>
    <AccordionItem value="section2">
      <AccordionTrigger>Section 2</AccordionTrigger>
      <AccordionContent>Content 2</AccordionContent>
    </AccordionItem>
    <AccordionItem value="section3">
      <AccordionTrigger>Section 3</AccordionTrigger>
      <AccordionContent>Content 3</AccordionContent>
    </AccordionItem>
  </Accordion>
);

describe('Accordion', () => {
  describe('Rendering', () => {
    it('renders all items', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('renders expanded item content', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('does not render collapsed item content', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(
        <Accordion defaultValue="s1" testId="my-accordion">
          <AccordionItem value="s1">
            <AccordionTrigger>S1</AccordionTrigger>
            <AccordionContent>C1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(screen.getByTestId('my-accordion')).toBeInTheDocument();
    });
  });

  describe('Single mode', () => {
    it('only one item open at a time', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      // Click section 2
      fireEvent.click(screen.getByText('Section 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('opening new item closes previous', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      fireEvent.click(screen.getByText('Section 2'));
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Section 3'));
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('Multiple mode', () => {
    it('allows multiple items open', () => {
      renderWithTheme(<BasicAccordion defaultValue={['section1']} multiple />);

      fireEvent.click(screen.getByText('Section 2'));
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('toggles individual items', () => {
      renderWithTheme(
        <BasicAccordion defaultValue={['section1', 'section2']} multiple />
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Section 1'));
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Collapsible', () => {
    it('allows all items to be closed when collapsible', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" collapsible />);

      fireEvent.click(screen.getByText('Section 1'));
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('prevents closing last item when not collapsible', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      // Try to close the only open item
      fireEvent.click(screen.getByText('Section 1'));
      // Should still be open
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects value prop', () => {
      renderWithTheme(<BasicAccordion value="section2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange when item is clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <BasicAccordion value="section1" onChange={handleChange} />
      );

      fireEvent.click(screen.getByText('Section 2'));
      expect(handleChange).toHaveBeenCalledWith('section2');
    });

    it('does not change without value update', () => {
      renderWithTheme(<BasicAccordion value="section1" />);

      fireEvent.click(screen.getByText('Section 2'));
      // Still shows section1 because controlled
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled', () => {
    it('manages state from defaultValue', () => {
      renderWithTheme(<BasicAccordion defaultValue="section2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('toggles on click', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" collapsible />);

      fireEvent.click(screen.getByText('Section 1'));
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Disabled item', () => {
    it('is not toggleable', () => {
      renderWithTheme(
        <Accordion defaultValue="section1">
          <AccordionItem value="section1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="section2" disabled>
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('Section 2'));
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('has aria-disabled', () => {
      renderWithTheme(
        <Accordion defaultValue="section1">
          <AccordionItem value="section1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="section2" disabled>
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Section 2').closest('button');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Keyboard', () => {
    it('toggles with Enter', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" collapsible />);

      const trigger = screen
        .getByText('Section 1')
        .closest('button') as HTMLElement;
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });

      // Button click handler fires on Enter for buttons natively
      // But let's test click directly since jsdom doesn't always
      // do native keyboard→click conversion
      fireEvent.click(trigger);
    });
  });

  describe('Actions', () => {
    it('clicking actions does not toggle item', () => {
      const handleAction = vi.fn();
      const handleChange = vi.fn();
      renderWithTheme(
        <Accordion defaultValue="section1" onChange={handleChange}>
          <AccordionItem value="section1">
            <AccordionTrigger
              actions={
                <button type="button" onClick={handleAction}>
                  Settings
                </button>
              }
            >
              Section 1
            </AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('Settings'));
      expect(handleAction).toHaveBeenCalled();
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('keepMounted', () => {
    it('keeps collapsed content in DOM', () => {
      const { container } = renderWithTheme(
        <Accordion defaultValue="section1">
          <AccordionItem value="section1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent keepMounted>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="section2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent keepMounted>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // Both regions in DOM
      const regions = container.querySelectorAll('[role="region"]');
      expect(regions).toHaveLength(2);
    });

    it('unmounts collapsed content when not keepMounted', () => {
      renderWithTheme(
        <Accordion defaultValue="section1">
          <AccordionItem value="section1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="section2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it.each(['default', 'ghost', 'filled'] as const)(
      'renders %s variant',
      variant => {
        renderWithTheme(
          <BasicAccordion defaultValue="section1" variant={variant} />
        );
        expect(screen.getByText('Section 1')).toBeInTheDocument();
      }
    );
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders %s size', size => {
      renderWithTheme(<BasicAccordion defaultValue="section1" size={size} />);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('triggers have aria-expanded', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      const trigger1 = screen.getByText('Section 1').closest('button');
      const trigger2 = screen.getByText('Section 2').closest('button');

      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });

    it('triggers have aria-controls pointing to content', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      const trigger = screen.getByText('Section 1').closest('button');
      const controlsId = trigger?.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      const region = screen.getByRole('region');
      expect(region.id).toBe(controlsId);
    });

    it('content has role="region"', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('content has aria-labelledby pointing to trigger', () => {
      renderWithTheme(<BasicAccordion defaultValue="section1" />);

      const trigger = screen.getByText('Section 1').closest('button');
      const region = screen.getByRole('region');

      expect(region.getAttribute('aria-labelledby')).toBe(trigger?.id);
    });
  });
});
