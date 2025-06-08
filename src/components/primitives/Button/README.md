# Menu Component

A powerful, configuration-driven menu component for editor interfaces with support for radio/checkbox selection, nested submenus, and custom triggers.

## Features

- **🎯 Multiple Selection Types**: Radio, checkbox, or simple click handlers
- **🔄 Nested Submenus**: Unlimited nesting with hover or click triggers  
- **⚡ Flexible Configuration**: JSON-based menu structure
- **🎨 Customizable Icons**: Custom radio/checkbox indicators
- **♿ Accessible**: Full keyboard navigation and ARIA support
- **🎪 Trigger Options**: Click or hover menu opening
- **🎭 Theme Integration**: Uses design system tokens

## Basic Usage

```tsx
import { Menu } from '@/components/primitives/Menu';

const config = {
  groups: [
    {
      id: 'actions',
      items: [
        {
          id: 'copy',
          label: 'Copy',
          onClick: (id, event) => console.log('Copied!'),
        },
        {
          id: 'paste',
          label: 'Paste',
          onClick: (id, event) => console.log('Pasted!'),
        },
      ],
      itemSelectionType: 'none',
    },
  ],
};

<Menu config={config}>
  <Button>Options</Button>
</Menu>
```

## Real-World Examples

### Context Menu with Actions

```tsx
const contextMenuConfig = {
  openOnHover: false,
  groups: [
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'cut',
          label: 'Cut',
          onClick: handleCut,
          disabled: !hasSelection,
        },
        {
          id: 'copy',
          label: 'Copy',
          onClick: handleCopy,
          disabled: !hasSelection,
        },
        {
          id: 'paste',
          label: 'Paste',
          onClick: handlePaste,
          disabled: !hasClipboard,
        },
      ],
      itemSelectionType: 'none',
    },
    {
      id: 'transform',
      label: 'Transform',
      items: [
        {
          id: 'rotate',
          label: 'Rotate',
          onClick: handleRotate,
          subMenu: {
            groups: [
              {
                id: 'rotateOptions',
                items: [
                  { id: 'rotate90', label: '90°', onClick: () => rotate(90) },
                  { id: 'rotate180', label: '180°', onClick: () => rotate(180) },
                  { id: 'rotate270', label: '270°', onClick: () => rotate(270) },
                ],
                itemSelectionType: 'none',
              },
            ],
          },
        },
      ],
      itemSelectionType: 'none',
    },
  ],
};

<Menu config={contextMenuConfig}>
  <div onContextMenu={handleContextMenu}>
    Right-click me
  </div>
</Menu>
```

### Settings Panel with Radio Selection

```tsx
const [viewSettings, setViewSettings] = useState({ theme: ['dark'] });

const settingsConfig = {
  groups: [
    {
      id: 'theme',
      label: 'Theme',
      items: [
        { id: 'light', label: 'Light Theme', onClick: handleThemeChange },
        { id: 'dark', label: 'Dark Theme', onClick: handleThemeChange },
        { id: 'auto', label: 'Auto Theme', onClick: handleThemeChange },
      ],
      itemSelectionType: 'radio',
    },
    {
      id: 'layout',
      label: 'Layout',
      items: [
        { id: 'grid', label: 'Grid View', onClick: handleLayoutChange },
        { id: 'list', label: 'List View', onClick: handleLayoutChange },
        { id: 'cards', label: 'Card View', onClick: handleLayoutChange },
      ],
      itemSelectionType: 'radio',
    },
  ],
};

<Menu 
  config={settingsConfig}
  selectedItems={viewSettings}
  onChange={setViewSettings}
>
  <IconButton>
    <SettingsIcon />
  </IconButton>
</Menu>
```

### Multi-Select Filter Menu

```tsx
const [filters, setFilters] = useState({ 
  fileTypes: ['images', 'documents'],
  visibility: ['visible'] 
});

const filterConfig = {
  groups: [
    {
      id: 'fileTypes',
      label: 'File Types',
      items: [
        { id: 'images', label: 'Images', onClick: handleFilterToggle },
        { id: 'documents', label: 'Documents', onClick: handleFilterToggle },
        { id: 'videos', label: 'Videos', onClick: handleFilterToggle },
        { id: 'audio', label: 'Audio', onClick: handleFilterToggle },
      ],
      itemSelectionType: 'checkbox',
    },
    {
      id: 'visibility',
      label: 'Visibility',
      items: [
        { id: 'visible', label: 'Show Visible', onClick: handleVisibilityToggle },
        { id: 'hidden', label: 'Show Hidden', onClick: handleVisibilityToggle },
        { id: 'system', label: 'Show System', onClick: handleVisibilityToggle },
      ],
      itemSelectionType: 'checkbox',
    },
  ],
};

<Menu 
  config={filterConfig}
  selectedItems={filters}
  onChange={setFilters}
  checkboxIcon={<CheckIcon />}
>
  <Button variant="ghost">
    Filter <FilterIcon />
  </Button>
</Menu>
```

### Complex Nested Navigation

