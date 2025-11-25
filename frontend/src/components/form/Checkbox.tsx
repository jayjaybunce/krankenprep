import type { FC, InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../hooks";

type CheckboxVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger";

type CheckboxSize = "sm" | "md" | "lg";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  label?: string;
  error?: string;
  helperText?: string;
};

export const Checkbox: FC<CheckboxProps> = ({
  variant = "default",
  size = "md",
  label,
  error,
  helperText,
  className = "",
  disabled,
  checked,
  ...props
}) => {
  const { colorMode } = useTheme();

  const sizeStyles = {
    sm: {
      box: "w-4 h-4",
      icon: "w-3 h-3",
      label: "text-sm",
      rounded: "rounded-md",
    },
    md: {
      box: "w-5 h-5",
      icon: "w-4 h-4",
      label: "text-sm",
      rounded: "rounded-lg",
    },
    lg: {
      box: "w-6 h-6",
      icon: "w-5 h-5",
      label: "text-base",
      rounded: "rounded-lg",
    },
  };

  const variants =
    colorMode === "dark"
      ? {
          default: {
            unchecked:
              "bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-900/70",
            checked:
              "bg-cyan-500 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
          },
          elevated: {
            unchecked:
              "bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 shadow-lg shadow-black/50 hover:border-slate-600",
            checked:
              "bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-500 shadow-lg shadow-cyan-500/40",
          },
          neon: {
            unchecked:
              "bg-slate-900 border-2 border-cyan-500/50 hover:border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
            checked:
              "bg-cyan-500 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]",
          },
          "neon-gradient": {
            unchecked:
              "bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-rose-500/50",
            checked:
              "bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600 border-2 border-transparent shadow-[0_0_25px_rgba(251,113,133,0.5)]",
          },
          success: {
            unchecked:
              "bg-emerald-950/50 border-2 border-emerald-700/50 hover:border-emerald-600/50",
            checked:
              "bg-emerald-500 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
          },
          warning: {
            unchecked:
              "bg-amber-950/50 border-2 border-amber-700/50 hover:border-amber-600/50",
            checked:
              "bg-amber-500 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
          },
          danger: {
            unchecked:
              "bg-rose-950/50 border-2 border-rose-700/50 hover:border-rose-600/50",
            checked:
              "bg-rose-500 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
          },
        }
      : {
          default: {
            unchecked:
              "bg-white/80 backdrop-blur-sm border-2 border-slate-300 hover:border-slate-400 hover:bg-white",
            checked:
              "bg-cyan-500 border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
          },
          elevated: {
            unchecked:
              "bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 shadow-lg shadow-slate-300/50 hover:border-slate-400",
            checked:
              "bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30",
          },
          neon: {
            unchecked:
              "bg-white border-2 border-cyan-400 hover:border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.15)]",
            checked:
              "bg-cyan-500 border-2 border-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
          },
          "neon-gradient": {
            unchecked:
              "bg-white/80 backdrop-blur-sm border-2 border-slate-300 hover:border-cyan-400/50",
            checked:
              "bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 border-2 border-transparent shadow-[0_0_20px_rgba(6,182,212,0.4)]",
          },
          success: {
            unchecked:
              "bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-400",
            checked:
              "bg-emerald-500 border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
          },
          warning: {
            unchecked:
              "bg-amber-50 border-2 border-amber-300 hover:border-amber-400",
            checked:
              "bg-amber-500 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
          },
          danger: {
            unchecked:
              "bg-rose-50 border-2 border-rose-300 hover:border-rose-400",
            checked:
              "bg-rose-500 border-2 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
          },
        };

  const currentSize = sizeStyles[size];
  const currentVariant = variants[variant];

  return (
    <div className="w-full">
      <label
        className={`flex items-start gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              ${currentSize.box}
              ${currentSize.rounded}
              flex items-center justify-center
              transition-all duration-300
              ${checked ? currentVariant.checked : currentVariant.unchecked}
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
              ${error ? (colorMode === "dark" ? "!border-rose-500" : "!border-rose-500") : ""}
              ${className}
            `}
          >
            {checked && (
              <Check
                className={`${currentSize.icon} text-white transition-transform duration-200 scale-100`}
                strokeWidth={3}
              />
            )}
          </div>
        </div>

        {label && (
          <div className="flex-1">
            <span
              className={`${currentSize.label} font-medium font-montserrat ${
                colorMode === "dark" ? "text-slate-300" : "text-slate-700"
              } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
            >
              {label}
            </span>
            {(helperText || error) && (
              <p
                className={`mt-1 text-xs font-montserrat ${
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
        )}
      </label>
    </div>
  );
};
