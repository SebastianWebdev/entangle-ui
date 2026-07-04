# Stat
> KPI / metric display with label, value, optional trend delta, helper, and leading icon.

A compact metric display: label, primary value, optional trend delta, and an optional helper line. Use it for KPI tiles in dashboards, summary strips, and status panels. The component handles the trend arrow and the semantic colouring of the delta; the consumer is responsible for formatting the value and the delta string.

**Live Preview**

## When to use

- **Stat** — a single named metric you want a reader to scan at a glance, optionally with a trend.
- **ProgressBar** — a metric that is a fraction of a total and you want to draw the bar.
- **Alert** — a status the reader needs to act on, not just absorb.

Reach for `Stat` when the value itself is the headline ("MRR: $12,400 ▲ 8.2%"). Reach for `ProgressBar` when the visual encoding of "how full" is the headline.

## Import

```tsx
import { Stat } from 'entangle-ui';
```

## Usage

```tsx
<Stat
  label="MRR"
  value="$12,400"
  delta={{ value: '+8.2%', direction: 'up' }}
  helper="vs. last month"
/>
```

The `value` and `delta.value` are both `ReactNode` — pre-format them on the consumer side. The component never parses, rounds, or localises numbers for you.

## Sizes

Three sizes drive the value typography and overall density. Label and helper sizes stay constant so a dashboard row mixing sizes still aligns.

**Sizes**

```tsx
<Stat size="sm" label="Size sm" value="42,184" />
<Stat size="md" label="Size md" value="42,184" />
<Stat size="lg" label="Size lg" value="42,184" />
```

## Delta semantics

`delta.semantics` tells the component what "up" _means_ for this metric. The arrow direction is purely visual; the colour comes from the combination of `direction` and `semantics`.

| Semantics  | Up direction | Down direction | Use for                      |
| ---------- | ------------ | -------------- | ---------------------------- |
| `positive` | green        | red            | Revenue, signups, conversion |
| `negative` | red          | green          | Errors, latency, crash rate  |
| `neutral`  | muted        | muted          | Counters with no value-tilt  |

`positive` is the default — fits most "more is better" metrics.

### Positive (default)

Up reads as green, down reads as red.

**Positive semantics**

```tsx
<Stat
  label="Signups"
  value="312"
  delta={{ value: '+18', direction: 'up', semantics: 'positive' }}
/>
<Stat
  label="Signups"
  value="312"
  delta={{ value: '-4', direction: 'down', semantics: 'positive' }}
/>
```

### Negative

Up reads as red, down reads as green — pick this for error counts, latency, time-to-first-byte.

**Negative semantics**

```tsx
<Stat
  label="Error count"
  value="32"
  delta={{ value: '+4', direction: 'up', semantics: 'negative' }}
/>
<Stat
  label="Error count"
  value="32"
  delta={{ value: '-12', direction: 'down', semantics: 'negative' }}
/>
```

### Neutral

The arrow still indicates direction but the colour stays muted — useful for counters where neither direction is "good" on its own.

**Neutral semantics**

```tsx
<Stat
  label="Active sessions"
  value="148"
  delta={{ value: '+6', direction: 'up', semantics: 'neutral' }}
/>
<Stat
  label="Active sessions"
  value="148"
  delta={{ value: '0', direction: 'neutral' }}
/>
```

`direction: 'neutral'` renders a horizontal bar instead of an up/down arrow — pair with a zero-change delta string.

## With a leading icon

Pass any node to `icon` for a leading glyph. The icon column is shown only when set.

**With icon**

```tsx
<Stat
  icon={<RevenueIcon />}
  label="MRR"
  value="$48,920"
  delta={{ value: '+3.4%', direction: 'up' }}
/>
```

## Without a delta

Drop `delta` entirely for a plain value tile. `helper` still renders if present.

**No delta**

```tsx
<Stat label="Total assets" value="1,294" />
<Stat label="Storage used" value="42.1 GB" helper="of 100 GB allocated" />
```

## Dashboard row

Stack several `Stat`s in a `Flex` to build a dashboard summary strip. Mix `semantics` so each metric reads the right way without you fighting the colours.

**Dashboard row**

```tsx
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
</Flex>
```

## Accessibility

- The label, value, and helper are rendered as `<p>` elements — semantic text that screen readers read top-to-bottom in source order.
- The delta arrow is a decorative SVG (`aria-hidden="true"`); the delta value itself is read alongside the value.
- Colour is never the only signal: the arrow direction always reinforces what the colour suggests, and the delta string includes the sign.
- `Stat` does not auto-announce updates. When the underlying metric changes live, wrap the relevant Stats in an `aria-live` region the parent owns, so you control politeness and rate.

## API Reference

### `<Stat>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Label rendered above the value. Required. |
| `value` | `ReactNode` | — | Primary value — pre-format on the consumer side (currency, units, locale). Required. |
| `delta` | `StatDelta` | — | Optional trend delta. Shape: `{ value, direction, semantics? }`. See below. |
| `helper` | `ReactNode` | — | Helper text below the delta (e.g. "vs. last month"). Optional. |
| `icon` | `ReactNode` | — | Leading icon rendered to the left of the content column. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Drives the value typography and overall density. |

### `StatDelta`

`StatDelta` is the shape of the `delta` prop — not a sub-component.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ReactNode` | — | Delta value to display (e.g. "+12.4%"). Required. |
| `direction` | `'up' \| 'down' \| 'neutral'` | — | Direction of change — drives the arrow icon. Required. |
| `semantics` | `'positive' \| 'negative' \| 'neutral'` | `'positive'` | What the "up" direction means for this metric. `positive`: up is good (revenue, signups) — green for up, red for down. `negative`: up is bad (errors, latency) — red for up, green for down. `neutral`: show direction with muted colour, no judgement. |
