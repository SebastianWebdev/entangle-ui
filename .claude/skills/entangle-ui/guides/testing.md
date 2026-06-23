# Testing

> How to test an application built with Entangle UI — Vitest + jsdom setup, loading the theme so CSS variables resolve, and stubbing the browser observers that editor components rely on.

Entangle UI components are plain React components, so any React testing stack works. Two things differ from testing hand-written components, and both have a one-time setup:

1. The library ships **side-effect CSS imports** (each component pulls in its own stylesheet), so your test runner must _transform_ the package instead of externalizing it.
2. Components read design tokens from `--etui-*` **CSS custom properties on `:root`**, and several editor components use browser observers (`ResizeObserver`, `IntersectionObserver`, `matchMedia`) that jsdom does not implement.

This guide uses [Vitest](https://vitest.dev/) + [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/) (the same stack the library itself uses), but the concepts map directly to Jest.

## Vitest configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: ['./test/setup.ts'],
    // Entangle UI is ESM-only and imports its CSS as a side effect
    // (`import './Button.css'`). Vitest externalizes `node_modules` by default,
    // and Node cannot import a `.css` file as a module — so the package must be
    // inlined to run through Vitest's transform pipeline.
    server: {
      deps: {
        inline: ['entangle-ui'],
      },
    },
  },
});
```

- **`environment: 'jsdom'`** gives you a DOM. `happy-dom` also works.
- **`css: true`** lets Vitest process the stylesheets the components import, so the injected `:root` rule is visible to `getComputedStyle` (see below).
- **`server.deps.inline: ['entangle-ui']`** is the key line. Without it you will see errors such as `Unknown file extension ".css"` or `Cannot find module './Button.css'` the moment a test imports a component.

## Loading the theme so CSS variables resolve

Components reference tokens like `var(--etui-color-bg-primary)`. Those variables only exist once the dark theme stylesheet is registered on `:root`. Import the canonical stylesheet **once** in your setup file:

```ts
// test/setup.ts
import '@testing-library/jest-dom/vitest';

// Registers every --etui-* token on :root (the default dark theme) so
// components resolve their CSS variables in jsdom. This is the same single
// import you use in your app entry.
import 'entangle-ui/styles.css';
```

With that in place, assertions against computed styles work:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from 'entangle-ui';

it('paints the themed surface', () => {
  render(<Button>Save</Button>);
  const styles = getComputedStyle(screen.getByRole('button'));
  // --etui-* values are now resolved from the :root rule
  expect(styles.getPropertyValue('--etui-color-bg-primary').trim()).toBe(
    '#1a1a1a'
  );
});
```

If you skip the import, components still render and remain queryable by role/text — only color/spacing assertions that depend on the tokens will come back empty.

## Stubbing browser observers

jsdom implements neither `ResizeObserver`, `IntersectionObserver`, nor a real `matchMedia`. Several components use them:

- **`ResizeObserver`** — `SplitPane`, `SegmentedControl`, and the editor surfaces (`NodeGraph`, `Timeline`, `Minimap`, `ViewportGizmo`, `CurveEditor`, `CartesianPicker`, `AssetBrowser`). Rendering any of these without a stub throws `ResizeObserver is not defined`.
- **`IntersectionObserver`** — anything using the `useIntersectionObserver` hook.
- **`matchMedia`** — the reduced-motion checks in `Tooltip`, `Dialog`, `Drawer`, and viewport components read `window.matchMedia('(prefers-reduced-motion: reduce)')`.

Add minimal stubs to the same setup file:

```ts
// test/setup.ts (continued)
import { vi } from 'vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, // reduced motion off by default
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

To assert reduced-motion behavior, make `matchMedia(...).matches` return `true` for the query under test.

## A `renderWithTheme` helper

For tokens to resolve you only need the `styles.css` import above. Use [`ThemeProvider`](/guides/theming) when a test needs its runtime behaviors — keyboard context or the opt-in `globalScrollbars`. A small wrapper keeps tests tidy:

```tsx
// test/renderWithTheme.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'entangle-ui';
import type { ReactElement, ReactNode } from 'react';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
```

```tsx
import { renderWithTheme } from '../test/renderWithTheme';
import { screen } from '@testing-library/react';
import { Slider } from 'entangle-ui';

it('renders a slider', () => {
  renderWithTheme(<Slider defaultValue={50} aria-label="Volume" />);
  expect(screen.getByRole('slider')).toBeInTheDocument();
});
```

## Troubleshooting

| Symptom                                                       | Cause                                  | Fix                                                              |
| ------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------- |
| `Unknown file extension ".css"` / `Cannot find module './*.css'` | Package is externalized                | Add `server.deps.inline: ['entangle-ui']`                       |
| `getPropertyValue('--etui-…')` returns `''`                   | Theme stylesheet not loaded            | `import 'entangle-ui/styles.css'` in the setup file             |
| `ResizeObserver is not defined`                              | jsdom has no observers                 | Add the `ResizeObserver` stub above                             |
| `window.matchMedia is not a function`                        | jsdom has no `matchMedia`              | Add the `matchMedia` stub above                                 |

## See also

- [Installation](/getting-started/installation) — the same `entangle-ui/styles.css` import used in your app.
- [Theming](/guides/theming) — `ThemeProvider`, custom themes, and the `--etui-*` token reference.
