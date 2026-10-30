import { Link } from "sendary/components";

import site from "@/site.config";
import { getPageTitle } from "@/lib/site";
import { compileMdx } from "@/mdx/compile";
import { Content } from "@/mdx/content";

export async function getStaticProps() {
  if (!site.home.readmeUrl) {
    return { compiled: "" };
  }

  try {
    const response = await fetch(site.home.readmeUrl);

    if (!response.ok) {
      throw new Error(`Failed to load README: ${response.status}`);
    }

    const raw = await response.text();
    const compiled = await compileMdx(raw);

    return { compiled };
  } catch (error) {
    console.warn(`[site] ${(error as Error).message}`);
    return { compiled: "" };
  }
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
      <title>{getPageTitle()}</title>

      <div className="product-container">
        <div className="title">
          {site.home.badge && (
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              <span>{site.home.badge}</span>
            </div>
          )}

          <h1 dangerouslySetInnerHTML={{ __html: site.home.heading }}></h1>

          <p className="hero-subtext">{site.home.description}</p>

          {site.home.actions.length > 0 && (
            <div className="actions">
              {site.home.actions.map((action) => (
                <Link href={action.href} key={action.href}>
                  <button className="btn text">{action.label}</button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {compiled && (
        <div className="info-v3">
          <div className="info-v3-content">
            <div className="content-container post">
              <Content content={compiled}></Content>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
