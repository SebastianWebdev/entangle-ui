import {
  KeyboardState,
  KeyboardInnerState,
  AllKeys,
  ModifierKeys,
} from './types';

export const isModifierKey = (key: string): key is ModifierKeys => {
  return ['ctrl', 'shift', 'alt', 'meta', 'control'].includes(key);
};

const KeypressUpdate = (
  prevState: KeyboardInnerState,
  key: AllKeys
): KeyboardInnerState => {
  if (prevState.has(key)) {
    return prevState;
  }
  const newState = new Set(prevState);
  newState.add(key);
  return newState;
};

const KeyReleaseUpdate = (
  prevState: KeyboardInnerState,
  key: AllKeys
): KeyboardInnerState => {
  if (!prevState.has(key)) {
    return prevState;
  }
  const newState = new Set(prevState);
  newState.delete(key);
  return newState;
};

export const updateState = (
  prevState: KeyboardInnerState,
  event: KeyboardEvent
): KeyboardInnerState => {
  const key = event.key.toLowerCase();
  const eventType = event.type;
  switch (eventType) {
    case 'keydown':
      return KeypressUpdate(prevState, key);
    case 'keyup':
      return KeyReleaseUpdate(prevState, key);
    default:
      console.warn(`Unhandled event type: ${eventType}`);
      return prevState;
  }
};

export const mapInnerStateToState = (
  innerState: KeyboardInnerState
): KeyboardState => {
  const modifiers: KeyboardState['modifiers'] = {
    control: innerState.has('control') || innerState.has('ctrl'),
    shift: innerState.has('shift'),
    alt: innerState.has('alt'),
    meta: innerState.has('meta'),
  };
  const pressedKeys = Array.from(innerState).filter(key => !isModifierKey(key));
  return {
    pressedKeys,
    modifiers,
  };
};

export const isKeyPressed = (
  keyboardState: KeyboardState,
  key: AllKeys
): boolean => {
  if (isModifierKey(key)) {
    return keyboardState.modifiers[key];
  }
  return keyboardState.pressedKeys.includes(key);
};
