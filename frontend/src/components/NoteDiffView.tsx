import type { CSSProperties, FC } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import { defaultUrlTransform } from "react-markdown";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks";
import type { DiffOp } from "../api/queryHooks";
import { noteFontScale, marginStyle, type MarkdownSize } from "../data/noteTypography";
import { noteThemes, themeCssVars, DEFAULT_THEME_ID, type ThemeId } from "../data/noteThemes";

type NoteDiffViewProps = {
  diffs: DiffOp[];
  theme?: ThemeId;
  size?: MarkdownSize;
};

function buildComponents(
  size: MarkdownSize,
  headingFont: CSSProperties,
  spacingScale: number,
): Components {
  const s = noteFontScale[size];
  const margin = (el: Parameters<typeof marginStyle>[1]) => marginStyle(size, el, spacingScale);
  const linkClass =
    "font-medium underline decoration-2 underline-offset-2 transition-colors text-(--nt-link) hover:text-(--nt-link-hover)";

  return {
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
    p: ({ children }) => (
      <p className={`${s.p} text-(--nt-body)`} style={margin("p")}>
        {children}
      </p>
    ),
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
    strong: ({ children }) => (
      <strong className={`font-bold ${s.strong} text-(--nt-strong)`}>{children}</strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${s.em} text-(--nt-em)`}>{children}</em>
    ),
    a: ({ href, children }) => {
      const match = href?.match(/spell:(\d+)\/name:([^|]+)/);
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
    hr: () => <hr className="border-0 h-px bg-(--nt-hr)" style={margin("hr")} />,
  };
}

// Split lines into groups whenever indentation resets to less than the first
// non-empty line's indentation. This prevents 4+-space indented sub-bullets
// from being stranded in the same block as 0-indent lines, which would cause
// CommonMark to treat the indented lines as code blocks.
function splitAtIndentResets(lines: string[]): string[][] {
  const getIndent = (l: string): number | null =>
    l.trim().length > 0 ? (l.match(/^(\s*)/)?.[1].length ?? 0) : null;

  const groups: string[][] = [[]];
  let baseIndent: number | null = null;

  for (const line of lines) {
    const indent = getIndent(line);
    if (indent !== null && baseIndent === null) {
      baseIndent = indent;
    }
    if (indent !== null && baseIndent !== null && indent < baseIndent) {
      groups.push([line]);
      baseIndent = indent;
    } else {
      groups[groups.length - 1].push(line);
    }
  }

  return groups.filter((g) => g.some((l) => l.trim().length > 0));
}

function buildContent(lines: string[]): string {
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const minIndent =
    nonEmpty.length > 0
      ? Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0))
      : 0;
  return lines.map((l) => l.slice(minIndent)).join("\n") + "\n";
}

export const NoteDiffView: FC<NoteDiffViewProps> = ({
  diffs,
  theme: themeId = DEFAULT_THEME_ID,
  size = "medium",
}) => {
  const { colorMode } = useTheme();
  const isDark = colorMode === "dark";
  const theme = noteThemes[themeId];
  const palette = isDark ? theme.dark : theme.light;
  const headingFont = { fontFamily: theme.fonts.heading };
  const bodyFont = { fontFamily: theme.fonts.body };
  const components = buildComponents(size, headingFont, theme.typography.spacingScale);

  const urlTransform = (url: string) =>
    url.startsWith("spell:") ? url : defaultUrlTransform(url);

  // Insert/delete highlight colors are a fixed green/red git-diff
  // convention, not part of the note theme — they mean the same thing
  // regardless of which typography theme is active.
  return (
    <div
      style={
        {
          ...themeCssVars(palette),
          ...bodyFont,
          lineHeight: theme.typography.lineHeight,
          letterSpacing: theme.typography.letterSpacing,
        } as CSSProperties
      }
    >
      {diffs.map((op, index) => {
        const groups = splitAtIndentResets(op.lines);

        if (op.type === "insert") {
          return (
            <div
              key={index}
              className={`border-l-4 border-emerald-500 pl-3 pr-1 py-1 my-1 rounded-r ${
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              }`}
            >
              {groups.map((g, gi) => (
                <Markdown key={gi} components={components} urlTransform={urlTransform}>
                  {buildContent(g)}
                </Markdown>
              ))}
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
              {groups.map((g, gi) => (
                <Markdown key={gi} components={components} urlTransform={urlTransform}>
                  {buildContent(g)}
                </Markdown>
              ))}
            </div>
          );
        }

        // equal — render normally, no highlight
        return (
          <div key={index}>
            {groups.map((g, gi) => (
              <Markdown key={gi} components={components} urlTransform={urlTransform}>
                {buildContent(g)}
              </Markdown>
            ))}
          </div>
        );
      })}
    </div>
  );
};
