import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { useSession } from "@descope/react-sdk";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "./context/UserContext";
import { TeamContext } from "./context/TeamContext";
import { manaforge, midnight, nerubarpalace, undermine } from "./data/raids";
import type { User } from "./types/api/user";
  
export const useTheme = () => useContext(ThemeContext);

export const useUser = () => useContext(UserContext)

export const useTeam = () => useContext(TeamContext)

export const useKpApi = (
  endpoint: string,
  params?: Record<string, any>,
  domainOverride = ''
): { url: string; headers: Headers; enabled: boolean, apiUrl: string } => {
  const { sessionToken, isSessionLoading } = useSession();

  const headers = new Headers();
  headers.append("Authorization", sessionToken);

  const apiUrl = domainOverride || import.meta.env.VITE_BACKEND_URL;

  // Build URL object (allows safe param appending)
  const urlObj = new URL(endpoint, apiUrl);

  // Add query params if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // handle array params: ?tag=a&tag=b
      if (Array.isArray(value)) {
        value.forEach((v) => urlObj.searchParams.append(key, String(v)));
      } else {
        urlObj.searchParams.append(key, String(value));
      }
    });
  }

  return {
    url: urlObj.toString(),
    headers,
    enabled: !!sessionToken && !isSessionLoading,
    apiUrl,
  };
};

export const useRaidData = (pathname: string) => {
    if (pathname.includes("midnight")){
      return midnight
    }
    if (pathname.includes("manaforge")){
      return manaforge
    }
    if (pathname.includes("undermine")){
      return undermine
    }
    if (pathname.includes("nerubarpalace")){
      return nerubarpalace
    }
    return midnight
  }

export const useApi = <T>(method: string, endpoint: string, key: string[], options?: Omit<RequestInit, "method" | "headers">, domainOverride?: string) => {
    const { sessionToken, isSessionLoading } = useSession()
    const headers = new Headers();
    headers.append("Authorization", sessionToken);
    const apiUrl = domainOverride ? domainOverride : import.meta.env.VITE_BACKEND_URL
    const requestUrl = encodeURI(apiUrl + endpoint)
    const query = useQuery({
      queryKey: key,
      enabled: !!sessionToken && !isSessionLoading,
      queryFn: () => fetch(requestUrl, {
        method: method,
        headers,
        ...options
      }).then((res) => res.json() as Promise<T>),
    });
    return query
}

export type PlanShallow = {
  id: number;
  share_id: string;
  name: string;
  boss: string;
  raid: string;
  tabCount: number;
  created_at: string;
  updated_at: string;
  sequence: string
};

export type RecentPlans = {
  user_tag: string;
  plans: PlanShallow[];
};

export const useRecentlyViewedPlans = (user: User | null | undefined): RecentPlans => {
  const unauthedLSKey = "unauthed_recent_plans";
  const authedLSKey = user
    ? `user_${user.btag}_recent_plans`
    : "user_null_recent_plans";
  const key = user ? authedLSKey : unauthedLSKey;
  const recentlyViewedPlans = JSON.parse(
    localStorage.getItem(key) || "{}",
  ) as RecentPlans;

  return recentlyViewedPlans;
};

