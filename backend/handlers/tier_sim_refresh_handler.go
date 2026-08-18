package handlers

import (
	"encoding/csv"
	"fmt"
	"io"
	"krankenprep/database"
	"krankenprep/models"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const tierSimRefreshCooldown = 20 * time.Minute

var (
	sheetIdFromUrlRegex = regexp.MustCompile(`/d/([a-zA-Z0-9_-]+)`)
	gidFromUrlRegex     = regexp.MustCompile(`[?&#]gid=(\d+)`)
)

// sheetCsvUrl converts a Google Sheets tab URL (whatever's in the browser's
// address bar while viewing that tab, e.g.
// "https://docs.google.com/spreadsheets/d/{id}/edit#gid={gid}") into its
// public CSV export URL. Requires the sheet be shared as "anyone with the
// link can view" — there's no auth here, this is a plain GET. A missing gid
// defaults to "0" (Google Sheets' own default for a tab-less/first-tab URL).
func sheetCsvUrl(rawUrl string) (string, error) {
	idMatch := sheetIdFromUrlRegex.FindStringSubmatch(rawUrl)
	if idMatch == nil {
		return "", fmt.Errorf("couldn't find a spreadsheet ID in %q — expected a normal Google Sheets URL (contains /d/<id>/)", rawUrl)
	}
	gid := "0"
	if gidMatch := gidFromUrlRegex.FindStringSubmatch(rawUrl); gidMatch != nil {
		gid = gidMatch[1]
	}
	return fmt.Sprintf("https://docs.google.com/spreadsheets/d/%s/export?format=csv&gid=%s", idMatch[1], gid), nil
}

var tierSimSheetClient = &http.Client{Timeout: 15 * time.Second}

// fetchTierSimSheetRows fetches and parses one tab of the tier-sim
// spreadsheet, returning {row name -> (col1, col2, col6)} for every row
// recognizable as real data.
//
// The sheet's actual layout (see backend/scripts/tier-sim-update/README.md)
// is 3 comparison groups of 4 columns each, separated by blank spacer
// columns, with the row name in column A and non-data rows (armor-type
// section headers, the per-group column headers repeated at the top of each
// section, and an occasional worksheet-disclaimer row) interleaved among
// the real data rows. Rather than hardcode exact column positions (fragile
// against the spreadsheet's spacer-column layout ever shifting slightly),
// this drops every blank cell after the name, requires the first 6
// remaining cells to all parse as plain numbers, and skips the row
// entirely if they don't — which quietly and correctly discards every kind
// of non-data row without needing to special-case any of them by name.
func fetchTierSimSheetRows(sheetUrl string) (map[string][3]float64, error) {
	csvUrl, err := sheetCsvUrl(sheetUrl)
	if err != nil {
		return nil, err
	}

	resp, err := tierSimSheetClient.Get(csvUrl)
	if err != nil {
		return nil, fmt.Errorf("fetching sheet: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sheet fetch returned status %d — check the URL is a real tab and the sheet is shared as \"anyone with the link can view\"", resp.StatusCode)
	}

	reader := csv.NewReader(io.LimitReader(resp.Body, 2*1024*1024))
	reader.FieldsPerRecord = -1 // rows have a ragged number of columns

	rows := map[string][3]float64{}
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("parsing sheet CSV: %w", err)
		}
		// Column A is blank on every row (real sheet, confirmed) — the row
		// name actually lives in column B.
		if len(record) < 2 {
			continue
		}
		name := strings.TrimSpace(record[1])
		if name == "" {
			continue
		}

		// Past the 16 columns this cares about, the real sheet has a "SIM
		// sources" report-URL column and then a huge embedded raw-sim-data
		// CSV blob crammed into one cell — both very much non-numeric.
		// Stopping the instant 6 valid numbers are collected (rather than
		// scanning the whole row) means that trailing junk never gets a
		// chance to wipe out numbers already found to be good.
		var nums []float64
		for _, cell := range record[2:] {
			if len(nums) >= 6 {
				break
			}
			cell = strings.TrimSpace(cell)
			if cell == "" {
				continue
			}
			cell = strings.ReplaceAll(cell, ",", "")
			cell = strings.TrimSuffix(cell, "%")
			val, err := strconv.ParseFloat(cell, 64)
			if err != nil {
				nums = nil // non-numeric cell before 6 were found — a header/disclaimer row, not data
				break
			}
			nums = append(nums, val)
		}
		if len(nums) < 6 {
			continue
		}

		// All-zero placeholder (e.g. Brewmaster Monk historically) — not
		// simmed yet, don't record it as real data.
		if nums[0] == 0 && nums[1] == 0 && nums[5] == 0 {
			continue
		}

		rows[name] = [3]float64{nums[0], nums[1], nums[5]}
	}
	return rows, nil
}

