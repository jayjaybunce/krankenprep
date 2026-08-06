import type { FC } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTeam } from "../../hooks";
import { useMyTeams, type MyRole } from "../../api/queryHooks";
import { Dropdown, type DropdownOption } from "../form/Dropdown";
import { CreateTeamModal } from "../modals/CreateTeamModal";

const Profile: FC = () => {
  const { team, setTeam } = useTeam();
  const { data: myTeamsData, error: myTeamsError, isLoading } = useMyTeams();
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const teamsOptions: DropdownOption<MyRole>[] =
    !isLoading && !myTeamsError && Array.isArray(myTeamsData)
      ? myTeamsData.map((myRole) => ({
          value: myRole,
          label: myRole.team.name,
        }))
      : [];

  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="font-montserrat text-2xl font-bold dark:text-white text-black mb-6">
        Profile
      </h1>
      <div className="max-w-sm">
        <Dropdown<MyRole>
          variant="minimal"
          label="Team"
          value={team}
          onChange={(value) => {
            if (Array.isArray(value)) setTeam(value[0] ?? null);
            else if (typeof value !== "function") setTeam(value);
          }}
          valueComparator={(a, b) => a.team_id === b.team_id}
          getOptionKey={(option) => option.value.team_id}
          placeholder="Select a team..."
          actions={[
            {
              label: "Create a team",
              handleClick: () => setIsCreateTeamModalOpen(true),
              icon: (
                <Plus className="w-6 h-5 text-cyan-600 dark:text-cyan-400" />
              ),
            },
          ]}
          options={teamsOptions}
        />
      </div>
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={setIsCreateTeamModalOpen}
      />
    </div>
  );
};

export default Profile;
