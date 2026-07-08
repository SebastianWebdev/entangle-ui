import DemoWrapper from '../DemoWrapper';
import { Text, Paper } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';
import { RobotIcon } from '@/components/Icons/RobotIcon';
import { FolderCogIcon } from '@/components/Icons/FolderCogIcon';
import { RobotIcon as RobotIconNew } from '@/components/Icons/experimental/RobotIcon';
import { FolderCogIcon as FolderCogIconNew } from '@/components/Icons/experimental/FolderCogIcon';

type IconComp = React.ComponentType<{ size?: number; color?: string }>;

const SIZES = [16, 24, 48, 96];

const PAIRS: { name: string; current: IconComp; experimental: IconComp }[] = [
  { name: 'Robot', current: RobotIcon, experimental: RobotIconNew },
  { name: 'FolderCog', current: FolderCogIcon, experimental: FolderCogIconNew },
];

function SizeRow({ Comp }: { Comp: IconComp }) {
  return (
    <Flex gap={4} align="flex-end" wrap="wrap">
      {SIZES.map(size => (
        <Stack key={size} spacing={1} align="center">
          <Comp size={size} />
          <Text size="xs" color="muted">
            {size}px
          </Text>
        </Stack>
      ))}
    </Flex>
  );
}

export default function ExperimentalIconsDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        {PAIRS.map(({ name, current: Current, experimental: Experimental }) => (
          <Paper key={name} elevation={1} padding={16}>
            <Stack spacing={3}>
              <Text weight="bold">{name}</Text>
              <Flex gap={6} wrap="wrap">
                <Stack spacing={2}>
                  <Text size="sm" color="muted">
                    Line (current)
                  </Text>
                  <SizeRow Comp={Current} />
                </Stack>
                <Stack spacing={2}>
                  <Text size="sm" color="muted">
                    Recraft (experimental)
                  </Text>
                  <SizeRow Comp={Experimental} />
                </Stack>
              </Flex>
              <Flex gap={4} align="center" wrap="wrap">
                <Text size="sm" color="muted">
                  currentColor check:
                </Text>
                <Experimental size={48} color="accent" />
                <Experimental size={48} color="success" />
                <Experimental size={48} color="error" />
                <div
                  style={{
                    background: '#ffffff',
                    padding: 8,
                    borderRadius: 4,
                    display: 'inline-flex',
                  }}
                >
                  <Experimental size={48} color="#1a1a1a" />
                </div>
              </Flex>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </DemoWrapper>
  );
}