```tsx
const navigationConfig = {
  openOnHover: true,
  groups: [
    {
      id: 'file',
      items: [
        {
          id: 'new',
          label: 'New',
          onClick: handleNew,
          subMenu: {
            groups: [
              {
                id: 'newProject',
                label: 'Project',
                items: [
                  { id: 'react', label: 'React App', onClick: () => createProject('react') },
                  { id: 'vue', label: 'Vue App', onClick: () => createProject('vue') },
                  { id: 'node', label: 'Node.js', onClick: () => createProject('node') },
                ],
                itemSelectionType: 'none',
              },
              {
                id: 'newFile',
                label: 'File',
                items: [
                  { id: 'component', label: 'Component', onClick: () => createFile('component') },
                  { id: 'hook', label: 'Custom Hook', onClick: () => createFile('hook') },
                  { id: 'test', label: 'Test File', onClick: () => createFile('test') },
                ],
                itemSelectionType: 'none',
              },
            ],
          },
          submenuTrigger: 'hover',
        },
        {
          id: 'open',
          label: 'Open Recent',
          onClick: handleOpenRecent,
          subMenu: {
            groups: [
              {
                id: 'recent',
                items: recentProjects.map(project => ({
                  id: project.id,
                  label: project.name,
                  onClick: () => openProject(project.id),
                })),
                itemSelectionType: 'none',
              },
            ],
          },
        },
      ],
      itemSelectionType: 'none',
    },
  ],
};

<Menu config={navigationConfig}>
  <Button>File</Button>
</Menu>
```

## API Reference

### MenuProps

| Prop            | Type                                 | Default          | Description                               |
| --------------- | ------------------------------------ | ---------------- | ----------------------------------------- |
| `config`        | `MenuConfig`                         | **required**     | Menu structure and behavior configuration |
| `selectedItems` | `MenuSelection`                      | `{}`             | Currently selected items by group         |
| `onChange`      | `(selection: MenuSelection) => void` | -                | Called when selection state changes       |
| `children`      | `React.ReactNode`                    | -                | Trigger element for the menu              |
| `checkboxIcon`  | `React.ReactNode`                    | `<CheckIcon />`  | Custom icon for checkbox selected state   |
| `radioIcon`     | `React.ReactNode`                    | `<CircleIcon />` | Custom icon for radio selected state      |
| `disabled`      | `boolean`                            | `false`          | Whether the menu trigger is disabled      |
| `isSubmenu`     | `boolean`                            | `false`          | Internal prop for nested submenus         |
| `className`     | `string`                             | -                | CSS class for menu content                |
| `testId`        | `string`                             | -                | Test identifier                           |

### MenuConfig

```typescript
type MenuConfig = {
  openOnHover?: boolean;    // Open menu on hover instead of click
  groups: MenuGroup[];      // Array of menu groups
};
```

### MenuGroup

```typescript
type MenuGroup = {
  id: string;                          // Unique group identifier
  label?: string;                      // Optional group label
  items: MenuItem[];                   // Items in this group
  itemSelectionType: ItemSelectionType; // Selection behavior
  closeOnItemClick?: boolean;          // Close menu when item clicked
};
```

### MenuItem

```typescript
type MenuItem = {
  id: string;                    // Unique item identifier
  label: string;                 // Display text
  onClick: (id: string, event: MouseEvent) => void; // Click handler
  disabled?: boolean;            // Whether item is disabled
  subMenu?: MenuConfig;          // Nested submenu configuration
  submenuTrigger?: SubmenuTrigger; // How submenu opens
};
```

### Selection Types

#### `'none'` - Simple Actions

- No selection state management
- Just calls `onClick` handlers
- Use for: Actions, commands, navigation

#### `'radio'` - Single Selection

- Only one item can be selected per group
- Automatically manages selection state
- Use for: View modes, themes, single options

#### `'checkbox'` - Multiple Selection  

- Multiple items can be selected per group
- Toggle behavior on click
- Use for: Filters, feature toggles, multi-select

### Submenu Triggers

#### `'hover'` (default)

- Submenu opens on mouse hover
- Better for navigation-style menus
- More discoverable for users

#### `'click'`

- Submenu opens only on click
- Better for action-heavy interfaces
- More explicit user control

## State Management

### Selection State Format

```typescript
type MenuSelection = Record<string, string[]>;

// Example:
const selection = {
  'theme': ['dark'],           // Radio: single value in array
  'fileTypes': ['images', 'docs'], // Checkbox: multiple values
  'actions': [],               // None: empty array
};
```

### Handling Selection Changes

```tsx
const [menuState, setMenuState] = useState<MenuSelection>({
  view: ['grid'],
  filters: ['visible', 'images'],
});

const handleMenuChange = (newSelection: MenuSelection) => {
  setMenuState(newSelection);
  
  // Apply changes to your application state
  if (newSelection.view?.[0]) {
    setViewMode(newSelection.view[0]);
  }
  
  if (newSelection.filters) {
    applyFilters(newSelection.filters);
  }
};

<Menu 
  config={config}
  selectedItems={menuState}
  onChange={handleMenuChange}
/>
```

