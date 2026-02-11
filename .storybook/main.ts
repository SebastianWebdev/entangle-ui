import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
  ],
  framework: '@storybook/react-vite',
  viteFinal: config => {
    config.plugins = config.plugins || [];
    config.plugins.push(vanillaExtractPlugin());
    return config;
  },
};
export default config;
