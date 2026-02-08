import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ColorPicker } from './ColorPicker';
import { ColorSwatch } from './ColorSwatch';
import { EyeDropper } from './EyeDropper';
import { ColorPalette } from './ColorPalette';
import { MATERIAL_PALETTE } from './palettes/material';
import { TAILWIND_PALETTE } from './palettes/tailwind';
import type { PaletteColor } from './palettes';
import {
  hsvToRgb,
  rgbToHsv,
  hsvToHsl,
  hslToHsv,
  rgbToHex,
  hexToRgb,
  parseColor,
  formatColor,
  isValidHex,
  getContrastColor,
} from './colorUtils';

// =====================================================
// colorUtils unit tests
// =====================================================

describe('colorUtils', () => {
  describe('hsvToRgb / rgbToHsv round-trip', () => {
    it('converts pure red', () => {
      const rgb = hsvToRgb(0, 100, 100);
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
      const hsv = rgbToHsv(255, 0, 0);
      expect(hsv).toEqual({ h: 0, s: 100, v: 100 });
    });

    it('converts pure green', () => {
      const rgb = hsvToRgb(120, 100, 100);
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('converts pure blue', () => {
      const rgb = hsvToRgb(240, 100, 100);
      expect(rgb).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('converts black', () => {
      const rgb = hsvToRgb(0, 0, 0);
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('converts white', () => {
      const rgb = hsvToRgb(0, 0, 100);
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('hsvToHsl / hslToHsv round-trip', () => {
    it('converts full saturation', () => {
      const hsl = hsvToHsl(0, 100, 100);
      expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    });

    it('round-trips accurately', () => {
      const original = { h: 210, s: 80, v: 70 };
      const hsl = hsvToHsl(original.h, original.s, original.v);
      const back = hslToHsv(hsl.h, hsl.s, hsl.l);
      expect(back.h).toBeCloseTo(original.h, 0);
      expect(back.s).toBeCloseTo(original.s, -1);
      expect(back.v).toBeCloseTo(original.v, -1);
    });
  });

  describe('hexToRgb / rgbToHex', () => {
    it('converts 6-char hex', () => {
      const rgb = hexToRgb('#ff8800');
      expect(rgb).toEqual({ r: 255, g: 136, b: 0 });
    });

    it('converts 3-char hex', () => {
      const rgb = hexToRgb('#f80');
      expect(rgb).toEqual({ r: 255, g: 136, b: 0 });
    });

    it('converts 8-char hex with alpha', () => {
      const rgb = hexToRgb('#ff880080');
      expect(rgb).not.toBeNull();
      expect(rgb?.r).toBe(255);
      expect(rgb?.g).toBe(136);
      expect(rgb?.b).toBe(0);
      expect(rgb?.a).toBeCloseTo(0.5, 1);
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('#xyz')).toBeNull();
    });

    it('rgbToHex produces correct output', () => {
      expect(rgbToHex(255, 136, 0)).toBe('#ff8800');
    });
  });

  describe('parseColor', () => {
    it('parses hex', () => {
      const result = parseColor('#ff0000');
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
      expect(result.a).toBe(1);
    });

    it('parses rgb()', () => {
      const result = parseColor('rgb(0, 255, 0)');
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    it('parses rgba()', () => {
      const result = parseColor('rgba(0, 0, 255, 0.5)');
      expect(result.h).toBe(240);
      expect(result.a).toBe(0.5);
    });

    it('parses hsl()', () => {
      const result = parseColor('hsl(120, 100%, 50%)');
      expect(result.h).toBe(120);
    });

    it('parses named colors', () => {
      const result = parseColor('red');
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    it('fallback for invalid color', () => {
      const result = parseColor('not-a-color');
      expect(result.h).toBe(210);
    });
  });

  describe('formatColor', () => {
    const hsva = { h: 0, s: 100, v: 100, a: 1 };

    it('formats hex', () => {
      expect(formatColor(hsva, 'hex')).toBe('#ff0000');
    });

    it('formats hex8', () => {
      expect(formatColor(hsva, 'hex8')).toBe('#ff0000ff');
    });

    it('formats rgb', () => {
      expect(formatColor(hsva, 'rgb')).toBe('rgb(255, 0, 0)');
    });

    it('formats rgba', () => {
      expect(formatColor({ ...hsva, a: 0.5 }, 'rgba')).toBe(
        'rgba(255, 0, 0, 0.5)'
      );
    });

    it('formats hsl', () => {
      expect(formatColor(hsva, 'hsl')).toBe('hsl(0, 100%, 50%)');
    });

    it('formats hsla', () => {
      expect(formatColor({ ...hsva, a: 0.75 }, 'hsla')).toBe(
        'hsla(0, 100%, 50%, 0.75)'
      );
    });
  });

  describe('isValidHex', () => {
    it('validates 3-char hex', () => {
      expect(isValidHex('#fff')).toBe(true);
    });

    it('validates 6-char hex', () => {
      expect(isValidHex('#ff8800')).toBe(true);
    });

    it('validates 8-char hex', () => {
      expect(isValidHex('#ff880080')).toBe(true);
    });

    it('rejects invalid hex', () => {
      expect(isValidHex('#xyz')).toBe(false);
    });

    it('works without #', () => {
      expect(isValidHex('ff8800')).toBe(true);
    });
  });

  describe('getContrastColor', () => {
    it('returns white for dark colors', () => {
      expect(getContrastColor('#000000')).toBe('white');
    });

    it('returns black for light colors', () => {
      expect(getContrastColor('#ffffff')).toBe('black');
    });
  });
});

// =====================================================
// ColorSwatch tests
// =====================================================

describe('ColorSwatch', () => {
  it('renders with the specified color', () => {
    renderWithTheme(<ColorSwatch color="#ff0000" testId="swatch" />);
    expect(screen.getByTestId('swatch')).toBeInTheDocument();
  });

  it('has aria-label with color value', () => {
    renderWithTheme(<ColorSwatch color="#ff0000" testId="swatch" />);
    expect(screen.getByTestId('swatch')).toHaveAttribute(
      'aria-label',
      'Color: #ff0000'
    );
  });

  it('accepts custom aria-label', () => {
    renderWithTheme(
      <ColorSwatch color="#ff0000" aria-label="Primary color" testId="swatch" />
    );
    expect(screen.getByTestId('swatch')).toHaveAttribute(
      'aria-label',
      'Primary color'
    );
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <ColorSwatch color="#ff0000" onClick={onClick} testId="swatch" />
    );
    fireEvent.click(screen.getByTestId('swatch'));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    renderWithTheme(<ColorSwatch color="#ff0000" disabled testId="swatch" />);
    expect(screen.getByTestId('swatch')).toBeDisabled();
  });
});

// =====================================================
// ColorPicker component tests
// =====================================================

describe('ColorPicker', () => {
  describe('Rendering', () => {
    it('renders the swatch trigger', () => {
      renderWithTheme(<ColorPicker testId="cp" defaultValue="#ff0000" />);
      expect(screen.getByTestId('cp-swatch')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      renderWithTheme(<ColorPicker testId="cp" label="Background" />);
      expect(screen.getByText('Background')).toBeInTheDocument();
    });

    it('does not render picker panel when closed', () => {
      renderWithTheme(<ColorPicker testId="cp" />);
      expect(screen.queryByTestId('cp-panel')).not.toBeInTheDocument();
    });

    it('opens picker panel on swatch click', () => {
      renderWithTheme(<ColorPicker testId="cp" />);
      fireEvent.click(screen.getByTestId('cp-swatch'));
      expect(screen.getByTestId('cp-panel')).toBeInTheDocument();
    });
  });

  describe('Disabled', () => {
    it('swatch is disabled when disabled prop is set', () => {
      renderWithTheme(<ColorPicker testId="cp" disabled />);
      expect(screen.getByTestId('cp-swatch')).toBeDisabled();
    });
  });

  describe('Inline mode', () => {
    it('renders picker panel directly without popover', () => {
      renderWithTheme(<ColorPicker testId="cp" inline />);
      expect(screen.getByTestId('cp-panel')).toBeInTheDocument();
    });

    it('does not render swatch in inline mode', () => {
      renderWithTheme(<ColorPicker testId="cp" inline />);
      expect(screen.queryByTestId('cp-swatch')).not.toBeInTheDocument();
    });
  });

  describe('Presets', () => {
    it('renders preset swatches', () => {
      const presets = [
        { color: '#ff0000', label: 'Red' },
        { color: '#00ff00', label: 'Green' },
        { color: '#0000ff', label: 'Blue' },
      ];
      renderWithTheme(<ColorPicker testId="cp" inline presets={presets} />);
      expect(screen.getByTitle('Red')).toBeInTheDocument();
      expect(screen.getByTitle('Green')).toBeInTheDocument();
      expect(screen.getByTitle('Blue')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('color area has role="slider"', () => {
      renderWithTheme(<ColorPicker testId="cp" inline />);
      const sliders = screen.getAllByRole('slider');
      const colorArea = sliders.find(
        s => s.getAttribute('aria-label') === 'Color saturation and brightness'
      );
      expect(colorArea).toBeInTheDocument();
    });

    it('hue slider has role="slider"', () => {
      renderWithTheme(<ColorPicker testId="cp" inline />);
      const sliders = screen.getAllByRole('slider');
      const hueSlider = sliders.find(
        s => s.getAttribute('aria-label') === 'Hue'
      );
      expect(hueSlider).toBeInTheDocument();
    });

    it('alpha slider is shown when showAlpha is true', () => {
      renderWithTheme(<ColorPicker testId="cp" inline showAlpha />);
      const sliders = screen.getAllByRole('slider');
      const alphaSlider = sliders.find(
        s => s.getAttribute('aria-label') === 'Opacity'
      );
      expect(alphaSlider).toBeInTheDocument();
    });

    it('alpha slider is hidden when showAlpha is false', () => {
      renderWithTheme(<ColorPicker testId="cp" inline />);
      const sliders = screen.getAllByRole('slider');
      const alphaSlider = sliders.find(
        s => s.getAttribute('aria-label') === 'Opacity'
      );
      expect(alphaSlider).toBeUndefined();
    });
  });
});

// =====================================================
// EyeDropper tests
// =====================================================

describe('EyeDropper', () => {
  // Note: EyeDropper API is not available in jsdom, so the component returns null

  it('renders nothing when EyeDropper API is not available', () => {
    const { container } = renderWithTheme(<EyeDropper onColorPick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders button when EyeDropper API is available', () => {
    // Mock EyeDropper API
    const win = window as unknown as Record<string, unknown>;
    const original = win['EyeDropper'];
    win['EyeDropper'] = class {
      open() {
        return Promise.resolve({ sRGBHex: '#ff0000' });
      }
    };

    renderWithTheme(<EyeDropper onColorPick={vi.fn()} testId="ed" />);
    expect(screen.getByTestId('ed')).toBeInTheDocument();
    expect(screen.getByLabelText('Pick color from screen')).toBeInTheDocument();

    // Cleanup
    if (original) {
      win['EyeDropper'] = original;
    } else {
      delete win['EyeDropper'];
    }
  });

  it('is disabled when disabled prop is set', () => {
    const win = window as unknown as Record<string, unknown>;
    const original = win['EyeDropper'];
    win['EyeDropper'] = class {
      open() {
        return Promise.resolve({ sRGBHex: '#ff0000' });
      }
    };

    renderWithTheme(<EyeDropper onColorPick={vi.fn()} disabled testId="ed" />);
    expect(screen.getByTestId('ed')).toBeDisabled();

    if (original) {
      win['EyeDropper'] = original;
    } else {
      delete win['EyeDropper'];
    }
  });
});

// =====================================================
// ColorPalette tests
// =====================================================

describe('ColorPalette', () => {
  const testPalette: PaletteColor[] = [
    {
      name: 'Red',
      shades: [
        { label: '100', color: '#FFCDD2' },
        { label: '500', color: '#F44336' },
        { label: '900', color: '#B71C1C' },
      ],
    },
    {
      name: 'Blue',
      shades: [
        { label: '100', color: '#BBDEFB' },
        { label: '500', color: '#2196F3' },
        { label: '900', color: '#0D47A1' },
      ],
    },
  ];

  it('starts collapsed by default', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
      />
    );
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText('Palette')).toBeInTheDocument();
  });

  it('expands when header is clicked', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Palette'));
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders palette container with radiogroup role when expanded', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders shade buttons for each color', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(6); // 2 colors x 3 shades
  });

  it('marks the current color as checked', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    const checked = screen.getByRole('radio', { checked: true });
    expect(checked).toHaveAttribute('aria-label', 'Red 500');
  });

  it('calls onSelect when a shade is clicked', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={onSelect}
        defaultExpanded
      />
    );
    fireEvent.click(screen.getByLabelText('Blue 500'));
    expect(onSelect).toHaveBeenCalledWith('#2196F3');
  });

  it('renders color name labels', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    // Labels show first 2 chars: "Re" for Red, "Bl" for Blue
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Bl')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    renderWithTheme(
      <ColorPalette
        palette={testPalette}
        currentColor="#F44336"
        onSelect={vi.fn()}
        title="Material"
      />
    );
    expect(screen.getByText('Material')).toBeInTheDocument();
  });

  it('renders Material palette without errors', () => {
    renderWithTheme(
      <ColorPalette
        palette={MATERIAL_PALETTE}
        currentColor="#F44336"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders Tailwind palette without errors', () => {
    renderWithTheme(
      <ColorPalette
        palette={TAILWIND_PALETTE}
        currentColor="#EF4444"
        onSelect={vi.fn()}
        defaultExpanded
      />
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });
});

// =====================================================
// ColorPicker — palette integration tests
// =====================================================

describe('ColorPicker — palette integration', () => {
  it('renders palette header when palette="material"', () => {
    renderWithTheme(<ColorPicker testId="cp" inline palette="material" />);
    expect(screen.getByText('Palette')).toBeInTheDocument();
  });

  it('expands material palette on click', () => {
    renderWithTheme(<ColorPicker testId="cp" inline palette="material" />);
    fireEvent.click(screen.getByText('Palette'));
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders tailwind palette header', () => {
    renderWithTheme(<ColorPicker testId="cp" inline palette="tailwind" />);
    expect(screen.getByText('Palette')).toBeInTheDocument();
  });

  it('renders custom palette', () => {
    const custom: PaletteColor[] = [
      {
        name: 'Brand',
        shades: [
          { label: 'light', color: '#aaccff' },
          { label: 'dark', color: '#003366' },
        ],
      },
    ];
    renderWithTheme(<ColorPicker testId="cp" inline palette={custom} />);
    fireEvent.click(screen.getByText('Palette'));
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('does not render palette when palette prop is not set', () => {
    renderWithTheme(<ColorPicker testId="cp" inline />);
    expect(screen.queryByText('Palette')).not.toBeInTheDocument();
  });
});
