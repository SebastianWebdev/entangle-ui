import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Pagination } from '@/components/navigation';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function PaginationDemo() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Pagination count={10} defaultPage={1} />
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Stack gap={1}>
          <Text size="xs" color="muted">
            sm
          </Text>
          <Pagination size="sm" count={10} defaultPage={3} />
        </Stack>
        <Stack gap={1}>
          <Text size="xs" color="muted">
            md
          </Text>
          <Pagination size="md" count={10} defaultPage={3} />
        </Stack>
        <Stack gap={1}>
          <Text size="xs" color="muted">
            lg
          </Text>
          <Pagination size="lg" count={10} defaultPage={3} />
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationManyPages() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Pagination count={50} defaultPage={25} />
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationFullControls() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Pagination
          count={50}
          defaultPage={25}
          showFirstButton
          showLastButton
        />
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationCompact() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Pagination
          count={20}
          defaultPage={10}
          siblingCount={0}
          boundaryCount={1}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationControlled() {
  const [page, setPage] = useState(1);
  return (
    <DemoWrapper>
      <Stack gap={3} align="flex-start">
        <Text size="sm">
          Current page: <strong>{page}</strong>
        </Text>
        <Pagination
          count={20}
          page={page}
          onChange={(_, next) => {
            setPage(next);
          }}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function PaginationDisabled() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Pagination count={10} defaultPage={4} disabled />
      </Stack>
    </DemoWrapper>
  );
}
