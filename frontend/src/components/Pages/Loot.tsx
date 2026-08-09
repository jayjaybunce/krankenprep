import { useEffect, useMemo, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Circle, CheckSquare, Minus, Plus, CheckCircle2, Search, Square, X } from "lucide-react";
import { useDocumentTitle, useTeam, useTheme, useUser } from "../../hooks";
import {
  useCurrentExpansion,
  useCurrentRaids,
  useGetBoeSales,
  useGetBossLoot,
  useGetBossRollOverview,
  useGetCharacterBossPriorities,
  useGetItemRollOverview,
  useGetLootAuditLog,
  useGetRaidRollOverview,
  useGetTeamById,
  useGetTeamTierSlots,
  useGetTierSimData,
  useSearchLootItems,
} from "../../api/queryHooks";
import type {
  BoeSale,
  BossLootItem,
  BossRollOverviewCharacterRoll,
  BossRollOverviewItem,
  Character,
  ItemRollOverviewWisher,
  LootAuditLogEntry,
  LootItemSearchResult,
  RaidRollOverview,
} from "../../api/queryHooks";
import type { Raid } from "../../types/api/expansion";
import {
  useReorderBossPriorities,
  useSetBonusRollCount,
  useSetBossPriority,
  useToggleItemWish,
  useUpdateItemObtained,
} from "../../api/mutationHooks";
import { Dropdown } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import Button from "../Button";
import { LootBossSidebar } from "../Loot/LootBossSidebar";
import { WowheadItemIcon } from "../Loot/WowheadItemIcon";
import { FixPrioritiesModal, type PriorityBoss } from "../Loot/FixPrioritiesModal";
import { TierTrackerGrid } from "../Loot/TierTrackerGrid";
import { TierSimTable } from "../Loot/TierSimTable";
import { BoeSalesTable } from "../Loot/BoeSalesTable";
import { BoeSaleModal } from "../Loot/BoeSaleModal";
import { getClassColor } from "../../data/classes";

const TABS = [
  "bonus-rolls",
  "per-item",
  "per-boss",
  "raid-wide",
  "tier-tracker",
  "boe",
  "audit-log",
] as const;
type LootTab = (typeof TABS)[number];

const DIFFICULTIES = ["Heroic", "Mythic"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

// "Bonus Roll Planner" (not "Wishlist") is deliberate — WowAudit gear
// wishlists are a separate, unrelated concept elsewhere in this app; this
// tab only tracks which items/bosses a player plans to send bonus rolls on.
const TAB_LABELS: Record<LootTab, string> = {
  "bonus-rolls": "My Bonus Roll Plan",
  "per-item": "Per-Item",
  "per-boss": "Per-Boss",
  "raid-wide": "Raid-Wide",
  "tier-tracker": "Tier Tracker",
  boe: "BoE Sales",
  "audit-log": "Audit Log",
};

// Turns a LootAuditLogEntry into the exact sentence shape requested:
// "{character} {action}". The leading timestamp/user portion is rendered
// separately (formatAuditLogPrefix) since it doesn't depend on event_type.
const formatAuditLogAction = (entry: LootAuditLogEntry): string => {
  switch (entry.event_type) {
    case "item_wished":
      return `marked ${entry.item_name ?? "an item"} as bonus roll target`;
    case "item_unwished":
      return `removed ${entry.item_name ?? "an item"} as bonus roll target`;
    case "item_obtained":
      return `acquired ${entry.item_name ?? "an item"}`;
    case "item_unobtained":
      return `un-marked ${entry.item_name ?? "an item"} as acquired`;
    case "priority_set":
      return `set priority ${entry.value ?? "—"} on ${entry.difficulty} ${entry.boss_name}`;
    case "bonus_roll_added":
      return `rolled on ${entry.difficulty} ${entry.boss_name}`;
    case "bonus_roll_removed":
      return `retracted a bonus roll on ${entry.difficulty} ${entry.boss_name}`;
    default:
      return entry.event_type;
  }
};

const ItemRow: FC<{
  item: BossLootItem;
  bonusIds: string;
  colorMode: string;
  onToggleWish: () => void;
  onToggleObtained: () => void;
}> = ({ item, bonusIds, colorMode, onToggleWish, onToggleObtained }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
        item.wished
          ? "bg-cyan-500/10 border-cyan-500/40"
          : colorMode === "dark"
            ? "border-slate-800 hover:bg-slate-800/50"
            : "border-slate-200 hover:bg-slate-50"
      } ${item.obtained ? "opacity-50" : ""}`}
    >
      {/* A dedicated checkbox, separate from the Wowhead icon link below —
          previously the only way to target an item was clicking the item
          name text, and the row's hover/tint styling made the whole row
          look clickable, including the Wowhead icon (which actually opens
          a new tab instead, reading as "nothing happened" on this page). */}
      <button
        onClick={onToggleWish}
        title={item.wished ? "Remove from bonus roll targets" : "Target this item for bonus rolls"}
        className={`shrink-0 transition-colors ${
          item.wished
            ? "text-cyan-400"
            : colorMode === "dark"
              ? "text-slate-600 hover:text-slate-300"
              : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {item.wished ? (
          <CheckSquare className="w-5 h-5" />
        ) : (
          <Square className="w-5 h-5" />
        )}
      </button>
      <WowheadItemIcon
        wowItemId={item.wow_item_id}
        bonusIds={bonusIds}
        iconUrl={item.icon_url}
      />
      <button
        onClick={onToggleWish}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <span
          className={`text-sm font-medium font-montserrat truncate flex-1 ${
            item.wished
              ? "text-cyan-400"
              : colorMode === "dark"
                ? "text-slate-200"
                : "text-slate-800"
          } ${item.obtained ? "line-through" : ""}`}
        >
          {item.name}
        </span>
      </button>
      {item.wished && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleObtained();
          }}
          title={item.obtained ? "Mark as not obtained" : "Mark as obtained"}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border shrink-0 transition-colors ${
            item.obtained
              ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
              : colorMode === "dark"
                ? "text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500/40"
                : "text-slate-500 border-slate-300 hover:text-emerald-600 hover:border-emerald-400"
          }`}
        >
          {item.obtained ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span className="text-xs font-semibold font-montserrat uppercase tracking-wide">
            {item.obtained ? "Acquired" : "Mark Acquired"}
          </span>
        </button>
      )}
    </div>
  );
};

const DoneBadge: FC<{ colorMode: string; className?: string }> = ({
  colorMode,
  className,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-montserrat ${
      colorMode === "dark"
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
    } ${className ?? ""}`}
  >
    <CheckCircle2 className="w-3.5 h-3.5" />
    Done
  </span>
);

