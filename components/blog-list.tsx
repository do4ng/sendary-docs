"use client";

import { useMemo, useState } from "react";
import { Link } from "sendary/components";

import type { BlogAuthor, BlogPost } from "@/blog.config";
import { formatDate } from "@/lib/format";

function getPostSlug(post: BlogPost): string {
  return post.slug ?? post.date;
}

function getAuthor(post: BlogPost): BlogAuthor {
  return post.author ?? { name: "do4ng", role: "Maintainer" };
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => {
      if (post.category) set.add(post.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/).filter(Boolean);

    // 1. Strict deduplication of input posts by slug / date
    const uniquePostsMap = new Map<string, BlogPost>();
    for (const post of posts) {
      const slug = getPostSlug(post);
      if (!uniquePostsMap.has(slug)) {
        uniquePostsMap.set(slug, post);
      }
    }
    const uniquePosts = Array.from(uniquePostsMap.values());

    // 2. Filter by category
    const categoryMatched = uniquePosts.filter((post) => {
      return selectedCategory === "All" || post.category === selectedCategory;
    });

    // 3. Filter by search query
    // When searching, ONLY posts matching the search query are included.
    // (Never forcibly inject or duplicate pinned posts into search results!)
    const searchMatched = categoryMatched.filter((post) => {
      if (terms.length === 0) return true;

      const searchableValues = [
        post.title,
        post.description,
        post.category,
        post.date,
        ...(post.tags ?? []),
        post.author?.name ?? "",
      ].map((value) => value.toLowerCase());

      return terms.every((term) =>
        searchableValues.some((value) => value.includes(term)),
      );
    });

    // 4. Sort:
    // Pinned posts first (if both match search or in default view), then newest first
    return searchMatched.sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      return b.date.localeCompare(a.date);
    });
  }, [posts, selectedCategory, searchQuery]);

  const hasFilters =
    searchQuery.trim().length > 0 || selectedCategory !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="blog-page-container">
      {/* Blog Hero Header */}
      <div className="blog-hero">
        <div className="blog-badge">
          <i className="ri-article-line" aria-hidden="true"></i>
          <span>Developer Blog</span>
        </div>
        <h1>Blog</h1>
        <p>
          Updates, engineering insights, and release announcements.
        </p>
      </div>

      {/* Categories & Search Controls */}
      <div className="blog-controls">
        <div className="blog-categories" role="tablist">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
              role="tab"
              aria-selected={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="blog-search-wrapper" role="search">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search articles"
          />
          {searchQuery && (
            <button
              type="button"
              className="blog-search-clear no-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <i className="ri-close-circle-line" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>

      {hasFilters && (
        <p className="blog-results-count" aria-live="polite">
          {filteredPosts.length === 0
            ? "No articles found"
            : `Showing ${filteredPosts.length} of ${posts.length} article${
                posts.length === 1 ? "" : "s"
              }`}
          {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
          {searchQuery.trim() ? ` for “${searchQuery.trim()}”` : ""}
        </p>
      )}

      {/* Standard Blog List */}
      {filteredPosts.length > 0 ? (
        <div className="blog-list">
          {filteredPosts.map((post) => {
            const author = getAuthor(post);
            const isPinned = Boolean(post.pinned);
            const slug = getPostSlug(post);

            return (
              <Link
                key={`blog-post-${slug}`}
                href={`/blog/${slug}`}
                className={`blog-item ${isPinned ? "is-pinned" : ""}`}
              >
                <div className="blog-item-meta">
                  {isPinned && (
                    <span className="blog-item-pin">
                      <i className="ri-pushpin-2-fill" aria-hidden="true"></i>
                      <span>Pin</span>
                    </span>
                  )}
                  <span className="blog-item-category">{post.category}</span>
                  <span className="blog-item-date">{formatDate(post.date)}</span>
                  {post.readTime && (
                    <span className="blog-item-readtime">
                      <i className="ri-time-line" aria-hidden="true"></i>
                      {post.readTime}
                    </span>
                  )}
                </div>

                <h2 className="blog-item-title">
                  <span>{post.title}</span>
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </h2>

                <p className="blog-item-desc">{post.description}</p>

                {(author.name || (post.tags && post.tags.length > 0)) && (
                  <div className="blog-item-footer">
                    {author.name && (
                      <div className="blog-item-author">
                        {author.avatar && (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="blog-item-avatar"
                            loading="lazy"
                          />
                        )}
                        <span className="blog-item-author-name">{author.name}</span>
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-item-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="blog-empty">
          <i className="ri-file-search-line" aria-hidden="true"></i>
          <p>
            No articles found matching
            {searchQuery.trim() ? ` “${searchQuery.trim()}”` : " your filters"}.
            Try another search term or category.
          </p>
          <button className="blog-clear-filters no-btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
