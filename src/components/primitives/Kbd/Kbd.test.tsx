import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Kbd } from './Kbd';
import { keycapRecipe } from './Kbd.css';

function getKeycaps(): HTMLElement[] {
  return Array.from(document.querySelectorAll('kbd'));
}

function getFirstKeycap(): HTMLElement {
  const keycap = getKeycaps()[0];
  if (!keycap) {
    throw new Error('Expected at least one keycap');
  }
  return keycap;
}

describe('Kbd', () => {
  describe('Rendering', () => {
    it('renders a single key from a string', () => {
      renderWithTheme(<Kbd>A</Kbd>);

      expect(screen.getByText('A').tagName).toBe('KBD');
    });

    it('splits shortcut strings into keycaps', () => {
      renderWithTheme(
        <Kbd glyphs={false} platform="windows">
          Ctrl+S
        </Kbd>
      );

      const keycaps = getKeycaps();
      expect(keycaps).toHaveLength(2);
      expect(keycaps.map(keycap => keycap.textContent)).toEqual(['Ctrl', 'S']);
    });

    it('renders array children as separate keycaps', () => {
      renderWithTheme(
        <Kbd glyphs={false} platform="windows">
          {['Ctrl', 'S']}
        </Kbd>
      );

      expect(getKeycaps().map(keycap => keycap.textContent)).toEqual([
        'Ctrl',
        'S',
      ]);
    });

    it('renders a custom separator between keycaps', () => {
      renderWithTheme(
        <Kbd glyphs={false} separator="→">
          Ctrl+S
        </Kbd>
      );

      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('renders no separator when separator is null', () => {
      renderWithTheme(
        <Kbd glyphs={false} separator={null}>
          Ctrl+S
        </Kbd>
      );

      expect(screen.queryByText('+')).not.toBeInTheDocument();
      expect(getKeycaps()).toHaveLength(2);
    });

    it('renders non-string children as one keycap', () => {
      renderWithTheme(
        <Kbd>
          <span data-testid="custom-key">Fn</span>
        </Kbd>
      );

      expect(getKeycaps()).toHaveLength(1);
      expect(screen.getByTestId('custom-key')).toBeInTheDocument();
    });

    it('forwards className, style, testId, and ref to the wrapper', () => {
      const ref = React.createRef<HTMLSpanElement>();

      renderWithTheme(
        <Kbd
          ref={ref}
          className="shortcut"
          style={{ marginLeft: 4 }}
          testId="kbd"
        >
          S
        </Kbd>
      );

      const root = screen.getByTestId('kbd');
      expect(root).toHaveClass('shortcut');
      expect(root).toHaveStyle({ marginLeft: '4px' });
      expect(ref.current).toBe(root);
    });
  });

  describe('Glyphs', () => {
    it('renders glyphs when glyphs is true', () => {
      renderWithTheme(
        <Kbd platform="mac" separator={null}>
          Cmd+S
        </Kbd>
      );

      expect(getKeycaps().map(keycap => keycap.textContent)).toEqual([
        '⌘',
        'S',
      ]);
    });

    it('renders literal keys when glyphs is false', () => {
      renderWithTheme(
        <Kbd glyphs={false} platform="mac">
          Cmd+S
        </Kbd>
      );

      expect(getKeycaps().map(keycap => keycap.textContent)).toEqual([
        'Cmd',
        'S',
      ]);
    });

    it('applies platform override regardless of detection', () => {
      renderWithTheme(<Kbd platform="windows">Cmd+S</Kbd>);

      expect(getKeycaps().map(keycap => keycap.textContent)).toEqual([
        'Ctrl',
        'S',
      ]);
    });
  });

  describe('Styles', () => {
    it.each([
      ['sm', '16px'],
      ['md', '20px'],
      ['lg', '24px'],
    ] as const)('applies %s size height', (size, expectedHeight) => {
      renderWithTheme(<Kbd size={size}>S</Kbd>);

      expect(window.getComputedStyle(getFirstKeycap()).height).toBe(
        expectedHeight
      );
    });

    it('applies solid variant styles', () => {
      renderWithTheme(<Kbd variant="solid">S</Kbd>);

      expect(getFirstKeycap()).toHaveClass(keycapRecipe({ variant: 'solid' }));
    });

    it('applies outline variant styles', () => {
      renderWithTheme(<Kbd variant="outline">S</Kbd>);

      expect(getFirstKeycap()).toHaveClass(
        keycapRecipe({ variant: 'outline' })
      );
    });

    it('applies ghost variant styles', () => {
      renderWithTheme(<Kbd variant="ghost">S</Kbd>);

      expect(getFirstKeycap()).toHaveClass(keycapRecipe({ variant: 'ghost' }));
    });
  });

  describe('Accessibility', () => {
    it('renders each keycap as a kbd element', () => {
      renderWithTheme(<Kbd platform="windows">Ctrl+Shift+S</Kbd>);

      expect(getKeycaps()).toHaveLength(3);
      for (const keycap of getKeycaps()) {
        expect(keycap.tagName).toBe('KBD');
      }
    });
  });
});
