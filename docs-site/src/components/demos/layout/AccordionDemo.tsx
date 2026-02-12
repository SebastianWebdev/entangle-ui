import DemoWrapper from '../DemoWrapper';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Stack,
} from '@/components/layout';
import { Text } from '@/components/primitives';

function AccordionVariant({
  variant,
}: {
  variant: 'default' | 'ghost' | 'filled';
}) {
  return (
    <div style={{ maxWidth: 350 }}>
      <Text size="xs" color="muted">
        {variant}
      </Text>
      <Accordion defaultValue="section1" collapsible variant={variant}>
        <AccordionItem value="section1">
          <AccordionTrigger>Getting Started</AccordionTrigger>
          <AccordionContent>
            <Text size="sm">Install the package and import components.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="section2">
          <AccordionTrigger>Configuration</AccordionTrigger>
          <AccordionContent>
            <Text size="sm">
              Configure the theme and wrap your app with the provider.
            </Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function AccordionDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={5}>
        <AccordionVariant variant="default" />
        <AccordionVariant variant="ghost" />
        <AccordionVariant variant="filled" />
      </Stack>
    </DemoWrapper>
  );
}
