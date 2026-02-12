import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Entangle UI',
      description: 'React component library for professional editor interfaces',
      components: {
        Hero: './src/components/overrides/Hero.astro',
      },
      social: {
        github: 'https://github.com/SebastianWebdev/entangle-ui',
      },
      customCss: ['./src/styles/custom.css'],
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
                {
                  label: 'IconButton',
                  slug: 'components/primitives/icon-button',
                },
                { label: 'Tooltip', slug: 'components/primitives/tooltip' },
                { label: 'Checkbox', slug: 'components/primitives/checkbox' },
                { label: 'Switch', slug: 'components/primitives/switch' },
                { label: 'Popover', slug: 'components/primitives/popover' },
                {
                  label: 'Collapsible',
                  slug: 'components/primitives/collapsible',
                },
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
                {
                  label: 'ScrollArea',
                  slug: 'components/layout/scroll-area',
                },
                {
                  label: 'SplitPane',
                  slug: 'components/layout/split-pane',
                },
                { label: 'Accordion', slug: 'components/layout/accordion' },
                {
                  label: 'PanelSurface',
                  slug: 'components/layout/panel-surface',
                },
              ],
            },
            {
              label: 'Controls',
              collapsed: false,
              items: [
                { label: 'Slider', slug: 'components/controls/slider' },
                {
                  label: 'NumberInput',
                  slug: 'components/controls/number-input',
                },
                { label: 'Select', slug: 'components/controls/select' },
                {
                  label: 'ColorPicker',
                  slug: 'components/controls/color-picker',
                },
                {
                  label: 'CurveEditor',
                  slug: 'components/controls/curve-editor',
                },
                {
                  label: 'CartesianPicker',
                  slug: 'components/controls/cartesian-picker',
                },
                { label: 'TreeView', slug: 'components/controls/tree-view' },
                {
                  label: 'VectorInput',
                  slug: 'components/controls/vector-input',
                },
              ],
            },
            {
              label: 'Navigation',
              collapsed: false,
              items: [
                { label: 'Menu', slug: 'components/navigation/menu' },
                {
                  label: 'ContextMenu',
                  slug: 'components/navigation/context-menu',
                },
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
                {
                  label: 'FloatingPanel',
                  slug: 'components/shell/floating-panel',
                },
              ],
            },
            {
              label: 'Editor',
              collapsed: true,
              items: [
                {
                  label: 'ChatPanel',
                  slug: 'components/editor/chat-panel',
                },
                {
                  label: 'PropertyInspector',
                  slug: 'components/editor/property-inspector',
                },
                {
                  label: 'ViewportGizmo',
                  slug: 'components/editor/viewport-gizmo',
                },
              ],
            },
          ],
        },
        {
          label: 'Showcase',
          items: [{ label: 'Full Editor', slug: 'showcase/editor' }],
        },
        {
          label: 'Icons',
          slug: 'icons',
        },
        typeDocSidebarGroup,
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [vanillaExtractPlugin()],
    resolve: {
      alias: {
        '@': resolve(new URL('.', import.meta.url).pathname, '../src'),
      },
    },
  },
});
