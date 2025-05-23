# AI Coding Assistant Guidelines for Editor UI Toolkit

## Core Principles

When working on this Editor UI Toolkit codebase, always follow these strict guidelines to maintain consistency and quality.

## 0. Language Requirements - CRITICAL

### All Documentation Must Be in English
```typescript
// ✅ CORRECT - English comments and documentation
/**
 * A versatile button component for editor interfaces.
 * Handles multiple states including loading, disabled, and various visual variants.
 */
export const Button = () => {};

// ❌ WRONG - Non-English documentation
/**
 * Uniwersalny komponent przycisku dla interfejsów edytora.
 * Obsługuje różne stany włącznie z ładowaniem i wariantami wizualnymi.
 */
export const Button = () => {};
```

### English-Only Rules:
- **JSDoc comments** - Always in English
- **Code comments** - Always in English  
- **Type descriptions** - Always in English
- **Test descriptions** - Always in English
- **Storybook documentation** - Always in English
- **README files** - Always in English
- **Error messages** - Always in English
- **Console logs** - Always in English

### Acceptable Non-English:
- **Variable names in Polish** - Only if they represent Polish domain concepts
- **File names** - Should be in English
- **Git commit messages** - Preferably English, but Polish acceptable

### Examples:
```typescript
// ✅ CORRECT
/**
 * Handles user authentication and session management.
 * Returns the current user state and login/logout functions.
 */
export const useAuth = () => {
  // Check if user session is valid
  const isValidSession = checkSession();
  
  if (!isValidSession) {
    console.log('Session expired, redirecting to login');
  }
};

// ❌ WRONG
/**
 * Obsługuje uwierzytelnianie użytkownika i zarządzanie sesją.
 * Zwraca aktualny stan użytkownika i funkcje logowania/wylogowania.
 */
export const useAuth = () => {
  // Sprawdź czy sesja użytkownika jest ważna
  const isValidSession = checkSession();
  
  if (!isValidSession) {
    console.log('Sesja wygasła, przekierowanie do logowania');
  }
};
```

## 1. TypeScript Utility Types - MANDATORY

### Always Use Our Utility Types
```typescript
// ✅ CORRECT - Use Prettify for complex intersections
export type ButtonProps = Prettify<ButtonBaseProps & ComponentProps>;

// ❌ WRONG - Don't leave complex intersections unprettified
export type ButtonProps = ButtonBaseProps & ComponentProps;
```

### Use LiteralUnion ONLY When Extensibility Is Actually Needed
```typescript
// ✅ CORRECT - Use LiteralUnion when users might need custom values
export type IconName = LiteralUnion<'save' | 'delete' | 'edit'>; // Users might have custom icons

// ✅ CORRECT - Use LiteralUnion for theme colors that can be extended
export type ColorVariant = LiteralUnion<'primary' | 'secondary' | 'success'>; // Custom brand colors

// ❌ WRONG - Don't use LiteralUnion for fixed component API
export type ButtonSize = LiteralUnion<'sm' | 'md' | 'lg'>; // Size should be controlled

// ✅ CORRECT - Use strict types for component APIs
export type ButtonSize = 'sm' | 'md' | 'lg'; // Component has fixed sizes
```

### When to Use LiteralUnion vs Strict Types:

**Use LiteralUnion when:**
- Users need to pass custom values (colors, icon names, CSS values)
- The type represents user data that varies
- Extensibility is a core feature requirement
- Third-party integrations might need custom values

**Use Strict Types when:**
- Component API should be controlled and consistent
- Values map to specific internal logic/styles
- Type safety is more important than flexibility
- The component has a fixed set of variants

### Standard Size Type - Use Everywhere
```typescript
// ✅ CORRECT - Unified size type for consistency
export type Size = 'sm' | 'md' | 'lg';

// Use this standard type across all components:
export interface ButtonProps {
  size?: Size; // Not ButtonSize
}

export interface InputProps {
  size?: Size; // Not InputSize  
}

export interface IconProps {
  size?: Size; // Not IconSize
}

// ❌ WRONG - Don't create component-specific size types
export type ButtonSize = 'small' | 'medium' | 'large';
export type InputSize = 'sm' | 'md' | 'lg' | 'xl';
```