const RollInterestSection: FC<{
  rolls: BossRollOverviewCharacterRoll[];
  charactersById: Map<number, Character>;
  colorMode: string;
}> = ({ rolls, charactersById, colorMode }) => {
  const sorted = [...rolls].sort((a, b) => {
    if (a.priority === null && b.priority === null) {
      return (charactersById.get(a.character_id)?.name ?? "").localeCompare(
        charactersById.get(b.character_id)?.name ?? "",
      );
    }
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return a.priority - b.priority;
  });

  if (sorted.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No one has set a priority, bonus rolls, or item wish for this boss
        yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((roll) => {
        const character = charactersById.get(roll.character_id);
        return (
          <div
            key={roll.character_id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
          >
            <span
              className="text-sm font-medium font-montserrat flex-1 truncate"
              style={{ color: character ? getClassColor(character.class) : undefined }}
            >
              {character?.name ?? `Character #${roll.character_id}`}
            </span>
            {roll.done && <DoneBadge colorMode={colorMode} />}
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              Priority {roll.priority ?? "—"}
            </span>
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              {roll.bonus_rolls} bonus roll{roll.bonus_rolls !== 1 ? "s" : ""}
            </span>
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              {roll.pool_size} item{roll.pool_size !== 1 ? "s" : ""} in pool
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ItemInterestSection: FC<{
  items: BossRollOverviewItem[];
  bonusIds: string;
  charactersById: Map<number, Character>;
  colorMode: string;
  onSelectItem: (item: BossRollOverviewItem) => void;
}> = ({ items, bonusIds, charactersById, colorMode, onSelectItem }) => {
  const withWishers = items.filter((item) => item.wishers.length > 0);

  if (withWishers.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No items wished for yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {withWishers.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 px-3 py-2 rounded-lg border ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
        >
          <WowheadItemIcon
            wowItemId={item.wow_item_id}
            bonusIds={bonusIds}
            iconUrl={item.icon_url}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <button
              onClick={() => onSelectItem(item)}
              title="View in Per-Item"
              className={`text-sm font-medium font-montserrat truncate block hover:underline ${colorMode === "dark" ? "text-slate-200 hover:text-cyan-400" : "text-slate-800 hover:text-cyan-600"}`}
            >
              {item.name}
            </button>
            <div className="flex flex-wrap gap-1.5">
              {item.wishers.map((wisher) => {
                const character = charactersById.get(wisher.character_id);
                return (
                  <span
                    key={wisher.character_id}
                    className={`text-xs font-montserrat px-2 py-0.5 rounded-full border ${
                      wisher.obtained
                        ? "line-through opacity-50 border-emerald-500/40"
                        : colorMode === "dark"
                          ? "border-slate-700"
                          : "border-slate-300"
                    }`}
                    style={{ color: character ? getClassColor(character.class) : undefined }}
                  >
                    {character?.name ?? `Character #${wisher.character_id}`}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Per-item wisher breakdown for the Per-Item tab — priority/bonus rolls are
// per-boss (the same values shown in Roll Interest for that item's boss),
// obtained is per-item.
const ItemWisherSection: FC<{
  wishers: ItemRollOverviewWisher[];
  charactersById: Map<number, Character>;
  colorMode: string;
}> = ({ wishers, charactersById, colorMode }) => {
  const sorted = [...wishers].sort((a, b) => {
    if (a.priority === null && b.priority === null) {
      return (charactersById.get(a.character_id)?.name ?? "").localeCompare(
        charactersById.get(b.character_id)?.name ?? "",
      );
    }
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return a.priority - b.priority;
  });

  if (sorted.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No one has wished for this item yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((wisher) => {
        const character = charactersById.get(wisher.character_id);
        return (
          <div
            key={wisher.character_id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"} ${wisher.obtained ? "opacity-50" : ""}`}
          >
            {character?.specialization?.icon_url ? (
              <img
                src={character.specialization.icon_url}
                alt={character.specialization.name}
                title={character.specialization.name}
                className="w-6 h-6 rounded-full shrink-0"
                style={{
                  boxShadow: `0 0 0 2px ${getClassColor(character.class) ?? "#94a3b8"}`,
                }}
              />
            ) : (
              <span className="w-6 h-6 shrink-0" />
            )}
            <span
              className={`text-sm font-medium font-montserrat flex-1 truncate ${wisher.obtained ? "line-through" : ""}`}
              style={{ color: character ? getClassColor(character.class) : undefined }}
            >
              {character?.name ?? `Character #${wisher.character_id}`}
            </span>
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              Priority {wisher.priority ?? "—"}
            </span>
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              {wisher.bonus_rolls} bonus roll{wisher.bonus_rolls !== 1 ? "s" : ""}
            </span>
            <span
              className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              {wisher.pool_size} item{wisher.pool_size !== 1 ? "s" : ""} in pool
            </span>
            {wisher.obtained && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold font-montserrat uppercase tracking-wide text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Acquired
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Character × boss matrix across every current-tier boss at once — deliberately
// less detail per cell than Per-Boss (priority + done + bonus-roll count
// only, no item breakdown), meant to be scanned in one screen rather than
// clicked through boss by boss.
const RaidWideMatrix: FC<{
  overview: RaidRollOverview | undefined;
  raids: Raid[];
  characters: Character[];
  colorMode: string;
}> = ({ overview, raids, characters, colorMode }) => {
  const bosses = raids.flatMap((raid) => raid.bosses ?? []);
  const speccedCharacters = [...characters]
    .filter((c) => c.specialization_id)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (bosses.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No current-tier raids found.
      </p>
    );
  }

  if (speccedCharacters.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No characters with a specialization set yet.
      </p>
    );
  }

  const rollByKey = new Map<string, BossRollOverviewCharacterRoll>();
  for (const bossEntry of overview?.bosses ?? []) {
    for (const roll of bossEntry.rolls) {
      rollByKey.set(`${bossEntry.boss_id}:${roll.character_id}`, roll);
    }
  }

  const stickyColClass = colorMode === "dark" ? "bg-slate-950" : "bg-white";

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              className={`sticky left-0 z-10 px-3 py-2 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${stickyColClass} ${
                colorMode === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Character
            </th>
            {bosses.map((boss) => (
              <th key={boss.id} className="px-2 py-2" title={boss.name}>
                <img
                  src={boss.icon_img_url}
                  alt={boss.name}
                  className="w-7 h-7 rounded mx-auto"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {speccedCharacters.map((character) => (
            <tr key={character.id}>
              <td
                className={`sticky left-0 z-10 px-3 py-2 text-sm font-medium font-montserrat whitespace-nowrap ${stickyColClass}`}
                style={{ color: getClassColor(character.class) }}
              >
                {character.name}
              </td>
              {bosses.map((boss) => {
                const roll = rollByKey.get(`${boss.id}:${character.id}`);
                return (
                  <td
                    key={boss.id}
                    className={`px-2 py-2 text-center border-t ${
                      colorMode === "dark" ? "border-slate-800" : "border-slate-200"
                    } ${
                      roll?.done
                        ? colorMode === "dark"
                          ? "bg-emerald-500/10"
                          : "bg-emerald-50"
                        : ""
                    }`}
                  >
                    {roll ? (
                      <div className="flex flex-col items-center leading-tight">
                        <span
                          className={`text-sm font-semibold font-montserrat ${
                            roll.done
                              ? colorMode === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-700"
                              : colorMode === "dark"
                                ? "text-slate-200"
                                : "text-slate-800"
                          }`}
                        >
                          {roll.priority ?? "—"}
                        </span>
                        {roll.bonus_rolls > 0 && (
                          <span
                            className={`text-[10px] font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {roll.bonus_rolls} BR
                          </span>
                        )}
                      </div>
                    ) : (
                      <span
                        className={colorMode === "dark" ? "text-slate-700" : "text-slate-300"}
                      >
                        —
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AuditLogSection: FC<{
  entries: LootAuditLogEntry[];
  hasMore: boolean;
  onLoadMore: () => void;
  colorMode: string;
}> = ({ entries, hasMore, onLoadMore, colorMode }) => {
  if (entries.length === 0) {
    return (
      <p
        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
      >
        No wishlist activity recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`px-3 py-2 rounded-lg border text-sm font-montserrat ${colorMode === "dark" ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-700"}`}
        >
          <span
            className={colorMode === "dark" ? "text-slate-500" : "text-slate-400"}
          >
            {new Date(entry.created_at).toLocaleString()}
          </span>
          {" | "}
          <span
            className={colorMode === "dark" ? "text-slate-400" : "text-slate-600"}
          >
            User: {entry.acting_user_btag || "Unknown"}
          </span>
          {" | "}
          <span className="font-medium">{entry.character_name}</span>{" "}
          {formatAuditLogAction(entry)}
        </div>
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className={`w-full text-center text-sm font-montserrat py-2 rounded-lg border transition-colors ${
            colorMode === "dark"
              ? "border-slate-700 text-slate-400 hover:bg-slate-800/50"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Load more
        </button>
      )}
    </div>
  );
};

export const Loot: FC = () => {
  useDocumentTitle("Loot");
  const { colorMode } = useTheme();
  const navigate = useNavigate();
  const { "*": tabSlug } = useParams();
  const activeTab = (
    TABS.includes(tabSlug as LootTab) ? tabSlug : "bonus-rolls"
  ) as LootTab;

  const { team } = useTeam();
  const { user } = useUser();
  const teamId = team?.team_id ?? -1;
  const { data: teamData } = useGetTeamById(teamId);

  const myCharacters = (teamData?.players ?? [])
    .filter((p) => p.user && user && String(p.user.id) === String(user.id))
    .flatMap((p) => p.characters ?? []);

  // Same "role" pattern used to gate admin-only UI in Prep.tsx — team.name
  // here is the current user's role name for this team, not the team's name.
  const isLootCouncilOrAdmin = ["owner", "admin", "loot_council"].includes(
    team?.name ?? "",
  );

  const charactersById = new Map<number, Character>(
    (teamData?.players ?? [])
      .flatMap((p) => p.characters ?? [])
      .map((c) => [c.id, c]),
  );

  const playerNameByCharacterId = new Map<number, string>(
    (teamData?.players ?? []).flatMap((p) =>
      (p.characters ?? []).map(
        (c) => [c.id, p.name] as [number, string],
      ),
    ),
  );

  // Loot council/admin/owner can edit any character's plan on behalf of the
  // player (canAccessCharacterWishlist already permits this server-side —
  // this is purely about giving them a way to pick someone else's
  // character). Regular members only ever see their own.
  const editableCharacters = useMemo(
    () =>
      isLootCouncilOrAdmin
        ? [
            ...myCharacters,
            ...(teamData?.players ?? [])
              .filter(
                (p) =>
                  !(p.user && user && String(p.user.id) === String(user.id)),
              )
              .flatMap((p) => p.characters ?? []),
          ]
        : myCharacters,
    [isLootCouncilOrAdmin, myCharacters, teamData, user],
  );

  const [selectedCharacterId, setSelectedCharacterId] = useState<
    number | null
  >(null);
  const [selectedBossId, setSelectedBossId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("Mythic");

  useEffect(() => {
    if (selectedCharacterId !== null) return;
    if (myCharacters.length > 0) {
      setSelectedCharacterId(myCharacters[0].id);
    } else if (editableCharacters.length > 0) {
      setSelectedCharacterId(editableCharacters[0].id);
    }
  }, [myCharacters, editableCharacters, selectedCharacterId]);

  const selectedCharacter =
    editableCharacters.find((c) => c.id === selectedCharacterId) ?? null;
  const isEditingOnBehalfOfOther =
    selectedCharacter !== null &&
    !myCharacters.some((c) => c.id === selectedCharacterId);

  const currentRaids = useCurrentRaids();

  const { data: bossLoot } = useGetBossLoot(
    teamId,
    selectedBossId ?? -1,
    selectedCharacterId ?? -1,
    difficulty,
  );

  const { mutate: toggleWish } = useToggleItemWish(teamId, selectedBossId ?? -1);
  const { mutate: updateObtained } = useUpdateItemObtained(
    teamId,
    selectedBossId ?? -1,
  );
  const {
    mutate: setPriority,
    error: setPriorityError,
    reset: resetSetPriorityError,
  } = useSetBossPriority(teamId, selectedBossId ?? -1);
  const { mutate: setBonusRolls } = useSetBonusRollCount(
    teamId,
    selectedBossId ?? -1,
  );

  const { data: characterPriorities } = useGetCharacterBossPriorities(
    teamId,
    selectedCharacterId ?? -1,
    difficulty,
    activeTab === "bonus-rolls" && !!selectedCharacterId,
  );

  const priorityByBossId = useMemo(
    () =>
      new Map((characterPriorities ?? []).map((p) => [p.boss_id, p.priority])),
    [characterPriorities],
  );

  const priorityValues = (characterPriorities ?? []).map((p) => p.priority);
  const isPriorityOrderValid =
    priorityValues.length === 0 ||
    (new Set(priorityValues).size === priorityValues.length &&
      Math.max(...priorityValues) === priorityValues.length);

  const allCurrentBosses = currentRaids.flatMap((raid) => raid.bosses ?? []);
  const prioritizedBossesInOrder: PriorityBoss[] = [
    ...(characterPriorities ?? []),
  ]
    .sort((a, b) => a.priority - b.priority)
    .map((p) => allCurrentBosses.find((b) => b.id === p.boss_id))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .map((b) => ({ id: b.id, name: b.name, icon_img_url: b.icon_img_url }));

  const [isFixPrioritiesModalOpen, setIsFixPrioritiesModalOpen] =
    useState(false);
  const [isDoneBannerDismissed, setIsDoneBannerDismissed] = useState(false);
  useEffect(() => {
    setIsDoneBannerDismissed(false);
  }, [selectedBossId, selectedCharacterId, difficulty]);

  const { mutate: reorderPriorities } = useReorderBossPriorities(
    teamId,
    selectedCharacterId ?? -1,
  );

  const handleConfirmDoneBossPriorityShift = () => {
    if (!selectedBossId) return;
    reorderPriorities({
      difficulty,
      boss_ids: prioritizedBossesInOrder
        .filter((b) => b.id !== selectedBossId)
        .map((b) => b.id),
    });
  };

  const { data: bossRollOverview } = useGetBossRollOverview(
    teamId,
    selectedBossId ?? -1,
    difficulty,
    activeTab === "per-boss" && isLootCouncilOrAdmin,
  );

  const { data: raidRollOverview } = useGetRaidRollOverview(
    teamId,
    difficulty,
    activeTab === "raid-wide" && isLootCouncilOrAdmin,
  );

  const { data: teamTierSlots } = useGetTeamTierSlots(
    teamId,
    activeTab === "tier-tracker",
  );
  const { data: tierSimData } = useGetTierSimData(
    teamId,
    activeTab === "tier-tracker",
  );

  // Clicking a character in the tier tracker grid jumps the (independently
  // scrollable) sim panel to their spec — kept here rather than local to
  // either component since both need to react to the same selection.
  const [focusedSpecializationId, setFocusedSpecializationId] = useState<
    number | null
  >(null);
  const [isSimPanelOpen, setIsSimPanelOpen] = useState(true);

  const { data: expansionData } = useCurrentExpansion();
  const allSeasons = useMemo(
    () =>
      (expansionData ?? [])
        .flatMap((exp) => exp?.seasons ?? [])
        .sort((a, b) => b.order - a.order),
    [expansionData],
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    null,
  );
  useEffect(() => {
    if (selectedSeasonId !== null) return;
    const current = allSeasons.find((s) => s.is_current);
    if (current) setSelectedSeasonId(current.id);
  }, [allSeasons, selectedSeasonId]);

  const { data: boeData } = useGetBoeSales(
    teamId,
    selectedSeasonId,
    activeTab === "boe",
  );
  const [isBoeModalOpen, setIsBoeModalOpen] = useState(false);
  const [editingBoeSale, setEditingBoeSale] = useState<BoeSale | null>(null);
  const openCreateBoeModal = () => {
    setEditingBoeSale(null);
    setIsBoeModalOpen(true);
  };
  const openEditBoeModal = (sale: BoeSale) => {
    setEditingBoeSale(sale);
    setIsBoeModalOpen(true);
  };

  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<LootItemSearchResult | null>(
    null,
  );
  const { data: itemSearchResults } = useSearchLootItems(
    teamId,
    itemSearchQuery,
  );
  const { data: itemRollOverview } = useGetItemRollOverview(
    teamId,
    selectedItem?.item_id ?? -1,
    difficulty,
    activeTab === "per-item" && isLootCouncilOrAdmin && !!selectedItem,
  );

  // Lets council jump from an item in Per-Boss's Item Interest straight into
  // Per-Item's focused breakdown, skipping the search step entirely.
  const handleSelectItemFromBoss = (item: BossRollOverviewItem) => {
    const bossName =
      currentRaids
        .flatMap((raid) => raid.bosses ?? [])
        .find((boss) => boss.id === selectedBossId)?.name ?? "";
    setSelectedItem({
      item_id: item.id,
      wow_item_id: item.wow_item_id,
      name: item.name,
      icon_url: item.icon_url,
      boss_id: selectedBossId ?? -1,
      boss_name: bossName,
    });
    setItemSearchQuery("");
    navigate("/loot/per-item", { replace: true });
  };

  const [auditLogFilterCharacterId, setAuditLogFilterCharacterId] = useState<
    number | null
  >(null);
  const [auditLogFilterBossId, setAuditLogFilterBossId] = useState<
    number | null
  >(null);
  const [auditLogEntries, setAuditLogEntries] = useState<LootAuditLogEntry[]>(
    [],
  );
  const [auditLogBeforeId, setAuditLogBeforeId] = useState<
    number | undefined
  >(undefined);
  const { data: auditLogPage } = useGetLootAuditLog(
    teamId,
    {
      characterId: auditLogFilterCharacterId ?? undefined,
      bossId: auditLogFilterBossId ?? undefined,
      beforeId: auditLogBeforeId,
    },
    activeTab === "audit-log" && isLootCouncilOrAdmin,
  );

  useEffect(() => {
    if (!auditLogPage) return;
    setAuditLogEntries((prev) =>
      auditLogBeforeId ? [...prev, ...auditLogPage.entries] : auditLogPage.entries,
    );
    // Only re-run when a new page actually arrives — auditLogBeforeId is
    // read for its value at that moment (append vs. replace), not tracked
    // as its own trigger (that would double-fire and duplicate entries).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditLogPage]);

  const handleAuditLogCharacterFilterChange = (id: number | null) => {
    setAuditLogFilterCharacterId(id);
    setAuditLogBeforeId(undefined);
    setAuditLogEntries([]);
  };

  const handleAuditLogBossFilterChange = (id: number | null) => {
    setAuditLogFilterBossId(id);
    setAuditLogBeforeId(undefined);
    setAuditLogEntries([]);
  };

  const handleLoadMoreAuditLog = () => {
    if (auditLogEntries.length > 0) {
      setAuditLogBeforeId(auditLogEntries[auditLogEntries.length - 1].id);
    }
  };

  const characterOptions: DropdownOption[] = editableCharacters.map((c) => {
    const classColor = getClassColor(c.class) ?? "#94a3b8";
    const isMine = myCharacters.some((mc) => mc.id === c.id);
    return {
      label: c.name,
      value: String(c.id),
      labelColor: classColor,
      description: !isMine ? playerNameByCharacterId.get(c.id) : undefined,
      icon: c.specialization?.icon_url ? (
        <img
          src={c.specialization.icon_url}
          alt=""
          className="w-5 h-5 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${classColor}` }}
        />
      ) : (
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: classColor }}
        />
      ),
    };
  });

  const wishedItems = bossLoot?.items.filter((i) => i.wished) ?? [];
  const hasWishedItems = wishedItems.length > 0;
  const isDoneWithBoss =
    hasWishedItems && wishedItems.every((i) => i.obtained);

  return (
    <div className="w-full min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="space-y-2">
          <h1
            className={`font-montserrat text-4xl font-bold ${colorMode === "dark" ? "text-white" : "text-black"}`}
          >
            Loot
          </h1>
          <p
            className={colorMode === "dark" ? "text-slate-400" : "text-slate-600"}
          >
            Plan which bosses you're sending bonus rolls on this tier
          </p>
        </div>

        <div
          className={`flex gap-1 border-b ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => navigate(`/loot/${tab}`, { replace: true })}
              className={`px-4 py-2 text-sm font-medium font-montserrat border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-cyan-500 text-cyan-500"
                  : colorMode === "dark"
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {activeTab === "per-boss" ? (
          !isLootCouncilOrAdmin ? (
            <div
              className={`rounded-xl border p-12 text-center ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800 text-slate-500"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <p className="text-sm font-montserrat">
                Loot council, admin, or owner access required to view this
                tab.
              </p>
            </div>
          ) : (
            <div className="flex gap-6">
              <LootBossSidebar
                selectedBossId={selectedBossId}
                onSelectBoss={setSelectedBossId}
              />
              <div className="flex-1 min-w-0 space-y-4">
                <div
                  className={`inline-flex rounded-lg border p-1 ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}`}
                >
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-1.5 text-sm font-medium font-montserrat rounded-md transition-colors ${
                        difficulty === d
                          ? "bg-cyan-500 text-white"
                          : colorMode === "dark"
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {!selectedBossId ? (
                  <p
                    className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Select a boss from the sidebar.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h2
                        className={`text-xs font-medium font-montserrat uppercase tracking-wide ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Roll Interest
                      </h2>
                      <RollInterestSection
                        rolls={bossRollOverview?.rolls ?? []}
                        charactersById={charactersById}
                        colorMode={colorMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <h2
                        className={`text-xs font-medium font-montserrat uppercase tracking-wide ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Item Interest
                      </h2>
                      <ItemInterestSection
                        items={bossRollOverview?.items ?? []}
                        bonusIds={bossRollOverview?.bonus_ids ?? ""}
                        charactersById={charactersById}
                        colorMode={colorMode}
                        onSelectItem={handleSelectItemFromBoss}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        ) : activeTab === "raid-wide" ? (
          !isLootCouncilOrAdmin ? (
            <div
              className={`rounded-xl border p-12 text-center ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800 text-slate-500"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <p className="text-sm font-montserrat">
                Loot council, admin, or owner access required to view this
                tab.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`inline-flex rounded-lg border p-1 ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}`}
              >
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 text-sm font-medium font-montserrat rounded-md transition-colors ${
                      difficulty === d
                        ? "bg-cyan-500 text-white"
                        : colorMode === "dark"
                          ? "text-slate-400 hover:text-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <RaidWideMatrix
                overview={raidRollOverview}
                raids={currentRaids}
                characters={Array.from(charactersById.values())}
                colorMode={colorMode}
              />
            </div>
          )
        ) : activeTab === "per-item" ? (
          !isLootCouncilOrAdmin ? (
            <div
              className={`rounded-xl border p-12 text-center ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800 text-slate-500"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <p className="text-sm font-montserrat">
                Loot council, admin, or owner access required to view this
                tab.
              </p>
            </div>
          ) : (
            <div className="max-w-xl space-y-4">
              <div
                className={`inline-flex rounded-lg border p-1 ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}`}
              >
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 text-sm font-medium font-montserrat rounded-md transition-colors ${
                      difficulty === d
                        ? "bg-cyan-500 text-white"
                        : colorMode === "dark"
                          ? "text-slate-400 hover:text-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {!selectedItem ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="text"
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      placeholder="Search for an item by name..."
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border font-montserrat ${
                        colorMode === "dark"
                          ? "bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {itemSearchQuery &&
                    (!itemSearchResults || itemSearchResults.length === 0 ? (
                      <p
                        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                      >
                        No items found.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {itemSearchResults.map((result) => (
                          <button
                            key={result.item_id}
                            onClick={() => {
                              setSelectedItem(result);
                              setItemSearchQuery("");
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors ${
                              colorMode === "dark"
                                ? "border-slate-800 hover:bg-slate-800/50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <img
                              src={result.icon_url}
                              alt=""
                              className="w-8 h-8 rounded-md border border-slate-700 shadow-sm shrink-0"
                            />
                            <span
                              className={`text-sm font-medium font-montserrat truncate flex-1 ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
                            >
                              {result.name}
                            </span>
                            <span
                              className={`text-xs font-montserrat shrink-0 ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {result.boss_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
                  >
                    <WowheadItemIcon
                      wowItemId={selectedItem.wow_item_id}
                      bonusIds={itemRollOverview?.bonus_ids ?? ""}
                      iconUrl={selectedItem.icon_url}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold font-montserrat truncate ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
                      >
                        {selectedItem.name}
                      </p>
                      <p
                        className={`text-xs font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {selectedItem.boss_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      title="Change item"
                      className={`p-1 rounded-md shrink-0 transition-colors ${colorMode === "dark" ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <ItemWisherSection
                    wishers={itemRollOverview?.wishers ?? []}
                    charactersById={charactersById}
                    colorMode={colorMode}
                  />
                </>
              )}
            </div>
          )
        ) : activeTab === "tier-tracker" ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 space-y-3">
              <h2
                className={`text-lg font-semibold font-montserrat ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
              >
                Tier acquisition
              </h2>
              <TierTrackerGrid
                teamId={teamId}
                characters={Array.from(charactersById.values())}
                tierSlots={teamTierSlots ?? []}
                canEditCharacter={(characterId) =>
                  isLootCouncilOrAdmin || myCharacters.some((c) => c.id === characterId)
                }
                colorMode={colorMode}
                onSelectCharacter={setFocusedSpecializationId}
              />
            </div>

            {isSimPanelOpen ? (
              <div className="w-full lg:w-[720px] shrink-0 space-y-3 lg:sticky lg:top-4">
                <div className="flex items-center justify-between gap-2">
                  <h2
                    className={`text-lg font-semibold font-montserrat ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
                  >
                    Tier sim data
                  </h2>
                  <button
                    onClick={() => setIsSimPanelOpen(false)}
                    title="Hide tier sim data"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      colorMode === "dark"
                        ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                        : "border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
                <TierSimTable
                  entries={tierSimData?.tier_sim_entries ?? []}
                  lastUpdated={tierSimData?.last_updated ?? null}
                  colorMode={colorMode}
                  focusedSpecializationId={focusedSpecializationId}
                />
              </div>
            ) : (
              <div className="shrink-0 lg:sticky lg:top-4">
                <button
                  onClick={() => setIsSimPanelOpen(true)}
                  title="Show tier sim data"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium font-montserrat transition-colors ${
                    colorMode === "dark"
                      ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                      : "border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <ChevronsLeft className="w-4 h-4" />
                  Tier sim data
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "boe" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="w-56">
                <Dropdown
                  label="Season"
                  value={selectedSeasonId !== null ? String(selectedSeasonId) : ""}
                  onChange={(value) => {
                    const id = Array.isArray(value) ? value[0] : value;
                    setSelectedSeasonId(id ? Number(id) : null);
                  }}
                  options={allSeasons.map((season) => ({
                    label: season.name,
                    value: String(season.id),
                  }))}
                />
              </div>
              {isLootCouncilOrAdmin && (
                <Button variant="primary" onClick={openCreateBoeModal}>
                  <Plus className="w-4 h-4" />
                  Add BoE Sale
                </Button>
              )}
            </div>
            <BoeSalesTable
              teamId={teamId}
              sales={boeData?.sales ?? []}
              totals={boeData?.totals ?? { sale_price: 0, guild_cut: 0, player_cut: 0 }}
              canManage={isLootCouncilOrAdmin}
              colorMode={colorMode}
              onEdit={openEditBoeModal}
            />
          </div>
        ) : activeTab === "audit-log" ? (
          !isLootCouncilOrAdmin ? (
            <div
              className={`rounded-xl border p-12 text-center ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800 text-slate-500"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <p className="text-sm font-montserrat">
                Loot council, admin, or owner access required to view this
                tab.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-4">
                <Dropdown
                  label="Character"
                  value={
                    auditLogFilterCharacterId !== null
                      ? String(auditLogFilterCharacterId)
                      : ""
                  }
                  onChange={(value) => {
                    const id = Array.isArray(value) ? value[0] : value;
                    handleAuditLogCharacterFilterChange(
                      id ? Number(id) : null,
                    );
                  }}
                  options={[
                    { label: "All characters", value: "" },
                    ...Array.from(charactersById.values()).map((c) => ({
                      label: c.name,
                      value: String(c.id),
                    })),
                  ]}
                />
                <Dropdown
                  label="Boss"
                  value={
                    auditLogFilterBossId !== null
                      ? String(auditLogFilterBossId)
                      : ""
                  }
                  onChange={(value) => {
                    const id = Array.isArray(value) ? value[0] : value;
                    handleAuditLogBossFilterChange(id ? Number(id) : null);
                  }}
                  options={[
                    { label: "All bosses", value: "" },
                    ...currentRaids
                      .flatMap((raid) => raid.bosses ?? [])
                      .map((boss) => ({
                        label: boss.name,
                        value: String(boss.id),
                      })),
                  ]}
                />
              </div>

              <AuditLogSection
                entries={auditLogEntries}
                hasMore={auditLogPage?.has_more ?? false}
                onLoadMore={handleLoadMoreAuditLog}
                colorMode={colorMode}
              />
            </div>
          )
        ) : activeTab !== "bonus-rolls" ? (
          <div
            className={`rounded-xl border p-12 text-center ${
              colorMode === "dark"
                ? "bg-slate-900/50 border-slate-800 text-slate-500"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            <p className="text-sm font-montserrat">
              {TAB_LABELS[activeTab]} — coming soon
            </p>
          </div>
        ) : editableCharacters.length === 0 ? (
          <div
            className={`rounded-xl border p-12 text-center ${
              colorMode === "dark"
                ? "bg-slate-900/50 border-slate-800 text-slate-500"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            <p className="text-sm font-montserrat">
              {isLootCouncilOrAdmin
                ? "No characters on this team yet."
                : "Claim a character in the Roster tab to start planning bonus rolls."}
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex flex-col gap-3 w-56 shrink-0">
              <Dropdown
                label="Character"
                value={
                  selectedCharacterId !== null
                    ? String(selectedCharacterId)
                    : ""
                }
                onChange={(value) => {
                  const id = Array.isArray(value) ? value[0] : value;
                  if (id) setSelectedCharacterId(Number(id));
                }}
                options={characterOptions}
                disabled={editableCharacters.length <= 1}
              />
              <LootBossSidebar
                selectedBossId={selectedBossId}
                onSelectBoss={setSelectedBossId}
                priorityByBossId={priorityByBossId}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`inline-flex rounded-lg border p-1 ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}`}
                >
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-1.5 text-sm font-medium font-montserrat rounded-md transition-colors ${
                        difficulty === d
                          ? "bg-cyan-500 text-white"
                          : colorMode === "dark"
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {isEditingOnBehalfOfOther && selectedCharacter && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium font-montserrat ${
                      colorMode === "dark"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    Editing {selectedCharacter.name}&apos;s plan on behalf of{" "}
                    {playerNameByCharacterId.get(selectedCharacter.id) ??
                      "another player"}
                    .
                  </div>
                )}

                {!isPriorityOrderValid && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium font-montserrat ${
                      colorMode === "dark"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    Your {difficulty} priorities aren&apos;t in order — two
                    bosses may share a rank, or there&apos;s a gap.
                    <button
                      onClick={() => setIsFixPrioritiesModalOpen(true)}
                      className="underline font-semibold shrink-0"
                    >
                      Fix priorities
                    </button>
                  </div>
                )}

                {isDoneWithBoss &&
                  (bossLoot?.priority == null || isDoneBannerDismissed ? (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium font-montserrat ${
                        colorMode === "dark"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Done with this boss — every item you wished for has
                      been obtained.
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium font-montserrat ${
                        colorMode === "dark"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        You&apos;ve obtained everything you wished for on
                        this boss. Confirm to clear its {difficulty}{" "}
                        priority and shift your other priorities down to
                        close the gap.
                      </span>
                      <button
                        onClick={handleConfirmDoneBossPriorityShift}
                        className="underline font-semibold shrink-0"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setIsDoneBannerDismissed(true)}
                        className="shrink-0 opacity-70 hover:opacity-100"
                      >
                        Not now
                      </button>
                    </div>
                  ))}
              </div>

              {!selectedBossId ? (
                <p
                  className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  Select a boss from the sidebar.
                </p>
              ) : !selectedCharacter?.specialization_id ? (
                <p
                  className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  {selectedCharacter?.name} has no specialization set — set
                  one in the Roster tab first.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {(bossLoot?.items.length ?? 0) === 0 ? (
                      <p
                        className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                      >
                        No eligible items found for this boss.
                      </p>
                    ) : (
                      bossLoot?.items.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          bonusIds={bossLoot?.bonus_ids ?? ""}
                          colorMode={colorMode}
                          onToggleWish={() =>
                            toggleWish({
                              character_id: selectedCharacterId!,
                              item_id: item.id,
                              difficulty,
                              wished: !item.wished,
                            })
                          }
                          onToggleObtained={() =>
                            updateObtained({
                              character_id: selectedCharacterId!,
                              item_id: item.id,
                              difficulty,
                              obtained: !item.obtained,
                            })
                          }
                        />
                      ))
                    )}
                  </div>

                  {hasWishedItems && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        className={`text-xs font-medium font-montserrat uppercase tracking-wide ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Priority on this boss
                      </label>
                      <input
                        key={`${selectedBossId}-${selectedCharacterId}-${difficulty}`}
                        type="number"
                        min={1}
                        defaultValue={bossLoot?.priority ?? undefined}
                        onFocus={() => resetSetPriorityError()}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value > 0) {
                            setPriority({
                              character_id: selectedCharacterId!,
                              difficulty,
                              priority: value,
                            });
                          }
                        }}
                        className={`w-16 px-2 py-1 text-sm rounded-md border ${
                          colorMode === "dark"
                            ? "bg-slate-800 border-slate-700 text-slate-200"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      />
                      {setPriorityError && (
                        <span className="text-xs font-montserrat text-rose-500">
                          {setPriorityError.message}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label
                      className={`text-xs font-medium font-montserrat uppercase tracking-wide ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Bonus rolls sent
                    </label>
                    <button
                      onClick={() =>
                        setBonusRolls({
                          character_id: selectedCharacterId!,
                          difficulty,
                          count: Math.max(0, (bossLoot?.bonus_rolls ?? 0) - 1),
                        })
                      }
                      className={`p-1 rounded-md border ${colorMode === "dark" ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-300 text-slate-800 hover:bg-slate-100"}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`text-sm font-montserrat w-6 text-center ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
                    >
                      {bossLoot?.bonus_rolls ?? 0}
                    </span>
                    <button
                      onClick={() =>
                        setBonusRolls({
                          character_id: selectedCharacterId!,
                          difficulty,
                          count: (bossLoot?.bonus_rolls ?? 0) + 1,
                        })
                      }
                      className={`p-1 rounded-md border ${colorMode === "dark" ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-300 text-slate-800 hover:bg-slate-100"}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCharacterId && (
        <FixPrioritiesModal
          isOpen={isFixPrioritiesModalOpen}
          onClose={() => setIsFixPrioritiesModalOpen(false)}
          teamId={teamId}
          characterId={selectedCharacterId}
          difficulty={difficulty}
          bosses={prioritizedBossesInOrder}
        />
      )}

      <BoeSaleModal
        isOpen={isBoeModalOpen}
        onClose={setIsBoeModalOpen}
        teamId={teamId}
        sale={editingBoeSale}
      />
    </div>
  );
};
