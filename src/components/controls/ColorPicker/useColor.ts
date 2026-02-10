import { useCallback, useMemo, useState } from 'react';
import {
  formatColor,
  hsvToRgb,
  hsvToHsl,
  parseColor,
  rgbToHex,
} from './colorUtils';
import type { ColorHSVA, ColorFormat } from './colorUtils';

interface UseColorOptions {
  value?: string;
  defaultValue?: string;
  format?: ColorFormat;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
}

interface UseColorReturn {
  hsva: ColorHSVA;
  setHue: (h: number) => void;
  setSaturationValue: (s: number, v: number) => void;
  setAlpha: (a: number) => void;
  setFromString: (color: string) => void;
  commitChange: () => void;
  hexString: string;
  rgbString: string;
  hslString: string;
  outputString: string;
}

export function useColor({
  value,
  defaultValue = '#007acc',
  format = 'hex',
  onChange,
  onChangeComplete,
}: UseColorOptions): UseColorReturn {
  const [internalHsva, setInternalHsva] = useState<ColorHSVA>(() =>
    parseColor(value ?? defaultValue)
  );

  const isControlled = value !== undefined;
  const parsedControlled = useMemo(
    () => (value !== undefined ? parseColor(value) : null),
    [value]
  );
  const hsva = parsedControlled ?? internalHsva;

  const updateColor = useCallback(
    (newHsva: ColorHSVA) => {
      if (!isControlled) {
        setInternalHsva(newHsva);
      }
      onChange?.(formatColor(newHsva, format));
    },
    [isControlled, onChange, format]
  );

  const setHue = useCallback(
    (h: number) => {
      updateColor({ ...hsva, h: Math.max(0, Math.min(360, h)) });
    },
    [hsva, updateColor]
  );

  const setSaturationValue = useCallback(
    (s: number, v: number) => {
      updateColor({
        ...hsva,
        s: Math.max(0, Math.min(100, s)),
        v: Math.max(0, Math.min(100, v)),
      });
    },
    [hsva, updateColor]
  );

  const setAlpha = useCallback(
    (a: number) => {
      updateColor({ ...hsva, a: Math.max(0, Math.min(1, a)) });
    },
    [hsva, updateColor]
  );

  const setFromString = useCallback(
    (color: string) => {
      const parsed = parseColor(color);
      updateColor(parsed);
    },
    [updateColor]
  );

  const commitChange = useCallback(() => {
    onChangeComplete?.(formatColor(hsva, format));
  }, [hsva, format, onChangeComplete]);

  const hexString = useMemo(() => {
    const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
    return rgbToHex(r, g, b);
  }, [hsva.h, hsva.s, hsva.v]);

  const rgbString = useMemo(() => {
    const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
    return `rgb(${r}, ${g}, ${b})`;
  }, [hsva.h, hsva.s, hsva.v]);

  const hslString = useMemo(() => {
    const hsl = hsvToHsl(hsva.h, hsva.s, hsva.v);
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }, [hsva.h, hsva.s, hsva.v]);

  const outputString = useMemo(() => formatColor(hsva, format), [hsva, format]);

  return {
    hsva,
    setHue,
    setSaturationValue,
    setAlpha,
    setFromString,
    commitChange,
    hexString,
    rgbString,
    hslString,
    outputString,
  };
}
