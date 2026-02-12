import DemoWrapper from '../DemoWrapper';
import { Grid } from '@/components/layout';

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: '#2d2d2d',
      padding: '12px',
      borderRadius: 4,
      textAlign: 'center' as const,
      color: '#ccc',
      fontSize: 12,
    }}
  >
    {children}
  </div>
);

export default function GridDemo() {
  return (
    <DemoWrapper>
      <Grid container columns={3} spacing={3}>
        <Grid size={1}>
          <Cell>Col 1</Cell>
        </Grid>
        <Grid size={1}>
          <Cell>Col 2</Cell>
        </Grid>
        <Grid size={1}>
          <Cell>Col 3</Cell>
        </Grid>
        <Grid size={1}>
          <Cell>Col 4</Cell>
        </Grid>
        <Grid size={1}>
          <Cell>Col 5</Cell>
        </Grid>
        <Grid size={1}>
          <Cell>Col 6</Cell>
        </Grid>
      </Grid>
    </DemoWrapper>
  );
}
