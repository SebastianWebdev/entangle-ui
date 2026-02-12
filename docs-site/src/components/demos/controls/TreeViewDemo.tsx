import DemoWrapper from '../DemoWrapper';
import { TreeView } from '@/components/controls';

export default function TreeViewDemo() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 300 }}>
        <TreeView
          nodes={[
            {
              id: 'src',
              label: 'src',
              children: [
                {
                  id: 'components',
                  label: 'components',
                  children: [
                    { id: 'button', label: 'Button.tsx' },
                    { id: 'input', label: 'Input.tsx' },
                    { id: 'slider', label: 'Slider.tsx' },
                  ],
                },
                {
                  id: 'utils',
                  label: 'utils',
                  children: [
                    { id: 'cn', label: 'cn.ts' },
                    { id: 'cx', label: 'cx.ts' },
                  ],
                },
                { id: 'index', label: 'index.ts' },
              ],
            },
          ]}
          defaultExpandedIds={['src', 'components']}
          defaultSelectedIds={['button']}
        />
      </div>
    </DemoWrapper>
  );
}
