import { createContext, type Dispatch, type SetStateAction } from "react"
import type { MyRole } from "../api/queryHooks";

export type TeamState = {
  team: MyRole | null
  setTeam: Dispatch<SetStateAction<MyRole | null>>
}

type TeamContextValue = TeamState 

export const TeamContext = createContext<TeamContextValue>({ team: null, setTeam: () => 'Team Context has not been initialized'})