"use client";

import type { ReactElement } from "react";

import { components } from "./components";
import { runMdx } from "./run";

interface ContentProps {
  content: string;
}

export function Content({ content }: ContentProps): ReactElement {
  const MDX = runMdx(content);

  return <MDX components={components} />;
}
