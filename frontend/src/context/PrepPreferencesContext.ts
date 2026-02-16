import { createContext } from "react";

export type MarkdownSize = "small" | "medium" | "large";
export type MarkdownColor = "cyan" | "emerald" | "amber" | "rose";

export type PrepPreferencesState = {
  markdownSize: MarkdownSize;
  setMarkdownSize: (size: MarkdownSize) => void;
  markdownColor: MarkdownColor;
  setMarkdownColor: (color: MarkdownColor) => void;
  layoutOption1: boolean;
  setLayoutOption1: (value: boolean) => void;
  layoutOption2: boolean;
  setLayoutOption2: (value: boolean) => void;
};

export const PrepPreferencesContext = createContext<PrepPreferencesState>({
  markdownSize: "medium",
  setMarkdownSize: () => {},
  markdownColor: "cyan",
  setMarkdownColor: () => {},
  layoutOption1: false,
  setLayoutOption1: () => {},
  layoutOption2: false,
  setLayoutOption2: () => {},
});