### Import Utility Types from Our Library
```typescript
// ✅ CORRECT
import type { Prettify, LiteralUnion, DeepPartial } from '../../types/utilities';

// ❌ WRONG - Don't redefine utility types
type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

### Required Utility Types to Use:
- `Prettify<T>` - For all complex intersection types
- `LiteralUnion<T, U>` - For extensible string unions
- `DeepPartial<T>` - For partial object types
- `RequireFields<T, K>` - When making specific fields required
- `StrictExclude<T, U>` - For type-safe exclusions
- `Brand<T, B>` - For domain-specific types (IDs, etc.)

## 2. JSDoc Documentation - MANDATORY

### Component Documentation Template
```typescript
/**
 * A versatile button component for editor interfaces.
 * 
 * Supports multiple variants, sizes, and states. Optimized for professional
 * editor UIs with compact dimensions and precise interactions.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button variant="default" size="md">Save</Button>
 * 
 * // With icon and loading state
 * <Button 
 *   icon={<SaveIcon />} 
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Save Project
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
};
```

### Props Documentation Template
```typescript
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
  variant?: LiteralUnion<'default' | 'ghost' | 'filled'>;
  
  /** 
   * Size variant optimized for editor interfaces
   * - `sm`: 24px height, compact for toolbars
   * - `md`: 28px height, standard for panels
   * - `lg`: 32px height, prominent actions
   * @default "md"
   */
  size?: LiteralUnion<'sm' | 'md' | 'lg'>;
  
  /** 
   * Whether the button is disabled
   * When true, button becomes non-interactive with reduced opacity
   * @default false
   */
  disabled?: boolean;
  
  /** 
   * Loading state - shows spinner and disables interaction
   * Use for async operations like saving, loading data
   * @default false
   */
  loading?: boolean;
  
  /** 
   * Icon element to display before the text
   * Should be 16x16px for optimal appearance
   * @example <SaveIcon />, <PlayIcon />
   */
  icon?: React.ReactNode;
  
  /** 
   * Whether button should take full container width
   * Useful for form actions and modal buttons
   * @default false
   */
  fullWidth?: boolean;
  
  /** 
   * Click event handler
   * Called when button is clicked (not when disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** 
   * Test identifier for automated testing
   * Should follow pattern: component-action-context
   * @example "button-save-project", "button-cancel-dialog"
   */
  'data-testid'?: string;
}
```

### Hook Documentation Template
```typescript
/**
 * Custom hook for managing button interactions and state.
 * 
 * Handles loading states, keyboard navigation, and accessibility
 * features specific to editor interface buttons.
 * 
 * @param options - Configuration options for button behavior
 * @returns Button state and event handlers
 * 
 * @example
 * ```tsx
 * const { isPressed, handleClick, handleKeyDown } = useButton({
 *   onClick: handleSave,
 *   disabled: !canSave,
 *   loading: isSaving
 * });
 * ```
 */
export const useButton = (options: UseButtonOptions) => {
  // Implementation
};
```

### Type Documentation Template
```typescript
/**
 * Configuration options for theme customization.
 * 
 * Allows partial overrides of the default theme tokens while
 * maintaining type safety and autocomplete support.
 * 
 * @example
 * ```tsx
 * const customTheme: ThemeConfig = {
 *   colors: {
 *     accent: {
 *       primary: '#ff6b6b'  // Override just the primary accent
 *     }
 *   }
 * };
 * ```
 */
export type ThemeConfig = Prettify<DeepPartial<Theme>>;
```

## 3. Emotion Styled Components - MANDATORY

### Component Structure Template
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
  
  /* Variant-specific styles */
  ${props => getVariantStyles(props.$variant, props.theme)}
  
  /* Size-specific styles */
  ${props => getSizeStyles(props.$size, props.theme)}
  
  /* State-specific styles */
  ${props => props.$disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;
```

