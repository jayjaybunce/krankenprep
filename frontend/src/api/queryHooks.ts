import { useQuery } from "@tanstack/react-query"
import { useDebounce, useKpApi } from "../hooks"
import type { Region } from "../types/api/region"
import type { Server } from "../types/api/server"
import type { ExpansionResponse, Raid } from "../types/api/expansion"
import type { CardVariant } from "../components/Card"
import type { Tab } from "../components/Planner/Planner"
import type { User as UserType } from "../types/api/user"


export const useMe = () => {
    const { url, headers, enabled } = useKpApi("/me")
    return useQuery({
        queryKey: ["me"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<UserType>)
    })
}

export const useRegions = () => {
    const { url, headers, enabled } = useKpApi("/regions")
    return useQuery({
        queryKey: ["regions"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<Region>)
    })
}

export type NewsItem = {
    id: number
    title: string
    body: string
    published_at: string
}

export const useGetNews = () => {
    const { url, headers, enabled } = useKpApi("/news")
    return useQuery({
        queryKey: ["news"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<NewsItem[]>)
    })
}

export type SpecializationSummary = {
    id: number
    name: string
    icon_url: string
}

export type ClassWithSpecs = {
    id: number
    name: string
    color: string
    icon_url: string
    specializations: SpecializationSummary[]
}

export const useGetClasses = () => {
    const { url, headers, enabled } = useKpApi("/classes")
    return useQuery({
        queryKey: ["classes"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<ClassWithSpecs[]>)
    })
}

export const useServers = (region_filter?: string) => {
    const filter = region_filter ?? ''
    const { url, headers, enabled } = useKpApi('/servers', ["region", filter])
    return useQuery({
        queryKey: ["servers"],
        enabled,
        queryFn: () => fetch(url,{
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<Server[]>) 
    })
}

export type Wishlist = {
    id: number
    wowaudit_id: number
    name: string
    description: string
    fight_style: string
    number_of_bosses: number
    fight_duration: number 
    sockets: boolean
    pi: boolean
    expert_mode: boolean
    match_equipped_gear: boolean
    upgrade_level: number 
    upgrade_level_mythic: number 
    upgrade_level_heroic: number
    upgrade_level_normal: number 
    upgrade_level_lfr: number 
    upgrade_level_raid_finder: number 
}

export type Character = {
    id: number
    player_id: number
    name: string
    class: string
    realm: string
    region: string
    is_main: boolean
    specialization_id: number | null
    specialization: SpecializationSummary | null
    created_at: string
    updated_at: string
}

export type Player = {
    id: number
    team_id: number
    user_id: number | null
    user: User | null
    name: string
    battletag: string
    characters: Character[] | null
    created_at: string
    updated_at: string
}

export type Team = {
        id: number,
        name: string,
        server: string,
        region: string,
        rio_url: string,
        wowaudit_integration: boolean,
        wowaudit_data_synced_at: string,
        wowaudit_url: string,
        wowaudit_api_key: string,
        wowutils_integration: boolean,
        wowutils_group_id: string,
        // The real key is never sent back down (see Team.WowUtilsApiKey on
        // the backend) — this just tells the settings UI whether one's
        // already saved, so it can render "configured" without the value.
        wowutils_api_key_set: boolean,
        wishlist_configs: Wishlist[] | null
        roles: MyRole[]
        players: Player[] | null
        invite_links: InviteLink[]
        phases: []
    }

export type User = {
        id: number,
        email: string,
        name: string,
        created_at: string,
        fist_login: boolean,
        btag: string,
        bnet_profile_data: null,
        roles: null
    }


export type MyRole = {
    id: number,
    team_id: number,
    name: string,
    team: Team,
    user_id: number,
    user: User


}

export const useMyTeams = () => {
    const { url, headers, enabled} = useKpApi('/me/teams')
    return useQuery({
        queryKey: ["my_teams"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<MyRole[]>)
    })
}


export const useCurrentBosses = () => {
    const { url, headers, enabled} = useKpApi('/bosses')
    return useQuery({
        queryKey: ["current_bosses"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json())
    })
}

export const useCurrentExpansion = () => {
    const {url, headers, enabled} = useKpApi('/expansions')
    return useQuery({
        queryKey: ["current_expansion"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<ExpansionResponse>)
    })
}

// Current-tier raids (and their bosses), sorted by order — not team-scoped,
// since raids/bosses are shared reference data across all teams. Shared by
// LootBossSidebar and the Raid-Wide matrix so both use the exact same
// current-tier boss set.
export const useCurrentRaids = (): Raid[] => {
    const { data: expData } = useCurrentExpansion()
    return (
        expData
            ?.flatMap((exp) => exp?.seasons?.filter((s) => s?.is_current) ?? [])
            ?.flatMap((s) => s?.raids ?? [])
            ?.sort((a, b) => a.order - b.order) ?? []
    )
}

export type DiffOp = {
    type: "equal" | "insert" | "delete"
    lines: string[]
}

type Note = {
    id: number
    section_id: number
    content: string
    version: number
    has_diff: boolean
    diffs?: DiffOp[]
    created_at: string
    updated_at: string
}

type Boss = {
    id: number
    name: string
    order: number
    slug: string
    splash_img_url: string
    icon_img_url: string
    raid_id: number
}

export type Section = {
    id: number
    name: string
    description: string
    variant: CardVariant
    tags: string
    team_id: number
    team: Team
    boss_id: number
    boss: Boss
    notes: Note[]
    created_at: string
    updated_at: string
}

type TeamSectionsResponse = {
    sections: Section[]
}

export const useTeamAndBossSections = (bossId: string | undefined, teamId: string | undefined) => {
    const {url, headers, enabled} = useKpApi(`/teams/${teamId}/sections/boss/${bossId}`)
    return useQuery({
        queryKey: [`team_${teamId}_boss_${bossId}`],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<TeamSectionsResponse>)
    })
}

