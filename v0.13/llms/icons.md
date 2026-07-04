# Icons
> Browse and use the 93 built-in SVG icons included with Entangle UI.

Entangle UI includes 93 built-in SVG icons designed for editor interfaces. All icons use the `Icon` component wrapper, support consistent sizing and coloring through theme tokens, and are tree-shakeable.

**Icon Gallery**

## Import

Import icons individually for optimal tree-shaking:

```tsx
import { SaveIcon, PlayIcon, AddIcon } from 'entangle-ui';
```

## Usage

```tsx
// Standalone icon
<SaveIcon size="md" />

// Inside a button
<Button icon={<SaveIcon />}>Save</Button>

// With IconButton
<IconButton icon={<TrashIcon />} label="Delete" />
```

## Sizing

All icons accept the same `size` prop as other components:

| Size | Dimensions |
| ---- | ---------- |
| `sm` | 14x14px    |
| `md` | 16x16px    |
| `lg` | 20x20px    |

```tsx
<AddIcon size="sm" />
<AddIcon size="md" />
<AddIcon size="lg" />
```

## Catalog

The full catalog grouped by category. Each row lists the export name and a short description of the typical use case.

### Navigation

| Icon                 | Description                                         |
| -------------------- | --------------------------------------------------- |
| `ArrowUpIcon`        | Solid up arrow for moves and ordering.              |
| `ArrowDownIcon`      | Solid down arrow for moves and ordering.            |
| `ArrowLeftIcon`      | Solid left arrow for back navigation.               |
| `ArrowRightIcon`     | Solid right arrow for forward navigation.           |
| `ChevronUpIcon`      | Subtle up chevron for collapse and accordion.       |
| `ChevronDownIcon`    | Subtle down chevron for expand and dropdown.        |
| `ChevronLeftIcon`    | Subtle left chevron for previous and collapse.      |
| `ChevronRightIcon`   | Subtle right chevron for next, expand, disclosure.  |
| `HomeIcon`           | House silhouette for dashboard or root navigation.  |
| `MenuIcon`           | Three horizontal lines (hamburger) for side nav.    |
| `DotsVerticalIcon`   | Vertical 3-dot trigger for item action menus.       |
| `DotsHorizontalIcon` | Horizontal 3-dot trigger for inline overflow menus. |

### Actions

| Icon           | Description                                       |
| -------------- | ------------------------------------------------- |
| `AddIcon`      | Plus sign for create/add actions.                 |
| `MinusIcon`    | Single horizontal stroke for remove/decrement.    |
| `EditIcon`     | Pencil for edit and rename actions.               |
| `TrashIcon`    | Trash can for delete actions.                     |
| `SaveIcon`     | Floppy disk for save actions.                     |
| `CopyIcon`     | Two stacked sheets for copy actions.              |
| `CutIcon`      | Scissors for cut actions.                         |
| `PasteIcon`    | Clipboard with sheet for paste actions.           |
| `UndoIcon`     | Counter-clockwise arrow for undo.                 |
| `RedoIcon`     | Clockwise arrow for redo.                         |
| `RefreshIcon`  | Circular arrow for reload and refetch.            |
| `DownloadIcon` | Tray with down arrow for download.                |
| `UploadIcon`   | Tray with up arrow for upload.                    |
| `ArchiveIcon`  | Box with lid for archiving / moving to long-term. |
| `PinIcon`      | Push-pin for keeping items visible.               |
| `SendIcon`     | Paper plane for submitting messages and forms.    |

### Media & Playback

| Icon           | Description                                       |
| -------------- | ------------------------------------------------- |
| `PlayIcon`     | Right-pointing triangle for start playback.       |
| `PauseIcon`    | Two vertical bars for pause playback.             |
| `StopIcon`     | Solid square for stop playback or stop streaming. |
| `BookmarkIcon` | Ribbon for bookmarking items.                     |
| `CodeIcon`     | Angle brackets for code blocks and snippets.      |
| `LinkIcon`     | Chain link for hyperlinks.                        |

### View Controls

| Icon             | Description                             |
| ---------------- | --------------------------------------- |
| `GridIcon`       | 2x2 grid for grid view.                 |
| `ListIcon`       | Stacked horizontal lines for list view. |
| `FilterIcon`     | Funnel for filtering.                   |
| `SortIcon`       | Two-direction arrows for sorting.       |
| `ZoomInIcon`     | Magnifier with plus for zoom in.        |
| `ZoomOutIcon`    | Magnifier with minus for zoom out.      |
| `FullscreenIcon` | Outward arrows for fullscreen toggle.   |
| `MaximizeIcon`   | Square outline for maximize window.     |
| `MinimizeIcon`   | Bottom bar for minimize window.         |

