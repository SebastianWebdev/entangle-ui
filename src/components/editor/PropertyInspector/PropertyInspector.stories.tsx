import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PropertyPanel } from './PropertyPanel';
import { PropertySection } from './PropertySection';
import { PropertyRow } from './PropertyRow';
import { PropertyGroup } from './PropertyGroup';
import { usePropertyUndo } from './usePropertyUndo';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';
import { ColorPicker } from '@/components/controls/ColorPicker';

const meta: Meta<typeof PropertyPanel> = {
  title: 'Editor/PropertyInspector',
  component: PropertyPanel,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    searchable: { control: 'boolean' },
    maxHeight: { control: 'text' },
    contentTopSpacing: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof PropertyPanel>;

// --- Default ---

export const Default: Story = {
  render: args => (
    <div style={{ width: 320 }}>
      <PropertyPanel {...args}>
        <PropertySection title="Transform">
          <PropertyRow label="Position">
            <span style={{ color: '#aaa', fontSize: 11 }}>
              0.00, 0.00, 0.00
            </span>
          </PropertyRow>
          <PropertyRow label="Rotation">
            <span style={{ color: '#aaa', fontSize: 11 }}>
              0.00, 0.00, 0.00
            </span>
          </PropertyRow>
          <PropertyRow label="Scale">
            <span style={{ color: '#aaa', fontSize: 11 }}>
              1.00, 1.00, 1.00
            </span>
          </PropertyRow>
        </PropertySection>
        <PropertySection title="Material">
          <PropertyRow label="Shader">
            <span style={{ color: '#aaa', fontSize: 11 }}>Standard</span>
          </PropertyRow>
          <PropertyRow label="Color">
            <span style={{ color: '#aaa', fontSize: 11 }}>#ffffff</span>
          </PropertyRow>
          <PropertyRow label="Roughness">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.50</span>
          </PropertyRow>
        </PropertySection>
        <PropertySection title="Physics" defaultExpanded={false}>
          <PropertyRow label="Mass">
            <span style={{ color: '#aaa', fontSize: 11 }}>1.00 kg</span>
          </PropertyRow>
          <PropertyRow label="Friction">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.30</span>
          </PropertyRow>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};

// --- Sizes ---

export const Sizes: Story = {
  render: () => (
    <Stack
      spacing={4}
      style={{ flexDirection: 'row', alignItems: 'flex-start' }}
    >
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size} style={{ width: 280 }}>
          <Text size="sm" style={{ marginBottom: 4 }}>
            Size: {size}
          </Text>
          <PropertyPanel size={size}>
            <PropertySection title="Transform">
              <PropertyRow label="Position">
                <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
              </PropertyRow>
              <PropertyRow label="Rotation">
                <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
              </PropertyRow>
            </PropertySection>
          </PropertyPanel>
        </div>
      ))}
    </Stack>
  ),
};

// --- With Search ---

export const WithSearch: Story = {
  render: () => {
    const SearchExample = () => {
      const [query, setQuery] = useState('');

      const rows = [
        { label: 'Position', value: '0, 0, 0' },
        { label: 'Rotation', value: '0, 0, 0' },
        { label: 'Scale', value: '1, 1, 1' },
        { label: 'Color', value: '#ffffff' },
        { label: 'Roughness', value: '0.50' },
      ];

      return (
        <div style={{ width: 320 }}>
          <PropertyPanel searchable onSearchChange={setQuery}>
            <PropertySection title="Properties">
              {rows.map(row => (
                <PropertyRow
                  key={row.label}
                  label={row.label}
                  visible={
                    query === '' ||
                    row.label.toLowerCase().includes(query.toLowerCase())
                  }
                >
                  <span style={{ color: '#aaa', fontSize: 11 }}>
                    {row.value}
                  </span>
                </PropertyRow>
              ))}
            </PropertySection>
          </PropertyPanel>
        </div>
      );
    };

    return <SearchExample />;
  },
};

// --- Modified Properties ---

