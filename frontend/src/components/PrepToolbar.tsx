import { useState, type FC } from "react";
import { Columns2, FileText, Palette } from "lucide-react";
import { usePrepPreferences } from "../hooks";
import type { MarkdownSize, LayoutMode } from "../context/PrepPreferencesContext";
import { ThemePickerModal } from "./modals/ThemePickerModal";

const layoutOptions: { value: LayoutMode; label: string; icon: FC<{ className?: string }> }[] = [
  { value: "split", label: "Split Screen", icon: Columns2 },
  { value: "notes", label: "Notes Fullscreen", icon: FileText },
];

const sizeOptions: { value: MarkdownSize; label: string }[] = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

const HAS_SEEN_THEME_PICKER_KEY = "kp-prep-hasSeenThemePicker";

export const PrepToolbar: FC = () => {
  const { markdownSize, setMarkdownSize, layoutMode, setLayoutMode } = usePrepPreferences();
  const [showThemePicker, setShowThemePicker] = useState(false);
  // A one-time "notice me" pulse for the new theme picker — unlike the
  // Layout buttons' permanent ping (pure decoration), this one's job is
  // discovery: it should go quiet once someone's actually opened the
  // picker, not nag forever after it's done its job.
  const [hasSeenThemePicker, setHasSeenThemePicker] = useState(() => {
    try {
      return localStorage.getItem(HAS_SEEN_THEME_PICKER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const openThemePicker = () => {
    setShowThemePicker(true);
    if (!hasSeenThemePicker) {
      setHasSeenThemePicker(true);
      try {
        localStorage.setItem(HAS_SEEN_THEME_PICKER_KEY, "true");
      } catch {
        // ignore — private browsing / storage disabled; the pulse just
        // reappears next visit, which is a harmless fallback here.
      }
    }
  };

  return (
    <>
      <div
        className="
          fixed right-3 top-1/2 -translate-y-1/2 z-40
          flex flex-col gap-3.5 p-2.5
          bg-gradient-to-b from-slate-900/90 to-slate-800/90
          backdrop-blur-md
          border border-slate-700/50 rounded-xl
          shadow-xl shadow-black/30
          opacity-50 hover:opacity-100
          transition-opacity duration-300
          w-13
        "
      >
        {/* Notes Section */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
            Notes
          </h3>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          {/* Size buttons */}
          <div className="flex flex-col gap-1.5">
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMarkdownSize(opt.value)}
                title={`Size: ${opt.value}`}
                className={`
                  w-8 h-8 rounded-md flex items-center justify-center
                  text-xs font-bold
                  border transition-all duration-200
                  ${
                    markdownSize === opt.value
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:border-slate-600 hover:text-slate-300"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Theme picker opener */}
          <div className="flex flex-col gap-1.5 mt-1">
            <button
              onClick={openThemePicker}
              title="Note theme"
              className="
                relative w-8 h-8 rounded-md flex items-center justify-center
                border transition-all duration-200
                bg-slate-800/50 border-slate-700 text-slate-400
                hover:bg-slate-700/50 hover:border-slate-600 hover:text-slate-300
              "
            >
              <Palette className="w-4 h-4" />
              {!hasSeenThemePicker && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Layout Section */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
            Layout
          </h3>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="flex flex-col gap-1.5">
            {layoutOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setLayoutMode(opt.value)}
                  title={opt.label}
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center
                    border transition-all duration-200
                    ${
                      layoutMode === opt.value
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:border-slate-600 hover:text-slate-300"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/*
        Rendered as a sibling, not a child, of the toolbar rail above: that
        rail has `-translate-y-1/2` (a CSS transform), and a transform on
        an ancestor becomes the containing block for any `position: fixed`
        descendant. Modal relies on `fixed inset-0` to cover the real
        viewport — nested inside the transformed rail, it would instead
        cover only the rail's own tiny box, pinning the dialog to that
        44px-wide sliver instead of centering on screen.
      */}
      <ThemePickerModal isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </>
  );
};
