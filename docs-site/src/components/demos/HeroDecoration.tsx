import '@/theme/darkTheme.css';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import {
  CurveEditor,
  ColorPicker,
  CartesianPicker,
} from '@/components/controls';
import { NumberInput, Slider, Select } from '@/components/controls';
import { Switch } from '@/components/primitives';
import { ViewportGizmo } from '@/components/editor/ViewportGizmo';
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
} from '@/components/editor/PropertyInspector';

export default function HeroDecoration() {
  return (
    <KeyboardContextProvider>
      <div
        style={{
          position: 'relative',
          fontSize: 'var(--etui-font-size-md)',
          fontFamily: 'var(--etui-font-family-sans)',
        }}
      >
        {/* Interaction blocker overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
          }}
        />

        {/* Fade-out mask at bottom */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            alignItems: 'start',
            maskImage:
              'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          }}
        >
          {/* Top-left: CurveEditor */}
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <CurveEditor width={200} height={140} />
          </div>

          {/* Top-right: ViewportGizmo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px',
            }}
          >
            <ViewportGizmo
              orientation={{ yaw: 35, pitch: -25 }}
              onOrbit={() => {}}
              onSnapToView={() => {}}
              diameter={120}
            />
          </div>

          {/* Bottom-left: ColorPicker inline */}
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <ColorPicker
              value="#2dd4bf"
              onChange={() => {}}
              inline
              presets={[
                { color: '#2dd4bf', label: 'Teal' },
                { color: '#6366f1', label: 'Indigo' },
                { color: '#f59e0b', label: 'Amber' },
                { color: '#ef4444', label: 'Red' },
              ]}
            />
          </div>

          {/* Bottom-right: PropertyPanel */}
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <PropertyPanel>
              <PropertySection title="Transform" defaultExpanded>
                <PropertyRow label="X">
                  <NumberInput value={128} onChange={() => {}} />
                </PropertyRow>
                <PropertyRow label="Y">
                  <NumberInput value={64} onChange={() => {}} />
                </PropertyRow>
                <PropertyRow label="Scale">
                  <Slider
                    value={75}
                    onChange={() => {}}
                    min={0}
                    max={100}
                    unit="%"
                  />
                </PropertyRow>
              </PropertySection>
              <PropertySection title="Display" defaultExpanded>
                <PropertyRow label="Visible">
                  <Switch checked={true} onChange={() => {}} label="" />
                </PropertyRow>
                <PropertyRow label="Mode">
                  <Select
                    value="normal"
                    onChange={() => {}}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'multiply', label: 'Multiply' },
                      { value: 'screen', label: 'Screen' },
                    ]}
                  />
                </PropertyRow>
              </PropertySection>
            </PropertyPanel>
          </div>
        </div>
      </div>
    </KeyboardContextProvider>
  );
}
