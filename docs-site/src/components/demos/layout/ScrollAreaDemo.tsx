import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { ScrollArea, Flex, Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

const ROWS = Array.from({ length: 24 }, (_, i) => i + 1);

function VerticalList() {
  return (
    <>
      {ROWS.map(i => (
        <div
          key={i}
          style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}
        >
          <Text size="sm">Item {i}</Text>
        </div>
      ))}
    </>
  );
}

export default function ScrollAreaDemo() {
  return (
    <DemoWrapper height="200px" withKeyboard>
      <ScrollArea maxHeight={160}>
        <VerticalList />
      </ScrollArea>
    </DemoWrapper>
  );
}

export function ScrollAreaDirection() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={4}>
        <div>
          <Text size="xs" color="muted">
            vertical
          </Text>
          <ScrollArea direction="vertical" maxHeight={120}>
            <VerticalList />
          </ScrollArea>
        </div>
        <div>
          <Text size="xs" color="muted">
            horizontal
          </Text>
          <ScrollArea direction="horizontal" maxWidth={280}>
            <Flex gap={2} style={{ width: 'max-content', padding: '4px 0' }}>
              {ROWS.map(i => (
                <div
                  key={i}
                  style={{
                    flex: '0 0 auto',
                    width: 80,
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #333',
                    borderRadius: 4,
                  }}
                >
                  <Text size="sm">Col {i}</Text>
                </div>
              ))}
            </Flex>
          </ScrollArea>
        </div>
        <div>
          <Text size="xs" color="muted">
            both
          </Text>
          <ScrollArea direction="both" maxHeight={140} maxWidth={280}>
            <div style={{ width: 600 }}>
              {ROWS.map(i => (
                <div
                  key={i}
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid #333',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Text size="sm">
                    Row {i} — a wide line of content that scrolls horizontally
                  </Text>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function ScrollAreaVisibility() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={4}>
        {(['auto', 'always', 'hover', 'never'] as const).map(mode => (
          <div key={mode}>
            <Text size="xs" color="muted">
              {mode}
            </Text>
            <ScrollArea scrollbarVisibility={mode} maxHeight={110}>
              <VerticalList />
            </ScrollArea>
          </div>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function ScrollAreaHideDelay() {
  return (
    <DemoWrapper withKeyboard>
      <ScrollArea scrollbarVisibility="auto" hideDelay={2000} maxHeight={160}>
        <VerticalList />
      </ScrollArea>
    </DemoWrapper>
  );
}

export function ScrollAreaFadeMask() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={4}>
        <div>
          <Text size="xs" color="muted">
            fadeMask
          </Text>
          <ScrollArea fadeMask maxHeight={140}>
            <VerticalList />
          </ScrollArea>
        </div>
        <div>
          <Text size="xs" color="muted">
            fadeMaskHeight=40
          </Text>
          <ScrollArea fadeMask fadeMaskHeight={40} maxHeight={140}>
            <VerticalList />
          </ScrollArea>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function ScrollAreaCustomScrollbar() {
  return (
    <DemoWrapper withKeyboard>
      <ScrollArea
        scrollbarVisibility="always"
        scrollbarWidth={10}
        scrollbarPadding={4}
        minThumbLength={48}
        maxHeight={160}
      >
        <VerticalList />
      </ScrollArea>
    </DemoWrapper>
  );
}

export function ScrollAreaAutoFill() {
  return (
    <DemoWrapper height="220px" withKeyboard>
      <Flex direction="column" style={{ height: '100%' }}>
        <div style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}>
          <Text size="sm">Header</Text>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea autoFill scrollbarVisibility="always">
            <VerticalList />
          </ScrollArea>
        </div>
        <div style={{ padding: '6px 8px', borderTop: '1px solid #333' }}>
          <Text size="sm">Footer</Text>
        </div>
      </Flex>
    </DemoWrapper>
  );
}

export function ScrollAreaCallbacks() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={2}>
        <Text size="xs" color="muted">
          {atTop ? 'At top' : atBottom ? 'At bottom' : 'Scrolling...'}
        </Text>
        <ScrollArea
          maxHeight={140}
          scrollbarVisibility="always"
          onScrollTop={() => {
            setAtTop(true);
            setAtBottom(false);
          }}
          onScrollBottom={() => {
            setAtTop(false);
            setAtBottom(true);
          }}
          onScroll={e => {
            const el = e.currentTarget;
            if (el.scrollTop > 0 && atTop) setAtTop(false);
          }}
        >
          <VerticalList />
        </ScrollArea>
      </Stack>
    </DemoWrapper>
  );
}
