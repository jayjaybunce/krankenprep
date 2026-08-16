import type { FC } from "react";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useTheme } from "../../hooks";
import type { Team } from "../../api/queryHooks";
import Button from "../Button";

type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  complete: boolean;
  optional?: boolean;
  actionLabel: string;
  onAction: () => void;
};

type TeamSetupChecklistProps = {
  team: Team;
  onCreateInviteLink: () => void;
  onGoToRoster: () => void;
  onGoToSettings: () => void;
};

// Real-progress setup checklist for team owners/admins — each item reflects
// actual team state (has an invite gone out, does the roster have players,
// has anyone claimed one) rather than a dismissible "seen it" flag, so it
// naturally disappears once the team is actually set up instead of nagging
// forever or vanishing the moment someone clicks it away. Only rendered for
// admins/owners since every action here is admin-gated anyway.
export const TeamSetupChecklist: FC<TeamSetupChecklistProps> = ({
  team,
  onCreateInviteLink,
  onGoToRoster,
  onGoToSettings,
}) => {
  const { colorMode } = useTheme();

  const players = team.players ?? [];
  const hasTeammates = (team.roles?.length ?? 0) > 1;
  const hasRoster = players.length > 0;
  const hasClaimedCharacter = players.some((p) => !!p.user);
  const hasIntegration = team.wowaudit_integration || team.wowutils_integration;

  const items: ChecklistItem[] = [
    {
      key: "invite",
      label: "Invite your teammates",
      description: "Send an invite link so the rest of your raid team can join.",
      complete: hasTeammates,
      actionLabel: "Create Link",
      onAction: onCreateInviteLink,
    },
    {
      key: "roster",
      label: "Build your roster",
      description: "Add players so the team knows who's raiding.",
      complete: hasRoster,
      actionLabel: "Go to Roster",
      onAction: onGoToRoster,
    },
    {
      key: "claim",
      label: "Get characters claimed",
      description: "Each player should claim their own roster entry to manage their own loot wishlist.",
      complete: hasClaimedCharacter,
      actionLabel: "Go to Roster",
      onAction: onGoToRoster,
    },
    {
      key: "integration",
      label: "Connect WowAudit or WowUtils",
      description: "Optional — lets your team upload droptimizer sims straight from Raidbots/QE Live.",
      complete: !!hasIntegration,
      optional: true,
      actionLabel: "Go to Settings",
      onAction: onGoToSettings,
    },
  ];

  const requiredItems = items.filter((i) => !i.optional);
  const doneCount = items.filter((i) => i.complete).length;
  const allRequiredDone = requiredItems.every((i) => i.complete);

  // Once every required item is done, this has served its purpose — the
  // optional integration item can stay unfinished forever without this
  // card sticking around as permanent clutter.
  if (allRequiredDone) return null;

  return (
    <div
      className={`rounded-xl border ${
        colorMode === "dark"
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cyan-500" />
          <h2
            className={`text-xl font-semibold font-montserrat ${
              colorMode === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Get Your Team Set Up
          </h2>
        </div>
        <span
          className={`text-xs font-montserrat ${
            colorMode === "dark" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {doneCount} of {items.length} done
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              {item.complete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    colorMode === "dark" ? "text-slate-600" : "text-slate-300"
                  }`}
                />
              )}
              <div>
                <p
                  className={`text-sm font-medium font-montserrat ${
                    item.complete
                      ? colorMode === "dark"
                        ? "text-slate-500 line-through"
                        : "text-slate-400 line-through"
                      : colorMode === "dark"
                        ? "text-slate-200"
                        : "text-slate-800"
                  }`}
                >
                  {item.label}
                  {item.optional && (
                    <span
                      className={`ml-2 text-[11px] font-normal ${
                        colorMode === "dark" ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Optional
                    </span>
                  )}
                </p>
                {!item.complete && (
                  <p
                    className={`text-xs mt-0.5 ${
                      colorMode === "dark" ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            {!item.complete && (
              <Button variant="secondary" size="xs" onClick={item.onAction}>
                {item.actionLabel}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