export type RaidPlan = {
    id: number
    content: Tab[]
    name: string
    boss: string
    raid: string
    sequence: string
    edit_id: string
    share_id: string
    user_id: number
    section_id: number
    created_at: string
    updated_at: string
}

export const useMyRaidplans = () => {
    const {url, headers, enabled } = useKpApi('/me/raidplans')
    return useQuery({
        queryKey: ["my_raidplans"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<RaidPlan[]>)
    })
}

export const useGetRaidplanById = (id: string, enabledOverride: boolean) => {
    const {url, headers } = useKpApi(`/raidplans/${id}`)
    return useQuery({
        queryKey: [`raidplan_${id}`],
        retry: 0,
        enabled: enabledOverride,
        queryFn: async () => {
            const res = await fetch(url, {
                method: "GET",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to load raid plan")
            }
            return data as RaidPlan
        }
    })
}

type InviteLinkTeam = {
    id: string
    name: string
    region: string
    rio_url: string
    roles: null
    sections: null
    invite_links: null
}

type CreatedByUser = {
    id: number
    email: string
    name: string
    created_at: string
    first_login: boolean
    btag: string
    roles: null | []
}

type InviteLink = {
    id: number
    team_id: number
    team: InviteLinkTeam
    token_hash: string
    created_by_user: CreatedByUser
    expires_at: string
    revoked_at: string
    max_uses: number
    uses: number
    
}

export const useGetInviteLinkWithToken = (token: string) => {
    const { url, headers, enabled } = useKpApi(`/teams/invite?token=${token}`)
    return useQuery({
        queryKey: [`invite_link_${token}`],
        retry: 0,
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<InviteLink>)
    }) 
}

export const useGetTeamById = (teamId: number) => {
    const {url, headers, enabled} = useKpApi(`/teams/${teamId}`)
    return useQuery({
        queryKey: [`team_id_${teamId}`],
        retry: 0,
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<Team>)
    })
}

type IconSearchResult = {
    spell_id: number,
    spell_name: string,
    filename: string
}

export type AssignmentNote = {
    id: number
    note: string
    boss_id: number
    team_id: number
    updated_at: string
}

// pollIntervalMs keeps refetching in the background at that cadence (used
// while the AssignmentsModal is open, so 20-30 concurrent viewers can be
// told a newer note exists instead of everyone needing to refresh the page)
// — pass false (the default) to fetch once like before.
export const useAssignmentNote = (
    teamId: string | undefined,
    bossId: string | undefined,
    pollIntervalMs: number | false = false,
) => {
    const { url, headers, enabled } = useKpApi(`/teams/${teamId}/assignment-note/boss/${bossId}`)
    return useQuery({
        queryKey: [`assignment_note_team_${teamId}_boss_${bossId}`],
        enabled: enabled && !!teamId && !!bossId,
        refetchInterval: pollIntervalMs,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then(res => res.json() as Promise<{ assignment_note: AssignmentNote }>)
    })
}

export type BossLootItem = {
    id: number
    wow_item_id: number
    name: string
    icon_url: string
    item_level: number
    slot: string
    wished: boolean
    obtained: boolean
}