### Viewport & 3D

| Icon          | Description                                               |
| ------------- | --------------------------------------------------------- |
| `OrbitIcon`   | Body with orbiting satellites for camera orbit.           |
| `RotateIcon`  | Clockwise circular arrow for rotate transforms.           |
| `SpinIcon`    | Open ring for continuous spin / turntable / busy.         |
| `CameraIcon`  | Camera body with a lens for viewport cameras and capture. |
| `CubeIcon`    | Isometric box for 3D objects, meshes, and axes.           |
| `ZoomFitIcon` | Corner frame around content for zoom-to-fit.              |

### Status & Feedback

| Icon          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `InfoIcon`    | Circle with "i" for informational messages.          |
| `HelpIcon`    | Circle with "?" for help and documentation entries.  |
| `WarningIcon` | Triangle with "!" for warnings.                      |
| `ErrorIcon`   | Circle with "x" for errors.                          |
| `SuccessIcon` | Circle with checkmark for success states.            |
| `CheckIcon`   | Plain checkmark for selected/applied indicators.     |
| `CircleIcon`  | Empty circle for status dots and radio-like markers. |

### Search & Discovery

| Icon             | Description                               |
| ---------------- | ----------------------------------------- |
| `SearchIcon`     | Magnifier for search inputs.              |
| `EyeIcon`        | Eye for show/visibility toggles.          |
| `EyeDropperIcon` | Color picker dropper for sampling colors. |

### Organization

| Icon             | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `FolderIcon`     | Closed folder for directory navigation.                  |
| `FolderOpenIcon` | Opened folder for revealed directories.                  |
| `FolderCogIcon`  | Folder with a gear overlay for project-scoped settings.  |
| `FileTextIcon`   | Document with text lines for notes and docs.             |
| `TagIcon`        | Tag for labels and categorization.                       |
| `CalendarIcon`   | Calendar grid for date selection.                        |
| `ClockIcon`      | Clock face for time and history.                         |
| `BuildingIcon`   | Multi-story building for organizations and architecture. |

### User & Security

| Icon         | Description                                       |
| ------------ | ------------------------------------------------- |
| `UserIcon`   | Single user silhouette for profile and account.   |
| `UsersIcon`  | Two overlapping silhouettes for teams and groups. |
| `LockIcon`   | Closed padlock for locked states.                 |
| `UnlockIcon` | Open padlock for unlocked states.                 |
| `StarIcon`   | Star for favorites and ratings.                   |
| `HeartIcon`  | Heart for likes.                                  |

### Developer Tools

| Icon            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `TerminalIcon`  | Caret with underscore for shells and command palette. |
| `GitBranchIcon` | Trunk with side fork for VCS branch indicators.       |
| `BugIcon`       | Insect for debugger panels and bug reports.           |
| `SettingsIcon`  | Gear for general application settings.                |
| `CloseIcon`     | "x" for close, dismiss, and clear actions.            |

### AI & Automation

| Icon             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `AiChatIcon`     | Chat bubble with AI accent for AI conversations.   |
| `AiSparklesIcon` | Sparkles for AI-generated content and suggestions. |
| `RobotIcon`      | Robot head for automated agents.                   |

### Curves (animation tangents)

| Icon                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `TangentFreeIcon`     | Free tangent handles indicator.             |
| `TangentAlignedIcon`  | Aligned (continuous direction) tangents.    |
| `TangentMirroredIcon` | Mirrored (continuous magnitude) tangents.   |
| `TangentAutoIcon`     | Auto-tangent indicator.                     |
| `TangentLinearIcon`   | Linear interpolation indicator.             |
| `TangentStepIcon`     | Stepped (constant) interpolation indicator. |

## Creating Custom Icons

All icons use the `Icon` wrapper component. To create a custom icon:

```tsx
import { Icon } from 'entangle-ui';
import type { IconProps } from 'entangle-ui';

export const MyCustomIcon = (props: Omit<IconProps, 'children'>) => (
  <Icon {...props}>
    <path d="M12 2L2 22h20L12 2z" />
  </Icon>
);
```

The `Icon` component renders an SVG element with:

- `viewBox="0 0 24 24"` coordinate system
- `stroke="currentColor"` for color inheritance
- `fill="none"` and `strokeLinecap="round"` defaults
- Theme-aware sizing via the `size` prop
