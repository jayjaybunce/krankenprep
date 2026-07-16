import { useState } from "react";
import { PrepPreferencesContext } from "./PrepPreferencesContext";
import type { MarkdownSize, MarkdownColor, LayoutMode } from "./PrepPreferencesContext";
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
  const [markdownColor, setMarkdownColorState] = useState<MarkdownColor>(
    () => readLS<MarkdownColor>("markdownColor", "cyan"),
  );
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(
    () => readLS<LayoutMode>("layoutMode", "split"),
  );

  const setMarkdownSize = (size: MarkdownSize) => {
    setMarkdownSizeState(size);
    writeLS("markdownSize", size);
  };

  const setMarkdownColor = (color: MarkdownColor) => {
    setMarkdownColorState(color);
    writeLS("markdownColor", color);
  };

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    writeLS("layoutMode", mode);
  };

  return (
    <PrepPreferencesContext
      value={{
        markdownSize,
        setMarkdownSize,
        markdownColor,
        setMarkdownColor,
        layoutMode,
        setLayoutMode,
      }}
    >
      {children}
    </PrepPreferencesContext>
  );
};
