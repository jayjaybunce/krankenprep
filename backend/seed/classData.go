package seed

// ============================================================================
// REVIEW REQUIRED before relying on this data for real loot decisions.
//
// Armor type and primary stat per spec are stable, well-known facts and
// should be reliable as drafted. Weapon proficiency per spec is NOT
// guaranteed accurate — it has real per-spec subtlety (confirmed during
// planning: Elemental/Restoration Shaman can equip staves, Enhancement
// cannot, despite being the same class) that isn't fully captured by
// general knowledge. Evoker and Demon Hunter weapon lists are the lowest
// confidence entries here (newest classes, and Demon Hunter's Warglaive is
// a special-cased weapon type whose exact Blizzard subclass ID isn't
// confirmed in this draft). Walk every spec's WeaponTypes list before
// trusting this for real eligibility decisions.
// ============================================================================

// Weapon subclass names, keyed to Blizzard's own item_subclass IDs under
// item_class 2 (Weapon) — confirmed against live data during planning
// (Fist Weapon = 13, Dagger = 15, Mace shown as 2H = 5).
const (
	WeaponAxe1H      = "Axe (One-Hand)"   // Blizzard subclass 0
	WeaponAxe2H      = "Axe (Two-Hand)"   // Blizzard subclass 1
	WeaponBow        = "Bow"              // Blizzard subclass 2
	WeaponGun        = "Gun"              // Blizzard subclass 3
	WeaponMace1H     = "Mace (One-Hand)"  // Blizzard subclass 4
	WeaponMace2H     = "Mace (Two-Hand)"  // Blizzard subclass 5
	WeaponPolearm    = "Polearm"          // Blizzard subclass 6
	WeaponSword1H    = "Sword (One-Hand)" // Blizzard subclass 7
	WeaponSword2H    = "Sword (Two-Hand)" // Blizzard subclass 8
	WeaponWarglaive  = "Warglaive"        // Blizzard subclass 9
	WeaponStaff      = "Staff"            // Blizzard subclass 10
	WeaponFistWeapon = "Fist Weapon"      // Blizzard subclass 13
	WeaponDagger     = "Dagger"           // Blizzard subclass 15
	WeaponCrossbow   = "Crossbow"         // Blizzard subclass 18
	WeaponWand       = "Wand"             // Blizzard subclass 19

	// WeaponShield isn't a real Blizzard weapon subclass — shields are
	// actually Armor subclass 6 (a different ID namespace than weapons
	// entirely). Modeling it as a WeaponType anyway is deliberate: shield
	// eligibility works exactly like weapon eligibility (a spec either can
	// or can't equip one, independent of armor type — Elemental Shaman
	// wears Mail, Protection Paladin wears Plate, yet both can carry a
	// shield), so reusing Specialization.WeaponTypes + Item.WeaponTypeID
	// gets the right behavior for free via IsEligibleFor's existing weapon
	// branch. ID 100 is arbitrary and deliberately outside Blizzard's real
	// weapon-subclass range (which tops out under 20) to avoid ever
	// colliding with an actual weapon subclass.
	WeaponShield = "Shield"
)

// Armor type names, keyed to Blizzard's own item_subclass IDs under
// item_class 4 (Armor) — confirmed against live data during planning
// (Leather = 2).
const (
	ArmorCloth   = "Cloth"   // Blizzard subclass 1
	ArmorLeather = "Leather" // Blizzard subclass 2
	ArmorMail    = "Mail"    // Blizzard subclass 3
	ArmorPlate   = "Plate"   // Blizzard subclass 4
)

// weaponTypeIDs maps name -> Blizzard item_subclass ID, used to seed
// ArmorType/WeaponType rows with IDs that line up with any data source
// (Wowhead or Blizzard's own API) that follows the same numbering.
var weaponTypeIDs = map[string]uint{
	WeaponAxe1H:      0,
	WeaponAxe2H:      1,
	WeaponBow:        2,
	WeaponGun:        3,
	WeaponMace1H:     4,
	WeaponMace2H:     5,
	WeaponPolearm:    6,
	WeaponSword1H:    7,
	WeaponSword2H:    8,
	WeaponWarglaive:  9,
	WeaponStaff:      10,
	WeaponFistWeapon: 13,
	WeaponDagger:     15,
	WeaponCrossbow:   18,
	WeaponWand:       19,
	WeaponShield:     100,
}

var armorTypeIDs = map[string]uint{
	ArmorCloth:   1,
	ArmorLeather: 2,
	ArmorMail:    3,
	ArmorPlate:   4,
}

