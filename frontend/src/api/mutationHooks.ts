import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useKpApi } from "../hooks"
import type { Tab } from "../components/Planner/Planner"

type CreateTeamPayload = {
    name: string,
    rio_url: string,
    server: string,
    region: string,
    wowaudit_integration: boolean,
    wowaudit_url?: string,
    wowaudit_api_key?: string,
}

type CreateSectionPayload = {
    team_id: number,
    boss_id: number,
    name: string,
    description: string
    variant: string
    tags: string
}



// type CreatTeamPayload struct {
// 	Name   string `json:"name"`
// 	RioUrl string `json:"rio_url"`
// 	Server string `json:"server"`
// 	Region string `json:"region"`
// }

type UpdateTeamPayload = {
    wowaudit_integration: boolean,
    wowaudit_url: string,
    wowaudit_api_key: string,
}

export const useUpdateTeam = (teamId: number) => {
    const { url, headers } = useKpApi(`/teams/${teamId}`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateTeam"],
        mutationFn: (payload: UpdateTeamPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
            queryClient.invalidateQueries({ queryKey: ["my_teams"]})
        }
    })
}

export const useCreateTeam = () => {
    const {url, headers} = useKpApi("/team")
    const queryClient = useQueryClient()
    // headers.append("Content-Type", "application/json")
    return useMutation({
        mutationKey: ["createTeam"],
        mutationFn: (payload: CreateTeamPayload) => fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my_teams"]})
        }
    })

}

export const useCreateSection = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers} = useKpApi("/sections")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createSection"],
        mutationFn: (payload: CreateSectionPayload) => fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`]})
        }
    })
}

type UpdateSectionPayload = {
    name: string
    description: string
    variant: string
    tags: string
}

export const useUpdateSection = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/sections")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ sectionId, ...payload }: { sectionId: number } & UpdateSectionPayload) =>
            fetch(`${url}/${sectionId}`, { method: "PUT", headers, body: JSON.stringify(payload) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

export const useDeleteSection = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/sections")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (sectionId: number) =>
            fetch(`${url}/${sectionId}`, { method: "DELETE", headers }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

type CreateNotePayload = {
    section_id: number,
    content: string
}

export const useCreateNote = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/notes")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createNote"],
        mutationFn: (payload: CreateNotePayload) => fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`]})
        }
    })
}

export const useUpdateNote = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/notes")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ noteId, content }: { noteId: number; content: string }) =>
            fetch(`${url}/${noteId}`, { method: "PUT", headers, body: JSON.stringify({ content }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

export const useDeleteNote = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/notes")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (noteId: number) =>
            fetch(`${url}/${noteId}`, { method: "DELETE", headers }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

type CreateRaidplanPayload = {
    content: Tab[]
    name: string
    user_id: string | undefined
    boss: string
    sequence: string
    raid: string
}

export type Raidplan = {
    id: number
    share_id: string
    edit_id: string
    content: Tab[]
    name: string
    user_id?: number | null
    boss: string
    section_id?: number | null
    created_at: string
    updated_at: string
}

export const useCreateRaidplan = () => {
    const { url, headers } = useKpApi('/raidplans')
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createRaidplan"],
        mutationFn: (payload: CreateRaidplanPayload) => fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json() as Promise<Raidplan>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my_raidplans"]})

        }
    })
}

export const useUpdateRaidplan = (id: number | undefined) => {
    const { url, headers } = useKpApi(`/raidplans/${id}`)
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ["updateRaidplan"],
      mutationFn: (payload: Omit<CreateRaidplanPayload, "sequence"> & {raidplan_id: number | undefined }) => fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      }).then(res => res.json() as Promise<Raidplan>),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`raidplan_${id}`]})
      }
    })
}

type CreateInviteLinkPayload = {
    team_id: number
    expires_at: string
    max_uses: number
}

type CreateInviteLinkResponse = {
    message: string
    token: string
}

export const useCreateInviteLink = (teamId: number) => {
    const { url, headers } = useKpApi('/teams/invite')
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createInviteLink"],
        mutationFn: (payload: CreateInviteLinkPayload) => fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json() as Promise<CreateInviteLinkResponse>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}

type RevokeInviteLinkResponse = {
    message: string
    revoked_at: string
}

export const useRevokeInviteLink = (teamId: number) => {
    const { headers, url } = useKpApi("/teams/invite")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["revokeInviteLink"],
        mutationFn: (inviteHash: string) => {
            return fetch(url + `?token=${inviteHash}`, {
                method: "DELETE",
                headers,
            }).then(res => res.json() as Promise<RevokeInviteLinkResponse>)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}

type RedeemInviteLinkResponse = {
    message: string
    team_id: number
}

export const useRedeemInviteLink = () => {
    const { headers, url } = useKpApi('/teams/invite/redeem')
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["redeemInviteLink"],
        mutationFn: (token: string) => {
            return fetch(url + `?token=${token}`, {
                method: "POST",
                headers,
            }).then(async (res) => {
                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Failed to redeem invite')
                }
                return res.json() as Promise<RedeemInviteLinkResponse>
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my_teams"]})
        }
    })
}

export const useSyncWowAuditWishlists = (teamId: number) => {
    const { url, headers } = useKpApi(`/teams/${teamId}/wowaudit/sync`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["syncWowAuditWishlists"],
        mutationFn: () => fetch(url, {
            method: "POST",
            headers,
        }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
            queryClient.invalidateQueries({ queryKey: ["my_teams"]})
        }
    })
}

export const useDeleteMemberFromTeam = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/member`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["deleteMemberFromTeam"],
        mutationFn: (roleId: number) => fetch(`${url}/${roleId}`, {
            method: "DELETE",
            headers
        }).then((res) => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}