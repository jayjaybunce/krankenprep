import type { FC } from "react";
import { useEffect, useState } from "react";
import Markdown, { defaultUrlTransform } from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "../hooks";
import {
  vs,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Modal } from "./Modal";

type MarkdownSize = "small" | "medium" | "large";
type MarkdownColor = "cyan" | "emerald" | "amber" | "rose";

interface MarkdownRendererProps {
  children: string;
  className?: string;
  size?: MarkdownSize;
  color?: MarkdownColor;
}

const sizeConfig = {
  small: {
    h1: "text-lg font-bold mb-1 mt-2",
    h2: "text-base font-bold mb-1 mt-2",
    h3: "text-sm font-semibold mb-1 mt-1.5",
    h4: "text-sm font-semibold mb-0.5 mt-1",
    h5: "text-xs font-semibold mb-0.5 mt-1",
    h6: "text-xs font-semibold mb-0.5 mt-1",
    p: "mb-1.5 leading-snug text-xs",
    ul: "list-disc list-inside mb-1.5 space-y-0.5 text-xs",
    ol: "list-decimal list-inside mb-1.5 space-y-0.5 text-xs",
    li: "ml-2",
    blockquote: "border-l-2 pl-2 py-0.5 mb-1.5 italic text-xs",
    codeBlock: "mb-2",
    codePadding: "0.5rem",
    inlineCode: "px-1 py-0.5 rounded text-xs",
    hr: "my-2",
    table: "mb-2",
    thTd: "px-2 py-1 text-xs",
    strong: "text-xs",
    em: "text-xs",
    del: "text-xs",
    img: "mb-2",
    prose: "prose-xs",
  },
  medium: {
    h1: "text-2xl font-bold mb-2 mt-4",
    h2: "text-xl font-bold mb-2 mt-3",
    h3: "text-lg font-semibold mb-1.5 mt-2.5",
    h4: "text-base font-semibold mb-1 mt-2",
    h5: "text-sm font-semibold mb-1 mt-2",
    h6: "text-sm font-semibold mb-1 mt-1.5",
    p: "mb-2 leading-normal text-sm",
    ul: "list-disc list-inside mb-2 space-y-1 text-sm",
    ol: "list-decimal list-inside mb-2 space-y-1 text-sm",
    li: "ml-3",
    blockquote: "border-l-3 pl-3 py-1 mb-2 italic text-sm",
    codeBlock: "mb-3",
    codePadding: "0.75rem",
    inlineCode: "px-1.5 py-0.5 rounded-md text-xs",
    hr: "my-4",
    table: "mb-3",
    thTd: "px-3 py-1.5 text-sm",
    strong: "text-sm",
    em: "text-sm",
    del: "text-sm",
    img: "mb-3",
    prose: "prose-sm",
  },
  large: {
    h1: "text-4xl font-bold mb-4 mt-6",
    h2: "text-3xl font-bold mb-3 mt-5",
    h3: "text-2xl font-semibold mb-3 mt-4",
    h4: "text-xl font-semibold mb-2 mt-3",
    h5: "text-lg font-semibold mb-2 mt-3",
    h6: "text-base font-semibold mb-2 mt-2",
    p: "mb-4 leading-relaxed",
    ul: "list-disc list-inside mb-4 space-y-2",
    ol: "list-decimal list-inside mb-4 space-y-2",
    li: "ml-4",
    blockquote: "border-l-4 pl-4 py-2 mb-4 italic",
    codeBlock: "mb-4",
    codePadding: "1rem",
    inlineCode: "px-2 py-1 rounded-md font-mono text-sm",
    hr: "my-6",
    table: "mb-4",
    thTd: "px-4 py-2",
    strong: "",
    em: "",
    del: "",
    img: "mb-4",
    prose: "prose-sm",
  },
} as const;

