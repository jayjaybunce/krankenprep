import { useState, useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../hooks";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "right" | "left" | "top" | "bottom";
}

const GAP = 10;

const Tooltip: FC<TooltipProps> = ({ content, children, side = "right" }) => {
  const { colorMode } = useTheme();
  const dark = colorMode === "dark";
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    if (side === "right")  setPos({ top: r.top + r.height / 2, left: r.right + GAP });
    if (side === "left")   setPos({ top: r.top + r.height / 2, left: r.left - GAP });
    if (side === "top")    setPos({ top: r.top - GAP,           left: r.left + r.width / 2 });
    if (side === "bottom") setPos({ top: r.bottom + GAP,        left: r.left + r.width / 2 });
  };

  const transforms: Record<string, string> = {
    right:  "translateY(-50%)",
    left:   "translate(-100%, -50%)",
    top:    "translate(-50%, -100%)",
    bottom: "translateX(-50%)",
  };

  const arrowClass: Record<string, string> = {
    right:  "absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b",
    left:   "absolute -right-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r",
    top:    "absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r",
    bottom: "absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-t border-l",
  };

  const bubbleStyle = dark
    ? "bg-slate-900 border border-slate-700/60 text-slate-200 shadow-lg shadow-slate-950/60"
    : "bg-white border border-slate-200 text-slate-700 shadow-lg shadow-slate-200/60";

  const arrowStyle = dark
    ? "bg-slate-900 border-slate-700/60"
    : "bg-white border-slate-200";

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos && createPortal(
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform: transforms[side],
            zIndex: 9999,
          }}
          className={`pointer-events-none px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${bubbleStyle}`}
        >
          <span className={`${arrowClass[side]} ${arrowStyle}`} />
          {content}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default Tooltip;
