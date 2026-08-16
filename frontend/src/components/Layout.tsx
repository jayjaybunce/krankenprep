import type { FC, PropsWithChildren } from "react";
import {
  Sun,
  Moon,
  CircleUserRoundIcon,
  BookOpen,
  Calendar,
  ShieldHalf,
  Menu,
  X,
  Home,
  Gem,
} from "lucide-react";
import { useTeam, useTheme, useUser } from "../hooks";
import { Descope, useSession } from "@descope/react-sdk";
import { useEffect, useState } from "react";
import { DroptimizerUploadPopup } from "./DroptimizerUploadPopup";
import { useCurrentExpansion, useGetNews } from "../api/queryHooks";
import { preload } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { BossSelectionV2 } from "./BossSelection";
import Tooltip from "./Tooltip";

const LAST_SEEN_NEWS_KEY = "krankenprep_last_seen_news_at";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { colorMode, toggleColorMode } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { isAuthenticated, isSessionLoading } = useSession();
  // Shared between the mobile and desktop auth widgets below — they're the
  // exact same sign-in flow rendered twice for responsive layout, not two
  // independent ones, so one error message serves both.
  const [authError, setAuthError] = useState<string | null>(null);

  const { user, isLoading } = useUser();

  const { team } = useTeam();
  const location = useLocation();

  const { data: expData } = useCurrentExpansion();

  const { data: newsItems } = useGetNews();
  const latestNewsAt = newsItems?.[0]?.published_at;
  const [lastSeenNewsAt, setLastSeenNewsAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_SEEN_NEWS_KEY),
  );

  useEffect(() => {
    if (
      location.pathname === "/" &&
      latestNewsAt &&
      (!lastSeenNewsAt || new Date(latestNewsAt) > new Date(lastSeenNewsAt))
    ) {
      localStorage.setItem(LAST_SEEN_NEWS_KEY, latestNewsAt);
      setLastSeenNewsAt(latestNewsAt);
    }
  }, [location.pathname, latestNewsAt, lastSeenNewsAt]);

  const hasUnreadNews =
    !!latestNewsAt &&
    (!lastSeenNewsAt || new Date(latestNewsAt) > new Date(lastSeenNewsAt));

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

  useEffect(() => { setIsMobileDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Mobile top bar (hidden on lg+) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 bg-black border-b border-neutral-900">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="p-1.5 rounded-md hover:bg-neutral-800 transition"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-montserrat font-black text-base tracking-wide">
          KRANKENPREP
        </h1>
        <button
          onClick={() => toggleColorMode()}
          className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
        >
          {colorMode === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      {isMobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-black border-r border-neutral-900 flex flex-col p-5 gap-5 overflow-y-auto transition-transform duration-300 ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-white font-montserrat font-black text-xl">KRANKENPREP</h1>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User */}
        {user && !isLoading && (
          <Link
            to="/profile"
            className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 flex flex-row items-center gap-2 w-full"
          >
            <CircleUserRoundIcon className="w-6 h-6 text-teal-200" />
            <div className="text-lg">
              <span className="text-white">{user?.btag?.split("#")[0]}</span>
              <span className="text-gray-400">{"#" + user?.btag?.split("#")[1]}</span>
            </div>
          </Link>
        )}

        {/* Auth */}
        {!isAuthenticated && !isSessionLoading && (
          <div className="w-full">
            <Descope
              flowId="sign-up-or-in"
              theme={colorMode}
              onError={() =>
                setAuthError("We couldn't sign you in. Please try again.")
              }
            />
            {authError && (
              <p className="text-xs text-rose-400 font-montserrat mt-2">
                {authError}
              </p>
            )}
          </div>
        )}

        {/* Nav links */}
        <div className="flex flex-col gap-2">
          {(
            [
              { to: "/", icon: Home, label: "Home" },
              { to: "/plans", icon: Calendar, label: "Plan" },
              { to: "/prep", icon: BookOpen, label: "Prep" },
              ...(team ? [{ to: "/loot", icon: Gem, label: "Loot" }] : []),
              ...(team ? [{ to: "/team", icon: ShieldHalf, label: "Team" }] : []),
            ] as const
          ).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`w-full p-2 rounded-md bg-linear-to-r transition-all duration-200 flex items-center gap-2 border ${
                location.pathname === to
                  ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                  : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20"
              }`}
            >
              <span className="relative inline-flex">
                <Icon className={`w-4 h-4 ${location.pathname === to ? "text-cyan-200" : "text-cyan-300"}`} />
                {to === "/" && hasUnreadNews && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
                )}
              </span>
              <span className={`text-sm font-montserrat font-semibold ${location.pathname === to ? "text-cyan-200" : "text-cyan-300"}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex h-100 min-h-full relative">
        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <div className="hidden lg:flex bg-white dark:bg-black border-gray-200 dark:border-neutral-900 border-r flex-col sticky top-0 w-16 p-3">
          <div className="flex flex-col w-full items-start gap-5">
            <div className="flex flex-row justify-center w-full">
              <div className="flex flex-col gap-2">
                <Tooltip content={colorMode === "dark" ? "Light mode" : "Dark mode"} side="right">
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
                </Tooltip>
              </div>
            </div>

            {user && !isLoading ? (
              <Tooltip content="Profile" side="right">
                <Link
                  to="/profile"
                  className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 flex flex-row items-center justify-center gap-2 w-full"
                >
                  <CircleUserRoundIcon className="w-6 h-6 text-teal-200" />
                </Link>
              </Tooltip>
            ) : (
              <></>
            )}
            {!isAuthenticated && !isSessionLoading ? (
              <div className="w-full">
                <Descope
                  flowId="sign-up-or-in"
                  theme={colorMode}
                  onError={() =>
                    setAuthError("We couldn't sign you in. Please try again.")
                  }
                />
                {authError && (
                  <p className="text-[10px] text-rose-400 font-montserrat mt-2 text-center">
                    {authError}
                  </p>
                )}
              </div>
            ) : null}
            <div className="w-full flex-1">
              <div className="flex flex-col gap-2 mb-3 p-0">
                <Tooltip content="Home" side="right">
                  <Link
                    to="/"
                    className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2 group ${
                      location.pathname === "/"
                        ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                        : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                    } border`}
                  >
                    <span className="relative inline-flex">
                      <Home
                        className={`w-4 h-4 ${
                          location.pathname === "/"
                            ? "text-cyan-200"
                            : "text-cyan-300 group-hover:text-cyan-200"
                        }`}
                      />
                      {hasUnreadNews && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
                      )}
                    </span>
                  </Link>
                </Tooltip>
                <Tooltip content="Plan" side="right">
                  <Link
                    to="/plans"
                    className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2 group ${
                      location.pathname === "/plan/midnight"
                        ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                        : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                    } border`}
                  >
                    <Calendar
                      className={`w-4 h-4 ${
                        location.pathname === "/plans"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    />
                  </Link>
                </Tooltip>
                {team ? (
                  <Tooltip content="Team" side="right">
                    <Link
                      to="/team"
                      className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2 group ${
                        location.pathname === "/team"
                          ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                          : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                      } border`}
                    >
                      <ShieldHalf
                        className={`w-4 h-4 ${
                          location.pathname === "/team"
                            ? "text-cyan-200"
                            : "text-cyan-300 group-hover:text-cyan-200"
                        }`}
                      />
                    </Link>
                  </Tooltip>
                ) : (
                  <></>
                )}
                <Tooltip content="Prep" side="right">
                  <Link
                    to="/prep"
                    className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2 group ${
                      location.pathname === "/prep"
                        ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                        : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                    } border`}
                  >
                    <BookOpen
                      className={`w-4 h-4 ${
                        location.pathname === "/prep"
                          ? "text-cyan-200"
                          : "text-cyan-300 group-hover:text-cyan-200"
                      }`}
                    />
                  </Link>
                </Tooltip>
                {team ? (
                  <Tooltip content="Loot" side="right">
                    <Link
                      to="/loot"
                      className={`w-full p-2 rounded-md bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2 group ${
                        location.pathname === "/loot"
                          ? "from-cyan-900/80 to-blue-900/80 border-cyan-400/60 scale-[1.02] shadow-lg shadow-cyan-500/20"
                          : "from-cyan-900/60 to-blue-900/60 border-cyan-500/20 hover:border-cyan-400/40 hover:from-cyan-800/60 hover:to-blue-800/60"
                      } border`}
                    >
                      <Gem
                        className={`w-4 h-4 ${
                          location.pathname === "/loot"
                            ? "text-cyan-200"
                            : "text-cyan-300 group-hover:text-cyan-200"
                        }`}
                      />
                    </Link>
                  </Tooltip>
                ) : (
                  <></>
                )}
                <BossSelectionV2 />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-neutral-950 bg-neutral-50 w-full pt-12 lg:pt-0">
          {children}
        </div>
      </div>
      {team && <DroptimizerUploadPopup />}
    </>
  );
};

export default Layout;