export type BossLoot = {
    items: BossLootItem[]
    priority: number | null
    bonus_rolls: number
    bonus_ids: string
}

export const useGetBossLoot = (teamId: number, bossId: number, characterId: number, difficulty: string) => {
    const { url, headers, enabled } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}?character_id=${characterId}`, ["difficulty", difficulty])
    return useQuery({
        queryKey: ["boss_loot", teamId, bossId, characterId, difficulty],
        enabled: enabled && characterId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ boss_loot: BossLoot }>)
            .then((data) => data.boss_loot)
    })
}

export type ItemWisher = {
    character_id: number
    obtained: boolean
}

export type BossRollOverviewItem = {
    id: number
    wow_item_id: number
    name: string
    icon_url: string
    wishers: ItemWisher[]
}

export type BossRollOverviewCharacterRoll = {
    character_id: number
    priority: number | null
    bonus_rolls: number
    pool_size: number
    done: boolean
}

export type BossRollOverview = {
    bonus_ids: string
    items: BossRollOverviewItem[]
    rolls: BossRollOverviewCharacterRoll[]
}

export const useGetBossRollOverview = (teamId: number, bossId: number, difficulty: string, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}/overview`, ["difficulty", difficulty])
    return useQuery({
        queryKey: ["boss_roll_overview", teamId, bossId, difficulty],
        enabled: enabled && kpEnabled && bossId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ boss_roll_overview: BossRollOverview }>)
            .then((data) => data.boss_roll_overview)
    })
}

export type RaidRollOverviewBossEntry = {
    boss_id: number
    rolls: BossRollOverviewCharacterRoll[]
}

export type RaidRollOverview = {
    bosses: RaidRollOverviewBossEntry[]
}

export const useGetRaidRollOverview = (teamId: number, difficulty: string, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/raid-overview`, ["difficulty", difficulty])
    return useQuery({
        queryKey: ["raid_roll_overview", teamId, difficulty],
        enabled: enabled && kpEnabled && teamId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ raid_roll_overview: RaidRollOverview }>)
            .then((data) => data.raid_roll_overview)
    })
}

export type LootItemSearchResult = {
    item_id: number
    wow_item_id: number
    name: string
    icon_url: string
    boss_id: number
    boss_name: string
}

export const useSearchLootItems = (teamId: number, query: string) => {
    const { url, headers, enabled } = useKpApi(`/teams/${teamId}/loot/items/search`, ["q", query])
    const debouncedSearchTerm = useDebounce(query, 200)
    return useQuery({
        queryKey: ["loot_item_search", teamId, query],
        enabled: enabled && teamId > 0 && !!debouncedSearchTerm,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ items: LootItemSearchResult[] }>)
            .then((data) => data.items)
    })
}

export type ItemRollOverviewWisher = {
    character_id: number
    obtained: boolean
    priority: number | null
    bonus_rolls: number
    pool_size: number
}

export type ItemRollOverview = {
    bonus_ids: string
    wishers: ItemRollOverviewWisher[]
}

export const useGetItemRollOverview = (teamId: number, itemId: number, difficulty: string, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/items/${itemId}/overview`, ["difficulty", difficulty])
    return useQuery({
        queryKey: ["item_roll_overview", teamId, itemId, difficulty],
        enabled: enabled && kpEnabled && itemId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ item_roll_overview: ItemRollOverview }>)
            .then((data) => data.item_roll_overview)
    })
}

export type LootAuditLogEntry = {
    id: number
    event_type: string
    acting_user_btag: string
    character_id: number
    character_name: string
    boss_id: number
    boss_name: string
    difficulty: string
    item_id: number | null
    item_name: string | null
    value: number | null
    created_at: string
}

export type LootAuditLogFilters = {
    characterId?: number
    bossId?: number
    beforeId?: number
}

export const useGetLootAuditLog = (
    teamId: number,
    filters: LootAuditLogFilters,
    enabled = true,
) => {
    const params = new URLSearchParams()
    if (filters.characterId) params.set("character_id", String(filters.characterId))
    if (filters.bossId) params.set("boss_id", String(filters.bossId))
    if (filters.beforeId) params.set("before_id", String(filters.beforeId))
    const query = params.toString()
    const { url, headers, enabled: kpEnabled } = useKpApi(
        `/teams/${teamId}/loot/audit-log${query ? `?${query}` : ""}`,
    )
    return useQuery({
        queryKey: ["loot_audit_log", teamId, filters.characterId, filters.bossId, filters.beforeId],
        enabled: enabled && kpEnabled && teamId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ loot_audit_log: { entries: LootAuditLogEntry[]; has_more: boolean } }>)
            .then((data) => data.loot_audit_log)
    })
}