## 4. File Organization Rules

### Component File Structure
```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
├── useComponentName.ts        # Custom hooks (if needed)
├── ComponentName.types.ts     # Type definitions (if complex)
└── index.ts                   # Exports
```

### Import Order
```typescript
// 1. React and external libraries
import React from 'react';
import styled from '@emotion/styled';

// 2. Internal utilities and types
import type { Theme } from '../../theme';
import type { Prettify, LiteralUnion } from '../../types/utilities';

// 3. Local imports
import { useComponentHook } from './useComponentHook';
import type { LocalType } from './types';
```

## 5. Testing Requirements

### Test Structure Template
```typescript
/**
 * Test suite for Button component
 * 
 * Covers:
 * - Basic rendering and props
 * - All variants and sizes
 * - Interactive states (hover, focus, disabled)
 * - Loading states
 * - Accessibility features
 * - Event handling
 */
describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      // Test implementation
    });
    
    it('renders all variants correctly', () => {
      // Test all variant types
    });
  });
  
  describe('Interactions', () => {
    it('handles click events', () => {
      // Test click handling
    });
    
    it('prevents interaction when disabled', () => {
      // Test disabled state
    });
  });
  
  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      // Test accessibility
    });
  });
});
```

## 6. Storybook Stories Requirements

### Story Structure Template
```typescript
/**
 * Storybook configuration for Button component
 * 
 * Showcases all variants, sizes, and interactive states
 * with comprehensive controls and documentation.
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
    // ... other argTypes with descriptions
  },
};
```

## 7. Error Prevention Rules

### Always Validate These Patterns
```typescript
// ✅ Use $ prefix for styled-component props
interface StyledProps {
  $variant: string;  // Not 'variant'
  $size: string;     // Not 'size'
}

// ✅ Use Prettify for exported types
export type ComponentProps = Prettify<BaseProps & ExtraProps>;

// ✅ Use LiteralUnion for extensible enums
export type Size = LiteralUnion<'sm' | 'md' | 'lg'>;

// ✅ Document all public APIs
/** Description of what this does */
export const Component = () => {};
```

## 9. Code Review Checklist

Before submitting any code, verify:

- [ ] **All documentation and comments are in English**
- [ ] All exported types use `Prettify<>`
- [ ] String union types use `LiteralUnion<>`
- [ ] All components have comprehensive JSDoc in English
- [ ] All props have descriptive JSDoc with examples in English
- [ ] Code comments explain complex logic in English
- [ ] Styled components use `# AI Coding Assistant Guidelines for Editor UI Toolkit

## Core Principles

When working on this Editor UI Toolkit codebase, always follow these strict guidelines to maintain consistency and quality.

## 0. Language Requirements - CRITICAL

### All Documentation Must Be in English
```typescript
// ✅ CORRECT - English comments and documentation
/**
 * A versatile button component for editor interfaces.
 * Handles multiple states including loading, disabled, and various visual variants.
 */
export const Button = () => {};

// ❌ WRONG - Non-English documentation
/**
 * Uniwersalny komponent przycisku dla interfejsów edytora.
 * Obsługuje różne stany włącznie z ładowaniem i wariantami wizualnymi.
 */
export const Button = () => {};
```

### English-Only Rules:
- **JSDoc comments** - Always in English
- **Code comments** - Always in English  
- **Type descriptions** - Always in English
- **Test descriptions** - Always in English
- **Storybook documentation** - Always in English
- **README files** - Always in English
- **Error messages** - Always in English
- **Console logs** - Always in English

### Acceptable Non-English:
- **Variable names in Polish** - Only if they represent Polish domain concepts
- **File names** - Should be in English
- **Git commit messages** - Preferably English, but Polish acceptable

### Examples:
```typescript
// ✅ CORRECT
/**
 * Handles user authentication and session management.
 * Returns the current user state and login/logout functions.
 */
export const useAuth = () => {
  // Check if user session is valid
  const isValidSession = checkSession();
  
  if (!isValidSession) {
    console.log('Session expired, redirecting to login');
  }
};

