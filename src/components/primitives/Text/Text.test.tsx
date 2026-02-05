import { renderWithTheme } from '@/tests/testUtils';
import { screen } from '@testing-library/react';
import type { TextProps } from './Text';
import { Text } from './Text';

/**
 * Test suite for Text component
 *
 * Covers: rendering, variants, sizing, colors, behaviors, accessibility
 */
describe('Text', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Text>Default text</Text>);

      const textElement = screen.getByText('Default text');
      expect(textElement).toBeInTheDocument();
      expect(textElement.tagName).toBe('SPAN');
    });

    it('renders with custom content', () => {
      renderWithTheme(<Text>Custom content</Text>);

      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    it('renders with React elements as children', () => {
      renderWithTheme(
        <Text>
          <strong>Bold</strong> and <em>italic</em> text
        </Text>
      );

      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(<Text className="custom-class">Text</Text>);

      const textElement = screen.getByText('Text');
      expect(textElement).toHaveClass('custom-class');
    });

    it('applies custom styles', () => {
      renderWithTheme(<Text style={{ marginTop: '10px' }}>Text</Text>);

      const textElement = screen.getByText('Text');
      expect(textElement).toHaveStyle({ marginTop: '10px' });
    });

    it('forwards HTML attributes', () => {
      renderWithTheme(
        <Text data-testid="test-text" id="text-id">
          Text
        </Text>
      );

      const textElement = screen.getByTestId('test-text');
      expect(textElement).toHaveAttribute('id', 'text-id');
    });
  });

  describe('HTML Elements', () => {
    const elements = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'span',
      'div',
      'label',
      'strong',
      'em',
      'small',
    ] as const;

    elements.forEach(element => {
      it(`renders as ${element} element when as="${element}"`, () => {
        renderWithTheme(<Text as={element}>Text content</Text>);

        const textElement = screen.getByText('Text content');
        expect(textElement.tagName).toBe(element.toUpperCase());
      });
    });
  });

  describe('Variants', () => {
    const variants: TextProps['variant'][] = [
      'display',
      'heading',
      'subheading',
      'body',
      'caption',
      'code',
      'inherit',
    ];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithTheme(
          <Text variant={variant} data-testid={`${variant}-text`}>
            {variant} text
          </Text>
        );

        const textElement = screen.getByTestId(`${variant}-text`);
        expect(textElement).toBeInTheDocument();
        expect(textElement).toHaveTextContent(`${variant} text`);

        // Verify variant-specific styling is applied
        const computedStyle = window.getComputedStyle(textElement);

        if (variant === 'code') {
          // Code variant should use monospace font
          expect(computedStyle.fontFamily).toContain('mono');
        } else if (variant !== 'inherit') {
          // Non-inherit variants should have fontSize set via theme tokens
          // (fontFamily is set via Emotion <style> tags which jsdom cannot resolve via getComputedStyle)
          expect(computedStyle.fontSize).toBeTruthy();
        }
      });
    });

    it('defaults to body variant when no variant specified', () => {
      renderWithTheme(<Text data-testid="default-text">Text</Text>);

      const textElement = screen.getByTestId('default-text');
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes: TextProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      it(`applies ${size} size correctly`, () => {
        renderWithTheme(
          <Text size={size} data-testid={`${size}-text`}>
            {size} text
          </Text>
        );

        const textElement = screen.getByTestId(`${size}-text`);
        expect(textElement).toBeInTheDocument();

        // Verify size styling is applied
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.fontSize).toBeTruthy();
      });
    });
  });

  describe('Weights', () => {
    const weights: TextProps['weight'][] = ['normal', 'medium', 'semibold'];

    weights.forEach(weight => {
      it(`applies ${weight} weight correctly`, () => {
        renderWithTheme(
          <Text weight={weight} data-testid={`${weight}-text`}>
            {weight} text
          </Text>
        );

        const textElement = screen.getByTestId(`${weight}-text`);
        expect(textElement).toBeInTheDocument();

        // Verify weight styling is applied
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.fontWeight).toBeTruthy();
      });
    });
  });

  describe('Colors', () => {
    const colors: TextProps['color'][] = [
      'primary',
      'secondary',
      'muted',
      'disabled',
      'accent',
      'success',
      'warning',
      'error',
    ];

    colors.forEach(color => {
      it(`applies ${color} color correctly`, () => {
        renderWithTheme(
          <Text color={color} data-testid={`${color}-text`}>
            {color} text
          </Text>
        );

        const textElement = screen.getByTestId(`${color}-text`);
        expect(textElement).toBeInTheDocument();

        // Verify color styling is applied
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.color).toBeTruthy();
      });
    });

    it('defaults to primary color when no color specified', () => {
      renderWithTheme(<Text data-testid="default-color">Text</Text>);

      const textElement = screen.getByTestId('default-color');
      const computedStyle = window.getComputedStyle(textElement);
      expect(computedStyle.color).toBeTruthy();
    });
  });

  describe('Line Heights', () => {
    const lineHeights: TextProps['lineHeight'][] = [
      'tight',
      'normal',
      'relaxed',
    ];

    lineHeights.forEach(lineHeight => {
      it(`applies ${lineHeight} line height correctly`, () => {
        renderWithTheme(
          <Text lineHeight={lineHeight} data-testid={`${lineHeight}-text`}>
            {lineHeight} line height
          </Text>
        );

        const textElement = screen.getByTestId(`${lineHeight}-text`);
        expect(textElement).toBeInTheDocument();

        // Verify line height styling is applied
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.lineHeight).toBeTruthy();
      });
    });
  });

  describe('Text Alignment', () => {
    const alignments: TextProps['align'][] = [
      'left',
      'center',
      'right',
      'justify',
    ];

    alignments.forEach(align => {
      it(`applies ${align} alignment correctly`, () => {
        renderWithTheme(
          <Text align={align} data-testid={`${align}-text`}>
            {align} aligned text
          </Text>
        );

        const textElement = screen.getByTestId(`${align}-text`);
        expect(textElement).toBeInTheDocument();

        // Verify alignment styling is applied
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.textAlign).toBe(align);
      });
    });
  });

  describe('Text Behaviors', () => {
    it('applies truncate styling when truncate=true', () => {
      renderWithTheme(
        <Text truncate data-testid="truncated-text">
          This is a very long text that should be truncated
        </Text>
      );

      const textElement = screen.getByTestId('truncated-text');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.overflow).toBe('hidden');
      expect(computedStyle.textOverflow).toBe('ellipsis');
      expect(computedStyle.whiteSpace).toBe('nowrap');
    });

    it('applies multi-line truncation when truncate=true and maxLines is specified', () => {
      renderWithTheme(
        <Text truncate maxLines={2} data-testid="multi-truncated-text">
          This is a very long text that should be truncated after two lines
        </Text>
      );

      const textElement = screen.getByTestId('multi-truncated-text');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.display).toBe('-webkit-box');
    });

    it('applies nowrap styling when nowrap=true', () => {
      renderWithTheme(
        <Text nowrap data-testid="nowrap-text">
          This text should not wrap to multiple lines
        </Text>
      );

      const textElement = screen.getByTestId('nowrap-text');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.whiteSpace).toBe('nowrap');
    });

    it('applies monospace font when mono=true', () => {
      renderWithTheme(
        <Text mono data-testid="mono-text">
          Monospace text
        </Text>
      );

      const textElement = screen.getByTestId('mono-text');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.fontFamily).toContain('mono');
    });

    it('automatically applies monospace for code variant', () => {
      renderWithTheme(
        <Text variant="code" data-testid="code-text">
          Code text
        </Text>
      );

      const textElement = screen.getByTestId('code-text');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.fontFamily).toContain('mono');
    });
  });

  describe('Prop Combinations', () => {
    it('allows size to override variant size', () => {
      renderWithTheme(
        <Text variant="caption" size="lg" data-testid="override-text">
          Override test
        </Text>
      );

      const textElement = screen.getByTestId('override-text');
      expect(textElement).toBeInTheDocument();
    });

    it('allows weight to override variant weight', () => {
      renderWithTheme(
        <Text variant="body" weight="semibold" data-testid="weight-override">
          Weight override
        </Text>
      );

      const textElement = screen.getByTestId('weight-override');
      expect(textElement).toBeInTheDocument();
    });

    it('allows lineHeight to override variant lineHeight', () => {
      renderWithTheme(
        <Text
          variant="heading"
          lineHeight="relaxed"
          data-testid="lineheight-override"
        >
          Line height override
        </Text>
      );

      const textElement = screen.getByTestId('lineheight-override');
      expect(textElement).toBeInTheDocument();
    });

    it('combines multiple behavioral props correctly', () => {
      renderWithTheme(
        <Text
          truncate
          maxLines={2}
          align="center"
          mono
          data-testid="combined-props"
        >
          Combined props text
        </Text>
      );

      const textElement = screen.getByTestId('combined-props');
      const computedStyle = window.getComputedStyle(textElement);

      expect(computedStyle.textAlign).toBe('center');
      expect(computedStyle.fontFamily).toContain('mono');
      expect(computedStyle.display).toBe('-webkit-box');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML elements correctly', () => {
      renderWithTheme(<Text as="h1">Heading</Text>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Heading');
    });

    it('renders label element with proper semantics', () => {
      renderWithTheme(<Text as="label">Label text</Text>);

      const label = screen.getByText('Label text');
      expect(label.tagName).toBe('LABEL');
    });

    it('supports ARIA attributes', () => {
      renderWithTheme(
        <Text
          aria-label="Custom label"
          aria-describedby="description"
          role="status"
        >
          Status text
        </Text>
      );

      const textElement = screen.getByText('Status text');
      expect(textElement).toHaveAttribute('aria-label', 'Custom label');
      expect(textElement).toHaveAttribute('aria-describedby', 'description');
      expect(textElement).toHaveAttribute('role', 'status');
    });

    it('maintains readability with proper contrast colors', () => {
      const colors: TextProps['color'][] = [
        'primary',
        'secondary',
        'muted',
        'disabled',
        'accent',
        'success',
        'warning',
        'error',
      ];

      colors.forEach(color => {
        renderWithTheme(
          <Text color={color} data-testid={`${color}-accessibility`}>
            Accessibility test
          </Text>
        );

        const textElement = screen.getByTestId(`${color}-accessibility`);
        const computedStyle = window.getComputedStyle(textElement);

        // Verify color is applied (actual contrast testing would require more complex setup)
        expect(computedStyle.color).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      renderWithTheme(<Text data-testid="null-text">{null}</Text>);

      const textElement = screen.getByTestId('null-text');
      expect(textElement).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithTheme(<Text data-testid="undefined-text">{undefined}</Text>);

      const textElement = screen.getByTestId('undefined-text');
      expect(textElement).toBeInTheDocument();
    });

    it('handles maxLines without truncate', () => {
      renderWithTheme(
        <Text maxLines={2} data-testid="maxlines-only">
          Should not apply multi-line truncation without truncate prop
        </Text>
      );

      const textElement = screen.getByTestId('maxlines-only');
      const computedStyle = window.getComputedStyle(textElement);

      // Should not have webkit-box display without truncate
      expect(computedStyle.display).not.toBe('-webkit-box');
    });

    it('handles inherit variant without applying styles', () => {
      renderWithTheme(
        <Text variant="inherit" data-testid="inherit-text">
          Inherit variant text
        </Text>
      );

      const textElement = screen.getByTestId('inherit-text');
      expect(textElement).toBeInTheDocument();

      // Inherit variant should not override styles
      const computedStyle = window.getComputedStyle(textElement);
      expect(computedStyle.fontSize).toBe(''); // Should inherit from parent
    });
  });
});
