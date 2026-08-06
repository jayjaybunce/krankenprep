import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useSetCharacterTierSlot } from "../../api/mutationHooks";
import type { Character } from "../../api/queryHooks";
import type { TierSlotEntry } from "../../api/queryHooks";
import { getArmorType, getClassColor } from "../../data/classes";

// Same fixed group order as TierSimTable's armor-type grouping.
const ARMOR_TYPE_ORDER = ["Cloth", "Leather", "Mail", "Plate"];

// The 5 WoW tier-token slots, in the order they're tracked — matches the
// backend's TierSlot* constants exactly (backend/models/tier.go).
const TIER_SLOTS = ["Head", "Shoulder", "Chest", "Legs", "Gloves"] as const;

// Matches the backend's TierSource* constants exactly — SOURCE_STYLES below
// maps each to its display label/color. "None" is the default — an explicit,
// selectable value rather than just "no row saved yet" — so a slot can be
// reset back to it from the menu like any other value.
const TIER_SOURCES = [
  "None",
  "Champ",
  "Vet",
  "Hero",
  "Myth",
  "Embellishment",
  "In Vault",
] as const;

const DEFAULT_SOURCE = "None";

const SOURCE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  Champ: { label: "Champion", bg: "#16a34a", text: "#ffffff" },
  Vet: { label: "Veteran", bg: "#2563eb", text: "#ffffff" },
  Hero: { label: "Hero", bg: "#4338ca", text: "#ffffff" },
  Myth: { label: "Myth", bg: "#f97316", text: "#ffffff" },
  Embellishment: { label: "Embellishment", bg: "#64748b", text: "#ffffff" },
  "In Vault": { label: "In Vault", bg: "#ede9fe", text: "#6d28d9" },
};

// "None" keeps the same theme-aware neutral background the very first pass
// used for an unset slot (before the other 6 values got solid colors),
// rather than a fixed hex pair — it should recede, not read as a 7th color.
const noneSourceClassName = (colorMode: string) =>
  colorMode === "dark" ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400";

const sourcePill = (
  source: string,
  colorMode: string,
): { label: string; className: string; style: { backgroundColor: string; color: string } | undefined } =>
  source === DEFAULT_SOURCE
    ? { label: "None", className: noneSourceClassName(colorMode), style: undefined }
    : {
        label: SOURCE_STYLES[source].label,
        className: "",
        style: { backgroundColor: SOURCE_STYLES[source].bg, color: SOURCE_STYLES[source].text },
      };

// Slots set to one of these 4 count toward the 2pc/4pc tier bonus —
// Embellishment (an embellishment was used in that slot instead) and In
// Vault (not yet acquired) don't.
const ACQUIRED_SOURCES = new Set(["Champ", "Vet", "Hero", "Myth"]);

// A small dedicated color-coded pill selector for the 6 fixed tier-source
// values — the generic Dropdown component doesn't support per-option solid
// background colors, and this feature's whole point is at-a-glance color
// coding, so a purpose-built control is a better fit than bending a shared
// component every other picker in the app also uses.
const TierSourceSelect: FC<{
  value: string | null;
  onChange: (source: string) => void;
  colorMode: string;
}> = ({ value, onChange, colorMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
  };

  const pill = sourcePill(value ?? DEFAULT_SOURCE, colorMode);

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-xs font-bold font-montserrat transition-opacity hover:opacity-90 ${pill.className}`}
        style={pill.style}
      >
        <span className="truncate">{pill.label}</span>
        <ChevronDown className="w-3 h-3 shrink-0" />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`fixed z-50 rounded-lg border overflow-hidden shadow-xl ${
              colorMode === "dark" ? "border-slate-700" : "border-slate-200"
            }`}
            style={{ top: menuPosition.top, left: menuPosition.left, minWidth: menuPosition.width }}
          >
            {TIER_SOURCES.map((source) => {
              const s = sourcePill(source, colorMode);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => {
                    onChange(source);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2 py-1.5 text-xs font-bold font-montserrat text-left transition-opacity hover:opacity-90 ${s.className}`}
                  style={s.style}
                >
                  {s.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

const TierTrackerRow: FC<{
  character: Character;
  teamId: number;
  slotByName: Map<string, string>;
  canEdit: boolean;
  colorMode: string;
  stickyColClass: string;
  onSelectCharacter?: (specializationId: number) => void;
}> = ({ character, teamId, slotByName, canEdit, colorMode, stickyColClass, onSelectCharacter }) => {
  const { mutate: setTierSlot } = useSetCharacterTierSlot(teamId, character.id);

  const pcCount = TIER_SLOTS.reduce(
    (count, slot) => count + (ACQUIRED_SOURCES.has(slotByName.get(slot) ?? "") ? 1 : 0),
    0,
  );

  return (
    <tr>
      <td
        className={`sticky left-0 z-10 px-3 py-1.5 text-sm font-medium font-montserrat whitespace-nowrap ${stickyColClass}`}
      >
        {character.specialization_id && onSelectCharacter ? (
          <button
            type="button"
            onClick={() => onSelectCharacter(character.specialization_id!)}
            className="hover:underline underline-offset-2 cursor-pointer"
            style={{ color: getClassColor(character.class) }}
            title="Jump to this spec in the tier sim data"
          >
            {character.name}
          </button>
        ) : (
          <span style={{ color: getClassColor(character.class) }}>{character.name}</span>
        )}
      </td>
      {TIER_SLOTS.map((slot) => {
        const value = slotByName.get(slot) ?? null;
        return (
          <td
            key={slot}
            className={`px-1 py-1.5 border-t min-w-28 ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
          >
            {canEdit ? (
              <TierSourceSelect
                value={value}
                onChange={(source) => setTierSlot({ slot, source })}
                colorMode={colorMode}
              />
            ) : (
              <div
                className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold font-montserrat ${sourcePill(value ?? DEFAULT_SOURCE, colorMode).className}`}
                style={sourcePill(value ?? DEFAULT_SOURCE, colorMode).style}
              >
                {sourcePill(value ?? DEFAULT_SOURCE, colorMode).label}
              </div>
            )}
          </td>
        );
      })}
      <td
        className={`px-2 py-1.5 border-t text-center text-sm font-semibold font-montserrat ${
          pcCount >= 4
            ? colorMode === "dark"
              ? "bg-emerald-500/10 border-slate-800 text-emerald-400"
              : "bg-emerald-50 border-slate-200 text-emerald-700"
            : colorMode === "dark"
              ? "border-slate-800 text-slate-200"
              : "border-slate-200 text-slate-800"
        }`}
      >
        {pcCount}pc
      </td>
    </tr>
  );
};

