import type { CSSProperties } from "react";

// Type scale for rendering note markdown, split across two independent
// axes:
//   - `noteFontScale` (this file): font-size/weight per element, picked by
//     the user's S/M/L size preference. Deliberately carries no margins or
//     line-height — those are spacing *rhythm*, which is now a theme
//     property (see noteThemes.ts), not a size property. A theme's
//     line-height/letter-spacing applies once, globally, via CSS
//     inheritance; margins vary per element, so they're computed per
//     element from `noteMarginScale` × the theme's `spacingScale`.
//   - `noteMarginScale` (this file): base margin/padding rem values per
//     element at spacingScale=1 — unchanged from what was previously
//     baked into fixed Tailwind classes, so the default theme (spacingScale
//     1) renders identically to before.
export type MarkdownSize = "small" | "medium" | "large";

export type NoteFontScale = {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
  p: string;
  ul: string;
  ol: string;
  li: string;
  blockquote: string;
  inlineCode: string;
  hr: string;
  table: string;
  thTd: string;
  strong: string;
  em: string;
  del: string;
  img: string;
  prose: string;
};

export const noteFontScale: Record<MarkdownSize, NoteFontScale> = {
  small: {
    h1: "text-lg font-bold",
    h2: "text-base font-bold",
    h3: "text-sm font-semibold",
    h4: "text-sm font-semibold",
    h5: "text-xs font-semibold",
    h6: "text-xs font-semibold",
    p: "text-xs",
    ul: "list-disc list-inside text-xs",
    ol: "list-decimal list-inside text-xs",
    li: "ml-2",
    blockquote: "border-l-2 italic text-xs",
    inlineCode: "px-1 py-0.5 rounded text-xs",
    hr: "",
    table: "",
    thTd: "px-2 py-1 text-xs",
    strong: "text-xs",
    em: "text-xs",
    del: "text-xs",
    img: "",
    prose: "prose-xs",
  },
  medium: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-bold",
    h3: "text-lg font-semibold",
    h4: "text-base font-semibold",
    h5: "text-sm font-semibold",
    h6: "text-sm font-semibold",
    p: "text-sm",
    ul: "list-disc list-inside text-sm",
    ol: "list-decimal list-inside text-sm",
    li: "ml-3",
    blockquote: "border-l-3 italic text-sm",
    inlineCode: "px-1.5 py-0.5 rounded-md text-xs",
    hr: "",
    table: "",
    thTd: "px-3 py-1.5 text-sm",
    strong: "text-sm",
    em: "text-sm",
    del: "text-sm",
    img: "",
    prose: "prose-sm",
  },
  large: {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-semibold",
    h5: "text-lg font-semibold",
    h6: "text-base font-semibold",
    p: "",
    ul: "list-disc list-inside",
    ol: "list-decimal list-inside",
    li: "ml-4",
    blockquote: "border-l-4 italic",
    inlineCode: "px-2 py-1 rounded-md font-mono text-sm",
    hr: "",
    table: "",
    thTd: "px-4 py-2",
    strong: "",
    em: "",
    del: "",
    img: "",
    prose: "prose-sm",
  },
};

export type MarginElement =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "ul" | "ol" | "blockquote" | "hr" | "table" | "img" | "codeBlock";

type MarginRem = { mt?: number; mb?: number; py?: number; pl?: number };

// rem values, extracted 1:1 from what used to be fixed Tailwind spacing
// classes (mb-2 = 0.5rem, etc) — the baseline a theme's spacingScale
// multiplies from.
export const noteMarginScale: Record<MarkdownSize, Record<MarginElement, MarginRem>> = {
  small: {
    h1: { mb: 0.25, mt: 0.5 },
    h2: { mb: 0.25, mt: 0.5 },
    h3: { mb: 0.25, mt: 0.375 },
    h4: { mb: 0.125, mt: 0.25 },
    h5: { mb: 0.125, mt: 0.25 },
    h6: { mb: 0.125, mt: 0.25 },
    p: { mb: 0.375 },
    ul: { mb: 0.375 },
    ol: { mb: 0.375 },
    blockquote: { mt: 0.25, py: 0.25, mb: 0.5, pl: 0.5 },
    hr: { mt: 0.5, mb: 0.5 },
    table: { mb: 0.5 },
    img: { mb: 0.5 },
    codeBlock: { mb: 0.5 },
  },
  medium: {
    h1: { mb: 0.5, mt: 1 },
    h2: { mb: 0.5, mt: 0.75 },
    h3: { mb: 0.375, mt: 0.625 },
    h4: { mb: 0.25, mt: 0.5 },
    h5: { mb: 0.25, mt: 0.5 },
    h6: { mb: 0.25, mt: 0.375 },
    p: { mb: 0.5 },
    ul: { mb: 0.5 },
    ol: { mb: 0.5 },
    blockquote: { mt: 0.375, py: 0.375, mb: 0.75, pl: 0.75 },
    hr: { mt: 1, mb: 1 },
    table: { mb: 0.75 },
    img: { mb: 0.75 },
    codeBlock: { mb: 0.75 },
  },
  large: {
    h1: { mb: 1, mt: 1.5 },
    h2: { mb: 0.75, mt: 1.25 },
    h3: { mb: 0.75, mt: 1 },
    h4: { mb: 0.5, mt: 0.75 },
    h5: { mb: 0.5, mt: 0.75 },
    h6: { mb: 0.5, mt: 0.5 },
    p: { mb: 1 },
    ul: { mb: 1 },
    ol: { mb: 1 },
    blockquote: { mt: 0.625, py: 0.625, mb: 1.25, pl: 1 },
    hr: { mt: 1.5, mb: 1.5 },
    table: { mb: 1 },
    img: { mb: 1 },
    codeBlock: { mb: 1 },
  },
};

// Base rem × the active theme's spacingScale, as inline style — margins
// aren't inherited like line-height/letter-spacing are, so each block
// element needs its own computed value rather than one shared cascade.
export const marginStyle = (
  size: MarkdownSize,
  el: MarginElement,
  spacingScale: number,
): CSSProperties => {
  const base = noteMarginScale[size][el];
  const style: CSSProperties = {};
  if (base.mt !== undefined) style.marginTop = `${base.mt * spacingScale}rem`;
  if (base.mb !== undefined) style.marginBottom = `${base.mb * spacingScale}rem`;
  if (base.py !== undefined) style.paddingTop = style.paddingBottom = `${base.py * spacingScale}rem`;
  if (base.pl !== undefined) style.paddingLeft = `${base.pl * spacingScale}rem`;
  return style;
};
