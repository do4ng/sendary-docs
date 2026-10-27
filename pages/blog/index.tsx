import blog from "@/blog.config";
import { BlogList } from "@/components/blog-list";
import ScrollTop from "@/lib/scrolltotop";

export default function Blog() {
  return (
    <>
      <ScrollTop />
      <title>Developer Blog - sendary</title>
      <BlogList posts={blog} />
    </>
  );
}
