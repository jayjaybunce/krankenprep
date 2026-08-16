import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon } from "lucide-react";
import { Dropdown, TextInput, Checkbox } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import Button from "../Button";
import { useGetClasses, useRegions, useServers } from "../../api/queryHooks";
import type { Character } from "../../api/queryHooks";
import { useCreateCharacter, useUpdateCharacter } from "../../api/mutationHooks";
import { CLASS_NAMES } from "../../data/classes";

const REGION_MAP: { [key: string]: string } = {
  na: "North America",
  eu: "Europe",
};

type CharacterModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  teamId: number;
  playerId: number;
  character?: Character | null;
};

export const CharacterModal: FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  teamId,
  playerId,
  character,
}) => {
  const isEditing = !!character;
  const [name, setName] = useState("");
  const [characterClass, setCharacterClass] = useState<
    string | string[] | null
  >("");
  const [region, setRegion] = useState<string | string[] | null>("");
  const [realm, setRealm] = useState<string | string[] | null>("");
  const [isMain, setIsMain] = useState(false);
  const [specializationId, setSpecializationId] = useState<
    string | string[] | null
  >("");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(character?.name ?? "");
      setCharacterClass(character?.class ?? "");
      setRegion(character?.region ?? "");
      setRealm(character?.realm ?? "");
      setIsMain(character?.is_main ?? false);
      setSpecializationId(
        character?.specialization_id != null
          ? String(character.specialization_id)
          : "",
      );
      setSaveError(null);
    }
  }, [isOpen, character]);

  const { isLoading: isServerDataLoading, data: serverData } = useServers();
  const { isLoading: isRegionDataLoading, data: regionData } = useRegions();
  const { data: classData } = useGetClasses();

  const { mutate: createCharacter, isPending: isCreating } =
    useCreateCharacter(teamId);
  const { mutate: updateCharacter, isPending: isUpdating } =
    useUpdateCharacter(teamId);
  const isPending = isCreating || isUpdating;

  const handleClose = () => onClose(false);

  const singleValue = (value: string | string[] | null): string =>
    (Array.isArray(value) ? value[0] : value) ?? "";

  const handleSave = () => {
    setSaveError(null);
    const specId = singleValue(specializationId);
    const payload = {
      name: name.trim(),
      class: singleValue(characterClass),
      region: singleValue(region),
      realm: singleValue(realm),
      is_main: isMain,
      specialization_id: specId ? Number(specId) : null,
    };
    const onError = (err: unknown) =>
      setSaveError(err instanceof Error ? err.message : "Failed to save character.");
    if (isEditing && character) {
      updateCharacter(
        { characterId: character.id, ...payload },
        { onSuccess: handleClose, onError },
      );
    } else {
      createCharacter(
        { playerId, ...payload },
        { onSuccess: handleClose, onError },
      );
    }
  };

  const classOptions: DropdownOption[] = CLASS_NAMES.map((className) => ({
    label: className,
    value: className,
  }));

  const specOptions: DropdownOption[] =
    classData?.find((c) => c.name === singleValue(characterClass))
      ?.specializations.map((spec) => ({
        label: spec.name,
        value: String(spec.id),
        icon: (
          <img
            src={spec.icon_url}
            alt=""
            className="w-4 h-4 rounded shrink-0"
          />
        ),
      })) ?? [];

  const regionOptions: DropdownOption[] =
    !isRegionDataLoading && Array.isArray(regionData)
      ? regionData.map((r) => ({
          label: REGION_MAP[r] ?? r.toUpperCase(),
          description: r.toUpperCase(),
          value: r,
        }))
      : [];

  const realmOptions: DropdownOption[] =
    !isServerDataLoading && Array.isArray(serverData)
      ? serverData
          .filter((server) => server.region === region)
          .map((server) => ({ label: server.name, value: server.name }))
      : [];

  const canSave =
    name.trim() !== "" &&
    singleValue(characterClass) !== "" &&
    singleValue(region) !== "" &&
    singleValue(realm) !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Character" : "Add Character"}
      subtitle="Every player can mark one character as their main"
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
            {isPending ? "Saving..." : isEditing ? "Save" : "Add Character"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextInput
          value={name}
          variant="minimal"
          className="font-montserrat"
          label="Character Name"
          placeholder="Character name"
          onChange={(e) => setName(e.target.value)}
        />
        <Dropdown
          label="Class"
          value={characterClass}
          onChange={(value) => {
            setCharacterClass(value);
            setSpecializationId("");
          }}
          searchable
          options={classOptions}
        />
        <Dropdown
          label="Specialization"
          value={specializationId}
          disabled={singleValue(characterClass) === ""}
          onChange={setSpecializationId}
          searchable
          options={specOptions}
        />
        <div className="flex flex-row gap-4">
          <Dropdown
            label="Region"
            value={region}
            onChange={(value) => {
              setRegion(value);
              setRealm("");
            }}
            searchable
            options={regionOptions}
          />
          <Dropdown
            label="Realm"
            value={realm}
            disabled={region === ""}
            onChange={setRealm}
            searchable
            options={realmOptions}
          />
        </div>
        <Checkbox
          checked={isMain}
          onChange={(e) => setIsMain(e.target.checked)}
          label="Set as main character"
          variant="default"
          helperText="Marking this as main will unmark any other main character for this player"
        />
        {saveError && (
          <p className="text-xs text-rose-500 font-montserrat">{saveError}</p>
        )}
      </div>
    </Modal>
  );
};
