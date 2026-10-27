import { useCallback, useEffect, useState } from "react";

import {
  applyTheme,
  DEFAULT_THEME,
  nextTheme,
  readStoredTheme,
  saveTheme,
  type Theme,
} from "./theme";

export function useTheme(fallback: Theme = DEFAULT_THEME) {
  const [theme, setTheme] = useState<Theme>(fallback);

  useEffect(() => {
    setTheme(readStoredTheme(fallback));
  }, [fallback]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const updated = nextTheme(current);
      applyTheme(updated);
      saveTheme(updated);
      return updated;
    });
  }, []);

  return { theme, toggle };
}
