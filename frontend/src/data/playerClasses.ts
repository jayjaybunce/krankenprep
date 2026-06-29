const PLAYER_CLASSES: Record<string, string> = {
  wynsloww: "Priest",
  gruesum: "Death Knight",
  arx: "Death Knight",
  krankenmight: "Evoker",
  goomt: "Rogue",
  metzinger: "Demon Hunter",
  pkrz: "Shaman",
  funkdrip: "Shaman",
  tatros: "Paladin",
  tettybear: "Druid",
  magicpally: "Paladin",
  skellestone: "Warlock",
  lyconic: "Warlock",
  jaemsy: "Warrior",
  deeznutticus: "Warrior",
  "brímmy": "Mage",
  wipe: "Mage",
  sobiezhunter: "Hunter",
  zaghunt: "Hunter",
  stridur: "Hunter",
  uchai: "Monk",
  paperbonk: "Paladin",
  beatsi: "Evoker"
};

export const getPlayerClass = (name: string): string | undefined =>
  PLAYER_CLASSES[name.toLowerCase()];