## Advanced Patterns

### Conditional Menu Items

```tsx
const createConditionalConfig = (user: User): MenuConfig => ({
  groups: [
    {
      id: 'actions',
      items: [
        { id: 'view', label: 'View', onClick: handleView },
        { id: 'edit', label: 'Edit', onClick: handleEdit },
        ...(user.canDelete ? [{ 
          id: 'delete', 
          label: 'Delete', 
          onClick: handleDelete 
        }] : []),
        ...(user.isAdmin ? [{
          id: 'admin',
          label: 'Admin Options',
          onClick: handleAdmin,
          subMenu: adminMenuConfig,
        }] : []),
      ],
      itemSelectionType: 'none',
    },
  ],
});
```

### Dynamic Menu Updates

```tsx
const [menuConfig, setMenuConfig] = useState(initialConfig);

// Update menu based on context
useEffect(() => {
  const updatedConfig = {
    ...menuConfig,
    groups: menuConfig.groups.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        disabled: !isActionAvailable(item.id),
      })),
    })),
  };
  setMenuConfig(updatedConfig);
}, [contextState]);
```

### Custom Icons and Styling

```tsx
// Custom checkbox icon
const CustomCheckIcon = () => (
  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
);

// Custom radio icon  
const CustomRadioIcon = () => (
  <div className="w-4 h-4 bg-blue-500 rounded-full" />
);

<Menu 
  config={config}
  checkboxIcon={<CustomCheckIcon />}
  radioIcon={<CustomRadioIcon />}
/>
```

## Keyboard Navigation

The Menu component supports full keyboard accessibility:

- **Tab**: Focus menu trigger
- **Enter/Space**: Open menu  
- **Arrow Keys**: Navigate menu items
- **Enter/Space**: Select menu item
- **Escape**: Close menu
- **Arrow Right**: Open submenu (when focused)
- **Arrow Left**: Close submenu

## Accessibility Features

- **ARIA Compliance**: Proper roles, states, and properties
- **Screen Reader Support**: Descriptive labels and announcements  
- **Focus Management**: Logical focus flow and visual indicators
- **Keyboard Navigation**: Full keyboard control
- **High Contrast**: Works with system accessibility settings

## Performance Tips

### Large Menus

For menus with many items, consider:

- Virtualizing long lists
- Lazy loading submenu content
- Debouncing selection changes

```tsx
// Debounced selection handler
const debouncedOnChange = useMemo(
  () => debounce((selection: MenuSelection) => {
    applyChanges(selection);
  }, 300),
  []
);

<Menu config={config} onChange={debouncedOnChange} />
```

### Dynamic Content

For frequently changing menus:

- Memoize menu configuration
- Use stable IDs for items
- Avoid recreating config objects

```tsx
const memoizedConfig = useMemo(() => createMenuConfig(data), [data]);

<Menu config={memoizedConfig} />
```

## Common Patterns

### Toolbar Actions Menu

```tsx
const toolbarConfig = {
  groups: [
    {
      id: 'format',
      label: 'Format',
      items: [
        { id: 'bold', label: 'Bold', onClick: toggleBold },
        { id: 'italic', label: 'Italic', onClick: toggleItalic },
        { id: 'underline', label: 'Underline', onClick: toggleUnderline },
      ],
      itemSelectionType: 'checkbox',
    },
    {
      id: 'align',
      label: 'Alignment',
      items: [
        { id: 'left', label: 'Left', onClick: setAlign },
        { id: 'center', label: 'Center', onClick: setAlign },
        { id: 'right', label: 'Right', onClick: setAlign },
      ],
      itemSelectionType: 'radio',
    },
  ],
};
```

### File Browser Context Menu

```tsx
const fileContextConfig = {
  groups: [
    {
      id: 'actions',
      items: [
        { id: 'open', label: 'Open', onClick: openFile },
        { id: 'rename', label: 'Rename', onClick: renameFile },
        { id: 'duplicate', label: 'Duplicate', onClick: duplicateFile },
      ],
      itemSelectionType: 'none',
    },
    {
      id: 'share',
      items: [
        {
          id: 'share',
          label: 'Share',
          onClick: shareFile,
          subMenu: shareSubmenuConfig,
        },
      ],
      itemSelectionType: 'none',
    },
  ],
};
```

## Troubleshooting

### Menu Not Opening

- Check that `disabled` prop is not set to `true`
- Verify menu trigger element is clickable
- Ensure config has at least one group with items

### Selection Not Working

- Verify `onChange` handler is provided for radio/checkbox types
- Check that `selectedItems` prop format matches expected structure
- Ensure item IDs are unique within groups

### Submenu Issues

- Confirm `subMenu` configuration is valid
- Check `submenuTrigger` setting matches desired behavior
- Verify nested menu items have unique IDs

### Styling Problems

- Check theme provider is configured correctly
- Verify CSS custom properties are available
- Test with different viewport sizes for responsive behavior
