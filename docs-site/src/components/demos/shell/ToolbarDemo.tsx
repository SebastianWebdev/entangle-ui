import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Toolbar } from '@/components/shell';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';

export default function ToolbarDemo() {
  const [bold, setBold] = useState(false);

  return (
    <DemoWrapper padding="0">
      <Toolbar aria-label="Tools">
        <Toolbar.Button icon={<CopyIcon />} tooltip="Copy" onClick={() => {}} />
        <Toolbar.Button
          icon={<TrashIcon />}
          tooltip="Delete"
          onClick={() => {}}
        />
        <Toolbar.Separator />
        <Toolbar.Toggle pressed={bold} onPressedChange={setBold} tooltip="Bold">
          B
        </Toolbar.Toggle>
        <Toolbar.Spacer />
        <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
      </Toolbar>
    </DemoWrapper>
  );
}