export type CharacterBossPriorityEntry = {
    boss_id: number
    priority: number
}

export const useGetCharacterBossPriorities = (
    teamId: number,
    characterId: number,
    difficulty: string,
    enabled = true,
) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(
        `/teams/${teamId}/loot/characters/${characterId}/priorities`,
        ["difficulty", difficulty],
    )
    return useQuery({
        queryKey: ["character_boss_priorities", teamId, characterId, difficulty],
        enabled: enabled && kpEnabled && characterId > 0,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ priorities: CharacterBossPriorityEntry[] }>)
            .then((data) => data.priorities)
    })
}

export type TierSlotEntry = {
    character_id: number
    slot: string
    source: string
}

export const useGetTeamTierSlots = (teamId: number, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/tier-tracker`)
    return useQuery({
        queryKey: ["team_tier_slots", teamId],
        enabled: enabled && kpEnabled,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ tier_slots: TierSlotEntry[] }>)
            .then((data) => data.tier_slots)
    })
}

export type TierSimEntry = {
    id: number
    season_id: number
    specialization_id: number
    specialization: SpecializationSummary & {
        armor_type: { id: number; name: string }
        class: { id: number; name: string; color: string; icon_url: string }
    }
    build_label: string
    score_0pc: number
    score_2pc: number
    score_4pc: number
    // Tier-transition comparison data — a second spreadsheet, only present
    // for seasons that follow another season in the same expansion. Run
    // under different sim settings than score_4pc, so score_4pc_new_tier is
    // its own figure, not a duplicate of score_4pc. null (not 0) when not
    // applicable/not entered yet, so it's never confused with a real
    // near-zero gain.
    score_4pc_prev_tier: number | null
    score_2pc_mixed: number | null
    score_4pc_new_tier: number | null
    updated_at: string
}

export const useGetTierSimData = (teamId: number, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/tier-sim`)
    return useQuery({
        queryKey: ["tier_sim_data", teamId],
        enabled: enabled && kpEnabled,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ tier_sim_entries: TierSimEntry[]; last_updated: string | null }>)
    })
}

export type TierSimRefreshConfig = {
    id: number
    current_tier_sheet_url: string
    // Blank means no transition data configured this season (either an
    // expansion's first season, or just not entered yet).
    transition_sheet_url: string
    last_refreshed_at: string | null
    updated_at: string
}

// Owner-only (backend enforces it too) — no reason to fetch this for
// members who can't act on it anyway.
export const useGetTierSimRefreshConfig = (teamId: number, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(`/teams/${teamId}/loot/tier-sim/refresh-config`)
    return useQuery({
        queryKey: ["tier_sim_refresh_config", teamId],
        enabled: enabled && kpEnabled,
        queryFn: async (): Promise<TierSimRefreshConfig> => {
            const res = await fetch(url, { method: "GET", headers })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? "Failed to load tier sim data source")
            return data
        }
    })
}

export type BoeSale = {
    id: number
    team_id: number
    season_id: number
    season: { id: number; name: string }
    player_name: string
    item_name: string
    item_slot: string
    sale_price: number
    sold_to_player: boolean
    guild_cut: number
    player_cut: number
    created_by_user_id: number
    created_at: string
    updated_at: string
}

export type BoeTotals = {
    sale_price: number
    guild_cut: number
    player_cut: number
}

export const useGetBoeSales = (teamId: number, seasonId: number | null, enabled = true) => {
    const { url, headers, enabled: kpEnabled } = useKpApi(
        `/teams/${teamId}/boe`,
        seasonId ? ["season_id", String(seasonId)] : undefined,
    )
    return useQuery({
        queryKey: ["boe_sales", teamId, seasonId],
        enabled: enabled && kpEnabled,
        queryFn: () => fetch(url, { method: "GET", headers })
            .then((res) => res.json() as Promise<{ sales: BoeSale[]; totals: BoeTotals }>)
    })
}

export const useSearchIcons = (query: string) => {
    const {url, headers, enabled} = useKpApi(`/spells/search?q=${query}`)
    const debouncedSearchTerm = useDebounce(query, 200)
    return useQuery({
        queryKey: ['spell_query', query],
        enabled: enabled && !!debouncedSearchTerm,
        // retry: 0,
        queryFn: () => fetch(url, {
                method: "GET",
                headers,
                }).then((res) => res.json() as Promise<IconSearchResult[]>)
    })
}




