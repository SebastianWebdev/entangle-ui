import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

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
            { label: 'Animations', slug: 'guides/animations' },
          ],
        },
        {
          label: 'Components',
          items: [
            {
              label: 'Primitives',
              collapsed: false,
              items: [
                { label: 'Avatar', slug: 'components/primitives/avatar' },
                { label: 'Badge', slug: 'components/primitives/badge' },
                { label: 'Button', slug: 'components/primitives/button' },
                { label: 'Checkbox', slug: 'components/primitives/checkbox' },
                { label: 'Code', slug: 'components/primitives/code' },
                {
                  label: 'Collapsible',
                  slug: 'components/primitives/collapsible',
                },
                { label: 'Icon', slug: 'components/primitives/icon' },
                {
                  label: 'IconButton',
                  slug: 'components/primitives/icon-button',
                },
                { label: 'Input', slug: 'components/primitives/input' },
                { label: 'Kbd', slug: 'components/primitives/kbd' },
                { label: 'Link', slug: 'components/primitives/link' },
                { label: 'Paper', slug: 'components/primitives/paper' },
                { label: 'Popover', slug: 'components/primitives/popover' },
                { label: 'Radio', slug: 'components/primitives/radio' },
                { label: 'Switch', slug: 'components/primitives/switch' },
                { label: 'Text', slug: 'components/primitives/text' },
                { label: 'TextArea', slug: 'components/primitives/text-area' },
                { label: 'Tooltip', slug: 'components/primitives/tooltip' },
                {
                  label: 'VisuallyHidden',
                  slug: 'components/primitives/visually-hidden',
                },
              ],
            },
            {
              label: 'Layout',
              collapsed: false,
              items: [
                { label: 'Accordion', slug: 'components/layout/accordion' },
                { label: 'Divider', slug: 'components/layout/divider' },
                { label: 'Flex', slug: 'components/layout/flex' },
                { label: 'Grid', slug: 'components/layout/grid' },
                { label: 'ListItem', slug: 'components/layout/list-item' },
                { label: 'PageHeader', slug: 'components/layout/page-header' },
                {
                  label: 'PanelSurface',
                  slug: 'components/layout/panel-surface',
                },
                {
                  label: 'ScrollArea',
                  slug: 'components/layout/scroll-area',
                },
                { label: 'Spacer', slug: 'components/layout/spacer' },
                {
                  label: 'SplitPane',
                  slug: 'components/layout/split-pane',
                },
                { label: 'Stack', slug: 'components/layout/stack' },
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
                {
                  label: 'Breadcrumbs',
                  slug: 'components/navigation/breadcrumbs',
                },
                {
                  label: 'ContextMenu',
                  slug: 'components/navigation/context-menu',
                },
                { label: 'Menu', slug: 'components/navigation/menu' },
                {
                  label: 'SegmentedControl',
                  slug: 'components/navigation/segmented-control',
                },
                { label: 'Tabs', slug: 'components/navigation/tabs' },
              ],
            },
            {
              label: 'Feedback',
              collapsed: false,
              items: [
                { label: 'Alert', slug: 'components/feedback/alert' },
                { label: 'Dialog', slug: 'components/feedback/dialog' },
                {
                  label: 'EmptyState',
                  slug: 'components/feedback/empty-state',
                },
                {
                  label: 'ProgressBar',
                  slug: 'components/feedback/progress-bar',
                },
                { label: 'Skeleton', slug: 'components/feedback/skeleton' },
                { label: 'Spinner', slug: 'components/feedback/spinner' },
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
                  label: 'TransformControl',
                  slug: 'components/editor/transform-control',
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
          label: 'Hooks',
          collapsed: false,
          items: [
            { label: 'Overview', slug: 'hooks' },
            { label: 'useClickOutside', slug: 'hooks/use-click-outside' },
            { label: 'useClipboard', slug: 'hooks/use-clipboard' },
            {
              label: 'useControlledState',
              slug: 'hooks/use-controlled-state',
            },
            { label: 'useDisclosure', slug: 'hooks/use-disclosure' },
            { label: 'useFocusTrap', slug: 'hooks/use-focus-trap' },
            { label: 'useHotkey', slug: 'hooks/use-hotkey' },
            { label: 'useMergedRef', slug: 'hooks/use-merged-ref' },
            {
              label: 'useResizeObserver',
              slug: 'hooks/use-resize-observer',
            },
            { label: 'useTheme', slug: 'hooks/use-theme' },
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
        '@': resolve(rootDir, 'src'),
      },
    },
    // Keep Vite's dep optimizer out of vanilla-extract land — pre-bundling
    // these packages races the plugin and triggers "No CSS for file" errors
    // when navigating to component pages in dev mode.
    optimizeDeps: {
      exclude: [
        '@vanilla-extract/css',
        '@vanilla-extract/recipes',
        '@vanilla-extract/dynamic',
      ],
    },
    ssr: {
      noExternal: [
        '@vanilla-extract/css',
        '@vanilla-extract/recipes',
        '@vanilla-extract/dynamic',
      ],
    },
  },
});
