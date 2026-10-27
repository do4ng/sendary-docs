import config from "@/config";
import { getPostSlug, getPostTitle, getSectionDirectory } from "@/lib/docs";
import { capitalizeFirstLetter } from "@/lib/up";

export interface DocsSearchEntry {
  title: string;
  href: string;
  section: string;
  sectionLabel: string;
  category: string;
  content: string;
  contentLower: string;
  titleLower: string;
  metaLower: string;
  order: number;
}

export interface DocsSearchResult {
  entry: DocsSearchEntry;
  score: number;
  snippet: string;
}

const docsSources = import.meta.glob("/docs/**/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const changelogSources = import.meta.glob("/changelog/**/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const sources: Record<string, string> = {
  ...docsSources,
  ...changelogSources,
};

/** Removes MDX syntax so the search index and snippets contain readable text. */
function toPlainText(source: string): string {
  return source
    .replace(/^---[\s\S]*?---\s*/m, " ")
    .replace(/^(import|export)\s+.*$/gm, " ")
    .replace(/```[^\n]*\n?([\s\S]*?)```/g, " $1 ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]*[-*+][ \t]+/gm, "")
    .replace(/[*_~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchIndex(): DocsSearchEntry[] {
  let order = 0;

  return config.flatMap((section) => {
    const directory = getSectionDirectory(section);
    const sectionLabel = capitalizeFirstLetter(section.title);

    return section.category.flatMap((category) =>
      category.posts.map((post) => {
        const slug = getPostSlug(post);
        const title = getPostTitle(post);
        const categoryDirectory = category.name.toLowerCase();
        const basePath = `/${directory}/${categoryDirectory}/${slug}`;
        const source =
          sources[`${basePath}.mdx`] ?? sources[`${basePath}.md`] ?? "";
        const content = toPlainText(source);

        return {
          title,
          href: `/${directory}/${slug}`,
          section: section.title,
          sectionLabel,
          category: category.name,
          content,
          contentLower: content.toLowerCase(),
          titleLower: title.toLowerCase(),
          metaLower: `${sectionLabel} ${category.name}`.toLowerCase(),
          order: order++,
        };
      }),
    );
  });
}

const searchIndex = buildSearchIndex();

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getSearchTerms(query: string): string[] {
  const normalized = normalize(query);
  return normalized ? Array.from(new Set(normalized.split(" "))) : [];
}

function createSnippet(entry: DocsSearchEntry, terms: string[]): string {
  if (!entry.content) return "";

  let matchIndex = -1;

  for (const term of terms) {
    const index = entry.contentLower.indexOf(term);

    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
    }
  }

  if (matchIndex === -1) matchIndex = 0;

  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(entry.content.length, start + 170);
  const snippet = entry.content.slice(start, end).trim();

  return `${start > 0 ? "…" : ""}${snippet}${end < entry.content.length ? "…" : ""}`;
}

export function searchDocs(query: string, limit = 8): DocsSearchResult[] {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery
    ? Array.from(new Set(normalizedQuery.split(" ")))
    : [];
  const results: DocsSearchResult[] = [];

  for (const entry of searchIndex) {
    if (terms.length === 0) {
      results.push({
        entry,
        score: 0,
        snippet: createSnippet(entry, terms),
      });
      continue;
    }

    let score = 0;
    let matchesAllTerms = true;

    for (const term of terms) {
      const titleIndex = entry.titleLower.indexOf(term);
      const metaIndex = entry.metaLower.indexOf(term);
      const contentIndex = entry.contentLower.indexOf(term);

      if (titleIndex === -1 && metaIndex === -1 && contentIndex === -1) {
        matchesAllTerms = false;
        break;
      }

      if (titleIndex !== -1) score += 30;
      if (metaIndex !== -1) score += 8;
      if (contentIndex !== -1) score += 3;
    }

    if (!matchesAllTerms) continue;

    if (entry.titleLower === normalizedQuery) score += 100;
    else if (entry.titleLower.startsWith(normalizedQuery)) score += 50;
    else if (entry.titleLower.includes(normalizedQuery)) score += 25;

    results.push({
      entry,
      score,
      snippet: createSnippet(entry, terms),
    });
  }

  if (terms.length === 0) return results.slice(0, limit);

  return results
    .sort((a, b) => b.score - a.score || a.entry.order - b.entry.order)
    .slice(0, limit);
}
