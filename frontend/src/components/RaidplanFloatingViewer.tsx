import { useEffect, useRef, useState, type CSSProperties, type FC } from "react";
import { GripHorizontal, Maximize2, MapPinned, Minus } from "lucide-react";
import { useTheme, usePrepPreferences } from "../hooks";
import PlanViewer from "./Pages/PlanViewer";
import type { RaidPlan } from "../api/queryHooks";
import { noteThemes, themeCssVars } from "../data/noteThemes";

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
  // The tab the plan should *open* to (e.g. a note link pointing at a
  // specific tab). Switching tabs afterwards is tracked purely as local
  // state below — see the comment on localTabId for why.
  tabId?: string | null;
  onClose: () => void;
};

type Rect = { x: number; y: number; width: number; height: number };

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const computeDefaultRect = (): Rect => ({
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  x: Math.max(24, window.innerWidth - DEFAULT_WIDTH - 24),
  y: Math.max(24, window.innerHeight - DEFAULT_HEIGHT - 96),
});

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
}) => {
  const { colorMode } = useTheme();
  const isDark = colorMode === "dark";
  const { markdownTheme } = usePrepPreferences();
  const noteTheme = noteThemes[markdownTheme];
  const palette = isDark ? noteTheme.dark : noteTheme.light;
  const [open, setOpen] = useState(true);
  const [rect, setRect] = useState<Rect>(computeDefaultRect);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startRect: Rect;
    mode: "move" | "resize";
  } | null>(null);

  // Which tab PlanViewer shows, tracked locally rather than round-tripped
  // through the URL: the previous implementation forwarded tab clicks to
  // Prep's onTabChange, which navigate()s to a new /tab/:tabId route on
  // every click. That's appropriate for the inline split-view (its tab
  // belongs in the URL, so a refresh/share preserves it) but not for this
  // transient floating preview — and the route change was restarting any
  // animated GIFs on the page (a raidplan tab switch has no business
  // touching the rest of the page at all). null means "use tabId" (the
  // tab the link opened to); once the user clicks a different tab within
  // the window, that click stays local from then on.
  const [localTabId, setLocalTabId] = useState<string | null>(null);

  // A newly clicked raidplan link should surface the window even if it was
  // previously minimized to the pill, and should respect its own starting
  // tab rather than the previous plan's local tab selection. Adjusted
  // during render (rather than in an effect) per the "storing information
  // from previous renders" pattern — avoids an extra render pass just to
  // flip `open`.
  const [prevShareId, setPrevShareId] = useState(raidplanShareId);
  if (raidplanShareId !== prevShareId) {
    setPrevShareId(raidplanShareId);
    if (raidplanShareId) setOpen(true);
    setLocalTabId(null);
  }

  // The component stays mounted (just rendering null) while hidden — e.g.
  // switching from Notes Fullscreen to Split layout — so a manual
  // drag/resize would otherwise persist indefinitely across layout
  // switches. Snap back to the default size/position each time it
  // reappears, same render-time-comparison pattern as prevShareId above.
  const [wasVisible, setWasVisible] = useState(isVisible);
  if (isVisible !== wasVisible) {
    setWasVisible(isVisible);
    if (isVisible) setRect(computeDefaultRect());
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
    <div className="hidden lg:block" style={themeCssVars(palette) as CSSProperties}>
      {/* Pill: always present while a plan is linked, toggles the window */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ fontFamily: noteTheme.fonts.body }}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full text-sm font-semibold shadow-xl transition-all duration-200 border ${
          open
            ? "bg-(--nt-link)/20 border-(--nt-link) text-(--nt-link)"
            : "bg-(--nt-card-bg) border-(--nt-card-border) text-(--nt-muted) hover:text-(--nt-body)"
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
          className={`fixed z-40 flex flex-col ${noteTheme.card.radius} ${noteTheme.card.shadow} overflow-hidden border bg-(--nt-card-bg) border-(--nt-card-border)`}
        >
          {/* Title bar / drag handle */}
          <div
            onMouseDown={(e) => startDrag(e, "move")}
            className="flex items-center justify-between gap-2 px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing border-b border-(--nt-card-border) bg-(--nt-blockquote-bg)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GripHorizontal className="w-4 h-4 shrink-0 text-(--nt-muted)" />
              <span
                style={{ fontFamily: noteTheme.fonts.heading }}
                className="font-semibold text-xs truncate text-(--nt-heading)"
              >
                {planData?.name || "Raid Plan"}
              </span>
            </div>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
              className="p-1 rounded-md transition-colors shrink-0 text-(--nt-muted) hover:text-(--nt-body) hover:bg-(--nt-blockquote-border)/30"
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
                onTabChange={setLocalTabId}
                tabs={planData.content}
                startingId={localTabId ?? tabId}
              />
            ) : null}
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={(e) => startDrag(e, "resize")}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 text-(--nt-muted)"
          >
            <Maximize2 className="w-3 h-3 rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RaidplanFloatingViewer;
