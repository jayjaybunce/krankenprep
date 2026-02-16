import type { FC } from "react";
import { LayoutGrid, Columns } from "lucide-react";
import { usePrepPreferences } from "../hooks";
import type {
  MarkdownSize,
  MarkdownColor,
} from "../context/PrepPreferencesContext";

const sizeOptions: { value: MarkdownSize; label: string }[] = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

const colorOptions: {
  value: MarkdownColor;
  tailwind: string;
  label: string;
}[] = [
  { value: "cyan", tailwind: "bg-cyan-500", label: "Cyan" },
  { value: "emerald", tailwind: "bg-emerald-500", label: "Emerald" },
  { value: "amber", tailwind: "bg-amber-500", label: "Amber" },
  { value: "rose", tailwind: "bg-rose-500", label: "Rose" },
];

export const PrepToolbar: FC = () => {
  const {
    markdownSize,
    setMarkdownSize,
    markdownColor,
    setMarkdownColor,
    layoutOption1,
    setLayoutOption1,
    layoutOption2,
    setLayoutOption2,
  } = usePrepPreferences();

  return (
    <div
      className="
        fixed right-3 top-1/2 -translate-y-1/2 z-40
        flex flex-col gap-3 p-2
        bg-gradient-to-b from-slate-900/90 to-slate-800/90
        backdrop-blur-md
        border border-slate-700/50 rounded-xl
        shadow-xl shadow-black/30
        opacity-50 hover:opacity-100
        transition-opacity duration-300
        w-11
      "
    >
      {/* Notes Section */}
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
          Notes
        </h3>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Size buttons */}
        <div className="flex flex-col gap-1">
          {sizeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMarkdownSize(opt.value)}
              title={`Size: ${opt.value}`}
              className={`
                w-7 h-7 rounded-md flex items-center justify-center
                text-[10px] font-bold
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

        {/* Color buttons */}
        <div className="flex flex-col gap-1 mt-1">
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMarkdownColor(opt.value)}
              title={`Theme: ${opt.label}`}
              className={`
                w-7 h-7 rounded-md flex items-center justify-center
                border transition-all duration-200
                ${
                  markdownColor === opt.value
                    ? "border-white/70 scale-110 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    : "border-slate-700 hover:border-slate-500 hover:scale-105"
                }
              `}
            >
              <span className={`w-3.5 h-3.5 rounded-full ${opt.tailwind}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Layout Section */}
      {/* <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
          Layout
        </h3>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <button
          onClick={() => setLayoutOption1(!layoutOption1)}
          title="Layout Option 1"
          className={`
            w-7 h-7 rounded-md flex items-center justify-center
            border transition-all duration-200
            ${
              layoutOption1
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                : "bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-700/50 hover:border-slate-600 hover:text-slate-400"
            }
          `}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setLayoutOption2(!layoutOption2)}
          title="Layout Option 2"
          className={`
            w-7 h-7 rounded-md flex items-center justify-center
            border transition-all duration-200
            ${
              layoutOption2
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                : "bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-700/50 hover:border-slate-600 hover:text-slate-400"
            }
          `}
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
      </div> */}
    </div>
  );
};
