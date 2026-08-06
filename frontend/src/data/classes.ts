export type ClassColor = { name: string; color: string };

export const CLASS_COLORS: ClassColor[] = [
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

export const CLASS_NAMES = CLASS_COLORS.map((c) => c.name);

export const getClassColor = (className: string): string | undefined =>
  CLASS_COLORS.find((c) => c.name === className)?.color;

// Armor type is fixed per class in WoW (every spec of a class shares one),
// unlike role/primary stat which vary by spec — so this is a flat
// class-name lookup, matching the ArmorType strings seeded on the backend
// (backend/seed/classData.go).
export type ClassArmorType = { name: string; armorType: "Cloth" | "Leather" | "Mail" | "Plate" };

export const CLASS_ARMOR_TYPES: ClassArmorType[] = [
  { name: "Death Knight", armorType: "Plate" },
  { name: "Demon Hunter", armorType: "Leather" },
  { name: "Druid", armorType: "Leather" },
  { name: "Evoker", armorType: "Mail" },
  { name: "Hunter", armorType: "Mail" },
  { name: "Mage", armorType: "Cloth" },
  { name: "Monk", armorType: "Leather" },
  { name: "Paladin", armorType: "Plate" },
  { name: "Priest", armorType: "Cloth" },
  { name: "Rogue", armorType: "Leather" },
  { name: "Shaman", armorType: "Mail" },
  { name: "Warlock", armorType: "Cloth" },
  { name: "Warrior", armorType: "Plate" },
];

export const getArmorType = (className: string): string | undefined =>
  CLASS_ARMOR_TYPES.find((c) => c.name === className)?.armorType;
