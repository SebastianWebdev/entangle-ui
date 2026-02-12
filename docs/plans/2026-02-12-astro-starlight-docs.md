# Astro Starlight Documentation Site — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a professional documentation site (like MUI docs) alongside Storybook, with left sidebar navigation, component examples, and auto-generated API reference from TypeScript types.

**Architecture:** Astro Starlight docs site lives in `docs-site/` at repo root, separate from the library source. It uses `@astrojs/react` to render entangle-ui components live in MDX pages, and `starlight-typedoc` to auto-generate API reference from JSDoc/TypeScript. Existing Storybook stays untouched.

**Tech Stack:** Astro 5 + Starlight, `@astrojs/react`, `starlight-typedoc`, TypeDoc, `typedoc-plugin-markdown`

---

## Phase 1: Scaffold Starlight Site

### Task 1: Initialize Astro Starlight project

**Files:**
- Create: `docs-site/package.json`
- Create: `docs-site/astro.config.mjs`
- Create: `docs-site/tsconfig.json`
- Create: `docs-site/src/content.config.ts`
- Create: `docs-site/src/content/docs/index.mdx`

**Step 1: Scaffold Astro project in docs-site/**

```bash
cd /home/claude/workspace/entangle-ui
mkdir docs-site && cd docs-site
npm create astro@latest -- --template starlight --no-install --no-git .
```

If the interactive CLI doesn't work non-interactively, create the files manually:

**Step 2: Create `docs-site/package.json`**

```json
{
  "name": "entangle-ui-docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/starlight": "^0.32.0",
    "@astrojs/react": "^4.2.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "starlight-typedoc": "^0.21.0",
    "typedoc": "^0.27.0",
    "typedoc-plugin-markdown": "^4.4.0"
  }
}
```

**Step 3: Create `docs-site/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightTypeDoc from 'starlight-typedoc';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Entangle UI',
      description: 'React component library for professional editor interfaces',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/SebastianWebdev/entangle-ui' },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts'],
          tsconfig: '../tsconfig.json',
          output: 'api',
          sidebar: {
            label: 'API Reference',
            collapsed: true,
          },
          typeDoc: {
            excludePrivate: true,
            excludeProtected: true,
            excludeInternal: true,
            readme: 'none',
          },
        }),
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Theming', slug: 'guides/theming' },
            { label: 'Styling', slug: 'guides/styling' },
          ],
        },
        {
          label: 'Components',
          items: [
            {
              label: 'Primitives',
              collapsed: false,
              items: [
                { label: 'Button', slug: 'components/primitives/button' },
                { label: 'Input', slug: 'components/primitives/input' },
                { label: 'Text', slug: 'components/primitives/text' },
                { label: 'Paper', slug: 'components/primitives/paper' },
                { label: 'Icon', slug: 'components/primitives/icon' },
                { label: 'IconButton', slug: 'components/primitives/icon-button' },
                { label: 'Tooltip', slug: 'components/primitives/tooltip' },
                { label: 'Checkbox', slug: 'components/primitives/checkbox' },
                { label: 'Switch', slug: 'components/primitives/switch' },
                { label: 'Popover', slug: 'components/primitives/popover' },
                { label: 'Collapsible', slug: 'components/primitives/collapsible' },
              ],
            },
            {
              label: 'Layout',
              collapsed: false,
              items: [
                { label: 'Flex', slug: 'components/layout/flex' },
                { label: 'Stack', slug: 'components/layout/stack' },
                { label: 'Grid', slug: 'components/layout/grid' },
                { label: 'Spacer', slug: 'components/layout/spacer' },
                { label: 'ScrollArea', slug: 'components/layout/scroll-area' },
                { label: 'SplitPane', slug: 'components/layout/split-pane' },
                { label: 'Accordion', slug: 'components/layout/accordion' },
                { label: 'PanelSurface', slug: 'components/layout/panel-surface' },
              ],
            },
            {
              label: 'Controls',
              collapsed: false,
              items: [
                { label: 'Slider', slug: 'components/controls/slider' },
                { label: 'NumberInput', slug: 'components/controls/number-input' },
                { label: 'Select', slug: 'components/controls/select' },
                { label: 'ColorPicker', slug: 'components/controls/color-picker' },
                { label: 'CurveEditor', slug: 'components/controls/curve-editor' },
                { label: 'CartesianPicker', slug: 'components/controls/cartesian-picker' },
                { label: 'TreeView', slug: 'components/controls/tree-view' },
                { label: 'VectorInput', slug: 'components/controls/vector-input' },
              ],
            },
            {
              label: 'Navigation',
              collapsed: false,
              items: [
                { label: 'Menu', slug: 'components/navigation/menu' },
                { label: 'ContextMenu', slug: 'components/navigation/context-menu' },
                { label: 'Tabs', slug: 'components/navigation/tabs' },
              ],
            },
            {
              label: 'Feedback',
              collapsed: false,
              items: [
                { label: 'Dialog', slug: 'components/feedback/dialog' },
                { label: 'Toast', slug: 'components/feedback/toast' },
              ],
            },
            {
              label: 'Shell',
              collapsed: false,
              items: [
                { label: 'AppShell', slug: 'components/shell/app-shell' },
                { label: 'MenuBar', slug: 'components/shell/menu-bar' },
                { label: 'Toolbar', slug: 'components/shell/toolbar' },
                { label: 'StatusBar', slug: 'components/shell/status-bar' },
                { label: 'FloatingPanel', slug: 'components/shell/floating-panel' },
              ],
            },
            {
              label: 'Editor',
              collapsed: true,
              items: [
                { label: 'ChatPanel', slug: 'components/editor/chat-panel' },
                { label: 'PropertyInspector', slug: 'components/editor/property-inspector' },
                { label: 'ViewportGizmo', slug: 'components/editor/viewport-gizmo' },
              ],
            },
          ],
        },
        {
          label: 'Icons',
          slug: 'icons',
        },
      ],
    }),
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        '@': new URL('../src', import.meta.url).pathname,
      },
    },
  },
});
```

**Step 4: Create `docs-site/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["../src/*"]
    }
  }
}
```

**Step 5: Create `docs-site/src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
};
```

**Step 6: Create landing page `docs-site/src/content/docs/index.mdx`**

```mdx
---
title: Entangle UI
description: React component library for professional editor interfaces
template: splash
hero:
  title: Entangle UI
  tagline: React components for 3D tools, node editors, and parameter systems
  actions:
    - text: Get Started
      link: /getting-started/installation/
      icon: right-arrow
    - text: Components
      link: /components/primitives/button/
      variant: minimal
---
```

**Step 7: Install dependencies and verify dev server starts**

```bash
cd docs-site && npm install
npm run dev
```

Expected: Starlight dev server running on localhost:4321

**Step 8: Commit**

```bash
git add docs-site/
git commit -m "feat: scaffold Astro Starlight docs site"
```

---

### Task 2: Add root-level npm scripts and gitignore

**Files:**
- Modify: `package.json` (root)
- Modify: `.gitignore`

**Step 1: Add docs scripts to root `package.json`**

Add to `"scripts"`:
```json
"docs:dev": "npm run --prefix docs-site dev",
"docs:build": "npm run --prefix docs-site build",
"docs:preview": "npm run --prefix docs-site preview"
```

**Step 2: Add docs-site build output to `.gitignore`**

Append:
```
docs-site/dist/
docs-site/.astro/
docs-site/node_modules/
```

**Step 3: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: add docs npm scripts and gitignore entries"
```

---

## Phase 2: Migrate Existing Docs

### Task 3: Migrate quickstart, theming, and styling guides

**Files:**
- Create: `docs-site/src/content/docs/getting-started/introduction.mdx`
- Create: `docs-site/src/content/docs/getting-started/installation.mdx`
- Create: `docs-site/src/content/docs/getting-started/quick-start.mdx`
- Create: `docs-site/src/content/docs/guides/theming.mdx`
- Create: `docs-site/src/content/docs/guides/styling.mdx`
- Reference: `docs/quickstart.md`, `docs/theming.md`, `docs/styling.md`

**Step 1: Create introduction page**

```mdx
---
title: Introduction
description: What is Entangle UI and why use it
---

Entangle UI is a React component library designed for professional editor interfaces —
3D tools, node editors, parameter systems, and similar complex applications.

## Key Features

- **Dark-first theme system** — Vanilla Extract compile-time CSS with full token customization
- **Professional controls** — Slider, NumberInput, ColorPicker, CurveEditor, VectorInput
- **Editor patterns** — AppShell, MenuBar, Toolbar, StatusBar, PropertyInspector
- **Tree-shakeable** — ESM-only with `sideEffects` annotations
- **Type-safe** — Full TypeScript support with strict prop types

## When to Use Entangle UI

Use this library when building:
- 3D editor interfaces (like Blender, Unity)
- Node-based editors (like Unreal Blueprints)
- Parameter/property inspectors
- Any tool-oriented dark-themed application
```

**Step 2: Convert `docs/quickstart.md` content into `installation.mdx` and `quick-start.mdx`**

Split the existing quickstart.md into two focused pages:
- `installation.mdx` — npm install, peer deps, provider setup
- `quick-start.mdx` — first component usage, basic examples

Add Starlight frontmatter to each:
```mdx
---
title: Installation
description: How to install Entangle UI in your project
---
```

**Step 3: Convert `docs/theming.md` → `guides/theming.mdx`**

Add Starlight frontmatter. Convert any code examples to use MDX syntax with `import` if needed for live demos later.

**Step 4: Convert `docs/styling.md` → `guides/styling.mdx`**

Same approach as theming.

**Step 5: Verify all pages render correctly**

```bash
cd docs-site && npm run dev
```

Visit each page in browser to verify rendering.

**Step 6: Commit**

```bash
git add docs-site/src/content/docs/
git commit -m "docs: migrate existing guides to Starlight"
```

---

## Phase 3: Component Documentation Template & First Components

### Task 4: Create shared MDX components for doc pages

These are Astro/MDX components used inside documentation pages (NOT entangle-ui library components). They render prop tables, example previews, etc.

**Files:**
- Create: `docs-site/src/components/ComponentPreview.astro`
- Create: `docs-site/src/components/PropsTable.astro`
- Create: `docs-site/src/components/ExampleBlock.tsx` (React — for interactive demos)

**Step 1: Create `ComponentPreview.astro`**

A wrapper that renders a component example in a dark themed container (like MUI "demo" boxes):

```astro
---
interface Props {
  title?: string;
}
const { title } = Astro.props;
---

<div class="component-preview">
  {title && <p class="component-preview__title">{title}</p>}
  <div class="component-preview__canvas">
    <slot />
  </div>
</div>

<style>
  .component-preview {
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 8px;
    margin: 1.5rem 0;
    overflow: hidden;
  }
  .component-preview__title {
    padding: 0.5rem 1rem;
    margin: 0;
    font-size: 0.85rem;
    color: var(--sl-color-gray-3);
    border-bottom: 1px solid var(--sl-color-gray-5);
  }
  .component-preview__canvas {
    padding: 2rem;
    background: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
</style>
```

**Step 2: Create `PropsTable.astro`**

A component that renders a props table from structured data:

```astro
---
interface PropDef {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

interface Props {
  props: PropDef[];
}

const { props } = Astro.props;
---

<div class="props-table-wrapper">
  <table class="props-table">
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {props.map((p) => (
        <tr>
          <td>
            <code>{p.name}</code>
            {p.required && <span class="required">*</span>}
          </td>
          <td><code>{p.type}</code></td>
          <td>{p.default ? <code>{p.default}</code> : '—'}</td>
          <td>{p.description}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<style>
  .props-table-wrapper {
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  .props-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  .props-table th {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 2px solid var(--sl-color-gray-5);
    font-weight: 600;
  }
  .props-table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--sl-color-gray-6);
    vertical-align: top;
  }
  .props-table code {
    font-size: 0.85em;
    padding: 0.1em 0.3em;
    border-radius: 3px;
    background: var(--sl-color-gray-6);
  }
  .required {
    color: #ef4444;
    margin-left: 2px;
  }
</style>
```

**Step 3: Create `ExampleBlock.tsx`**

A React wrapper that provides the entangle-ui dark theme context for live demos:

```tsx
import React from 'react';
import '@/theme/darkTheme.css';

interface ExampleBlockProps {
  children: React.ReactNode;
}

export const ExampleBlock: React.FC<ExampleBlockProps> = ({ children }) => {
  return <div style={{ fontFamily: 'Inter, sans-serif' }}>{children}</div>;
};
```

**Step 4: Commit**

```bash
git add docs-site/src/components/
git commit -m "feat: add shared doc components (ComponentPreview, PropsTable, ExampleBlock)"
```

---

### Task 5: Write first component doc page — Button

This establishes the template pattern for ALL component doc pages.

**Files:**
- Create: `docs-site/src/content/docs/components/primitives/button.mdx`

**Step 1: Create the Button doc page**

```mdx
---
title: Button
description: Clickable button component with multiple variants and sizes
---

import { Button } from '@/components/primitives/Button';
import { SaveIcon } from '@/components/Icons';
import ComponentPreview from '../../../../components/ComponentPreview.astro';
import PropsTable from '../../../../components/PropsTable.astro';
import { ExampleBlock } from '../../../../components/ExampleBlock';

Versatile button component for actions and form submissions. Supports multiple visual
variants, sizes, loading states, and icon slots.

## Examples

### Variants

<ComponentPreview title="Button variants" client:load>
  <ExampleBlock client:load>
    <Button variant="default">Default</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="filled">Filled</Button>
  </ExampleBlock>
</ComponentPreview>

```tsx
<Button variant="default">Default</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="filled">Filled</Button>
```

### Sizes

<ComponentPreview title="Button sizes" client:load>
  <ExampleBlock client:load>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </ExampleBlock>
</ComponentPreview>

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### With Icon

<ComponentPreview title="Button with icon" client:load>
  <ExampleBlock client:load>
    <Button icon={<SaveIcon />}>Save</Button>
    <Button icon={<SaveIcon />} variant="filled">Save</Button>
  </ExampleBlock>
</ComponentPreview>

```tsx
import { SaveIcon } from 'entangle-ui';

<Button icon={<SaveIcon />}>Save</Button>
```

### Loading State

<ComponentPreview title="Loading button" client:load>
  <ExampleBlock client:load>
    <Button loading>Saving...</Button>
    <Button loading variant="filled">Processing</Button>
  </ExampleBlock>
</ComponentPreview>

```tsx
<Button loading>Saving...</Button>
```

### Disabled

<ComponentPreview title="Disabled buttons" client:load>
  <ExampleBlock client:load>
    <Button disabled>Default</Button>
    <Button disabled variant="filled">Filled</Button>
  </ExampleBlock>
</ComponentPreview>

### Full Width

<ComponentPreview title="Full width button" client:load>
  <ExampleBlock client:load>
    <Button fullWidth variant="filled">Full Width Action</Button>
  </ExampleBlock>
</ComponentPreview>

## API Reference

<PropsTable props={[
  { name: 'children', type: 'ReactNode', description: 'Button content — text, icons, or other React elements' },
  { name: 'variant', type: "'default' | 'ghost' | 'filled'", default: "'default'", description: 'Visual style variant' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Button size (sm=20px, md=24px, lg=32px)' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the button is disabled' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner and disable interactions' },
  { name: 'icon', type: 'ReactNode', description: 'Icon element displayed before children' },
  { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Whether button fills container width' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click event handler' },
  { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'HTML button type' },
  { name: 'className', type: 'string', description: 'Additional CSS class names' },
  { name: 'testId', type: 'string', description: 'Test identifier for automated testing' },
]} />

## Accessibility

- Renders as native `<button>` element
- Supports keyboard navigation (Enter/Space to activate)
- `disabled` state prevents interaction and announces via ARIA
- Loading state disables button and shows visual spinner
- Icon-only usage should include `aria-label`
```

**Step 2: Verify in dev server**

```bash
cd docs-site && npm run dev
```

Visit `http://localhost:4321/components/primitives/button/` — verify examples render with dark theme, props table shows correctly, sidebar navigation works.

**Step 3: Commit**

```bash
git add docs-site/src/content/docs/components/primitives/button.mdx
git commit -m "docs: add Button component documentation page"
```

---

### Task 6: Write Slider doc page (complex control example)

Same pattern as Button but for a more complex component with many props.

**Files:**
- Create: `docs-site/src/content/docs/components/controls/slider.mdx`
- Reference: `src/components/controls/Slider/Slider.tsx` (read props from JSDoc)

**Step 1: Create `slider.mdx`**

Follow the same structure as button.mdx:
1. Import component + demo components
2. Description paragraph
3. Examples section with `<ComponentPreview>` blocks: Basic, Range, With Units, With Ticks, Disabled, Custom Formatting
4. API Reference with `<PropsTable>`
5. Accessibility section

Key props to document: `value`, `onChange`, `min`, `max`, `step`, `precision`, `size`, `disabled`, `readOnly`, `label`, `helperText`, `error`, `errorMessage`, `unit`, `formatValue`, `showTooltip`, `showTicks`, `tickCount`

**Step 2: Verify renders correctly**

**Step 3: Commit**

```bash
git add docs-site/src/content/docs/components/controls/slider.mdx
git commit -m "docs: add Slider component documentation page"
```

---

### Task 7: Write remaining Primitives doc pages

**Files to create** (one per component, follow Button pattern):
- `docs-site/src/content/docs/components/primitives/input.mdx`
- `docs-site/src/content/docs/components/primitives/text.mdx`
- `docs-site/src/content/docs/components/primitives/paper.mdx`
- `docs-site/src/content/docs/components/primitives/icon.mdx`
- `docs-site/src/content/docs/components/primitives/icon-button.mdx`
- `docs-site/src/content/docs/components/primitives/tooltip.mdx`
- `docs-site/src/content/docs/components/primitives/checkbox.mdx`
- `docs-site/src/content/docs/components/primitives/switch.mdx`
- `docs-site/src/content/docs/components/primitives/popover.mdx`
- `docs-site/src/content/docs/components/primitives/collapsible.mdx`

**For each file:**
1. Read the component's `.tsx` and `.types.ts` files to get accurate props
2. Write description, 3-5 example sections with `<ComponentPreview>`, API Reference with `<PropsTable>`, Accessibility notes
3. Verify in dev server

**Commit after each batch of 3-4 components:**

```bash
git commit -m "docs: add Input, Text, Paper, Icon documentation pages"
```

---

### Task 8: Write Layout component doc pages

**Files to create:**
- `docs-site/src/content/docs/components/layout/flex.mdx`
- `docs-site/src/content/docs/components/layout/stack.mdx`
- `docs-site/src/content/docs/components/layout/grid.mdx`
- `docs-site/src/content/docs/components/layout/spacer.mdx`
- `docs-site/src/content/docs/components/layout/scroll-area.mdx`
- `docs-site/src/content/docs/components/layout/split-pane.mdx`
- `docs-site/src/content/docs/components/layout/accordion.mdx`
- `docs-site/src/content/docs/components/layout/panel-surface.mdx`

Same pattern. Flex should show responsive props examples (`sm`, `md`, `lg`, `xl` direction breakpoints).

---

### Task 9: Write remaining Controls doc pages

**Files to create:**
- `docs-site/src/content/docs/components/controls/number-input.mdx`
- `docs-site/src/content/docs/components/controls/select.mdx`
- `docs-site/src/content/docs/components/controls/color-picker.mdx`
- `docs-site/src/content/docs/components/controls/curve-editor.mdx`
- `docs-site/src/content/docs/components/controls/cartesian-picker.mdx`
- `docs-site/src/content/docs/components/controls/tree-view.mdx`
- `docs-site/src/content/docs/components/controls/vector-input.mdx`

ColorPicker should document built-in palettes. CurveEditor should show preset curves.

---

### Task 10: Write Navigation, Feedback, Shell, and Editor doc pages

**Files to create:**
- `docs-site/src/content/docs/components/navigation/menu.mdx`
- `docs-site/src/content/docs/components/navigation/context-menu.mdx`
- `docs-site/src/content/docs/components/navigation/tabs.mdx`
- `docs-site/src/content/docs/components/feedback/dialog.mdx`
- `docs-site/src/content/docs/components/feedback/toast.mdx`
- `docs-site/src/content/docs/components/shell/app-shell.mdx`
- `docs-site/src/content/docs/components/shell/menu-bar.mdx`
- `docs-site/src/content/docs/components/shell/toolbar.mdx`
- `docs-site/src/content/docs/components/shell/status-bar.mdx`
- `docs-site/src/content/docs/components/shell/floating-panel.mdx`
- `docs-site/src/content/docs/components/editor/chat-panel.mdx`
- `docs-site/src/content/docs/components/editor/property-inspector.mdx`
- `docs-site/src/content/docs/components/editor/viewport-gizmo.mdx`

AppShell page should show a full layout composition example combining MenuBar + Toolbar + StatusBar.

---

### Task 11: Create Icons gallery page

**Files:**
- Create: `docs-site/src/content/docs/icons.mdx`
- Create: `docs-site/src/components/IconGallery.tsx` (React component)

**Step 1: Create `IconGallery.tsx`**

A React component that renders all 63+ icons in a searchable grid:

```tsx
import React, { useState } from 'react';
import * as Icons from '@/components/Icons';

const iconEntries = Object.entries(Icons).filter(
  ([name]) => name.endsWith('Icon') && name !== 'Icon'
);

export const IconGallery: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = iconEntries.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          marginBottom: '1rem',
          background: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '6px',
          color: '#e0e0e0',
          fontSize: '14px',
        }}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
      }}>
        {filtered.map(([name, IconComponent]) => {
          const Comp = IconComponent as React.FC;
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#1a1a2e',
                borderRadius: '6px',
                border: '1px solid #2a2a3e',
              }}
            >
              <Comp />
              <span style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>
                {name.replace('Icon', '')}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
        {filtered.length} of {iconEntries.length} icons
      </p>
    </div>
  );
};
```

**Step 2: Create `icons.mdx`**

```mdx
---
title: Icons
description: All available icon components
---

import { IconGallery } from '../../components/IconGallery';

Entangle UI includes {63}+ SVG icon components optimized with `React.memo` and
`/*#__PURE__*/` annotations for tree-shaking.

## Usage

```tsx
import { SaveIcon, AddIcon, CloseIcon } from 'entangle-ui';

