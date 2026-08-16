import { type FC, useState, useEffect, useRef } from "react";
import { useGetTeamById, type Wishlist } from "../../api/queryHooks";
import { useTeam, useTheme, useDocumentTitle, useKpApi } from "../../hooks";
import { Dropdown } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import Alert from "../Alert";
import {
  IntegrationCredentialsFields,
  type IntegrationTestStatus,
} from "../integrations/IntegrationCredentialsFields";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Link as LinkIcon,
  Plus,
  Calendar,
  Hash,
  Ban,
  Trash2,
  RefreshCw,
  Zap,
  Save,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import Button from "../Button";
import { CreateInviteLinkModal } from "../modals/CreateInviteLinkModal";
import { RosterTab } from "../Roster/RosterTab";
import { TeamSetupChecklist } from "../Team/TeamSetupChecklist";
import {
  useRevokeInviteLink,
  useSyncWowAuditWishlists,
  useUpdateTeam,
  useDeleteMemberFromTeam,
  useUpdateMemberRole,
} from "../../api/mutationHooks";
import { useNavigate, useParams } from "react-router-dom";

const AVAILABLE_TRACK_UPGRAGES = 6;

const WOWUTILS_GROUP_ID_REGEX = /^[0-9a-f]{24}$/i;

const WishlistCard: FC<{ wishlist: Wishlist; colorMode: string }> = ({
  wishlist,
  colorMode,
}) => {
  const dark = colorMode === "dark";
  const flags = [
    { label: "Gems", title: "Sockets", active: wishlist.sockets },
    { label: "PI", title: "Power Infusion", active: wishlist.pi },
    { label: "Expert", title: "Expert Mode", active: wishlist.expert_mode },
    {
      label: "Match Equipped Gear",
      title: "Upgrade All Equipped Gear to the Same Level",
      active: wishlist.match_equipped_gear,
    },
  ];

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        dark
          ? "bg-slate-800/60 border-slate-700"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-semibold leading-tight ${dark ? "text-white" : "text-slate-900"}`}
        >
          {wishlist.name}
        </span>
      </div>

      <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
        {wishlist.fight_style} &middot; {wishlist.fight_duration}m &middot;{" "}
        {wishlist.number_of_bosses} boss
        {wishlist.number_of_bosses !== 1 ? "es" : ""}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {[
          { label: "Myth", title: "Mythic track", value: wishlist.upgrade_level_mythic },
          { label: "Hero", title: "Heroic track", value: wishlist.upgrade_level_heroic },
          { label: "Norm", title: "Normal track", value: wishlist.upgrade_level_normal },
        ].map(({ label, title, value }) => (
          <div
            key={label}
            title={title}
            className={`rounded px-1.5 py-1 text-center ${
              dark ? "bg-slate-700/70" : "bg-slate-200/70"
            }`}
          >
            <div
              className={`text-[10px] leading-none ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {label}
            </div>
            <div
              className={`text-xs font-semibold mt-0.5 ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
              {value + 1}/{AVAILABLE_TRACK_UPGRAGES}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {flags.map(({ label, title, active }) => (
          <span
            key={label}
            title={title}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              active
                ? dark
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-cyan-100 text-cyan-700"
                : dark
                  ? "bg-slate-700/50 text-slate-500"
                  : "bg-slate-200/50 text-slate-400"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Team: FC = () => {
  const navigator = useNavigate();
  const { "*": tabSlug } = useParams();
  const activeTab = tabSlug || "members";
  const { team } = useTeam();
  useDocumentTitle("Team", team?.team?.name);
  const { colorMode } = useTheme();
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
  // Shared banner for this page's various admin actions (revoke invite,
  // sync, save settings, change a role, remove a member) — none of these
  // had any failure feedback before; a failed request just silently
  // reverted its button with no indication anything went wrong.
  const [actionError, setActionError] = useState<string | null>(null);
  const onActionError = (fallback: string) => (err: unknown) =>
    setActionError(err instanceof Error ? err.message : fallback);

  const { data, isLoading, error, refetch } = useGetTeamById(team?.team_id ?? -1);
  const { mutate: revokeInviteLink, isPending: isRevoking } =
    useRevokeInviteLink(team?.team_id ?? -1);
  const { mutate: syncWishlists, isPending: isSyncing } =
    useSyncWowAuditWishlists(team?.team_id ?? -1);
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam(
    team?.team_id ?? -1,
  );
  const { mutate: deleteMember } = useDeleteMemberFromTeam(team?.team_id ?? -1);
  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(team?.team_id ?? -1);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  // Covers the read-only fallback below (non-admin viewers, and the Owner's
  // own row, which is never editable) — ROLE_OPTIONS alone isn't enough
  // since Owner is deliberately not an assignable option.
  const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    loot_council: "Loot Council",
  };

  const ROLE_OPTIONS: DropdownOption[] = [
    {
      label: "Member",
      value: "member",
      description:
        "Can view the team, claim their character, and manage their own loot wishlist and priorities.",
    },
    {
      label: "Admin",
      value: "admin",
      description:
        "Everything a Member can do, plus manage team settings, integrations, invites, and member roles.",
    },
    {
      label: "Loot Council",
      value: "loot_council",
      description:
        "Everything a Member can do, plus see every player's loot wishlist and priorities, the team-wide roll overview, and the audit log.",
    },
  ];

  // WowAudit integration settings state
  const [wowAuditEnabled, setWowAuditEnabled] = useState(false);
  const [wowAuditGuildUrl, setWowAuditGuildUrl] = useState("");
  const [wowAuditApiKey, setWowAuditApiKey] = useState("");
  const [wowAuditTestStatus, setWowAuditTestStatus] =
    useState<IntegrationTestStatus>("idle");
  const initialized = useRef(false);
  const { url: wowAuditTestUrl, headers: wowAuditTestHeaders } = useKpApi(
    "/teams/wowaudit/test",
  );

  // WowUtils integration settings state
  const [wowUtilsEnabled, setWowUtilsEnabled] = useState(false);
  const [wowUtilsGroupId, setWowUtilsGroupId] = useState("");
  const [wowUtilsApiKey, setWowUtilsApiKey] = useState("");
  const [wowUtilsTestStatus, setWowUtilsTestStatus] =
    useState<IntegrationTestStatus>("idle");
  const [wowUtilsTestMessage, setWowUtilsTestMessage] = useState("");
  const { url: wowUtilsTestUrl, headers: wowUtilsTestHeaders } = useKpApi(
    "/teams/wowutils/test",
  );

  useEffect(() => {
    if (data && !initialized.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWowAuditEnabled(data.wowaudit_integration);
      setWowAuditGuildUrl(data.wowaudit_url ?? "");
      setWowAuditApiKey(data.wowaudit_api_key ?? "");
      setWowUtilsEnabled(data.wowutils_integration);
      setWowUtilsGroupId(data.wowutils_group_id ?? "");
      // No wowutils_api_key equivalent here — the real key is never sent
      // back down (see Team.WowUtilsApiKey on the backend), so this stays
      // blank until the admin retypes a new one.
      initialized.current = true;
    }
  }, [data]);

  const handleRevokeInvite = (tokenHash: string) => {
    if (!team?.team_id) return;
    revokeInviteLink(tokenHash, {
      onError: onActionError("Couldn't revoke that invite link — try again."),
    });
  };

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol !== "" && u.host !== "";
    } catch {
      return false;
    }
  };

  const handleWowAuditTest = async () => {
    setWowAuditTestStatus("loading");
    try {
      const res = await fetch(wowAuditTestUrl, {
        method: "POST",
        headers: wowAuditTestHeaders,
        body: JSON.stringify({ api_key: wowAuditApiKey }),
      });
      if (!res.ok) {
        setWowAuditTestStatus("error");
        return;
      }
      const resData = await res.json();
      const teamName = resData.url?.split("/").pop();
      const stripTeam = (url: string) =>
        url
          .replace(teamName ? new RegExp(`\\/${teamName}$`) : /\/main$/, "")
          .replace(/\/$/, "");
      const responseUrlBase = resData.url ? stripTeam(resData.url) : undefined;
      const enteredUrlBase = stripTeam(wowAuditGuildUrl);
      if (responseUrlBase && responseUrlBase === enteredUrlBase) {
        setWowAuditTestStatus("success");
      } else {
        setWowAuditTestStatus("error");
      }
    } catch {
      setWowAuditTestStatus("error");
    }
  };

  const handleWowUtilsTest = async () => {
    setWowUtilsTestStatus("loading");
    setWowUtilsTestMessage("");
    try {
      const res = await fetch(wowUtilsTestUrl, {
        method: "POST",
        headers: wowUtilsTestHeaders,
        body: JSON.stringify({
          group_id: wowUtilsGroupId,
          api_key: wowUtilsApiKey,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setWowUtilsTestStatus("error");
        setWowUtilsTestMessage(
          resData.error ?? "Could not verify — check your Group ID and API key.",
        );
        return;
      }
      setWowUtilsTestStatus("success");
      setWowUtilsTestMessage(
        `Connected to ${resData.name} (${resData.member_count} members)`,
      );
    } catch {
      setWowUtilsTestStatus("error");
      setWowUtilsTestMessage("Failed to reach WowUtils.");
    }
  };

  // UpdateTeam overwrites every integration field in one request (it's not
  // a partial patch), so each "Save" below echoes back the other
  // integration's last-saved values instead of its own live form state —
  // saving WowAudit settings can't accidentally persist an in-progress,
  // untested edit sitting in the WowUtils form (and vice versa). Blank API
  // key fields are safe either way since the backend keeps the existing key
  // when one isn't sent.
  const handleSaveWowAudit = () => {
    updateTeam(
      {
        wowaudit_integration: wowAuditEnabled,
        wowaudit_url: wowAuditGuildUrl,
        wowaudit_api_key: wowAuditApiKey,
        wowutils_integration: data?.wowutils_integration ?? false,
        wowutils_group_id: data?.wowutils_group_id ?? "",
        wowutils_api_key: "",
      },
      { onError: onActionError("Couldn't save WowAudit settings — try again.") },
    );
  };

  const handleSaveWowUtils = () => {
    updateTeam(
      {
        wowaudit_integration: data?.wowaudit_integration ?? false,
        wowaudit_url: data?.wowaudit_url ?? "",
        wowaudit_api_key: "",
        wowutils_integration: wowUtilsEnabled,
        wowutils_group_id: wowUtilsGroupId,
        wowutils_api_key: wowUtilsApiKey,
      },
      { onError: onActionError("Couldn't save WowUtils settings — try again.") },
    );
  };

  const credentialsUnchanged =
    wowAuditGuildUrl === (data?.wowaudit_url ?? "") &&
    wowAuditApiKey === (data?.wowaudit_api_key ?? "");
  const wowAuditGuildUrlValid = isValidUrl(wowAuditGuildUrl);
  const wowAuditBothFilled =
    wowAuditGuildUrlValid && wowAuditApiKey.trim() !== "";
  const canSaveWowAudit =
    !wowAuditEnabled ||
    (wowAuditBothFilled &&
      (wowAuditTestStatus === "success" ||
        (credentialsUnchanged && data?.wowaudit_integration)));

  const wowUtilsGroupIdValid = WOWUTILS_GROUP_ID_REGEX.test(wowUtilsGroupId);
  // "Nothing changed" for WowUtils means the Group ID matches what's saved
  // and no new key was typed — we can't compare against the old key itself
  // since the backend never sends it back (see Team.WowUtilsApiKey).
  const wowUtilsCredentialsUnchanged =
    wowUtilsGroupId === (data?.wowutils_group_id ?? "") &&
    wowUtilsApiKey.trim() === "";
  const wowUtilsFieldsFilled =
    wowUtilsGroupIdValid && wowUtilsApiKey.trim() !== "";
  const canSaveWowUtils =
    !wowUtilsEnabled ||
    (wowUtilsGroupIdValid &&
      (wowUtilsTestStatus === "success" ||
        (wowUtilsCredentialsUnchanged &&
          data?.wowutils_integration &&
          data?.wowutils_api_key_set)));

  const isUserAdmin = ["owner", "admin"].includes(team?.name ?? "");
  // team?.name here is the current user's role on this team (see MyRole) —
  // any resolved role means they're a member, even if it's just "member".
  const isUserTeamMember = !!team?.name;

  useEffect(() => {
    if (!isUserTeamMember) {
      navigator("/");
      return;
    }
    // Only the Settings tab (WowAudit integration, invite links, member
    // role management) is admin-only — Members and Roster (so any member
    // can claim their player) are open to the whole team.
    if (activeTab === "settings" && !isUserAdmin) {
      navigator("/team/roster", { replace: true });
    }
  }, [isUserTeamMember, isUserAdmin, activeTab, navigator]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className={`text-lg ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}`}
        >
          Loading team data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 p-8">
        <div className="max-w-md w-full flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-rose-500/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2
              className={`font-montserrat text-2xl font-bold ${colorMode === "dark" ? "text-white" : "text-black"}`}
            >
              Couldn't Load This Team
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Something went wrong fetching this team's data.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div>
          <h1
            className={`text-3xl font-bold font-montserrat mb-2 ${
              colorMode === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {data.name}
          </h1>
          <p
            className={`text-sm ${
              colorMode === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {data.server} - {data.region.toUpperCase()}
          </p>
        </div>

        {/* Tab bar */}
        <div
          className={`flex gap-1 border-b ${colorMode === "dark" ? "border-slate-800" : "border-slate-200"}`}
        >
          {(["members", "settings", "roster"] as const)
            .filter((tab) => tab !== "settings" || isUserAdmin)
            .map((tab) => (
            <button
              key={tab}
              onClick={() => navigator(`/team/${tab}`, { replace: true })}
              className={`px-4 py-2 text-sm font-medium font-montserrat capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-cyan-500 text-cyan-500"
                  : colorMode === "dark"
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {actionError && (
          <Alert type="danger" title="Something went wrong">
            {actionError}
          </Alert>
        )}

        {/* Settings tab — WowAudit Integration */}
        {activeTab === "settings" && isUserAdmin && (
          <div
            className={`rounded-xl border ${
              colorMode === "dark"
                ? "bg-slate-900/50 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2 items-center">
                    <Zap className="w-5 h-5 text-cyan-500" />
                    <h2
                      className={`text-xl font-semibold font-montserrat ${
                        colorMode === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      WowAudit Integration
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        data.wowaudit_integration
                          ? colorMode === "dark"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-100 text-emerald-700"
                          : colorMode === "dark"
                            ? "bg-slate-700 text-slate-400"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {data.wowaudit_integration ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 max-w-lg">
                    Syncs your guild's WowAudit wishlist configs (sim
                    settings) and lets the team upload validated droptimizer
                    sims against them.
                  </p>
                  <span className="text-sm text-black dark:text-slate-400">
                    Last Sync:{" "}
                    <span className="text-cyan-400">
                      {data.wowaudit_data_synced_at
                        ? formatDistanceToNow(data.wowaudit_data_synced_at) +
                          " ago"
                        : "Never"}
                    </span>
                  </span>
                </div>
              </div>
              {data.wowaudit_integration && (
                <div className="flex flex-row">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      syncWishlists(undefined, {
                        onError: onActionError("Couldn't sync WowAudit wishlists — try again."),
                      })
                    }
                    disabled={isSyncing}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync"}
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-3">
              {data.wowaudit_integration && (
                <div
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ${
                    colorMode === "dark"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-amber-50 border-amber-300 text-amber-700"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Raidbots and WowAudit are not yet updated for Midnight.
                    Syncing wishlist configs works, but Droptimizer uploads are
                    temporarily unavailable. This will be re-enabled once both
                    services support the new expansion.
                  </span>
                </div>
              )}
              {!data.wowaudit_integration ? (
                <p
                  className={`text-sm ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  WowAudit integration is disabled for this team.
                </p>
              ) : !data.wishlist_configs ||
                data.wishlist_configs.length === 0 ? (
                <p
                  className={`text-sm ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  No wishlist configs synced yet. Click Sync to pull from
                  WowAudit.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.wishlist_configs.map((wishlist) => (
                    <WishlistCard
                      key={wishlist.id}
                      wishlist={wishlist}
                      colorMode={colorMode}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* WowAudit Settings */}
            <div
              className={`p-4 border-t flex flex-col gap-4 ${
                colorMode === "dark" ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <h3
                className={`text-sm font-semibold font-montserrat ${
                  colorMode === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Integration Settings
              </h3>
              <IntegrationCredentialsFields
                enableLabel="Enable WowAudit integration"
                enabled={wowAuditEnabled}
                onToggleEnabled={(checked) => {
                  setWowAuditEnabled(checked);
                  setWowAuditTestStatus("idle");
                }}
                fields={[
                  {
                    key: "guild_url",
                    label: "WowAudit Guild URL",
                    placeholder: "https://wowaudit.com/us/area-52/your-guild",
                    value: wowAuditGuildUrl,
                    onChange: (value) => {
                      setWowAuditGuildUrl(value);
                      setWowAuditTestStatus("idle");
                    },
                  },
                  {
                    key: "api_key",
                    label: "WowAudit API Key",
                    placeholder: "Your WowAudit API key",
                    type: "password",
                    value: wowAuditApiKey,
                    onChange: (value) => {
                      setWowAuditApiKey(value);
                      setWowAuditTestStatus("idle");
                    },
                  },
                ]}
                fieldsFilled={wowAuditBothFilled}
                testStatus={wowAuditTestStatus}
                onTest={handleWowAuditTest}
                testErrorMessage="Could not verify — check the URL and API key."
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveWowAudit}
                  disabled={!canSaveWowAudit || isUpdating}
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings tab — WowUtils Integration */}
        {activeTab === "settings" && isUserAdmin && (
          <div
            className={`rounded-xl border ${
              colorMode === "dark"
                ? "bg-slate-900/50 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" />
                <h2
                  className={`text-xl font-semibold font-montserrat ${
                    colorMode === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  WowUtils Integration
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    data.wowutils_integration
                      ? colorMode === "dark"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-emerald-100 text-emerald-700"
                      : colorMode === "dark"
                        ? "bg-slate-700 text-slate-400"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {data.wowutils_integration ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-lg">
                Lets the team upload droptimizer sims straight to your
                WowUtils group — no wishlist config to sync first.
              </p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <h3
                className={`text-sm font-semibold font-montserrat ${
                  colorMode === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Integration Settings
              </h3>
              <IntegrationCredentialsFields
                enableLabel="Enable WowUtils integration"
                enabled={wowUtilsEnabled}
                onToggleEnabled={(checked) => {
                  setWowUtilsEnabled(checked);
                  setWowUtilsTestStatus("idle");
                }}
                fields={[
                  {
                    key: "group_id",
                    label: "WowUtils Group ID",
                    placeholder: "Your WowUtils Group ID",
                    value: wowUtilsGroupId,
                    onChange: (value) => {
                      setWowUtilsGroupId(value.trim().toLowerCase());
                      setWowUtilsTestStatus("idle");
                    },
                  },
                  {
                    key: "api_key",
                    label: data?.wowutils_api_key_set
                      ? "WowUtils API Key (configured — leave blank to keep it)"
                      : "WowUtils API Key",
                    placeholder: "Your WowUtils API key",
                    type: "password",
                    value: wowUtilsApiKey,
                    onChange: (value) => {
                      setWowUtilsApiKey(value);
                      setWowUtilsTestStatus("idle");
                    },
                  },
                ]}
                fieldsFilled={wowUtilsFieldsFilled}
                testStatus={wowUtilsTestStatus}
                onTest={handleWowUtilsTest}
                testSuccessMessage={wowUtilsTestMessage}
                testErrorMessage={
                  wowUtilsTestMessage ||
                  "Could not verify — check your Group ID and API key."
                }
              />
              {wowUtilsEnabled &&
                !wowUtilsFieldsFilled &&
                data?.wowutils_api_key_set &&
                wowUtilsGroupIdValid && (
                  <p
                    className={`text-xs font-montserrat ${
                      colorMode === "dark"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    A key is already saved for this team — retype it above
                    only if you want to change it.
                  </p>
                )}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveWowUtils}
                  disabled={!canSaveWowUtils || isUpdating}
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <>
            {isUserAdmin && (
              <TeamSetupChecklist
                team={data}
                onCreateInviteLink={() => setIsInviteLinkModalOpen(true)}
                onGoToRoster={() => navigator("/team/roster")}
                onGoToSettings={() => navigator("/team/settings")}
              />
            )}

            {/* Team Members */}
            <div
              className={`rounded-xl border ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  <h2
                    className={`text-xl font-semibold font-montserrat ${
                      colorMode === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Team Members
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${
                        colorMode === "dark"
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Role
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        BattleTag
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Name
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.roles && data.roles.length > 0 ? (
                      data.roles.map((role) => (
                        <tr
                          key={role.id}
                          className={`border-b ${
                            colorMode === "dark"
                              ? "border-slate-800 hover:bg-slate-800/50"
                              : "border-slate-200 hover:bg-slate-50"
                          } transition-colors`}
                        >
                          <td
                            className={`px-6 py-4 text-sm font-medium ${
                              colorMode === "dark"
                                ? "text-cyan-400"
                                : "text-cyan-600"
                            }`}
                          >
                            {isUserAdmin && role.name !== "owner" ? (
                              <Dropdown
                                size="sm"
                                variant="minimal"
                                value={role.name}
                                disabled={isUpdatingRole}
                                onChange={(value) => {
                                  const name = Array.isArray(value)
                                    ? value[0]
                                    : value;
                                  if (!name) return;
                                  updateMemberRole(
                                    {
                                      roleId: role.id,
                                      name: name as "member" | "admin" | "loot_council",
                                    },
                                    { onError: onActionError("Couldn't update that member's role — try again.") },
                                  );
                                }}
                                options={ROLE_OPTIONS}
                              />
                            ) : (
                              ROLE_LABELS[role.name] ?? role.name
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              colorMode === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {role.user?.btag || "N/A"}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              colorMode === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {role.user?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {role.user_id !== team?.user_id && (
                              <Button
                                variant="danger"
                                size="xs"
                                disabled={deletingRoleId === role.id}
                                onClick={() => {
                                  setDeletingRoleId(role.id);
                                  deleteMember(role.id, {
                                    onSettled: () => setDeletingRoleId(null),
                                    onError: onActionError("Couldn't remove that member — try again."),
                                  });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                                {deletingRoleId === role.id
                                  ? "Removing..."
                                  : "Remove"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className={`px-6 py-8 text-center text-sm ${
                            colorMode === "dark"
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          No team members yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invite Links */}
            <div
              className={`rounded-xl border ${
                colorMode === "dark"
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-cyan-500" />
                  <h2
                    className={`text-xl font-semibold font-montserrat ${
                      colorMode === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Invite Links
                  </h2>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsInviteLinkModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Link
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${
                        colorMode === "dark"
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Expires
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Uses
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                          colorMode === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invite_links && data.invite_links.length > 0 ? (
                      data.invite_links.map((link) => {
                        const isExpired =
                          new Date(link.expires_at) < new Date();
                        const isRevoked = !!link.revoked_at;
                        const isMaxedOut =
                          link.max_uses > 0 && link.uses >= link.max_uses;

                        return (
                          <tr
                            key={link.id}
                            className={`border-b ${
                              colorMode === "dark"
                                ? "border-slate-800 hover:bg-slate-800/50"
                                : "border-slate-200 hover:bg-slate-50"
                            } transition-colors`}
                          >
                            <td
                              className={`px-6 py-4 text-sm ${
                                colorMode === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {formatDate(link.expires_at)}
                              </div>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${
                                colorMode === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-slate-500" />
                                {link.uses} /{" "}
                                {link.max_uses === -1 ? "∞" : link.max_uses}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isRevoked ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    colorMode === "dark"
                                      ? "bg-rose-500/20 text-rose-400"
                                      : "bg-rose-100 text-rose-600"
                                  }`}
                                >
                                  <Ban className="w-3 h-3" />
                                  Revoked {formatDate(link.revoked_at)}
                                </span>
                              ) : isExpired ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    colorMode === "dark"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  Expired
                                </span>
                              ) : isMaxedOut ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    colorMode === "dark"
                                      ? "bg-slate-500/20 text-slate-400"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  Max Uses Reached
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    colorMode === "dark"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-emerald-100 text-emerald-600"
                                  }`}
                                >
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!isRevoked && (
                                <Button
                                  variant="danger"
                                  size="xs"
                                  onClick={() =>
                                    handleRevokeInvite(link.token_hash)
                                  }
                                  disabled={isRevoking}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Revoke
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-6 py-8 text-center text-sm ${
                            colorMode === "dark"
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          No invite links created yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "roster" && (
          <RosterTab
            team={data}
            teamId={team?.team_id ?? -1}
            roles={data.roles}
            isAdmin={isUserAdmin}
          />
        )}
      </div>

      <CreateInviteLinkModal
        isOpen={isInviteLinkModalOpen}
        onClose={setIsInviteLinkModalOpen}
        teamId={team?.team_id ?? -1}
      />
    </>
  );
};

export default Team;
