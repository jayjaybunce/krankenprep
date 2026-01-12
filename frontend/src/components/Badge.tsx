import React from "react";
import { useTheme } from "../hooks";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  uppercase?: boolean;
}

const Badge = ({ children, variant = "default", uppercase = true }: BadgeProps) => {
  const { colorMode } = useTheme();

  const variants =
    colorMode === "dark"
      ? {
          default:
            "bg-slate-800 text-slate-300 border border-slate-700 shadow-lg shadow-slate-900/50",
          primary:
            "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20",
          success:
            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20",
          warning:
            "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/20",
          danger:
            "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-500/20",
        }
      : {
          default:
            "bg-slate-100 text-slate-700 border border-slate-300 shadow-sm",
          primary:
            "bg-cyan-100 text-cyan-700 border border-cyan-300 shadow-lg shadow-cyan-500/10",
          success:
            "bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-lg shadow-emerald-500/10",
          warning:
            "bg-amber-100 text-amber-700 border border-amber-300 shadow-lg shadow-amber-500/10",
          danger:
            "bg-rose-100 text-rose-700 border border-rose-300 shadow-lg shadow-rose-500/10",
        };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${uppercase ? "uppercase" : ""} tracking-wide ${variants[variant]} transition-all duration-200`}
    >
      {children}
    </span>
  );
};

export default Badge;