type classSeed struct {
	Name    string
	Color   string
	IconUrl string
}

// classSeeds mirrors frontend/src/data/classes.ts CLASS_COLORS for Color,
// kept in sync manually (no shared source of truth between the two yet).
// IconUrl values are copied verbatim from the map keys in
// frontend/src/components/Planner/PropertiesPanel.tsx's classSpecializations
// (the app's existing, already-working set of class icon paths) rather than
// re-derived, so there's no risk of drift/typos between the two.
var classSeeds = []classSeed{
	{Name: "Death Knight", Color: "#C41E3A", IconUrl: "/deathknight.png"},
	{Name: "Demon Hunter", Color: "#A330C9", IconUrl: "/demonhunter.png"},
	{Name: "Druid", Color: "#FF7C0A", IconUrl: "/druid.png"},
	{Name: "Evoker", Color: "#33937F", IconUrl: "/evoker.png"},
	{Name: "Hunter", Color: "#AAD372", IconUrl: "/hunter.png"},
	{Name: "Mage", Color: "#3FC7EB", IconUrl: "/mage.png"},
	{Name: "Monk", Color: "#00FF98", IconUrl: "/monk.png"},
	{Name: "Paladin", Color: "#F48CBA", IconUrl: "/paladin.png"},
	{Name: "Priest", Color: "#FFFFFF", IconUrl: "/priest.png"},
	{Name: "Rogue", Color: "#FFF468", IconUrl: "/rogue.png"},
	{Name: "Shaman", Color: "#0070DD", IconUrl: "/shaman.png"},
	{Name: "Warlock", Color: "#8788EE", IconUrl: "/warlock.png"},
	{Name: "Warrior", Color: "#C69B6D", IconUrl: "/warrior.png"},
}

type specSeed struct {
	ClassName   string
	Name        string
	ArmorType   string
	PrimaryStat string
	Role        string // Tank / Healer / DPS — see models.RoleTank etc.
	IconUrl     string
	WeaponTypes []string
}

