import { useQuery } from "@tanstack/react-query"
import { useDebounce, useKpApi } from "../hooks"
import type { Region } from "../types/api/region"
import type { Server } from "../types/api/server"
import type { ExpansionResponse } from "../types/api/expansion"
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
        wishlist_configs: Wishlist[] | null
        roles: MyRole[]
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

type Note = {
    id: number
    section_id: number
    content: string
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
    console.log(`team_${teamId}_boss_${bossId}`)
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
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<RaidPlan>)
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