<Button icon={<SaveIcon />}>Save</Button>
<IconButton><CloseIcon /></IconButton>
```

## Icon Gallery

<IconGallery client:load />

## Props

All icons accept the same props as the `Icon` primitive:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Icon size in pixels |
| `color` | `string` | `'currentColor'` | Icon color |
| `className` | `string` | — | Additional CSS class |
```

**Step 3: Commit**

```bash
git add docs-site/src/components/IconGallery.tsx docs-site/src/content/docs/icons.mdx
git commit -m "docs: add searchable icon gallery page"
```

---

## Phase 4: Auto-Generated API Reference

### Task 12: Verify starlight-typedoc generates API pages

**Step 1: Check that starlight-typedoc plugin is correctly configured**

The plugin was added in Task 1's `astro.config.mjs`. Run the docs build:

```bash
cd docs-site && npm run build 2>&1 | head -50
```

Expected: TypeDoc processes `../src/index.ts` and generates markdown files in `docs-site/src/content/docs/api/`

**Step 2: Check generated sidebar**

Verify that the sidebar includes an "API Reference" section with auto-generated entries for all exported types, components, and functions.

**Step 3: Fix any TypeDoc issues**

Common issues:
- Missing JSDoc on exported types → Add JSDoc (see Phase 5)
- Re-exports not resolving → May need to adjust `entryPoints` to point at individual barrel exports
- Vanilla Extract imports causing errors → Add `exclude` patterns in TypeDoc config

