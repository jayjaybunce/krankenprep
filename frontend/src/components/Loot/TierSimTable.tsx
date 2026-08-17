import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { TierSimEntry } from "../../api/queryHooks";

const ARMOR_TYPE_ORDER = ["Cloth", "Leather", "Mail", "Plate"];

type TierSet = "current" | "transition";

type CurrentTierView = "0v2" | "0v4" | "2v4";
type TransitionView = "old4v2mix" | "2mixv4new" | "old4vnew4";
type ComparisonView = CurrentTierView | TransitionView;

type ComparisonLabel = { tab: string; a: string; b: string };

// Tab labels within each set. The Tier Transition trio deliberately mirrors
// the wording of the second spreadsheet the team owner receives each season
// (see TierSimEntry.Score4pcPrevTier/Score2pcMixed on the backend) rather
// than inventing our own phrasing, so hand-entry and the UI stay in sync.
const CURRENT_TIER_LABELS: Record<CurrentTierView, ComparisonLabel> = {
  "0v2": { tab: "0pc - 2pc", a: "0p", b: "2p" },
  "0v4": { tab: "0pc - 4pc", a: "0p", b: "4p" },
  "2v4": { tab: "2pc - 4pc", a: "2p", b: "4p" },
};

const TRANSITION_LABELS: Record<TransitionView, ComparisonLabel> = {
  old4v2mix: { tab: "4pc (old) - 2pc + 2pc", a: "4p (Old)", b: "2p + 2p" },
  "2mixv4new": { tab: "2pc + 2pc - 4pc (new)", a: "2p + 2p", b: "4p (New)" },
  old4vnew4: { tab: "4pc (old) - 4pc (new)", a: "4p (Old)", b: "4p (New)" },
};

const COMPARISON_LABELS: Record<ComparisonView, ComparisonLabel> = {
  ...CURRENT_TIER_LABELS,
  ...TRANSITION_LABELS,
};

// Tier Transition scores are nullable (see TierSimEntry) — a spec/build may
// not have this data yet, or the season may be an expansion's first with no
// "old tier" to compare against at all. Returning null here (rather than
// coercing to 0) is what lets the table tell "no data" apart from "a real,
// near-zero gain."
const scoresForView = (
  entry: TierSimEntry,
  view: ComparisonView,
): { a: number | null; b: number | null } => {
  switch (view) {
    case "0v2":
      return { a: entry.score_0pc, b: entry.score_2pc };
    case "0v4":
      return { a: entry.score_0pc, b: entry.score_4pc };
    case "2v4":
      return { a: entry.score_2pc, b: entry.score_4pc };
    case "old4v2mix":
      return { a: entry.score_4pc_prev_tier, b: entry.score_2pc_mixed };
    case "2mixv4new":
      return { a: entry.score_2pc_mixed, b: entry.score_4pc_new_tier };
    case "old4vnew4":
      return { a: entry.score_4pc_prev_tier, b: entry.score_4pc_new_tier };
  }
};

const computeRaw = (a: number | null, b: number | null) =>
  a == null || b == null ? null : b - a;

const computePercent = (a: number | null, b: number | null) =>
  a == null || b == null || a === 0 ? null : ((b - a) / a) * 100;

