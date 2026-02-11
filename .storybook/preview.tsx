import type { Preview } from '@storybook/react';
import { useTheme } from '@emotion/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../src/theme';
import type { Theme } from '../src/theme';

// Import dark theme to register VE CSS custom properties on :root
import '../src/theme/darkTheme.css';

const StorybookCanvas = ({ children }: { children: ReactNode }) => {
  const theme = useTheme() as Theme;
  const gradientEnd = theme.storybook.canvas.gradientEnd;

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: gradientEnd,
        color: '#ffffff',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        padding: 24,
      }}
    >
      {children}
    </div>
  );
};

const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider>
        <StorybookCanvas>
          <Story />
        </StorybookCanvas>
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
    docs: {
      theme: {
        base: 'dark',
        colorPrimary: '#007acc',
        colorSecondary: '#005a9e',
      },
    },
    backgrounds: {
      disabled: true,
    },
  },
};

export default preview;
