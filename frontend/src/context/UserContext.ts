import { createContext } from "react";
import type { User } from "../types/api/user"; 

type UserContextType = {
    user: User | null | undefined
    isLoading: boolean
}

export const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: false
})