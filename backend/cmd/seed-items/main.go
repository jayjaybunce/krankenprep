// seed-items fetches WoW item data from Wowhead's tooltip endpoint for a
// hand-curated list of item IDs (grouped by boss), and upserts them into the
// database against the current (or specified) season.
//
// This is a manual, occasional script — not part of the server's normal
// boot-time seeders — intended to run once per season/tier, per the current
// workflow of pulling item IDs from PTR while the tier isn't live yet.
// Blizzard's official Game Data API does not expose PTR namespaces to
// third-party clients (confirmed during planning), so Wowhead's tooltip
// endpoint is used as a bridge; once the tier goes live, the same items can
// be re-validated against Blizzard's official API as a follow-up.
//
// Weapons and trinkets pause for an interactive terminal prompt (primary
// stat, and for trinkets only, an additional eligible-role prompt — some
// trinkets are role-locked, e.g. Tank+DPS only, independent of stat).
// Everything else (armor, rings, necks, cloaks, off-hand caster items) is
// fully automatic.
//
// ASSUMPTIONS THAT NEED VALIDATION against real data before trusting a full
// run (see the "-boss-items" flag doc below for how to test on a handful of
// items first):
//   - Wowhead's tooltip omits the item-class/subclass marker entirely for
//     rings/necks/cloaks/trinkets (only armor and weapons show it). If a
//     particular accessory DOES show a marker with an unrecognized subclass
//     ID, this script currently falls through to treating it as universal
//     rather than erroring — verify that's the right call by inspecting a
//     few real trinket/ring/cloak items after a test run.
//   - Off-hand caster items are detected by the slot text containing "off"
//     (case-insensitive) while not being a real weapon. Verify this matches
//     Wowhead's actual slot text for a real off-hand item before trusting it.
//
// Usage:
//
//	go run ./cmd/seed-items -boss-items path/to/boss-items.json [-season "Season Name" -expansion "expansion-slug"]
//
// boss-items.json shape:
//
//	{
//	  "season_name": "Season 1",           // required if expansion_slug is set (Season.Name isn't unique across expansions — both The War Within and Midnight have a "Season 1")
//	  "expansion_slug": "midnight",        // required if season_name is set
//	  "bosses": [
//	    { "boss_slug": "some-boss", "item_ids": [268203, 268208, 268230] }
//	  ]
//	}
//
// Omit both season_name and expansion_slug to default to whichever season
// has IsCurrent=true.
package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	"krankenprep/database"
	"krankenprep/models"
	"krankenprep/seed"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type bossItemsFile struct {
	SeasonName    string          `json:"season_name"`
	ExpansionSlug string          `json:"expansion_slug"`
	Bosses        []bossItemEntry `json:"bosses"`
}

type bossItemEntry struct {
	BossSlug string `json:"boss_slug"`
	ItemIDs  []uint `json:"item_ids"`
}

type wowheadTooltipResponse struct {
	Name    string `json:"name"`
	Quality int    `json:"quality"`
	Icon    string `json:"icon"`
	Tooltip string `json:"tooltip"`
}

var (
	ilvlPattern     = regexp.MustCompile(`<!--ilvl-->(\d+)`)
	subclassPattern = regexp.MustCompile(`<!--scstart(\d+):(\d+)-->`)
	slotPattern     = regexp.MustCompile(`<td>([^<]+)</td>`)
)

const (
	itemClassWeapon = 2
	itemClassArmor  = 4

	// armorSubclassShield is Blizzard's own item_subclass ID for shields
	// under item_class 4 (Armor) — confirmed live: "Venom-Slashed
	// Scuteward" (a known shield) parses as class 4, subclass 6. Shields
	// aren't restricted by armor type (Elemental Shaman wears Mail,
	// Protection Paladin wears Plate, both can carry a shield), so they're
	// classified as a WeaponType instead — see seed.WeaponShield.
	armorSubclassShield = 6
)

