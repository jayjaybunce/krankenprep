import type { FC, PropsWithChildren } from "react";
import SidebarItem from "./SidebarItem";
import {
  Sun,
  Moon,
  Target,
  CircleUserRoundIcon,
  Plus,
  Copy,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldHalf,
} from "lucide-react";
import { useTeam, useTheme, useUser } from "../hooks";
import { Descope, useSession } from "@descope/react-sdk";
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
import { Link, useLocation } from "react-router-dom";

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const { isAuthenticated, isSessionLoading, sessionToken } = useSession();

  const { user, isLoading } = useUser();

  const { team, setTeam, setBoss, boss } = useTeam();
  const isUserAdmin = team?.name == "owner";
  const location = useLocation();
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
    if (!Array.isArray(expData)) return;
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

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const teamsOptions: DropdownOption<MyRole>[] =
    !isLoading && !myTeamsError && Array.isArray(myTeamsData)
      ? myTeamsData?.map((myRole) => {
          return {
            value: myRole,
            label: myRole.team.name,
          };
        })
      : [];

  return (
    <>
      <div className="flex h-100 min-h-full relative">
        <div
          className={`bg-white dark:bg-black border-gray-200 dark:border-neutral-900 border-r flex flex-col sticky top-0 transition-all duration-300 ${
            isSidebarExpanded ? "w-70 p-5" : "w-16 p-3"
          }`}
        >
          <div className="flex flex-col w-full items-start gap-5">
            <div
              className={`flex flex-row ${isSidebarExpanded ? "justify-between" : "justify-center"} w-full`}
            >
              {isSidebarExpanded && (
                <h1 className="dark:text-white text-2xl font-montserrat font-black text-black">
                  KRANKENPREP
                </h1>
              )}
              <div className="flex flex-col gap-2">
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
                <button
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
                  title={
                    isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  {isSidebarExpanded ? (
                    <ChevronLeft className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {user && !isLoading ? (
              <>
                <button
                  className={`p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 flex flex-row items-center gap-2 w-full ${!isSidebarExpanded && "justify-center"}`}
                >
                  <CircleUserRoundIcon className="w-6 h-6 text-teal-200" />
                  {isSidebarExpanded && (
                    <div className="text-lg">
                      <span className=" text-white ">
                        {user?.btag?.split("#")[0]}
                      </span>
                      <span className="text-gray-400">
                        {"#" + user?.btag?.split("#")[1]}
                      </span>
                    </div>
                  )}
                </button>
                {isSidebarExpanded &&
                  import.meta.env.VITE_IS_LOCAL &&
                  sessionToken && (
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
            {!isAuthenticated && !isSessionLoading ? (
              <div className="w-full">
                <Descope
                  flowId="sign-up-or-in"
                  theme={colorMode}
                  onError={(err: any) => {
                    console.log("Error!", err);
                    alert("Error: " + err.detail.message);
                  }}
                />
              </div>
            ) : null}
            {isSidebarExpanded && isAuthenticated && !isSessionLoading ? (
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
            ) : null}
            <div className="w-full flex-1">
              <div
                className={`flex flex-col gap-2 mb-3 ${isSidebarExpanded ? "p-2" : "p-0"}`}
              >
                <Link
                  to="/"
                  className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center ${isSidebarExpanded ? "justify-center" : "justify-center"} gap-2 group ${
                    location.pathname === "/"
                      ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                      : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                  } border`}
                  title="Home"
                >
                  <Target
                    className={`w-4 h-4 ${
                      location.pathname === "/"
                        ? "text-cyan-200"
                        : "text-cyan-300 group-hover:text-cyan-200"
                    }`}
                  />
                  {isSidebarExpanded && (
                    <span
                      className={`text-sm font-montserrat font-semibold ${
                        location.pathname === "/"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    >
                      Home
                    </span>
                  )}
                </Link>
                <Link
                  to="/prep"
                  className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center ${isSidebarExpanded ? "justify-center" : "justify-center"} gap-2 group ${
                    location.pathname === "/prep"
                      ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                      : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                  } border`}
                  title="Prep"
                >
                  <BookOpen
                    className={`w-4 h-4 ${
                      location.pathname === "/prep"
                        ? "text-cyan-200"
                        : "text-cyan-300 group-hover:text-cyan-200"
                    }`}
                  />
                  {isSidebarExpanded && (
                    <span
                      className={`text-sm font-montserrat font-semibold ${
                        location.pathname === "/prep"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    >
                      Prep
                    </span>
                  )}
                </Link>
                <Link
                  to="/plans"
                  className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center ${isSidebarExpanded ? "justify-center" : "justify-center"} gap-2 group ${
                    location.pathname === "/plan/midnight"
                      ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                      : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                  } border`}
                  title="Plan"
                >
                  <Calendar
                    className={`w-4 h-4 ${
                      location.pathname === "/plans"
                        ? "text-cyan-200"
                        : "text-cyan-300 group-hover:text-cyan-200"
                    }`}
                  />
                  {isSidebarExpanded && (
                    <span
                      className={`text-sm font-montserrat font-semibold ${
                        location.pathname === "/plans"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    >
                      Plan
                    </span>
                  )}
                </Link>
                {team && isUserAdmin ? (
                  <Link
                    to="/team"
                    className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center ${isSidebarExpanded ? "justify-center" : "justify-center"} gap-2 group ${
                      location.pathname === "/team"
                        ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                        : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                    } border`}
                    title="Plan"
                  >
                    <ShieldHalf
                      className={`w-4 h-4 ${
                        location.pathname === "/team"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    />
                    {isSidebarExpanded && (
                      <span
                        className={`text-sm font-montserrat font-semibold ${
                          location.pathname === "/team"
                            ? "text-cyan-200"
                            : "text-cyan-300 group-hover:text-cyan-200"
                        }`}
                      >
                        Team
                      </span>
                    )}
                  </Link>
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
