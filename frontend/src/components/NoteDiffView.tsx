import type { FC } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import { defaultUrlTransform } from "react-markdown";
import { useTheme } from "../hooks";
import type { DiffOp } from "../api/queryHooks";

type MarkdownColor = "cyan" | "emerald" | "amber" | "rose";
type MarkdownSize = "small" | "medium" | "large";

type NoteDiffViewProps = {
  diffs: DiffOp[];
  color?: MarkdownColor;
  size?: MarkdownSize;
};

const sizeConfig = {
  small: {
    h1: "text-lg font-bold mb-1 mt-2",
    h2: "text-base font-bold mb-1 mt-2",
    h3: "text-sm font-semibold mb-1 mt-1.5",
    p: "mb-1.5 leading-snug text-xs",
    ul: "list-disc list-outside ml-4 mb-1.5 space-y-0.5 text-xs",
    ol: "list-decimal list-outside ml-4 mb-1.5 space-y-0.5 text-xs",
    li: "pl-1",
    strong: "text-xs font-bold",
    em: "text-xs italic",
  },
  medium: {
    h1: "text-2xl font-bold mb-2 mt-4",
    h2: "text-xl font-bold mb-2 mt-3",
    h3: "text-lg font-semibold mb-1.5 mt-2.5",
    p: "mb-2 leading-normal text-sm",
    ul: "list-disc list-outside ml-5 mb-2 space-y-1 text-sm",
    ol: "list-decimal list-outside ml-5 mb-2 space-y-1 text-sm",
    li: "pl-1",
    strong: "text-sm font-bold",
    em: "text-sm italic",
  },
  large: {
    h1: "text-4xl font-bold mb-4 mt-6",
    h2: "text-3xl font-bold mb-3 mt-5",
    h3: "text-2xl font-semibold mb-3 mt-4",
    p: "mb-4 leading-relaxed",
    ul: "list-disc list-outside ml-6 mb-4 space-y-2",
    ol: "list-decimal list-outside ml-6 mb-4 space-y-2",
    li: "pl-1",
    strong: "font-bold",
    em: "italic",
  },
} as const;

const colorConfig = {
  cyan: {
    h1: "from-cyan-400 to-blue-500",
    h2: { dark: "text-cyan-300", light: "text-cyan-600" },
    h3: { dark: "text-blue-300", light: "text-blue-600" },
    strong: { dark: "text-cyan-300", light: "text-cyan-700" },
    em: { dark: "text-blue-300", light: "text-blue-600" },
    link: { dark: "text-cyan-400 hover:text-cyan-300", light: "text-cyan-600 hover:text-cyan-700" },
  },
  emerald: {
    h1: "from-emerald-400 to-teal-500",
    h2: { dark: "text-emerald-300", light: "text-emerald-600" },
    h3: { dark: "text-teal-300", light: "text-teal-600" },
    strong: { dark: "text-emerald-300", light: "text-emerald-700" },
    em: { dark: "text-teal-300", light: "text-teal-600" },
    link: { dark: "text-emerald-400 hover:text-emerald-300", light: "text-emerald-600 hover:text-emerald-700" },
  },
  amber: {
    h1: "from-amber-400 to-orange-500",
    h2: { dark: "text-amber-300", light: "text-amber-600" },
    h3: { dark: "text-orange-300", light: "text-orange-600" },
    strong: { dark: "text-amber-300", light: "text-amber-700" },
    em: { dark: "text-orange-300", light: "text-orange-600" },
    link: { dark: "text-amber-400 hover:text-amber-300", light: "text-amber-600 hover:text-amber-700" },
  },
  rose: {
    h1: "from-rose-400 to-pink-500",
    h2: { dark: "text-rose-300", light: "text-rose-600" },
    h3: { dark: "text-pink-300", light: "text-pink-600" },
    strong: { dark: "text-rose-300", light: "text-rose-700" },
    em: { dark: "text-pink-300", light: "text-pink-600" },
    link: { dark: "text-rose-400 hover:text-rose-300", light: "text-rose-600 hover:text-rose-700" },
  },
} as const;

function buildComponents(
  color: MarkdownColor,
  size: MarkdownSize,
  isDark: boolean,
): Components {
  const s = sizeConfig[size];
  const c = colorConfig[color];
  const text = isDark ? "text-slate-300" : "text-slate-700";

  return {
    h1: ({ children }) => (
      <h1 className={`${s.h1} font-montserrat bg-linear-to-r ${c.h1} bg-clip-text text-transparent`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${s.h2} font-montserrat ${isDark ? c.h2.dark : c.h2.light}`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${s.h3} font-montserrat ${isDark ? c.h3.dark : c.h3.light}`}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className={`${s.p} ${text}`}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul className={`${s.ul} ${text}`}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={`${s.ol} ${text}`}>{children}</ol>
    ),
    li: ({ children }) => (
      <li className={s.li}>{children}</li>
    ),
    strong: ({ children }) => (
      <strong className={`${s.strong} ${isDark ? c.strong.dark : c.strong.light}`}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`${s.em} ${isDark ? c.em.dark : c.em.light}`}>
        {children}
      </em>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline decoration-2 underline-offset-2 transition-colors ${isDark ? c.link.dark : c.link.light}`}
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr className={`my-2 border-0 h-px ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
    ),
  };
}

export const NoteDiffView: FC<NoteDiffViewProps> = ({
  diffs,
  color = "cyan",
  size = "medium",
}) => {
  const { colorMode } = useTheme();
  const isDark = colorMode === "dark";
  const components = buildComponents(color, size, isDark);

  return (
    <div>
      {diffs.map((op, index) => {
        // Dedent: subtract minimum indentation so that 4+-space-indented
        // nested list items are not mis-parsed as indented code blocks.
        const nonEmpty = op.lines.filter((l) => l.trim().length > 0);
        const minIndent =
          nonEmpty.length > 0
            ? Math.min(
                ...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0),
              )
            : 0;
        const content =
          op.lines.map((l) => l.slice(minIndent)).join("\n") + "\n";

        if (op.type === "insert") {
          return (
            <div
              key={index}
              className={`border-l-4 border-emerald-500 pl-3 pr-1 py-1 my-1 rounded-r ${
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              }`}
            >
              <Markdown
                components={components}
                urlTransform={(url) =>
                  url.startsWith("spell:") ? url : defaultUrlTransform(url)
                }
              >
                {content}
              </Markdown>
            </div>
          );
        }

        if (op.type === "delete") {
          return (
            <div
              key={index}
              className={`border-l-4 border-rose-500 pl-3 pr-1 py-1 my-1 rounded-r opacity-75 ${
                isDark ? "bg-rose-500/10" : "bg-rose-50"
              }`}
            >
              <Markdown
                components={components}
                urlTransform={(url) =>
                  url.startsWith("spell:") ? url : defaultUrlTransform(url)
                }
              >
                {content}
              </Markdown>
            </div>
          );
        }

        // equal — render normally, no highlight
        return (
          <div key={index}>
            <Markdown
              components={components}
              urlTransform={(url) =>
                url.startsWith("spell:") ? url : defaultUrlTransform(url)
              }
            >
              {content}
            </Markdown>
          </div>
        );
      })}
    </div>
  );
};