If `src/index.ts` barrel doesn't work well with TypeDoc, switch to multiple entry points:

```js
entryPoints: [
  '../src/components/primitives/index.ts',
  '../src/components/layout/index.ts',
  '../src/components/controls/index.ts',
  '../src/components/navigation/index.ts',
  '../src/components/feedback/index.ts',
  '../src/components/shell/index.ts',
  '../src/components/editor/index.ts',
  '../src/components/Icons/index.ts',
  '../src/theme/index.ts',
],
```

**Step 4: Commit**

```bash
git commit -m "fix: configure starlight-typedoc for API reference generation"
```

---

## Phase 5: JSDoc Audit & Enhancement

### Task 13: Audit and enhance JSDoc comments across all components

This task ensures TypeDoc/starlight-typedoc generates quality API documentation.

**Current state:** Many components already have good JSDoc (Button, Paper, Input, Slider, Flex have excellent coverage). Some may be missing or incomplete.

**Step 1: Audit JSDoc coverage**

Run this to find exports missing JSDoc:

```bash
cd /home/claude/workspace/entangle-ui
grep -rn "^export const\|^export function\|^export interface\|^export type" src/components/ --include="*.tsx" --include="*.ts" | grep -v "test\|stories\|css\|index" | head -100
```

Cross-reference with TypeDoc output — any undocumented exports will appear without descriptions.