export const ModifiedProperties: Story = {
  render: () => {
    const ModifiedExample = () => {
      const [values, setValues] = useState({
        position: '1.50, 0.00, -3.20',
        rotation: '0.00, 0.00, 0.00',
        scale: '2.00, 2.00, 2.00',
      });

      const defaults = {
        position: '0.00, 0.00, 0.00',
        rotation: '0.00, 0.00, 0.00',
        scale: '1.00, 1.00, 1.00',
      };

      return (
        <div style={{ width: 320 }}>
          <PropertyPanel>
            <PropertySection title="Transform">
              <PropertyRow
                label="Position"
                modified={values.position !== defaults.position}
                onReset={() =>
                  setValues(v => ({ ...v, position: defaults.position }))
                }
              >
                <span style={{ color: '#aaa', fontSize: 11 }}>
                  {values.position}
                </span>
              </PropertyRow>
              <PropertyRow
                label="Rotation"
                modified={values.rotation !== defaults.rotation}
                onReset={() =>
                  setValues(v => ({ ...v, rotation: defaults.rotation }))
                }
              >
                <span style={{ color: '#aaa', fontSize: 11 }}>
                  {values.rotation}
                </span>
              </PropertyRow>
              <PropertyRow
                label="Scale"
                modified={values.scale !== defaults.scale}
                onReset={() =>
                  setValues(v => ({ ...v, scale: defaults.scale }))
                }
              >
                <span style={{ color: '#aaa', fontSize: 11 }}>
                  {values.scale}
                </span>
              </PropertyRow>
            </PropertySection>
          </PropertyPanel>
        </div>
      );
    };

    return <ModifiedExample />;
  },
};

// --- Full-Width Rows ---

export const FullWidthRows: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PropertyPanel>
        <PropertySection title="Settings">
          <PropertyRow label="Name">
            <span style={{ color: '#aaa', fontSize: 11 }}>Cube.001</span>
          </PropertyRow>
          <PropertyRow label="Description" fullWidth>
            <textarea
              style={{
                width: '100%',
                minHeight: 60,
                background: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: 4,
                color: '#aaa',
                fontSize: 11,
                padding: 4,
                resize: 'vertical',
              }}
              defaultValue="A default cube object in the scene."
            />
          </PropertyRow>
          <PropertyRow label="Tags" fullWidth>
            <div
              style={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
              }}
            >
              {['geometry', 'mesh', 'default'].map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: '#333',
                    color: '#aaa',
                    fontSize: 10,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </PropertyRow>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};

// --- With Groups ---

export const WithGroups: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PropertyPanel>
        <PropertySection title="Material">
          <PropertyRow label="Shader">
            <span style={{ color: '#aaa', fontSize: 11 }}>Standard PBR</span>
          </PropertyRow>
          <PropertyRow label="Color">
            <span style={{ color: '#aaa', fontSize: 11 }}>#ff6b35</span>
          </PropertyRow>
          <PropertyRow label="Roughness">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.45</span>
          </PropertyRow>

          <PropertyGroup title="Textures">
            <PropertyRow label="Albedo">
              <span style={{ color: '#aaa', fontSize: 11 }}>
                brick_albedo.png
              </span>
            </PropertyRow>
            <PropertyRow label="Normal">
              <span style={{ color: '#aaa', fontSize: 11 }}>
                brick_normal.png
              </span>
            </PropertyRow>
            <PropertyRow label="Roughness">
              <span style={{ color: '#aaa', fontSize: 11 }}>None</span>
            </PropertyRow>
          </PropertyGroup>

          <PropertyGroup title="Advanced">
            <PropertyRow label="Emission">
              <span style={{ color: '#aaa', fontSize: 11 }}>0.00</span>
            </PropertyRow>
            <PropertyRow label="Alpha">
              <span style={{ color: '#aaa', fontSize: 11 }}>1.00</span>
            </PropertyRow>
          </PropertyGroup>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};

// --- Custom Split Ratio ---

export const CustomSplitRatio: Story = {
  render: () => (
    <Stack
      spacing={4}
      style={{ flexDirection: 'row', alignItems: 'flex-start' }}
    >
      <div style={{ width: 280 }}>
        <Text size="sm" style={{ marginBottom: 4 }}>
          Split: [30, 70]
        </Text>
        <PropertyPanel>
          <PropertySection title="Transform">
            <PropertyRow label="Position" splitRatio={[30, 70]}>
              <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
            </PropertyRow>
            <PropertyRow label="Rotation" splitRatio={[30, 70]}>
              <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
            </PropertyRow>
          </PropertySection>
        </PropertyPanel>
      </div>
      <div style={{ width: 280 }}>
        <Text size="sm" style={{ marginBottom: 4 }}>
          Split: [50, 50]
        </Text>
        <PropertyPanel>
          <PropertySection title="Transform">
            <PropertyRow label="Position" splitRatio={[50, 50]}>
              <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
            </PropertyRow>
            <PropertyRow label="Rotation" splitRatio={[50, 50]}>
              <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
            </PropertyRow>
          </PropertySection>
        </PropertyPanel>
      </div>
    </Stack>
  ),
};

