import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useKpApi } from "../hooks"
import type { Tab } from "../components/Planner/Planner"
import type { BossLoot, TierSlotEntry } from "./queryHooks"

type CreateTeamPayload = {
    name: string,
    rio_url: string,
    server: string,
    region: string,
    wowaudit_integration: boolean,
    wowaudit_url?: string,
    wowaudit_api_key?: string,
    wowutils_integration: boolean,
    wowutils_group_id?: string,
    wowutils_api_key?: string,
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
    wowutils_integration: boolean,
    wowutils_group_id: string,
    wowutils_api_key: string,
}

export const useUpdateTeam = (teamId: number) => {
    const { url, headers } = useKpApi(`/teams/${teamId}`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateTeam"],
        mutationFn: async (payload: UpdateTeamPayload) => {
            const res = await fetch(url, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update team")
            }
            return data
        },
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
        mutationFn: async (payload: CreateSectionPayload) => {
            const res = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create section")
            }
            return data
        },
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
        mutationFn: async ({ sectionId, ...payload }: { sectionId: number } & UpdateSectionPayload) => {
            const res = await fetch(`${url}/${sectionId}`, { method: "PUT", headers, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update section")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

export const useDeleteSection = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/sections")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (sectionId: number) => {
            const res = await fetch(`${url}/${sectionId}`, { method: "DELETE", headers })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete section")
            }
            return data
        },
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
        mutationFn: async (payload: CreateNotePayload) => {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create note")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`]})
        }
    })
}

export const useUpdateNote = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/notes")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ noteId, content }: { noteId: number; content: string }) => {
            const res = await fetch(`${url}/${noteId}`, { method: "PUT", headers, body: JSON.stringify({ content }) })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update note")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_${teamId}_boss_${bossId}`] })
        }
    })
}

