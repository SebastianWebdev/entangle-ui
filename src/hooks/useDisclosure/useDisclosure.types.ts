export interface UseDisclosureOptions {
  /** Initial state for uncontrolled mode. @default false */
  defaultOpen?: boolean;
  /** Controlled value — when defined, drives the returned state. */
  open?: boolean;
  /** Called when state changes (from either controlled or uncontrolled paths). */
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  /** Current open state. */
  isOpen: boolean;
  /** Set open to `true`. */
  open: () => void;
  /** Set open to `false`. */
  close: () => void;
  /** Flip current open state. */
  toggle: () => void;
  /** Set open to an explicit value. */
  setOpen: (next: boolean) => void;
}
