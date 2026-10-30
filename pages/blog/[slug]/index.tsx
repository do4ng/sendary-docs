import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { Link } from "sendary/components";

import blogPosts, { type BlogPost } from "@/blog.config";
import site from "@/site.config";
import { findBlogPost, getBlogSlug } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { getPageTitle } from "@/lib/site";
import ScrollTop from "@/lib/scrolltotop";
import { compileMdx } from "@/mdx/compile";
import { Content } from "@/mdx/content";

export async function getStaticParams() {
  return blogPosts.map((post) => ({ slug: getBlogSlug(post) }));
}

function readPostSource(slug: string, title: string): string {
  const mdxPath = join(process.cwd(), "posts", `${slug}.mdx`);

  if (existsSync(mdxPath)) {
    return readFileSync(mdxPath, "utf-8");
  }

  return `# ${title}\n\nContent not found.`;
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const { post, previousPost, nextPost } = findBlogPost(params.slug);
  const raw = readPostSource(params.slug, post?.title || params.slug);
  const compiled = await compileMdx(raw);

  return { raw, target: post, compiled, previousPost, nextPost };
}

interface BlogPostPageProps {
  params: { slug: string };
  props: {
    raw: string;
    compiled: string;
    target: BlogPost | null;
    previousPost: BlogPost | null;
    nextPost: BlogPost | null;
  };
}

export default function BlogPostPage({
  props: { compiled, target, previousPost, nextPost },
}: BlogPostPageProps) {
  if (!target) return <></>;

  const author = target.author ?? site.blog.defaultAuthor;

  return (
    <>
      <ScrollTop />
      <title>{getPageTitle(target.title)}</title>

      <div className="blog-article-container">
        <Link href="/blog" className="article-back-link">
          <i className="ri-arrow-left-line"></i> Back to All Articles
        </Link>

        <header className="article-header">
          <div className="article-meta-row">
            <span className="article-category">{target.category}</span>
            <span className="article-date">{formatDate(target.date)}</span>
          </div>

          <h1>{target.title}</h1>
          {author?.name && (
            <div className="article-author-row">
              <div className="article-author-info">
                <span className="name">{author.name}</span>
                {author.role && <span className="role">{author.role}</span>}
              </div>
            </div>
          )}
        </header>

        <main className="content-container post">
          <Content content={compiled}></Content>
        </main>

        <div className="article-footer-nav">
          {previousPost ? (
            <Link
              href={`/blog/${getBlogSlug(previousPost)}`}
              className="nav-card prev"
            >
              <span className="nav-label">
                <i className="ri-arrow-left-line"></i> Previous Article
              </span>
              <span className="nav-title">{previousPost.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link
              href={`/blog/${getBlogSlug(nextPost)}`}
              className="nav-card next"
            >
              <span className="nav-label">
                Next Article <i className="ri-arrow-right-line"></i>
              </span>
              <span className="nav-title">{nextPost.title}</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </>
  );
}
