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
