import { useState, useMemo } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Input, Text, Paper, Button } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';
import { AddIcon } from '@/components/Icons/AddIcon';
import { AiChatIcon } from '@/components/Icons/AiChatIcon';
import { AiSparklesIcon } from '@/components/Icons/AiSparklesIcon';
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon';
import { ArrowLeftIcon } from '@/components/Icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon';
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon';
import { BookmarkIcon } from '@/components/Icons/BookmarkIcon';
import { CalendarIcon } from '@/components/Icons/CalendarIcon';
import { CheckIcon } from '@/components/Icons/CheckIcon';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon';
import { CircleIcon } from '@/components/Icons/CircleIcon';
import { ClockIcon } from '@/components/Icons/ClockIcon';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { CodeIcon } from '@/components/Icons/CodeIcon';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { CutIcon } from '@/components/Icons/CutIcon';
import { DownloadIcon } from '@/components/Icons/DownloadIcon';
import { EditIcon } from '@/components/Icons/EditIcon';
import { ErrorIcon } from '@/components/Icons/ErrorIcon';
import { EyeDropperIcon } from '@/components/Icons/EyeDropperIcon';
import { EyeIcon } from '@/components/Icons/EyeIcon';
import { FilterIcon } from '@/components/Icons/FilterIcon';
import { FolderIcon } from '@/components/Icons/FolderIcon';
import { FullscreenIcon } from '@/components/Icons/FullscreenIcon';
import { GridIcon } from '@/components/Icons/GridIcon';
import { HeartIcon } from '@/components/Icons/HeartIcon';
import { HelpIcon } from '@/components/Icons/HelpIcon';
import { HomeIcon } from '@/components/Icons/HomeIcon';
import { InfoIcon } from '@/components/Icons/InfoIcon';
import { LinkIcon } from '@/components/Icons/LinkIcon';
import { ListIcon } from '@/components/Icons/ListIcon';
import { LockIcon } from '@/components/Icons/LockIcon';
import { MaximizeIcon } from '@/components/Icons/MaximizeIcon';
import { MenuIcon } from '@/components/Icons/MenuIcon';
import { MinimizeIcon } from '@/components/Icons/MinimizeIcon';
import { PasteIcon } from '@/components/Icons/PasteIcon';
import { PlayIcon } from '@/components/Icons/PlayIcon';
import { RedoIcon } from '@/components/Icons/RedoIcon';
import { RefreshIcon } from '@/components/Icons/RefreshIcon';
import { RobotIcon } from '@/components/Icons/RobotIcon';
import { SaveIcon } from '@/components/Icons/SaveIcon';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { SortIcon } from '@/components/Icons/SortIcon';
import { StarIcon } from '@/components/Icons/StarIcon';
import { SuccessIcon } from '@/components/Icons/SuccessIcon';
import { TagIcon } from '@/components/Icons/TagIcon';
import { TangentAlignedIcon } from '@/components/Icons/TangentAlignedIcon';
import { TangentAutoIcon } from '@/components/Icons/TangentAutoIcon';
import { TangentFreeIcon } from '@/components/Icons/TangentFreeIcon';
import { TangentLinearIcon } from '@/components/Icons/TangentLinearIcon';
import { TangentMirroredIcon } from '@/components/Icons/TangentMirroredIcon';
import { TangentStepIcon } from '@/components/Icons/TangentStepIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { UndoIcon } from '@/components/Icons/UndoIcon';
import { UnlockIcon } from '@/components/Icons/UnlockIcon';
import { UploadIcon } from '@/components/Icons/UploadIcon';
import { UserIcon } from '@/components/Icons/UserIcon';
import { WarningIcon } from '@/components/Icons/WarningIcon';
import { ZoomInIcon } from '@/components/Icons/ZoomInIcon';
import { ZoomOutIcon } from '@/components/Icons/ZoomOutIcon';

interface IconEntry {
  name: string;
  component: React.ComponentType<{ size?: string }>;
  category: string;
}

