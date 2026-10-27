"use client";

import { usePathname, useRouter } from "$sendary-router";
import { Link } from "sendary/components";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { getSearchTerms, searchDocs } from "@/lib/docs-search";
import { dispatchSendaryEvent, SENDARY_EVENTS } from "@/lib/events";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");

  return (
    <>
      {text
        .split(pattern)
        .map((part, index) =>
          terms.includes(part.toLowerCase()) ? (
            <mark key={`${part}-${index}`}>{part}</mark>
          ) : (
            part
          ),
        )}
    </>
  );
}

export function DocsSearch() {
  const pathname = usePathname();
  const locationRouter = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(() => searchDocs(query), [query]);
  const terms = useMemo(() => getSearchTerms(query), [query]);

  useBodyScrollLock(open);

  const openSearch = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);

    // Avoid stacking the mobile docs/menu drawer underneath the search dialog.
    dispatchSendaryEvent(SENDARY_EVENTS.closeSidebar);
  }, []);

  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Close the dialog when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleOpen = () => openSearch();

    window.addEventListener(SENDARY_EVENTS.openSearch, handleOpen);
    return () =>
      window.removeEventListener(SENDARY_EVENTS.openSearch, handleOpen);
  }, [openSearch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (open) setOpen(false);
        else openSearch();

        return;
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openSearch]);

  useEffect(() => {
    if (activeIndex >= results.length) {
      setActiveIndex(Math.max(0, results.length - 1));
    }
  }, [activeIndex, results.length]);

  const handleInputKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (results.length > 0) {
        setActiveIndex((index) => (index + 1) % results.length);
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (results.length > 0) {
        setActiveIndex(
          (index) => (index - 1 + results.length) % results.length,
        );
      }

      return;
    }

    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();

      //  router.goto(`${results[activeIndex].entry.href}`);
      locationRouter.push(`${results[activeIndex].entry.href}`);
      closeSearch();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="docs-search-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeSearch();
      }}
    >
      <div
        className="docs-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
      >
        <div className="docs-search-input-row">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search documentation..."
            aria-label="Search documentation"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? `${listId}-${activeIndex}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="docs-search-close no-btn"
            onClick={closeSearch}
            aria-label="Close search"
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>

        <div
          className="docs-search-results"
          id={listId}
          role="listbox"
          aria-label="Documentation results"
          ref={resultsRef}
        >
          {results.length > 0 ? (
            results.map(({ entry, snippet }, index) => (
              <Link
                key={entry.href}
                href={entry.href}
                id={`${listId}-${index}`}
                data-search-index={index}
                role="option"
                aria-selected={index === activeIndex}
                className={`docs-search-result ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={closeSearch}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="docs-search-result-icon" aria-hidden="true">
                  <i
                    className={
                      entry.section === "changelog"
                        ? "ri-receipt-line"
                        : "ri-book-open-line"
                    }
                  ></i>
                </div>

                <div className="docs-search-result-body">
                  <div className="docs-search-result-title">
                    <Highlighted text={entry.title} terms={terms} />
                  </div>
                  <div className="docs-search-result-meta">
                    {entry.sectionLabel}
                    <span aria-hidden="true">·</span>
                    {entry.category}
                  </div>
                  {snippet && (
                    <p className="docs-search-result-snippet">
                      <Highlighted text={snippet} terms={terms} />
                    </p>
                  )}
                </div>

                <i
                  className="ri-arrow-right-line docs-search-result-arrow"
                  aria-hidden="true"
                ></i>
              </Link>
            ))
          ) : (
            <div className="docs-search-empty">
              <i className="ri-file-search-line" aria-hidden="true"></i>
              <p>
                No documentation found for
                {query.trim() ? ` “${query.trim()}”` : " that search"}.
              </p>
              <span>Try a different keyword.</span>
            </div>
          )}
        </div>

        <div className="docs-search-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
