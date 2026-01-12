import type { FC, TextareaHTMLAttributes } from "react";
import { useTheme } from "../../hooks";

type TextareaVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger"
  | "minimal";

type TextareaSize = "sm" | "md" | "lg";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> & {
  variant?: TextareaVariant;
  size?: TextareaSize;
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
};

export const Textarea: FC<TextareaProps> = ({
  variant = "default",
  size = "md",
  label,
  error,
  helperText,
  showCharCount = false,
  maxLength,
  className = "",
  disabled,
  value,
  ...props
}) => {
  const { colorMode } = useTheme();

  const sizeStyles = {
    sm: {
      textarea: "text-sm px-3 py-2 min-h-[80px]",
    },
    md: {
      textarea: "text-sm px-4 py-2.5 min-h-[120px]",
    },
    lg: {
      textarea: "text-base px-5 py-3 min-h-[160px]",
    },
  };

  const variants =
    colorMode === "dark"
      ? {
          default:
            "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-50 placeholder-slate-500 hover:bg-slate-900/70 hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          elevated:
            "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-slate-50 placeholder-slate-500 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          neon: "bg-slate-900 border border-cyan-500 text-slate-50 placeholder-slate-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus:shadow-[0_0_40px_rgba(6,182,212,0.6)] focus:border-cyan-400",
          "neon-gradient":
            "bg-slate-900/50 backdrop-blur-xl border-2 border-transparent bg-clip-padding hover:bg-slate-900/70 focus:ring-2 focus:ring-transparent text-slate-50 placeholder-slate-500",
          success:
            "bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30 text-emerald-50 placeholder-emerald-500/50 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          warning:
            "bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/30 text-amber-50 placeholder-amber-500/50 hover:border-amber-500/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
          danger:
            "bg-gradient-to-br from-rose-950/50 to-slate-900 border border-rose-500/30 text-rose-50 placeholder-rose-500/50 hover:border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20",
          minimal:
            "bg-transparent border-slate-700 text-slate-300 placeholder-slate-600 hover:bg-slate-900/30 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
        }
      : {
          default:
            "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          elevated:
            "bg-gradient-to-br from-white to-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 shadow-xl shadow-slate-300/50 hover:shadow-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
          neon: "bg-white border-2 border-cyan-500 text-slate-900 placeholder-slate-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] focus:shadow-[0_0_35px_rgba(6,182,212,0.5)] focus:border-cyan-600",
          "neon-gradient":
            "bg-white/80 backdrop-blur-sm border-2 border-transparent bg-clip-padding hover:bg-white focus:ring-2 focus:ring-transparent text-slate-900 placeholder-slate-400",
          success:
            "bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 text-emerald-900 placeholder-emerald-400 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          warning:
            "bg-gradient-to-br from-amber-50 to-white border border-amber-300 text-amber-900 placeholder-amber-400 hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
          danger:
            "bg-gradient-to-br from-rose-50 to-white border border-rose-300 text-rose-900 placeholder-rose-400 hover:border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20",
          minimal:
            "bg-transparent border-slate-300 text-slate-700 placeholder-slate-500 hover:bg-slate-50 hover:border-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
        };

  const currentSize = sizeStyles[size];
  const charCount = value ? value.toString().length : 0;

  return (
    <div className="w-full h-full flex flex-col">
      {label && (
        <label
          className={`block text-sm font-semibold mb-2 font-montserrat shrink-0 ${
            colorMode === "dark" ? "text-slate-300" : "text-slate-700"
          } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
        >
          {label}
        </label>
      )}

      <div className="flex-1 flex flex-col">
        <textarea
          {...props}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full border rounded-xl font-medium font-montserrat
            transition-all duration-200
            h-full
            resize-y
            ${currentSize.textarea}
            ${variants[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed resize-none" : "cursor-text"}
            ${error ? (colorMode === "dark" ? "!border-rose-500 !ring-rose-500/20" : "!border-rose-500 !ring-rose-500/20") : ""}
            ${className}
          `}
        />

        {showCharCount && maxLength && (
          <div
            className={`absolute bottom-3 right-3 text-xs font-montserrat ${
              charCount > maxLength
                ? colorMode === "dark"
                  ? "text-rose-400"
                  : "text-rose-600"
                : colorMode === "dark"
                  ? "text-slate-500"
                  : "text-slate-400"
            }`}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>

      {(helperText || error) && (
        <p
          className={`mt-2 text-xs font-montserrat shrink-0 ${
            error
              ? colorMode === "dark"
                ? "text-rose-400"
                : "text-rose-600"
              : colorMode === "dark"
                ? "text-slate-500"
                : "text-slate-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
