import { useState } from "react";
import { PrepPreferencesContext } from "./PrepPreferencesContext";
import type { MarkdownSize, LayoutMode } from "./PrepPreferencesContext";
import { noteThemes, DEFAULT_THEME_ID, type ThemeId } from "../data/noteThemes";
import { useGoogleFont } from "../hooks";
import type { FC, PropsWithChildren } from "react";

const LS_PREFIX = "kp-prep-";

const readLS = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(LS_PREFIX + key);
  if (stored === null) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return stored as unknown as T;
  }
};

const writeLS = (key: string, value: unknown): void => {
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
};

export const PrepPreferencesProvider: FC<PropsWithChildren> = ({ children }) => {
  const [markdownSize, setMarkdownSizeState] = useState<MarkdownSize>(
    () => readLS<MarkdownSize>("markdownSize", "medium"),
  );
  // Note: old "markdownColor" localStorage entries from before the theme
  // system are simply abandoned — it's a cosmetic pref, not worth migrating.
  const [markdownTheme, setMarkdownThemeState] = useState<ThemeId>(
    () => readLS<ThemeId>("markdownTheme", DEFAULT_THEME_ID),
  );
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(
    () => readLS<LayoutMode>("layoutMode", "split"),
  );

  const setMarkdownSize = (size: MarkdownSize) => {
    setMarkdownSizeState(size);
    writeLS("markdownSize", size);
  };

  const setMarkdownTheme = (theme: ThemeId) => {
    setMarkdownThemeState(theme);
    writeLS("markdownTheme", theme);
  };

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    writeLS("layoutMode", mode);
  };

  // Single app-wide font load point for the active note theme, rather than
  // every MarkdownRenderer/NoteDiffView instance independently managing
  // (redundantly, if harmlessly) the same <link> tag.
  useGoogleFont(noteThemes[markdownTheme].fonts.googleFonts);

  return (
    <PrepPreferencesContext
      value={{
        markdownSize,
        setMarkdownSize,
        markdownTheme,
        setMarkdownTheme,
        layoutMode,
        setLayoutMode,
      }}
    >
      {children}
    </PrepPreferencesContext>
  );
};
