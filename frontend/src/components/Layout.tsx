import type { FC, PropsWithChildren } from "react";
import SidebarItem from "./SidebarItem";
import { Sun, Moon, Target, CircleUserRoundIcon, Plus } from "lucide-react";
import { useTeam, useTheme, useUser } from "../hooks";
import { useSession } from "@descope/react-sdk";
import { useState } from "react";
import { Dropdown } from "./form/Dropdown";
import { CreateTeamModal } from "./modals/CreateTeamModal";
import { useMyTeams, type MyRole } from "../api/queryHooks";
import type { DropdownOption } from "./form/Dropdown";

interface ContentBlock {
  type: "text" | "image" | "video";
  value: string;
  caption?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean;
  color?: string;
}

interface Post {
  id: number;
  title: string;
  cardType:
    | "assignment"
    | "warning"
    | "cooldown"
    | "positioning"
    | "mechanic"
    | "media"
    | "general";
  content: ContentBlock[];
  linkedGameId?: number;
}

interface Phase {
  id: number;
  phaseNumber: number;
  name: string;
  isExpanded: boolean;
  isCurrent: boolean;
  hasNewNotes: boolean;
  posts: Post[];
}

interface Boss {
  id: number;
  name: string;
  status: "killed" | "progressing";
  phases: Phase[];
}

const Layout: FC<PropsWithChildren> = ({ children }) => {
  // Layout component thats rendered with every Secure Route
  const { colorMode, toggleColorMode } = useTheme();
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isLoading } = useUser();
  const { team, setTeam } = useTeam();
  const {
    isLoading: isMyTeamsLoading,
    data: myTeamsData,
    error: myTeamsError,
  } = useMyTeams();

  const teamsOptions: DropdownOption<MyRole>[] =
    !isLoading && !myTeamsError && myTeamsData
      ? myTeamsData.map((myRole) => {
          return {
            value: myRole,
            label: myRole.team.name,
            // description: `Team ID: ${myRole.team_id}`,
          };
        })
      : [];

  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [bosses] = useState<Boss[]>([
    {
      id: 2,
      name: "Volcoross",
      status: "progressing",
      phases: [
        {
          id: 3,
          phaseNumber: 3,
          name: "First Overlaps",
          isExpanded: true,
          isCurrent: true,
          hasNewNotes: true,
          posts: [
            {
              id: 1,
              title: "Mythic Mechanics",
              cardType: "mechanic",
              content: [
                {
                  type: "text",
                  value: "There are 8 stars that spawn. Practice movement!",
                  bold: false,
                  color: "#ffffff",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
  if (!isAuthenticated && !isSessionLoading) {
    return <></>;
  }

  return (
    <>
      <div className="flex h-screen">
        <div
          className={`w-72 bg-gray-900 dark:bg-black border-gray-200 dark:border-neutral-900 border-r flex flex-col p-5`}
        >
          <div className="flex flex-col w-full items-start gap-5">
            <div className="flex flex-row justify-between w-full">
              <h1 className="text-white text-2xl font-montserrat font-black">
                KRANKENPREP
              </h1>
              <button
                onClick={() => toggleColorMode()}
                className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
              >
                {colorMode === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-400" />
                )}
              </button>
            </div>

            {user && !isLoading ? (
              <button className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 flex flex-row items-center gap-2 w-full">
                <CircleUserRoundIcon className="w-6 h-6 text-teal-200 " />
                <div className="text-lg">
                  <span className=" text-white ">
                    {user?.btag?.split("#")[0]}
                  </span>
                  <span className="text-gray-400">
                    {"#" + user?.btag?.split("#")[1]}
                  </span>
                </div>
              </button>
            ) : (
              <></>
            )}
            <Dropdown<MyRole>
              variant="minimal"
              label="Team"
              value={team}
              onChange={(value) => {
                // Handle the generic dropdown type (supports arrays) but we only use single selection
                if (typeof value === 'function') {
                  // If it's a function, we need to call it with the current state
                  setTeam((prev) => {
                    const newValue = value(prev);
                    if (Array.isArray(newValue)) {
                      return newValue[0] ?? null;
                    }
                    return newValue;
                  });
                } else if (Array.isArray(value)) {
                  setTeam(value[0] ?? null);
                } else {
                  setTeam(value);
                }
              }}
              valueComparator={(a, b) => a.team_id === b.team_id}
              getOptionKey={(option) => option.value.team_id}
              placeholder="Select a team..."
              actions={[
                {
                  label: "Create a team",
                  handleClick: () => {
                    setIsCreateTeamModalOpen(true);
                  },
                  icon: (
                    <Plus className="w-6 h-5 text-cyan-600 dark:text-cyan-400" />
                  ),
                },
              ]}
              options={teamsOptions}
            />

            {/* <div className="border-b border-neutral-900">
          <Button
            variant={isAdmin ? "primary" : "secondary"}
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setIsAdmin(!isAdmin)}
            className="w-full"
          >
            {isAdmin ? "Admin: ON" : "Admin: OFF"}
          </Button>
        </div> */}

            <div className="w-full flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-amber-500" />
                <h2
                  className={`text-xs uppercase text-gray-500 dark:text-neutral-500 font-semibold`}
                >
                  Progression
                </h2>
              </div>
              {bosses.map((boss) => (
                <SidebarItem
                  key={boss.id}
                  isActive={selectedBoss?.id === boss.id}
                  onClick={() => setSelectedBoss(boss)}
                  icon={<div />}
                >
                  {boss.name}
                </SidebarItem>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto dark:bg-neutral-950 bg-gray-200">
          {children}
        </div>
      </div>
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={setIsCreateTeamModalOpen}
      />
    </>
  );
};

export default Layout;
