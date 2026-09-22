import { useEffect, useRef, useState, type FC } from "react";
import { GripHorizontal, Maximize2, MapPinned, Minus } from "lucide-react";
import { useTheme } from "../hooks";
import PlanViewer from "./Pages/PlanViewer";
import type { RaidPlan } from "../api/queryHooks";

const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 420;
const MIN_WIDTH = 340;
const MIN_HEIGHT = 240;

type RaidplanFloatingViewerProps = {
  // Only mounted when there's actually a plan linked (i.e. this is
  // meaningless if false — the parent should stop rendering this entirely).
  isVisible: boolean;
  raidplanShareId: string | null;
  isLoading: boolean;
  planData?: RaidPlan;
  tabId?: string | null;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
};

type Rect = { x: number; y: number; width: number; height: number };

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

// Desktop-only picture-in-picture style viewer. Notes Fullscreen hides the
// sections column on desktop, which is where the sticky raidplan viewer
// normally lives, so raidplan links have nowhere to render. This gives them
// a draggable/resizable floating window instead, toggled from a small pill
// so it can be tucked away without losing the association entirely.
export const RaidplanFloatingViewer: FC<RaidplanFloatingViewerProps> = ({
  isVisible,
  raidplanShareId,
  isLoading,
  planData,
  tabId,
  onClose,
  onTabChange,
}) => {
  const { colorMode } = useTheme();
  const isDark = colorMode === "dark";
  const [open, setOpen] = useState(true);
  const [rect, setRect] = useState<Rect>(() => ({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    x: Math.max(24, window.innerWidth - DEFAULT_WIDTH - 24),
    y: Math.max(24, window.innerHeight - DEFAULT_HEIGHT - 96),
  }));
  const dragState = useRef<{
    startX: number;
    startY: number;
    startRect: Rect;
    mode: "move" | "resize";
  } | null>(null);

  // A newly clicked raidplan link should surface the window even if it was
  // previously minimized to the pill. Adjusted during render (rather than
  // in an effect) per the "storing information from previous renders"
  // pattern — avoids an extra render pass just to flip `open`.
  const [prevShareId, setPrevShareId] = useState(raidplanShareId);
  if (raidplanShareId !== prevShareId) {
    setPrevShareId(raidplanShareId);
    if (raidplanShareId) setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const startDrag = (e: React.MouseEvent, mode: "move" | "resize") => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, startRect: rect, mode };
    document.body.style.cursor = mode === "move" ? "grabbing" : "nwse-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;

      if (drag.mode === "move") {
        setRect((r) => ({
          ...r,
          x: clamp(drag.startRect.x + dx, 0, window.innerWidth - r.width),
          y: clamp(drag.startRect.y + dy, 0, window.innerHeight - r.height),
        }));
      } else {
        setRect((r) => ({
          ...r,
          width: clamp(
            drag.startRect.width + dx,
            MIN_WIDTH,
            window.innerWidth - drag.startRect.x,
          ),
          height: clamp(
            drag.startRect.height + dy,
            MIN_HEIGHT,
            window.innerHeight - drag.startRect.y,
          ),
        }));
      }
    };
    const onUp = () => {
      dragState.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      // PlanViewer only recomputes its scale on window resize events, not
      // on its container resizing — nudge it after a resize drag ends.
      window.dispatchEvent(new Event("resize"));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block">
      {/* Pill: always present while a plan is linked, toggles the window */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full font-montserrat text-sm font-semibold shadow-xl transition-all duration-200 border ${
          open
            ? isDark
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
              : "bg-cyan-50 border-cyan-500 text-cyan-700"
            : isDark
              ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
        }`}
      >
        <MapPinned className="w-4 h-4" />
        {open ? "Hide Raid Plan" : "View Raid Plan"}
      </button>

      {open && (
        <div
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }}
          className={`fixed z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-50 border-slate-300"
          }`}
        >
          {/* Title bar / drag handle */}
          <div
            onMouseDown={(e) => startDrag(e, "move")}
            className={`flex items-center justify-between gap-2 px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing border-b ${
              isDark
                ? "border-slate-700 bg-slate-800/80"
                : "border-slate-300 bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <GripHorizontal
                className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              />
              <span
                className={`font-montserrat font-semibold text-xs truncate ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {planData?.name || "Raid Plan"}
              </span>
            </div>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
              className={`p-1 rounded-md transition-colors shrink-0 ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  : "text-slate-500 hover:text-black hover:bg-slate-200"
              }`}
              aria-label="Minimize raid plan"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"
                    />
                  ))}
                </div>
                <div className="aspect-video w-full rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            ) : planData ? (
              <PlanViewer
                viewUrl={`${planData.sequence}/${planData.share_id}`}
                onClose={onClose}
                onTabChange={onTabChange}
                tabs={planData.content}
                startingId={tabId}
              />
            ) : null}
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={(e) => startDrag(e, "resize")}
            className={`absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}
          >
            <Maximize2 className="w-3 h-3 rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RaidplanFloatingViewer;
