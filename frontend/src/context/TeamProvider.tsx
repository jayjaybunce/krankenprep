import { useState } from "react";
import { TeamContext } from "./TeamContext";
import type { FC, PropsWithChildren } from "react";
import { useMyTeams, type MyRole } from "../api/queryHooks";

export const TeamProvider: FC<PropsWithChildren> = ({ children }) => {
  const [team, setTeam] = useState<MyRole | null>(null);

  return (
    <TeamContext
      value={{
        team,
        setTeam,
      }}
    >
      {children}
    </TeamContext>
  );
};