// specSheetLabel pairs a Specialization with its spreadsheet label, sorted
// longest-first so matchSheetRowSpec never picks a shorter label that
// happens to also be a prefix of a longer one.
type specSheetLabel struct {
	SpecializationID uint
	SheetLabel       string
}

func matchSheetRowSpec(rowName string, labels []specSheetLabel) (specId uint, buildLabel string, ok bool) {
	for _, l := range labels {
		prefix := l.SheetLabel + " "
		if strings.HasPrefix(rowName, prefix) {
			return l.SpecializationID, strings.TrimSpace(rowName[len(prefix):]), true
		}
	}
	return 0, "", false
}

type tierSimEntryKey struct {
	SpecializationID uint
	BuildLabel       string
}

// tierSimRowChange describes one TierSimEntry row's before/after for the
// refresh response — old is nil for a brand-new row.
type tierSimRowChange struct {
	Label string            `json:"label"` // e.g. "Aff Wlock Soul Harvester"
	Old   *tierSimRowValues `json:"old"`
	New   tierSimRowValues  `json:"new"`
}

type tierSimRowValues struct {
	Score0pc         float64  `json:"score_0pc"`
	Score2pc         float64  `json:"score_2pc"`
	Score4pc         float64  `json:"score_4pc"`
	Score4pcPrevTier *float64 `json:"score_4pc_prev_tier"`
	Score2pcMixed    *float64 `json:"score_2pc_mixed"`
	Score4pcNewTier  *float64 `json:"score_4pc_new_tier"`
}

func (a tierSimRowValues) equal(b tierSimRowValues) bool {
	return a.Score0pc == b.Score0pc && a.Score2pc == b.Score2pc && a.Score4pc == b.Score4pc &&
		floatPtrEqual(a.Score4pcPrevTier, b.Score4pcPrevTier) &&
		floatPtrEqual(a.Score2pcMixed, b.Score2pcMixed) &&
		floatPtrEqual(a.Score4pcNewTier, b.Score4pcNewTier)
}

func floatPtrEqual(a, b *float64) bool {
	if a == nil || b == nil {
		return a == b
	}
	return *a == *b
}

// GetTierSimRefreshConfig returns the current spreadsheet source + cooldown
// state. Owner-only, same as the other two handlers in this file — this
// isn't sensitive, but there's no reason for every team member to see raw
// spreadsheet URLs either.
func GetTierSimRefreshConfig(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}
	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}
	if !isTeamOwner(uint(teamId), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "only a team owner can view the tier sim data source"})
		return
	}

	config := loadOrInitTierSimRefreshConfig()
	c.JSON(http.StatusOK, config)
}

type UpdateTierSimRefreshConfigPayload struct {
	CurrentTierSheetUrl string `json:"current_tier_sheet_url" binding:"required"`
	// Blank clears it — an expansion's first season has no transition data.
	TransitionSheetUrl string `json:"transition_sheet_url"`
}