// tierTokenPrefixArmorTypes maps a tier token's name prefix to the armor
// type it unlocks (e.g. "Venomcast Idol" -> Mail). Tokens don't carry an
// item-class/subclass marker in Wowhead's tooltip (they fall through to
// itemClassArmor/itemClassWeapon detection failing, same bucket as rings/
// necks/cloaks), so without this they'd wrongly seed as universal — eligible
// for every spec instead of just the specs wearing that armor type.
//
// This mapping is hand-curated per tier/raid (Zul'jin, this season) and
// WILL need updating for the next tier's token prefixes — there's no
// general way to detect "this is a token" from Wowhead's data, so a new
// prefix here means going back to a real reference (in-game, a datamining
// site, or a trusted source) rather than guessing from the name alone.
var tierTokenPrefixArmorTypes = map[string]string{
	"Venomcast":   seed.ArmorMail,
	"Venomcured":  seed.ArmorLeather,
	"Venomforged": seed.ArmorPlate,
	"Venomwoven":  seed.ArmorCloth,
}

func tierTokenArmorType(itemName string) string {
	for prefix, armorType := range tierTokenPrefixArmorTypes {
		if strings.HasPrefix(itemName, prefix) {
			return armorType
		}
	}
	return ""
}

func main() {
	bossItemsPath := flag.String("boss-items", "", "path to a JSON file mapping boss slugs to item IDs (see file header for shape)")
	seasonFlag := flag.String("season", "", "season name to attach items to (defaults to the season with IsCurrent=true)")
	expansionFlag := flag.String("expansion", "", "expansion slug the season belongs to (required if -season/season_name is set — season names aren't unique across expansions)")
	flag.Parse()

	if *bossItemsPath == "" {
		log.Fatal("-boss-items is required")
	}

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	database.Connect()
	db := database.DB

	// Ensures Class/ArmorType/WeaponType/Specialization/Season/Boss
	// reference data exists even if the main server has never been run
	// against this database yet.
	if err := seed.RunSeeders(db); err != nil {
		log.Fatalf("running seeders: %v", err)
	}

	data, err := os.ReadFile(*bossItemsPath)
	if err != nil {
		log.Fatalf("reading boss-items file: %v", err)
	}
	var input bossItemsFile
	if err := json.Unmarshal(data, &input); err != nil {
		log.Fatalf("parsing boss-items file: %v", err)
	}

	seasonName := *seasonFlag
	if seasonName == "" {
		seasonName = input.SeasonName
	}
	expansionSlug := *expansionFlag
	if expansionSlug == "" {
		expansionSlug = input.ExpansionSlug
	}

	season, err := resolveSeason(db, seasonName, expansionSlug)
	if err != nil {
		log.Fatalf("resolving season: %v", err)
	}
	fmt.Printf("Seeding items against season %q (id %d)\n", season.Name, season.Id)

	reader := bufio.NewReader(os.Stdin)

	for _, bossEntry := range input.Bosses {
		var boss models.Boss
		if err := db.Where("slug = ?", bossEntry.BossSlug).First(&boss).Error; err != nil {
			log.Fatalf("resolving boss %q: %v", bossEntry.BossSlug, err)
		}

		for _, itemID := range bossEntry.ItemIDs {
			if err := seedItem(db, reader, boss, season, itemID); err != nil {
				log.Printf("item %d: %v (skipping)", itemID, err)
				continue
			}
		}
	}

	fmt.Println("Done.")
}

func resolveSeason(db *gorm.DB, name, expansionSlug string) (models.Season, error) {
	var season models.Season

	if name != "" || expansionSlug != "" {
		if name == "" || expansionSlug == "" {
			return season, fmt.Errorf("season name and expansion slug must be set together — season names aren't unique across expansions (both -season/season_name %q and -expansion/expansion_slug %q are required)", name, expansionSlug)
		}

		var expansion models.Expansion
		if err := db.Where("slug = ?", expansionSlug).First(&expansion).Error; err != nil {
			return season, fmt.Errorf("no expansion found with slug %q: %w", expansionSlug, err)
		}

		if err := db.Where("expansion_id = ? AND name = ?", expansion.Id, name).First(&season).Error; err != nil {
			return season, fmt.Errorf("no season named %q found for expansion %q: %w", name, expansionSlug, err)
		}
		return season, nil
	}

	if err := db.Where("is_current = ?", true).First(&season).Error; err != nil {
		return season, fmt.Errorf("no current season found, pass -season and -expansion explicitly: %w", err)
	}
	return season, nil
}

