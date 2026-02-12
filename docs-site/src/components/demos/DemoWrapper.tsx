import '@/theme/darkTheme.css';
import { KeyboardContextProvider } from '@/context/KeyboardContext';

interface DemoWrapperProps {
  children: React.ReactNode;
  height?: string;
  padding?: string;
  withKeyboard?: boolean;
}

export default function DemoWrapper({
  children,
  height,
  padding = '1.5rem',
  withKeyboard = false,
}: DemoWrapperProps) {
  const content = (
    <div
      style={{
        background: '#121212',
        borderRadius: '6px',
        padding,
        height,
        overflow: 'auto',
        fontSize: 'var(--etui-font-size-md)',
        fontFamily: 'var(--etui-font-family-sans)',
      }}
    >
      {children}
    </div>
  );

  if (withKeyboard) {
    return <KeyboardContextProvider>{content}</KeyboardContextProvider>;
  }

  return content;
}