// ❌ WRONG
/**
 * Obsługuje uwierzytelnianie użytkownika i zarządzanie sesją.
 * Zwraca aktualny stan użytkownika i funkcje logowania/wylogowania.
 */
export const useAuth = () => {
  // Sprawdź czy sesja użytkownika jest ważna
  const isValidSession = checkSession();
  
  if (!isValidSession) {
    console.log('Sesja wygasła, przekierowanie do logowania');
  }
};
```

## 1. TypeScript Utility Types - MANDATORY

### Always Use Our Utility Types
```typescript
// ✅ CORRECT - Use Prettify for complex intersections
export type ButtonProps = Prettify<ButtonBaseProps & ComponentProps>;

// ❌ WRONG - Don't leave complex intersections unprettified
export type ButtonProps = ButtonBaseProps & ComponentProps;
```

### Use LiteralUnion for Extensible String Types
```typescript
// ✅ CORRECT - Provides autocomplete but allows custom values
export type ButtonVariant = LiteralUnion<'default' | 'ghost' | 'filled'>;

// ❌ WRONG - Too restrictive
export type ButtonVariant = 'default' | 'ghost' | 'filled';

// ❌ WRONG - No type safety
export type ButtonVariant = string;
```

### Import Utility Types from Our Library
```typescript
// ✅ CORRECT
import type { Prettify, LiteralUnion, DeepPartial } from '../../types/utilities';

// ❌ WRONG - Don't redefine utility types
type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

### Required Utility Types to Use:
- `Prettify<T>` - For all complex intersection types
- `LiteralUnion<T, U>` - For extensible string unions
- `DeepPartial<T>` - For partial object types
- `RequireFields<T, K>` - When making specific fields required
- `StrictExclude<T, U>` - For type-safe exclusions
- `Brand<T, B>` - For domain-specific types (IDs, etc.)

## 2. JSDoc Documentation - MANDATORY

### Component Documentation Template
```typescript
/**
 * A versatile button component for editor interfaces.
 * 
 * Supports multiple variants, sizes, and states. Optimized for professional
 * editor UIs with compact dimensions and precise interactions.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button variant="default" size="md">Save</Button>
 * 
 * // With icon and loading state
 * <Button 
 *   icon={<SaveIcon />} 
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Save Project
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
};
```

### Props Documentation Template
```typescript
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
  variant?: LiteralUnion<'default' | 'ghost' | 'filled'>;
  
  /** 
   * Size variant optimized for editor interfaces
   * - `sm`: 24px height, compact for toolbars
   * - `md`: 28px height, standard for panels
   * - `lg`: 32px height, prominent actions
   * @default "md"
   */
  size?: LiteralUnion<'sm' | 'md' | 'lg'>;
  
  /** 
   * Whether the button is disabled
   * When true, button becomes non-interactive with reduced opacity
   * @default false
   */
  disabled?: boolean;
  
  /** 
   * Loading state - shows spinner and disables interaction
   * Use for async operations like saving, loading data
   * @default false
   */
  loading?: boolean;
  
  /** 
   * Icon element to display before the text
   * Should be 16x16px for optimal appearance
   * @example <SaveIcon />, <PlayIcon />
   */
  icon?: React.ReactNode;
  
  /** 
   * Whether button should take full container width
   * Useful for form actions and modal buttons
   * @default false
   */
  fullWidth?: boolean;
  
  /** 
   * Click event handler
   * Called when button is clicked (not when disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** 
   * Test identifier for automated testing
   * Should follow pattern: component-action-context
   * @example "button-save-project", "button-cancel-dialog"
   */
  'data-testid'?: string;
}
```

### Hook Documentation Template
```typescript
/**
 * Custom hook for managing button interactions and state.
 * 
 * Handles loading states, keyboard navigation, and accessibility
 * features specific to editor interface buttons.
 * 
 * @param options - Configuration options for button behavior
 * @returns Button state and event handlers
 * 
 * @example
 * ```tsx
 * const { isPressed, handleClick, handleKeyDown } = useButton({
 *   onClick: handleSave,
 *   disabled: !canSave,
 *   loading: isSaving
 * });
 * ```
 */
export const useButton = (options: UseButtonOptions) => {
  // Implementation
};
```

