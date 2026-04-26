import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator,
} from './index';

const FiveItemTrail = ({
  maxItems,
  itemsBeforeCollapse,
  itemsAfterCollapse,
  expandable,
}: {
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  expandable?: boolean;
}) => (
  <Breadcrumbs
    maxItems={maxItems}
    itemsBeforeCollapse={itemsBeforeCollapse}
    itemsAfterCollapse={itemsAfterCollapse}
    expandable={expandable}
  >
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/components">Components</BreadcrumbItem>
    <BreadcrumbItem href="/components/navigation">Navigation</BreadcrumbItem>
    <BreadcrumbItem href="/components/navigation/breadcrumbs">
      Breadcrumbs
    </BreadcrumbItem>
    <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
  </Breadcrumbs>
);

describe('Breadcrumbs', () => {
  describe('Rendering', () => {
    it('renders a breadcrumb navigation landmark', () => {
      renderWithTheme(
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
        </Breadcrumbs>
      );

      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
      expect(document.querySelector('ol')).toBeInTheDocument();
    });

    it('auto-inserts separators between breadcrumb items', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/components">Components</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
        </Breadcrumbs>
      );

      expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(
        2
      );
    });

    it('does not auto-insert separators when explicit separators are provided', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
        </Breadcrumbs>
      );

      expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(
        1
      );
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('uses the custom separator prop for auto-inserted separators', () => {
      renderWithTheme(
        <Breadcrumbs separator="/">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/components">Components</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
        </Breadcrumbs>
      );

      expect(screen.getAllByText('/')).toHaveLength(2);
    });
  });

  describe('Collapse', () => {
    it('does not collapse when maxItems is 0', () => {
      renderWithTheme(<FiveItemTrail maxItems={0} />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.queryByLabelText('Show all breadcrumbs')).toBeNull();
    });

    it('collapses when item count is greater than maxItems', () => {
      renderWithTheme(<FiveItemTrail maxItems={4} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('Components')).toBeNull();
      expect(screen.queryByText('Navigation')).toBeNull();
      expect(screen.getByText('Breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByLabelText('Show all breadcrumbs')).toBeInTheDocument();
    });

    it('does not collapse when item count equals maxItems', () => {
      renderWithTheme(
        <Breadcrumbs maxItems={4}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/components">Components</BreadcrumbItem>
          <BreadcrumbItem href="/components/navigation">
            Navigation
          </BreadcrumbItem>
          <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
        </Breadcrumbs>
      );

      expect(screen.getByText('Components')).toBeInTheDocument();
      expect(screen.queryByLabelText('Show all breadcrumbs')).toBeNull();
    });

    it('honors itemsBeforeCollapse and itemsAfterCollapse', () => {
      renderWithTheme(
        <FiveItemTrail
          maxItems={3}
          itemsBeforeCollapse={2}
          itemsAfterCollapse={1}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Components')).toBeInTheDocument();
      expect(screen.queryByText('Navigation')).toBeNull();
      expect(screen.queryByText('Breadcrumbs')).toBeNull();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('expands collapsed items when the ellipsis is clicked', () => {
      renderWithTheme(<FiveItemTrail maxItems={4} expandable />);

      fireEvent.click(screen.getByLabelText('Show all breadcrumbs'));

      expect(screen.getByText('Components')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.queryByLabelText('Show all breadcrumbs')).toBeNull();
    });

    it('renders a non-interactive ellipsis when expandable is false', () => {
      renderWithTheme(<FiveItemTrail maxItems={4} expandable={false} />);

      expect(screen.getByText('…')).toBeInTheDocument();
      expect(screen.queryByLabelText('Show all breadcrumbs')).toBeNull();
    });
  });

  describe('Sizes', () => {
    it('applies a distinct class for each size', () => {
      const { rerender } = renderWithTheme(
        <Breadcrumbs size="sm" testId="breadcrumbs">
          <BreadcrumbItem isCurrent>Small</BreadcrumbItem>
        </Breadcrumbs>
      );
      const smClass = screen.getByTestId('breadcrumbs').className;

      rerender(
        <Breadcrumbs size="md" testId="breadcrumbs">
          <BreadcrumbItem isCurrent>Medium</BreadcrumbItem>
        </Breadcrumbs>
      );
      const mdClass = screen.getByTestId('breadcrumbs').className;

      rerender(
        <Breadcrumbs size="lg" testId="breadcrumbs">
          <BreadcrumbItem isCurrent>Large</BreadcrumbItem>
        </Breadcrumbs>
      );
      const lgClass = screen.getByTestId('breadcrumbs').className;

      expect(smClass).not.toEqual(mdClass);
      expect(mdClass).not.toEqual(lgClass);
    });
  });
});

describe('BreadcrumbItem', () => {
  it('renders as an anchor when href is provided', () => {
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'href',
      '/components'
    );
  });

  it('renders as a button-like span when only onClick is provided', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem onClick={handleClick}>Project</BreadcrumbItem>
      </Breadcrumbs>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Project' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders current item as plain text with aria-current', () => {
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(
      screen.getByText('Button').closest('[aria-current]')
    ).toHaveAttribute('aria-current', 'page');
  });

  it('renders an icon before the label', () => {
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem icon={<svg data-testid="item-icon" />} isCurrent>
          Assets
        </BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByTestId('item-icon')).toBeInTheDocument();
  });

  it('truncates long string labels', () => {
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem href="/long" maxLength={8}>
          Very long label
        </BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByText('Very lo…')).toBeInTheDocument();
    expect(screen.queryByText('Very long label')).toBeNull();
  });

  it('renders disabled text when neither href, onClick, nor isCurrent is provided', () => {
    renderWithTheme(
      <Breadcrumbs>
        <BreadcrumbItem>Disabled</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByText('Disabled').closest('span')).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('BreadcrumbEllipsis', () => {
  it('renders an ellipsis character', () => {
    renderWithTheme(<BreadcrumbEllipsis />);

    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithTheme(<BreadcrumbEllipsis onClick={handleClick} />);

    fireEvent.click(screen.getByLabelText('Show all breadcrumbs'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with tooltip wiring when provided', () => {
    renderWithTheme(<BreadcrumbEllipsis tooltip="Components / Navigation" />);

    expect(screen.getByText('…')).toBeInTheDocument();
  });
});
