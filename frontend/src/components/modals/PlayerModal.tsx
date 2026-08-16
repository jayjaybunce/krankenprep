import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon } from "lucide-react";
import { Dropdown, TextInput } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import Button from "../Button";
import type { MyRole, Player } from "../../api/queryHooks";
import { useCreatePlayer, useUpdatePlayer } from "../../api/mutationHooks";

type PlayerModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  teamId: number;
  roles: MyRole[];
  player?: Player | null;
};

export const PlayerModal: FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  teamId,
  roles,
  player,
}) => {
  const isEditing = !!player;
  const [name, setName] = useState("");
  const [battletag, setBattletag] = useState("");
  const [userId, setUserId] = useState<number | number[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(player?.name ?? "");
      setBattletag(player?.battletag ?? "");
      setUserId(player?.user_id ?? null);
      setSaveError(null);
    }
  }, [isOpen, player]);

  const { mutate: createPlayer, isPending: isCreating } =
    useCreatePlayer(teamId);
  const { mutate: updatePlayer, isPending: isUpdating } =
    useUpdatePlayer(teamId);
  const isPending = isCreating || isUpdating;

  const handleClose = () => onClose(false);

  const handleSave = () => {
    setSaveError(null);
    const linkedUserId = Array.isArray(userId) ? userId[0] : userId;
    const payload = {
      name: name.trim(),
      battletag: battletag.trim(),
      user_id: linkedUserId,
    };
    const onError = (err: unknown) =>
      setSaveError(err instanceof Error ? err.message : "Failed to save player.");
    if (isEditing && player) {
      updatePlayer(
        { playerId: player.id, ...payload },
        { onSuccess: handleClose, onError },
      );
    } else {
      createPlayer(payload, { onSuccess: handleClose, onError });
    }
  };

  const userOptions: DropdownOption<number>[] = roles.map((role) => ({
    value: role.user_id,
    label: role.user?.name || role.user?.btag || `User ${role.user_id}`,
    description: role.user?.btag,
  }));

  const canSave = name.trim() !== "" && battletag.trim() !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Player" : "Add Player"}
      subtitle="Players make up your team's roster"
      variant="elevated"
      size="md"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose}>
            <XIcon className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave || isPending}
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : isEditing ? "Save" : "Add Player"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextInput
          value={name}
          variant="minimal"
          className="font-montserrat"
          label="Name"
          placeholder="Player name"
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          value={battletag}
          variant="minimal"
          className="font-montserrat"
          label="BattleTag"
          placeholder="Name#1234"
          onChange={(e) => setBattletag(e.target.value)}
        />
        <Dropdown
          label="Linked Account"
          placeholder="No linked account"
          value={userId}
          onChange={setUserId}
          searchable
          clearable
          options={userOptions}
        />
        {saveError && (
          <p className="text-xs text-rose-500 font-montserrat">{saveError}</p>
        )}
      </div>
    </Modal>
  );
};
