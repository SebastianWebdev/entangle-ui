// src/controls/NumberInput/NumberInput.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './NumberInput';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for NumberInput component
 * 
 * Showcases the advanced number input with Blender-like functionality
 * including drag interactions, mathematical expressions, and keyboard shortcuts.
 */
const meta: Meta<typeof NumberInput> = {
  title: 'Controls/NumberInput',
  component: NumberInput,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'var(--background-primary)',
          color: 'var(--text-primary)',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A specialized number input with Blender-like functionality for professional editor interfaces.

**Features:**
- **Drag to change:** Click and drag left/right to adjust values
- **Step buttons:** Hover to reveal increment/decrement arrows
- **Mathematical expressions:** Enter formulas like \`pi * 2\`, \`sqrt(16)\`, \`sin(45)\`
- **Modifier keys:** Ctrl (large steps), Shift (precision), Minus (negate)
- **Smart limits:** Soft limits for dragging, hard limits for keyboard input
- **Unit display:** Show units like "px", "%", "°" 

**Keyboard shortcuts:**
- \`Arrow Up/Down\`: Increment/decrement
- \`Enter\`: Start/finish editing
- \`Escape\`: Cancel editing
- \`Minus\`: Negate value (when not editing)
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Current numeric value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    step: {
      control: 'number',
      description: 'Step size for increment/decrement',
      table: {
        defaultValue: { summary: '1' },
      },
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value (hard limit)',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value (hard limit)',
    },
    softMin: {
      control: 'number',
      description: 'Soft minimum for drag operations',
    },
    softMax: {
      control: 'number',
      description: 'Soft maximum for drag operations',
    },
    precision: {
      control: 'number',
      description: 'Number of decimal places',
    },
    unit: {
      control: 'text',
      description: 'Unit suffix to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    allowExpressions: {
      control: 'boolean',
      description: 'Allow mathematical expressions',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    dragSensitivity: {
      control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
      description: 'Drag sensitivity multiplier',
      table: {
        defaultValue: { summary: '1' },
      },
    },
    showStepButtons: {
      control: 'boolean',
      description: 'Show increment/decrement buttons on hover',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

// Basic stories
export const Default: Story = {
  args: {
    value: 42,
    label: 'Value',
    placeholder: 'Enter number...',
  },
};

export const WithUnit: Story = {
  args: {
    value: 90,
    label: 'Rotation',
    unit: '°',
    step: 15,
    min: 0,
    max: 360,
  },
};

export const WithExpressions: Story = {
  args: {
    value: 6.28,
    label: 'Radius',
    unit: 'px',
    placeholder: 'Try: pi * 2, sqrt(16), sin(45)',
    helperText: 'Supports mathematical expressions with functions and constants',
  },
};

// Size variants
export const Sizes: Story = {
  render: () => {
    const [small, setSmall] = React.useState(10);
    const [medium, setMedium] = React.useState(20);
    const [large, setLarge] = React.useState(30);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NumberInput
          size="sm"
          value={small}
          onChange={setSmall}
          label="Small Size"
          unit="px"
        />
        <NumberInput
          size="md"
          value={medium}
          onChange={setMedium}
          label="Medium Size (default)"
          unit="px"
        />
        <NumberInput
          size="lg"
          value={large}
          onChange={setLarge}
          label="Large Size"
          unit="px"
        />
      </div>
    );
  },
};

// Precision and steps
export const PrecisionControl: Story = {
  render: () => {
    const [value, setValue] = React.useState(3.14159);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Pi Value"
        precision={3}
        step={0.001}
        precisionStep={0.0001}
        largeStep={0.01}
        helperText="Use Ctrl for large steps (0.01), Shift for precision (0.0001)"
      />
    );
  },
};

export const IntegerOnly: Story = {
  args: {
    value: 42,
    label: 'Item Count',
    step: 1,
    min: 0,
    precision: 0,
    unit: 'items',
    helperText: 'Integer values only',
  },
};

// Limits and constraints
export const HardLimits: Story = {
  render: () => {
    const [value, setValue] = React.useState(50);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Progress"
        min={0}
        max={100}
        step={5}
        unit="%"
        helperText="Hard limited to 0-100 range"
      />
    );
  },
};

export const SoftAndHardLimits: Story = {
  render: () => {
    const [value, setValue] = React.useState(0);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Temperature"
        softMin={-50}
        softMax={50}
        min={-273.15}
        max={1000}
        unit="°C"
        step={1}
        helperText="Drag: -50 to 50°C | Keyboard: -273.15 to 1000°C"
      />
    );
  },
};

// States
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <NumberInput
        value={100}
        onChange={() => {}}
        label="Normal State"
        unit="px"
      />
      <NumberInput
        value={200}
        onChange={() => {}}
        label="Disabled State"
        unit="px"
        disabled
        helperText="Cannot be modified"
      />
      <NumberInput
        value={300}
        onChange={() => {}}
        label="Read Only State"
        unit="px"
        readOnly
        helperText="Value is read-only"
      />
      <NumberInput
        value={0}
        onChange={() => {}}
        label="Required Field"
        unit="px"
        required
        helperText="This field is required"
      />
    </div>
  ),
};

// Validation
export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = React.useState(-5);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Positive Numbers Only"
        unit="px"
        validate={(v) => v < 0 ? 'Value must be positive' : undefined}
        helperText={value >= 0 ? 'Enter a positive number' : undefined}
      />
    );
  },
};

export const ComplexValidation: Story = {
  render: () => {
    const [value, setValue] = React.useState(7);
    
    const validate = (v: number) => {
      if (v < 1) return 'Value must be at least 1';
      if (v > 100) return 'Value must be at most 100';
      if (v % 2 !== 0) return 'Value must be even';
      return undefined;
    };
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Even Numbers Only"
        validate={validate}
        min={1}
        max={100}
        step={2}
        helperText="Enter an even number between 1 and 100"
      />
    );
  },
};

// Custom formatting
export const CurrencyFormatting: Story = {
  render: () => {
    const [value, setValue] = React.useState(1234567.89);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Price"
        formatValue={(v) => v.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })}
        parseValue={(input) => {
          const cleaned = input.replace(/[,$]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? null : parsed;
        }}
        unit="USD"
        step={100}
        precision={2}
        helperText="Formatted with thousand separators"
      />
    );
  },
};

export const PercentageFormatting: Story = {
  render: () => {
    const [value, setValue] = React.useState(0.754);
    
    return (
      <NumberInput
        value={value}
        onChange={setValue}
        label="Success Rate"
        formatValue={(v) => (v * 100).toFixed(1)}
        parseValue={(input) => {
          const cleaned = input.replace(/%/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? null : parsed / 100;
        }}
        unit="%"
        min={0}
        max={1}
        step={0.01}
        precision={3}
        helperText="Stored as decimal (0-1), displayed as percentage"
      />
    );
  },
};

// Dynamic units
export const DynamicUnits: Story = {
  render: () => {
    const [bytes, setBytes] = React.useState(1536);
    
    const formatUnit = (value: number) => {
      if (value >= 1073741824) return 'GB';
      if (value >= 1048576) return 'MB';
      if (value >= 1024) return 'KB';
      return 'B';
    };
    
    const formatDisplay = (value: number) => {
      if (value >= 1073741824) return (value / 1073741824).toFixed(2);
      if (value >= 1048576) return (value / 1048576).toFixed(2);
      if (value >= 1024) return (value / 1024).toFixed(2);
      return value.toString();
    };
    
    return (
      <NumberInput
        value={bytes}
        onChange={setBytes}
        label="File Size"
        formatValue={formatDisplay}
        unit={formatUnit}
        min={0}
        step={1024}
        helperText="Unit changes based on value"
      />
    );
  },
};

// Without step buttons
export const NoStepButtons: Story = {
  args: {
    value: 50,
    label: 'Slider-like Input',
    showStepButtons: false,
    unit: '%',
    min: 0,
    max: 100,
    helperText: 'Drag or type to change value',
  },
};

// Real-world examples
export const ColorEditor: Story = {
  render: () => {
    const [h, setH] = React.useState(210);
    const [s, setS] = React.useState(75);
    const [l, setL] = React.useState(50);
    const [a, setA] = React.useState(1);
    
    const color = `hsla(${h}, ${s}%, ${l}%, ${a})`;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          HSL Color Editor
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <NumberInput
            value={h}
            onChange={setH}
            label="Hue"
            unit="°"
            min={0}
            max={360}
            step={1}
            size="sm"
          />
          <NumberInput
            value={s}
            onChange={setS}
            label="Saturation"
            unit="%"
            min={0}
            max={100}
            step={1}
            size="sm"
          />
          <NumberInput
            value={l}
            onChange={setL}
            label="Lightness"
            unit="%"
            min={0}
            max={100}
            step={1}
            size="sm"
          />
          <NumberInput
            value={a}
            onChange={setA}
            label="Alpha"
            min={0}
            max={1}
            step={0.01}
            precision={2}
            size="sm"
          />
        </div>
        
        <div style={{ 
          height: '60px',
          backgroundColor: color,
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: l > 50 ? 'black' : 'white',
          fontWeight: '600'
        }}>
          {color}
        </div>
      </div>
    );
  },
};

export const ViewportDimensions: Story = {
  render: () => {
    const [width, setWidth] = React.useState(1920);
    const [height, setHeight] = React.useState(1080);
    const aspectRatio = width / height;
    
    const commonResolutions = [
      { label: '720p', w: 1280, h: 720 },
      { label: '1080p', w: 1920, h: 1080 },
      { label: '1440p', w: 2560, h: 1440 },
      { label: '4K', w: 3840, h: 2160 },
    ];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Viewport Settings
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <NumberInput
            value={width}
            onChange={setWidth}
            label="Width"
            unit="px"
            min={1}
            step={10}
            allowExpressions
          />
          <NumberInput
            value={height}
            onChange={setHeight}
            label="Height"
            unit="px"
            min={1}
            step={10}
            allowExpressions
          />
        </div>
        
        <div style={{ 
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          <div>Aspect Ratio: <strong>{aspectRatio.toFixed(3)}</strong></div>
          <div>Resolution: <strong>{width} × {height}</strong></div>
        </div>
        
        <div>
          <div style={{ fontSize: '12px', marginBottom: '0.5rem', opacity: 0.7 }}>
            Quick presets:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {commonResolutions.map(res => (
              <button
                key={res.label}
                onClick={() => {
                  setWidth(res.w);
                  setHeight(res.h);
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {res.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const TransformPanel: Story = {
  render: () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0, z: 0 });
    const [rotation, setRotation] = React.useState({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = React.useState({ x: 1, y: 1, z: 1 });
    const [uniformScale, setUniformScale] = React.useState(true);
    
    const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
      if (uniformScale) {
        setScale({ x: value, y: value, z: value });
      } else {
        setScale(prev => ({ ...prev, [axis]: value }));
      }
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Transform Properties
        </h3>
        
        {/* Position */}
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', opacity: 0.7 }}>
            Position
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <NumberInput
              value={position.x}
              onChange={(v) => setPosition(prev => ({ ...prev, x: v }))}
              label="X"
              unit="m"
              step={0.1}
              precision={2}
              size="sm"
            />
            <NumberInput
              value={position.y}
              onChange={(v) => setPosition(prev => ({ ...prev, y: v }))}
              label="Y"
              unit="m"
              step={0.1}
              precision={2}
              size="sm"
            />
            <NumberInput
              value={position.z}
              onChange={(v) => setPosition(prev => ({ ...prev, z: v }))}
              label="Z"
              unit="m"
              step={0.1}
              precision={2}
              size="sm"
            />
          </div>
        </div>
        
        {/* Rotation */}
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', opacity: 0.7 }}>
            Rotation
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <NumberInput
              value={rotation.x}
              onChange={(v) => setRotation(prev => ({ ...prev, x: v }))}
              label="X"
              unit="°"
              min={-180}
              max={180}
              step={15}
              size="sm"
            />
            <NumberInput
              value={rotation.y}
              onChange={(v) => setRotation(prev => ({ ...prev, y: v }))}
              label="Y"
              unit="°"
              min={-180}
              max={180}
              step={15}
              size="sm"
            />
            <NumberInput
              value={rotation.z}
              onChange={(v) => setRotation(prev => ({ ...prev, z: v }))}
              label="Z"
              unit="°"
              min={-180}
              max={180}
              step={15}
              size="sm"
            />
          </div>
        </div>
        
        {/* Scale */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
              Scale
            </h4>
            <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="checkbox"
                checked={uniformScale}
                onChange={(e) => setUniformScale(e.target.checked)}
                style={{ width: '12px', height: '12px' }}
              />
              Uniform
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <NumberInput
              value={scale.x}
              onChange={(v) => handleScaleChange('x', v)}
              label="X"
              min={0.01}
              step={0.1}
              precision={2}
              size="sm"
            />
            <NumberInput
              value={scale.y}
              onChange={(v) => handleScaleChange('y', v)}
              label="Y"
              min={0.01}
              step={0.1}
              precision={2}
              size="sm"
              disabled={uniformScale}
            />
            <NumberInput
              value={scale.z}
              onChange={(v) => handleScaleChange('z', v)}
              label="Z"
              min={0.01}
              step={0.1}
              precision={2}
              size="sm"
              disabled={uniformScale}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Expression examples
export const ExpressionShowcase: Story = {
  render: () => {
    const [result, setResult] = React.useState(0);
    const [history, setHistory] = React.useState<string[]>([]);
    
    const examples = [
      { expr: 'pi * 2', desc: '2π' },
      { expr: 'sqrt(16)', desc: 'Square root' },
      { expr: 'sin(45)', desc: 'Sine function' },
      { expr: '2^8', desc: 'Power' },
      { expr: '(10 + 5) * 2', desc: 'Parentheses' },
      { expr: 'abs(-42)', desc: 'Absolute value' },
      { expr: 'log(100)', desc: 'Logarithm' },
      { expr: 'floor(3.7)', desc: 'Floor' },
      { expr: 'ceil(3.2)', desc: 'Ceiling' },
    ];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Mathematical Expression Calculator
        </h3>
        
        <NumberInput
          value={result}
          onChange={(v) => {
            setResult(v);
            if (history[history.length - 1] !== v.toString()) {
              setHistory(prev => [...prev.slice(-4), v.toString()]);
            }
          }}
          label="Expression"
          placeholder="Enter expression..."
          allowExpressions={true}
          precision={6}
          helperText="Type mathematical expressions and press Enter"
        />
        
        <div style={{ 
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '0.5rem' }}>
            Try these examples:
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            {examples.map((example, i) => (
              <div
                key={i}
                style={{ 
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                title={`Click to try: ${example.expr}`}
              >
                <code style={{ fontFamily: 'monospace' }}>{example.expr}</code>
                <div style={{ opacity: 0.6, marginTop: '2px' }}>{example.desc}</div>
              </div>
            ))}
          </div>
        </div>
        
        {history.length > 0 && (
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Recent: {history.join(' → ')}
          </div>
        )}
      </div>
    );
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  render: () => {
    const [value, setValue] = React.useState(50);
    const [showFeatures, setShowFeatures] = React.useState(true);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Interactive Demo - Try All Features
        </h3>
        
        <NumberInput
          value={value}
          onChange={setValue}
          label="Test All Features"
          unit="%"
          step={5}
          precisionStep={0.1}
          largeStep={25}
          min={0}
          max={100}
          softMin={20}
          softMax={80}
          precision={1}
          placeholder="Type expression or drag..."
          helperText="Experiment with all the interactive features"
        />
        
        {showFeatures && (
          <div style={{ 
            padding: '1rem',
            backgroundColor: 'rgba(0, 122, 204, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(0, 122, 204, 0.3)',
            fontSize: '11px'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '12px' }}>
              🎮 Interactive Features:
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <strong>Mouse Controls:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                  <li>Hover to reveal step buttons</li>
                  <li>Click and drag to change value</li>
                  <li>Hold Shift while dragging for precision</li>
                  <li>Hold Ctrl while dragging for large steps</li>
                </ul>
              </div>
              
              <div>
                <strong>Keyboard Controls:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                  <li>Arrow Up/Down to increment</li>
                  <li>Enter to start editing</li>
                  <li>Escape to cancel editing</li>
                  <li>Minus key to negate value</li>
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '0.75rem' }}>
              <strong>Mathematical Expressions:</strong>
              <p style={{ margin: '0.25rem 0' }}>
                Type expressions like: <code>pi * 2</code>, <code>sqrt(25)</code>, 
                <code>sin(45)</code>, <code>100 / 3</code>
              </p>
            </div>
            
            <button
              onClick={() => setShowFeatures(false)}
              style={{
                marginTop: '0.75rem',
                padding: '0.25rem 0.75rem',
                fontSize: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              Hide Instructions
            </button>
          </div>
        )}
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <div>
            <strong>Current Value:</strong> {value}%
          </div>
          <div>
            <strong>Drag Limits:</strong> 20% - 80%
          </div>
          <div>
            <strong>Hard Limits:</strong> 0% - 100%
          </div>
          <div>
            <strong>Step Sizes:</strong> 5 / 0.1 / 25
          </div>
        </div>
      </div>
    );
  },
};