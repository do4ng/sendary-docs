"use client";

import type { Theme } from "@/lib/theme";
import { TextLabel } from "./label";

export function ThemeSelector({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const isDark = theme === "dark";

  return (
    <TextLabel text="Toggle Theme">
      <button
        className="theme-toggle-btn"
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={onToggle}
      >
        <i className={isDark ? "ri-moon-line" : "ri-sun-line"}></i>
      </button>
    </TextLabel>
  );
}
