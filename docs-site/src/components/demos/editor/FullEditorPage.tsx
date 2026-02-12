import '@/theme/darkTheme.css';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import FullEditorDemo from './FullEditorDemo';

export default function FullEditorPage() {
  return (
    <KeyboardContextProvider>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0a0a',
          fontSize: 'var(--etui-font-size-md)',
          fontFamily: 'var(--etui-font-family-sans)',
        }}
      >
        <FullEditorDemo />
      </div>
    </KeyboardContextProvider>
  );
}
