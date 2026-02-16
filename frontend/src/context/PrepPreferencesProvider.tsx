import { useState } from "react";
import { PrepPreferencesContext } from "./PrepPreferencesContext";
import type { MarkdownSize, MarkdownColor } from "./PrepPreferencesContext";
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
  const [layoutOption1, setLayoutOption1State] = useState<boolean>(
    () => readLS<boolean>("layoutOption1", false),
  );
  const [layoutOption2, setLayoutOption2State] = useState<boolean>(
    () => readLS<boolean>("layoutOption2", false),
  );

  const setMarkdownSize = (size: MarkdownSize) => {
    setMarkdownSizeState(size);
    writeLS("markdownSize", size);
  };

  const setMarkdownColor = (color: MarkdownColor) => {
    setMarkdownColorState(color);
    writeLS("markdownColor", color);
  };

  const setLayoutOption1 = (value: boolean) => {
    setLayoutOption1State(value);
    writeLS("layoutOption1", value);
  };

  const setLayoutOption2 = (value: boolean) => {
    setLayoutOption2State(value);
    writeLS("layoutOption2", value);
  };

  return (
    <PrepPreferencesContext
      value={{
        markdownSize,
        setMarkdownSize,
        markdownColor,
        setMarkdownColor,
        layoutOption1,
        setLayoutOption1,
        layoutOption2,
        setLayoutOption2,
      }}
    >
      {children}
    </PrepPreferencesContext>
  );
};
