package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"sort"
	"sync"

	"gorm.io/gorm"
)

// Backs GetClasses/GetServers/GetRegions/GetExpansions — reference data that
// only ever changes via a seed-file edit + redeploy, never at runtime, but
// gets queried on nearly every page load across the app. No TTL/invalidation
// logic needed: a fresh deploy means a fresh process means an empty cache,
// so "cache forever within this process's lifetime" is already correct, not
// a simplification that risks staleness.
//
// Deliberately NOT sync.Once — if the very first fetch hits a transient
// error (e.g. a momentary blip talking to Neon during a cold start),
// sync.Once would mark itself "done" regardless and permanently cache
// nothing for that container's entire lifetime. Double-checked locking
// means a failed fetch just gets retried on the next request instead.

var (
	classesMu    sync.RWMutex
	classesCache []models.Class

	serversMu    sync.RWMutex
	serversCache []models.Server

	expansionsMu    sync.RWMutex
	expansionsCache []models.Expansion
)

func getCachedClasses() ([]models.Class, error) {
	classesMu.RLock()
	cached := classesCache
	classesMu.RUnlock()
	if cached != nil {
		return cached, nil
	}

	classesMu.Lock()
	defer classesMu.Unlock()
	if classesCache == nil { // re-check: another request may have won the race
		var fresh []models.Class
		if err := database.DB.Preload("Specializations").Order("name ASC").Find(&fresh).Error; err != nil {
			return nil, err
		}
		classesCache = fresh
	}
	return classesCache, nil
}

func getCachedServers() ([]models.Server, error) {
	serversMu.RLock()
	cached := serversCache
	serversMu.RUnlock()
	if cached != nil {
		return cached, nil
	}

	serversMu.Lock()
	defer serversMu.Unlock()
	if serversCache == nil {
		var fresh []models.Server
		if err := database.DB.Model(&models.Server{}).Order("name ASC").Find(&fresh).Error; err != nil {
			return nil, err
		}
		serversCache = fresh
	}
	return serversCache, nil
}

func getCachedExpansions() ([]models.Expansion, error) {
	expansionsMu.RLock()
	cached := expansionsCache
	expansionsMu.RUnlock()
	if cached != nil {
		return cached, nil
	}

	expansionsMu.Lock()
	defer expansionsMu.Unlock()
	if expansionsCache == nil {
		var fresh []models.Expansion
		if err := database.DB.Preload("Seasons", func(db *gorm.DB) *gorm.DB {
			return db.Order("seasons.order DESC")
		}).Preload("Seasons.Raids").Preload("Seasons.Raids.Bosses").
			Where("expansions.is_current = ?", true).Find(&fresh).Error; err != nil {
			return nil, err
		}
		expansionsCache = fresh
	}
	return expansionsCache, nil
}

// distinctRegions derives the region list from the same cached servers data
// GetServers already uses, rather than a separate cache+query — keeps the
// two endpoints from ever disagreeing with each other.
func distinctRegions(servers []models.Server) []string {
	seen := map[string]bool{}
	var regions []string
	for _, s := range servers {
		if !seen[s.Region] {
			seen[s.Region] = true
			regions = append(regions, s.Region)
		}
	}
	sort.Strings(regions)
	return regions
}
