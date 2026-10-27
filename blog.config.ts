export type BlogCategory =
  | "Architecture"
  | "Release"
  | "Engineering"
  | "Tutorial";

export interface BlogAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface BlogPost {
  title: string;
  description: string;
  category: BlogCategory;
  date: string;

  /** Optional explicit slug. Blog pages currently use `date` as the slug. */
  slug?: string;
  tags?: string[];
  author?: BlogAuthor;
  readTime?: string;
  pinned?: boolean;
  featured?: boolean;
}

export type Post = BlogPost;

const blogPosts: BlogPost[] = [
  {
    title: "Sendary 1.0 is Here!",
    date: "26-10-26",
    description: "sendary@1.0 release note",
    category: "Release",
    pinned: true,
  },
];

export default blogPosts;
