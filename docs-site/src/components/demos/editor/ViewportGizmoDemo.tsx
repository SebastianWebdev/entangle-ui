import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { ViewportGizmo } from '@/components/editor/ViewportGizmo';
import type {
  GizmoOrientation,
  GizmoPresetView,
} from '@/components/editor/ViewportGizmo';
import { Text } from '@/components/primitives';
import { Flex } from '@/components/layout';

const PRESET_VIEWS: Record<string, GizmoOrientation> = {
  front: { yaw: 0, pitch: 0 },
  back: { yaw: 180, pitch: 0 },
  left: { yaw: -90, pitch: 0 },
  right: { yaw: 90, pitch: 0 },
  top: { yaw: 0, pitch: -90 },
  bottom: { yaw: 0, pitch: 90 },
};

export default function ViewportGizmoDemo() {
  const [orientation, setOrientation] = useState<GizmoOrientation>({
    yaw: 30,
    pitch: -20,
  });

  return (
    <DemoWrapper>
      <Flex gap="xl" align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={delta => {
            setOrientation(prev => ({
              yaw: prev.yaw + delta.deltaYaw,
              pitch: Math.max(-90, Math.min(90, prev.pitch + delta.deltaPitch)),
            }));
          }}
          onSnapToView={(view: GizmoPresetView) => {
            const preset = PRESET_VIEWS[view];
            if (preset) setOrientation(preset);
          }}
          diameter={140}
        />
        <div>
          <Text size="sm" color="secondary">
            Yaw: {orientation.yaw.toFixed(1)}
          </Text>
          <Text size="sm" color="secondary">
            Pitch: {orientation.pitch.toFixed(1)}
          </Text>
        </div>
      </Flex>
    </DemoWrapper>
  );
}