const colorConfig = {
  cyan: {
    h1Gradient: "from-cyan-400 to-blue-500",
    h2: { dark: "text-cyan-300", light: "text-cyan-600" },
    h3: { dark: "text-blue-300", light: "text-blue-600" },
    strong: { dark: "text-cyan-300", light: "text-cyan-700" },
    em: { dark: "text-blue-300", light: "text-blue-600" },
    link: {
      dark: "text-cyan-400 hover:text-cyan-300 decoration-cyan-500/50 hover:decoration-cyan-400",
      light:
        "text-cyan-600 hover:text-cyan-700 decoration-cyan-300 hover:decoration-cyan-500",
    },
    blockquoteBorder: { dark: "border-cyan-500", light: "border-cyan-400" },
    inlineCode: { dark: "text-cyan-300", light: "text-cyan-700" },
    imgHoverBorder: {
      dark: "hover:border-cyan-500",
      light: "hover:border-cyan-400",
    },
  },
  emerald: {
    h1Gradient: "from-emerald-400 to-teal-500",
    h2: { dark: "text-emerald-300", light: "text-emerald-600" },
    h3: { dark: "text-teal-300", light: "text-teal-600" },
    strong: { dark: "text-emerald-300", light: "text-emerald-700" },
    em: { dark: "text-teal-300", light: "text-teal-600" },
    link: {
      dark: "text-emerald-400 hover:text-emerald-300 decoration-emerald-500/50 hover:decoration-emerald-400",
      light:
        "text-emerald-600 hover:text-emerald-700 decoration-emerald-300 hover:decoration-emerald-500",
    },
    blockquoteBorder: {
      dark: "border-emerald-500",
      light: "border-emerald-400",
    },
    inlineCode: { dark: "text-emerald-300", light: "text-emerald-700" },
    imgHoverBorder: {
      dark: "hover:border-emerald-500",
      light: "hover:border-emerald-400",
    },
  },
  amber: {
    h1Gradient: "from-amber-400 to-orange-500",
    h2: { dark: "text-amber-300", light: "text-amber-600" },
    h3: { dark: "text-orange-300", light: "text-orange-600" },
    strong: { dark: "text-amber-300", light: "text-amber-700" },
    em: { dark: "text-orange-300", light: "text-orange-600" },
    link: {
      dark: "text-amber-400 hover:text-amber-300 decoration-amber-500/50 hover:decoration-amber-400",
      light:
        "text-amber-600 hover:text-amber-700 decoration-amber-300 hover:decoration-amber-500",
    },
    blockquoteBorder: { dark: "border-amber-500", light: "border-amber-400" },
    inlineCode: { dark: "text-amber-300", light: "text-amber-700" },
    imgHoverBorder: {
      dark: "hover:border-amber-500",
      light: "hover:border-amber-400",
    },
  },
  rose: {
    h1Gradient: "from-rose-400 to-pink-500",
    h2: { dark: "text-rose-300", light: "text-rose-600" },
    h3: { dark: "text-pink-300", light: "text-pink-600" },
    strong: { dark: "text-rose-300", light: "text-rose-700" },
    em: { dark: "text-pink-300", light: "text-pink-600" },
    link: {
      dark: "text-rose-400 hover:text-rose-300 decoration-rose-500/50 hover:decoration-rose-400",
      light:
        "text-rose-600 hover:text-rose-700 decoration-rose-300 hover:decoration-rose-500",
    },
    blockquoteBorder: { dark: "border-rose-500", light: "border-rose-400" },
    inlineCode: { dark: "text-rose-300", light: "text-rose-700" },
    imgHoverBorder: {
      dark: "hover:border-rose-500",
      light: "hover:border-rose-400",
    },
  },
} as const;

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  className = "",
  size = "medium",
  color = "cyan",
}) => {
  const { colorMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const s = sizeConfig[size];
  const c = colorConfig[color];
  const isDark = colorMode === "dark";

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs after every render;
  // the cleanup auto-debounces rapid re-renders (e.g. typing in preview)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const wh = (window as unknown as Record<string, { refreshLinks: () => void }>).$WowheadPower;
      if (wh) wh.refreshLinks();
    }, 100);
    return () => clearTimeout(timeout);
  });

  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1
        className={`
          ${s.h1} font-montserrat
          bg-gradient-to-r ${c.h1Gradient} bg-clip-text text-transparent
        `}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`
          ${s.h2} font-montserrat
          ${isDark ? c.h2.dark : c.h2.light}
        `}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`
          ${s.h3} font-montserrat
          ${isDark ? c.h3.dark : c.h3.light}
        `}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className={`
          ${s.h4} font-montserrat
          ${isDark ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5
        className={`
          ${s.h5} font-montserrat
          ${isDark ? "text-slate-400" : "text-slate-600"}
        `}
      >
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6
        className={`
          ${s.h6} font-montserrat
          ${isDark ? "text-slate-500" : "text-slate-500"}
        `}
      >
        {children}
      </h6>
    ),

    // Paragraph
    p: ({ children }) => (
      <p
        className={`
          ${s.p}
          ${isDark ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul
        className={`
          ${s.ul}
          ${isDark ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`
          ${s.ol}
          ${isDark ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className={s.li}>{children}</li>,

    // Links
    a: ({ href, children }) => {
      const spellMatch = href?.match(/^spell:(\d+)$/);
      if (spellMatch) {
        return (
          <a
            href={`https://www.wowhead.com/spell=${spellMatch[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            data-wh-icon-size="small"
            className={`
              font-medium underline decoration-2 underline-offset-2
              transition-all duration-200
              ${isDark ? c.link.dark : c.link.light}
            `}
          >
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            font-medium underline decoration-2 underline-offset-2
            transition-all duration-200
            ${isDark ? c.link.dark : c.link.light}
          `}
        >
          {children}
        </a>
      );
    },

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote
        className={`
          ${s.blockquote}
          ${
            isDark
              ? `${c.blockquoteBorder.dark} bg-slate-800/50 text-slate-300`
              : `${c.blockquoteBorder.light} bg-slate-100 text-slate-600`
          }
        `}
      >
        {children}
      </blockquote>
    ),

    // Code blocks
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      return !inline && language ? (
        <div className={`${s.codeBlock} rounded-xl overflow-hidden`}>
          <SyntaxHighlighter
            style={isDark ? vscDarkPlus : vs}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0.75rem",
              padding: s.codePadding,
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className={`
            ${s.inlineCode} font-mono
            ${
              isDark
                ? `bg-slate-800 ${c.inlineCode.dark} border border-slate-700`
                : `bg-slate-200 ${c.inlineCode.light} border border-slate-300`
            }
          `}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Horizontal rule
    hr: () => (
      <hr
        className={`
          ${s.hr} border-0 h-px
          ${isDark ? "bg-slate-700" : "bg-slate-300"}
        `}
      />
    ),

    // Table
    table: ({ children }) => (
      <div className={`overflow-x-auto ${s.table}`}>
        <table
          className={`
            min-w-full border-collapse
            ${isDark ? "border-slate-700" : "border-slate-300"}
          `}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead
        className={`
          ${
            isDark
              ? "bg-slate-800 text-slate-200"
              : "bg-slate-200 text-slate-800"
          }
        `}
      >
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr
        className={`
          border-b
          ${isDark ? "border-slate-700" : "border-slate-300"}
        `}
      >
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className={`${s.thTd} text-left font-semibold`}>{children}</th>
    ),
    td: ({ children }) => (
      <td
        className={`
          ${s.thTd}
          ${isDark ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </td>
    ),

    // Strong and emphasis
    strong: ({ children }) => (
      <strong
        className={`
          font-bold ${s.strong}
          ${isDark ? c.strong.dark : c.strong.light}
        `}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em
        className={`
          italic ${s.em}
          ${isDark ? c.em.dark : c.em.light}
        `}
      >
        {children}
      </em>
    ),

    // Deleted text
    del: ({ children }) => (
      <del
        className={`
          line-through ${s.del}
          ${isDark ? "text-slate-500" : "text-slate-400"}
        `}
      >
        {children}
      </del>
    ),

    // Images
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ""}
        onClick={() => setSelectedImage({ src: src || "", alt: alt || "" })}
        className={`
          max-w-full h-auto rounded-lg ${s.img} cursor-pointer
          transition-all duration-200 hover:scale-[1.02]
          ${
            isDark
              ? `border border-slate-700 ${c.imgHoverBorder.dark}`
              : `border border-slate-300 ${c.imgHoverBorder.light}`
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedImage({ src: src || "", alt: alt || "" });
          }
        }}
      />
    ),
  };

  return (
    <>
      <div className={`prose ${s.prose} max-w-none ${className}`}>
        <Markdown
          components={components}
          urlTransform={(url) =>
            url.startsWith("spell:") ? url : defaultUrlTransform(url)
          }
        >
          {children}
        </Markdown>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.alt}
        size="full"
        centerContent
      >
        {selectedImage && (
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        )}
      </Modal>
    </>
  );
};
