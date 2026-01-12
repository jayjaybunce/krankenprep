import type { Dispatch, FC, SetStateAction } from "react";
import { useReducer, useState } from "react";
import { Modal } from "../Modal";
import {
  User,
  Shield,
  Sword,
  Heart,
  Zap,
  Save,
  X as XIcon,
  LucideChartNoAxesCombined,
  Signature,
  LoaderCircle,
} from "lucide-react";
import { useApi, useTheme } from "../../hooks";
import { Dropdown, TextInput } from "../form";
import { useQuery } from "@tanstack/react-query";
import { type Server } from "../../types/api/server";
import { type Region } from "../../types/api/region";
import type { DropdownOption } from "../form/Dropdown";
import { useRegions, useServers } from "../../api/queryHooks";
import { useCreateTeam } from "../../api/mutationHooks";

const REGION_MAP: { [key: string]: string } = {
  na: "North America",
  eu: "Europe",
};

type CreateTeamModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
};

type CreateTeamForm = {
  teamName: string;
  region: string | string[];
  server: string | string[];
  rioUrl: string;
};

const defaultFormState: CreateTeamForm = {
  teamName: "",
  region: "",
  server: "",
  rioUrl: "",
};

export const CreateTeamModal: FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colorMode } = useTheme();
  const [formState, setFormState] = useState<CreateTeamForm>(defaultFormState);
  const handleFormChange = (key: string, value: any) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  // Api Hooks
  const {
    isLoading: isServerDataLoading,
    error: serverError,
    data: serverData,
  } = useServers();
  const {
    isLoading: isRegionDataLoading,
    error: regionError,
    data: regionData,
  } = useRegions();

  const { mutate, isPending, isSuccess } = useCreateTeam();

  const handleSave = () => {
    console.log("bang");
    mutate(
      {
        name: formState.teamName,
        region: Array.isArray(formState.region)
          ? formState.region[0]
          : formState.region,
        server: Array.isArray(formState.server)
          ? formState.server[0]
          : formState.server,
        rio_url: formState.rioUrl,
      },
      { onSuccess: () => onClose(false) },
    );
  };
  const regionOptions: DropdownOption[] =
    !isRegionDataLoading && Array.isArray(regionData)
      ? regionData?.map((region) => {
          return {
            label:
              REGION_MAP[region] !== null
                ? REGION_MAP[region]
                : region.toUpperCase(),
            description: region.toUpperCase(),
            value: region,
          };
        })
      : [];

  const serverOptions: DropdownOption[] =
    !isServerDataLoading &&
    Array.isArray(serverData) &&
    Array.isArray(regionData)
      ? serverData
          .filter((server) => server.region == formState.region)
          .map((server) => {
            return {
              label: server.name,
              value: server.name,
            };
          })
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Create a team"
      subtitle="Share resources with your teammates or anyone you want"
      variant="neon-gradient"
      size="xl"
      actions={
        <>
          <button
            onClick={() => onClose(false)}
            className={`
              px-4 py-2 rounded-xl font-medium font-montserrat
              transition-all duration-200
              ${
                colorMode === "dark"
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <XIcon className="w-4 h-4" />
              Cancel
            </div>
          </button>
          <button
            onClick={handleSave}
            // disabled={!acceptTerms || !teamName}
            className={`
              px-4 py-2 rounded-xl font-medium font-montserrat
              transition-all duration-200
              bg-gradient-to-r from-cyan-500 to-blue-600 text-white
              hover:shadow-lg hover:shadow-cyan-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isPending ? <LoaderCircle /> : "Create Team"}
            </div>
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <TextInput
            value={formState.teamName}
            variant="minimal"
            className="font-montserrat"
            label="Name Your Team"
            placeholder="...."
            onChange={(e) => handleFormChange("teamName", e.target.value)}
          />
          <TextInput
            value={formState.rioUrl}
            variant="minimal"
            className="font-montserrat"
            label="Raider.IO Url"
            placeholder="This helps us find your guilds prog data"
            onChange={(e) => handleFormChange("rioUrl", e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-4">
          <Dropdown
            label="Region"
            value={formState.region}
            onChange={(e) => handleFormChange("region", e)}
            searchable
            options={regionOptions}
          />
          <Dropdown
            label="Server"
            value={formState.server}
            disabled={formState.region == ""}
            onChange={(e) => handleFormChange("server", e)}
            searchable
            options={serverOptions}
          />
        </div>
      </div>
    </Modal>
  );
};
