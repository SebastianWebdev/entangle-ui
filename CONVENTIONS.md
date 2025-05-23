# UI Library Development Conventions

## General Principles

1. **TypeScript Strictness**:
   - All code must be typed
   - `any` is strictly forbidden
   - Use explicit types and interfaces
   - Enable strict mode in tsconfig.json

2. **Code Quality**:
   - Self-explanatory code over comments
   - Small, focused components
   - Single Responsibility Principle
   - Clean, consistent formatting (Prettier recommended)

3. **Performance**:
   - Memoize components with `React.memo` when appropriate
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers passed to memoized components
   - Avoid unnecessary re-renders

## Component Architecture

### Structure

- **Separation of Concerns**:
  - Split logic (hooks) and presentation (components)
  - Container/Presenter pattern encouraged
  - Custom hooks for complex logic

- **Functional Components**:
  - Only functional components with hooks
  - No class components

### Props

- Always type component props with `interface` or `type`
- Use descriptive prop names
- Destructure props in the component signature when possible
- Default props via ES6 default parameters

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

const Button = ({ variant = 'primary', disabled = false, onClick }: ButtonProps) => {
  // component implementation
}
```

## State Management

### Local State

- `useState` for simple component state
- `useReducer` for complex state logic

### Global State

- React Context for app-wide state
- Create dedicated providers for different state domains
- Memoize context values to prevent unnecessary re-renders

## Styling

### CSS-in-JS

- Use Base UI's styling system
- Consider Emotion or styled-components if needed
- CSS variables for theming

### Theme

- Single source of truth for design tokens
- Type-safe theme structure

## Testing

### Unit Tests

- Jest + React Testing Library
- Test behavior over implementation
- High test coverage for core functionality

### Type Testing

- Use `@ts-expect-error` to verify type safety
- Test complex types with `dtslint` if needed

## Documentation

### Component Docs

- JSDoc for public APIs
- Storybook for visual documentation
- Props table generation

### Example Usage

- Code examples for each component
- Common use cases

## Dependencies

### Minimal Dependencies

- Only essential dependencies
- Prefer smaller, focused libraries
- Regular dependency audits

### Peer Dependencies

- React as peer dependency
- TypeScript types for all dependencies

## Code Review Checklist

- [ ] TypeScript types are correct and complete
- [ ] No `any` types used
- [ ] Proper memoization applied
- [ ] Logic separated from presentation
- [ ] Clean, self-documenting code
- [ ] Tests covering main functionality
- [ ] Documentation updated
- [ ] Performance considerations addressed