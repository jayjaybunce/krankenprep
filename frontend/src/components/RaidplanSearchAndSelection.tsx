import type { FC, RefObject } from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { useMyRaidplans, type RaidPlan } from "../api/queryHooks";
import { useTheme } from "../hooks";
import { PlanTab } from "./Planner/PlanTab";
import { Stage as StageType } from "konva/lib/Stage";

type RaidplanSearchAndSelectionProps = {
  top: number;
  left: number;
  height: number;
  x: number;
  y: number;
  show: boolean;
  query: string;
  onClick: (
    shareId: string,
    tabId: string | null,
    planName: string,
    tabIndex: number | null,
  ) => void;
};

const w = 400;
const h = 490;

// Canvas base dimensions (must match PlanViewer/Planner)
const BASE_W = 1280;
const BASE_H = 720;

// Preview scales to the full popup width
const PREVIEW_SCALE = w / BASE_W;
const PREVIEW_H = Math.round(BASE_H * PREVIEW_SCALE);

// ─── List View ───────────────────────────────────────────────────────────────

type ListViewProps = {
  filtered: RaidPlan[];
  isLoading: boolean;
  query: string;
  onSelect: (plan: RaidPlan) => void;
  colorMode: string;
};

const ListView: FC<ListViewProps> = ({
  filtered,
  isLoading,
  query,
  onSelect,
  colorMode,
}) => (
  <>
    <div
      className={`px-3 py-2 border-b flex-shrink-0 ${
        colorMode === "dark" ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <span className="text-xs text-slate-500 font-montserrat">
        {query
          ? `Plans matching "${query}"`
          : "Your raid plans — type to filter"}
      </span>
    </div>

    {isLoading ? (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : filtered.length > 0 ? (
      <div className="flex-1 overflow-y-auto p-1.5 unfuck-scrollbar-1">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelect(plan)}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-200 hover:bg-cyan-500/10 hover:text-cyan-400"
          >
            <LayoutGrid className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium font-montserrat truncate">
                {plan.name}
              </span>
              <span className="text-xs text-slate-500">
                {plan.boss} · {plan.raid}
              </span>
            </div>
            <span className="text-xs text-slate-500 shrink-0">
              {plan.content?.length ?? 0} slides
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm font-montserrat text-slate-500">
          {query ? "No plans found" : "No plans yet"}
        </span>
      </div>
    )}
  </>
);

// ─── Tab Selection View ───────────────────────────────────────────────────────

type TabSelectionViewProps = {
  plan: RaidPlan;
  hoveredTabIndex: number;
  setHoveredTabIndex: (i: number) => void;
  onBack: () => void;
  onInsertPlan: () => void;
  onInsertTab: (tabId: string, tabIndex: number) => void;
  colorMode: string;
};

const TabSelectionView: FC<TabSelectionViewProps> = ({
  plan,
  hoveredTabIndex,
  setHoveredTabIndex,
  onBack,
  onInsertPlan,
  onInsertTab,
  colorMode,
}) => {
  const previewRef = useRef<StageType | null>(null) as RefObject<StageType | null>;
  const activeTab = plan.content?.[hoveredTabIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b flex-shrink-0 ${
          colorMode === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <button
          onClick={onBack}
          className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold font-montserrat truncate">
            {plan.name}
          </span>
          <span className="text-xs text-slate-500">{plan.boss}</span>
        </div>
      </div>

      {/* Konva preview — renders full canvas scaled to popup width */}
      {activeTab && (
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ height: PREVIEW_H }}
        >
          <div style={{ zoom: PREVIEW_SCALE }}>
            <PlanTab
              key={activeTab.id}
              ref={previewRef}
              height={BASE_H}
              width={BASE_W}
              isActive={true}
              backgroundSrc={activeTab.backgroundSrc}
              shapes={activeTab.shapes}
              selectedId={null}
              selectedIds={[]}
              groupKey={0}
              setSelectedId={() => {}}
              setSelectedIds={() => {}}
              handleChange={() => {}}
              onGroupTransform={() => {}}
              handleContextMenu={() => {}}
              drawingMode={false}
              onAddLine={() => {}}
              drawingColor="white"
              drawingThickness={2}
            />
          </div>
        </div>
      )}

      {/* Insert whole plan */}
      <div
        className={`px-3 py-1.5 border-b flex-shrink-0 ${
          colorMode === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <button
          onClick={onInsertPlan}
          className="w-full text-left px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all font-montserrat"
        >
          Insert link (no specific slide)
        </button>
      </div>

      {/* Tab thumbnails — background images only (lightweight) */}
      <div className="flex-1 overflow-y-auto p-3 unfuck-scrollbar-1">
        <p className="text-xs text-slate-500 mb-2 font-montserrat">
          Or select a specific slide:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {plan.content?.map((tab, i) => (
            <div
              key={tab.id}
              onMouseEnter={() => setHoveredTabIndex(i)}
              onClick={() => onInsertTab(tab.id, i)}
              className={`
                relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                ${
                  hoveredTabIndex === i
                    ? "border-cyan-500 shadow-md shadow-cyan-500/20"
                    : colorMode === "dark"
                      ? "border-slate-700 hover:border-slate-600"
                      : "border-slate-300 hover:border-slate-400"
                }
              `}
            >
              <img
                src={tab.backgroundSrc}
                alt={`Slide ${i + 1}`}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-white font-medium">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RaidplanSearchAndSelection: FC<RaidplanSearchAndSelectionProps> = ({
  top,
  left,
  x,
  y,
  height,
  show,
  query,
  onClick,
}) => {
  const { data: raidplans, isLoading } = useMyRaidplans();
  const { colorMode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<RaidPlan | null>(null);
  const [hoveredTabIndex, setHoveredTabIndex] = useState(0);

  useEffect(() => {
    if (!show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPlan(null);
      setHoveredTabIndex(0);
    }
  }, [show]);

  const filtered = useMemo(() => {
    if (!raidplans) return [];
    if (!query) return raidplans;
    const q = query.toLowerCase();
    return raidplans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.boss.toLowerCase().includes(q) ||
        p.raid.toLowerCase().includes(q),
    );
  }, [raidplans, query]);

  if (!show) return null;

  return (
    <div
      className={`
        fixed z-50 flex flex-col
        rounded-xl border overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-200
        ${
          colorMode === "dark"
            ? "bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl shadow-slate-950/50 text-slate-50"
            : "bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl shadow-slate-300/50 text-slate-900"
        }
      `}
      style={{
        height: h,
        width: w,
        top: y + top + height + 4,
        left: x + left,
      }}
    >
      {selectedPlan ? (
        <TabSelectionView
          plan={selectedPlan}
          hoveredTabIndex={hoveredTabIndex}
          setHoveredTabIndex={setHoveredTabIndex}
          onBack={() => {
            setSelectedPlan(null);
            setHoveredTabIndex(0);
          }}
          onInsertPlan={() =>
            onClick(selectedPlan.share_id, null, selectedPlan.name, null)
          }
          onInsertTab={(tabId, tabIndex) =>
            onClick(
              selectedPlan.share_id,
              tabId,
              selectedPlan.name,
              tabIndex,
            )
          }
          colorMode={colorMode}
        />
      ) : (
        <ListView
          filtered={filtered}
          isLoading={isLoading}
          query={query}
          onSelect={(plan) => {
            setSelectedPlan(plan);
            setHoveredTabIndex(0);
          }}
          colorMode={colorMode}
        />
      )}
    </div>
  );
};

export default RaidplanSearchAndSelection;
