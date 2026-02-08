import { useState, useRef, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CurveEditor } from './CurveEditor';
import type {
  CurveData,
  CurveBackgroundInfo,
  CurveBottomBarInfo,
} from './CurveEditor.types';
import { createLinearCurve, evaluateCurve, domainToCanvas } from './curveUtils';
import { CURVE_PRESETS } from './curvePresets';

const meta: Meta<typeof CurveEditor> = {
  title: 'Controls/CurveEditor',
  component: CurveEditor,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    width: { control: 'number' },
    height: { control: 'number' },
    showToolbar: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showAxisLabels: { control: 'boolean' },
    gridSubdivisions: { control: 'number' },
    allowAdd: { control: 'boolean' },
    allowDelete: { control: 'boolean' },
    maxKeyframes: { control: 'number' },
    lockEndpoints: { control: 'boolean' },
    clampY: { control: 'boolean' },
    snapToGrid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    curveWidth: { control: 'number' },
    curveColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof CurveEditor>;

// ─── Playground (fully interactive) ───

function PlaygroundExample() {
  const [curve, setCurve] = useState<CurveData>(() => {
    const preset = CURVE_PRESETS.find(p => p.id === 'ease-in-out');
    return preset?.curve ?? createLinearCurve();
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        onSelectionChange={setSelectedIds}
        width={500}
        height={300}
        showToolbar
        showGrid
        showAxisLabels
      />
      <div
        style={{
          fontSize: 11,
          color: '#999',
          fontFamily: 'monospace',
          lineHeight: 1.6,
        }}
      >
        <div>
          Keyframes: {curve.keyframes.length} | Selected: {selectedIds.length}
        </div>
        <div>
          Double-click to add keyframe | Click keyframe to select | Delete to
          remove
        </div>
        <div>
          Shift+click for multi-select | Ctrl+A to select all | 1-6 for tangent
          modes
        </div>
      </div>
    </div>
  );
}

export const Playground: Story = {
  render: () => <PlaygroundExample />,
};

// ─── Default ───

export const Default: Story = {
  args: {
    width: 400,
    height: 250,
    showToolbar: true,
    showGrid: true,
    showAxisLabels: true,
    gridSubdivisions: 4,
  },
};

// ─── Animation Preview ───

function AnimationPreviewExample() {
  const [curve, setCurve] = useState<CurveData>(() => {
    const preset = CURVE_PRESETS.find(p => p.id === 'ease-in-out');
    return preset?.curve ?? createLinearCurve();
  });

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const duration = 2000;
      const t = (elapsed % duration) / duration;
      setProgress(t);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  const yValue = evaluateCurve(curve, progress);

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div>
        <CurveEditor
          value={curve}
          onChange={setCurve}
          width={400}
          height={280}
          showToolbar
        />
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              background: isPlaying ? '#e53935' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <span
            style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}
          >
            t={progress.toFixed(3)} y={yValue.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Preview box that animates using the curve */}
      <div
        style={{
          width: 120,
          height: 280,
          background: '#1a1a2e',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: `translate(-50%, 0)`,
            bottom: `${yValue * 100}%`,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#6c5ce7',
            transition: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 10,
            color: '#666',
          }}
        >
          Preview
        </div>
      </div>
    </div>
  );
}

export const AnimationPreview: Story = {
  render: () => <AnimationPreviewExample />,
};

// ─── Max Keyframes ───

export const MaxKeyframes: Story = {
  args: {
    width: 400,
    height: 250,
    maxKeyframes: 5,
    showToolbar: true,
  },
};

// ─── Snap to Grid ───

export const SnapToGrid: Story = {
  args: {
    width: 400,
    height: 250,
    snapToGrid: true,
    gridSubdivisions: 8,
    showToolbar: true,
  },
};

// ─── Custom Domain ───

export const CustomDomain: Story = {
  args: {
    width: 500,
    height: 300,
    defaultValue: createLinearCurve([0, 100], [-1, 2]),
    labelX: 'Frames',
    labelY: 'Value',
    gridSubdivisions: 5,
    clampY: false,
    showToolbar: true,
  },
};

// ─── Read Only ───

