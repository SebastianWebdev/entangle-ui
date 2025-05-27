import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Set base URL for GitHub Pages deployment
    // This ensures assets load from the correct path
    if (process.env.NODE_ENV === 'production') {
      config.base = '/entangle-ui/storybook/';
    }
    
    // Ensure publicDir is set correctly
    config.publicDir = false;
    
    return config;
  },
  // Add manager head to handle routing properly
  managerHead: (head) => `
    ${head}
    <base href="/entangle-ui/storybook/">
  `,
};

export default config;