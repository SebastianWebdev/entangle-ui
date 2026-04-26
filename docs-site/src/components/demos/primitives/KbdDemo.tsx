import type React from 'react';
import DemoWrapper from '../DemoWrapper';
import { Button, Kbd, Tooltip } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';

const COMMON_SHORTCUTS = [
  ['Save', 'Cmd+S'],
  ['Copy', 'Cmd+C'],
  ['Paste', 'Cmd+V'],
  ['Find', 'Cmd+F'],
  ['Undo', 'Cmd+Z'],
  ['Redo', 'Cmd+Shift+Z'],
] as const;

const EDITOR_SHORTCUTS = [
  ['Command Palette', 'Cmd+Shift+P'],
  ['Quick Open', 'Cmd+P'],
  ['Save', 'Cmd+S'],
  ['Find', 'Cmd+F'],
  ['Replace', 'Cmd+Alt+F'],
  ['Toggle Terminal', 'Ctrl+Backspace'],
  ['Move Line Up', 'Alt+Up'],
  ['Move Line Down', 'Alt+Down'],
  ['Go to Definition', 'F12'],
  ['Rename Symbol', 'F2'],
] as const;

const labelStyle: React.CSSProperties = {
  color: 'var(--etui-color-text-secondary)',
  fontSize: 'var(--etui-font-size-sm)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
};

export default function KbdDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Flex gap={4} align="center" wrap="wrap">
          <Kbd platform="windows">Ctrl+S</Kbd>
          <Kbd platform="mac" separator={null}>
            Cmd+S
          </Kbd>
          <Kbd platform="linux">Meta+Shift+P</Kbd>
        </Flex>
        <Flex gap={4} align="center" wrap="wrap">
          <Kbd variant="solid" platform="windows">
            Ctrl+F
          </Kbd>
          <Kbd variant="outline" platform="windows">
            Ctrl+P
          </Kbd>
          <Kbd variant="ghost" platform="windows">
            Ctrl+Tab
          </Kbd>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function KbdLiteral() {
  return (
    <DemoWrapper>
      <Kbd glyphs={false} platform="windows">
        Ctrl+S
      </Kbd>
    </DemoWrapper>
  );
}

export function KbdMacGlyphs() {
  return (
    <DemoWrapper>
      <Kbd platform="mac" separator={null}>
        Cmd+S
      </Kbd>
    </DemoWrapper>
  );
}

export function KbdSizes() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center" wrap="wrap">
        <Kbd size="sm" platform="windows">
          Ctrl+S
        </Kbd>
        <Kbd size="md" platform="windows">
          Ctrl+S
        </Kbd>
        <Kbd size="lg" platform="windows">
          Ctrl+S
        </Kbd>
      </Flex>
    </DemoWrapper>
  );
}

export function KbdVariants() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center" wrap="wrap">
        <Kbd variant="solid" platform="windows">
          Ctrl+S
        </Kbd>
        <Kbd variant="outline" platform="windows">
          Ctrl+S
        </Kbd>
        <Kbd variant="ghost" platform="windows">
          Ctrl+S
        </Kbd>
      </Flex>
    </DemoWrapper>
  );
}

export function KbdCommonShortcuts() {
  return (
    <DemoWrapper>
      <Stack spacing={2} style={{ width: 240 }}>
        {COMMON_SHORTCUTS.map(([label, shortcut]) => (
          <div key={label} style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <Kbd platform="mac" separator={null}>
              {shortcut}
            </Kbd>
          </div>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function KbdMultipleKeys() {
  return (
    <DemoWrapper>
      <Kbd variant="solid" platform="windows">
        Ctrl+Shift+P
      </Kbd>
    </DemoWrapper>
  );
}

export function KbdCustomSeparator() {
  return (
    <DemoWrapper>
      <Kbd glyphs={false} separator="→">
        Ctrl+S
      </Kbd>
    </DemoWrapper>
  );
}

export function KbdNoSeparator() {
  return (
    <DemoWrapper>
      <Kbd platform="mac" separator={null}>
        Cmd+S
      </Kbd>
    </DemoWrapper>
  );
}

export function KbdInTooltip() {
  return (
    <DemoWrapper>
      <Tooltip
        title={
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Save
            <Kbd size="sm" variant="ghost" glyphs={false}>
              Ctrl+S
            </Kbd>
          </span>
        }
      >
        <Button>Save</Button>
      </Tooltip>
    </DemoWrapper>
  );
}

export function KbdInMenuItem() {
  return (
    <DemoWrapper padding="0.5rem">
      <div
        style={{
          width: 220,
          padding: '4px 0',
          background: 'var(--etui-color-background-elevated)',
          border: '1px solid var(--etui-color-border-default)',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            ...rowStyle,
            padding: '4px 12px',
            color: 'var(--etui-color-text-primary)',
          }}
        >
          <span>Save</span>
          <Kbd size="sm" variant="ghost" glyphs={false}>
            Ctrl+S
          </Kbd>
        </div>
      </div>
    </DemoWrapper>
  );
}

export function KbdReferencePanel() {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
          gap: 8,
          width: 'min(100%, 460px)',
        }}
      >
        {EDITOR_SHORTCUTS.map(([label, shortcut]) => (
          <div
            key={label}
            style={{
              ...rowStyle,
              padding: '6px 8px',
              border: '1px solid var(--etui-color-border-default)',
              borderRadius: 4,
            }}
          >
            <span style={labelStyle}>{label}</span>
            <Kbd size="sm" platform="mac" separator={null}>
              {shortcut}
            </Kbd>
          </div>
        ))}
      </div>
    </DemoWrapper>
  );
}
