# Editor UI Toolkit - Development Conventions

## 1. Language Requirements - CRITICAL

**All text must be in English:**

- JSDoc comments and documentation
- Code comments and console logs  
- Type descriptions and error messages
- Test descriptions and Storybook docs
- README files and commit messages
- commit messages

```typescript
// ✅ CORRECT
/** A versatile button component for editor interfaces. */
export const Button = () => {
  // Check if user session is valid
  console.log('Session expired, redirecting to login');
};

// ❌ WRONG - No Polish text
/** Uniwersalny komponent przycisku. */
```

## 2. TypeScript Utility Types - MANDATORY

```typescript
// ✅ Always use Prettify for complex intersections
export type ButtonProps = Prettify<ButtonBaseProps & ComponentProps>;

// ✅ Use LiteralUnion ONLY for extensible values (colors, icons)
export type ColorVariant = LiteralUnion<'primary' | 'secondary'>;

// ✅ Use strict types for controlled APIs
export type ButtonSize = 'sm' | 'md' | 'lg'; // Standard size across all components

// ✅ Import from our library
import type { Prettify, LiteralUnion, DeepPartial } from '@/types/utilities';
```

**When to use LiteralUnion:**

- User needs custom values (colors, icons, CSS values)
- Extensibility is required
- Third-party integrations need custom values

**Use strict types for:**

- Component APIs that should be controlled
- Values that map to specific internal logic
- Fixed component variants

## 3. JSDoc Documentation - MANDATORY

```typescript
/**
 * A versatile button component for editor interfaces.
 * 
 * Supports multiple variants, sizes, and states optimized for
 * professional editor UIs with compact dimensions.
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="md">Save</Button>
 * <Button icon={<SaveIcon />} loading={isSaving}>Save Project</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => {};

export interface ButtonProps {
  /** 
   * Button content - text, icons, or other React elements
   * @example "Save", <><SaveIcon /> Save</> 
   */
  children?: React.ReactNode;
  
  /** 
   * Visual variant of the button
   * - `default`: Transparent with border, fills on hover
   * - `ghost`: No border, subtle hover state  
   * - `filled`: Solid background with accent color
   * @default "default"
   */
  variant?: 'default' | 'ghost' | 'filled';
  
  /** 
   * Size optimized for editor interfaces
   * - `sm`: 24px height, compact for toolbars
   * - `md`: 28px height, standard for panels  
   * - `lg`: 32px height, prominent actions
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}
```

## 4. Emotion Styled Components

```typescript
interface StyledComponentProps {
  $variant: ComponentVariant;
  $size: ComponentSize;
  $disabled: boolean;
}

const StyledComponent = styled.div<StyledComponentProps>`
  /* Reset and base styles */
  margin: 0;
  font-family: inherit;
  
  /* Dynamic styles using theme */
  ${props => {
    const { theme } = props;
    return `
      color: ${theme.colors.text.primary};
      font-size: ${theme.typography.fontSize.md}px;
      border-radius: ${theme.borderRadius.md}px;
      transition: all ${theme.transitions.normal};
    `;
  }}
  
  /* Variant and size styles */
  ${props => getVariantStyles(props.$variant, props.theme)}
  ${props => getSizeStyles(props.$size, props.theme)}
  
  /* State styles */
  ${props => props.$disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;
```

## 5. Path Aliases - MANDATORY

```typescript
// ✅ CORRECT - Always use path aliases
import type { Theme } from '@/theme';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import { Button } from '@/primitives';
import { cn } from '@/utils/cn';

// ❌ WRONG - No relative imports
import type { Theme } from '../../theme';
```

**Rules:**
- Always use `@/` prefix for internal imports
- 
- Never mix relative and alias imports
- Add aliases for new top-level src directories

## 6. File Organization

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
├── useComponentName.ts        # Custom hooks (if needed)
├── ComponentName.types.ts     # Type definitions (if complex)
└── index.ts                   # Exports
```

**Import Order:**

```typescript
// 1. React and external libraries
import React from 'react';
import styled from '@emotion/styled';

// 2. Internal utilities and types
import type { Theme } from '@/theme';
import type { Prettify, LiteralUnion } from '@/types/utilities';

// 3. Local imports
import { useComponentHook } from './useComponentHook';
```

## 7. Testing Requirements

```typescript
/**
 * Test suite for Button component
 * 
 * Covers: rendering, variants, interactions, accessibility
 */
describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {});
    it('renders all variants correctly', () => {});
  });
  
  describe('Interactions', () => {
    it('handles click events', () => {});
    it('prevents interaction when disabled', () => {});
  });
  
  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {});
  });
});
```

## 8. Storybook Stories

```typescript
/**
 * Storybook configuration for Button component
 */
const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component optimized for editor interfaces.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'filled'],
      description: 'Visual style variant of the button',
    },
  },
};
```

## 9. Rate Limit Management - CRITICAL

**Execute one task at a time:**

```typescript
// ✅ CORRECT - One artifact per response
User: "Create Button component"
AI: Creates only Button.tsx

User: "Add tests" 
AI: Creates only Button.test.tsx

// ❌ WRONG - Multiple artifacts at once
AI: Creates Button.tsx + tests + stories + exports
```

**Task Order:**

1. Component implementation
2. Type definitions (if complex)
3. Unit tests
4. Storybook stories
5. Index exports

**Communication:**

```
"I've created the Button component. Would you like me to:
- Add unit tests
- Create Storybook stories
- Add it to exports"
```

## 10. Code Review Checklist

Before submitting:

- [ ] All text is in English
- [ ] Exported types use `Prettify<>`
- [ ] String unions use `LiteralUnion<>` only when extensible
- [ ] Components have comprehensive JSDoc
- [ ] Styled components use `$` prefix for props
- [ ] Path aliases used instead of relative imports
- [ ] Theme tokens used instead of hardcoded values
- [ ] Tests cover all variants and interactions
- [ ] TypeScript strict mode passes
- [ ] No `any` types used

## 11. Performance

```typescript
// ✅ Memoize expensive computations
const styledComponent = useMemo(() => styled.div`...`, [dependency]);

// ✅ Use React.memo for pure components
export const Component = React.memo<ComponentProps>(({ ... }) => {});

// ✅ Memoize callbacks
const handleClick = useCallback((event) => {}, [dependencies]);
```

---

**CRITICAL REMINDERS:**

1. **All documentation must be in English**
2. These are requirements, not suggestions
3. One task per response to avoid rate limits
4. Always use path aliases and utility types