**Step 2: For each component missing JSDoc, add:**

1. **Component-level JSDoc** above the export:
```tsx
/**
 * Short description of what this component does.
 *
 * @example
 * ```tsx
 * <ComponentName prop="value">Content</ComponentName>
 * ```
 */
```

2. **Props JSDoc** for each property in the interface:
```tsx
/**
 * Description of what this prop controls
 * - `value1`: What happens with value1
 * - `value2`: What happens with value2
 * @default "value1"
 */
propName?: PropType;
```

**Priority components to check:**
- `src/components/controls/ColorPicker/ColorPicker.tsx`
- `src/components/controls/CurveEditor/CurveEditor.tsx`
- `src/components/controls/CartesianPicker/CartesianPicker.tsx`
- `src/components/controls/VectorInput/VectorInput.tsx`
- `src/components/controls/TreeView/TreeView.tsx`
- `src/components/navigation/ContextMenu/ContextMenu.tsx`
- `src/components/navigation/Tabs/Tabs.tsx`
- `src/components/shell/FloatingPanel/FloatingPanel.tsx`
- `src/components/layout/ScrollArea/ScrollArea.tsx`
- `src/components/layout/SplitPane/SplitPane.tsx`
- `src/components/layout/Accordion/Accordion.tsx`
- `src/components/layout/PanelSurface/PanelSurface.tsx`
- `src/components/feedback/Dialog/Dialog.tsx`
- `src/components/feedback/Toast/ToastProvider.tsx`
- `src/components/editor/ChatPanel/ChatPanel.types.ts` (all exported types)
- `src/components/editor/PropertyInspector/PropertyInspector.types.ts`
- `src/components/editor/ViewportGizmo/ViewportGizmo.types.ts`

