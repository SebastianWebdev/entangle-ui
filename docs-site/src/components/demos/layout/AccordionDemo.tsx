import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Stack,
} from '@/components/layout';
import { Text, IconButton } from '@/components/primitives';
import { FolderIcon } from '@/components/Icons/FolderIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { AddIcon } from '@/components/Icons/AddIcon';
import { MinusIcon } from '@/components/Icons/MinusIcon';

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

export function AccordionWidth() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Accordion width={280} defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>Fixed 280px</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">This accordion is exactly 280px wide.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion width="24rem" defaultValue="b">
          <AccordionItem value="b">
            <AccordionTrigger>Width 24rem</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">String widths accept any CSS length.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Stack>
    </DemoWrapper>
  );
}

export function AccordionSingleMultiple() {
  return (
    <DemoWrapper>
      <Stack spacing={5}>
        <div style={{ maxWidth: 350 }}>
          <Text size="xs" color="muted">
            single (default)
          </Text>
          <Accordion defaultValue="s1">
            <AccordionItem value="s1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>
                <Text size="sm">Opening another section closes this one.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <Text size="sm">Only one item stays open at a time.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div style={{ maxWidth: 350 }}>
          <Text size="xs" color="muted">
            multiple
          </Text>
          <Accordion multiple defaultValue={['m1', 'm2']}>
            <AccordionItem value="m1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>
                <Text size="sm">Any number of items can be open.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <Text size="sm">Both are expanded by default.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function AccordionCollapsible() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion collapsible defaultValue="optional">
          <AccordionItem value="optional">
            <AccordionTrigger>Optional Section</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">
                Click the header again to fully close it — nothing has to stay
                open.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="other">
            <AccordionTrigger>Another Section</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">All items can be collapsed at once.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionVariants() {
  return <AccordionDemo />;
}

function SizedAccordion({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <div style={{ maxWidth: 350 }}>
      <Text size="xs" color="muted">
        {size}
      </Text>
      <Accordion size={size} defaultValue="t">
        <AccordionItem value="t">
          <AccordionTrigger>Transform</AccordionTrigger>
          <AccordionContent>
            <Text size="sm">Position, rotation, and scale.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="m">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>
            <Text size="sm">Color, texture, and shader settings.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionSizes() {
  return (
    <DemoWrapper>
      <Stack spacing={5}>
        <SizedAccordion size="sm" />
        <SizedAccordion size="md" />
        <SizedAccordion size="lg" />
      </Stack>
    </DemoWrapper>
  );
}

export function AccordionGap() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion gap={8} multiple defaultValue={['a']}>
          <AccordionItem value="a">
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">Items are spaced apart by 8px.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Section B</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">Useful for card-like grouping.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionTriggerExtras() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 350 }}>
        <Accordion defaultValue="scene">
          <AccordionItem value="scene">
            <AccordionTrigger
              icon={<FolderIcon />}
              actions={
                <IconButton size="sm" aria-label="Scene settings">
                  <SettingsIcon />
                </IconButton>
              }
            >
              Scene
            </AccordionTrigger>
            <AccordionContent>
              <Text size="sm">
                The settings button on the right does not toggle the section.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="assets">
            <AccordionTrigger
              icon={<FolderIcon />}
              actions={
                <IconButton size="sm" aria-label="Add asset">
                  <AddIcon />
                </IconButton>
              }
            >
              Assets
            </AccordionTrigger>
            <AccordionContent>
              <Text size="sm">Imported meshes, textures, and materials.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionCustomIndicator() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion multiple defaultValue={['custom']}>
          <AccordionItem value="custom">
            <AccordionTrigger indicator={<MinusIcon />}>
              Custom Indicator
            </AccordionTrigger>
            <AccordionContent>
              <Text size="sm">This trigger uses a custom indicator.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="none">
            <AccordionTrigger indicator={null}>No Chevron</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">The indicator is hidden entirely.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionKeepMounted() {
  const [count, setCount] = useState(0);
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion collapsible defaultValue="form">
          <AccordionItem value="form">
            <AccordionTrigger>Stateful Content</AccordionTrigger>
            <AccordionContent keepMounted>
              <Stack spacing={2}>
                <Text size="sm">Counter: {count}</Text>
                <IconButton
                  size="sm"
                  aria-label="Increment"
                  onClick={() => setCount(c => c + 1)}
                >
                  <AddIcon />
                </IconButton>
                <Text size="xs" color="muted">
                  Collapse and reopen — the counter keeps its value.
                </Text>
              </Stack>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionDisabledItem() {
  return (
    <DemoWrapper>
      <div style={{ maxWidth: 350 }}>
        <Accordion defaultValue="open">
          <AccordionItem value="open">
            <AccordionTrigger>Editable Section</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">This one expands normally.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="locked" disabled>
            <AccordionTrigger>Locked Section</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">This cannot be opened.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoWrapper>
  );
}

export function AccordionControlled() {
  const [expanded, setExpanded] = useState<string>('section-1');
  return (
    <DemoWrapper>
      <Stack spacing={2} style={{ maxWidth: 350 }}>
        <Text size="xs" color="muted">
          Expanded: {expanded || 'none'}
        </Text>
        <Accordion
          collapsible
          value={expanded}
          onChange={val => setExpanded(val as string)}
        >
          <AccordionItem value="section-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">Controlled by external state.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="section-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>
              <Text size="sm">The label above tracks the open item.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Stack>
    </DemoWrapper>
  );
}
