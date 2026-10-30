export interface SiteAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  /** Brand name shown in the header and browser titles. */
  name: string;

  /** Small label displayed next to the brand name in the header. */
  badge?: string;

  /** Short description used by metadata generators such as llms.txt. */
  description: string;

  /** Canonical production URL, without a trailing slash. */
  url: string;

  /** Repository URL used by header links and documentation feedback links. */
  github?: string;

  /** Optional "What's new?" link shown in the header. */
  changelog?: {
    label: string;
    href: string;
  };

  /** Browser title configuration. */
  title: {
    /** Title used when a page does not provide its own title. */
    default: string;
    /** Template for page titles. `%s` is replaced with the page title. */
    template: string;
  };

  /** Home page hero copy and content source. */
  home: {
    /** Raw Markdown/MDX URL rendered below the hero. Omit to hide it. */
    readmeUrl?: string;
    badge?: string;
    /** Hero heading. HTML is allowed for highlighted words. */
    heading: string;
    description: string;
    actions: SiteLink[];
  };

  /** Copy used by the blog index. */
  blog: {
    title: string;
    badge: string;
    description: string;
    searchPlaceholder: string;
    /** Author used when a blog post does not define one. */
    defaultAuthor?: SiteAuthor;
  };

  /** Extra entries appended to the generated llms.txt "examples" section. */
  examples?: string[];
}

const site: SiteConfig = {
  name: "Sendary",
  badge: "docs",
  description:
    "Sendary is a React-based framework for building modern web applications with Vite, supporting features such as file-based routing, SSG, and static generation.",
  url: "https://sendary.vercel.app",
  github: "https://github.com/zely-js/sendary",
  changelog: {
    label: "What's new?",
    href: "/changelog/changelog",
  },
  title: {
    default: "Sendary",
    template: "%s - Sendary",
  },
  home: {
    readmeUrl:
      "https://raw.githubusercontent.com/zely-js/sendary/refs/heads/main/README.md",
    badge: "Next-Gen React SSG",
    heading: 'The React <br/><span class="gra ">SSG Framework</span> <br/>',
    description:
      "Build blazingly fast, modern documentation and content sites with React, Vite, and Island Architecture.",
    actions: [
      { label: "Getting Started", href: "/docs/installation" },
      { label: "Why Sendary", href: "/docs/why-sendary" },
    ],
  },
  blog: {
    title: "Blog",
    badge: "Developer Blog",
    description: "Updates, engineering insights, and release announcements.",
    searchPlaceholder: "Search articles...",
    defaultAuthor: { name: "do4ng", role: "Maintainer" },
  },
  examples: [
    "- [basic template example](https://github.com/zely-js/sendary/tree/main/packages/create-sendary/template): A Sendary template demonstrating the most basic routing setup.",
    "- [dev docs example](https://github.com/do4ng/website): A developer documentation example built with Sendary.",
    "- [blog example](https://github.com/do4ng/do4ng.github.io): A blog example built with Sendary.",
  ],
};

export default site;