**Step 3: Commit batches**

After every 5-6 files:
```bash
git commit -m "docs: enhance JSDoc for [CategoryName] components"
```

---

## Phase 6: Polish & CI

### Task 14: Add custom Starlight theme overrides

**Files:**
- Create: `docs-site/src/styles/custom.css`
- Modify: `docs-site/astro.config.mjs` (add `customCss`)

**Step 1: Create custom CSS**

Override Starlight theme to better match entangle-ui's dark aesthetic:

```css
/* docs-site/src/styles/custom.css */

:root {
  --sl-color-accent-low: #1a1a3e;
  --sl-color-accent: #6366f1;
  --sl-color-accent-high: #a5b4fc;
  --sl-color-white: #e0e0e0;
  --sl-color-gray-1: #c8c8d0;
  --sl-color-gray-2: #a0a0b0;
  --sl-color-gray-3: #808090;
  --sl-color-gray-4: #505060;
  --sl-color-gray-5: #303040;
  --sl-color-gray-6: #1e1e2e;
  --sl-color-black: #0d0d1a;
}

/* Starlight uses "dark" as default — we match entangle-ui's dark palette */
:root[data-theme='dark'] {
  --sl-color-bg: #0d0d1a;
  --sl-color-bg-sidebar: #12121f;
  --sl-color-bg-nav: #0d0d1a;
}
```

