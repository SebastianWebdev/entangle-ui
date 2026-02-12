import DemoWrapper from '../DemoWrapper';
import { Menu } from '@/components/navigation';

export default function MenuDemo() {
  return (
    <DemoWrapper>
      <Menu
        config={{
          groups: [
            {
              id: 'file',
              items: [
                {
                  id: 'new',
                  label: 'New File',
                  onClick: () => console.log('New'),
                },
                {
                  id: 'open',
                  label: 'Open...',
                  onClick: () => console.log('Open'),
                },
                {
                  id: 'save',
                  label: 'Save',
                  onClick: () => console.log('Save'),
                },
              ],
              itemSelectionType: 'none',
            },
            {
              id: 'edit',
              items: [
                {
                  id: 'undo',
                  label: 'Undo',
                  onClick: () => console.log('Undo'),
                },
                {
                  id: 'redo',
                  label: 'Redo',
                  onClick: () => console.log('Redo'),
                },
              ],
              itemSelectionType: 'none',
            },
          ],
        }}
      >
        <span>Open Menu</span>
      </Menu>
    </DemoWrapper>
  );
}
