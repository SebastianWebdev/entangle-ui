import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';

/**
 * A single entry in the published `/versions.json` manifest. `base` is the
 * site sub-path the version is served from (`/` for the latest, `/v0.9/` for
 * an archived snapshot).
 */
interface VersionEntry {
  label: string;
  base: string;
  latest?: boolean;
}

const RELEASES_URL = 'https://github.com/SebastianWebdev/entangle-ui/releases';

/** Normalize a base path to always have a single leading and trailing slash. */
const withSlashes = (base: string): string => {
  let normalized = base;
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!normalized.endsWith('/')) normalized = `${normalized}/`;
  return normalized;
};

export interface VersionSwitcherProps {
  /** Version label of the build currently being viewed, e.g. `v0.9.0`. */
  currentLabel: string;
}

/**
 * Documentation version selector shown in the site header.
 *
 * The list of versions is fetched at runtime from the root `/versions.json`
 * manifest (written by the deploy workflow), so every archived snapshot —
 * even ones built before newer versions existed — surfaces the full, current
 * list. Until at least two versions are published it falls back to a static
 * badge that still advertises the version this build was made from.
 */
export default function VersionSwitcher({
  currentLabel,
}: VersionSwitcherProps): ReactElement | null {
  const [versions, setVersions] = useState<VersionEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/versions.json')
      .then(res => (res.ok ? res.json() : null))
      .then((data: { versions?: VersionEntry[] } | null) => {
        if (active && data?.versions?.length) setVersions(data.versions);
      })
      .catch(() => {
        /* No manifest (e.g. local preview) — keep the static badge. */
      });
    return () => {
      active = false;
    };
  }, []);

  // Before a second version exists, a dropdown is pointless — show a badge.
  if (!versions || versions.length < 2) {
    return (
      <a
        className="version-badge"
        href={RELEASES_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={`Entangle UI ${currentLabel} — view releases on GitHub`}
      >
        {currentLabel}
      </a>
    );
  }

  const currentBase = withSlashes(import.meta.env.BASE_URL);
  const selectedBase =
    versions.find(v => withSlashes(v.base) === currentBase)?.base ??
    versions.find(v => v.latest)?.base ??
    versions[0].base;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const targetBase = withSlashes(event.target.value);
    // Preserve the current page within the target version when possible.
    const path = window.location.pathname;
    const subpath = path.startsWith(currentBase)
      ? path.slice(currentBase.length)
      : '';
    window.location.href = targetBase + subpath;
  };

  return (
    <select
      className="version-switcher"
      value={selectedBase}
      onChange={handleChange}
      aria-label="Documentation version"
    >
      {versions.map(version => (
        <option key={version.base} value={version.base}>
          {version.label}
          {version.latest ? ' (latest)' : ''}
        </option>
      ))}
    </select>
  );
}
