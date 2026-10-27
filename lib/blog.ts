import blogPosts, { type BlogPost } from "@/blog.config";

export function findBlogPost(slug: string): {
  post: BlogPost | null;
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
  index: number;
} {
  const index = blogPosts.findIndex((post) => post.date === slug);

  return {
    post: index === -1 ? null : blogPosts[index],
    previousPost: index > 0 ? blogPosts[index - 1] : null,
    nextPost: index < blogPosts.length - 1 ? blogPosts[index + 1] : null,
    index,
  };
}
