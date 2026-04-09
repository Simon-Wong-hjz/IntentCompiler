import yaml from 'js-yaml';
import { marked } from 'marked';

export interface Announcement {
  version: string;
  date: string;
  title: { zh: string; en: string };
  content: { zh: string; en: string };
}

interface Frontmatter {
  version: string;
  date: string;
  title: string;
  title_en: string;
}

/**
 * Parse a single announcement .md file (frontmatter + bilingual body).
 * Exported for testing; consumers should use `announcements` instead.
 */
export function parseAnnouncementFile(raw: string): Announcement {
  const normalized = raw.replace(/\r\n/g, '\n');

  // Extract frontmatter between --- markers
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error('Invalid announcement file: missing frontmatter');
  }

  const fm = yaml.load(fmMatch[1]) as Partial<Frontmatter>;
  if (!fm.version || !fm.date || !fm.title || !fm.title_en) {
    throw new Error('Announcement frontmatter missing required fields');
  }
  const body = fmMatch[2].trim();

  // Split body by <!-- en --> marker
  const enMarker = '<!-- en -->';
  const markerIndex = body.indexOf(enMarker);

  let zhBody: string;
  let enBody: string;

  if (markerIndex >= 0) {
    zhBody = body.slice(0, markerIndex).trim();
    enBody = body.slice(markerIndex + enMarker.length).trim();
  } else {
    zhBody = body;
    enBody = body; // fallback: same content for both
  }

  return {
    version: fm.version,
    date: fm.date,
    title: { zh: fm.title, en: fm.title_en },
    content: {
      zh: marked.parse(zhBody, { async: false }),
      en: marked.parse(enBody, { async: false }),
    },
  };
}

// Glob-load all .md files at build time
const mdModules = import.meta.glob('./*.md', { query: '?raw', eager: true });

/** All announcements, sorted by date descending (newest first). */
export const announcements: Announcement[] = Object.values(mdModules)
  .map((mod) => parseAnnouncementFile((mod as { default: string }).default))
  .sort((a, b) => b.date.localeCompare(a.date));

/** The latest announcement version string, or empty if none. */
export const latestVersion = announcements.length > 0 ? announcements[0].version : '';
