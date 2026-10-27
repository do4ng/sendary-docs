export type Post = Record<string, string>;

export interface Category {
  name: string;
  posts: Post[];
  hidden?: boolean;
}

export interface Config {
  title: string;
  icon?: string;
  category: Category[];
  directory?: string;
  target: string;
}

const config: Config[] = [
  {
    title: "docs",
    icon: "book-open-line",
    target: "why-sendary",
    category: [
      {
        name: "Overview",
        posts: [{ "why-sendary": "Why Sendary" }],
      },
      {
        name: "Getting Started",
        posts: [
          { installation: "Installation" },
          { routing: "Routing" },
          { "layout-404": "Layout and Error" },
          { "static-props": "Static Props" },
          { navigating: "Navigating" },
          { styling: "Styling" },
          { "build-app": "Build" },
          { deploy: "Deploy" },
          { sitemap: "Sitemap" },
        ],
      },
      {
        name: "APIs",
        posts: [{ "sendary-router": "Router" }],
      },
      {
        name: "Components",
        posts: [
          { image: "<Image />" },
          { link: "<Link />" },
          { head: "<Head />" },
        ],
      },
      {
        name: "Islands",
        posts: [
          { island: "<Island />" },
          { "islands-architecture": "Architecture and Limitations" },
        ],
      },
      {
        name: "Community",
        hidden: true,
        posts: [{ community: "Community" }, { contributing: "Contributing" }],
      },
    ],
  },
  {
    title: "changelog",
    target: "changelog",

    category: [
      {
        name: "Overview",
        posts: [{ changelog: "Changelog" }],
      },
      {
        name: "Changelogs",
        posts: [{ "1-0-0": "v1.0.0" }],
      },
      {
        name: "Changelogs (v0)",
        hidden: true,
        posts: [
          { "0-0-1-beta-25": "v0.0.1-beta.25" },
          { "0-0-1-beta-22": "v0.0.1-beta.22" },
          { "0-0-1-beta-20": "v0.0.1-beta.20" },
        ],
      },
    ],
  },
];

export default config;
