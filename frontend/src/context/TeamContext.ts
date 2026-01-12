import { createContext, type Dispatch, type SetStateAction } from "react"
import type { MyRole } from "../api/queryHooks";
import type { Boss } from "../types/api/expansion";

export type TeamState = {
  team: MyRole | null
  setTeam: (team: MyRole | null) => void
  isEditing: boolean,
  setIsEditing: Dispatch<SetStateAction<boolean>>
  boss: Boss | null
  setBoss: Dispatch<SetStateAction<Boss | null>>
}

type TeamContextValue = TeamState 

export const TeamContext = createContext<TeamContextValue>(
  { 
    team: null, 
    setTeam: () => 'Team Context has not been initialized', 
    isEditing: false, 
    setIsEditing: () => false,
    boss: null,
    setBoss: () => null
  }
)