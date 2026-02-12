import DemoWrapper from '../DemoWrapper';
import { ContextMenu } from '@/components/navigation';
import { Text } from '@/components/primitives';

export default function ContextMenuDemo() {
  return (
    <DemoWrapper>
      <ContextMenu
        config={{
          groups: [
            {
              id: 'clipboard',
              items: [
                {
                  id: 'cut',
                  label: 'Cut',
                  onClick: () => console.log('Cut'),
                },
                {
                  id: 'copy',
                  label: 'Copy',
                  onClick: () => console.log('Copy'),
                },
                {
                  id: 'paste',
                  label: 'Paste',
                  onClick: () => console.log('Paste'),
                },
              ],
              itemSelectionType: 'none',
            },
            {
              id: 'danger',
              items: [
                {
                  id: 'delete',
                  label: 'Delete',
                  onClick: () => console.log('Delete'),
                },
              ],
              itemSelectionType: 'none',
            },
          ],
        }}
      >
        <div
          style={{
            padding: '32px',
            border: '1px dashed #4a4a4a',
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          <Text size="sm" color="muted">
            Right-click here
          </Text>
        </div>
      </ContextMenu>
    </DemoWrapper>
  );
}
