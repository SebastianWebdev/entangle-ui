import DemoWrapper from '../DemoWrapper';
import { Stat } from '@/components/feedback';
import { Flex, Stack } from '@/components/layout';

const RevenueIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 17 L8 12 L11 14 L17 5" strokeLinecap="round" />
    <path d="M13 5 L17 5 L17 9" strokeLinecap="round" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <circle cx="10" cy="7" r="3" />
    <path d="M4 17 C4 13 7 12 10 12 C13 12 16 13 16 17" strokeLinecap="round" />
  </svg>
);

const ErrorGlyph = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6 L10 11" strokeLinecap="round" />
    <circle cx="10" cy="14" r="0.8" fill="currentColor" />
  </svg>
);

export default function StatDemo() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat
          icon={<RevenueIcon />}
          label="Monthly revenue"
          value="$12,400"
          delta={{ value: '+8.2%', direction: 'up' }}
          helper="vs. last month"
        />
        <Stat
          icon={<ErrorGlyph />}
          label="Error rate"
          value="0.42%"
          delta={{ value: '+0.05%', direction: 'up', semantics: 'negative' }}
          helper="vs. last week"
        />
        <Stat
          icon={<UsersIcon />}
          label="Active users"
          value="2,184"
          delta={{ value: '+12%', direction: 'up' }}
          helper="last 24 hours"
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatSizes() {
  return (
    <DemoWrapper>
      <Flex gap={6} align="flex-end" wrap="wrap">
        <Stat
          size="sm"
          label="Size sm"
          value="42,184"
          delta={{ value: '+12%', direction: 'up' }}
        />
        <Stat
          size="md"
          label="Size md"
          value="42,184"
          delta={{ value: '+12%', direction: 'up' }}
        />
        <Stat
          size="lg"
          label="Size lg"
          value="42,184"
          delta={{ value: '+12%', direction: 'up' }}
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatSemanticsPositive() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat
          label="Signups"
          value="312"
          delta={{ value: '+18', direction: 'up', semantics: 'positive' }}
          helper="up = good, shows green"
        />
        <Stat
          label="Signups"
          value="312"
          delta={{ value: '-4', direction: 'down', semantics: 'positive' }}
          helper="down = bad, shows red"
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatSemanticsNegative() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat
          label="Error count"
          value="32"
          delta={{ value: '+4', direction: 'up', semantics: 'negative' }}
          helper="up = bad, shows red"
        />
        <Stat
          label="Error count"
          value="32"
          delta={{ value: '-12', direction: 'down', semantics: 'negative' }}
          helper="down = good, shows green"
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatSemanticsNeutral() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat
          label="Active sessions"
          value="148"
          delta={{ value: '+6', direction: 'up', semantics: 'neutral' }}
          helper="trend only, no judgement"
        />
        <Stat
          label="Active sessions"
          value="148"
          delta={{ value: '0', direction: 'neutral' }}
          helper="no change"
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatWithIcon() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat
          icon={<RevenueIcon />}
          label="MRR"
          value="$48,920"
          delta={{ value: '+3.4%', direction: 'up' }}
        />
        <Stat
          icon={<UsersIcon />}
          label="New customers"
          value="184"
          delta={{ value: '-2', direction: 'down' }}
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatNoDelta() {
  return (
    <DemoWrapper>
      <Flex gap={6} wrap="wrap">
        <Stat label="Total assets" value="1,294" />
        <Stat
          label="Storage used"
          value="42.1 GB"
          helper="of 100 GB allocated"
        />
      </Flex>
    </DemoWrapper>
  );
}

export function StatDashboard() {
  return (
    <DemoWrapper>
      <Stack gap={5} style={{ width: '100%', maxWidth: 720 }}>
        <Flex gap={6} wrap="wrap">
          <Stat
            label="Render queue"
            value="12"
            delta={{ value: '+3', direction: 'up', semantics: 'neutral' }}
            helper="jobs pending"
          />
          <Stat
            label="Avg. frame time"
            value="42ms"
            delta={{ value: '+6ms', direction: 'up', semantics: 'negative' }}
            helper="vs. baseline"
          />
          <Stat
            label="GPU utilisation"
            value="78%"
            delta={{ value: '-4%', direction: 'down', semantics: 'neutral' }}
            helper="last 5 min"
          />
          <Stat
            label="Failed frames"
            value="0"
            delta={{ value: '-2', direction: 'down', semantics: 'negative' }}
            helper="last hour"
          />
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}
