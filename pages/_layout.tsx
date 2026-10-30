"use client";

import { usePathname } from "$sendary-router";
import { Link } from "sendary/components";
import { useEffect, useState } from "react";

import "../styles/global.scss";
import "../styles/style.scss";

import config from "@/config";
import { Header } from "@/components/header";
import { CategoryMenu } from "@/components/category";
import { DocsSearch } from "@/components/docs-search";
import { SENDARY_EVENTS, dispatchSendaryEvent } from "@/lib/events";
import { findSectionByPath } from "@/lib/docs";
import { applyTheme, readStoredTheme } from "@/lib/theme";
import { capitalizeFirstLetter } from "@/lib/up";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { TopProgressBar } from "@/components/progress";

export default function Layout({ children }: { children: React.ReactNode }) {
  const fullPathname = usePathname();
  const path = fullPathname.split("/")[1] ?? "";

  const isDocs = path === "docs" || path === "changelog";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useBodyScrollLock(mobileSidebarOpen);

  useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [fullPathname]);

  useEffect(() => {
    const closeSidebar = () => setMobileSidebarOpen(false);

    window.addEventListener(SENDARY_EVENTS.closeSidebar, closeSidebar);
    return () =>
      window.removeEventListener(SENDARY_EVENTS.closeSidebar, closeSidebar);
  }, []);

  const target = findSectionByPath(path);
  const openToc = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SENDARY_EVENTS.openToc));
    }
  };

  return (
    <>
      <Header />
      <DocsSearch />
      <TopProgressBar />

      {isDocs ? (
        <>
          {/* Mobile docs navigation sub-bar */}
          <div className="mobile-docs-bar">
            <button
              className="mobile-docs-bar-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open documentation navigation"
            >
              <i className="ri-menu-2-line"></i>
              <span>Menu</span>
              <span className="mobile-docs-bar-badge">
                {capitalizeFirstLetter(path)}
              </span>
            </button>

            <button
              className="mobile-docs-bar-btn"
              onClick={openToc}
              aria-label="Open table of contents"
            >
              <i className="ri-list-check-2"></i>
              <span>On this page</span>
            </button>
          </div>

          <div className="documentation">
            <aside className={`menu ${mobileSidebarOpen ? "menu-open" : ""}`}>
              <div className="menu-header-mobile">
                <h3>{capitalizeFirstLetter(path)} Navigation</h3>
                <button
                  className="no-btn close-sidebar-btn"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <button
                className="docs-sidebar-search"
                onClick={() => dispatchSendaryEvent(SENDARY_EVENTS.openSearch)}
                aria-label="Search documentation"
              >
                <i className="ri-search-line"></i>
                <span>Search docs</span>
                <kbd>Ctrl K</kbd>
              </button>

              <div className="menu-layout">
                <div className="menu-categories">
                  {config
                    .filter(({ title }) => title.toLowerCase() !== "changelog")
                    .map((section) => (
                      <div
                        key={section.title}
                        className={`category-button ${
                          path.toLocaleLowerCase() ===
                          section.title.toLocaleLowerCase()
                            ? "category-active"
                            : ""
                        }`}
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        <Link
                          href={`/${section.title.toLocaleLowerCase()}/${section.target}`}
                        >
                          <div className="category-button-icon">
                            <i className={`ri-${section.icon}`}></i>
                          </div>
                          <div className="category-button-text">
                            <h4>{capitalizeFirstLetter(section.title)}</h4>
                          </div>
                        </Link>
                      </div>
                    ))}
                </div>

                <div className="menu-content">
                  {target ? (
                    target.category.map((category) => (
                      <CategoryMenu
                        hidden={category.hidden || false}
                        category={category}
                        key={category.name}
                      />
                    ))
                  ) : (
                    <div className="not-found-msg">Page not found</div>
                  )}
                </div>
              </div>
            </aside>

            {mobileSidebarOpen && (
              <div
                className="menu-backdrop"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close sidebar backdrop"
              />
            )}

            <main className="content">{children}</main>
          </div>
        </>
      ) : (
        children
      )}
    </>
  );
}
