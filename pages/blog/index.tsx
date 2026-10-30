import blog from "@/blog.config";
import { BlogList } from "@/components/blog-list";
import site from "@/site.config";
import { getPageTitle } from "@/lib/site";
import ScrollTop from "@/lib/scrolltotop";

export default function Blog() {
  return (
    <>
      <ScrollTop />
      <title>{getPageTitle(site.blog.title)}</title>
      <BlogList posts={blog} />
    </>
  );
}
