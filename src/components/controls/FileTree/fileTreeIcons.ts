import type { FileTreeNode } from './FileTree.types';

/**
 * The icon categories FileTree resolves a node to. Folders get an open/closed
 * pair; files collapse to a small set of type buckets backed by the existing
 * icon set. Rendering a kind into an actual icon element lives in the client
 * component — this module is pure classification so it can be unit-tested
 * without React.
 */
export type FileIconKind =
  | 'folder'
  | 'folder-open'
  | 'image'
  | 'media'
  | 'code'
  | 'archive'
  | 'text'
  | 'file';

/**
 * Maps a lowercased file extension (no dot) to an icon bucket. Unknown
 * extensions fall through to the generic `file` glyph.
 */
const KIND_BY_EXTENSION: Readonly<Record<string, FileIconKind>> = {
  // Images / raster + vector assets
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  bmp: 'image',
  ico: 'image',
  svg: 'image',
  tif: 'image',
  tiff: 'image',
  psd: 'image',

  // Media (audio + video share the play glyph)
  mp3: 'media',
  wav: 'media',
  ogg: 'media',
  flac: 'media',
  aac: 'media',
  m4a: 'media',
  mp4: 'media',
  mov: 'media',
  avi: 'media',
  mkv: 'media',
  webm: 'media',

  // Code / markup / config / data
  js: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  mjs: 'code',
  cjs: 'code',
  json: 'code',
  json5: 'code',
  html: 'code',
  htm: 'code',
  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  vue: 'code',
  svelte: 'code',
  astro: 'code',
  py: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  java: 'code',
  kt: 'code',
  swift: 'code',
  c: 'code',
  h: 'code',
  cpp: 'code',
  cc: 'code',
  hpp: 'code',
  cs: 'code',
  php: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',
  yml: 'code',
  yaml: 'code',
  toml: 'code',
  xml: 'code',
  sql: 'code',
  graphql: 'code',
  gql: 'code',
  lua: 'code',
  dart: 'code',
  r: 'code',

  // Archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  tgz: 'archive',
  bz2: 'archive',
  xz: 'archive',

  // Text / documents
  txt: 'text',
  md: 'text',
  mdx: 'text',
  rtf: 'text',
  pdf: 'text',
  doc: 'text',
  docx: 'text',
  csv: 'text',
  tsv: 'text',
  log: 'text',
};

/**
 * Extracts the lowercased extension (without the dot) from a file name, or
 * `undefined` when there isn't one. Dotfiles such as `.env` / `.gitignore` are
 * treated as having no extension (the leading dot is not a separator).
 */
export function getFileExtension(name: string): string | undefined {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return undefined;
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Classifies an extension into an icon bucket. `undefined` / unknown → `file`.
 */
export function classifyExtension(ext: string | undefined): FileIconKind {
  if (ext === undefined) return 'file';
  return KIND_BY_EXTENSION[ext.toLowerCase()] ?? 'file';
}

/**
 * Resolves the icon kind for a node. Folders return `folder-open` when
 * `expanded`, else `folder`. Files use the explicit `ext` when provided, falling
 * back to the extension parsed from `name`.
 */
export function getFileIconKind(
  node: Pick<FileTreeNode, 'kind' | 'name' | 'ext'>,
  expanded = false
): FileIconKind {
  if (node.kind === 'folder') return expanded ? 'folder-open' : 'folder';
  const ext = node.ext ?? getFileExtension(node.name);
  return classifyExtension(ext);
}
