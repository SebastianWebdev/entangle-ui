import '@/theme/darkTheme.css';
import { ToastProvider } from '@/components/feedback';

interface ToastDemoWrapperProps {
  children: React.ReactNode;
  padding?: string;
}

export default function ToastDemoWrapper({
  children,
  padding = '1.5rem',
}: ToastDemoWrapperProps) {
  return (
    <ToastProvider position="bottom-right">
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '6px',
          padding,
          fontSize: 'var(--etui-font-size-md)',
          fontFamily: 'var(--etui-font-family-sans)',
        }}
      >
        {children}
      </div>
    </ToastProvider>
  );
}