export const useDeleteNote = (bossId: string | undefined, teamId: string | undefined) => {
    const { url, headers } = useKpApi("/notes")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (noteId: number) => {
            const res = await fetch(`${url}/${noteId}`, { method: "DELETE", headers })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete note")
            }
            return data
        },
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
        mutationFn: async (payload: CreateInviteLinkPayload) => {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create invite link")
            }
            return data as CreateInviteLinkResponse
        },
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
        mutationFn: async (inviteHash: string) => {
            const res = await fetch(url + `?token=${inviteHash}`, {
                method: "DELETE",
                headers,
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to revoke invite link")
            }
            return data as RevokeInviteLinkResponse
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
        mutationFn: async () => {
            const res = await fetch(url, {
                method: "POST",
                headers,
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to sync WowAudit wishlists")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
            queryClient.invalidateQueries({ queryKey: ["my_teams"]})
        }
    })
}

type CreatePlayerPayload = {
    name: string
    battletag: string
    user_id?: number | null
}

export const useCreatePlayer = (teamId: number) => {
    const { url, headers } = useKpApi(`/teams/${teamId}/players`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createPlayer"],
        mutationFn: async (payload: CreatePlayerPayload) => {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to add player")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

type UpdatePlayerPayload = {
    playerId: number
    name: string
    battletag: string
    user_id?: number | null
}

export const useUpdatePlayer = (teamId: number) => {
    const { headers, url } = useKpApi("/players")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updatePlayer"],
        mutationFn: async ({ playerId, ...payload }: UpdatePlayerPayload) => {
            const res = await fetch(`${url}/${playerId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update player")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

export const useDeletePlayer = (teamId: number) => {
    const { headers, url } = useKpApi("/players")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["deletePlayer"],
        mutationFn: async (playerId: number) => {
            const res = await fetch(`${url}/${playerId}`, {
                method: "DELETE",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete player")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

export const useClaimPlayer = (teamId: number) => {
    const { headers, url } = useKpApi("/players")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["claimPlayer"],
        mutationFn: async (playerId: number) => {
            const res = await fetch(`${url}/${playerId}/claim`, {
                method: "POST",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to claim character")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

export const useUnclaimPlayer = (teamId: number) => {
    const { headers, url } = useKpApi("/players")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["unclaimPlayer"],
        mutationFn: async (playerId: number) => {
            const res = await fetch(`${url}/${playerId}/claim`, {
                method: "DELETE",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to unclaim character")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

type CreateCharacterPayload = {
    playerId: number
    name: string
    class: string
    realm: string
    region: string
    is_main: boolean
    specialization_id: number | null
}

export const useCreateCharacter = (teamId: number) => {
    const { headers, url } = useKpApi("/players")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createCharacter"],
        mutationFn: async ({ playerId, ...payload }: CreateCharacterPayload) => {
            const res = await fetch(`${url}/${playerId}/characters`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to add character")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

type UpdateCharacterPayload = {
    characterId: number
    name: string
    class: string
    realm: string
    region: string
    is_main: boolean
    specialization_id: number | null
}

export const useUpdateCharacter = (teamId: number) => {
    const { headers, url } = useKpApi("/characters")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateCharacter"],
        mutationFn: async ({ characterId, ...payload }: UpdateCharacterPayload) => {
            const res = await fetch(`${url}/${characterId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update character")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

export const useDeleteCharacter = (teamId: number) => {
    const { headers, url } = useKpApi("/characters")
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["deleteCharacter"],
        mutationFn: async (characterId: number) => {
            const res = await fetch(`${url}/${characterId}`, {
                method: "DELETE",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete character")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`] })
        }
    })
}

export const useDeleteMemberFromTeam = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/member`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["deleteMemberFromTeam"],
        mutationFn: async (roleId: number) => {
            const res = await fetch(`${url}/${roleId}`, {
                method: "DELETE",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to remove member")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}

type UpdateMemberRolePayload = {
    roleId: number
    name: "member" | "admin" | "loot_council"
}

export const useUpdateMemberRole = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/member`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateMemberRole"],
        mutationFn: async ({ roleId, name }: UpdateMemberRolePayload) => {
            const res = await fetch(`${url}/${roleId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ name })
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update member role")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}

export type DroptimizerProvider = "wowaudit" | "wowutils"

type UploadDroptimizerPayload = {
    url: string
    // wishlist_name is WowAudit-only (which wishlist config to validate/
    // upload against). profile_key is WowUtils-only (targets a specific
    // existing profile instead of creating a new one) — accepted by the
    // backend but not currently surfaced anywhere in the UI for a user to
    // set.
    wishlist_name?: string
    profile_key?: string
}

export type UploadDroptimizerResult = {
    message: string
    character_id?: string
    source?: string
    imported_at?: string
    report_url?: string
    // WowUtils-only, best-effort — pulled server-side from the report
    // page's own Open Graph tags. Either/both may be absent (fetch failed,
    // timed out, or the report host doesn't set these tags).
    report_title?: string
    report_image_url?: string
}

export class DroptimizerUploadError extends Error {
    details: string[]
    constructor(message: string, details: string[]) {
        super(message)
        this.details = details
    }
}

export const useUpsertAssignmentNote = (teamId: string | undefined, bossId: string | undefined) => {
    const { url, headers } = useKpApi(`/teams/${teamId}/assignment-note/boss/${bossId}`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (note: string) => {
            const res = await fetch(url, {
                method: "PUT",
                headers,
                body: JSON.stringify({ note })
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to save assignment note")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`assignment_note_team_${teamId}_boss_${bossId}`] })
        }
    })
}

type ToggleItemWishPayload = {
    character_id: number
    item_id: number
    difficulty: string
    wished: boolean
}

// characterId/difficulty scope this to the exact boss_loot cache entry
// currently being viewed (useGetBossLoot's query key), so the optimistic
// patch below lands on the right cached data instead of guessing.
export const useToggleItemWish = (
    teamId: number,
    bossId: number,
    characterId: number,
    difficulty: string
) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}/wish`)
    const queryClient = useQueryClient()
    const queryKey = ["boss_loot", teamId, bossId, characterId, difficulty]
    return useMutation({
        mutationKey: ["toggleItemWish", teamId, bossId, characterId, difficulty],
        mutationFn: (payload: ToggleItemWishPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update wishlist")
            }
            return data
        }),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<BossLoot>(queryKey)
            queryClient.setQueryData<BossLoot>(queryKey, (old) => {
                if (!old) return old
                return {
                    ...old,
                    items: old.items.map((item) =>
                        item.id === payload.item_id ? { ...item, wished: payload.wished } : item
                    )
                }
            })
            return { previous }
        },
        onError: (_err, _payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId, bossId] })
        }
    })
}

type UpdateItemObtainedPayload = {
    character_id: number
    item_id: number
    difficulty: string
    obtained: boolean
}

export const useUpdateItemObtained = (
    teamId: number,
    bossId: number,
    characterId: number,
    difficulty: string
) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}/obtained`)
    const queryClient = useQueryClient()
    const queryKey = ["boss_loot", teamId, bossId, characterId, difficulty]
    return useMutation({
        mutationKey: ["updateItemObtained", teamId, bossId, characterId, difficulty],
        mutationFn: (payload: UpdateItemObtainedPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update obtained status")
            }
            return data
        }),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<BossLoot>(queryKey)
            queryClient.setQueryData<BossLoot>(queryKey, (old) => {
                if (!old) return old
                return {
                    ...old,
                    items: old.items.map((item) =>
                        item.id === payload.item_id ? { ...item, obtained: payload.obtained } : item
                    )
                }
            })
            return { previous }
        },
        onError: (_err, _payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId, bossId] })
        }
    })
}

type SetBossPriorityPayload = {
    character_id: number
    difficulty: string
    priority: number
}

export const useSetBossPriority = (teamId: number, bossId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}/priority`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["setBossPriority"],
        mutationFn: (payload: SetBossPriorityPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to set priority")
            }
            return data
        }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId, bossId] })
            queryClient.invalidateQueries({
                queryKey: ["character_boss_priorities", teamId, variables.character_id, variables.difficulty]
            })
        }
    })
}

