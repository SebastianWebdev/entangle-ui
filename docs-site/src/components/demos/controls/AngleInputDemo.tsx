import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { AngleInput } from '@/components/controls';
import type { AngleInputPlacement } from '@/components/controls';
import { Flex, Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function AngleInputDemo() {
  return (
    <DemoWrapper withKeyboard>
      <AngleInput defaultValue={45} />
    </DemoWrapper>
  );
}

export function AngleInputControlled() {
  const [angle, setAngle] = useState(120);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <AngleInput value={angle} onChange={setAngle} />
        <Text size="sm" color="muted">
          Angle: {Math.round(angle)}°
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function AngleInputPlacements() {
  const placements: AngleInputPlacement[] = ['top', 'right', 'bottom', 'left'];
  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} wrap="wrap" align="center">
        {placements.map(placement => (
          <Stack key={placement} gap={1} align="center">
            <AngleInput defaultValue={45} inputPlacement={placement} />
            <Text size="xs" color="muted">
              {placement}
            </Text>
          </Stack>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function AngleInputSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} align="center">
        <AngleInput defaultValue={45} size="sm" />
        <AngleInput defaultValue={45} size="md" />
        <AngleInput defaultValue={45} size="lg" />
      </Flex>
    </DemoWrapper>
  );
}

export function AngleInputDialOnly() {
  return (
    <DemoWrapper withKeyboard>
      <AngleInput defaultValue={45} showInput={false} />
    </DemoWrapper>
  );
}

export function AngleInputChangeComplete() {
  const [live, setLive] = useState(45);
  const [committed, setCommitted] = useState(45);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <AngleInput
          value={live}
          onChange={setLive}
          onChangeComplete={setCommitted}
        />
        <Text size="sm" color="muted">
          Live: {Math.round(live)}° · Committed: {Math.round(committed)}°
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function AngleInputLocalized() {
  const [angle, setAngle] = useState(90);
  return (
    <DemoWrapper withKeyboard>
      <AngleInput
        value={angle}
        onChange={setAngle}
        labels={{
          dialAriaLabel: 'Angle',
          inputAriaLabel: "Valeur de l'angle",
          valueText: deg => `${Math.round(deg)} degrés`,
        }}
      />
    </DemoWrapper>
  );
}
