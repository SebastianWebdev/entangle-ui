import DemoWrapper from '../DemoWrapper';
import { Text } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon';
import { CheckIcon } from '@/components/Icons/CheckIcon';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';

export default function IconDemo() {
  const icons = [
    { icon: <ChevronDownIcon size="lg" />, name: 'ChevronDown' },
    { icon: <ChevronUpIcon size="lg" />, name: 'ChevronUp' },
    { icon: <CheckIcon size="lg" />, name: 'Check' },
    { icon: <CloseIcon size="lg" />, name: 'Close' },
    { icon: <SearchIcon size="lg" />, name: 'Search' },
    { icon: <SettingsIcon size="lg" />, name: 'Settings' },
    { icon: <CopyIcon size="lg" />, name: 'Copy' },
    { icon: <TrashIcon size="lg" />, name: 'Trash' },
  ];

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        {icons.map(({ icon, name }) => (
          <Stack key={name} spacing="xs" align="center">
            {icon}
            <Text size="xs" color="muted">
              {name}
            </Text>
          </Stack>
        ))}
      </div>
    </DemoWrapper>
  );
}
