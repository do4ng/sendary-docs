"use client";

import "remixicon/fonts/remixicon.css";

import { Link } from "sendary/components";
import { usePathname } from "$sendary-router";
import { useEffect, useState } from "react";

import { Popover } from "@/components/popper";
import { TextLabel } from "@/components/label";
import { ThemeSelector } from "@/components/theme-selector";
import docs from "@/docs";
import { dispatchSendaryEvent, SENDARY_EVENTS } from "@/lib/events";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useTheme } from "@/lib/use-theme";

const GITHUB_URL = "https://github.com/zely-js/sendary";

function isActiveHref(href: string, path: string): boolean {
  return href.split("/")[1]?.toLowerCase() === path.toLowerCase();
}

function useHeaderScrolled(path: string, route: string): boolean {
  const [isScrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Documentation pages always render the header with its scrolled style.
    if (!["", "blog"].includes(path.trim())) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const windowScroll =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const content = document.querySelector<HTMLElement>(".content");
      const contentScroll = content?.scrollTop ?? 0;

      setScrolled(windowScroll > 8 || contentScroll > 8);
    };

    const content = document.querySelector<HTMLElement>(".content");

    window.addEventListener("scroll", handleScroll, { passive: true });
    content?.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      content?.removeEventListener("scroll", handleScroll);
    };
  }, [path, route]);

  return isScrolled;
}

export function Header() {
  const fullPathname = usePathname();
  const path = fullPathname.split("/")[1] ?? "";

  const { theme, toggle } = useTheme();
  const isScrolled = useHeaderScrolled(path, fullPathname);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useBodyScrollLock(mobileMenuOpen);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [fullPathname]);

  // Search and other overlays request the drawer to close before opening.
  useEffect(() => {
    const closeDrawer = () => setMobileMenuOpen(false);

    window.addEventListener(SENDARY_EVENTS.closeSidebar, closeDrawer);
    return () =>
      window.removeEventListener(SENDARY_EVENTS.closeSidebar, closeDrawer);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`header-container text ${isScrolled ? "scrolled" : ""}`}>
      <div className="header">
        <div className="header-left">
          <Link className="item-1 logo" href="/">
            {docs.name} <span className="docs-icon">docs</span>
          </Link>

          <nav className="item-2 desktop-nav" aria-label="Main navigation">
            {docs.header.map((item) => {
              if (item.type === "popover") {
                return (
                  <Popover text={item.title} key={item.title}>
                    {item.children.map((child) => (
                      <div className="menu-item text-inter" key={child.title}>
                        <Link href={child.href} className="menu-container">
                          <div className="menu-icon">
                            <i className={child.icon}></i>
                          </div>
                          <div className="menu-content">
                            <h4>{child.title}</h4>
                            {child.description}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </Popover>
                );
              }

              return (
                <Link
                  href={item.href}
                  className={`btn focuser ${
                    isActiveHref(item.href, path) ? "active-link" : ""
                  }`}
                  key={item.title}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="item-3">
          <button
            className="docs-search-box"
            onClick={() => dispatchSendaryEvent(SENDARY_EVENTS.openSearch)}
            aria-label="Search documentation"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <i className="ri-search-line" aria-hidden="true"></i>
            <span>Search docs...</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="desktop-actions">
            <TextLabel text="What's new?">
              <Link href="/changelog/changelog" aria-label="Changelog">
                <p className="news-bell">
                  <i className="ri-receipt-line"></i>
                </p>
              </Link>
            </TextLabel>

            <ThemeSelector theme={theme} onToggle={toggle} />

            <TextLabel text="GitHub">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={GITHUB_URL}
                className="big-icon"
                aria-label="GitHub repository"
              >
                <i className="ri-github-fill"></i>
              </a>
            </TextLabel>
          </div>

          <div className="mobile-actions">
            <button
              className="no-btn docs-search-trigger"
              onClick={() => dispatchSendaryEvent(SENDARY_EVENTS.openSearch)}
              aria-label="Search documentation"
            >
              <i className="ri-search-line"></i>
            </button>

            <ThemeSelector theme={theme} onToggle={toggle} />

            <button
              className="no-btn mobile-hamburger-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <i
                className={mobileMenuOpen ? "ri-close-line" : "ri-menu-line"}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div
            className="mobile-menu-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-links">
              {docs.header.map((item) => {
                if (item.type === "popover") {
                  return item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={child.href}
                      className="mobile-menu-item"
                      onClick={closeMobileMenu}
                    >
                      <i className={child.icon}></i>
                      <span>{child.title}</span>
                    </Link>
                  ));
                }

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`mobile-menu-item ${
                      isActiveHref(item.href, path) ? "active" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <i
                      className={
                        item.title.toLowerCase() === "docs"
                          ? "ri-book-open-line"
                          : "ri-file-list-line"
                      }
                    ></i>
                    <span>{item.title}</span>
                  </Link>
                );
              })}

              <Link
                href="/changelog/changelog"
                className="mobile-menu-item"
                onClick={closeMobileMenu}
              >
                <i className="ri-receipt-line"></i>
                <span>What's new?</span>
              </Link>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-menu-item"
                onClick={closeMobileMenu}
              >
                <i className="ri-github-fill"></i>
                <span>GitHub Repository</span>
              </a>
            </div>

            <div className="mobile-menu-footer">
              <div className="mobile-theme-switch">
                <span>Appearance</span>
                <ThemeSelector theme={theme} onToggle={toggle} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