// specSeeds is the full spec roster. See the REVIEW REQUIRED note above —
// WeaponTypes lists especially need a careful pass before this is trusted.
// Role is standard, stable WoW knowledge and should be reliable as drafted.
var specSeeds = []specSeed{
	// Death Knight — Plate, Strength, all specs share the same melee list.
	{ClassName: "Death Knight", Name: "Blood", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "Tank", IconUrl: "/icons/classes/deathknight_blood.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm}},
	{ClassName: "Death Knight", Name: "Frost", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "DPS", IconUrl: "/icons/classes/deathknight_frost.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm}},
	{ClassName: "Death Knight", Name: "Unholy", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "DPS", IconUrl: "/icons/classes/deathknight_unholy.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm}},

	// Demon Hunter — Leather. Havoc/Vengeance are Agility; Devourer (this
	// game's third, non-standard spec) is Intellect instead — confirmed.
	// Warglaive confirmed Demon-Hunter-exclusive and now modeled as its own
	// weapon type (Blizzard subclass 9). Fist Weapon/Axe/Sword are still an
	// unconfirmed placeholder guess for the rest of the list — only the
	// Warglaive addition and Devourer's stat are confirmed.
	{ClassName: "Demon Hunter", Name: "Havoc", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/demonhunter_havoc.png", WeaponTypes: []string{WeaponFistWeapon, WeaponAxe1H, WeaponSword1H, WeaponWarglaive}},
	{ClassName: "Demon Hunter", Name: "Vengeance", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "Tank", IconUrl: "/icons/classes/demonhunter_vengeance.png", WeaponTypes: []string{WeaponFistWeapon, WeaponAxe1H, WeaponSword1H, WeaponWarglaive}},
	{ClassName: "Demon Hunter", Name: "Devourer", ArmorType: ArmorLeather, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/demonhunter_devourer.jpg", WeaponTypes: []string{WeaponFistWeapon, WeaponAxe1H, WeaponSword1H, WeaponWarglaive}},

	// Druid — Leather. Balance/Restoration Intellect, Feral/Guardian Agility.
	{ClassName: "Druid", Name: "Balance", ArmorType: ArmorLeather, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/druid_balance.png", WeaponTypes: []string{WeaponDagger, WeaponFistWeapon, WeaponMace1H, WeaponStaff, WeaponPolearm}},
	{ClassName: "Druid", Name: "Feral", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/druid_feral.png", WeaponTypes: []string{WeaponDagger, WeaponFistWeapon, WeaponMace1H, WeaponStaff, WeaponPolearm}},
	{ClassName: "Druid", Name: "Guardian", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "Tank", IconUrl: "/icons/classes/druid_guardian.png", WeaponTypes: []string{WeaponDagger, WeaponFistWeapon, WeaponMace1H, WeaponStaff, WeaponPolearm}},
	{ClassName: "Druid", Name: "Restoration", ArmorType: ArmorLeather, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/druid_restoration.png", WeaponTypes: []string{WeaponDagger, WeaponFistWeapon, WeaponMace1H, WeaponStaff, WeaponPolearm}},

	// Evoker — Mail, Intellect, all specs. LOW CONFIDENCE (newest class).
	{ClassName: "Evoker", Name: "Devastation", ArmorType: ArmorMail, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/evoker_devastation.png", WeaponTypes: []string{WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponDagger}},
	{ClassName: "Evoker", Name: "Preservation", ArmorType: ArmorMail, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/evoker_preservation.png", WeaponTypes: []string{WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponDagger}},
	{ClassName: "Evoker", Name: "Augmentation", ArmorType: ArmorMail, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/evoker_augmentation.png", WeaponTypes: []string{WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponDagger}},

	// Hunter — Mail, Agility, all specs share a broad ranged+melee list.
	// Note: "marksmenship" is a typo in the actual icon filename — copied
	// verbatim from PropertiesPanel.tsx since that's the real asset path.
	{ClassName: "Hunter", Name: "Beast Mastery", ArmorType: ArmorMail, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/hunter_beastmastery.png", WeaponTypes: []string{WeaponBow, WeaponGun, WeaponCrossbow, WeaponAxe1H, WeaponAxe2H, WeaponSword1H, WeaponSword2H, WeaponFistWeapon, WeaponDagger, WeaponPolearm}},
	{ClassName: "Hunter", Name: "Marksmanship", ArmorType: ArmorMail, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/hunter_marksmenship.png", WeaponTypes: []string{WeaponBow, WeaponGun, WeaponCrossbow, WeaponAxe1H, WeaponAxe2H, WeaponSword1H, WeaponSword2H, WeaponFistWeapon, WeaponDagger, WeaponPolearm}},
	{ClassName: "Hunter", Name: "Survival", ArmorType: ArmorMail, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/hunter_survival.png", WeaponTypes: []string{WeaponBow, WeaponGun, WeaponCrossbow, WeaponAxe1H, WeaponAxe2H, WeaponSword1H, WeaponSword2H, WeaponFistWeapon, WeaponDagger, WeaponPolearm}},

	// Mage — Cloth, Intellect, all specs.
	{ClassName: "Mage", Name: "Arcane", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/mage_arcane.png", WeaponTypes: []string{WeaponSword1H, WeaponDagger, WeaponWand, WeaponStaff}},
	{ClassName: "Mage", Name: "Fire", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/mage_fire.png", WeaponTypes: []string{WeaponSword1H, WeaponDagger, WeaponWand, WeaponStaff}},
	{ClassName: "Mage", Name: "Frost", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/mage_frost.png", WeaponTypes: []string{WeaponSword1H, WeaponDagger, WeaponWand, WeaponStaff}},

	// Monk — Leather. Mistweaver Intellect, Brewmaster/Windwalker Agility.
	{ClassName: "Monk", Name: "Brewmaster", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "Tank", IconUrl: "/icons/classes/monk_brewmaster.png", WeaponTypes: []string{WeaponStaff, WeaponPolearm, WeaponFistWeapon, WeaponSword1H, WeaponMace1H, WeaponAxe1H}},
	{ClassName: "Monk", Name: "Mistweaver", ArmorType: ArmorLeather, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/monk_mistweaver.png", WeaponTypes: []string{WeaponStaff, WeaponPolearm, WeaponFistWeapon, WeaponSword1H, WeaponMace1H, WeaponAxe1H}},
	{ClassName: "Monk", Name: "Windwalker", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/monk_windwalker.png", WeaponTypes: []string{WeaponStaff, WeaponPolearm, WeaponFistWeapon, WeaponSword1H, WeaponMace1H, WeaponAxe1H}},

	// Paladin — Plate. Holy Intellect, Protection/Retribution Strength.
	// Holy and Protection are both shield-capable (confirmed).
	{ClassName: "Paladin", Name: "Holy", ArmorType: ArmorPlate, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/paladin_holy.png", WeaponTypes: []string{WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponAxe1H, WeaponAxe2H, WeaponPolearm, WeaponShield}},
	{ClassName: "Paladin", Name: "Protection", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "Tank", IconUrl: "/icons/classes/paladin_protection.png", WeaponTypes: []string{WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponAxe1H, WeaponAxe2H, WeaponPolearm, WeaponShield}},
	{ClassName: "Paladin", Name: "Retribution", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "DPS", IconUrl: "/icons/classes/paladin_retribution.png", WeaponTypes: []string{WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponAxe1H, WeaponAxe2H, WeaponPolearm}},

	// Priest — Cloth, Intellect, all specs.
	{ClassName: "Priest", Name: "Discipline", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/priest_discipline.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponMace1H}},
	{ClassName: "Priest", Name: "Holy", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/priest_holy.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponMace1H}},
	{ClassName: "Priest", Name: "Shadow", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/priest_shadow.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponMace1H}},

	// Rogue — Leather, Agility, all specs.
	{ClassName: "Rogue", Name: "Assassination", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/rogue_assassination.png", WeaponTypes: []string{WeaponDagger, WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponFistWeapon}},
	{ClassName: "Rogue", Name: "Outlaw", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/rogue_outlaw.png", WeaponTypes: []string{WeaponDagger, WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponFistWeapon}},
	{ClassName: "Rogue", Name: "Subtlety", ArmorType: ArmorLeather, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/rogue_subtlety.png", WeaponTypes: []string{WeaponDagger, WeaponSword1H, WeaponAxe1H, WeaponMace1H, WeaponFistWeapon}},

	// Shaman — Mail. Elemental/Restoration Intellect (staff-capable),
	// Enhancement Agility (no staff) — confirmed by user during planning.
	// Elemental and Restoration are both shield-capable (confirmed);
	// Enhancement is not (dual-wields).
	{ClassName: "Shaman", Name: "Elemental", ArmorType: ArmorMail, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/shaman_elemental.png", WeaponTypes: []string{WeaponMace1H, WeaponAxe1H, WeaponSword1H, WeaponDagger, WeaponStaff, WeaponShield}},
	{ClassName: "Shaman", Name: "Enhancement", ArmorType: ArmorMail, PrimaryStat: "Agility", Role: "DPS", IconUrl: "/icons/classes/shaman_enhancement.png", WeaponTypes: []string{WeaponMace1H, WeaponAxe1H, WeaponSword1H, WeaponDagger, WeaponFistWeapon}},
	{ClassName: "Shaman", Name: "Restoration", ArmorType: ArmorMail, PrimaryStat: "Intellect", Role: "Healer", IconUrl: "/icons/classes/shaman_restoration.png", WeaponTypes: []string{WeaponMace1H, WeaponAxe1H, WeaponSword1H, WeaponDagger, WeaponStaff, WeaponShield}},

	// Warlock — Cloth, Intellect, all specs.
	{ClassName: "Warlock", Name: "Affliction", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/warlock_affliction.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponSword1H}},
	{ClassName: "Warlock", Name: "Demonology", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/warlock_demonology.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponSword1H}},
	{ClassName: "Warlock", Name: "Destruction", ArmorType: ArmorCloth, PrimaryStat: "Intellect", Role: "DPS", IconUrl: "/icons/classes/warlock_destruction.png", WeaponTypes: []string{WeaponWand, WeaponDagger, WeaponStaff, WeaponSword1H}},

	// Warrior — Plate, Strength, all specs share the broadest melee list.
	// Protection is shield-capable (confirmed); Arms/Fury are not (two-handers).
	{ClassName: "Warrior", Name: "Arms", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "DPS", IconUrl: "/icons/classes/warrior_arms.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm, WeaponDagger, WeaponFistWeapon, WeaponStaff}},
	{ClassName: "Warrior", Name: "Fury", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "DPS", IconUrl: "/icons/classes/warrior_fury.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm, WeaponDagger, WeaponFistWeapon, WeaponStaff}},
	{ClassName: "Warrior", Name: "Protection", ArmorType: ArmorPlate, PrimaryStat: "Strength", Role: "Tank", IconUrl: "/icons/classes/warrior_protection.png", WeaponTypes: []string{WeaponAxe1H, WeaponAxe2H, WeaponMace1H, WeaponMace2H, WeaponSword1H, WeaponSword2H, WeaponPolearm, WeaponDagger, WeaponFistWeapon, WeaponStaff, WeaponShield}},
}
