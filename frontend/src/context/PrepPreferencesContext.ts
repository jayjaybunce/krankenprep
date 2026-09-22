import { createContext } from "react";
import type { MarkdownSize } from "../data/noteTypography";
import { DEFAULT_THEME_ID, type ThemeId } from "../data/noteThemes";

export type { MarkdownSize };
export type LayoutMode = "split" | "notes";

export type PrepPreferencesState = {
  markdownSize: MarkdownSize;
  setMarkdownSize: (size: MarkdownSize) => void;
  markdownTheme: ThemeId;
  setMarkdownTheme: (theme: ThemeId) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
};

export const PrepPreferencesContext = createContext<PrepPreferencesState>({
  markdownSize: "medium",
  setMarkdownSize: () => {},
  markdownTheme: DEFAULT_THEME_ID,
  setMarkdownTheme: () => {},
  layoutMode: "split",
  setLayoutMode: () => {},
});
