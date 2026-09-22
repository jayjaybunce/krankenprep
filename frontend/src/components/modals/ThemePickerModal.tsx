import { useEffect, type CSSProperties, type FC } from "react";
import { Check } from "lucide-react";
import { Modal } from "../Modal";
import { useTheme, usePrepPreferences } from "../../hooks";
import {
  noteThemeList,
  themeCssVars,
  mergeGoogleFonts,
  buildGoogleFontsHref,
} from "../../data/noteThemes";

type ThemePickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// The app only ever loads the *active* theme's font (one <link>, swapped
// by PrepPreferencesProvider as markdownTheme changes) — but this modal
// previews every theme at once, so every non-active tile would render in
// a fallback font until clicked. Computed once at module scope since the
// theme roster is static.
const PREVIEW_FONTS_HREF = buildGoogleFontsHref(
  mergeGoogleFonts(noteThemeList.flatMap((t) => t.fonts.googleFonts)),
);

// A vertical 44px toolbar rail has no room to convey a typography theme —
// unlike the old 4-color swatch it replaces, a theme is fonts + spacing +
// card chrome, not one dot's worth of information. This shows each theme
// as a small live sample instead: real fonts, real palette, real card
// chrome, rendered exactly as a note using it would look right now.
export const ThemePickerModal: FC<ThemePickerModalProps> = ({ isOpen, onClose }) => {
  const { colorMode } = useTheme();
  const { markdownTheme, setMarkdownTheme } = usePrepPreferences();
  const isDark = colorMode === "dark";

  // Prefetch every theme's font while open, via its own <link> rather than
  // reusing the provider's single active-theme tag — that tag is meant to
  // reset back to just the active theme once this closes, which this
  // effect's own cleanup (removing its tag) leaves untouched.
  useEffect(() => {
    if (!isOpen || !PREVIEW_FONTS_HREF) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = PREVIEW_FONTS_HREF;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Note Theme"
      subtitle="Pick the typography, spacing, and card style notes are displayed in."
      size="xl"
    >
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {noteThemeList.map((t) => {
          const palette = isDark ? t.dark : t.light;
          const isSelected = markdownTheme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setMarkdownTheme(t.id)}
              style={themeCssVars(palette) as CSSProperties}
              className={`relative text-left p-4 ${t.card.radius} ${t.card.shadow} border-2 bg-(--nt-card-bg) transition-transform duration-150 hover:scale-[1.02] ${
                isSelected ? "border-cyan-500" : "border-(--nt-card-border)"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}

              <h3
                className="text-xl font-bold mb-1 bg-clip-text text-transparent"
                style={{
                  fontFamily: t.fonts.heading,
                  backgroundImage: `linear-gradient(to right, var(--nt-heading-from), var(--nt-heading-to))`,
                }}
              >
                {t.name}
              </h3>
              <p
                className="text-sm mb-2 text-(--nt-body)"
                style={{ fontFamily: t.fonts.body, lineHeight: t.typography.lineHeight }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-sm font-medium underline decoration-2 underline-offset-2 text-(--nt-link)"
                  style={{ fontFamily: t.fonts.body }}
                >
                  Example link
                </span>
                <code className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-(--nt-blockquote-bg) text-(--nt-link) border border-(--nt-blockquote-border)">
                  const x = 1
                </code>
              </div>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default ThemePickerModal;