func seedItem(db *gorm.DB, stdin *bufio.Reader, boss models.Boss, season models.Season, wowItemID uint) error {
	tt, err := fetchWowheadItem(wowItemID)
	if err != nil {
		return err
	}
	parsed := parseTooltip(tt.Tooltip)

	item := models.Item{
		WowItemID: wowItemID,
		Name:      tt.Name,
		IconUrl:   fmt.Sprintf("https://wow.zamimg.com/images/wow/icons/large/%s.jpg", tt.Icon),
		ItemLevel: parsed.ItemLevel,
		Quality:   strconv.Itoa(tt.Quality),
		Slot:      parsed.Slot,
		BossID:    boss.ID,
		SeasonID:  season.Id,
	}

	var primaryStats []string
	var eligibleRoles []string
	slotLower := strings.ToLower(parsed.Slot)

	switch {
	case parsed.ItemClass == itemClassArmor && parsed.SubclassID == armorSubclassShield:
		// Shield — checked before the generic armor case below (shields
		// are itemClass Armor too, just a different subclass), treated
		// exactly like a weapon: a spec either can or can't equip one,
		// gated by seed.WeaponShield in Specialization.WeaponTypes, plus
		// whichever primary stat(s) this particular shield itemizes for.
		var weaponType models.WeaponType
		if err := db.Where("name = ?", seed.WeaponShield).First(&weaponType).Error; err != nil {
			return fmt.Errorf("shield %q: WeaponType %q not found: %w", tt.Name, seed.WeaponShield, err)
		}
		item.WeaponTypeID = &weaponType.ID
		primaryStats = promptPrimaryStats(stdin, tt.Name, parsed.Slot)

	case parsed.ItemClass == itemClassArmor:
		var armorType models.ArmorType
		if err := db.First(&armorType, parsed.SubclassID).Error; err == nil {
			item.ArmorTypeID = &armorType.ID
		}
		// No stats needed — ArmorTypeID alone drives eligibility. If the
		// subclass lookup missed (e.g. a "Miscellaneous" armor subclass
		// like rings/trinkets sometimes are classified under), it falls
		// through as universal, same as an accessory below.

	case parsed.ItemClass == itemClassWeapon:
		var weaponType models.WeaponType
		if err := db.First(&weaponType, parsed.SubclassID).Error; err == nil {
			item.WeaponTypeID = &weaponType.ID
		}
		primaryStats = promptPrimaryStats(stdin, tt.Name, parsed.Slot)
		// Role-gating only applies to trinkets, per confirmed rule — weapons
		// never get an eligibleRoles restriction.

	case strings.Contains(slotLower, "off"):
		// Off-hand caster item — always Intellect, per confirmed rule, no prompt.
		primaryStats = []string{models.StatIntellect}

	case strings.Contains(slotLower, "trinket"):
		primaryStats = promptPrimaryStats(stdin, tt.Name, parsed.Slot)
		eligibleRoles = promptEligibleRoles(stdin)

	case tierTokenArmorType(tt.Name) != "":
		// Tier token — treated exactly like a real armor piece of the
		// matching type for eligibility purposes (a token converts into
		// your spec's own set piece, same restriction as wearing the armor
		// directly). See tierTokenPrefixArmorTypes above.
		armorTypeName := tierTokenArmorType(tt.Name)
		var armorType models.ArmorType
		if err := db.Where("name = ?", armorTypeName).First(&armorType).Error; err != nil {
			return fmt.Errorf("tier token %q matched prefix but armor type %q not found: %w", tt.Name, armorTypeName, err)
		}
		item.ArmorTypeID = &armorType.ID

	default:
		// Ring / Neck / Cloak / anything else unrecognized — universal, no stat gate.
	}

	var existing models.Item
	result := db.Where("wow_item_id = ?", wowItemID).First(&existing)
	if result.Error == nil {
		item.ID = existing.ID
	}
	if err := db.Save(&item).Error; err != nil {
		return fmt.Errorf("saving item: %w", err)
	}

	if err := db.Where("item_id = ?", item.ID).Delete(&models.ItemPrimaryStat{}).Error; err != nil {
		return fmt.Errorf("clearing existing primary stats: %w", err)
	}
	for _, stat := range primaryStats {
		row := models.ItemPrimaryStat{ItemID: item.ID, Stat: stat}
		if err := db.Create(&row).Error; err != nil {
			return fmt.Errorf("saving primary stat %s: %w", stat, err)
		}
	}

	if err := db.Where("item_id = ?", item.ID).Delete(&models.ItemEligibleRole{}).Error; err != nil {
		return fmt.Errorf("clearing existing eligible roles: %w", err)
	}
	for _, role := range eligibleRoles {
		row := models.ItemEligibleRole{ItemID: item.ID, Role: role}
		if err := db.Create(&row).Error; err != nil {
			return fmt.Errorf("saving eligible role %s: %w", role, err)
		}
	}

	fmt.Printf("  %s (%d) -> %s [stats: %s] [roles: %s]\n", item.Name, item.WowItemID, boss.Name, strings.Join(primaryStats, ","), strings.Join(eligibleRoles, ","))
	return nil
}

