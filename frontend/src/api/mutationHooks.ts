import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useKpApi } from "../hooks"

type CreateTeamPayload = {
    name: string,
    rio_url: string,
    server: string,
    region: string
}


// type CreatTeamPayload struct {
// 	Name   string `json:"name"`
// 	RioUrl string `json:"rio_url"`
// 	Server string `json:"server"`
// 	Region string `json:"region"`
// }

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