import type { FC } from "react";
import { useCurrentRaids } from "../../api/queryHooks";
import { useTheme } from "../../hooks";

type LootBossSidebarProps = {
  selectedBossId: number | null;
  onSelectBoss: (bossId: number) => void;
  // When provided, renders a small numbered badge on any boss with an entry
  // — the selected character's priority for that boss. Only meaningful in
  // the Bonus Roll Planner tab; Per-Boss/Raid-Wide omit this prop entirely.
  priorityByBossId?: Map<number, number>;
};

// Current-tier bosses, same underlying data source as BossSelectionV2
// (useCurrentRaids, itself built on useCurrentExpansion filtered to
// season.is_current) — not team-scoped, since items/bosses are shared
// reference data across all teams. Unlike BossSelectionV2, this uses local
// selection state rather than navigation, since it's just one panel within
// the /loot page's Bonus Roll Planner/Per-Boss/Raid-Wide tabs.
export const LootBossSidebar: FC<LootBossSidebarProps> = ({
  selectedBossId,
  onSelectBoss,
  priorityByBossId,
}) => {
  const { colorMode } = useTheme();
  const raids = useCurrentRaids();

  return (
    <div className="flex flex-col gap-4 w-56 shrink-0">
      {raids.length === 0 ? (
        <p
          className={`text-sm px-2 ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
        >
          No current-tier raids found
        </p>
      ) : (
        raids.map((raid) => (
          <div key={raid.id} className="flex flex-col gap-1">
            <h3
              className={`text-xs font-semibold uppercase tracking-wider px-2 ${
                colorMode === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {raid.name}
            </h3>
            {(raid.bosses ?? []).map((boss) => (
              <button
                key={boss.id}
                onClick={() => onSelectBoss(boss.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left border transition-colors ${
                  selectedBossId === boss.id
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : colorMode === "dark"
                      ? "border-transparent text-slate-300 hover:bg-slate-800/50"
                      : "border-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                <img
                  src={boss.icon_img_url}
                  alt=""
                  className="w-6 h-6 rounded shrink-0"
                />
                <span className="text-sm font-montserrat truncate flex-1">
                  {boss.name}
                </span>
                {priorityByBossId?.has(boss.id) && (
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold font-montserrat shrink-0 ${
                      colorMode === "dark"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {priorityByBossId.get(boss.id)}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
};
