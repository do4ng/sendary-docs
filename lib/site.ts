import site from "@/site.config";

/**
 * Builds a browser title from the configured template.
 * `%s` in `site.title.template` is replaced with the page title.
 */
export function getPageTitle(title?: string): string {
  if (!title) return site.title.default;

  return site.title.template.includes("%s")
    ? site.title.template.replace(/%s/g, title)
    : `${title} - ${site.title.template}`;
}
