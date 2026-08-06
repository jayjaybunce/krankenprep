import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon } from "lucide-react";
import { Dropdown, TextInput, Checkbox } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import Button from "../Button";
import { useCreateBoeSale, useUpdateBoeSale } from "../../api/mutationHooks";
import type { BoeSale } from "../../api/queryHooks";

// Matches the backend's BoeSlot* constants exactly (backend/models/boe.go).
const ITEM_SLOTS = [
  "Head",
  "Neck",
  "Shoulder",
  "Back",
  "Chest",
  "Wrist",
  "Hands",
  "Waist",
  "Legs",
  "Feet",
  "Finger",
  "Trinket",
  "Weapon",
  "Off Hand",
] as const;

type BoeSaleModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  teamId: number;
  // Presence switches the modal into edit mode, mirroring CharacterModal.
  sale?: BoeSale | null;
};

export const BoeSaleModal: FC<BoeSaleModalProps> = ({
  isOpen,
  onClose,
  teamId,
  sale,
}) => {
  const isEditing = !!sale;
  const [playerName, setPlayerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemSlot, setItemSlot] = useState<string | string[] | null>("");
  const [salePrice, setSalePrice] = useState("");
  const [soldToPlayer, setSoldToPlayer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayerName(sale?.player_name ?? "");
      setItemName(sale?.item_name ?? "");
      setItemSlot(sale?.item_slot ?? "");
      setSalePrice(sale ? String(sale.sale_price) : "");
      setSoldToPlayer(sale?.sold_to_player ?? false);
    }
  }, [isOpen, sale]);

  const { mutate: createSale, isPending: isCreating } = useCreateBoeSale(teamId);
  const { mutate: updateSale, isPending: isUpdating } = useUpdateBoeSale(
    teamId,
    sale?.id ?? -1,
  );
  const isPending = isCreating || isUpdating;

  const handleClose = () => onClose(false);

  const singleValue = (value: string | string[] | null): string =>
    (Array.isArray(value) ? value[0] : value) ?? "";

  const parsedSalePrice = Number(salePrice);
  const canSave =
    playerName.trim() !== "" &&
    itemName.trim() !== "" &&
    singleValue(itemSlot) !== "" &&
    salePrice.trim() !== "" &&
    !Number.isNaN(parsedSalePrice) &&
    parsedSalePrice >= 0;

  const handleSave = () => {
    const payload = {
      player_name: playerName.trim(),
      item_name: itemName.trim(),
      item_slot: singleValue(itemSlot),
      sale_price: parsedSalePrice,
      sold_to_player: soldToPlayer,
    };
    if (isEditing && sale) {
      updateSale(payload, { onSuccess: handleClose });
    } else {
      createSale(payload, { onSuccess: handleClose });
    }
  };

  const itemSlotOptions: DropdownOption[] = ITEM_SLOTS.map((slot) => ({
    label: slot,
    value: slot,
  }));

  // Client-side preview only — the numbers that actually get saved always
  // come from the backend response, computed with the exact same formula
  // (BoeSale.GuildCut/PlayerCut), never from this preview.
  const validSalePrice = !Number.isNaN(parsedSalePrice) ? parsedSalePrice : 0;
  const previewGuildCut = soldToPlayer ? 0 : validSalePrice * 0.5;
  const previewPlayerCut = validSalePrice * 0.5;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit BoE Sale" : "Add BoE Sale"}
      subtitle="Guild and player cuts are computed automatically from the sale price"
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
            {isPending ? "Saving..." : isEditing ? "Save" : "Add Sale"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextInput
          value={playerName}
          variant="minimal"
          className="font-montserrat"
          label="Player Name"
          placeholder="Who looted it"
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <TextInput
          value={itemName}
          variant="minimal"
          className="font-montserrat"
          label="Item Name"
          placeholder="Item name"
          onChange={(e) => setItemName(e.target.value)}
        />
        <Dropdown
          label="Item Slot"
          value={itemSlot}
          onChange={setItemSlot}
          searchable
          options={itemSlotOptions}
        />
        <TextInput
          value={salePrice}
          type="number"
          min={0}
          variant="minimal"
          className="font-montserrat"
          label="Sale Price"
          placeholder="0"
          onChange={(e) => setSalePrice(e.target.value)}
        />
        <Checkbox
          checked={soldToPlayer}
          onChange={(e) => setSoldToPlayer(e.target.checked)}
          label="Sold directly to another player"
          variant="default"
          helperText="Guild forgoes its cut so the buyer only pays 50% market value — the player still only gets 50% of the entered sale price, not the whole thing"
        />
        <div className="flex items-center justify-between text-xs font-montserrat text-slate-400 border-t border-slate-800 pt-3">
          <span>Guild cut: {previewGuildCut.toLocaleString()}g</span>
          <span>Player cut: {previewPlayerCut.toLocaleString()}g</span>
        </div>
      </div>
    </Modal>
  );
};
