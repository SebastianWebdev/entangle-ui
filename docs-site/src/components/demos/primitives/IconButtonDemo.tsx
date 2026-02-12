import DemoWrapper from '../DemoWrapper';
import { IconButton } from '@/components/primitives';
import { Flex } from '@/components/layout';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';

export default function IconButtonDemo() {
  return (
    <DemoWrapper>
      <Flex gap="md" align="center">
        <IconButton aria-label="Settings" variant="default">
          <SettingsIcon />
        </IconButton>
        <IconButton aria-label="Copy" variant="ghost">
          <CopyIcon />
        </IconButton>
        <IconButton aria-label="Delete" variant="filled">
          <TrashIcon />
        </IconButton>
        <IconButton aria-label="Disabled" disabled>
          <SettingsIcon />
        </IconButton>
      </Flex>
    </DemoWrapper>
  );
}
