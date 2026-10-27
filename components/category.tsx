import { router as ModuleRouter, useParams, useRouter } from "$sendary-router";
import { Link } from "sendary/components";
import { useEffect, useState } from "react";

import type { Category } from "@/config";
import {
  findPostInSection,
  findSectionByPath,
  getPostSlug,
  getPostTitle,
  normalizeCategoryName,
} from "@/lib/docs";
import { dispatchSendaryEvent, SENDARY_EVENTS } from "@/lib/events";

interface CategoryMenuProps {
  category: Category;
  hidden: boolean;
}

export function CategoryMenu({ category, hidden }: CategoryMenuProps) {
  const params = useParams();
  const router = useRouter();

  const section = findSectionByPath(params?.category ?? "");
  const { category: activeCategory } = section
    ? findPostInSection(section, params?.slug ?? "")
    : { category: undefined };

  const [hide, setHide] = useState(hidden);

  useEffect(() => {
    if (activeCategory?.name === category.name) {
      setHide(false);
    }
  }, [activeCategory?.name, category.name]);

  const categorySlug = normalizeCategoryName(category.name);

  const hasCategoryPage = category.posts.some(
    (post) => getPostSlug(post).toLowerCase() === categorySlug,
  );

  const closeSidebar = () => {
    dispatchSendaryEvent(SENDARY_EVENTS.closeSidebar);
  };

  const handleCategoryClick = async () => {
    if (!hasCategoryPage) {
      setHide((current) => !current);
      return;
    }

    setHide(false);
    closeSidebar();

    const href = `/${params.category}/${categorySlug}`;
    await ModuleRouter.goto(href);
    router.push(href);
  };

  return (
    <div className={`category ${hide ? "hide" : ""}`}>
      <h4>
        <button
          onClick={handleCategoryClick}
          className={`no-btn text-inter ${
            params?.slug === categorySlug ? "active" : ""
          }`}
        >
          {category.name}
        </button>

        <button
          className="no-btn"
          aria-label="Toggle category"
          onClick={() => setHide((current) => !current)}
        >
          <i className="ri-arrow-down-s-line"></i>
        </button>
      </h4>

      <div className="posts">
        {category.posts.map((post) => {
          const slug = getPostSlug(post);

          return (
            <div key={slug}>
              {slug.toLowerCase() === categorySlug ? (
                <></>
              ) : (
                <Link
                  href={`/${params.category}/${slug}`}
                  onClick={closeSidebar}
                  className={`btn ${
                    params?.slug === slug ? "active" : ""
                  }`}
                >
                  {getPostTitle(post)}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
