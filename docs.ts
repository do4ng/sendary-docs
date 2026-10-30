export interface DocsMenuItem {
  title: string;
  href: string;
  icon: string;
  description?: string;
}

export interface DocsPopover {
  type: "popover";
  title: string;
  children: DocsMenuItem[];
}

export interface DocsLink {
  type: "link";
  title: string;
  href: string;
}

export type DocsHeaderItem = DocsPopover | DocsLink;

export interface Docs {
  index: {
    content: string;
    href: string;
  }[];

  header: DocsHeaderItem[];
}

const docs: Docs = {
  index: [
    {
      content: "Getting Started",
      href: "/docs/installation",
    },
    {
      content: "Why Sendary?",
      href: "/docs/why-sendary",
    },
  ],
  header: [
    {
      title: "Docs",
      type: "link",
      href: "/docs/why-sendary",
    },
    {
      title: "Blog",
      type: "link",
      href: "/blog",
    },
    {
      title: "Changelog",
      type: "link",
      href: "/changelog/changelog",
    },
    {
      title: "llms.txt",
      type: "link",
      href: "/llms.txt",
    },
  ],
};

export default docs;
