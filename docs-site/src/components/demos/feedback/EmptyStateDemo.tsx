import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { EmptyState } from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Stack } from '@/components/layout';

const SearchGlyph = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <circle cx="22" cy="22" r="10" />
    <path d="M30 30 L40 40" strokeLinecap="round" />
  </svg>
);

const InboxGlyph = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M6 24 L18 24 L20 28 L28 28 L30 24 L42 24" strokeLinejoin="round" />
    <path
      d="M6 24 L12 10 L36 10 L42 24 L42 38 L6 38 Z"
      strokeLinejoin="round"
    />
  </svg>
);

const TagGlyph = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 12 L12 3 L21 3 L21 12 L12 21 Z" strokeLinejoin="round" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

export default function EmptyStateDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={4}>
        <EmptyState
          icon={<SearchGlyph />}
          title="No results"
          description="Try a different search term or reset filters."
          action={
            <Button
              variant="filled"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              Try again
            </Button>
          }
        />
        {loading && (
          <EmptyState loading title="Searching..." description="One moment." />
        )}
        <EmptyState
          variant="compact"
          icon={<SearchGlyph />}
          title="Nothing here"
          description="Add your first item to get started."
        />
      </Stack>
    </DemoWrapper>
  );
}

export function EmptyStateDefault() {
  return (
    <DemoWrapper>
      <EmptyState
        icon={<InboxGlyph />}
        title="Inbox zero"
        description="You're all caught up — no unread messages."
      />
    </DemoWrapper>
  );
}

export function EmptyStateWithAction() {
  return (
    <DemoWrapper>
      <EmptyState
        icon={<SearchGlyph />}
        title="No results"
        description="Try adjusting your search or filters."
        action={
          <>
            <Button>Reset filters</Button>
            <Button variant="filled">New search</Button>
          </>
        }
      />
    </DemoWrapper>
  );
}

export function EmptyStateCompact() {
  return (
    <DemoWrapper>
      <div
        style={{
          border: '1px solid var(--etui-color-border-default)',
          borderRadius: 4,
          maxWidth: 360,
        }}
      >
        <EmptyState
          variant="compact"
          icon={<TagGlyph />}
          title="No tags"
          description="Tags appear here once you add them."
        />
      </div>
    </DemoWrapper>
  );
}

export function EmptyStateLoading() {
  const [tick, setTick] = useState(0);
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <EmptyState
          loading
          title="Loading conversation..."
          description="Fetching recent messages."
        />
        <Button onClick={() => setTick(t => t + 1)}>Re-trigger ({tick})</Button>
      </Stack>
    </DemoWrapper>
  );
}

export function EmptyStateLoadingSwap() {
  const [loading, setLoading] = useState(false);
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <div
          style={{
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
            minHeight: 220,
          }}
        >
          {loading ? (
            <EmptyState loading title="Searching..." />
          ) : (
            <EmptyState
              icon={<SearchGlyph />}
              title="No results"
              description="Try adjusting your filters."
              action={
                <Button
                  variant="filled"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1500);
                  }}
                >
                  Retry
                </Button>
              }
            />
          )}
        </div>
      </Stack>
    </DemoWrapper>
  );
}
