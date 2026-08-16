package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"regexp"
	"strconv"

	"github.com/gin-gonic/gin"
)

const wowUtilsBaseURL = "https://api.wowutils.com/v1"

// WowUtils group IDs are stable, opaque 24-character hex resource ids —
// validating the format client-side (before it ever leaves the settings
// form) and here catches typos without a round trip to WowUtils.
var wowUtilsGroupIdRegex = regexp.MustCompile(`^[0-9a-f]{24}$`)

// wowUtilsAPIError mirrors the {error:{code,message,requestId}} shape
// WowUtils returns on every non-2xx response.
type wowUtilsAPIError struct {
	Error struct {
		Code      string `json:"code"`
		Message   string `json:"message"`
		RequestId string `json:"requestId"`
	} `json:"error"`
}

// respondWithWowUtilsError translates a non-2xx WowUtils response into our
// own JSON error response. It always prefers WowUtils' own error message
// when present — our per-code text below is only a fallback for the rare
// case that's blank, not a replacement for it. (An earlier version of this
// function discarded the real message for every recognized code, which
// meant a report-not-found on the upload endpoint got relabeled as a
// group-not-found — actively misleading, since "not_found" doesn't mean
// the same thing on every endpoint.) notFoundHint lets each call site give
// a fallback appropriate to what it actually looked up (a group vs. a
// report), only used when WowUtils didn't send a message of its own.
// group_not_shared still gets appended guidance since it's a distinct,
// actionable state — the key is valid, but the group owner has API sharing
// turned off on WowUtils' end, so re-entering credentials won't fix it.
func respondWithWowUtilsError(c *gin.Context, resp *http.Response, body []byte, notFoundHint string) {
	var apiErr wowUtilsAPIError
	_ = json.Unmarshal(body, &apiErr)
	log.Printf("WowUtils error response (status %d): %s", resp.StatusCode, string(body))

	status := http.StatusBadGateway
	message := apiErr.Error.Message

	switch apiErr.Error.Code {
	case "group_not_shared":
		status = http.StatusForbidden
		if message == "" {
			message = "This WowUtils group has API sharing disabled."
		}
		message += " Enable it in WowUtils' group settings, then try again."
	case "invalid_key":
		status = http.StatusUnauthorized
		if message == "" {
			message = "WowUtils rejected this API key."
		}
	case "not_found":
		status = http.StatusNotFound
		if message == "" {
			message = notFoundHint
		}
	case "invalid_request", "payload_too_large":
		status = http.StatusBadRequest
	case "rate_limited", "ip_throttled":
		status = http.StatusTooManyRequests
		if message == "" {
			message = "WowUtils is rate-limiting these requests — try again shortly."
		}
	case "api_overloaded":
		if message == "" {
			message = "WowUtils is temporarily overloaded — try again shortly."
		}
	}

	if message == "" {
		message = fmt.Sprintf("WowUtils request failed (status %d)", resp.StatusCode)
	}

	response := gin.H{"error": message}
	if apiErr.Error.RequestId != "" {
		response["request_id"] = apiErr.Error.RequestId
	}
	c.JSON(status, response)
}

// doWowUtilsRequest issues an authenticated request against the WowUtils
// API and returns the raw response + already-read body. The returned error
// is only set for network-level failures (couldn't reach WowUtils at all) —
// a WowUtils 4xx/5xx comes back as a normal response for the caller to
// check resp.StatusCode and hand to respondWithWowUtilsError.
func doWowUtilsRequest(method, path, apiKey string, payload any) (*http.Response, []byte, error) {
	var reqBody io.Reader
	if payload != nil {
		b, err := json.Marshal(payload)
		if err != nil {
			return nil, nil, err
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, wowUtilsBaseURL+path, reqBody)
	if err != nil {
		return nil, nil, err
	}
	// Raw key, no "Bearer" prefix — matches how this codebase already talks
	// to WowAudit's API, and WowUtils' own docs just say "send it in the
	// Authorization header" with no bearer scheme mentioned.
	req.Header.Set("Authorization", apiKey)
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}
	return resp, body, nil
}

// TestWowUtilsPayload is the request body for POST /teams/wowutils/test.
type TestWowUtilsPayload struct {
	GroupId string `json:"group_id"`
	ApiKey  string `json:"api_key"`
}

