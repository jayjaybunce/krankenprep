/**
 * Skeleton Component
 *
 * Loading skeleton components with shimmer animation effect.
 * Provides various skeleton types for text, cards, and custom shapes.
 *
 * @component
 * @example
 * ```jsx
 * <SkeletonText lines={3} />
 * <SkeletonCard />
 * <Skeleton className="w-32 h-8 rounded-lg" />
 * ```
 */

import React from "react";

/**
 * Base Skeleton Component
 * Use this for custom skeleton shapes
 */
export const Skeleton = ({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "circular" | "rectangular";
}) => {
  const variants = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700
        dark:from-slate-800 dark:via-slate-700 dark:to-slate-800
        animate-shimmer bg-[length:200%_100%]
        ${variants[variant]}
        ${className}
      `}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton Text Component
 * Creates multiple lines of skeleton text with optional varying widths
 */
export const SkeletonText = ({
  lines = 1,
  className = "",
  lastLineWidth = "60%",
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${
            index === lines - 1 && lines > 1 ? `w-[${lastLineWidth}]` : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Title Component
 * For skeleton headings with customizable size
 */
export const SkeletonTitle = ({
  size = "lg",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  const sizes = {
    sm: "h-5 w-32",
    md: "h-6 w-48",
    lg: "h-8 w-64",
    xl: "h-10 w-80",
  };

  return <Skeleton className={`${sizes[size]} ${className}`} />;
};

/**
 * Skeleton Card Component
 * Pre-built skeleton for card layouts with image, title, and text
 */
export const SkeletonCard = ({
  variant = "default",
  showImage = true,
  showBadges = false,
  className = "",
}: {
  variant?: "default" | "elevated" | "bordered" | "neon-gradient";
  showImage?: boolean;
  showBadges?: boolean;
  className?: string;
}) => {
  const variants = {
    default:
      "bg-slate-800/80 backdrop-blur-xl border border-slate-600 shadow-xl shadow-black/50",
    elevated:
      "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-2xl shadow-cyan-500/20",
    bordered:
      "bg-slate-800/90 backdrop-blur-sm border-2 border-slate-700/60 shadow-xl",
    "neon-gradient":
      "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 p-[2px] shadow-[0_0_30px_rgba(100,116,139,0.4)]",
  };

  const CardContent = () => (
    <div className="flex flex-col gap-3">
      {showImage && <Skeleton className="w-full h-40 rounded-lg" />}
      <SkeletonTitle size="lg" className="w-3/4" />
      <SkeletonText lines={3} lastLineWidth="80%" />
      {showBadges && (
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      )}
    </div>
  );

  if (variant === "neon-gradient") {
    return (
      <div className={`${variants[variant]} rounded-2xl ${className}`}>
        <div className="bg-slate-950 rounded-[14px] p-3 w-full h-full">
          <CardContent />
        </div>
      </div>
    );
  }

  return (
    <div className={`${variants[variant]} rounded-2xl p-3 ${className}`}>
      <CardContent />
    </div>
  );
};

/**
 * Skeleton Avatar Component
 * Circular skeleton for user avatars or profile images
 */
export const SkeletonAvatar = ({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return <Skeleton variant="circular" className={`${sizes[size]} ${className}`} />;
};

/**
 * Skeleton Button Component
 * Skeleton for button loading states
 */
export const SkeletonButton = ({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    xs: "h-7 w-20",
    sm: "h-9 w-24",
    md: "h-10 w-28",
    lg: "h-12 w-32",
  };

  return <Skeleton className={`${sizes[size]} rounded-lg ${className}`} />;
};

/**
 * Skeleton List Component
 * Creates a list of skeleton items
 */
export const SkeletonList = ({
  items = 3,
  showAvatar = false,
  className = "",
}: {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Table Component
 * Skeleton for table rows
 */
export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-5 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Image Component
 * Skeleton for image placeholders with parallax or decorative images
 */
export const SkeletonImage = ({
  aspectRatio = "16/9",
  className = "",
}: {
  aspectRatio?: "1/1" | "4/3" | "16/9" | "21/9";
  className?: string;
}) => {
  const ratios = {
    "1/1": "aspect-square",
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-[16/9]",
    "21/9": "aspect-[21/9]",
  };

  return (
    <Skeleton
      className={`w-full ${ratios[aspectRatio]} rounded-lg ${className}`}
    />
  );
};

export default Skeleton;
