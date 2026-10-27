export type Theme = "dark" | "white";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "white";
}

export function readStoredTheme(fallback: Theme = DEFAULT_THEME): Theme {
  if (typeof window === "undefined") return fallback;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : fallback;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("class", theme);
  document.documentElement.style = `color-scheme: ${theme === "dark" ? "dark" : "light"};`;
}

export function saveTheme(theme: Theme): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "white" : "dark";
}