// TestWowUtilsIntegration validates a group ID + API key pair before a team
// admin saves them, by fetching the group's own metadata. Same role as
// TestWowAuditIntegration — stateless, no team lookup, since the
// credentials being tested haven't necessarily been saved yet.
func TestWowUtilsIntegration(c *gin.Context) {
	var payload TestWowUtilsPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if !wowUtilsGroupIdRegex.MatchString(payload.GroupId) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group ID must be a 24-character hex string"})
		return
	}

	resp, body, err := doWowUtilsRequest(http.MethodGet, "/groups/"+payload.GroupId, payload.ApiKey, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach WowUtils"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		respondWithWowUtilsError(c, resp, body, "WowUtils group not found — check the Group ID.")
		return
	}

	var group struct {
		Name        string `json:"name"`
		MemberCount int    `json:"memberCount"`
	}
	if err := json.Unmarshal(body, &group); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Invalid response from WowUtils"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"name": group.Name, "member_count": group.MemberCount})
}

// UploadDroptimizerToWowUtilsPayload is the request body for
// POST /teams/:teamId/wowutils/upload.
type UploadDroptimizerToWowUtilsPayload struct {
	URL        string `json:"url" binding:"required"`
	ProfileKey string `json:"profile_key"`
}

// UploadDroptimizerToWowUtils handles POST /teams/:teamId/wowutils/upload.
// Unlike UploadDroptimizer (WowAudit), this is a thin proxy: WowUtils'
// import endpoint does its own source detection (Raidbots vs QE Live) and
// report parsing, so there's no local wishlist-config validation or roster
// lookup to do on our side — just forward the URL and relay the result.
func UploadDroptimizerToWowUtils(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}

	var payload UploadDroptimizerToWowUtilsPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	// Any team member may upload their own droptimizer — same permission
	// level as the WowAudit upload endpoint (UploadDroptimizer), not
	// restricted to loot council/admin/owner.
	userRole := models.Role{}
	if err := database.DB.Where("team_id = ? AND user_id = ?", teamId, user.ID).First(&userRole).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user is not a member of this team"})
		return
	}

	team := models.Team{}
	if err := database.DB.First(&team, teamId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}
	if !team.WowUtilsIntegration || team.WowUtilsApiKey == "" || team.WowUtilsGroupId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "WowUtils integration is not configured for this team"})
		return
	}

	uploadPayload := map[string]any{"url": payload.URL}
	if payload.ProfileKey != "" {
		uploadPayload["profileKey"] = payload.ProfileKey
	}

	resp, body, err := doWowUtilsRequest(http.MethodPost, "/groups/"+team.WowUtilsGroupId+"/droptimizers", team.WowUtilsApiKey, uploadPayload)
	if err != nil {
		log.Printf("WowUtils upload error for team %d: %v", teamId, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach WowUtils"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		// Unlike the test endpoint, a 404 here is more likely about the
		// report than the group — the same group+key combo was just used
		// to configure this integration, so if the group itself had gone
		// missing the request wouldn't have gotten this far.
		respondWithWowUtilsError(c, resp, body, "WowUtils couldn't find that report — check the URL and try again.")
		return
	}

	var result struct {
		CharacterId string   `json:"characterId"`
		Source      string   `json:"source"`
		ImportedAt  string   `json:"importedAt"`
		ReportUrl   string   `json:"reportUrl"`
		Warnings    []string `json:"warnings"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "invalid response from WowUtils"})
		return
	}

	// WowUtils itself treats these as non-blocking — it stores the report
	// and returns 200 either way — but a sim that doesn't match the
	// group's configured settings (fight length, gear-upgrade toggle, etc)
	// isn't usable data for loot comparisons, so from this app's
	// perspective that's a failure, not a success with fine print. Report
	// it the same way UploadDroptimizer (WowAudit) reports its own
	// pre-flight validation failures, so the frontend's existing
	// error/details rendering handles this with no special-casing.
	if len(result.Warnings) > 0 {
		log.Printf("WowUtils accepted report %s for team %d but flagged it: %v", result.ReportUrl, teamId, result.Warnings)
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":   "report does not meet your group's WowUtils settings",
			"details": result.Warnings,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "droptimizer uploaded successfully",
		"character_id": result.CharacterId,
		"source":       result.Source,
		"imported_at":  result.ImportedAt,
		"report_url":   result.ReportUrl,
	})
}