### Type Documentation Template
```typescript
/**
 * Configuration options for theme customization.
 * 
 * Allows partial overrides of the default theme tokens while
 * maintaining type safety and autocomplete support.
 * 
 * @example
 * ```tsx
 * const customTheme: ThemeConfig = {
 *   colors: {
 *     accent: {
 *       primary: '#ff6b6b'  // Override just the primary accent
 *     }
 *   }
 * };
 * ```
 */
export type ThemeConfig = Prettify<DeepPartial<Theme>>;
```

## 3. Emotion Styled Components - MANDATORY

### Component Structure Template
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
  
  /* Variant-specific styles */
  ${props => getVariantStyles(props.$variant, props.theme)}
  
  /* Size-specific styles */
  ${props => getSizeStyles(props.$size, props.theme)}
  
  /* State-specific styles */
  ${props => props.$disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;
```

## 4. File Organization Rules

### Component File Structure
```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
├── useComponentName.ts        # Custom hooks (if needed)
├── ComponentName.types.ts     # Type definitions (if complex)
└── index.ts                   # Exports
```

### Import Order
```typescript
// 1. React and external libraries
import React from 'react';
import styled from '@emotion/styled';

// 2. Internal utilities and types
import type { Theme } from '../../theme';
import type { Prettify, LiteralUnion } from '../../types/utilities';

// 3. Local imports
import { useComponentHook } from './useComponentHook';
import type { LocalType } from './types';
```

## 5. Testing Requirements

### Test Structure Template
```typescript
/**
 * Test suite for Button component
 * 
 * Covers:
 * - Basic rendering and props
 * - All variants and sizes
 * - Interactive states (hover, focus, disabled)
 * - Loading states
 * - Accessibility features
 * - Event handling
 */
describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      // Test implementation
    });
    
    it('renders all variants correctly', () => {
      // Test all variant types
    });
  });
  
  describe('Interactions', () => {
    it('handles click events', () => {
      // Test click handling
    });
    
    it('prevents interaction when disabled', () => {
      // Test disabled state
    });
  });
  
  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      // Test accessibility
    });
  });
});
```

## 6. Storybook Stories Requirements

### Story Structure Template
```typescript
/**
 * Storybook configuration for Button component
 * 
 * Showcases all variants, sizes, and interactive states
 * with comprehensive controls and documentation.
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
    // ... other argTypes with descriptions
  },
};
```

## 7. Error Prevention Rules

### Always Validate These Patterns
```typescript
// ✅ Use $ prefix for styled-component props
interface StyledProps {
  $variant: string;  // Not 'variant'
  $size: string;     // Not 'size'
}

// ✅ Use Prettify for exported types
export type ComponentProps = Prettify<BaseProps & ExtraProps>;

// ✅ Use LiteralUnion for extensible enums
export type Size = LiteralUnion<'sm' | 'md' | 'lg'>;

// ✅ Document all public APIs
/** Description of what this does */
export const Component = () => {};
```

 prefix for props
- [ ] Theme tokens are used instead of hardcoded values
- [ ] Components are tested with multiple variants
- [ ] Test descriptions are in English
- [ ] Storybook stories showcase all use cases with English documentation
- [ ] TypeScript strict mode passes without errors
- [ ] No `any` types are used
- [ ] Imports are ordered correctly
- [ ] Console logs and error messages are in English

## 9. Performance Considerations

```typescript
// ✅ Memoize expensive computations
const styledComponent = useMemo(() => 
  styled.div`...`, [dependency]
);

// ✅ Use React.memo for pure components
export const Component = React.memo<ComponentProps>(({ ... }) => {
  // Implementation
});

// ✅ Memoize callbacks passed to styled components
const handleClick = useCallback((event) => {
  // Handler logic
}, [dependencies]);
```

## 10. Path Aliases - MANDATORY

### Always Use Path Aliases Instead of Relative Imports
```typescript
// ✅ CORRECT - Use path aliases
import type { Theme } from '@/theme';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import { Button } from '@/primitives';
import { cn } from '@/utils/cn';

