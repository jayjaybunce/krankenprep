import type { CSSProperties, FC } from "react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Markdown, { defaultUrlTransform } from "react-markdown";
import type { Components } from "react-markdown";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "../hooks";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  noteFontScale,
  noteMarginScale,
  marginStyle,
  type MarkdownSize,
} from "../data/noteTypography";
import { noteThemes, themeCssVars, DEFAULT_THEME_ID, type ThemeId } from "../data/noteThemes";

// Turn a raidstrats.gg view link (e.g.
// https://raidstrats.gg/planner?view=<id>) into an embeddable planner URL.
const buildRaidStratEmbedUrl = (href: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }

  const raidplanId =
    parsed.searchParams.get("view") ?? parsed.searchParams.get("id");
  if (!raidplanId) return null;

  const url = new URL("https://raidstrats.gg/planner");
  url.searchParams.set("embed", "true");
  url.searchParams.set("id", raidplanId);
  url.searchParams.set("animation", "true");
  url.searchParams.set("hidetrails", "true");
  url.searchParams.set("circleMode", "true");
  url.searchParams.set("maxCharacters", "4");
  url.searchParams.set("loop", "false");
  return url.toString();
};

interface MarkdownRendererProps {
  children: string;
  className?: string;
  size?: MarkdownSize;
  theme?: ThemeId;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  className = "",
  size = "medium",
  theme: themeId = DEFAULT_THEME_ID,
}) => {
  const { colorMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  // Lightbox pan/zoom state
  const [lbScale, setLbScale] = useState(1);
  const [lbOffset, setLbOffset] = useState({ x: 0, y: 0 });
  const [lbDragging, setLbDragging] = useState(false);
  const lbScaleRef = useRef(1);
  const lbOffsetRef = useRef({ x: 0, y: 0 });
  const lbDragRef = useRef<{
    startX: number; startY: number;
    startOx: number; startOy: number;
    moved: boolean;
  } | null>(null);


  // Close on Escape
  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedImage]);

  const lbResetView = () => {
    lbScaleRef.current = 1;
    lbOffsetRef.current = { x: 0, y: 0 };
    setLbScale(1);
    setLbOffset({ x: 0, y: 0 });
  };

  const lbZoom = (factor: number, cx = 0, cy = 0) => {
    const newScale = Math.min(Math.max(lbScaleRef.current * factor, 0.05), 20);
    const ratio = newScale / lbScaleRef.current;
    const newX = cx - (cx - lbOffsetRef.current.x) * ratio;
    const newY = cy - (cy - lbOffsetRef.current.y) * ratio;
    lbScaleRef.current = newScale;
    lbOffsetRef.current = { x: newX, y: newY };
    setLbScale(newScale);
    setLbOffset({ x: newX, y: newY });
  };

  const handleLbWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    lbZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, cx, cy);
  };

  const handleLbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    lbDragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startOx: lbOffsetRef.current.x, startOy: lbOffsetRef.current.y,
      moved: false,
    };
    setLbDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!lbDragRef.current) return;
      const dx = ev.clientX - lbDragRef.current.startX;
      const dy = ev.clientY - lbDragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragRef.current.moved = true;
      const next = { x: lbDragRef.current.startOx + dx, y: lbDragRef.current.startOy + dy };
      lbOffsetRef.current = next;
      setLbOffset(next);
    };

    const onUp = () => {
      const moved = lbDragRef.current?.moved ?? false;
      lbDragRef.current = null;
      setLbDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!moved) setSelectedImage(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const s = noteFontScale[size];
  const theme = noteThemes[themeId];
  const isDark = colorMode === "dark";
  const palette = isDark ? theme.dark : theme.light;
  const headingFont = { fontFamily: theme.fonts.heading };
  const bodyFont = { fontFamily: theme.fonts.body };
  const spacingScale = theme.typography.spacingScale;
  const margin = (el: Parameters<typeof marginStyle>[1]) => marginStyle(size, el, spacingScale);
  const codeBlockPadY = `${noteMarginScale[size].codeBlock.mb! * spacingScale}rem`;
  const codeBlockPadX = `${noteMarginScale[size].codeBlock.mb! * 2 * spacingScale}rem`;

  // Intentionally runs after every render; the cleanup auto-debounces rapid
  // re-renders (e.g. typing in preview)
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     const wh = (
  //       window as unknown as Record<string, { refreshLinks: () => void }>
  //     ).$WowheadPower;
  //     if (wh) wh.refreshLinks();
  //   }, 100);
  //   return () => clearTimeout(timeout);
  // });

  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1
        className={`${s.h1} bg-clip-text text-transparent`}
        style={{
          ...headingFont,
          ...margin("h1"),
          backgroundImage: `linear-gradient(to right, var(--nt-heading-from), var(--nt-heading-to))`,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${s.h2} text-(--nt-heading)`} style={{ ...headingFont, ...margin("h2") }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${s.h3} text-(--nt-heading)`} style={{ ...headingFont, ...margin("h3") }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`${s.h4} text-(--nt-muted)`} style={{ ...headingFont, ...margin("h4") }}>
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className={`${s.h5} text-(--nt-muted)`} style={{ ...headingFont, ...margin("h5") }}>
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className={`${s.h6} text-(--nt-muted)`} style={{ ...headingFont, ...margin("h6") }}>
        {children}
      </h6>
    ),

    // Paragraph
    p: ({ children }) => (
      <p className={`${s.p} text-(--nt-body)`} style={margin("p")}>
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className={`${s.ul} text-(--nt-body)`} style={margin("ul")}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`${s.ol} text-(--nt-body)`} style={margin("ol")}>
        {children}
      </ol>
    ),
    li: ({ children }) => <li className={s.li}>{children}</li>,

    // Links
    a: ({ href, children }) => {
      const match = href?.match(/spell:(\d+)\/name:([^|]+)/);
      const linkClass =
        "font-medium underline decoration-2 underline-offset-2 transition-colors text-(--nt-link) hover:text-(--nt-link-hover)";

      const isRaidStratLink = /\/raidstrats\.gg\//.test(href ?? "");
      if (isRaidStratLink) {
        const embedSrc = buildRaidStratEmbedUrl(href ?? "");
        if (embedSrc) {
          return (
            <div className="relative shrink-0 aspect-video rounded-xl overflow-hidden border border-slate-800/50 bg-slate-900/40">
              <iframe src={embedSrc} className="w-full h-full" />
            </div>
          )
        }
      }
      const isRaidplanLink = /\/raidplan\//.test(href ?? "");
      if (isRaidplanLink) {
        return (
          <Link to={href ?? ""} className={`inline-flex items-center gap-1 ${linkClass}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline shrink-0 w-3 h-3"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <rect x="13" y="10" width="7" height="5" rx="1" />
            </svg>
            {children}
          </Link>
        );
      }
      if (match) {
        const [, spellId, spellName] = match;
        return (
          <a
            href={`https://www.wowhead.com/spell=${spellId}`}
            target="_blank"
            rel="noopener noreferrer"
            data-wh-icon-size="small"
            className={`inline-block w-auto ${linkClass}`}
          >
            {spellName ? (
              <img
                src={`https://wow.zamimg.com/images/wow/icons/small/${spellName}.jpg`}
                className="w-5 h-5 inline mr-1"
              />
            ) : (
              <></>
            )}
            {children}
          </a>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {children}
        </a>
      );
    },

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote
        className={`${s.blockquote} border-(--nt-blockquote-border) bg-(--nt-blockquote-bg) text-(--nt-blockquote-text)`}
        style={margin("blockquote")}
      >
        {children}
      </blockquote>
    ),

    // Code — `pre` is a passthrough so `code` owns the real rendering: as
    // of react-markdown v9+, `code` no longer receives an `inline` prop,
    // so language detection has to go by `className` (remark still tags
    // fenced blocks `language-xxx`). A fenced block without a language tag
    // falls through to the same styled inline-code chip as real inline
    // code — same tradeoff this component always made, just re-enabled.
    pre: ({ children }) => <>{children}</>,
    code: ({ className: codeClassName, children: codeChildren }) => {
      const match = /language-(\w+)/.exec(codeClassName ?? "");
      const language = match?.[1];
      const codeString = String(codeChildren).replace(/\n$/, "");

      if (!language) {
        return (
          <code
            className={`${s.inlineCode} font-mono bg-(--nt-blockquote-bg) text-(--nt-link) border border-(--nt-blockquote-border)`}
          >
            {codeChildren}
          </code>
        );
      }

      return (
        <div style={margin("codeBlock")}>
          <SyntaxHighlighter
            language={language}
            style={isDark ? theme.codeTheme.dark : theme.codeTheme.light}
            customStyle={{
              margin: 0,
              borderRadius: "0.75rem",
              padding: `${codeBlockPadY} ${codeBlockPadX}`,
              border: "1px solid var(--nt-card-border)",
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    },

    // Horizontal rule
    hr: () => <hr className="border-0 h-px bg-(--nt-hr)" style={margin("hr")} />,

    // Table
    table: ({ children }) => (
      <div className="overflow-x-auto" style={margin("table")}>
        <table className="min-w-full border-collapse border-(--nt-table-border)">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-(--nt-table-header-bg) text-(--nt-table-header-text)">
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-(--nt-table-border)">{children}</tr>
    ),
    th: ({ children }) => (
      <th className={`${s.thTd} text-left font-semibold`}>{children}</th>
    ),
    td: ({ children }) => (
      <td className={`${s.thTd} text-(--nt-body)`}>{children}</td>
    ),

    // Strong and emphasis
    strong: ({ children }) => (
      <strong className={`font-bold ${s.strong} text-(--nt-strong)`}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${s.em} text-(--nt-em)`}>{children}</em>
    ),

    // Deleted text
    del: ({ children }) => (
      <del className={`line-through ${s.del} text-(--nt-del)`}>{children}</del>
    ),

    // Images
    img: ({ src, alt }) =>
      alt === "!video!" ? (
        <>
          <video className="aspect-video" controls style={margin("img")}>
            <source src={src} type="video/mp4" />
          </video>
        </>
      ) : (
        <img
          src={src}
          alt={alt || ""}
          onClick={() => {
            lbResetView();
            setSelectedImage({ src: src || "", alt: alt || "" });
          }}
          style={margin("img")}
          className="max-w-full h-auto rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] border border-(--nt-card-border) hover:border-(--nt-link)"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              lbResetView();
              setSelectedImage({ src: src || "", alt: alt || "" });
            }
          }}
        />
      ),
  };

  return (
    <>
      <div
        className={`prose ${s.prose} max-w-none ${className}`}
        style={
          {
            ...themeCssVars(palette),
            ...bodyFont,
            lineHeight: theme.typography.lineHeight,
            letterSpacing: theme.typography.letterSpacing,
          } as CSSProperties
        }
      >
        <Markdown
          components={components}
          urlTransform={(url) =>
            url.startsWith("spell:") ? url : defaultUrlTransform(url)
          }
        >
          {children}
        </Markdown>
      </div>

      {/* Image Lightbox Portal */}
      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 overflow-hidden bg-black/92 backdrop-blur-sm"
            style={{ cursor: lbDragging ? "grabbing" : "grab" }}
            onMouseDown={handleLbMouseDown}
            onWheel={handleLbWheel}
          >
            {/* Image — pointer-events:none so all mouse events go to the backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                draggable={false}
                style={{
                  transform: `translate(${lbOffset.x}px, ${lbOffset.y}px) scale(${lbScale})`,
                  transformOrigin: "center",
                  maxWidth: "85vw",
                  maxHeight: "85vh",
                }}
                className="object-contain rounded-lg shadow-2xl select-none"
              />
            </div>

            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Zoom controls */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-3 py-2 text-white select-none"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg leading-none"
                onClick={() => lbZoom(1 / 1.25)}
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="min-w-14 text-center font-mono text-xs tabular-nums">
                {Math.round(lbScale * 100)}%
              </span>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg leading-none"
                onClick={() => lbZoom(1.25)}
                aria-label="Zoom in"
              >
                +
              </button>
              <div className="w-px h-4 bg-white/30 mx-1" />
              <button
                className="px-3 py-0.5 rounded-full hover:bg-white/20 transition-colors text-xs"
                onClick={lbResetView}
                aria-label="Reset zoom and position"
              >
                Reset
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