// Light background tint derived from the class's hex color, readable in
// both light and dark mode without reproducing the spreadsheet's solid
// color blocks. alpha is bumped for the row currently focused from the
// roster grid so it reads as "brighter," not just bordered.
const hexToTintBackground = (hex: string, alpha = 0.12) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const TierSimTable: FC<{
  entries: TierSimEntry[];
  lastUpdated: string | null;
  colorMode: string;
  // Set when a roster row is clicked in TierTrackerGrid — scrolls this
  // panel (which scrolls independently of the page once it's sticky) to
  // that spec's row(s) and highlights them, instead of leaving the user to
  // scroll and scan for it themselves.
  focusedSpecializationId?: number | null;
}> = ({ entries, lastUpdated, colorMode, focusedSpecializationId }) => {
  const [tierSet, setTierSet] = useState<TierSet>("current");
  const [view, setView] = useState<ComparisonView>("0v2");
  const [sortColumn, setSortColumn] = useState<"raw" | "percent" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const rowRefs = useRef(new Map<number, HTMLTableRowElement>());

  // Hides the whole Tier Transition set rather than showing it full of
  // "—" — this is what stands in for an explicit "is this an expansion's
  // first season" check: no season-numbering rule to keep in sync, and it
  // degrades gracefully if data entry just hasn't caught up yet.
  const hasTransitionData = useMemo(
    () =>
      entries.some(
        (e) =>
          e.score_4pc_prev_tier != null ||
          e.score_2pc_mixed != null ||
          e.score_4pc_new_tier != null,
      ),
    [entries],
  );

  // Falls back to the Current Tier set if the entries prop changes out from
  // under a "transition" selection (e.g. switching seasons) and transition
  // data is no longer available. Adjusted here during render rather than in
  // an effect, per React's guidance for resetting state in response to a
  // prop change — avoids the extra commit-then-effect render pass.
  const [prevHasTransitionData, setPrevHasTransitionData] = useState(hasTransitionData);
  if (hasTransitionData !== prevHasTransitionData) {
    setPrevHasTransitionData(hasTransitionData);
    if (!hasTransitionData && tierSet === "transition") {
      setTierSet("current");
      setView("0v2");
    }
  }

  const handleSetChange = (nextSet: TierSet) => {
    setTierSet(nextSet);
    setView(nextSet === "current" ? "0v2" : "old4v2mix");
  };

  useEffect(() => {
    if (focusedSpecializationId == null) return;
    const match = entries.find((e) => e.specialization_id === focusedSpecializationId);
    if (!match) return;
    rowRefs.current.get(match.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedSpecializationId, entries]);

  const groups = useMemo(() => {
    const byArmorType = new Map<string, TierSimEntry[]>();
    for (const entry of entries) {
      const armorType = entry.specialization.armor_type.name;
      if (!byArmorType.has(armorType)) byArmorType.set(armorType, []);
      byArmorType.get(armorType)!.push(entry);
    }

    const sortRows = (rows: TierSimEntry[]) => {
      if (!sortColumn) return rows;
      return [...rows].sort((rowA, rowB) => {
        const { a: a0, b: b0 } = scoresForView(rowA, view);
        const { a: a1, b: b1 } = scoresForView(rowB, view);
        const valueA = sortColumn === "raw" ? computeRaw(a0, b0) : computePercent(a0, b0);
        const valueB = sortColumn === "raw" ? computeRaw(a1, b1) : computePercent(a1, b1);
        // Rows missing this comparison's data sink to the bottom regardless
        // of sort direction — there's nothing to rank them by.
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return 1;
        if (valueB == null) return -1;
        return sortDir === "asc" ? valueA - valueB : valueB - valueA;
      });
    };

    return ARMOR_TYPE_ORDER.filter((armorType) => byArmorType.has(armorType)).map((armorType) => ({
      armorType,
      rows: sortRows(byArmorType.get(armorType)!),
    }));
  }, [entries, sortColumn, sortDir, view]);

  const toggleSort = (column: "raw" | "percent") => {
    if (sortColumn === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDir("desc");
    }
  };

  const labels = COMPARISON_LABELS[view];
  const activeSetLabels: Record<string, ComparisonLabel> =
    tierSet === "current" ? CURRENT_TIER_LABELS : TRANSITION_LABELS;
  const headerTextClass = colorMode === "dark" ? "text-slate-400" : "text-slate-600";
  const borderClass = colorMode === "dark" ? "border-slate-800" : "border-slate-200";

  const sortIcon = (column: "raw" | "percent") =>
    sortColumn === column ? (
      sortDir === "asc" ? (
        <ArrowUp className="w-3 h-3 inline ml-1" />
      ) : (
        <ArrowDown className="w-3 h-3 inline ml-1" />
      )
    ) : null;

  if (entries.length === 0) {
    return (
      <p className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
        No tier sim data published for the current season yet. This is
        community reference data, not something your team configures — check
        back once it's available.
      </p>
    );
  }

  const stickyHeadBg = colorMode === "dark" ? "bg-slate-950" : "bg-white";

  return (
    <div className="flex flex-col gap-3 max-h-[75vh]">
      <div
        className={`shrink-0 flex flex-col gap-2 pb-3 border-b ${borderClass}`}
      >
        {hasTransitionData && (
          <div
            className={`inline-flex self-start gap-1 p-0.5 rounded-lg border ${
              colorMode === "dark" ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-100"
            }`}
          >
            {(
              [
                { key: "current", label: "Current Tier" },
                { key: "transition", label: "Tier Transition" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSetChange(key)}
                className={`px-3 py-1 rounded-md text-xs font-bold font-montserrat transition-colors ${
                  tierSet === key
                    ? "bg-cyan-500 text-white"
                    : colorMode === "dark"
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1">
            {(Object.keys(activeSetLabels) as ComparisonView[]).map((key) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-montserrat transition-colors ${
                  view === key
                    ? "bg-cyan-500 text-white"
                    : colorMode === "dark"
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {activeSetLabels[key].tab}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <span className={`text-xs font-montserrat ${headerTextClass}`}>
              Tier sim data as of {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th
                className={`sticky top-0 z-10 px-2 py-1.5 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${stickyHeadBg} ${headerTextClass}`}
              >
                Spec
              </th>
              <th
                title={`${labels.a}, single-target sim`}
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${stickyHeadBg} ${headerTextClass}`}
              >
                {labels.a} ST
              </th>
              <th
                title={`${labels.b}, single-target sim`}
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${stickyHeadBg} ${headerTextClass}`}
              >
                {labels.b} ST
              </th>
              <th
                title="Raw DPS gained from the tier bonus"
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide cursor-pointer select-none ${stickyHeadBg} ${headerTextClass}`}
                onClick={() => toggleSort("raw")}
              >
                Raw #{sortIcon("raw")}
              </th>
              <th
                title="Percent DPS gained from the tier bonus"
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide cursor-pointer select-none ${stickyHeadBg} ${headerTextClass}`}
                onClick={() => toggleSort("percent")}
              >
                % gain{sortIcon("percent")}
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ armorType, rows }) => (
              <Fragment key={armorType}>
                <tr>
                  <td
                    colSpan={5}
                    className={`px-3 py-1.5 text-xs font-bold font-montserrat uppercase tracking-wide border-t border-b ${borderClass} ${headerTextClass}`}
                  >
                    {armorType}
                  </td>
                </tr>
                {rows.map((entry) => {
                  const { a, b } = scoresForView(entry, view);
                  const raw = computeRaw(a, b);
                  const percent = computePercent(a, b);
                  const color = entry.specialization.class.color;
                  const isFocused = entry.specialization_id === focusedSpecializationId;
                  const emptyCellClass = colorMode === "dark" ? "text-slate-600" : "text-slate-400";
                  return (
                    <tr
                      key={entry.id}
                      ref={(el) => {
                        if (el) rowRefs.current.set(entry.id, el);
                        else rowRefs.current.delete(entry.id);
                      }}
                      style={{ backgroundColor: hexToTintBackground(color, isFocused ? 0.32 : 0.12) }}
                    >
                      <td
                        className={`px-2 py-1.5 max-w-[200px] text-xs font-medium font-montserrat border-l-4 leading-tight ${
                          isFocused ? "border-cyan-400" : "border-l-transparent"
                        }`}
                        style={{ color }}
                      >
                        <div className="truncate">
                          {entry.specialization.name} {entry.specialization.class.name}
                        </div>
                        {entry.build_label && (
                          <div className={`text-[10px] font-normal ${headerTextClass}`}>{entry.build_label}</div>
                        )}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-montserrat ${a != null ? (colorMode === "dark" ? "text-slate-300" : "text-slate-700") : emptyCellClass}`}>
                        {a != null ? a.toLocaleString() : "—"}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-montserrat ${b != null ? (colorMode === "dark" ? "text-slate-300" : "text-slate-700") : emptyCellClass}`}>
                        {b != null ? b.toLocaleString() : "—"}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-semibold font-montserrat ${raw != null ? (colorMode === "dark" ? "text-slate-200" : "text-slate-800") : emptyCellClass}`}>
                        {raw != null ? raw.toLocaleString() : "—"}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-semibold font-montserrat ${percent != null ? (colorMode === "dark" ? "text-slate-200" : "text-slate-800") : emptyCellClass}`}>
                        {percent != null ? `${percent.toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