const easeInOut = CURVE_PRESETS.find(p => p.id === 'ease-in-out');

export const ReadOnly: Story = {
  args: {
    width: 400,
    height: 250,
    readOnly: true,
    defaultValue: easeInOut?.curve,
    showToolbar: true,
  },
};

// ─── Disabled ───

export const Disabled: Story = {
  args: {
    width: 400,
    height: 250,
    disabled: true,
    defaultValue: easeInOut?.curve,
    showToolbar: true,
  },
};

// ─── No Toolbar ───

export const NoToolbar: Story = {
  args: {
    width: 400,
    height: 250,
    showToolbar: false,
  },
};

// ─── Sizes ───

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>sm</div>
        <CurveEditor size="sm" width={300} height={180} showToolbar />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>md</div>
        <CurveEditor size="md" width={400} height={250} showToolbar />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>lg</div>
        <CurveEditor size="lg" width={500} height={300} showToolbar />
      </div>
    </div>
  ),
};

// ─── Custom Color ───

export const CustomColor: Story = {
  args: {
    width: 400,
    height: 250,
    curveColor: '#ff6b6b',
    curveWidth: 3,
    defaultValue: easeInOut?.curve,
    showToolbar: true,
  },
};

// ─── All Tangent Modes ───

export const AllTangentModes: Story = {
  args: {
    width: 500,
    height: 300,
    showToolbar: true,
    defaultValue: {
      keyframes: [
        {
          x: 0,
          y: 0,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0.05, y: 0 },
          tangentMode: 'linear',
          id: 'k1',
        },
        {
          x: 0.2,
          y: 0.6,
          handleIn: { x: -0.06, y: -0.2 },
          handleOut: { x: 0.06, y: 0.2 },
          tangentMode: 'free',
          id: 'k2',
        },
        {
          x: 0.4,
          y: 0.3,
          handleIn: { x: -0.06, y: 0.1 },
          handleOut: { x: 0.06, y: -0.1 },
          tangentMode: 'aligned',
          id: 'k3',
        },
        {
          x: 0.6,
          y: 0.8,
          handleIn: { x: -0.06, y: -0.1 },
          handleOut: { x: 0.06, y: 0.1 },
          tangentMode: 'mirrored',
          id: 'k4',
        },
        {
          x: 0.8,
          y: 0.5,
          handleIn: { x: -0.06, y: 0 },
          handleOut: { x: 0.06, y: 0 },
          tangentMode: 'auto',
          id: 'k5',
        },
        {
          x: 1,
          y: 1,
          handleIn: { x: -0.05, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear',
          id: 'k6',
        },
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
};

// ─── All Presets Gallery ───

export const PresetsGallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}
    >
      {CURVE_PRESETS.map(preset => (
        <div key={preset.id}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
            {preset.label}
          </div>
          <CurveEditor
            width={200}
            height={150}
            defaultValue={preset.curve}
            showToolbar={false}
            readOnly
            showAxisLabels={false}
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Responsive ───

export const Responsive: Story = {
  render: args => (
    <div
      style={{
        width: '100%',
        maxWidth: 600,
        height: 300,
        border: '1px dashed #555',
        padding: 0,
      }}
    >
      <CurveEditor {...args} />
    </div>
  ),
  args: {
    responsive: true,
    showToolbar: true,
  },
};

// ─── Histogram Background (Photoshop / Lightroom style) ───

/**
 * Generate a realistic-looking histogram distribution.
 * Returns an array of 256 values (0-1) representing bin heights.
 */
function generateHistogram(): number[] {
  const bins = new Array<number>(256).fill(0);
  // Simulate a photo histogram with two peaks (shadows + highlights)
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    // Shadow peak around 0.2, highlight peak around 0.75
    const shadow = Math.exp(-((x - 0.2) ** 2) / 0.008) * 0.7;
    const mid = Math.exp(-((x - 0.5) ** 2) / 0.02) * 0.4;
    const highlight = Math.exp(-((x - 0.75) ** 2) / 0.012) * 0.55;
    // Add some noise for realism
    const noise = Math.sin(i * 0.8) * 0.03 + Math.sin(i * 2.1) * 0.02;
    bins[i] = Math.max(0, shadow + mid + highlight + noise);
  }
  // Normalize to 0-1
  const max = Math.max(...bins);
  if (max > 0) {
    for (let i = 0; i < bins.length; i++) {
      bins[i] = (bins[i] ?? 0) / max;
    }
  }
  return bins;
}

const HISTOGRAM_DATA = generateHistogram();

function HistogramExample() {
  const [curve, setCurve] = useState<CurveData>(() => {
    const preset = CURVE_PRESETS.find(p => p.id === 'ease-in-out');
    return preset?.curve ?? createLinearCurve();
  });

  const renderHistogram = useCallback(
    (ctx: CanvasRenderingContext2D, info: CurveBackgroundInfo) => {
      const { width, height, viewport, domainX, domainY } = info;
      const [dxMin, dxMax] = domainX;

      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#888';

      const binCount = HISTOGRAM_DATA.length;

      for (let i = 0; i < binCount; i++) {
        const val = HISTOGRAM_DATA[i] ?? 0;
        if (val <= 0) continue;

        // Map bin index to domain X
        const domX = dxMin + (i / (binCount - 1)) * (dxMax - dxMin);
        const domXNext = dxMin + ((i + 1) / (binCount - 1)) * (dxMax - dxMin);

        // Convert to canvas coords
        const { px: px1 } = domainToCanvas(
          domX,
          domainY[0],
          viewport,
          width,
          height
        );
        const { px: px2 } = domainToCanvas(
          domXNext,
          domainY[0],
          viewport,
          width,
          height
        );
        const { py: pyBottom } = domainToCanvas(
          domX,
          domainY[0],
          viewport,
          width,
          height
        );
        const { py: pyTop } = domainToCanvas(
          domX,
          domainY[0] + val * (domainY[1] - domainY[0]),
          viewport,
          width,
          height
        );

        ctx.fillRect(px1, pyTop, px2 - px1 + 1, pyBottom - pyTop);
      }

      ctx.globalAlpha = 1;
    },
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        width={500}
        height={300}
        showToolbar
        showGrid
        showAxisLabels
        renderBackground={renderHistogram}
        curveColor="#e0e0e0"
      />
      <div
        style={{
          fontSize: 11,
          color: '#999',
          fontFamily: 'monospace',
          lineHeight: 1.6,
        }}
      >
        Photoshop-style curves with histogram background
      </div>
    </div>
  );
}

export const HistogramBackground: Story = {
  render: () => <HistogramExample />,
};

// ─── RGB Channel Curves (Lightroom style) ───

function RGBChannelsExample() {
  const [redCurve, setRedCurve] = useState<CurveData>(() =>
    createLinearCurve()
  );
  const [greenCurve, setGreenCurve] = useState<CurveData>(() =>
    createLinearCurve()
  );
  const [blueCurve, setBlueCurve] = useState<CurveData>(() =>
    createLinearCurve()
  );

  const makeChannelRenderer = useCallback(
    (color: string) =>
      (ctx: CanvasRenderingContext2D, info: CurveBackgroundInfo) => {
        const { width, height, viewport, domainX, domainY } = info;

        // Draw a subtle gradient from black to the channel color
        const { px: px0 } = domainToCanvas(
          domainX[0],
          0,
          viewport,
          width,
          height
        );
        const { px: px1 } = domainToCanvas(
          domainX[1],
          0,
          viewport,
          width,
          height
        );
        const grad = ctx.createLinearGradient(px0, 0, px1, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.15)');
        grad.addColorStop(1, color);
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = grad;
        const { py: pyBottom } = domainToCanvas(
          0,
          domainY[0],
          viewport,
          width,
          height
        );
        const { py: pyTop } = domainToCanvas(
          0,
          domainY[1],
          viewport,
          width,
          height
        );
        ctx.fillRect(px0, pyTop, px1 - px0, pyBottom - pyTop);
        ctx.globalAlpha = 1;
      },
    []
  );

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#f55', marginBottom: 4 }}>Red</div>
        <CurveEditor
          value={redCurve}
          onChange={setRedCurve}
          width={240}
          height={200}
          showToolbar={false}
          curveColor="#f55"
          renderBackground={makeChannelRenderer('rgba(255,85,85,0.3)')}
        />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#5f5', marginBottom: 4 }}>
          Green
        </div>
        <CurveEditor
          value={greenCurve}
          onChange={setGreenCurve}
          width={240}
          height={200}
          showToolbar={false}
          curveColor="#5f5"
          renderBackground={makeChannelRenderer('rgba(85,255,85,0.3)')}
        />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#55f', marginBottom: 4 }}>Blue</div>
        <CurveEditor
          value={blueCurve}
          onChange={setBlueCurve}
          width={240}
          height={200}
          showToolbar={false}
          curveColor="#55f"
          renderBackground={makeChannelRenderer('rgba(85,85,255,0.3)')}
        />
      </div>
    </div>
  );
}

export const RGBChannels: Story = {
  render: () => <RGBChannelsExample />,
};

// ─── Bottom Bar ───

function BottomBarExample() {
  const [curve, setCurve] = useState<CurveData>(() => {
    const preset = CURVE_PRESETS.find(p => p.id === 'ease-in-out');
    return preset?.curve ?? createLinearCurve();
  });

  return (
    <CurveEditor
      value={curve}
      onChange={setCurve}
      width={500}
      height={280}
      showToolbar
      renderBottomBar={(info: CurveBottomBarInfo) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#aaa',
          }}
        >
          <span>Keyframes: {info.curve.keyframes.length}</span>
          <span>Selected: {info.selectedIds.length}</span>
          {info.selectedKeyframes.length === 1 && (
            <span>
              X: {info.selectedKeyframes[0]?.x.toFixed(3)} Y:{' '}
              {info.selectedKeyframes[0]?.y.toFixed(3)}
            </span>
          )}
        </div>
      )}
    />
  );
}