func fetchWowheadItem(id uint) (*wowheadTooltipResponse, error) {
	url := fmt.Sprintf("https://nether.wowhead.com/tooltip/item/%d", id)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("creating wowhead request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("requesting wowhead item: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("wowhead item: unexpected status %s", res.Status)
	}

	var out wowheadTooltipResponse
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("decoding wowhead item response: %w", err)
	}
	if out.Name == "" {
		return nil, fmt.Errorf("empty response — item not found on wowhead")
	}
	return &out, nil
}

type parsedTooltip struct {
	ItemLevel  uint
	ItemClass  int
	SubclassID int
	Slot       string
}

func parseTooltip(tooltip string) parsedTooltip {
	var p parsedTooltip
	p.ItemClass = -1

	if m := ilvlPattern.FindStringSubmatch(tooltip); m != nil {
		if lvl, err := strconv.Atoi(m[1]); err == nil {
			p.ItemLevel = uint(lvl)
		}
	}
	if m := subclassPattern.FindStringSubmatch(tooltip); m != nil {
		p.ItemClass, _ = strconv.Atoi(m[1])
		p.SubclassID, _ = strconv.Atoi(m[2])
	}
	if m := slotPattern.FindStringSubmatch(tooltip); m != nil {
		p.Slot = strings.TrimSpace(m[1])
	}
	return p
}

func promptPrimaryStats(stdin *bufio.Reader, name, slot string) []string {
	fmt.Printf("\n%s (slot: %s)\n", name, slot)
	fmt.Print("  Primary stat(s) [str/agi/int, comma-separated, blank = universal]: ")

	input, _ := stdin.ReadString('\n')
	input = strings.TrimSpace(input)
	if input == "" {
		return nil
	}

	var stats []string
	for _, part := range strings.Split(input, ",") {
		switch strings.ToLower(strings.TrimSpace(part)) {
		case "str", "strength":
			stats = append(stats, models.StatStrength)
		case "agi", "agility":
			stats = append(stats, models.StatAgility)
		case "int", "intellect":
			stats = append(stats, models.StatIntellect)
		default:
			fmt.Printf("  (ignoring unrecognized stat %q)\n", part)
		}
	}
	return stats
}

// promptEligibleRoles is only ever called for trinkets, immediately after
// promptPrimaryStats already printed the item name/slot header — no need to
// repeat it here.
func promptEligibleRoles(stdin *bufio.Reader) []string {
	fmt.Print("  Eligible role(s) [tank/healer/dps, comma-separated, blank = any role]: ")

	input, _ := stdin.ReadString('\n')
	input = strings.TrimSpace(input)
	if input == "" {
		return nil
	}

	var roles []string
	for _, part := range strings.Split(input, ",") {
		switch strings.ToLower(strings.TrimSpace(part)) {
		case "tank":
			roles = append(roles, models.RoleTank)
		case "healer":
			roles = append(roles, models.RoleHealer)
		case "dps":
			roles = append(roles, models.RoleDPS)
		default:
			fmt.Printf("  (ignoring unrecognized role %q)\n", part)
		}
	}
	return roles
}
