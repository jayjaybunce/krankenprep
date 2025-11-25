import type { Dispatch, FC, PropsWithChildren, SetStateAction } from "react";
import { useTheme } from "../hooks";

type CardVariant =
  | "default"
  | "elevated"
  | "gradient"
  | "bordered"
  | "solid"
  | "neon"
  | "neon-gradient"
  | "outlined"
  | "success"
  | "warning"
  | "danger";

export type CardProps = {
  variant?: CardVariant;
  hover?: boolean;
  glow?: boolean;
  isActive?: boolean;
  onClick: Dispatch<SetStateAction<boolean>>;
};

export const Card: FC<PropsWithChildren<CardProps>> = ({
  children,
  variant = "default",
  hover = true,
  glow = false,
  isActive = false,
  onClick = () => null,
}) => {
  const { colorMode } = useTheme();

  const variants = {
    // Glass morphism cards
    default:
      colorMode === "dark"
        ? `bg-slate-800/80 backdrop-blur-xl border-slate-600 shadow-xl shadow-black/50`
        : `bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-200/50`,

    // Elevated with stronger shadow
    elevated:
      colorMode === "dark"
        ? `bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-2xl shadow-cyan-500/20`
        : `bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xl shadow-slate-300/50`,

    // Primary gradient
    gradient:
      colorMode === "dark"
        ? `bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600 border-0 shadow-2xl shadow-rose-500/30 text-white`
        : `bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 border-0 shadow-2xl shadow-cyan-500/30 text-white`,

    // Bordered with accent
    bordered:
      colorMode === "dark"
        ? `bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/25`
        : `bg-white border-2 border-cyan-400 shadow-lg shadow-cyan-400/20`,

    // Solid with no transparency
    solid:
      colorMode === "dark"
        ? `bg-slate-800 border-slate-600 shadow-2xl shadow-black/50`
        : `bg-white border-slate-300 shadow-xl shadow-slate-400/30`,

    // Neon glow effect
    neon:
      colorMode === "dark"
        ? `bg-slate-800 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]`
        : `bg-white border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]`,

    // Neon gradient effect - gradient border with opaque background
    "neon-gradient":
      colorMode === "dark"
        ? `bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600 p-[2px] shadow-[0_0_30px_rgba(251,113,133,0.4)]`
        : `bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.3)]`,

    // Outlined minimal
    outlined:
      colorMode === "dark"
        ? `bg-transparent border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-800/40`
        : `bg-transparent border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50`,

    // Success themed
    success:
      colorMode === "dark"
        ? `bg-gradient-to-br from-emerald-900/60 to-slate-800 border-2 border-emerald-400/40 shadow-xl shadow-emerald-500/15`
        : `bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 shadow-lg shadow-emerald-200/50`,

    // Warning themed
    warning:
      colorMode === "dark"
        ? `bg-gradient-to-br from-amber-900/60 to-slate-800 border-2 border-amber-400/40 shadow-xl shadow-amber-500/15`
        : `bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-lg shadow-amber-200/50`,

    // Danger themed
    danger:
      colorMode === "dark"
        ? `bg-gradient-to-br from-rose-900/60 to-slate-800 border-2 border-rose-400/40 shadow-xl shadow-rose-500/15`
        : `bg-gradient-to-br from-rose-50 to-white border border-rose-300 shadow-lg shadow-rose-200/50`,
  };

  const hoverEffect = hover
    ? "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
    : "transition-all duration-300";
  const glowEffect = glow ? "animate-pulse" : "";

  const activeEffect = isActive ? "scale-[1.02] -translate-y-1" : "";

  // Special handling for neon-gradient variant
  if (variant === "neon-gradient") {
    const neonGlowHover =
      colorMode === "dark"
        ? "hover:shadow-[0_0_50px_rgba(251,113,133,0.6)]"
        : "hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]";

    return (
      <div
        className={`${variants[variant]} ${neonGlowHover} rounded-2xl ${hoverEffect} ${glowEffect} ${activeEffect} transition-[transform,box-shadow,background-image] duration-500`}
        onClick={() => onClick(!isActive)}
      >
        <div
          className={`${
            colorMode === "dark" ? "bg-slate-950" : "bg-white"
          } rounded-[14px] p-3 w-full h-full transition-colors duration-500`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${variants[variant]} border rounded-2xl p-3 ${hoverEffect} ${glowEffect} ${activeEffect} transition-[transform,box-shadow,background-image,border-color,background-color] duration-500`}
      onClick={() => onClick(!isActive)}
    >
      {children}
    </div>
  );
};
