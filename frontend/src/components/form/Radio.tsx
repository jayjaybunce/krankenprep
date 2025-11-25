import type { FC, InputHTMLAttributes } from "react";
import { useTheme } from "../../hooks";

type RadioVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger";

type RadioSize = "sm" | "md" | "lg";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: RadioVariant;
  size?: RadioSize;
  label?: string;
  error?: string;
  helperText?: string;
  orientation?: "vertical" | "horizontal";
};

export const Radio: FC<RadioProps> = ({
  options,
  value,
  onChange,
  variant = "default",
  size = "md",
  label,
  error,
  helperText,
  orientation = "vertical",
  className = "",
  disabled,
  name,
  ...props
}) => {
  const { colorMode } = useTheme();

  const sizeStyles = {
    sm: {
      radio: "w-4 h-4",
      dot: "w-2 h-2",
      label: "text-sm",
    },
    md: {
      radio: "w-5 h-5",
      dot: "w-2.5 h-2.5",
      label: "text-sm",
    },
    lg: {
      radio: "w-6 h-6",
      dot: "w-3 h-3",
      label: "text-base",
    },
  };

  const variants =
    colorMode === "dark"
      ? {
          default: {
            unchecked:
              "bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-900/70",
            checked:
              "bg-slate-900/50 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
            dot: "bg-cyan-500",
          },
          elevated: {
            unchecked:
              "bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 shadow-lg shadow-black/50 hover:border-slate-600",
            checked:
              "bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500 shadow-lg shadow-cyan-500/40",
            dot: "bg-gradient-to-br from-cyan-500 to-blue-600",
          },
          neon: {
            unchecked:
              "bg-slate-900 border-2 border-cyan-500/50 hover:border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
            checked:
              "bg-slate-900 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]",
            dot: "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]",
          },
          "neon-gradient": {
            unchecked:
              "bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-rose-500/50",
            checked:
              "bg-slate-900/50 border-2 border-transparent shadow-[0_0_25px_rgba(251,113,133,0.5)] [background-image:linear-gradient(to_br,rgb(249,115,22),rgb(225,29,72),rgb(219,39,119))]",
            dot: "bg-white",
          },
          success: {
            unchecked:
              "bg-emerald-950/50 border-2 border-emerald-700/50 hover:border-emerald-600/50",
            checked:
              "bg-emerald-950/50 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
            dot: "bg-emerald-500",
          },
          warning: {
            unchecked:
              "bg-amber-950/50 border-2 border-amber-700/50 hover:border-amber-600/50",
            checked:
              "bg-amber-950/50 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
            dot: "bg-amber-500",
          },
          danger: {
            unchecked:
              "bg-rose-950/50 border-2 border-rose-700/50 hover:border-rose-600/50",
            checked:
              "bg-rose-950/50 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
            dot: "bg-rose-500",
          },
        }
      : {
          default: {
            unchecked:
              "bg-white/80 backdrop-blur-sm border-2 border-slate-300 hover:border-slate-400 hover:bg-white",
            checked:
              "bg-white/80 border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
            dot: "bg-cyan-500",
          },
          elevated: {
            unchecked:
              "bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 shadow-lg shadow-slate-300/50 hover:border-slate-400",
            checked:
              "bg-gradient-to-br from-white to-slate-50 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30",
            dot: "bg-gradient-to-br from-cyan-500 to-blue-600",
          },
          neon: {
            unchecked:
              "bg-white border-2 border-cyan-400 hover:border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.15)]",
            checked:
              "bg-white border-2 border-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
            dot: "bg-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
          },
          "neon-gradient": {
            unchecked:
              "bg-white/80 backdrop-blur-sm border-2 border-slate-300 hover:border-cyan-400/50",
            checked:
              "bg-white/80 border-2 border-transparent shadow-[0_0_20px_rgba(6,182,212,0.4)] [background-image:linear-gradient(to_br,rgb(6,182,212),rgb(37,99,235),rgb(139,92,246))]",
            dot: "bg-white",
          },
          success: {
            unchecked:
              "bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-400",
            checked:
              "bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
            dot: "bg-emerald-500",
          },
          warning: {
            unchecked:
              "bg-amber-50 border-2 border-amber-300 hover:border-amber-400",
            checked:
              "bg-amber-50 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
            dot: "bg-amber-500",
          },
          danger: {
            unchecked:
              "bg-rose-50 border-2 border-rose-300 hover:border-rose-400",
            checked:
              "bg-rose-50 border-2 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
            dot: "bg-rose-500",
          },
        };

  const currentSize = sizeStyles[size];
  const currentVariant = variants[variant];

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-sm font-semibold mb-3 font-montserrat ${
            colorMode === "dark" ? "text-slate-300" : "text-slate-700"
          } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
        >
          {label}
        </label>
      )}

      <div
        className={`flex gap-4 ${orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"}`}
      >
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`flex items-start gap-3 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => !isDisabled && onChange?.(option.value)}
                  disabled={isDisabled}
                  className="sr-only"
                  {...props}
                />
                <div
                  className={`
                    ${currentSize.radio}
                    rounded-full
                    flex items-center justify-center
                    transition-all duration-300
                    ${isChecked ? currentVariant.checked : currentVariant.unchecked}
                    ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                    ${error ? (colorMode === "dark" ? "!border-rose-500" : "!border-rose-500") : ""}
                    ${className}
                  `}
                >
                  {isChecked && (
                    <div
                      className={`
                        ${currentSize.dot}
                        rounded-full
                        ${currentVariant.dot}
                        transition-transform duration-200 scale-100
                      `}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <span
                  className={`${currentSize.label} font-medium font-montserrat ${
                    colorMode === "dark" ? "text-slate-300" : "text-slate-700"
                  } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
                >
                  {option.label}
                </span>
                {option.description && (
                  <p
                    className={`mt-0.5 text-xs font-montserrat ${
                      colorMode === "dark" ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {(helperText || error) && (
        <p
          className={`mt-2 text-xs font-montserrat ${
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