**Step 2: Add to astro.config.mjs**

```js
starlight({
  title: 'Entangle UI',
  customCss: ['./src/styles/custom.css'],
  // ... rest of config
})
```

**Step 3: Commit**

```bash
git add docs-site/src/styles/ docs-site/astro.config.mjs
git commit -m "style: add custom Starlight theme matching entangle-ui dark palette"
```

---

### Task 15: Add docs build to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Add docs build job**

Add a new job or step to the existing CI workflow:

```yaml
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: cd docs-site && npm install
      - run: cd docs-site && npm run build
```

This ensures docs stay buildable as components change.

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add docs build verification to CI pipeline"
```

---

### Task 16: Final verification and cleanup

**Step 1: Full docs build**

```bash
cd docs-site && npm run build
```

Expected: Clean build, no errors.

**Step 2: Preview built site**

```bash
npm run preview
```

Walk through:
- [ ] Landing page renders
- [ ] Sidebar navigation works (all categories, all components)
- [ ] Component examples render with dark theme
- [ ] Props tables display correctly
- [ ] API Reference section auto-generated
- [ ] Icon gallery loads and search works
- [ ] Guide pages (theming, styling) render correctly

**Step 3: Run library checks**

```bash
cd /home/claude/workspace/entangle-ui
npm run lint
npm run type-check
npm run format
```

**Step 4: Create changeset**

```bash
npx changeset
```

Select `minor` — adding documentation site alongside existing library.

**Step 5: Final commit**

```bash
git add .
git commit -m "docs: complete Astro Starlight documentation site"
```

---

## Summary of Deliverables

| Deliverable | Description |
|-------------|-------------|
| `docs-site/` | Full Astro Starlight documentation site |
| Left sidebar | Component navigation organized by category (like MUI) |
| Component pages | ~35 MDX pages with live examples + props tables |
| API Reference | Auto-generated from TypeScript via starlight-typedoc |
| Icon gallery | Searchable grid of all 63+ icons |
| Guides | Migrated theming, styling, quickstart docs |
| CI integration | Docs build verified in GitHub Actions |
| JSDoc coverage | Enhanced across all exported components |

## Dependencies to Install (in docs-site/)

```
astro
@astrojs/starlight
@astrojs/react
react (workspace link or same version)
react-dom
starlight-typedoc
typedoc
typedoc-plugin-markdown
```

## Files NOT Changed in Library Source (src/)

Only JSDoc comments are added/enhanced in existing source files (Phase 5). No component behavior, props, or styles are modified.
