import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { TierSimEntry } from "../../api/queryHooks";

const ARMOR_TYPE_ORDER = ["Cloth", "Leather", "Mail", "Plate"];

type ComparisonView = "0v2" | "0v4" | "2v4";

const COMPARISON_LABELS: Record<ComparisonView, { tab: string; a: string; b: string }> = {
  "0v2": { tab: "0pc - 2pc", a: "0p", b: "2p" },
  "0v4": { tab: "0pc - 4pc", a: "0p", b: "4p" },
  "2v4": { tab: "2pc - 4pc", a: "2p", b: "4p" },
};

const scoresForView = (entry: TierSimEntry, view: ComparisonView) => {
  switch (view) {
    case "0v2":
      return { a: entry.score_0pc, b: entry.score_2pc };
    case "0v4":
      return { a: entry.score_0pc, b: entry.score_4pc };
    case "2v4":
      return { a: entry.score_2pc, b: entry.score_4pc };
  }
};

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
  const [view, setView] = useState<ComparisonView>("0v2");
  const [sortColumn, setSortColumn] = useState<"raw" | "percent" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const rowRefs = useRef(new Map<number, HTMLTableRowElement>());

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
        const valueA = sortColumn === "raw" ? b0 - a0 : ((b0 - a0) / a0) * 100;
        const valueB = sortColumn === "raw" ? b1 - a1 : ((b1 - a1) / a1) * 100;
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
        No tier sim data for the current season yet.
      </p>
    );
  }

  const stickyHeadBg = colorMode === "dark" ? "bg-slate-950" : "bg-white";

  return (
    <div className="flex flex-col gap-3 max-h-[75vh]">
      <div
        className={`shrink-0 flex items-center justify-between flex-wrap gap-2 pb-3 border-b ${borderClass}`}
      >
        <div className="flex gap-1">
          {(Object.keys(COMPARISON_LABELS) as ComparisonView[]).map((key) => (
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
              {COMPARISON_LABELS[key].tab}
            </button>
          ))}
        </div>
        {lastUpdated && (
          <span className={`text-xs font-montserrat ${headerTextClass}`}>
            Tier sim data as of {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
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
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${stickyHeadBg} ${headerTextClass}`}
              >
                {labels.a} ST
              </th>
              <th
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide ${stickyHeadBg} ${headerTextClass}`}
              >
                {labels.b} ST
              </th>
              <th
                className={`sticky top-0 z-10 px-1.5 py-1.5 text-right text-xs font-medium font-montserrat uppercase tracking-wide cursor-pointer select-none ${stickyHeadBg} ${headerTextClass}`}
                onClick={() => toggleSort("raw")}
              >
                Raw #{sortIcon("raw")}
              </th>
              <th
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
                  const raw = b - a;
                  const percent = (raw / a) * 100;
                  const color = entry.specialization.class.color;
                  const isFocused = entry.specialization_id === focusedSpecializationId;
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
                      <td className={`px-1.5 py-1.5 text-right text-xs font-montserrat ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        {a.toLocaleString()}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-montserrat ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        {b.toLocaleString()}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-semibold font-montserrat ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                        {raw.toLocaleString()}
                      </td>
                      <td className={`px-1.5 py-1.5 text-right text-xs font-semibold font-montserrat ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                        {percent.toFixed(2)}%
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