// UpdateTierSimRefreshConfig repoints the refresh at a new spreadsheet —
// the entire "hot-swap" workflow for a new season is updating this, then
// hitting refresh. Both URLs are validated (must yield a parseable sheet
// ID) before saving, so a typo is caught immediately rather than surfacing
// as a confusing failure on the next refresh attempt.
func UpdateTierSimRefreshConfig(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}
	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}
	if !isTeamOwner(uint(teamId), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "only a team owner can update the tier sim data source"})
		return
	}

	var payload UpdateTierSimRefreshConfigPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if _, err := sheetCsvUrl(payload.CurrentTierSheetUrl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "current tier sheet URL: " + err.Error()})
		return
	}
	if payload.TransitionSheetUrl != "" {
		if _, err := sheetCsvUrl(payload.TransitionSheetUrl); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "transition sheet URL: " + err.Error()})
			return
		}
	}

	config := loadOrInitTierSimRefreshConfig()
	config.CurrentTierSheetUrl = payload.CurrentTierSheetUrl
	config.TransitionSheetUrl = payload.TransitionSheetUrl
	if err := database.DB.Save(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save configuration"})
		return
	}

	c.JSON(http.StatusOK, config)
}

// RefreshTierSimData is the actual "go pull the spreadsheet" action —
// owner-only and globally rate-limited (tierSimRefreshCooldown) since it
// writes data every team on the platform sees. Only rows whose values
// actually differ from what's stored get written; everything else is
// reported back but left untouched.
func RefreshTierSimData(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}
	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}
	if !isTeamOwner(uint(teamId), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "only a team owner can refresh tier sim data"})
		return
	}

	config := loadOrInitTierSimRefreshConfig()
	if config.LastRefreshedAt != nil {
		if remaining := tierSimRefreshCooldown - time.Since(*config.LastRefreshedAt); remaining > 0 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               "tier sim data was refreshed recently — try again shortly",
				"last_refreshed_at":   config.LastRefreshedAt,
				"retry_after_seconds": int(remaining.Seconds()),
			})
			return
		}
	}

	if config.CurrentTierSheetUrl == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no tier sim data source is configured yet"})
		return
	}

	var season models.Season
	if err := database.DB.Where("is_current = ?", true).First(&season).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no current season found"})
		return
	}

	currentTierRows, err := fetchTierSimSheetRows(config.CurrentTierSheetUrl)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch current-tier sheet: " + err.Error()})
		return
	}

	var transitionRows map[string][3]float64
	if config.TransitionSheetUrl != "" {
		transitionRows, err = fetchTierSimSheetRows(config.TransitionSheetUrl)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch transition sheet: " + err.Error()})
			return
		}
	}

	var specs []models.Specialization
	database.DB.Where("sheet_label <> ''").Find(&specs)
	labels := make([]specSheetLabel, len(specs))
	for i, s := range specs {
		labels[i] = specSheetLabel{SpecializationID: s.ID, SheetLabel: s.SheetLabel}
	}
	// Longest label first, so e.g. a hypothetical "Prot" doesn't shadow
	// "Prot Paladin"/"Prot Warrior" — none of the current labels actually
	// collide like this, but sorting costs nothing and removes the
	// possibility entirely as more specs gain sheet labels later.
	sort.Slice(labels, func(i, j int) bool { return len(labels[i].SheetLabel) > len(labels[j].SheetLabel) })

	type matchedRow struct {
		label      string
		current    *[3]float64
		transition *[3]float64
	}
	matched := map[tierSimEntryKey]matchedRow{}
	var unmatched []string

	for name, vals := range currentTierRows {
		specId, buildLabel, ok := matchSheetRowSpec(name, labels)
		if !ok {
			unmatched = append(unmatched, name)
			continue
		}
		vals := vals
		key := tierSimEntryKey{specId, buildLabel}
		row := matched[key]
		row.label = name
		row.current = &vals
		matched[key] = row
	}
	for name, vals := range transitionRows {
		specId, buildLabel, ok := matchSheetRowSpec(name, labels)
		if !ok {
			unmatched = append(unmatched, name)
			continue
		}
		vals := vals
		key := tierSimEntryKey{specId, buildLabel}
		row := matched[key]
		row.label = name
		row.transition = &vals
		matched[key] = row
	}

	var existing []models.TierSimEntry
	database.DB.Where("season_id = ?", season.Id).Find(&existing)
	existingByKey := map[tierSimEntryKey]models.TierSimEntry{}
	for _, e := range existing {
		existingByKey[tierSimEntryKey{e.SpecializationID, e.BuildLabel}] = e
	}

	var changes []tierSimRowChange
	for key, row := range matched {
		prior, hadPrior := existingByKey[key]

		target := tierSimRowValues{
			Score4pcPrevTier: nilIfNoOverride(hadPrior, prior.Score4pcPrevTier),
			Score2pcMixed:    nilIfNoOverride(hadPrior, prior.Score2pcMixed),
			Score4pcNewTier:  nilIfNoOverride(hadPrior, prior.Score4pcNewTier),
		}
		if row.current != nil {
			target.Score0pc, target.Score2pc, target.Score4pc = row.current[0], row.current[1], row.current[2]
		} else if hadPrior {
			target.Score0pc, target.Score2pc, target.Score4pc = prior.Score0pc, prior.Score2pc, prior.Score4pc
		} else {
			continue // only ever showed up in the transition sheet — nothing to seed the base scores from
		}
		if row.transition != nil {
			prevTier, mixed, newTier := row.transition[0], row.transition[1], row.transition[2]
			target.Score4pcPrevTier, target.Score2pcMixed, target.Score4pcNewTier = &prevTier, &mixed, &newTier
		}

		var priorValues *tierSimRowValues
		if hadPrior {
			pv := tierSimRowValues{
				Score0pc: prior.Score0pc, Score2pc: prior.Score2pc, Score4pc: prior.Score4pc,
				Score4pcPrevTier: prior.Score4pcPrevTier, Score2pcMixed: prior.Score2pcMixed, Score4pcNewTier: prior.Score4pcNewTier,
			}
			if pv.equal(target) {
				continue // no real change — don't touch the row
			}
			priorValues = &pv
		}

		entry := prior
		entry.SeasonID = season.Id
		entry.SpecializationID = key.SpecializationID
		entry.BuildLabel = key.BuildLabel
		entry.Score0pc, entry.Score2pc, entry.Score4pc = target.Score0pc, target.Score2pc, target.Score4pc
		entry.Score4pcPrevTier, entry.Score2pcMixed, entry.Score4pcNewTier = target.Score4pcPrevTier, target.Score2pcMixed, target.Score4pcNewTier

		if err := database.DB.Save(&entry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save " + row.label})
			return
		}
		changes = append(changes, tierSimRowChange{Label: row.label, Old: priorValues, New: target})
	}

	now := time.Now()
	config.LastRefreshedAt = &now
	database.DB.Save(&config)

	sort.Slice(changes, func(i, j int) bool { return changes[i].Label < changes[j].Label })
	sort.Strings(unmatched)

	// A nil slice (the zero-changes/zero-unmatched case, which is the
	// common case once the sheet's already in sync) marshals to JSON null,
	// not [] — the frontend does result.changed.length unconditionally, so
	// null here would crash it. Coalesce to an empty slice explicitly
	// rather than relying on every caller to null-check first.
	if changes == nil {
		changes = []tierSimRowChange{}
	}
	if unmatched == nil {
		unmatched = []string{}
	}

	c.JSON(http.StatusOK, gin.H{
		"changed":              changes,
		"unmatched_sheet_rows": unmatched,
		"last_refreshed_at":    now,
	})
}

func nilIfNoOverride(hadPrior bool, val *float64) *float64 {
	if !hadPrior {
		return nil
	}
	return val
}

// loadOrInitTierSimRefreshConfig returns the singleton config row, creating
// an empty one on first use so callers never have to branch on "does it
// exist yet."
func loadOrInitTierSimRefreshConfig() models.TierSimRefreshConfig {
	var config models.TierSimRefreshConfig
	if err := database.DB.First(&config).Error; err != nil {
		config = models.TierSimRefreshConfig{}
		database.DB.Create(&config)
	}
	return config
}
