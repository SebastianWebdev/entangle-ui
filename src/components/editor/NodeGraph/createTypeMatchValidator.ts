import type {
  NodeGraphConnectionValidationInfo,
  NodeGraphPortRef,
} from './NodeGraph.types';

export interface TypeMatchValidatorOptions {
  /**
   * Allowed `info.sideCombo` values (e.g. `'right->left'`). Defaults to both
   * horizontal directions so the user can start the drag from either end of
   * a wire. Pass `['right->left']` to force output→input only.
   * @default ['right->left', 'left->right']
   */
  directions?: ReadonlyArray<string>;
  /**
   * `dataType` token that connects to anything. @default 'any'
   */
  anyType?: string;
  /**
   * Allow connecting two ports on the same node. @default false
   */
  allowSameNode?: boolean;
  /**
   * Custom type comparison, replacing the default (equality + `anyType` +
   * "untyped ports accept anything"). Receives the resolved `dataType`s,
   * either of which may be `undefined` when the port declared none.
   */
  match?: (
    sourceDataType: string | undefined,
    targetDataType: string | undefined
  ) => boolean;
}

/**
 * Build an `isValidConnection` validator for the common "connect ports of
 * matching `dataType`, in an allowed direction" rule — the logic most node
 * editors hand-write. Drop the result straight onto `<NodeGraph>`:
 *
 * ```tsx
 * const isValidConnection = useMemo(() => createTypeMatchValidator(), []);
 * <NodeGraph isValidConnection={isValidConnection} />
 * ```
 *
 * The default `match` accepts a connection when either port is untyped, the
 * two `dataType`s are equal, or one side is the `anyType` token. Override
 * `match` for richer rules (subtype graphs, numeric coercion, etc.).
 */
export function createTypeMatchValidator(
  options?: TypeMatchValidatorOptions
): (
  source: NodeGraphPortRef,
  target: NodeGraphPortRef,
  info: NodeGraphConnectionValidationInfo
) => boolean {
  const directions = new Set(
    options?.directions ?? ['right->left', 'left->right']
  );
  const anyType = options?.anyType ?? 'any';
  const allowSameNode = options?.allowSameNode ?? false;
  const match =
    options?.match ??
    ((source, target): boolean => {
      if (source === undefined || target === undefined) return true;
      if (source === target) return true;
      return source === anyType || target === anyType;
    });

  return (_source, _target, info): boolean => {
    if (!allowSameNode && info.sameNode) return false;
    if (!directions.has(info.sideCombo)) return false;
    return match(info.sourceDataType, info.targetDataType);
  };
}
