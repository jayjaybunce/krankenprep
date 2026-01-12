import type { FC } from "react";
import { useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGetInviteLinkWithToken, useMyTeams } from "../../api/queryHooks";
import { useRedeemInviteLink } from "../../api/mutationHooks";
import { Card } from "../Card";
import Button from "../Button";
import { Users, MapPin, AlertCircle, CheckCircle, Info } from "lucide-react";
import { SkeletonCard } from "../Skeleton";
import { TeamContext } from "../../context/TeamContext";

const RedeemInvite: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { data, isLoading, error } = useGetInviteLinkWithToken(token ?? "");
  const {
    mutate: redeemInvite,
    isPending,
    isSuccess,
    error: redeemError,
  } = useRedeemInviteLink();
  const { setTeam } = useContext(TeamContext);
  const { data: myTeams, refetch: refetchMyTeams } = useMyTeams();
  const [joinedTeamId, setJoinedTeamId] = useState<number | null>(null);

  const isUserAlreadyMemember =
    myTeams?.findIndex((x) => x.team_id == data?.team_id) != -1;

  const handleJoinTeam = () => {
    if (!token) return;

    redeemInvite(token, {
      onSuccess: async (response) => {
        setJoinedTeamId(response.team_id);
        // Refetch teams to get the updated list with the new team
        const result = await refetchMyTeams();
        // Find the newly joined team and set it as the selected team
        const joinedTeam = result.data?.find(
          (role) => role.team_id === response.team_id,
        );
        if (joinedTeam) {
          setTeam(joinedTeam);
        }
      },
    });
  };

  console.log(data);
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <SkeletonCard variant="elevated" showBadges={true} />
        </div>
      </div>
    );
  }

  // Error state - invalid or missing token
  if (!token || error || !data) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Card variant="danger" hover={false}>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-rose-500/20 rounded-full">
                <AlertCircle className="w-12 h-12 text-rose-400" />
              </div>
              <div className="space-y-2">
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Invalid Invite Link
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  This invite link is invalid, expired, or has been revoked.
                  Please request a new invite from your team leader.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state - user has joined the team
  if (isSuccess && joinedTeamId) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6">
          <Card variant="success" hover={false}>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Welcome to {data?.team?.name}!
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  You've successfully joined the team. You can now access team
                  resources and collaborate with your teammates.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={() => navigate("/team")}
              >
                Go to Team
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Already a member state
  if (isUserAlreadyMemember) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6">
          <Card variant="elevated" hover={false}>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Info className="w-12 h-12 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Already a Member
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  You're already a member of{" "}
                  <span className="font-semibold text-cyan-400">
                    {data?.team?.name}
                  </span>
                  . No need to join again!
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={() => navigate("/team")}
              >
                Go to Team
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state - show team info
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-montserrat text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            You've Been Invited!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join your team and start raiding together
          </p>
        </div>

        {/* Team Info Card */}
        <Card variant="elevated" hover={false}>
          <div className="flex flex-col gap-6">
            {/* Team Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Team Name
                  </p>
                  <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                    {data?.team?.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="space-y-3 pt-3 border-t border-slate-600 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Region
                  </p>
                  <p className="font-semibold dark:text-white text-black">
                    {data?.team?.region}
                  </p>
                </div>
              </div>

              {data?.team?.rio_url && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Raider.IO
                    </p>
                    <a
                      href={data?.team?.rio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold dark:text-cyan-400 text-cyan-600 hover:underline"
                    >
                      View Team Profile
                    </a>
                  </div>
                </div>
              )}

              {/* Invite Details */}
              <div className="pt-3 border-t border-slate-600 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span>Invited by {data?.created_by_user?.btag}</span>
                </div>
                {data?.max_uses > 0 && (
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>
                      {data?.uses} / {data?.max_uses} uses
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Join Button */}
            <div className="pt-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleJoinTeam}
              >
                Join Team
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RedeemInvite;
