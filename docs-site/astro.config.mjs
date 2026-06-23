import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import rehypeBaseInternalLinks from './scripts/rehype-base-internal-links.mjs';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

// When building an archived version snapshot, DOCS_BASE is set to e.g. "/v0.9"
// so every asset and internal link resolves under that sub-path on GitHub
// Pages. The "latest" build leaves it unset and is served from the site root.
const base = process.env.DOCS_BASE || undefined;

export default defineConfig({
  site: 'https://www.entangle-ui.dev',
  base,
  // Versioned snapshot builds (DOCS_BASE set) need root-absolute Markdown links
  // rewritten to live under the base; the root "latest" build skips this.
  markdown: {
    rehypePlugins: base ? [[rehypeBaseInternalLinks, { base }]] : [],
  },
  integrations: [
    starlight({
      title: 'Entangle UI',
      description: 'React component library for professional editor interfaces',
      components: {
        Hero: './src/components/overrides/Hero.astro',
        SiteTitle: './src/components/overrides/SiteTitle.astro',
        // Emits the Entangle UI component CSS globally. All demos hydrate with
        // `client:only`, whose CSS Astro does not collect — see Head.astro.
        Head: './src/components/overrides/Head.astro',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/SebastianWebdev/entangle-ui',
        },
      ],
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
            { label: 'Docs for LLMs', slug: 'llms-txt' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Accessibility', slug: 'guides/accessibility' },
            { label: 'Animations', slug: 'guides/animations' },
            { label: 'Styling', slug: 'guides/styling' },
            { label: 'Testing', slug: 'guides/testing' },
            { label: 'Theming', slug: 'guides/theming' },
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
                {
                  label: 'HoverCard',
                  slug: 'components/primitives/hover-card',
                },
                { label: 'Popover', slug: 'components/primitives/popover' },
                { label: 'Radio', slug: 'components/primitives/radio' },
                { label: 'Switch', slug: 'components/primitives/switch' },
                { label: 'Text', slug: 'components/primitives/text' },
                { label: 'TextArea', slug: 'components/primitives/text-area' },
                { label: 'Tooltip', slug: 'components/primitives/tooltip' },
                { label: 'Viewport', slug: 'components/primitives/viewport' },
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
                { label: 'Card', slug: 'components/layout/card' },
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
                {
                  label: 'CartesianPicker',
                  slug: 'components/controls/cartesian-picker',
                },
                {
                  label: 'ColorPicker',
                  slug: 'components/controls/color-picker',
                },
                { label: 'Combobox', slug: 'components/controls/combobox' },
                {
                  label: 'CurveEditor',
                  slug: 'components/controls/curve-editor',
                },
                {
                  label: 'FileTree',
                  slug: 'components/controls/file-tree',
                },
                {
                  label: 'FileUploader',
                  slug: 'components/controls/file-uploader',
                },
                {
                  label: 'MultiSelect',
                  slug: 'components/controls/multi-select',
                },
                {
                  label: 'NumberInput',
                  slug: 'components/controls/number-input',
                },
                { label: 'Select', slug: 'components/controls/select' },
                { label: 'Slider', slug: 'components/controls/slider' },
                { label: 'TagInput', slug: 'components/controls/tag-input' },
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
                  label: 'Pagination',
                  slug: 'components/navigation/pagination',
                },
                {
                  label: 'PathBar',
                  slug: 'components/navigation/path-bar',
                },
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
                {
                  label: 'CommandPalette',
                  slug: 'components/feedback/command-palette',
                },
                { label: 'Dialog', slug: 'components/feedback/dialog' },
                { label: 'Drawer', slug: 'components/feedback/drawer' },
                {
                  label: 'EmptyState',
                  slug: 'components/feedback/empty-state',
                },
                { label: 'LogView', slug: 'components/feedback/log-view' },
                {
                  label: 'ProgressBar',
                  slug: 'components/feedback/progress-bar',
                },
                { label: 'Skeleton', slug: 'components/feedback/skeleton' },
                { label: 'Spinner', slug: 'components/feedback/spinner' },
                { label: 'Stat', slug: 'components/feedback/stat' },
                { label: 'Toast', slug: 'components/feedback/toast' },
              ],
            },
            {
              label: 'Data',
              collapsed: false,
              items: [
                { label: 'DataTable', slug: 'components/data/data-table' },
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
                  label: 'AssetBrowser',
                  slug: 'components/editor/asset-browser',
                },
                {
                  label: 'ChatPanel',
                  slug: 'components/editor/chat-panel',
                },
                {
                  label: 'Minimap',
                  slug: 'components/editor/minimap',
                },
                {
                  label: 'NodeGraph',
                  slug: 'components/editor/nodegraph',
                },
                {
                  label: 'PropertyInspector',
                  slug: 'components/editor/property-inspector',
                },
                {
                  label: 'Timeline',
                  slug: 'components/editor/timeline',
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
            { label: 'useBreakpoint', slug: 'hooks/use-breakpoint' },
            { label: 'useClickOutside', slug: 'hooks/use-click-outside' },
            { label: 'useClipboard', slug: 'hooks/use-clipboard' },
            {
              label: 'useControlledState',
              slug: 'hooks/use-controlled-state',
            },
            {
              label: 'useDebouncedCallback',
              slug: 'hooks/use-debounced-callback',
            },
            {
              label: 'useDebouncedValue',
              slug: 'hooks/use-debounced-value',
            },
            { label: 'useDisclosure', slug: 'hooks/use-disclosure' },
            {
              label: 'useEventCallback',
              slug: 'hooks/use-event-callback',
            },
            { label: 'useFocusTrap', slug: 'hooks/use-focus-trap' },
            { label: 'useHotkey', slug: 'hooks/use-hotkey' },
            {
              label: 'useIntersectionObserver',
              slug: 'hooks/use-intersection-observer',
            },
            { label: 'useIsMounted', slug: 'hooks/use-is-mounted' },
            { label: 'useKeyboard', slug: 'hooks/use-keyboard' },
            { label: 'useListboxNav', slug: 'hooks/use-listbox-nav' },
            { label: 'useMediaQuery', slug: 'hooks/use-media-query' },
            { label: 'useMergedRef', slug: 'hooks/use-merged-ref' },
            {
              label: 'useResizeObserver',
              slug: 'hooks/use-resize-observer',
            },
            { label: 'useTheme', slug: 'hooks/use-theme' },
            {
              label: 'useThrottledCallback',
              slug: 'hooks/use-throttled-callback',
            },
          ],
        },
        {
          label: 'Showcase',
          items: [
            { label: 'Full Editor', slug: 'showcase/editor' },
            { label: 'Animation Editor', slug: 'showcase/animation-editor' },
          ],
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
    //
    // `vanilla-extract-css.browser.esm.js` (pulled into the client graph at
    // runtime) default-imports six leaf deps of `@vanilla-extract/css`. In the
    // browser resolution condition three of them land on CommonJS files that
    // expose no `default` (`module.exports = …`): `cssesc` (cssesc.js),
    // `deepmerge` (dist/cjs.js) and `picocolors` (picocolors.browser.js, via
    // its `browser` field). The other three (`@emotion/hash`,
    // `modern-ahocorasick`, `dedent`) ship real ESM with a `default`.
    //
    // Because the parent packages are excluded above, Vite never crawls into
    // them to auto-discover these leaves, so it never applies its CJS→ESM
    // interop. The browser's native ESM loader then can't synthesize a
    // `default`, and hydration dies with "does not provide an export named
    // 'default'" the first time a demo evaluates the bundle. Force the three
    // CJS leaves into the optimizer so the interop runs and `default` resolves
    // to `module.exports`. NOTE: after changing this list, delete
    // `node_modules/.vite` so the optimizer re-bundles — a stale cache keeps
    // the old, broken resolution.
    optimizeDeps: {
      exclude: [
        '@vanilla-extract/css',
        '@vanilla-extract/recipes',
        '@vanilla-extract/dynamic',
      ],
      include: ['cssesc', 'deepmerge', 'picocolors'],
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
