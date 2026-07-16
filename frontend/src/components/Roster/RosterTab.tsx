import { type FC, useState } from "react";
import { UserPlus, Plus, Pencil, Trash2, Star, Users } from "lucide-react";
import { useTheme } from "../../hooks";
import Button from "../Button";
import type { Character, MyRole, Player, Team } from "../../api/queryHooks";
import {
  useDeleteCharacter,
  useDeletePlayer,
  useUpdateCharacter,
} from "../../api/mutationHooks";
import { PlayerModal } from "../modals/PlayerModal";
import { CharacterModal } from "../modals/CharacterModal";
import { getClassColor } from "../../data/classes";

type CharacterRowProps = {
  character: Character;
  teamId: number;
  colorMode: string;
  onEdit: () => void;
};

const CharacterRow: FC<CharacterRowProps> = ({
  character,
  teamId,
  colorMode,
  onEdit,
}) => {
  const { mutate: updateCharacter, isPending: isSettingMain } =
    useUpdateCharacter(teamId);
  const { mutate: deleteCharacter, isPending: isDeleting } =
    useDeleteCharacter(teamId);

  const classColor = getClassColor(character.class) ?? "#94a3b8";

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
        colorMode === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
      } transition-colors`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: classColor }}
        />
        <span
          className={`text-sm font-medium truncate ${
            colorMode === "dark" ? "text-slate-200" : "text-slate-800"
          }`}
        >
          {character.name}
        </span>
        <span
          className={`text-xs ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
        >
          {character.class} &middot; {character.realm} &middot;{" "}
          {character.region.toUpperCase()}
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
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!character.is_main && (
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
              })
            }
          >
            <Star className="w-3 h-3" />
            Set Main
          </Button>
        )}
        <Button variant="ghost" size="xs" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          variant="danger"
          size="xs"
          disabled={isDeleting}
          onClick={() => deleteCharacter(character.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

type PlayerCardProps = {
  player: Player;
  teamId: number;
  colorMode: string;
  onEditPlayer: () => void;
  onAddCharacter: () => void;
  onEditCharacter: (character: Character) => void;
};

const PlayerCard: FC<PlayerCardProps> = ({
  player,
  teamId,
  colorMode,
  onEditPlayer,
  onAddCharacter,
  onEditCharacter,
}) => {
  const { mutate: deletePlayer, isPending: isDeleting } =
    useDeletePlayer(teamId);
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
                Linked
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
        </div>
      </div>

      <div className="p-2 flex flex-col gap-0.5">
        {characters.length > 0 ? (
          characters.map((c) => (
            <CharacterRow
              key={c.id}
              character={c}
              teamId={teamId}
              colorMode={colorMode}
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
};

export const RosterTab: FC<RosterTabProps> = ({ team, teamId, roles }) => {
  const { colorMode } = useTheme();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  const players = team.players ?? [];

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
          <Button variant="primary" size="sm" onClick={openAddPlayer}>
            <UserPlus className="w-4 h-4" />
            Add Player
          </Button>
        </div>

        <div className="p-4">
          {players.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  teamId={teamId}
                  colorMode={colorMode}
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
