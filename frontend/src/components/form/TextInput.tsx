import type { FC, InputHTMLAttributes } from "react";
import { useTheme } from "../../hooks";

type InputVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger"
  | "minimal";

type InputSize = "xs" | "sm" | "md" | "lg";

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const TextInput: FC<TextInputProps> = ({
  variant = "default",
  size = "md",
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const { colorMode } = useTheme();

  const sizeStyles = {
    xs: {
      input: "text-xs px-3 py-1.5 h-7",
      icon: "w-3 h-3",
      padding: leftIcon ? "pl-8" : rightIcon ? "pr-8" : "",
      iconPosition: leftIcon ? "left-2.5" : "right-2.5",
    },
    sm: {
      input: "text-sm px-3 py-2 h-9",
      icon: "w-4 h-4",
      padding: leftIcon ? "pl-9" : rightIcon ? "pr-9" : "",
      iconPosition: leftIcon ? "left-3" : "right-3",
    },
    md: {
      input: "text-sm px-4 py-2.5 h-11",
      icon: "w-4 h-4",
      padding: leftIcon ? "pl-11" : rightIcon ? "pr-11" : "",
      iconPosition: leftIcon ? "left-3.5" : "right-3.5",
    },
    lg: {
      input: "text-base px-5 py-3 h-12",
      icon: "w-5 h-5",
      padding: leftIcon ? "pl-12" : rightIcon ? "pr-12" : "",
      iconPosition: leftIcon ? "left-4" : "right-4",
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
            "bg-slate-900/50 backdrop-blur-xl border-2 border-transparent bg-clip-padding hover:bg-slate-900/70 focus:ring-2 focus:ring-transparent [background-image:linear-gradient(to_br,rgb(249,115,22),rgb(225,29,72),rgb(219,39,119))] focus:[background-image:linear-gradient(to_br,rgb(249,115,22),rgb(225,29,72),rgb(219,39,119))] text-slate-50 placeholder-slate-500",
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
            "bg-white/80 backdrop-blur-sm border-2 border-transparent bg-clip-padding hover:bg-white focus:ring-2 focus:ring-transparent [background-image:linear-gradient(to_br,rgb(6,182,212),rgb(37,99,235),rgb(139,92,246))] focus:[background-image:linear-gradient(to_br,rgb(6,182,212),rgb(37,99,235),rgb(139,92,246))] text-slate-900 placeholder-slate-400",
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

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-sm font-semibold mb-2 font-montserrat ${
            colorMode === "dark" ? "text-slate-300" : "text-slate-700"
          } ${error ? (colorMode === "dark" ? "text-rose-400" : "text-rose-600") : ""}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div
            className={`absolute ${currentSize.iconPosition} top-1/2 -translate-y-1/2 ${
              colorMode === "dark" ? "text-slate-500" : "text-slate-400"
            } pointer-events-none`}
          >
            <div className={currentSize.icon}>{leftIcon}</div>
          </div>
        )}

        <input
          {...props}
          disabled={disabled}
          className={`
            w-full border rounded-xl font-medium font-montserrat
            transition-all duration-200
            ${currentSize.input}
            ${currentSize.padding}
            ${variants[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
            ${error ? (colorMode === "dark" ? "!border-rose-500 !ring-rose-500/20" : "!border-rose-500 !ring-rose-500/20") : ""}
            ${className}
          `}
        />

        {rightIcon && (
          <div
            className={`absolute ${currentSize.iconPosition} top-1/2 -translate-y-1/2 ${
              colorMode === "dark" ? "text-slate-500" : "text-slate-400"
            } pointer-events-none`}
          >
            <div className={currentSize.icon}>{rightIcon}</div>
          </div>
        )}
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
