import { writeFileSync } from "fs";
import path from "path";
import type { Plugin } from "vite";

import blogPosts from "../blog.config";
import config from "../config";

const BASE_URL = "https://sendary.vercel.app";

const EXAMPLE_ENTRIES = [
  "- [basic template example](https://github.com/zely-js/sendary/tree/main/packages/create-sendary/template): A Sendary template demonstrating the most basic routing setup. \n",
  "- [dev docs example](https://github.com/do4ng/website): A developer documentation example built with Sendary. \n",
  "- [blog example](https://github.com/do4ng/do4ng.github.io): A blog example built with Sendary. \n",
];

function addUrl(lines: string[], url: string): void {
  lines.push("  <url>");
  lines.push(`    <loc>${url}</loc>`);
  lines.push("  </url>");
}

function buildSitemapAndLlms(): { sitemap: string; llms: string } {
  const sitemap: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  const llms: string[] = [
    "# Sendary",
    "",
    "> Sendary is a React-based framework for building modern web applications with Vite, supporting features such as file-based routing, SSG, and static generation.",
    "",
    "The following documents provide detailed information about Sendary and its APIs.",
    "",
  ];

  for (const section of config) {
    const { title, category } = section;

    llms.push(`## ${title}`);
    llms.push("");

    for (const cat of category) {
      for (const post of cat.posts) {
        const [slug] = Object.keys(post);
        const url = `${BASE_URL}/${title}/${slug}`;

        addUrl(sitemap, url);

        const postTitle =
          typeof post[slug] === "string" ? post[slug] : slug;

        llms.push(
          `- [${postTitle}](${url}): ${cat.name} documentation for ${postTitle}.`,
        );
      }
    }

    llms.push("");
  }

  llms.push("## blog");
  llms.push("");

  addUrl(sitemap, `${BASE_URL}/blog`);
  llms.push(
    `- [Developer Blog](${BASE_URL}/blog): Sendary developer and engineering blog articles.`,
  );

  for (const post of blogPosts) {
    const blogUrl = `${BASE_URL}/blog/${post.slug}`;

    addUrl(sitemap, blogUrl);
    llms.push(`- [${post.title}](${blogUrl}): ${post.description}`);
  }

  llms.push("");
  llms.push("## examples\n");
  llms.push(...EXAMPLE_ENTRIES);

  sitemap.push("</urlset>");

  return {
    sitemap: sitemap.join("\n"),
    llms: llms.join("\n").trim() + "\n",
  };
}

export function sitemapAndLlms(): Plugin {
  return {
    name: "sitemap-and-llms",
    apply: "build",

    closeBundle() {
      const { sitemap, llms } = buildSitemapAndLlms();

      writeFileSync(
        path.resolve("./dist/sitemap.xml"),
        sitemap,
        "utf-8",
      );
      writeFileSync(path.resolve("./dist/llms.txt"), llms, "utf-8");
    },
  };
}
