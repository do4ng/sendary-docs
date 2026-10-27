import config, { type Category, type Config, type Post } from "@/config";

export function findSectionByPath(path: string): Config | undefined {
  return config.find(
    ({ title }) => title.toLowerCase() === path.toLowerCase(),
  );
}

export function findSectionByTitle(title: string): Config | undefined {
  return config.find((section) => section.title === title);
}

export function getSectionDirectory(section: Config): string {
  return section.directory || section.title.toLowerCase();
}

export function getPostsInSection(section: Config): Post[] {
  return section.category.flatMap((category) => category.posts);
}

export function getPostSlug(post: Post): string {
  return Object.keys(post)[0];
}

export function getPostTitle(post: Post): string {
  return Object.values(post)[0];
}

export function normalizeCategoryName(name: string): string {
  return name.toLowerCase().replace(/ /g, "-");
}

/**
 * Finds the last post matching `slug` and the category that contains it.
 * The last match wins, matching the original traversal order.
 */
export function findPostInSection(
  section: Config,
  slug: string,
): { post?: Post; category?: Category } {
  let post: Post | undefined;
  let category: Category | undefined;

  for (const currentCategory of section.category) {
    for (const currentPost of currentCategory.posts) {
      if (getPostSlug(currentPost) === slug) {
        post = currentPost;
        category = currentCategory;
      }
    }
  }

  return { post, category };
}