export const BottomBar: Story = {
  render: () => <BottomBarExample />,
};

// ─── Locked Tangents ───

export const LockedTangents: Story = {
  args: {
    width: 400,
    height: 250,
    lockTangents: true,
    showToolbar: true,
    defaultValue: easeInOut?.curve,
  },
};

// ─── Advanced RGB Channels (Photoshop / Affinity Photo style) ───

type Channel = 'master' | 'red' | 'green' | 'blue';

const CHANNEL_COLORS: Record<Channel, string> = {
  master: '#e0e0e0',
  red: '#ff5555',
  green: '#55ff55',
  blue: '#5555ff',
};

const CHANNEL_HISTOGRAM_COLORS: Record<Channel, string> = {
  master: 'rgba(180,180,180,0.3)',
  red: 'rgba(255,85,85,0.3)',
  green: 'rgba(85,255,85,0.3)',
  blue: 'rgba(85,85,255,0.3)',
};

function generateChannelHistogram(channel: Channel): number[] {
  const bins = new Array<number>(256).fill(0);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    let value: number;
    switch (channel) {
      case 'red':
        value =
          Math.exp(-((x - 0.3) ** 2) / 0.01) * 0.8 +
          Math.exp(-((x - 0.7) ** 2) / 0.015) * 0.5;
        break;
      case 'green':
        value =
          Math.exp(-((x - 0.45) ** 2) / 0.012) * 0.7 +
          Math.exp(-((x - 0.8) ** 2) / 0.008) * 0.4;
        break;
      case 'blue':
        value =
          Math.exp(-((x - 0.25) ** 2) / 0.015) * 0.6 +
          Math.exp(-((x - 0.6) ** 2) / 0.01) * 0.65;
        break;
      default:
        value =
          Math.exp(-((x - 0.2) ** 2) / 0.008) * 0.7 +
          Math.exp(-((x - 0.5) ** 2) / 0.02) * 0.4 +
          Math.exp(-((x - 0.75) ** 2) / 0.012) * 0.55;
    }
    const noise = Math.sin(i * 0.8) * 0.03 + Math.sin(i * 2.1) * 0.02;
    bins[i] = Math.max(0, value + noise);
  }
  const max = Math.max(...bins);
  if (max > 0) {
    for (let i = 0; i < bins.length; i++) {
      bins[i] = (bins[i] ?? 0) / max;
    }
  }
  return bins;
}

