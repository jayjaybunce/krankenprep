/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and modern styling.
 * Features gradient backgrounds, glow effects, and smooth transitions.
 *
 * @component
 * @example
 * ```jsx
 * <Button variant="primary" size="md" icon={<Plus />} onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */

import React from "react";

/**
 * Button Props
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'} [variant='primary'] - Visual style variant
 * @property {'xs' | 'sm' | 'md' | 'lg'} [size='md'] - Button size
 * @property {React.ReactNode} [icon] - Optional icon to display before the text
 * @property {React.ReactNode} children - Button content/text
 * @property {() => void} [onClick] - Click handler function
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Button Component
 *
 * Variants:
 * - primary: Cyan to blue gradient with glow effect
 * - secondary: Solid slate gray with subtle shadow
 * - danger: Rose to red gradient with glow effect
 * - success: Emerald to green gradient with glow effect
 * - warning: Amber to orange gradient with glow effect
 * - ghost: Semi-transparent with backdrop blur
 * - outline: Transparent with cyan border
 *
 * Sizes:
 * - xs: Extra small (text-xs, px-3, py-1.5)
 * - sm: Small (text-sm, px-4, py-2)
 * - md: Medium (text-sm, px-5, py-2.5)
 * - lg: Large (text-base, px-6, py-3)
 */
const Button = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "ghost"
    | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 border border-cyan-400/20",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-lg shadow-slate-900/50 border border-slate-700",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 border border-rose-400/20",
    success:
      "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 border border-emerald-400/20",
    warning:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 border border-amber-400/20",
    ghost:
      "bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600 backdrop-blur-sm",
    outline:
      "bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-400 shadow-lg shadow-cyan-500/10",
  };

  const sizes = {
    xs: "text-xs px-3 py-1.5",
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 
        rounded-lg font-semibold 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
