import { writeFileSync } from "fs";
import path from "path";
import type { Plugin } from "vite";

import blogPosts from "../blog.config";
import config from "../config";
import site from "../site.config";

const BASE_URL = site.url.replace(/\/$/, "");

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
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `The following documents provide detailed information about ${site.name} and its APIs.`,
    "",
  ];

  for (const section of config) {
    const { title, category } = section;
    const directory = section.directory || title.toLowerCase();

    llms.push(`## ${title}`);
    llms.push("");

    for (const cat of category) {
      for (const post of cat.posts) {
        const [slug] = Object.keys(post);
        const url = `${BASE_URL}/${directory}/${slug}`;

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
    `- [${site.blog.title}](${BASE_URL}/blog): ${site.blog.description}`,
  );

  for (const post of blogPosts) {
    const blogUrl = `${BASE_URL}/blog/${post.slug ?? post.date}`;

    addUrl(sitemap, blogUrl);
    llms.push(`- [${post.title}](${blogUrl}): ${post.description}`);
  }

  if (site.examples && site.examples.length > 0) {
    llms.push("");
    llms.push("## examples\n");
    llms.push(...site.examples);
  }

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
