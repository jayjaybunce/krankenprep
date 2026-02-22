import { useState, useMemo } from "react";
import { TeamContext } from "./TeamContext";
import type { FC, PropsWithChildren } from "react";
import { type MyRole, useMyTeams } from "../api/queryHooks";
import type { Boss } from "../types/api/expansion";

export const TeamProvider: FC<PropsWithChildren> = ({ children }) => {
  // Setup team based stuff
  const [cachedTeam, setCachedTeam] = useState<MyRole | null>(() => {
    const stored = localStorage.getItem("kp_selected_team");
    return stored ? JSON.parse(stored) : null;
  });
  const [isEditing, setIsEditing] = useState(false);

  const { data: myTeamsData } = useMyTeams();

  // Derive the live team from query data; fall back to cached value while loading
  const team = useMemo(() => {
    if (!myTeamsData || cachedTeam == null) return cachedTeam;
    return myTeamsData.find((x) => x.team_id === cachedTeam.team_id) ?? null;
  }, [myTeamsData, cachedTeam]);

  const handleTeamChange = (team: MyRole | null) => {
    localStorage.setItem("kp_selected_team", JSON.stringify(team));
    setCachedTeam(team);
  };
  // Setup boss based stuff
  const [boss, setBoss] = useState<Boss | null>(null);

  return (
    <TeamContext
      value={{
        team,
        setTeam: handleTeamChange,
        isEditing,
        setIsEditing,
        boss,
        setBoss,
      }}
    >
      {children}
    </TeamContext>
  );
};
