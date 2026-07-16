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