type ReorderBossPrioritiesPayload = {
    difficulty: string
    boss_ids: number[]
}

export const useReorderBossPriorities = (teamId: number, characterId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/characters/${characterId}/priorities`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["reorderBossPriorities"],
        mutationFn: (payload: ReorderBossPrioritiesPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to reorder priorities")
            }
            return data
        }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["character_boss_priorities", teamId, characterId, variables.difficulty]
            })
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId] })
        }
    })
}

type SetBonusRollCountPayload = {
    character_id: number
    difficulty: string
    count: number
}

export const useSetBonusRollCount = (teamId: number, bossId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/boss/${bossId}/bonus-rolls`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["setBonusRollCount"],
        mutationFn: async (payload: SetBonusRollCountPayload) => {
            const res = await fetch(url, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update bonus rolls")
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId, bossId] })
        }
    })
}

export const useUploadDroptimizer = (teamId: number, provider: DroptimizerProvider) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/${provider}/upload`)
    return useMutation({
        mutationKey: ["uploadDroptimizer", provider, teamId],
        mutationFn: async (payload: UploadDroptimizerPayload): Promise<UploadDroptimizerResult> => {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new DroptimizerUploadError(
                    data.error ?? "Upload failed",
                    data.details ?? []
                )
            }
            return data
        }
    })
}

type SetCharacterTierSlotPayload = {
    slot: string
    source: string
}

export const useSetCharacterTierSlot = (teamId: number, characterId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/loot/tier-tracker/characters/${characterId}`)
    const queryClient = useQueryClient()
    const queryKey = ["team_tier_slots", teamId]
    return useMutation({
        mutationKey: ["setCharacterTierSlot", teamId, characterId],
        mutationFn: (payload: SetCharacterTierSlotPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to set tier slot")
            }
            return data
        }),
        // Flip the cell to the picked value immediately rather than waiting
        // on a round trip + a second refetch — deterministic write, the
        // server has no reason to disagree, so the guess is always right on
        // success. Rolled back in onError if it isn't.
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<TierSlotEntry[]>(queryKey)
            queryClient.setQueryData<TierSlotEntry[]>(queryKey, (old) => {
                const existing = old ?? []
                const idx = existing.findIndex(
                    (e) => e.character_id === characterId && e.slot === payload.slot
                )
                if (idx === -1) {
                    return [...existing, { character_id: characterId, slot: payload.slot, source: payload.source }]
                }
                const next = [...existing]
                next[idx] = { ...next[idx], source: payload.source }
                return next
            })
            return { previous }
        },
        onError: (_err, _payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        }
    })
}

type BoeSalePayload = {
    player_name: string
    item_name: string
    item_slot: string
    sale_price: number
    sold_to_player: boolean
}

export const useCreateBoeSale = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/boe`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createBoeSale", teamId],
        mutationFn: (payload: BoeSalePayload) => fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create BoE sale")
            }
            return data
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boe_sales", teamId] })
        }
    })
}

export const useUpdateBoeSale = (teamId: number, boeSaleId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/boe/${boeSaleId}`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateBoeSale", teamId, boeSaleId],
        mutationFn: (payload: BoeSalePayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to update BoE sale")
            }
            return data
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boe_sales", teamId] })
        }
    })
}

export const useDeleteBoeSale = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/boe`)
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["deleteBoeSale", teamId],
        mutationFn: (boeSaleId: number) => fetch(`${url}/${boeSaleId}`, {
            method: "DELETE",
            headers
        }).then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete BoE sale")
            }
            return data
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boe_sales", teamId] })
        }
    })
}