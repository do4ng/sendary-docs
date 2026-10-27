"use client";

import { Link } from "sendary/components";
import { useRef, useState, type ReactNode } from "react";

import { slugifyHeading } from "@/lib/format";

const languageIcons: Record<string, string> = {
  ts: "javascript-line",
  js: "javascript-line",
  tsx: "reactjs-line",
  jsx: "reactjs-line",
  html: "html5-line",
  css: "css3-fill",
  txt: "file-text-line",
  bash: "terminal-box-line",
  sh: "terminal-box-line",
  md: "markdown-line",
  json: "braces-line",
};

const languageNames: Record<string, string> = {
  ts: "Typescript",
  js: "Javascript",
  tsx: "React",
  jsx: "React",
  html: "HTML",
  css: "CSS",
  txt: "Plain",
  bash: "Terminal",
  sh: "Terminal",
  rs: "Rust",
  md: "Markdown",
  json: "JSON",
};

function extractText(children: unknown): string {
  if (typeof children === "string") return children;

  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }

  if (typeof children === "object" && children !== null) {
    const nested = (children as { props?: { children?: unknown } }).props
      ?.children;

    if (nested) return extractText(nested);
  }

  return "";
}

function AnchorHeading({
  level,
  children,
}: {
  level: 2 | 3;
  children: any;
}) {
  const id = slugifyHeading(extractText(children));
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <Tag id={id} {...children?.props}>
      <a href={`#${id}`}>#</a>
      {children}
    </Tag>
  );
}

function CodeTitle({
  lang,
  label,
  containerProps,
}: {
  lang?: string;
  label: ReactNode;
  containerProps?: Record<string, any>;
}) {
  const [copy, setCopy] = useState("copy");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const copyCode = () => {
    const container = buttonRef.current?.parentNode?.parentNode
      ?.parentNode as HTMLElement | null;
    const code = container?.querySelector("code")?.innerText ?? "";

    window.navigator.clipboard.writeText(code).then(() => {
      setCopy("copied!");

      setTimeout(() => {
        setCopy("copy");
      }, 2000);
    });
  };

  return (
    <div {...containerProps} data-rehype-pretty-code-title="">
      <div className="code-lang">
        <i className={`ri-${languageIcons[lang] || languageIcons.txt}`}></i>
        <span>{label}</span>
        <button ref={buttonRef} className="copy-code" onClick={copyCode}>
          {copy}
        </button>
      </div>
    </div>
  );
}

export const components = {
  h1: (props: any) => <h1 {...props}></h1>,
  a: (props: any) => {
    if (props.href.startsWith("http")) {
      return <Link {...props} target="_blank" passHref={true}></Link>;
    }

    return <Link {...props} prefetch={false}></Link>;
  },
  h2: (props: any) => (
    <AnchorHeading level={2}>{props.children}</AnchorHeading>
  ),
  h3: (props: any) => (
    <AnchorHeading level={3}>{props.children}</AnchorHeading>
  ),
  h4: (props: any) => <h4 {...props}></h4>,
  h5: (props: any) => <h5 {...props}></h5>,
  h6: (props: any) => <h6 {...props}></h6>,

  figure: (props: any) => {
    if (props["data-rehype-pretty-code-figure"] === "") {
      if (props.children[0]?.props["data-rehype-pretty-code-title"] !== "") {
        const lang = props.children.props["data-language"];

        return (
          <div data-rehype-pretty-code-fragment="">
            <CodeTitle
              lang={lang}
              label={languageNames[lang] || languageNames.txt}
              containerProps={{
                ...props.children.props,
                "data-rehype-pretty-code-title": "",
              }}
            />
            {props.children}
          </div>
        );
      }
    }

    return <div {...props}></div>;
  },

  figcaption: (props: any) => {
    if (props["data-rehype-pretty-code-title"] === "") {
      return (
        <CodeTitle
          lang={props["data-language"]}
          label={props.children}
          containerProps={props}
        />
      );
    }

    return <div {...props}></div>;
  },

  pre: (props: any) => (
    <div className="code-block" style={props.style}>
      <pre {...props}></pre>
    </div>
  ),

  // custom components

  Box: (props: any) => (
    <div className={`box box-${props.type || "info"}`}>
      <p className="box-title">
        {(props.title || props.type || "info").toUpperCase()}
      </p>

      {props.children}
    </div>
  ),

  Badge: (props: any) => (
    <span className={`badge box-${props.type || "info"}`}>
      {props.children}
    </span>
  ),

  Tabs: (props: any) => {
    const tabs = props.children?.map((child: any) => child?.props?.id) ?? [];
    const [active, setActive] = useState(tabs[0]);

    return (
      <div className="tabs">
        <div className="tab-id">
          {tabs.map((tab: string) => (
            <button
              key={tab}
              className={`tab-item text-inter ${
                active === tab ? "active" : ""
              }`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-contents">
          {props.children?.map((child: any) =>
            child?.props?.id === active ? child.props?.children : null,
          )}
        </div>
      </div>
    );
  },

  TabItem: (props: any) => <div className="tab-content" {...props}></div>,
};
