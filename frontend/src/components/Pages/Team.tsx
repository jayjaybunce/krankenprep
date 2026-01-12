import { type FC, useState } from "react";
import { useGetTeamById } from "../../api/queryHooks";
import { useTeam, useTheme } from "../../hooks";
import {
  Users,
  Link as LinkIcon,
  Plus,
  Calendar,
  Hash,
  Ban,
  Trash2,
} from "lucide-react";
import Button from "../Button";
import { CreateInviteLinkModal } from "../modals/CreateInviteLinkModal";
import {
  useDeleteMemberFromTeam,
  useRevokeInviteLink,
} from "../../api/mutationHooks";
import { useNavigate } from "react-router-dom";

const Team: FC = () => {
  const navigator = useNavigate();
  const { team } = useTeam();
  const { colorMode } = useTheme();
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);

  const { data, isLoading, error } = useGetTeamById(team?.team_id ?? -1);
  const x = useDeleteMemberFromTeam(1, 1);
  const { mutate: revokeInviteLink, isPending: isRevoking } =
    useRevokeInviteLink(team?.team_id ?? -1);

  const handleRevokeInvite = (tokenHash: string) => {
    if (!team?.team_id) return;
    revokeInviteLink(tokenHash);
  };
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
                  data.roles.map((role, index) => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
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
                    const isActive = !isExpired && !isRevoked && !isMaxedOut;

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
                            {formatDate(link.created_at)}
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
