/**
 * Combines class names, filtering out falsy values.
 * Replaces the need for clsx/classnames — keeps it minimal.
 *
 * @example
 * cx('base', isActive && 'active', className)
 * // -> 'base active user-class'
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
