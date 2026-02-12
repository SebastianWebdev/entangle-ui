import DemoWrapper from '../DemoWrapper';
import { Text } from '@/components/primitives';
import { Stack, Grid } from '@/components/layout';
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
      <Grid container columns={4} spacing={3}>
        {icons.map(({ icon, name }) => (
          <Grid key={name} size={1}>
            <Stack spacing={1} align="center">
              {icon}
              <Text size="xs" color="muted">
                {name}
              </Text>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </DemoWrapper>
  );
}
