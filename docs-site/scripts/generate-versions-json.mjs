#!/usr/bin/env node
/**
 * Generates the `/versions.json` manifest consumed by the VersionSwitcher.
 *
 * Scans the version-archive directory for `vMAJOR.MINOR` snapshot folders and
 * emits a manifest where the newest release (the `latest` slug) is served from
 * the site root (`/`) and every older snapshot from its own `/vX.Y/` sub-path.
 *
 * Usage:
 *   node generate-versions-json.mjs <versionsDir> <outFile> <latestSlug>
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs';

const [, , versionsDir, outFile, latestSlug] = process.argv;

if (!versionsDir || !outFile || !latestSlug) {
  console.error(
    'Usage: generate-versions-json.mjs <versionsDir> <outFile> <latestSlug>'
  );
  process.exit(1);
}

const slugPattern = /^v(\d+)\.(\d+)(?:\.(\d+))?$/;

const slugs = existsSync(versionsDir)
  ? readdirSync(versionsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && slugPattern.test(entry.name))
      .map(entry => entry.name)
  : [];

// The latest release should always appear, even before its snapshot lands.
if (!slugs.includes(latestSlug)) slugs.push(latestSlug);

const toTuple = slug => {
  const match = slugPattern.exec(slug);
  return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
};

slugs.sort((a, b) => {
  const [aMajor, aMinor, aPatch] = toTuple(a);
  const [bMajor, bMinor, bPatch] = toTuple(b);
  return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
});

const versions = slugs.map(slug => {
  const isLatest = slug === latestSlug;
  return { label: slug, base: isLatest ? '/' : `/${slug}/`, latest: isLatest };
});

writeFileSync(
  outFile,
  `${JSON.stringify({ latest: latestSlug, versions }, null, 2)}\n`
);

console.log(
  `Wrote ${outFile} with ${versions.length} version(s): ${versions
    .map(v => v.label)
    .join(', ')}`
);
