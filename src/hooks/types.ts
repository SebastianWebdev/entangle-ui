import type {LiteralUnion} from '@/types/utilities'

export type ModifierKeys = 'control' | 'shift' | 'alt' | 'meta';
export type KeyCode = string;

export type KeyboardModifierKeysState ={
  [key in ModifierKeys]: boolean;
}

export type KeyboardState = {
  pressedKeys: KeyCode[];
  modifiers: KeyboardModifierKeysState;
}

export type AllKeys = LiteralUnion<ModifierKeys, string>;

export type KeyboardInnerState = Set<AllKeys>;