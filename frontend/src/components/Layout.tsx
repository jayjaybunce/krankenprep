import type { FC, PropsWithChildren } from "react";
import SidebarItem from "./SidebarItem";
import {
  Sun,
  Moon,
  Target,
  CircleUserRoundIcon,
  Plus,
  Copy,
} from "lucide-react";
import { useTeam, useTheme, useUser } from "../hooks";
import { useSession } from "@descope/react-sdk";
import { useEffect, useState } from "react";
import { Dropdown } from "./form/Dropdown";
import { CreateTeamModal } from "./modals/CreateTeamModal";
import {
  useCurrentBosses,
  useCurrentExpansion,
  useMyTeams,
  type MyRole,
} from "../api/queryHooks";
import type { DropdownOption } from "./form/Dropdown";
import Button from "./Button";
import Section from "./Section";
import Badge from "./Badge";
import { preload } from "react-dom";

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
  const [activeExpansion, setActiveExpansion] = useState("Manaforge Omega");
  const { colorMode, toggleColorMode } = useTheme();
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const { isAuthenticated, isSessionLoading, sessionToken } = useSession();
  const { user, isLoading } = useUser();
  const { team, setTeam, setBoss, boss } = useTeam();
  const {
    isLoading: isMyTeamsLoading,
    data: myTeamsData,
    error: myTeamsError,
  } = useMyTeams();

  const {
    isLoading: isExpLoading,
    data: expData,
    error: expError,
  } = useCurrentExpansion();

  useEffect(() => {
    // Preload all boss splash images ezpz lol
    expData?.forEach((exp) => {
      exp?.seasons?.forEach((s) => {
        s?.raids?.forEach((r) => {
          r?.bosses?.forEach((b) => {
            if (b?.splash_img_url) {
              preload(b.splash_img_url, { as: "image" });
            }
          });
        });
      });
    });
  }, [expData]);

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

  if (!isAuthenticated && !isSessionLoading) {
    return <></>;
  }

  return (
    <>
      <div className="flex h-100 min-h-full">
        <div
          className={`w-80 bg-white dark:bg-black border-gray-200 dark:border-neutral-900 border-r flex flex-col p-5 sticky top-0`}
        >
          <div className="flex flex-col w-full items-start gap-5">
            <div className="flex flex-row justify-between w-full">
              <h1 className="dark:text-white text-2xl font-montserrat font-black text-black">
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
              <>
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
                {import.meta.env.VITE_IS_LOCAL && sessionToken && (
                  <div className="p-2 rounded-md bg-neutral-800 border border-neutral-700 w-full">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <span className="text-xs text-white font-mono truncate">
                        {sessionToken}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sessionToken);
                        }}
                        className="p-1 rounded hover:bg-neutral-700 transition flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3 h-3 text-teal-200" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <></>
            )}
            <Dropdown<MyRole>
              variant="minimal"
              label="Team"
              value={team}
              onChange={(value) => {
                // Handle the generic dropdown type (supports arrays) but we only use single selection
                if (typeof value === "function") {
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
            <div className="w-full flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-amber-500" />
                <h2
                  className={`text-md uppercase text-gray-500 dark:text-neutral-500 font-semibold`}
                >
                  Progression
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {!isExpLoading && !expError && expData ? (
                  expData.map((exp) => {
                    return exp.seasons?.map((s) => {
                      return s?.raids?.map((raid) => {
                        return (
                          <Section
                            variant="bordered"
                            label={s.name}
                            showPulse={s.is_current}
                            titleBackgroundImage={raid.splash_img_url}
                            title={raid.name}
                            isExpanded={s.name === activeExpansion}
                            setIsExpanded={() => setActiveExpansion(s.name)}
                          >
                            <div className="flex flex-col gap-2">
                              {raid.bosses?.map((b) => {
                                const selected = b.id === boss?.id;
                                return (
                                  <button
                                    onClick={() =>
                                      selected ? setBoss(null) : setBoss(b)
                                    }
                                    className={`flex h-10 overflow-hidden rounded-lg bg-gradient-to-r
                                      ${selected ? "from-cyan-900/60 to-blue-900/60" : "from-slate-800/80 to-slate-700/80"}
                                      hover:from-cyan-900/60 hover:to-blue-900/60 border
                                      ${selected ? "border-cyan-400/40" : "border-cyan-500/20"}
                                      hover:border-cyan-400/40 shadow-lg
                                      ${selected ? "shadow-cyan-500/20" : "shadow-slate-900/40"}
                                      hover:shadow-cyan-500/20 backdrop-blur-sm
                                      transition-all duration-200 ${selected ? "scale-[1.02]" : ""}
                                      hover:scale-[1.02] cursor-pointer group`}
                                  >
                                    <img
                                      className="w-auto h-full object-cover"
                                      src={b.icon_img_url}
                                    />
                                    <div
                                      className={`flex font-montserrat items-center w-full truncate px-3 font-semibold text-sm ${selected ? "text-cyan-300" : "text-slate-200"} group-hover:text-cyan-300`}
                                    >
                                      {b.name}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </Section>
                        );
                      });
                    });
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-neutral-950 bg-neutral-50 w-full">
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
