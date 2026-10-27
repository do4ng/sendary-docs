import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Fragment } from "react";

import { Link } from "sendary/components";

import parents from "@/config";
import type { Post } from "@/config";
import { capitalizeFirstLetter } from "@/lib/up";
import {
  findPostInSection,
  findSectionByTitle,
  getPostSlug,
  getPostTitle,
  getPostsInSection,
  getSectionDirectory,
} from "@/lib/docs";
import ScrollTop from "@/lib/scrolltotop";
import { compileMdx } from "@/mdx/compile";
import { Content } from "@/mdx/content";
import { TableOfContents } from "@/components/tableofcontents";

interface DocPageParams {
  slug: string;
  category: string;
}

interface DocPageProps {
  params: DocPageParams;
  props: {
    compiled: string;
    posts: Post[];
    target: Post;
    targetcategory: string | null;
    directory: string;
  };
}

interface AdjacentPage {
  url: string;
  title: string;
}

export async function getStaticParams() {
  return parents.flatMap((parent) =>
    parent.category.flatMap((category) =>
      category.posts.map((post) => ({
        slug: getPostSlug(post),
        category: parent.title,
      })),
    ),
  );
}

export async function getStaticProps({
  params,
}: {
  params: DocPageParams;
}) {
  const section = findSectionByTitle(params.category);

  if (!section) {
    return <>Page not found</>;
  }

  const posts = getPostsInSection(section);
  const { post: target, category: targetCategory } = findPostInSection(
    section,
    params.slug,
  );

  if (!target) {
    return <>Page not found</>;
  }

  const directory = getSectionDirectory(section);
  const slugKey = getPostSlug(target);
  const basePath = join(
    process.cwd(),
    directory,
    (targetCategory?.name || "").toLowerCase(),
    slugKey,
  );

  const mdxPath = `${basePath}.mdx`;
  const mdPath = `${basePath}.md`;

  let raw: string;

  if (existsSync(mdxPath)) {
    raw = readFileSync(mdxPath, "utf-8");
  } else if (existsSync(mdPath)) {
    raw = readFileSync(mdPath, "utf-8");
  } else {
    raw = `# ${getPostTitle(target) || slugKey}\n\nDocument content not found.`;
  }

  const compiled = await compileMdx(raw);

  return {
    compiled,
    posts,
    target,
    targetcategory: targetCategory?.name ?? null,
    directory,
  };
}

function DocBreadcrumbs({ path }: { path: string[] }) {
  return (
    <div className="directory">
      {path.map((segment, index) => (
        <Fragment key={`${segment}-${index}`}>
          {index > 0 && <i className="ri-arrow-right-s-line"></i>}
          <div className="directory-path">
            {capitalizeFirstLetter(segment)}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function AdjacentPageLink({
  page,
  href,
  direction,
}: {
  page: AdjacentPage;
  href: string;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";

  return (
    <Link
      className={`no-a prenext-card ${
        isPrevious ? "prenext-prev" : "prenext-next"
      }`}
      href={href}
    >
      <h4>
        {isPrevious ? (
          <>
            <i className="ri-arrow-left-line"></i> Previous
          </>
        ) : (
          <>
            Next <i className="ri-arrow-right-line"></i>
          </>
        )}
      </h4>
      <p>{page.title}</p>
    </Link>
  );
}

function PostNavigation({
  previousPage,
  nextPage,
  directory,
}: {
  previousPage: AdjacentPage;
  nextPage: AdjacentPage;
  directory: string;
}) {
  return (
    <div className="prenext">
      {previousPage.title ? (
        <AdjacentPageLink
          page={previousPage}
          href={`/${directory}/${previousPage.url}`}
          direction="previous"
        />
      ) : (
        <div></div>
      )}

      {nextPage.title ? (
        <AdjacentPageLink
          page={nextPage}
          href={`/${directory}/${nextPage.url}`}
          direction="next"
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default function DocPage({
  params,
  props: { compiled, posts, target, targetcategory, directory },
}: DocPageProps) {
  const postIndex = posts.findIndex(
    (post) => getPostSlug(post) === params.slug,
  );

  const previousPage: AdjacentPage = {
    url: getPostSlug(posts[postIndex - 1] || {}),
    title: getPostTitle(posts[postIndex - 1] || {}),
  };

  const nextPage: AdjacentPage = {
    url: getPostSlug(posts[postIndex + 1] || {}),
    title: getPostTitle(posts[postIndex + 1] || {}),
  };

  const postName = getPostTitle(target);
  const breadcrumbPath = [params.category, (targetcategory || "").toLowerCase()];

  if (breadcrumbPath[1] !== postName.toLowerCase()) {
    breadcrumbPath.push(postName);
  }

  return (
    <>
      <ScrollTop />
      <title>{`${postName} - sendary`}</title>
      <div className="content-flex">
        <div className="post">
          <DocBreadcrumbs path={breadcrumbPath} />

          <div className="intro">
            <h1>{postName}</h1>
          </div>

          <div className="content-container">
            <main>
              <Content content={compiled}></Content>
            </main>
          </div>

          <PostNavigation
            previousPage={previousPage}
            nextPage={nextPage}
            directory={directory}
          />
        </div>

        <TableOfContents></TableOfContents>
      </div>
    </>
  );
}
