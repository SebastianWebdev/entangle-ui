#!/usr/bin/env node
// Generates LLM-friendly plain-text/markdown documentation from the Astro
// Starlight MDX sources. Outputs:
//   docs-site/public/llms.txt              short index (llmstxt.org)
//   docs-site/public/llms-full.txt         full concatenated docs
//   docs-site/public/llms/<slug>.md        per-page extracted markdown
//   .claude/skills/entangle-ui/SKILL.md    Claude Code skill entrypoint
//   .claude/skills/entangle-ui/<slug>.md   per-page reference for the skill
//
// The generator is intentionally tolerant: any MDX construct it cannot
// understand is simply removed so the output is always valid markdown.

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsSiteDir = resolve(__dirname, '..');
const repoRoot = resolve(docsSiteDir, '..');
const docsDir = join(docsSiteDir, 'src', 'content', 'docs');
const publicDir = join(docsSiteDir, 'public');
const publicLlmsDir = join(publicDir, 'llms');
const skillsDir = join(repoRoot, '.claude', 'skills', 'entangle-ui');

const SITE_BASE = 'https://entangle-ui.dev';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && full.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function parseFrontmatter(src) {
  const match = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: src };
  const data = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, body: src.slice(match[0].length) };
}

// Convert a JS-style array literal (as found in `<PropsTable props={[...]} />`)
// into real values. We use the Function constructor in a controlled build-time
// context — the input comes from our own docs.
function evalArrayLiteral(literal) {
  try {
    return new Function(`return (${literal});`)();
  } catch {
    return null;
  }
}

