import { createContext } from "react";

export type MarkdownSize = "small" | "medium" | "large";
export type MarkdownColor = "cyan" | "emerald" | "amber" | "rose";
export type LayoutMode = "split" | "notes";

export type PrepPreferencesState = {
  markdownSize: MarkdownSize;
  setMarkdownSize: (size: MarkdownSize) => void;
  markdownColor: MarkdownColor;
  setMarkdownColor: (color: MarkdownColor) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
};

export const PrepPreferencesContext = createContext<PrepPreferencesState>({
  markdownSize: "medium",
  setMarkdownSize: () => {},
  markdownColor: "cyan",
  setMarkdownColor: () => {},
  layoutMode: "split",
  setLayoutMode: () => {},
});
