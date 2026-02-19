import { useState, type FC } from "react";
import type { Shape } from "./Planner";

// ── Color swatch data ──────────────────────────────────────────────────────────

const CLASS_COLORS: { name: string; color: string }[] = [
  { name: "Death Knight", color: "#C41E3A" },
  { name: "Demon Hunter", color: "#A330C9" },
  { name: "Druid", color: "#FF7C0A" },
  { name: "Evoker", color: "#33937F" },
  { name: "Hunter", color: "#AAD372" },
  { name: "Mage", color: "#3FC7EB" },
  { name: "Monk", color: "#00FF98" },
  { name: "Paladin", color: "#F48CBA" },
  { name: "Priest", color: "#FFFFFF" },
  { name: "Rogue", color: "#FFF468" },
  { name: "Shaman", color: "#0070DD" },
  { name: "Warlock", color: "#8788EE" },
  { name: "Warrior", color: "#C69B6D" },
];

const PALETTE_COLORS: string[] = [
  // Blues
  "#1E3A8A", "#1D4ED8", "#3B82F6", "#60A5FA", "#BFDBFE",
  // Reds
  "#7F1D1D", "#DC2626", "#EF4444", "#F87171", "#FECACA",
  // Greens
  "#14532D", "#16A34A", "#22C55E", "#4ADE80", "#BBF7D0",
  // Yellows
  "#78350F", "#D97706", "#EAB308", "#FCD34D", "#FEF9C3",
  // Greys
  "#0A0A0A", "#3F3F46", "#71717A", "#A1A1AA", "#D4D4D8", "#FAFAFA",
];

const ALL_SWATCH_COLORS = new Set([
  ...CLASS_COLORS.map((c) => c.color.toLowerCase()),
  ...PALETTE_COLORS.map((c) => c.toLowerCase()),
]);

const RECENT_KEY = "krankenprep-recent-colors";
const MAX_RECENT = 5;

const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeRecent = (colors: string[]): void => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(colors));
  } catch {
    // ignore
  }
};