function escapePipes(str = '') {
  return String(str).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function propsTableToMarkdown(propsLiteral) {
  const props = evalArrayLiteral(propsLiteral);
  if (!Array.isArray(props) || props.length === 0) return '';
  const rows = [
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
  ];
  for (const p of props) {
    const name = p?.name ?? '';
    const required = p?.required ? ' *(required)*' : '';
    rows.push(
      `| \`${name}\`${required} | \`${escapePipes(p?.type ?? '')}\` | ${
        p?.default ? `\`${escapePipes(p.default)}\`` : '—'
      } | ${escapePipes(p?.description ?? '')} |`
    );
  }
  return rows.join('\n');
}

// Match a `<PropsTable props={[ ... ]} />` block and replace with a real
// markdown table. The brace-matching here is the only place we cannot rely
// on naive regex — we count braces so nested objects work.
function replacePropsTables(src) {
  const marker = '<PropsTable';
  let out = '';
  let i = 0;
  while (i < src.length) {
    const start = src.indexOf(marker, i);
    if (start === -1) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, start);

    const propsKey = src.indexOf('props={', start);
    if (propsKey === -1) {
      // Unrecognised PropsTable shape — drop the tag area up to the next /> .
      const end = src.indexOf('/>', start);
      if (end === -1) {
        out += src.slice(start);
        break;
      }
      i = end + 2;
      continue;
    }

    // Find the matching closing brace of the props={...} expression.
    let depth = 0;
    let j = propsKey + 'props={'.length - 1; // position at '{'
    let exprStart = j + 1;
    let exprEnd = -1;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          exprEnd = j;
          break;
        }
      }
    }
    if (exprEnd === -1) {
      out += src.slice(start);
      break;
    }
    const literal = src.slice(exprStart, exprEnd);
    const close = src.indexOf('/>', exprEnd);
    if (close === -1) {
      out += src.slice(start);
      break;
    }
    out += propsTableToMarkdown(literal);
    i = close + 2;
  }
  return out;
}

// Collapse Astro/MDX wrappers that exist purely for live-preview rendering.
// We keep the inner content (which is usually a fenced code block) but drop
// the JSX shell since LLMs cannot render React demos.
function unwrapComponentPreviews(src) {
  // <ComponentPreview ... > ... </ComponentPreview>
  return src.replace(
    /<ComponentPreview([^>]*)>([\s\S]*?)<\/ComponentPreview>/g,
    (_match, attrs, inner) => {
      const titleMatch = attrs.match(/title=["']([^"']+)["']/);
      const descMatch = attrs.match(/description=["']([^"']+)["']/);
      const parts = [];
      if (titleMatch) parts.push(`**${titleMatch[1]}**`);
      if (descMatch) parts.push(descMatch[1]);
      const header = parts.length ? parts.join(' — ') + '\n\n' : '';
      return header + inner.trim() + '\n';
    }
  );
}

function stripImports(src) {
  // Remove ESM import lines, including multi-line imports.
  return src.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
}

// Drop self-closing JSX demo tags like `<ButtonDemo client:only="react" />`.
function stripSelfClosingJsx(src) {
  return src.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '');
}

// Drop opening/closing JSX tags we don't otherwise transform. We deliberately
// leave the inner text/code blocks intact.
function stripRemainingJsxTags(src) {
  return src
    .replace(/<\/?[A-Z][A-Za-z0-9]*\b[^>]*>/g, '')
    .replace(/<[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*\b[^>]*\/?>/g, '');
}

function tidyBlankLines(src) {
  return (
    src
      .split('\n')
      .map(line => line.replace(/[\t ]+$/g, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

// Stash fenced code blocks (```...```) and inline code (`...`) behind opaque
// placeholders so subsequent JSX-stripping passes don't touch JSX that lives
// inside example snippets — those are the parts users will copy-paste.
function protectCode(src) {
  const fences = [];
  let out = src.replace(/```[\s\S]*?```/g, block => {
    fences.push(block);
    return `__CODE_FENCE_${fences.length - 1}__`;
  });
  const inlines = [];
  out = out.replace(/`[^`\n]+`/g, block => {
    inlines.push(block);
    return `__CODE_INLINE_${inlines.length - 1}__`;
  });
  return { out, fences, inlines };
}

function restoreCode(src, fences, inlines) {
  return src
    .replace(/__CODE_INLINE_(\d+)__/g, (_m, i) => inlines[Number(i)] ?? '')
    .replace(/__CODE_FENCE_(\d+)__/g, (_m, i) => fences[Number(i)] ?? '');
}

function mdxToMarkdown(src) {
  // Protect code first so example snippets — which legitimately contain
  // imports and JSX — survive every subsequent strip pass.
  const { out: protectedSrc, fences, inlines } = protectCode(src);
  let out = protectedSrc;
  out = stripImports(out);
  out = replacePropsTables(out);
  out = unwrapComponentPreviews(out);
  out = stripSelfClosingJsx(out);
  out = stripRemainingJsxTags(out);
  out = restoreCode(out, fences, inlines);
  out = tidyBlankLines(out);
  return out;
}

// Map a docs MDX file path to a stable slug used for output naming and links.
function pathToSlug(absPath) {
  const rel = relative(docsDir, absPath).replace(/\\/g, '/');
  let slug = rel.replace(/\.mdx$/, '');
  if (slug.endsWith('/index')) slug = slug.replace(/\/index$/, '');
  if (slug === 'index') slug = '';
  return slug;
}

function categoriseSlug(slug) {
  if (!slug) return 'overview';
  const [head] = slug.split('/');
  return head;
}

function humanTitle(data, slug) {
  if (data.title) return data.title;
  const last = slug.split('/').pop() ?? slug;
  return last
    .split('-')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

async function main() {
  const files = (await walk(docsDir)).sort();

  // Clean and recreate output dirs that we own.
  if (existsSync(publicLlmsDir)) await rm(publicLlmsDir, { recursive: true });
  await mkdir(publicLlmsDir, { recursive: true });
  await mkdir(skillsDir, { recursive: true });

  const pages = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const slug = pathToSlug(file);
    const title = humanTitle(data, slug);
    const description = data.description ?? '';
    const markdown = mdxToMarkdown(body);
    pages.push({ file, slug, title, description, markdown });
  }

  // Group by top-level category (getting-started, guides, components/<sub>, hooks, ...).
  const groups = new Map();
  for (const page of pages) {
    const top = categoriseSlug(page.slug);
    let group = top;
    if (top === 'components') {
      const [, sub] = page.slug.split('/');
      group = `components/${sub}`;
    }
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(page);
  }

  const groupOrder = [
    'overview',
    'getting-started',
    'guides',
    'components/primitives',
    'components/layout',
    'components/controls',
    'components/navigation',
    'components/feedback',
    'components/shell',
    'components/editor',
    'hooks',
    'showcase',
    'icons',
  ];
  const orderedGroupKeys = [
    ...groupOrder.filter(g => groups.has(g)),
    ...[...groups.keys()].filter(g => !groupOrder.includes(g)),
  ];

  const groupLabels = {
    overview: 'Overview',
    'getting-started': 'Getting Started',
    guides: 'Guides',
    'components/primitives': 'Components — Primitives',
    'components/layout': 'Components — Layout',
    'components/controls': 'Components — Controls',
    'components/navigation': 'Components — Navigation',
    'components/feedback': 'Components — Feedback',
    'components/shell': 'Components — Shell',
    'components/editor': 'Components — Editor',
    hooks: 'Hooks',
    showcase: 'Showcase',
    icons: 'Icons',
  };

  // 1. Per-page markdown files under public/llms/<slug>.md.
  for (const page of pages) {
    const target = join(publicLlmsDir, (page.slug || 'index') + '.md');
    await mkdir(dirname(target), { recursive: true });
    const header = [
      `# ${page.title}`,
      page.description ? `\n> ${page.description}\n` : '',
    ].join('');
    await writeFile(target, `${header}\n${page.markdown}`);
  }

  // 2. Short index llms.txt (llmstxt.org-style).
  const indexLines = [
    '# Entangle UI',
    '',
    '> React component library for professional editor interfaces — 3D tools, node editors, parameter systems.',
    '',
    'These plain-text resources are intended for LLM-assisted development. Each page mirrors the rendered docs but with JSX demos stripped so the content is fully consumable by language models.',
    '',
    `- [Full documentation (single file)](${SITE_BASE}/llms-full.txt)`,
    `- [Per-page documentation index](${SITE_BASE}/llms/)`,
    '',
  ];

  for (const groupKey of orderedGroupKeys) {
    const label = groupLabels[groupKey] ?? groupKey;
    indexLines.push(`## ${label}`);
    indexLines.push('');
    for (const page of groups
      .get(groupKey)
      .sort((a, b) => a.slug.localeCompare(b.slug))) {
      const url = `${SITE_BASE}/llms/${page.slug || 'index'}.md`;
      const desc = page.description ? `: ${page.description}` : '';
      indexLines.push(`- [${page.title}](${url})${desc}`);
    }
    indexLines.push('');
  }

  await writeFile(join(publicDir, 'llms.txt'), indexLines.join('\n'));

  // 3. llms-full.txt — every page concatenated with clear separators.
  const fullParts = [
    '# Entangle UI — Full LLM Documentation\n',
    '> Concatenated documentation for entangle-ui. Generated from the Astro docs source. Each section starts with `# <Title>` and is separated by `---`.\n',
  ];
  for (const groupKey of orderedGroupKeys) {
    const label = groupLabels[groupKey] ?? groupKey;
    fullParts.push(
      `\n\n=========================\n# ${label}\n=========================\n`
    );
    for (const page of groups
      .get(groupKey)
      .sort((a, b) => a.slug.localeCompare(b.slug))) {
      fullParts.push(`\n---\n\n# ${page.title}\n`);
      if (page.description) fullParts.push(`\n> ${page.description}\n`);
      fullParts.push(`\n_Source: /${page.slug || 'index'}_\n\n`);
      fullParts.push(page.markdown);
    }
  }
  await writeFile(join(publicDir, 'llms-full.txt'), fullParts.join(''));

  // 4. Claude Code skill structure.
  // Wipe the previously-generated subtrees so removed pages don't linger,
  // but keep the SKILL.md file so manual edits survive a re-run only when
  // the regenerated content matches.
  for (const sub of ['components', 'hooks', 'guides', 'reference']) {
    const dir = join(skillsDir, sub);
    if (existsSync(dir)) await rm(dir, { recursive: true });
  }

  const skillReferencePages = [];
  for (const page of pages) {
    const top = categoriseSlug(page.slug);
    let target;
    if (top === 'components' || top === 'hooks' || top === 'guides') {
      target = join(skillsDir, page.slug + '.md');
    } else {
      // Stash overview / getting-started / showcase / icons under reference/
      // so they're discoverable by name without polluting the skill root.
      const tail = page.slug || 'overview';
      target = join(skillsDir, 'reference', tail + '.md');
      skillReferencePages.push({
        ...page,
        refPath: 'reference/' + tail + '.md',
      });
    }
    await mkdir(dirname(target), { recursive: true });
    const body = [
      `# ${page.title}`,
      page.description ? `\n> ${page.description}\n` : '',
      page.markdown,
    ].join('\n');
    await writeFile(target, body);
  }

  // SKILL.md entrypoint.
  const skillLines = [
    '---',
    'name: entangle-ui',
    'description: Reference for the entangle-ui React component library (primitives, layout, controls, navigation, feedback, shell, editor components, hooks, theming). Use whenever the user is building UI with `entangle-ui`, importing from `entangle-ui`, or asking how an entangle-ui component or hook works. Each component has its own reference file in components/<category>/<name>.md — load the file matching the component(s) being used.',
    '---',
    '',
    '# entangle-ui',
    '',
    'Entangle UI is a React 19 component library for professional editor interfaces (3D tools, node editors, parameter systems). It is dark-first, zero-runtime CSS via Vanilla Extract, ESM-only, and built on top of `@base-ui/react`.',
    '',
    '## How to use this skill',
    '',
    '1. Identify which component(s), hook(s) or guide the user is working with.',
    '2. Read the matching reference file from this skill directory before generating code:',
    '   - `components/<category>/<name>.md` for components',
    '   - `hooks/<name>.md` for hooks',
    '   - `guides/<name>.md` for theming, styling, animations, accessibility',
    '3. Follow the project conventions in `CLAUDE.md` and `CONVENTIONS.md` (English-only text, `@/` path aliases, theme tokens via `vars.*`, no `any`).',
    '',
    '## Quick install',
    '',
    '```bash',
    'npm install entangle-ui @base-ui/react @floating-ui/react',
    '```',
    '',
    '```tsx',
    "import 'entangle-ui/styles.css';",
    "import { ThemeProvider, Button } from 'entangle-ui';",
    '',
    'export function App() {',
    '  return (',
    '    <ThemeProvider>',
    '      <Button variant="filled">Hello</Button>',
    '    </ThemeProvider>',
    '  );',
    '}',
    '```',
    '',
    '## Component index',
    '',
  ];

  const componentGroups = orderedGroupKeys.filter(g =>
    g.startsWith('components/')
  );
  for (const groupKey of componentGroups) {
    const label = groupLabels[groupKey] ?? groupKey;
    skillLines.push(`### ${label.replace('Components — ', '')}`);
    skillLines.push('');
    for (const page of groups
      .get(groupKey)
      .sort((a, b) => a.title.localeCompare(b.title))) {
      const rel = page.slug + '.md';
      const desc = page.description ? ` — ${page.description}` : '';
      skillLines.push(`- \`${page.title}\` → [${rel}](./${rel})${desc}`);
    }
    skillLines.push('');
  }

  if (groups.has('hooks')) {
    skillLines.push('### Hooks');
    skillLines.push('');
    for (const page of groups
      .get('hooks')
      .sort((a, b) => a.title.localeCompare(b.title))) {
      const rel = page.slug + '.md';
      const desc = page.description ? ` — ${page.description}` : '';
      skillLines.push(`- \`${page.title}\` → [${rel}](./${rel})${desc}`);
    }
    skillLines.push('');
  }

  if (groups.has('guides')) {
    skillLines.push('### Guides');
    skillLines.push('');
    for (const page of groups
      .get('guides')
      .sort((a, b) => a.title.localeCompare(b.title))) {
      const rel = page.slug + '.md';
      const desc = page.description ? ` — ${page.description}` : '';
      skillLines.push(`- \`${page.title}\` → [${rel}](./${rel})${desc}`);
    }
    skillLines.push('');
  }

  if (skillReferencePages.length) {
    skillLines.push('### Reference', '');
    for (const page of skillReferencePages.sort((a, b) =>
      a.title.localeCompare(b.title)
    )) {
      const desc = page.description ? ` — ${page.description}` : '';
      skillLines.push(
        `- \`${page.title}\` → [${page.refPath}](./${page.refPath})${desc}`
      );
    }
    skillLines.push('');
  }

  skillLines.push('## Authoring rules', '');
  skillLines.push(
    '- Always wrap the app once in `<ThemeProvider>` (defaults to dark theme).',
    "- Import the bundled stylesheet exactly once: `import 'entangle-ui/styles.css'`.",
    '- Prefer the typed component props documented per file. Do not invent props.',
    '- For custom styling, read `guides/styling.md` and `guides/theming.md` before adding new styles; theme tokens are exposed as `vars.*` from `@/theme/contract.css`.',
    '- Components are tree-shakeable; import directly from `entangle-ui`.',
    ''
  );

  await writeFile(join(skillsDir, 'SKILL.md'), skillLines.join('\n'));

  // Console summary.
  console.log(`generate-llms-txt: wrote ${pages.length} pages`);
  console.log(`  - ${relative(repoRoot, join(publicDir, 'llms.txt'))}`);
  console.log(`  - ${relative(repoRoot, join(publicDir, 'llms-full.txt'))}`);
  console.log(`  - ${relative(repoRoot, publicLlmsDir)}/`);
  console.log(`  - ${relative(repoRoot, skillsDir)}/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
