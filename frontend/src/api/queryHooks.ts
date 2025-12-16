import { useQuery } from "@tanstack/react-query"
import type { User } from "../types/api/user"
import { useKpApi } from "../hooks"
import type { Region } from "../types/api/region"
import type { Server } from "../types/api/server"
import type { QueryBosses } from "../types/api/boss"
import type { ExpansionResponse } from "../types/api/expansion"


export const useMe = () => {
    const { url, headers, enabled } = useKpApi("/me")
    return useQuery({
        queryKey: ["me"],
        enabled,
        queryFn: () => fetch(url, {
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<User>)
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
    const { url, headers, enabled } = useKpApi('/servers', ["region", region_filter])
    return useQuery({
        queryKey: ["servers"],
        enabled,
        queryFn: () => fetch(url,{
            method: "GET",
            headers
        }).then((res) => res.json() as Promise<Server[]>) 
    })
}

export type Team = {
        id: number,
        name: string,
        server: string,
        region: string,
        rio_url: string,
        roles: []
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

