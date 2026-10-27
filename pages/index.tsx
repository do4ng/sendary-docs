import { Link } from "sendary/components";

import docs from "@/docs";
import { compileMdx } from "@/mdx/compile";
import { Content } from "@/mdx/content";

const README_URL =
  "https://raw.githubusercontent.com/zely-js/sendary/refs/heads/main/README.md";

export async function getStaticProps() {
  const response = await fetch(README_URL);
  const raw = await response.text();
  const compiled = await compileMdx(raw);

  return { compiled };
}

export default function HomePage({
  props: { compiled },
}: {
  props: {
    compiled: string;
  };
}) {
  return (
    <>
      <div className="product-container">
        <div className="title">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Next-Gen React SSG</span>
          </div>

          <h1 dangerouslySetInnerHTML={{ __html: docs.description }}></h1>

          <p className="hero-subtext">
            Build blazingly fast, modern documentation and content sites with
            React, Vite, and Island Architecture.
          </p>

          <div className="actions">
            <Link href="/docs/installation">
              <button className="btn text">Getting Started</button>
            </Link>
            <Link href="/docs/why-sendary">
              <button className="btn text">Why Sendary</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="info-v3">
        <div className="info-v3-content">
          <div className="content-container post">
            <Content content={compiled}></Content>
          </div>
        </div>
      </div>
    </>
  );
}
