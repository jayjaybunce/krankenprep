import { useQuery } from "@tanstack/react-query"
import type { User } from "../types/api/user"
import { useKpApi } from "../hooks"
import type { Region } from "../types/api/region"
import type { Server } from "../types/api/server"


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

log.Print("In here")

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

