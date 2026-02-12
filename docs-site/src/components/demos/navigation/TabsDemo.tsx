import DemoWrapper from '../DemoWrapper';
import { Tabs, TabList, Tab, TabPanel } from '@/components/navigation';
import { Text } from '@/components/primitives';
import { Stack } from '@/components/layout';

function TabsVariant({
  variant,
}: {
  variant: 'underline' | 'pills' | 'enclosed';
}) {
  return (
    <div>
      <Text size="xs" color="muted">
        {variant}
      </Text>
      <Tabs defaultValue="tab1" variant={variant}>
        <TabList>
          <Tab value="tab1">Overview</Tab>
          <Tab value="tab2">Features</Tab>
          <Tab value="tab3">API</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Overview panel content</Text>
          </div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Features panel content</Text>
          </div>
        </TabPanel>
        <TabPanel value="tab3">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">API panel content</Text>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default function TabsDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={5}>
        <TabsVariant variant="underline" />
        <TabsVariant variant="pills" />
        <TabsVariant variant="enclosed" />
      </Stack>
    </DemoWrapper>
  );
}