const CHANNEL_HISTOGRAMS: Record<Channel, number[]> = {
  master: generateChannelHistogram('master'),
  red: generateChannelHistogram('red'),
  green: generateChannelHistogram('green'),
  blue: generateChannelHistogram('blue'),
};

function AdvancedRGBExample() {
  const [activeChannel, setActiveChannel] = useState<Channel>('master');
  const [curves, setCurves] = useState<Record<Channel, CurveData>>(() => ({
    master: createLinearCurve([0, 255], [0, 255]),
    red: createLinearCurve([0, 255], [0, 255]),
    green: createLinearCurve([0, 255], [0, 255]),
    blue: createLinearCurve([0, 255], [0, 255]),
  }));

  const handleChange = useCallback(
    (newCurve: CurveData) => {
      setCurves(prev => ({ ...prev, [activeChannel]: newCurve }));
    },
    [activeChannel]
  );

  const renderHistogram = useCallback(
    (ctx: CanvasRenderingContext2D, info: CurveBackgroundInfo) => {
      const { width, height, viewport, domainX, domainY } = info;
      const [dxMin, dxMax] = domainX;
      const histogram = CHANNEL_HISTOGRAMS[activeChannel];

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = CHANNEL_HISTOGRAM_COLORS[activeChannel];

      const binCount = histogram.length;
      for (let i = 0; i < binCount; i++) {
        const val = histogram[i] ?? 0;
        if (val <= 0) continue;

        const domX = dxMin + (i / (binCount - 1)) * (dxMax - dxMin);
        const domXNext = dxMin + ((i + 1) / (binCount - 1)) * (dxMax - dxMin);

        const { px: px1 } = domainToCanvas(
          domX,
          domainY[0],
          viewport,
          width,
          height
        );
        const { px: px2 } = domainToCanvas(
          domXNext,
          domainY[0],
          viewport,
          width,
          height
        );
        const { py: pyBottom } = domainToCanvas(
          domX,
          domainY[0],
          viewport,
          width,
          height
        );
        const { py: pyTop } = domainToCanvas(
          domX,
          domainY[0] + val * (domainY[1] - domainY[0]),
          viewport,
          width,
          height
        );

        ctx.fillRect(px1, pyTop, px2 - px1 + 1, pyBottom - pyTop);
      }

      ctx.globalAlpha = 1;
    },
    [activeChannel]
  );

  const channels: Channel[] = ['master', 'red', 'green', 'blue'];

  return (
    <CurveEditor
      value={curves[activeChannel]}
      onChange={handleChange}
      width={500}
      height={320}
      showToolbar
      lockTangents
      gridSubdivisions={4}
      showAxisLabels
      labelX="Input"
      labelY="Output"
      curveColor={CHANNEL_COLORS[activeChannel]}
      renderBackground={renderHistogram}
      renderBottomBar={(info: CurveBottomBarInfo) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Channel buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            {channels.map(ch => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                style={{
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: activeChannel === ch ? 700 : 400,
                  border: `1px solid ${activeChannel === ch ? CHANNEL_COLORS[ch] : '#444'}`,
                  borderRadius: 3,
                  background:
                    activeChannel === ch
                      ? 'rgba(255,255,255,0.08)'
                      : 'transparent',
                  color: activeChannel === ch ? CHANNEL_COLORS[ch] : '#888',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {ch === 'master' ? 'Master' : ch.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Coordinates */}
          <div
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#888',
              display: 'flex',
              gap: 16,
            }}
          >
            {info.selectedKeyframes.length === 1 ? (
              <>
                <span>
                  Input: {Math.round(info.selectedKeyframes[0]?.x ?? 0)}
                </span>
                <span>
                  Output: {Math.round(info.selectedKeyframes[0]?.y ?? 0)}
                </span>
              </>
            ) : (
              <span>
                {info.selectedIds.length > 0
                  ? `${info.selectedIds.length} points selected`
                  : 'Click a point to see values'}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}

export const AdvancedRGBChannels: Story = {
  render: () => <AdvancedRGBExample />,
};