export const TierTrackerGrid: FC<{
  teamId: number;
  characters: Character[];
  tierSlots: TierSlotEntry[];
  canEditCharacter: (characterId: number) => boolean;
  colorMode: string;
  onSelectCharacter?: (specializationId: number) => void;
}> = ({ teamId, characters, tierSlots, canEditCharacter, colorMode, onSelectCharacter }) => {
  const groups = useMemo(() => {
    const byArmorType = new Map<string, Character[]>();
    for (const character of characters) {
      if (!character.specialization_id) continue;
      const armorType = getArmorType(character.class);
      if (!armorType) continue;
      if (!byArmorType.has(armorType)) byArmorType.set(armorType, []);
      byArmorType.get(armorType)!.push(character);
    }
    return ARMOR_TYPE_ORDER.filter((armorType) => byArmorType.has(armorType)).map((armorType) => ({
      armorType,
      characters: [...byArmorType.get(armorType)!].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [characters]);

  const slotsByCharacter = useMemo(() => {
    const map = new Map<number, Map<string, string>>();
    for (const entry of tierSlots) {
      if (!map.has(entry.character_id)) map.set(entry.character_id, new Map());
      map.get(entry.character_id)!.set(entry.slot, entry.source);
    }
    return map;
  }, [tierSlots]);

  if (groups.length === 0) {
    return (
      <p className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}>
        No characters with a specialization set yet.
      </p>
    );
  }

  const stickyColClass = colorMode === "dark" ? "bg-slate-950" : "bg-white";
  const borderClass = colorMode === "dark" ? "border-slate-800" : "border-slate-200";
  const groupHeaderTextClass = colorMode === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              className={`sticky left-0 z-10 px-3 py-1.5 text-left text-xs font-medium font-montserrat uppercase tracking-wide ${stickyColClass} ${
                colorMode === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Character
            </th>
            {TIER_SLOTS.map((slot) => (
              <th
                key={slot}
                className={`px-1 py-1.5 min-w-28 text-xs font-medium font-montserrat uppercase tracking-wide ${
                  colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {slot}
              </th>
            ))}
            <th
              className={`px-2 py-1.5 text-xs font-medium font-montserrat uppercase tracking-wide ${
                colorMode === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Tier
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ armorType, characters: groupCharacters }) => (
            <Fragment key={armorType}>
              <tr>
                <td
                  colSpan={TIER_SLOTS.length + 2}
                  className={`px-3 py-1.5 text-xs font-bold font-montserrat uppercase tracking-wide border-t border-b ${borderClass} ${groupHeaderTextClass}`}
                >
                  {armorType}
                </td>
              </tr>
              {groupCharacters.map((character) => (
                <TierTrackerRow
                  key={character.id}
                  character={character}
                  teamId={teamId}
                  slotByName={slotsByCharacter.get(character.id) ?? new Map()}
                  canEdit={canEditCharacter(character.id)}
                  colorMode={colorMode}
                  stickyColClass={stickyColClass}
                  onSelectCharacter={onSelectCharacter}
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
