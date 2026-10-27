import { runSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXContent } from "mdx/types";

export function runMdx(code: string): MDXContent {
  const { default: Content } = runSync(code, runtime as any);

  return Content;
}
