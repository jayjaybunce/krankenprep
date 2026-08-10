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
        mutationFn: (payload: CreatePlayerPayload) => fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json()),
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
        mutationFn: ({ playerId, ...payload }: UpdatePlayerPayload) => fetch(`${url}/${playerId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json()),
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
        mutationFn: (playerId: number) => fetch(`${url}/${playerId}`, {
            method: "DELETE",
            headers
        }).then(res => res.json()),
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
        mutationFn: (playerId: number) => fetch(`${url}/${playerId}/claim`, {
            method: "POST",
            headers
        }).then(res => res.json()),
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
        mutationFn: (playerId: number) => fetch(`${url}/${playerId}/claim`, {
            method: "DELETE",
            headers
        }).then(res => res.json()),
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
        mutationFn: ({ playerId, ...payload }: CreateCharacterPayload) => fetch(`${url}/${playerId}/characters`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json()),
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
        mutationFn: ({ characterId, ...payload }: UpdateCharacterPayload) => fetch(`${url}/${characterId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then(res => res.json()),
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
        mutationFn: (characterId: number) => fetch(`${url}/${characterId}`, {
            method: "DELETE",
            headers
        }).then(res => res.json()),
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
        mutationFn: (roleId: number) => fetch(`${url}/${roleId}`, {
            method: "DELETE",
            headers
        }).then((res) => res.json()),
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
        mutationFn: ({ roleId, name }: UpdateMemberRolePayload) => fetch(`${url}/${roleId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ name })
        }).then((res) => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`team_id_${teamId}`]})
        }
    })
}

type UploadDroptimizerPayload = {
    wishlist_name: string
    url: string
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
        mutationFn: (note: string) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify({ note })
        }).then(res => res.json()),
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
        mutationFn: (payload: SetBonusRollCountPayload) => fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        }).then((res) => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boss_loot", teamId, bossId] })
        }
    })
}

export const useUploadDroptimizer = (teamId: number) => {
    const { headers, url } = useKpApi(`/teams/${teamId}/wowaudit/upload`)
    return useMutation({
        mutationKey: ["uploadDroptimizer", teamId],
        mutationFn: async (payload: UploadDroptimizerPayload) => {
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