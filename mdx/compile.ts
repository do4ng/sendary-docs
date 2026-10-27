import { compile, type CompileOptions } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

export async function compileMdx(content: string): Promise<string> {
  if (typeof window !== "undefined") {
    throw new Error("compileMdx should run on server only");
  }

  const options: CompileOptions = {
    format: "mdx",
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm],
    development: false,
    rehypePlugins: [
      [
        // @ts-ignore
        rehypePrettyCode,
        {
          theme: {
            dark: "material-theme-palenight",
            light: "github-light",
          },
          keepBackground: false,
        } as import("rehype-pretty-code").Options,
      ],
    ],
  };

  const code = await compile(content, options);

  return String(code);
}