// --- Header & Footer ---

export const HeaderFooter: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PropertyPanel
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
            }}
          >
            <span style={{ fontSize: 14 }}>Cube.001</span>
            <span
              style={{
                fontSize: 10,
                color: '#888',
                padding: '1px 4px',
                background: '#333',
                borderRadius: 3,
              }}
            >
              Mesh
            </span>
          </div>
        }
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '4px 8px',
            }}
          >
            <button
              style={{
                background: '#333',
                border: '1px solid #555',
                color: '#ccc',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Reset All
            </button>
            <button
              style={{
                background: '#007acc',
                border: 'none',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Apply
            </button>
          </div>
        }
      >
        <PropertySection title="Transform">
          <PropertyRow label="Position">
            <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
          </PropertyRow>
          <PropertyRow label="Rotation">
            <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
          </PropertyRow>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};

// --- With Scroll ---

export const WithScrollArea: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PropertyPanel maxHeight={300}>
        <PropertySection title="Transform">
          <PropertyRow label="Position">
            <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
          </PropertyRow>
          <PropertyRow label="Rotation">
            <span style={{ color: '#aaa', fontSize: 11 }}>0, 0, 0</span>
          </PropertyRow>
          <PropertyRow label="Scale">
            <span style={{ color: '#aaa', fontSize: 11 }}>1, 1, 1</span>
          </PropertyRow>
        </PropertySection>
        <PropertySection title="Material">
          <PropertyRow label="Shader">
            <span style={{ color: '#aaa', fontSize: 11 }}>Standard PBR</span>
          </PropertyRow>
          <PropertyRow label="Color">
            <span style={{ color: '#aaa', fontSize: 11 }}>#ffffff</span>
          </PropertyRow>
          <PropertyRow label="Roughness">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.50</span>
          </PropertyRow>
          <PropertyRow label="Metallic">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.00</span>
          </PropertyRow>
        </PropertySection>
        <PropertySection title="Physics">
          <PropertyRow label="Mass">
            <span style={{ color: '#aaa', fontSize: 11 }}>1.00 kg</span>
          </PropertyRow>
          <PropertyRow label="Friction">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.30</span>
          </PropertyRow>
          <PropertyRow label="Bounciness">
            <span style={{ color: '#aaa', fontSize: 11 }}>0.00</span>
          </PropertyRow>
        </PropertySection>
        <PropertySection title="Audio">
          <PropertyRow label="Volume">
            <span style={{ color: '#aaa', fontSize: 11 }}>1.00</span>
          </PropertyRow>
          <PropertyRow label="Pitch">
            <span style={{ color: '#aaa', fontSize: 11 }}>1.00</span>
          </PropertyRow>
          <PropertyRow label="Spatial">
            <span style={{ color: '#aaa', fontSize: 11 }}>true</span>
          </PropertyRow>
        </PropertySection>
      </PropertyPanel>
    </div>
  ),
};

// --- Inspector Example (with usePropertyUndo) ---

