import { useState } from "react";
import { TeamContext } from "./TeamContext";
import type { FC, PropsWithChildren } from "react";
import { type MyRole } from "../api/queryHooks";
import type { Boss } from "../types/api/expansion";

export const TeamProvider: FC<PropsWithChildren> = ({ children }) => {
  // Setup team based stuff
  const [team, setTeam] = useState<MyRole | null>(() => {
    const stored = localStorage.getItem("kp_selected_team");
    return stored ? JSON.parse(stored) : null;
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleTeamChange = (team: MyRole | null) => {
    localStorage.setItem("kp_selected_team", JSON.stringify(team));
    setTeam(team);
  };
  //

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
