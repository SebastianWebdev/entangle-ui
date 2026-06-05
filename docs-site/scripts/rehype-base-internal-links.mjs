/**
 * Rehype plugin that prefixes root-absolute internal links (`/foo`) with the
 * configured Astro `base` (e.g. `/v0.9`).
 *
 * Astro base-prefixes assets and Starlight's own navigation, but it does NOT
 * rewrite root-absolute links written inside Markdown/MDX content (including
 * the thousands of links in the generated TypeDoc API reference). Without this,
 * an archived version snapshot served from `/v0.9/` would link back out to the
 * site root (the "latest" docs), breaking the "stay inside this version" UX.
 *
 * Only active when `base` is set (i.e. for versioned snapshot builds); the
 * "latest" root build leaves links untouched.
 *
 * Skips: external/protocol-relative URLs, `mailto:`/`tel:`/etc., in-page
 * fragments, and links already prefixed with the base.
 *
 * @param {{ base?: string }} options
 */
export default function rehypeBaseInternalLinks(options = {}) {
  const base = (options.base || '').replace(/\/$/, '');

  return tree => {
    if (!base) return;

    const prefix = href => {
      if (typeof href !== 'string' || href.length === 0) return href;
      // Skip protocol/protocol-relative/special and non-root-absolute links.
      if (!href.startsWith('/') || href.startsWith('//')) return href;
      // Skip links already living under the base (e.g. `/v0.9` or `/v0.9/x`).
      if (href === base || href.startsWith(`${base}/`)) return href;
      return base + href;
    };

    const walk = node => {
      if (node.type === 'element' && node.properties) {
        if (node.tagName === 'a' && node.properties.href != null) {
          node.properties.href = prefix(node.properties.href);
        }
        // Cover source-set style attributes too, in case content embeds them.
        if (node.tagName === 'area' && node.properties.href != null) {
          node.properties.href = prefix(node.properties.href);
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    };

    walk(tree);
  };
}
