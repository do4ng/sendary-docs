"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from "react";
import { usePathname } from "$sendary-router";

import site from "@/site.config";
import { SENDARY_EVENTS } from "@/lib/events";

interface HeadingItem {
  id: string;
  title: string;
}

interface Heading extends HeadingItem {
  items: HeadingItem[];
}

function cleanHeadingText(title: string): string {
  if (!title) return "";
  if (title.startsWith("#")) return title.slice(1).trim();
  return title.trim();
}

function handleTocClick(
  event: MouseEvent<HTMLAnchorElement>,
  id: string,
  onItemClick?: () => void,
) {
  if (!onItemClick) return;

  event.preventDefault();

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
  }

  onItemClick();
}

function TocAnchor({
  heading,
  onItemClick,
}: {
  heading: HeadingItem;
  onItemClick?: () => void;
}) {
  return (
    <a
      href={`#${heading.id}`}
      onClick={(event) => handleTocClick(event, heading.id, onItemClick)}
    >
      {cleanHeadingText(heading.title)}
    </a>
  );
}

function Headings({
  headings,
  activeId,
  onItemClick,
}: {
  headings: Heading[];
  activeId: string | null;
  onItemClick?: () => void;
}) {
  return (
    <ul>
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={heading.id === activeId ? "active" : ""}
        >
          <TocAnchor heading={heading} onItemClick={onItemClick} />

          {heading.items.length > 0 && (
            <ul>
              {heading.items.map((child) => (
                <li
                  key={child.id}
                  className={child.id === activeId ? "active" : ""}
                >
                  <TocAnchor heading={child} onItemClick={onItemClick} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function readHeadings(): Heading[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".content h2[id]"),
  ).map((heading) => ({
    id: heading.id,
    title: heading.innerText,
    items: [],
  }));
}

function useHeadingsData(pathname: string): Heading[] {
  const [nestedHeadings, setNestedHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const updateHeadings = () => setNestedHeadings(readHeadings());

    updateHeadings();
    const timer = setTimeout(updateHeadings, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return nestedHeadings;
}

function getHeadingElements(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".content h2[id]"),
  );
}

function useActiveHeading(
  setActiveId: Dispatch<SetStateAction<string | null>>,
  pathname: string,
) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".content");
    let headingElements: HTMLElement[] = [];
    let frame = 0;

    const isAtBottom = () => {
      if (container && container.scrollHeight - container.clientHeight > 4) {
        return (
          Math.ceil(container.scrollTop + container.clientHeight) >=
          container.scrollHeight - 1
        );
      }

      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight - window.innerHeight <= 4) return false;

      return (
        Math.ceil(window.scrollY + window.innerHeight) >= documentHeight - 1
      );
    };

    const updateActiveId = () => {
      frame = 0;

      if (headingElements.length === 0) {
        headingElements = getHeadingElements();
        if (headingElements.length === 0) {
          setActiveId(null);
          return;
        }
      }

      if (isAtBottom()) {
        setActiveId(headingElements[headingElements.length - 1].id);
        return;
      }

      // A heading becomes active once it crosses the upper third of the
      // viewport. This is intentionally lenient so a section activates while
      // its heading is still comfortably visible.
      const activationLine = Math.max(80, window.innerHeight * 0.3);

      let currentId = headingElements[0].id;

      for (const heading of headingElements) {
        if (heading.getBoundingClientRect().top <= activationLine) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveId);
    };

    const refreshHeadings = () => {
      headingElements = getHeadingElements();
      scheduleUpdate();
    };

    refreshHeadings();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    container?.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", refreshHeadings);

    let observer: MutationObserver | undefined;

    if (container) {
      observer = new MutationObserver(refreshHeadings);
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      container?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", refreshHeadings);
      observer?.disconnect();
    };
  }, [setActiveId, pathname]);
}

export function TableOfContents() {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nestedHeadings = useHeadingsData(pathname);
  useActiveHeading(setActiveId, pathname);

  const headingIds = useMemo(
    () =>
      nestedHeadings.flatMap((heading) => [
        heading.id,
        ...heading.items.map((child) => child.id),
      ]),
    [nestedHeadings],
  );

  const currentActiveId =
    activeId && headingIds.includes(activeId)
      ? activeId
      : (nestedHeadings[0]?.id ?? null);

  useEffect(() => {
    const onOpen = () => setMobileOpen(true);

    window.addEventListener(SENDARY_EVENTS.openToc, onOpen);
    return () => window.removeEventListener(SENDARY_EVENTS.openToc, onOpen);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop TOC */}
      <nav aria-label="Table of contents" className="fade-in-left toc-desktop">
        <a className="no-a toc-header-title" href="#">
          On this page
        </a>
        {nestedHeadings.length > 0 ? (
          <Headings headings={nestedHeadings} activeId={currentActiveId} />
        ) : (
          <div className="toc-empty">No headings</div>
        )}
        {site.github && (
          <div className="table-actions">
            <div>
              <span>
                <i className="ri-github-fill"></i>
              </span>
              <a
                className="no-a"
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                Feedback on GitHub
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile TOC Drawer */}
      {mobileOpen && (
        <div className="mobile-toc-overlay" onClick={() => setMobileOpen(false)}>
          <div
            className="mobile-toc-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-toc-header">
              <h3>On this page</h3>
              <button
                className="no-btn close-toc-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close table of contents"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="mobile-toc-content">
              {nestedHeadings.length > 0 ? (
                <Headings
                  headings={nestedHeadings}
                  activeId={currentActiveId}
                  onItemClick={() => setMobileOpen(false)}
                />
              ) : (
                <p className="mobile-toc-empty">No headings on this page</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
