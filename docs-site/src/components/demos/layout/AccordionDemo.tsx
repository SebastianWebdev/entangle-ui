import DemoWrapper from '../DemoWrapper';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/layout';
import { Text } from '@/components/primitives';

export default function AccordionDemo() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion defaultValue="section1" collapsible>
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
          <AccordionItem value="section3">
            <AccordionTrigger>Advanced Usage</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">
                Customize tokens, create palettes, and build complex layouts.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}
