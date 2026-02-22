import { type FC, useState, useEffect, useRef } from "react";
import { useGetTeamById, type Wishlist } from "../../api/queryHooks";
import { useTeam, useTheme, useDocumentTitle, useKpApi } from "../../hooks";
import { TextInput, Toggle } from "../form";
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
  FlaskConical,
  CheckCircle,
  LoaderCircle,
  Save,
} from "lucide-react";
import Button from "../Button";
import { CreateInviteLinkModal } from "../modals/CreateInviteLinkModal";
import {
  useRevokeInviteLink,
  useSyncWowAuditWishlists,
  useUpdateTeam,
  useDeleteMemberFromTeam,
} from "../../api/mutationHooks";
import { useNavigate, useParams } from "react-router-dom";

const AVAILABLE_TRACK_UPGRAGES = 6;

type WowAuditTestStatus = "idle" | "loading" | "success" | "error";

const WishlistCard: FC<{ wishlist: Wishlist; colorMode: string }> = ({
  wishlist,
  colorMode,
}) => {
  const dark = colorMode === "dark";
  const flags = [
    { label: "Gems", active: wishlist.sockets },
    { label: "PI", active: wishlist.pi },
    { label: "Expert", active: wishlist.expert_mode },
    {
      label: "Upgrade All Equipped Gear to the Same Level",
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
          { label: "Myth", value: wishlist.upgrade_level_mythic },
          { label: "Hero", value: wishlist.upgrade_level_heroic },
          { label: "Norm", value: wishlist.upgrade_level_normal },
        ].map(({ label, value }) => (
          <div
            key={label}
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
        {flags.map(({ label, active }) => (
          <span
            key={label}
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

  const { data, isLoading, error } = useGetTeamById(team?.team_id ?? -1);
  const { mutate: revokeInviteLink, isPending: isRevoking } =
    useRevokeInviteLink(team?.team_id ?? -1);
  const { mutate: syncWishlists, isPending: isSyncing } =
    useSyncWowAuditWishlists(team?.team_id ?? -1);
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam(
    team?.team_id ?? -1,
  );
  const { mutate: deleteMember } = useDeleteMemberFromTeam(
    team?.team_id ?? -1,
  );
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  // WowAudit integration settings state
  const [wowAuditEnabled, setWowAuditEnabled] = useState(false);
  const [wowAuditGuildUrl, setWowAuditGuildUrl] = useState("");
  const [wowAuditApiKey, setWowAuditApiKey] = useState("");
  const [wowAuditTestStatus, setWowAuditTestStatus] =
    useState<WowAuditTestStatus>("idle");
  const initialized = useRef(false);
  const { url: wowAuditTestUrl, headers: wowAuditTestHeaders } = useKpApi(
    "/teams/wowaudit/test",
  );

  useEffect(() => {
    if (data && !initialized.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWowAuditEnabled(data.wowaudit_integration);
      setWowAuditGuildUrl(data.wowaudit_url ?? "");
      setWowAuditApiKey(data.wowaudit_api_key ?? "");
      initialized.current = true;
    }
  }, [data]);

  const handleRevokeInvite = (tokenHash: string) => {
    if (!team?.team_id) return;
    revokeInviteLink(tokenHash);
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
      const responseUrlBase = resData.url
        ?.replace(/\/main$/, "")
        .replace(/\/$/, "");
      const enteredUrlBase = wowAuditGuildUrl
        .replace(/\/main$/, "")
        .replace(/\/$/, "");
      if (responseUrlBase && responseUrlBase === enteredUrlBase) {
        setWowAuditTestStatus("success");
      } else {
        setWowAuditTestStatus("error");
      }
    } catch {
      setWowAuditTestStatus("error");
    }
  };

  const handleUpdateTeam = () => {
    updateTeam({
      wowaudit_integration: wowAuditEnabled,
      wowaudit_url: wowAuditGuildUrl,
      wowaudit_api_key: wowAuditApiKey,
    });
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

  const isUserAdmin = team?.name == "owner";
  if (!isUserAdmin) {
    navigator("/");
  }

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
      <div className="flex items-center justify-center h-64">
        <div
          className={`text-lg ${colorMode === "dark" ? "text-rose-400" : "text-rose-600"}`}
        >
          Error loading team data
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
          {(["members", "settings"] as const).map((tab) => (
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

        {/* Settings tab — WowAudit Integration */}
        {activeTab === "settings" && (
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
                  onClick={() => syncWishlists()}
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
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>
                  Raidbots and WoWAudit are not yet updated for Midnight.
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
            ) : !data.wishlist_configs || data.wishlist_configs.length === 0 ? (
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
            <Toggle
              variant="default"
              label="Enable WowAudit integration"
              checked={wowAuditEnabled}
              onChange={(e) => {
                setWowAuditEnabled(e.target.checked);
                setWowAuditTestStatus("idle");
              }}
            />
            {wowAuditEnabled && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4">
                  <TextInput
                    value={wowAuditGuildUrl}
                    variant="minimal"
                    className="font-montserrat"
                    label="WowAudit Guild URL"
                    placeholder="https://wowaudit.com/us/area-52/your-guild"
                    disabled={wowAuditTestStatus === "success"}
                    onChange={(e) => {
                      setWowAuditGuildUrl(e.target.value);
                      setWowAuditTestStatus("idle");
                    }}
                  />
                  <TextInput
                    value={wowAuditApiKey}
                    variant="minimal"
                    className="font-montserrat"
                    label="WowAudit API Key"
                    placeholder="Your WowAudit API key"
                    type="password"
                    disabled={wowAuditTestStatus === "success"}
                    onChange={(e) => {
                      setWowAuditApiKey(e.target.value);
                      setWowAuditTestStatus("idle");
                    }}
                  />
                </div>
                {wowAuditBothFilled && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleWowAuditTest}
                      disabled={
                        wowAuditTestStatus === "loading" ||
                        wowAuditTestStatus === "success"
                      }
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-medium font-montserrat text-sm
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          wowAuditTestStatus === "success"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : wowAuditTestStatus === "error"
                              ? "bg-rose-600 text-white hover:bg-rose-500"
                              : colorMode === "dark"
                                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }
                      `}
                    >
                      {wowAuditTestStatus === "loading" ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : wowAuditTestStatus === "success" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <FlaskConical className="w-4 h-4" />
                      )}
                      {wowAuditTestStatus === "success"
                        ? "Verified"
                        : wowAuditTestStatus === "error"
                          ? "Retry"
                          : "Test"}
                    </button>
                    {wowAuditTestStatus === "error" && (
                      <span
                        className={`text-xs font-montserrat ${
                          colorMode === "dark"
                            ? "text-rose-400"
                            : "text-rose-600"
                        }`}
                      >
                        Could not verify — check the URL and API key.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateTeam}
                disabled={!canSaveWowAudit || isUpdating}
              >
                <Save className="w-4 h-4" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
        )}

        {activeTab === "members" && (<>
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
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Role
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    BattleTag
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Name
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
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
                        {role.name}
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
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Created
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Expires
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Uses
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                      colorMode === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.invite_links && data.invite_links.length > 0 ? (
                  data.invite_links.map((link) => {
                    const isExpired = new Date(link.expires_at) < new Date();
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
        </>)}
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
