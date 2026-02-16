import type {
  Dispatch,
  FC,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from "react";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "../hooks";

type ModalVariant =
  | "default"
  | "elevated"
  | "neon"
  | "neon-gradient"
  | "success"
  | "warning"
  | "danger";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  title?: string;
  subtitle?: string;
  variant?: ModalVariant;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  actions?: ReactNode;
  centerContent?: boolean;
};

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  isOpen,
  onClose,
  title,
  subtitle,
  variant = "default",
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  actions,
  centerContent = false,
}) => {
  const { colorMode } = useTheme();

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    // "2xl": "max-w-8xl",
    full: "max-w-7xl mx-4",
  };

  const variants = {
    default:
      colorMode === "dark"
        ? "bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl shadow-black/50"
        : "bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl shadow-slate-300/50",

    elevated:
      colorMode === "dark"
        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-2xl shadow-cyan-500/20"
        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-2xl shadow-slate-400/30",

    neon:
      colorMode === "dark"
        ? "bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.5)]"
        : "bg-white/95 backdrop-blur-xl border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.4)]",

    "neon-gradient":
      colorMode === "dark"
        ? "bg-gradient-to-br from-orange-500 via-rose-600 to-pink-600 p-[2px] shadow-[0_0_50px_rgba(251,113,133,0.5)]"
        : "bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-[0_0_40px_rgba(6,182,212,0.4)]",

    success:
      colorMode === "dark"
        ? "bg-gradient-to-br from-emerald-900/60 to-slate-900/95 backdrop-blur-xl border-2 border-emerald-400/40 shadow-2xl shadow-emerald-500/20"
        : "bg-gradient-to-br from-emerald-50 to-white/95 backdrop-blur-xl border border-emerald-300 shadow-2xl shadow-emerald-200/50",

    warning:
      colorMode === "dark"
        ? "bg-gradient-to-br from-amber-900/60 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/40 shadow-2xl shadow-amber-500/20"
        : "bg-gradient-to-br from-amber-50 to-white/95 backdrop-blur-xl border border-amber-300 shadow-2xl shadow-amber-200/50",

    danger:
      colorMode === "dark"
        ? "bg-gradient-to-br from-rose-900/60 to-slate-900/95 backdrop-blur-xl border-2 border-rose-400/40 shadow-2xl shadow-rose-500/20"
        : "bg-gradient-to-br from-rose-50 to-white/95 backdrop-blur-xl border border-rose-300 shadow-2xl shadow-rose-200/50",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose(false);
    }
  };

  const renderContent = () => {
    const content = (
      <>
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`flex items-start justify-between p-6 border-b ${
              colorMode === "dark" ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div className="flex-1">
              {title && (
                <h2
                  className={`text-2xl font-bold font-montserrat ${
                    colorMode === "dark" ? "text-white" : "text-slate-900"
                  }`}
                  style={{ fontFamily: "Montserrat" }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={`mt-1 text-sm ${
                    colorMode === "dark"
                      ? "text-neutral-400"
                      : "text-neutral-600"
                  }`}
                  style={{ fontFamily: "Montserrat" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={() => onClose(false)}
                className={`ml-4 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  colorMode === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={`p-6 overflow-y-auto flex-1 min-h-0 ${centerContent ? "flex items-center justify-center" : ""}`}
        >
          {children}
        </div>

        {/* Footer / Actions */}
        {actions && (
          <div
            className={`flex items-center justify-end gap-3 p-6 border-t ${
              colorMode === "dark" ? "border-slate-800" : "border-slate-200"
            }`}
          >
            {actions}
          </div>
        )}
      </>
    );

    // Special handling for neon-gradient variant
    if (variant === "neon-gradient") {
      return (
        <div
          className={`${variants[variant]} rounded-2xl transition-all duration-500 flex flex-col h-full`}
        >
          <div
            className={`${
              colorMode === "dark" ? "bg-slate-950" : "bg-white"
            } rounded-[14px] w-full h-full transition-colors duration-500 flex flex-col`}
          >
            {content}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${variants[variant]} border rounded-2xl transition-all duration-500 flex flex-col h-full`}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          colorMode === "dark"
            ? "bg-black/80 backdrop-blur-sm"
            : "bg-black/40 backdrop-blur-sm"
        }`}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeStyles[size]} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300`}
      >
        {renderContent()}
      </div>
    </div>
  );
};
