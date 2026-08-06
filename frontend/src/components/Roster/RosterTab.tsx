import { type FC, useState } from "react";
import { UserPlus, Plus, Pencil, Trash2, Star, Users, Link2, Link2Off } from "lucide-react";
import { useTheme, useUser } from "../../hooks";
import Button from "../Button";
import type { Character, MyRole, Player, Team } from "../../api/queryHooks";
import {
  useClaimPlayer,
  useDeleteCharacter,
  useDeletePlayer,
  useUnclaimPlayer,
  useUpdateCharacter,
} from "../../api/mutationHooks";
import { PlayerModal } from "../modals/PlayerModal";
import { CharacterModal } from "../modals/CharacterModal";
import { getClassColor } from "../../data/classes";

type CharacterChipProps = {
  character: Character;
  teamId: number;
  colorMode: string;
  isAdmin: boolean;
  onEdit: () => void;
};

const CharacterChip: FC<CharacterChipProps> = ({
  character,
  teamId,
  colorMode,
  isAdmin,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { mutate: updateCharacter, isPending: isSettingMain } =
    useUpdateCharacter(teamId);
  const { mutate: deleteCharacter, isPending: isDeleting } =
    useDeleteCharacter(teamId);

  const classColor = getClassColor(character.class) ?? "#94a3b8";
  const detailsClass = expanded
    ? "flex"
    : "hidden group-hover:flex group-focus-within:flex";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((e) => !e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      className={`group flex items-center gap-2 pl-2.5 pr-1.5 h-8 rounded-full border cursor-pointer transition-colors ${
        colorMode === "dark"
          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: classColor }}
      />
      {character.specialization && (
        <img
          src={character.specialization.icon_url}
          alt={character.specialization.name}
          title={character.specialization.name}
          className="w-4 h-4 rounded shrink-0"
        />
      )}
      <span
        className={`text-sm font-medium whitespace-nowrap ${
          colorMode === "dark" ? "text-slate-200" : "text-slate-800"
        }`}
      >
        {character.name}
      </span>
      {character.is_main && (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            colorMode === "dark"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <Star className="w-2.5 h-2.5 fill-current" />
          Main
        </span>
      )}

      <div className={`items-center gap-1 ${detailsClass}`}>
        <span
          className={`text-xs whitespace-nowrap ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
        >
          {character.class} &middot; {character.realm} &middot;{" "}
          {character.region.toUpperCase()}
        </span>
        {isAdmin && !character.is_main && (
          <span onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="xs"
              disabled={isSettingMain}
              onClick={() =>
                updateCharacter({
                  characterId: character.id,
                  name: character.name,
                  class: character.class,
                  realm: character.realm,
                  region: character.region,
                  is_main: true,
                  specialization_id: character.specialization_id,
                })
              }
            >
              <Star className="w-3 h-3" />
              Set Main
            </Button>
          </span>
        )}
        {isAdmin && (
          <>
            <span onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="xs" onClick={onEdit}>
                <Pencil className="w-3 h-3" />
              </Button>
            </span>
            <span onClick={(e) => e.stopPropagation()}>
              <Button
                variant="danger"
                size="xs"
                disabled={isDeleting}
                onClick={() => deleteCharacter(character.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

type PlayerCardProps = {
  player: Player;
  teamId: number;
  colorMode: string;
  isMine: boolean;
  canClaim: boolean;
  isAdmin: boolean;
  onEditPlayer: () => void;
  onAddCharacter: () => void;
  onEditCharacter: (character: Character) => void;
};

const PlayerCard: FC<PlayerCardProps> = ({
  player,
  teamId,
  colorMode,
  isMine,
  canClaim,
  isAdmin,
  onEditPlayer,
  onAddCharacter,
  onEditCharacter,
}) => {
  const { mutate: deletePlayer, isPending: isDeleting } =
    useDeletePlayer(teamId);
  const { mutate: claimPlayer, isPending: isClaiming } =
    useClaimPlayer(teamId);
  const { mutate: unclaimPlayer, isPending: isUnclaiming } =
    useUnclaimPlayer(teamId);
  const characters = player.characters ?? [];

  return (
    <div
      className={`rounded-xl border ${
        colorMode === "dark"
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-base font-semibold font-montserrat ${
                colorMode === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {player.name}
            </h3>
            {player.user && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  colorMode === "dark"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                {isMine ? "Claimed by you" : `Claimed by ${player.user.name}`}
              </span>
            )}
          </div>
          <p
            className={`text-xs ${colorMode === "dark" ? "text-slate-500" : "text-slate-500"}`}
          >
            {player.battletag}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isMine && (
            <Button
              variant="ghost"
              size="xs"
              disabled={isUnclaiming}
              onClick={() => unclaimPlayer(player.id)}
            >
              <Link2Off className="w-3 h-3" />
              Unclaim
            </Button>
          )}
          {canClaim && (
            <Button
              variant="secondary"
              size="xs"
              disabled={isClaiming}
              onClick={() => claimPlayer(player.id)}
            >
              <Link2 className="w-3 h-3" />
              Claim
            </Button>
          )}
          {isAdmin && (
            <>
              <Button variant="ghost" size="xs" onClick={onAddCharacter}>
                <Plus className="w-3 h-3" />
                Character
              </Button>
              <Button variant="ghost" size="xs" onClick={onEditPlayer}>
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="danger"
                size="xs"
                disabled={isDeleting}
                onClick={() => deletePlayer(player.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-wrap gap-2">
        {characters.length > 0 ? (
          characters.map((c) => (
            <CharacterChip
              key={c.id}
              character={c}
              teamId={teamId}
              colorMode={colorMode}
              isAdmin={isAdmin}
              onEdit={() => onEditCharacter(c)}
            />
          ))
        ) : (
          <p
            className={`px-3 py-3 text-sm ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
          >
            No characters yet
          </p>
        )}
      </div>
    </div>
  );
};

type RosterTabProps = {
  team: Team;
  teamId: number;
  roles: MyRole[];
  // Roster CRUD (add/edit/delete players and characters, set main) is
  // admin-only on the backend — claim/unclaim stays available to any team
  // member regardless of this flag, matching isTeamMember-gated endpoints.
  isAdmin: boolean;
};

export const RosterTab: FC<RosterTabProps> = ({ team, teamId, roles, isAdmin }) => {
  const { colorMode } = useTheme();
  const { user } = useUser();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  const players = team.players ?? [];
  const myClaimedPlayerId = players.find(
    (p) => p.user && user && String(p.user.id) === String(user.id),
  )?.id;

  const openAddPlayer = () => {
    setEditingPlayer(null);
    setIsPlayerModalOpen(true);
  };

  const openEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const openAddCharacter = (playerId: number) => {
    setActivePlayerId(playerId);
    setEditingCharacter(null);
    setIsCharacterModalOpen(true);
  };

  const openEditCharacter = (playerId: number, character: Character) => {
    setActivePlayerId(playerId);
    setEditingCharacter(character);
    setIsCharacterModalOpen(true);
  };

  return (
    <>
      <div
        className={`rounded-xl border ${
          colorMode === "dark"
            ? "bg-slate-900/50 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            <h2
              className={`text-xl font-semibold font-montserrat ${
                colorMode === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Roster
            </h2>
          </div>
          {isAdmin && (
            <Button variant="primary" size="sm" onClick={openAddPlayer}>
              <UserPlus className="w-4 h-4" />
              Add Player
            </Button>
          )}
        </div>

        <div className="p-4">
          {players.length > 0 ? (
            <div className="flex flex-col gap-3">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  teamId={teamId}
                  colorMode={colorMode}
                  isMine={myClaimedPlayerId === player.id}
                  canClaim={!player.user && myClaimedPlayerId === undefined}
                  isAdmin={isAdmin}
                  onEditPlayer={() => openEditPlayer(player)}
                  onAddCharacter={() => openAddCharacter(player.id)}
                  onEditCharacter={(character) =>
                    openEditCharacter(player.id, character)
                  }
                />
              ))}
            </div>
          ) : (
            <p
              className={`text-sm text-center py-8 ${
                colorMode === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              No players added yet
            </p>
          )}
        </div>
      </div>

      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={setIsPlayerModalOpen}
        teamId={teamId}
        roles={roles}
        player={editingPlayer}
      />

      {activePlayerId !== null && (
        <CharacterModal
          isOpen={isCharacterModalOpen}
          onClose={setIsCharacterModalOpen}
          teamId={teamId}
          playerId={activePlayerId}
          character={editingCharacter}
        />
      )}
    </>
  );
};
