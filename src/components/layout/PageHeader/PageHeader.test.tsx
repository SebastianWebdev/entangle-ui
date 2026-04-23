import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('renders a <header> element', () => {
      renderWithTheme(<PageHeader title="My Page" testId="root" />);
      const root = screen.getByTestId('root');
      expect(root.tagName).toBe('HEADER');
    });

    it('renders title, subtitle, breadcrumbs, icon, and actions', () => {
      renderWithTheme(
        <PageHeader
          title="Title"
          subtitle="Subtitle"
          breadcrumbs={<nav>Home / Project</nav>}
          icon={<svg data-testid="icon" />}
          actions={<button>Save</button>}
        />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Home / Project')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('bordered={false} removes the bottom border', () => {
      const { container: borderedContainer } = renderWithTheme(
        <PageHeader title="A" />
      );
      const { container: plainContainer } = renderWithTheme(
        <PageHeader title="B" bordered={false} />
      );
      expect(borderedContainer.querySelector('header')?.className).not.toEqual(
        plainContainer.querySelector('header')?.className
      );
    });
  });

  describe('Sizes', () => {
    it('renders each size without error', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(
          <PageHeader size={size} title={size} />
        );
        expect(screen.getByText(size)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Accessibility', () => {
    it('forwards ref', () => {
      const ref = React.createRef<HTMLElement>();
      renderWithTheme(<PageHeader ref={ref} title="Page" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