export const InspectorExample: Story = {
  render: () => {
    const InspectorDemo = () => {
      const [position, setPosition] = useState([0, 0, 0]);
      const { record, undo, canUndo } = usePropertyUndo<number[]>();

      const handlePositionChange = (axis: number, value: number) => {
        const prev = [...position];
        const next = [...position];
        next[axis] = value;
        record({
          propertyId: `position.${axis}`,
          previousValue: prev,
          newValue: next,
          label: `Change position ${['X', 'Y', 'Z'][axis]}`,
        });
        setPosition(next);
      };

      const handleUndo = () => {
        const entry = undo();
        if (entry) {
          setPosition(entry.previousValue);
        }
      };

      return (
        <div style={{ width: 320 }}>
          <PropertyPanel
            header={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500 }}>Cube.001</span>
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  style={{
                    background: 'transparent',
                    border: '1px solid #555',
                    color: canUndo ? '#ccc' : '#555',
                    padding: '2px 8px',
                    borderRadius: 3,
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                    fontSize: 10,
                  }}
                >
                  Undo
                </button>
              </div>
            }
          >
            <PropertySection title="Transform">
              <PropertyRow label="Position X" modified={position[0] !== 0}>
                <input
                  type="number"
                  value={position[0]}
                  onChange={e =>
                    handlePositionChange(0, parseFloat(e.target.value) || 0)
                  }
                  style={{
                    width: '100%',
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    color: '#ccc',
                    fontSize: 11,
                    padding: '2px 4px',
                  }}
                />
              </PropertyRow>
              <PropertyRow label="Position Y" modified={position[1] !== 0}>
                <input
                  type="number"
                  value={position[1]}
                  onChange={e =>
                    handlePositionChange(1, parseFloat(e.target.value) || 0)
                  }
                  style={{
                    width: '100%',
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    color: '#ccc',
                    fontSize: 11,
                    padding: '2px 4px',
                  }}
                />
              </PropertyRow>
              <PropertyRow label="Position Z" modified={position[2] !== 0}>
                <input
                  type="number"
                  value={position[2]}
                  onChange={e =>
                    handlePositionChange(2, parseFloat(e.target.value) || 0)
                  }
                  style={{
                    width: '100%',
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: 3,
                    color: '#ccc',
                    fontSize: 11,
                    padding: '2px 4px',
                  }}
                />
              </PropertyRow>
            </PropertySection>

            <PropertySection title="Display">
              <PropertyRow label="Visible">
                <span style={{ color: '#aaa', fontSize: 11 }}>true</span>
              </PropertyRow>
              <PropertyRow label="Opacity">
                <span style={{ color: '#aaa', fontSize: 11 }}>1.00</span>
              </PropertyRow>
              <PropertyRow label="Layer">
                <span style={{ color: '#aaa', fontSize: 11 }}>Default</span>
              </PropertyRow>
            </PropertySection>

            <PropertySection title="Material">
              <PropertyRow label="Type">
                <span style={{ color: '#aaa', fontSize: 11 }}>
                  Standard PBR
                </span>
              </PropertyRow>
              <PropertyRow label="Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      background: '#ff6b35',
                      border: '1px solid #555',
                    }}
                  />
                  <span style={{ color: '#aaa', fontSize: 11 }}>#ff6b35</span>
                </div>
              </PropertyRow>
              <PropertyRow label="Roughness">
                <span style={{ color: '#aaa', fontSize: 11 }}>0.45</span>
              </PropertyRow>

              <PropertyGroup title="Textures">
                <PropertyRow label="Albedo">
                  <span style={{ color: '#aaa', fontSize: 11 }}>
                    brick_albedo.png
                  </span>
                </PropertyRow>
                <PropertyRow label="Normal">
                  <span style={{ color: '#aaa', fontSize: 11 }}>None</span>
                </PropertyRow>
              </PropertyGroup>
            </PropertySection>
          </PropertyPanel>
        </div>
      );
    };

    return <InspectorDemo />;
  },
};

// --- With ColorPicker ---

export const WithColorPicker: Story = {
  render: () => {
    const ColorPickerExample = () => {
      const [baseColor, setBaseColor] = useState('#ff6b35');
      const [emissionColor, setEmissionColor] = useState('#000000');
      const [roughness, setRoughness] = useState('#808080');

      return (
        <div style={{ width: 320 }}>
          <PropertyPanel>
            <PropertySection title="Material">
              <PropertyRow label="Shader">
                <span style={{ color: '#aaa', fontSize: 11 }}>
                  Standard PBR
                </span>
              </PropertyRow>

              <PropertyRow label="Base Color">
                <ColorPicker
                  value={baseColor}
                  onChange={setBaseColor}
                  size="sm"
                  label={baseColor}
                />
              </PropertyRow>

              <PropertyRow label="Emission">
                <ColorPicker
                  value={emissionColor}
                  onChange={setEmissionColor}
                  size="sm"
                  label={emissionColor}
                />
              </PropertyRow>

              <PropertyRow label="Roughness Map">
                <ColorPicker
                  value={roughness}
                  onChange={setRoughness}
                  size="sm"
                  showAlpha
                  format="rgba"
                  label={roughness}
                />
              </PropertyRow>
            </PropertySection>

            <PropertySection title="Base Color (Inline)">
              <PropertyRow label="Pick a color" fullWidth>
                <ColorPicker
                  value={baseColor}
                  onChange={setBaseColor}
                  inline
                  pickerWidth={288}
                  presets={[
                    { label: 'Red', color: '#f44336' },
                    { label: 'Orange', color: '#ff6b35' },
                    { label: 'Yellow', color: '#ffeb3b' },
                    { label: 'Green', color: '#4caf50' },
                    { label: 'Blue', color: '#2196f3' },
                    { label: 'Purple', color: '#9c27b0' },
                  ]}
                />
              </PropertyRow>
            </PropertySection>
          </PropertyPanel>
        </div>
      );
    };

    return <ColorPickerExample />;
  },
};