const ICONS: IconEntry[] = [
  // Navigation
  { name: 'ArrowDown', component: ArrowDownIcon, category: 'Navigation' },
  { name: 'ArrowLeft', component: ArrowLeftIcon, category: 'Navigation' },
  { name: 'ArrowRight', component: ArrowRightIcon, category: 'Navigation' },
  { name: 'ArrowUp', component: ArrowUpIcon, category: 'Navigation' },
  { name: 'ChevronDown', component: ChevronDownIcon, category: 'Navigation' },
  { name: 'ChevronUp', component: ChevronUpIcon, category: 'Navigation' },
  // Actions
  { name: 'Add', component: AddIcon, category: 'Actions' },
  { name: 'Copy', component: CopyIcon, category: 'Actions' },
  { name: 'Cut', component: CutIcon, category: 'Actions' },
  { name: 'Edit', component: EditIcon, category: 'Actions' },
  { name: 'Paste', component: PasteIcon, category: 'Actions' },
  { name: 'Trash', component: TrashIcon, category: 'Actions' },
  { name: 'Undo', component: UndoIcon, category: 'Actions' },
  { name: 'Redo', component: RedoIcon, category: 'Actions' },
  { name: 'Save', component: SaveIcon, category: 'Actions' },
  { name: 'Download', component: DownloadIcon, category: 'Actions' },
  { name: 'Upload', component: UploadIcon, category: 'Actions' },
  // UI
  { name: 'Menu', component: MenuIcon, category: 'UI' },
  { name: 'Grid', component: GridIcon, category: 'UI' },
  { name: 'List', component: ListIcon, category: 'UI' },
  { name: 'Fullscreen', component: FullscreenIcon, category: 'UI' },
  { name: 'Maximize', component: MaximizeIcon, category: 'UI' },
  { name: 'Minimize', component: MinimizeIcon, category: 'UI' },
  // Search & Filter
  { name: 'Search', component: SearchIcon, category: 'Search & Filter' },
  { name: 'Filter', component: FilterIcon, category: 'Search & Filter' },
  { name: 'Sort', component: SortIcon, category: 'Search & Filter' },
  // Status
  { name: 'Info', component: InfoIcon, category: 'Status' },
  { name: 'Help', component: HelpIcon, category: 'Status' },
  { name: 'Error', component: ErrorIcon, category: 'Status' },
  { name: 'Warning', component: WarningIcon, category: 'Status' },
  { name: 'Success', component: SuccessIcon, category: 'Status' },
  // Media
  { name: 'Play', component: PlayIcon, category: 'Media' },
  { name: 'Bookmark', component: BookmarkIcon, category: 'Media' },
  { name: 'Code', component: CodeIcon, category: 'Media' },
  { name: 'Link', component: LinkIcon, category: 'Media' },
  // Organization
  { name: 'Folder', component: FolderIcon, category: 'Organization' },
  { name: 'Tag', component: TagIcon, category: 'Organization' },
  { name: 'Calendar', component: CalendarIcon, category: 'Organization' },
  // User & Security
  { name: 'User', component: UserIcon, category: 'User & Security' },
  { name: 'Lock', component: LockIcon, category: 'User & Security' },
  { name: 'Unlock', component: UnlockIcon, category: 'User & Security' },
  // Misc
  { name: 'Close', component: CloseIcon, category: 'Misc' },
  { name: 'Refresh', component: RefreshIcon, category: 'Misc' },
  { name: 'Eye', component: EyeIcon, category: 'Misc' },
  { name: 'EyeDropper', component: EyeDropperIcon, category: 'Misc' },
  { name: 'Heart', component: HeartIcon, category: 'Misc' },
  { name: 'Star', component: StarIcon, category: 'Misc' },
  { name: 'Settings', component: SettingsIcon, category: 'Misc' },
  { name: 'Home', component: HomeIcon, category: 'Misc' },
  { name: 'Check', component: CheckIcon, category: 'Misc' },
  { name: 'Circle', component: CircleIcon, category: 'Misc' },
  { name: 'Clock', component: ClockIcon, category: 'Misc' },
  // AI
  { name: 'AiChat', component: AiChatIcon, category: 'AI' },
  { name: 'AiSparkles', component: AiSparklesIcon, category: 'AI' },
  { name: 'Robot', component: RobotIcon, category: 'AI' },
  // Zoom
  { name: 'ZoomIn', component: ZoomInIcon, category: 'Zoom' },
  { name: 'ZoomOut', component: ZoomOutIcon, category: 'Zoom' },
  // Curves
  {
    name: 'TangentFree',
    component: TangentFreeIcon,
    category: 'Curves',
  },
  {
    name: 'TangentAligned',
    component: TangentAlignedIcon,
    category: 'Curves',
  },
  {
    name: 'TangentMirrored',
    component: TangentMirroredIcon,
    category: 'Curves',
  },
  {
    name: 'TangentAuto',
    component: TangentAutoIcon,
    category: 'Curves',
  },
  {
    name: 'TangentLinear',
    component: TangentLinearIcon,
    category: 'Curves',
  },
  {
    name: 'TangentStep',
    component: TangentStepIcon,
    category: 'Curves',
  },
];

const CATEGORIES = [
  'All',
  'Navigation',
  'Actions',
  'UI',
  'Search & Filter',
  'Status',
  'Media',
  'Organization',
  'User & Security',
  'Misc',
  'AI',
  'Zoom',
  'Curves',
];

export default function IconDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredIcons = useMemo(() => {
    let icons = ICONS;
    if (activeCategory !== 'All') {
      icons = icons.filter(i => i.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      icons = icons.filter(i => i.name.toLowerCase().includes(q));
    }
    return icons;
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ICONS.length };
    for (const icon of ICONS) {
      counts[icon.category] = (counts[icon.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Input
          startIcon={<SearchIcon />}
          placeholder="Search icons..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Flex gap={4}>
          <Stack spacing={1} style={{ minWidth: 140, flexShrink: 0 }}>
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                style={{ justifyContent: 'flex-start' }}
              >
                {cat} ({categoryCounts[cat] || 0})
              </Button>
            ))}
          </Stack>
          <Flex wrap="wrap" gap={2} style={{ flex: 1 }}>
            {filteredIcons.map(({ name, component: IconComp }) => (
              <Paper
                key={name}
                elevation={1}
                padding={8}
                style={{
                  width: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconComp size="lg" />
                <Text
                  size="xs"
                  color="muted"
                  style={{ textAlign: 'center', wordBreak: 'break-all' }}
                >
                  {name}
                </Text>
              </Paper>
            ))}
            {filteredIcons.length === 0 && (
              <Text size="sm" color="muted">
                No icons found.
              </Text>
            )}
          </Flex>
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}
