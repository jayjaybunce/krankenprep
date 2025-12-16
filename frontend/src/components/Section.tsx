import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../hooks";

type SectionVariant =
  | "default"
  | "elevated"
  | "gradient"
  | "bordered"
  | "solid"
  | "neon"
  | "outlined"
  | "success"
  | "warning"
  | "danger";

export type SectionProps = {
  variant?: SectionVariant;
  title?: string;
  label?: string;
  tags?: React.ReactNode;
  showPulse?: boolean;
  children: React.ReactNode;
  // defaultExpanded?: boolean;
  collapsible?: boolean;
  className?: string;
  titleBackgroundImage?: string;
  isExpanded: boolean;
  setIsExpanded: () => void;
};

export const Section: React.FC<SectionProps> = ({
  variant = "default",
  title,
  label,
  tags,
  showPulse = false,
  children,
  // defaultExpanded = true,
  collapsible = true,
  className = "",
  titleBackgroundImage,
  isExpanded,
  setIsExpanded,
}) => {
  // const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { colorMode } = useTheme();

  const variants = {
    // Glass morphism sections
    default:
      colorMode === "dark"
        ? `bg-slate-800/70 backdrop-blur-lg border-slate-600 shadow-lg shadow-black/40`
        : `bg-white/70 backdrop-blur-sm border-slate-200 shadow-md shadow-slate-200/40`,

    // Elevated with stronger shadow
    elevated:
      colorMode === "dark"
        ? `bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-xl shadow-cyan-500/15`
        : `bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg shadow-slate-300/40`,

    // Primary gradient
    gradient:
      colorMode === "dark"
        ? `bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600 border-0 shadow-xl shadow-rose-500/20 text-white`
        : `bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 border-0 shadow-xl shadow-cyan-500/20 text-white`,

    // Bordered with accent
    bordered:
      colorMode === "dark"
        ? `bg-slate-800/80 backdrop-blur-sm border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20`
        : `bg-white border-2 border-cyan-400 shadow-md shadow-cyan-400/15`,

    // Solid with no transparency
    solid:
      colorMode === "dark"
        ? `bg-slate-800 border-slate-600 shadow-xl shadow-black/40`
        : `bg-white border-slate-300 shadow-lg shadow-slate-400/25`,

    // Neon glow effect
    neon:
      colorMode === "dark"
        ? `bg-slate-800 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]`
        : `bg-white border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]`,

    // Minimal outlined
    outlined:
      colorMode === "dark"
        ? `bg-transparent border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-800/30`
        : `bg-transparent border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50`,

    // Success themed
    success:
      colorMode === "dark"
        ? `bg-gradient-to-br from-emerald-900/50 to-slate-800 border-2 border-emerald-400/30 shadow-lg shadow-emerald-500/10`
        : `bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 shadow-md shadow-emerald-200/40`,

    // Warning themed
    warning:
      colorMode === "dark"
        ? `bg-gradient-to-br from-amber-900/50 to-slate-800 border-2 border-amber-400/30 shadow-lg shadow-amber-500/10`
        : `bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-md shadow-amber-200/40`,

    // Danger themed
    danger:
      colorMode === "dark"
        ? `bg-gradient-to-br from-rose-900/50 to-slate-800 border-2 border-rose-400/30 shadow-lg shadow-rose-500/10`
        : `bg-gradient-to-br from-rose-50 to-white border border-rose-300 shadow-md shadow-rose-200/40`,
  };

  const headerTextColor =
    variant === "gradient"
      ? "text-white"
      : colorMode === "dark"
        ? "text-slate-200"
        : "text-slate-800";
  const iconColor =
    variant === "gradient"
      ? "text-white/80"
      : colorMode === "dark"
        ? "text-slate-400"
        : "text-slate-600";

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const borderStyle = variant === "gradient" ? "" : "border";
  const dividerColor =
    variant === "gradient"
      ? "border-white/20"
      : colorMode === "dark"
        ? "border-slate-700"
        : "border-slate-200";

  const labelTextColor =
    variant === "gradient"
      ? "text-white"
      : colorMode === "dark"
        ? "text-slate-200"
        : "text-slate-700";

  const labelBgColor =
    variant === "gradient"
      ? colorMode === "dark"
        ? "bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600"
        : "bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600"
      : colorMode === "dark"
        ? "bg-slate-800"
        : "bg-white";

  return (
    <div className={`relative ${className}`}>
      {(label || tags) && (
        <div className="relative h-3">
          {label && (
            <div
              className={`absolute left-6 -top-1.5 px-3 py-1 rounded-md text-sm font-medium ${
                showPulse
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0 shadow-lg shadow-rose-500/30 animate-pulse"
                  : `${labelTextColor} ${labelBgColor} ${
                      variant === "gradient"
                        ? ""
                        : "border " +
                          (colorMode === "dark"
                            ? "border-slate-600"
                            : "border-slate-300")
                    } shadow-sm`
              } z-10`}
            >
              {label}
            </div>
          )}
          {tags && (
            <div className="absolute right-6 -top-1.5 z-10 flex gap-2 items-center">
              {tags}
            </div>
          )}
        </div>
      )}
      <div className={`${variants[variant]} ${borderStyle} rounded-2xl `}>
        {title && (
          <div
            className={`flex items-center justify-between p-4  ${
              collapsible ? "cursor-pointer select-none" : ""
            } ${isExpanded && collapsible ? `border-b ${dividerColor} rounded-b-none` : ""} ${
              titleBackgroundImage
                ? "bg-cover bg-center relative rounded-t-2xl rounded-b-2xl overflow-hidden"
                : ""
            }`}
            style={
              titleBackgroundImage
                ? { backgroundImage: `url(${titleBackgroundImage})` }
                : undefined
            }
            onClick={toggleExpanded}
          >
            {titleBackgroundImage && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-t-2xl" />
            )}
            <h3
              className={`text-lg font-semibold ${
                titleBackgroundImage
                  ? "text-white z-10 relative"
                  : headerTextColor
              }`}
            >
              {title}
            </h3>
            {collapsible && (
              <div
                className={` ${
                  titleBackgroundImage ? "text-white z-10 relative" : iconColor
                }`}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            )}
          </div>
        )}
        <div
          className={`overflow-hidden  ease-in-out ${
            isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Section;