// ❌ WRONG - Don't use relative imports
import type { Theme } from '../../theme';
import type { Prettify, LiteralUnion } from '../../types/utilities';
import { Button } from '../primitives';
import { cn } from '../utils/cn';

Rules for Path Aliases:

Always use @/ prefix for all internal imports
Never mix relative and alias imports in the same file
Add new aliases when creating new top-level src directories
Use specific aliases for frequently accessed directories
Update both tsconfig.json and build configs when adding aliases

Adding New Directory Aliases:
When creating a new directory in src/, always add corresponding alias:
typescript// 1. Create new directory: src/animations/
// 2. Add to tsconfig.json:
"@/animations/*": ["src/animations/*"]

// 3. Update build tools (Vite, Rollup, etc.)
// 4. Use in imports:
import { fadeIn } from '@/animations/transitions';
Import Examples by Category:
typescript// Theme and styling
import { ThemeProvider, tokens } from '@/theme';
import type { Theme } from '@/theme/types';

// Components
import { Button, Input } from '@/primitives';
import { PropertyPanel } from '@/composite';

// Utilities and types
import { cn } from '@/utils/cn';
import type { Prettify, LiteralUnion } from '@/types/utilities';

// Hooks
import { useResizable } from '@/hooks/useResizable';

## 11. Rate Limit Management - CRITICAL

### Execute Tasks One at a Time - Never Batch Multiple Artifacts
```typescript
// ✅ CORRECT - One task per response
User: "Create a Button component"
AI: Creates only Button.tsx

User: "Now add tests for Button" 
AI: Creates only Button.test.tsx

User: "Add Storybook stories"
AI: Creates only Button.stories.tsx

// ❌ WRONG - Don't create multiple artifacts at once
User: "Create a Button component"
AI: Creates Button.tsx + Button.test.tsx + Button.stories.tsx + index.ts
Task Sequencing Rules:

Component First - Always create the main component file first
Wait for Confirmation - Don't proceed to next task without user request
One Artifact Per Response - Maximum one new file creation per response
Ask Before Proceeding - "Should I create the tests now?" instead of assuming

Recommended Task Order:
1. Component implementation (.tsx)
2. Type definitions (if complex, separate .types.ts)
3. Unit tests (.test.tsx)
4. Storybook stories (.stories.tsx)
5. Index file exports (index.ts)
6. Documentation updates
Response Patterns:
typescript// ✅ CORRECT - Conservative approach
"I've created the Button component. Would you like me to:
- Add unit tests
- Create Storybook stories  
- Add it to the main exports
- Create additional variants"

// ❌ WRONG - Doing everything at once
"I've created the Button component, tests, stories, and updated all exports."
When Updates Are Acceptable:

Small fixes to existing files (typos, minor adjustments)
Single property additions to existing components
Import/export updates in index files
Documentation corrections

When to Split Tasks:

New component creation - component only, ask about tests
Multiple file changes - one file at a time
Complex refactoring - break into smaller steps
Adding new features - implement incrementally

Communication Pattern:
AI: "I've implemented [specific task]. Ready for the next step?"
User: "Add tests"
AI: "Tests created. Shall I create Storybook stories next?"
User: "Yes"
AI: "Stories added. Need me to update the exports?"
Rate Limit Awareness:

Monitor response complexity - simpler responses when approaching limits
Prioritize core functionality first, enhancements later
Ask for priorities when multiple tasks are needed
Batch only related small changes (like fixing typos across files)

Remember: It's better to deliver working code incrementally than to hit rate limits and block development entirely

---

**CRITICAL REMINDER**: 
1. **All documentation, comments, JSDoc, and user-facing text MUST be in English**
2. These guidelines are not suggestions - they are requirements
3. Every piece of code should follow these patterns for consistency and maintainability
4. When in doubt about language - always choose English for any text that might be read by other developers