// ── ColorPicker ────────────────────────────────────────────────────────────────

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const Swatch: FC<{
  color: string;
  title: string;
  active: boolean;
  onSelect: (color: string) => void;
}> = ({ color, title, active, onSelect }) => (
  <button
    title={title}
    onClick={() => onSelect(color)}
    style={{ backgroundColor: color }}
    className={`w-4 h-4 rounded-sm cursor-pointer hover:scale-125 transition-transform shrink-0 ${
      active
        ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 border border-slate-900"
        : "border border-slate-600"
    }`}
  />
);

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange }) => {
  const [recentColors, setRecentColors] = useState<string[]>(readRecent);

  const applyColor = (color: string) => {
    onChange(color);
    const normalized = color.toLowerCase();
    if (!ALL_SWATCH_COLORS.has(normalized)) {
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== normalized);
        const next = [normalized, ...filtered].slice(0, MAX_RECENT);
        writeRecent(next);
        return next;
      });
    }
  };

  const activeNorm = value.toLowerCase();

  return (
    <div className="space-y-2">
      {/* Native picker + hex input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => applyColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-slate-700 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => applyColor(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
        />
      </div>

      {/* Class colors */}
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">
          Classes
        </div>
        <div className="flex flex-wrap gap-1">
          {CLASS_COLORS.map(({ name, color }) => (
            <Swatch
              key={color}
              color={color}
              title={name}
              active={activeNorm === color.toLowerCase()}
              onSelect={applyColor}
            />
          ))}
        </div>
      </div>

      {/* General palette */}
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">
          Palette
        </div>
        <div className="flex flex-wrap gap-1">
          {PALETTE_COLORS.map((color) => (
            <Swatch
              key={color}
              color={color}
              title={color}
              active={activeNorm === color.toLowerCase()}
              onSelect={applyColor}
            />
          ))}
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">
            Recent
          </div>
          <div className="flex gap-1">
            {recentColors.map((color) => (
              <Swatch
                key={color}
                color={color}
                title={color}
                active={activeNorm === color}
                onSelect={applyColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Class / shape helpers (unchanged) ─────────────────────────────────────────

type PropertiesPanelProps = {
  selectedShape: Shape | null;
  onUpdate: (changes: Partial<Shape>) => void;
};

// Mapping of base class icons to their specializations
const classSpecializations: Record<string, { name: string; src: string }[]> = {
  "/deathknight.png": [
    { name: "Death Knight", src: "/deathknight.png" },
    { name: "Blood", src: "/icons/classes/deathknight_blood.png" },
    { name: "Frost", src: "/icons/classes/deathknight_frost.png" },
    { name: "Unholy", src: "/icons/classes/deathknight_unholy.png" },
  ],
  "/demonhunter.png": [
    { name: "Demon Hunter", src: "/demonhunter.png" },
    { name: "Havoc", src: "/icons/classes/demonhunter_havoc.png" },
    { name: "Vengeance", src: "/icons/classes/demonhunter_vengeance.png" },
  ],
  "/druid.png": [
    { name: "Druid", src: "/druid.png" },
    { name: "Balance", src: "/icons/classes/druid_balance.png" },
    { name: "Feral", src: "/icons/classes/druid_feral.png" },
    { name: "Guardian", src: "/icons/classes/druid_guardian.png" },
    { name: "Restoration", src: "/icons/classes/druid_restoration.png" },
  ],
  "/evoker.png": [
    { name: "Evoker", src: "/evoker.png" },
    { name: "Augmentation", src: "/icons/classes/evoker_augmentation.png" },
    { name: "Devastation", src: "/icons/classes/evoker_devastation.png" },
    { name: "Preservation", src: "/icons/classes/evoker_preservation.png" },
  ],
  "/hunter.png": [
    { name: "Hunter", src: "/hunter.png" },
    { name: "Beast Mastery", src: "/icons/classes/hunter_beastmastery.png" },
    { name: "Marksmanship", src: "/icons/classes/hunter_marksmenship.png" },
    { name: "Survival", src: "/icons/classes/hunter_survival.png" },
  ],
  "/mage.png": [
    { name: "Mage", src: "/mage.png" },
    { name: "Arcane", src: "/icons/classes/mage_arcane.png" },
    { name: "Fire", src: "/icons/classes/mage_fire.png" },
    { name: "Frost", src: "/icons/classes/mage_frost.png" },
  ],
  "/monk.png": [
    { name: "Monk", src: "/monk.png" },
    { name: "Brewmaster", src: "/icons/classes/monk_brewmaster.png" },
    { name: "Mistweaver", src: "/icons/classes/monk_mistweaver.png" },
    { name: "Windwalker", src: "/icons/classes/monk_windwalker.png" },
  ],
  "/paladin.png": [
    { name: "Paladin", src: "/paladin.png" },
    { name: "Holy", src: "/icons/classes/paladin_holy.png" },
    { name: "Protection", src: "/icons/classes/paladin_protection.png" },
    { name: "Retribution", src: "/icons/classes/paladin_retribution.png" },
  ],
  "/priest.png": [
    { name: "Priest", src: "/priest.png" },
    { name: "Discipline", src: "/icons/classes/priest_discipline.png" },
    { name: "Holy", src: "/icons/classes/priest_holy.png" },
    { name: "Shadow", src: "/icons/classes/priest_shadow.png" },
  ],
  "/rogue.png": [
    { name: "Rogue", src: "/rogue.png" },
    { name: "Assassination", src: "/icons/classes/rogue_assassination.png" },
    { name: "Outlaw", src: "/icons/classes/rogue_outlaw.png" },
    { name: "Subtlety", src: "/icons/classes/rogue_subtlety.png" },
  ],
  "/shaman.png": [
    { name: "Shaman", src: "/shaman.png" },
    { name: "Elemental", src: "/icons/classes/shaman_elemental.png" },
    { name: "Enhancement", src: "/icons/classes/shaman_enhancement.png" },
    { name: "Restoration", src: "/icons/classes/shaman_restoration.png" },
  ],
  "/warlock.png": [
    { name: "Warlock", src: "/warlock.png" },
    { name: "Affliction", src: "/icons/classes/warlock_affliction.png" },
    { name: "Demonology", src: "/icons/classes/warlock_demonology.png" },
    { name: "Destruction", src: "/icons/classes/warlock_destruction.png" },
  ],
  "/warrior.png": [
    { name: "Warrior", src: "/warrior.png" },
    { name: "Arms", src: "/icons/classes/warrior_arms.png" },
    { name: "Fury", src: "/icons/classes/warrior_fury.png" },
    { name: "Protection", src: "/icons/classes/warrior_protection.png" },
  ],
};

const findClassForIcon = (src: string): string | null => {
  if (classSpecializations[src]) return src;
  for (const [baseClass, specs] of Object.entries(classSpecializations)) {
    if (specs.some((spec) => spec.src === src)) return baseClass;
  }
  return null;
};

const isClassIcon = (shape: Shape): boolean => {
  if (shape.type !== "img" || !shape.src) return false;
  return findClassForIcon(shape.src) !== null;
};

const getShapeCategory = (
  shape: Shape,
): "shape" | "class" | "image" | "line" | "text" => {
  if (shape.type === "line") return "line";
  if (shape.type === "text") return "text";
  if (
    shape.type === "rect" ||
    shape.type === "circle" ||
    shape.type === "triangle" ||
    shape.type === "right triangle"
  )
    return "shape";
  if (isClassIcon(shape)) return "class";
  return "image";
};

// ── PropertiesPanel ────────────────────────────────────────────────────────────

export const PropertiesPanel: FC<PropertiesPanelProps> = ({
  selectedShape,
  onUpdate,
}) => {
  const category = selectedShape ? getShapeCategory(selectedShape) : null;

  const baseClassSrc = selectedShape?.src
    ? findClassForIcon(selectedShape.src)
    : null;
  const specs = baseClassSrc ? classSpecializations[baseClassSrc] : undefined;

  return (
    <div className="flex flex-col gap-2.5 p-2.5 bg-linear-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700 w-56">
      <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
        Properties
      </h3>

      {!selectedShape ? (
        <div className="text-xs text-slate-400 text-center py-4">
          Select an item to edit properties
        </div>
      ) : (
        <>
          {/* Opacity */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
              Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedShape.opacity ?? 1}
                onChange={(e) =>
                  onUpdate({ opacity: parseFloat(e.target.value) })
                }
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[10px] text-slate-300 font-medium w-8 text-right">
                {Math.round((selectedShape.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Label */}
          {category !== "text" && category !== "line" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Label
              </label>
              <input
                type="text"
                value={selectedShape.text || ""}
                onChange={(e) =>
                  onUpdate({ text: e.target.value || undefined })
                }
                placeholder="Add label..."
                className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          {/* Specialization */}
          {category === "class" && specs && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Specialization
              </label>
              <select
                value={selectedShape.src || ""}
                onChange={(e) => onUpdate({ src: e.target.value })}
                className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-slate-600 focus:border-cyan-500 focus:outline-none"
              >
                {specs.map((spec) => (
                  <option key={spec.src} value={spec.src}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shape stroke */}
          {category === "shape" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Stroke
              </label>
              <ColorPicker
                value={selectedShape.stroke || "#ffffff"}
                onChange={(color) => onUpdate({ stroke: color })}
              />
            </div>
          )}

          {/* Shape fill */}
          {category === "shape" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Fill
              </label>
              <ColorPicker
                value={selectedShape.fill || "#ffffff"}
                onChange={(color) => onUpdate({ fill: color })}
              />
            </div>
          )}

          {/* Shape stroke width */}
          {category === "shape" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Stroke Width
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={selectedShape.strokeWidth ?? 1}
                  onChange={(e) =>
                    onUpdate({ strokeWidth: parseInt(e.target.value) })
                  }
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-300 font-medium w-8 text-right">
                  {selectedShape.strokeWidth ?? 1}px
                </span>
              </div>
            </div>
          )}

          {/* Line stroke */}
          {category === "line" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Stroke
              </label>
              <ColorPicker
                value={selectedShape.stroke || "#ffffff"}
                onChange={(color) => onUpdate({ stroke: color })}
              />
            </div>
          )}

          {/* Line stroke width */}
          {category === "line" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Stroke Width
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={selectedShape.strokeWidth ?? 2}
                  onChange={(e) =>
                    onUpdate({ strokeWidth: parseInt(e.target.value) })
                  }
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-300 font-medium w-8 text-right">
                  {selectedShape.strokeWidth ?? 2}px
                </span>
              </div>
            </div>
          )}

          {/* Text color */}
          {category === "text" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Text Color
              </label>
              <ColorPicker
                value={selectedShape.fill || "#ffffff"}
                onChange={(color) => onUpdate({ fill: color })}
              />
            </div>
          )}

          {/* Font size */}
          {category === "text" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="8"
                  max="72"
                  step="1"
                  value={selectedShape.fontSize ?? 24}
                  onChange={(e) =>
                    onUpdate({ fontSize: parseInt(e.target.value) })
                  }
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-300 font-medium w-8 text-right">
                  {selectedShape.fontSize ?? 24}px
                </span>
              </div>
            </div>
          )}

          {/* Font family */}
          {category === "text" && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Font Family
              </label>
              <select
                value={selectedShape.fontFamily || "Arial"}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-slate-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};
