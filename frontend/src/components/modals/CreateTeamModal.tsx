import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { Modal } from "../Modal";
import {
  Save,
  X as XIcon,
  LoaderCircle,
  FlaskConical,
  CheckCircle,
} from "lucide-react";
import { useTheme, useKpApi } from "../../hooks";
import { Dropdown, TextInput, Toggle } from "../form";
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

type WowAuditTestStatus = "idle" | "loading" | "success" | "error";

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
  const [wowAuditEnabled, setWowAuditEnabled] = useState(false);
  const [wowAuditGuildUrl, setWowAuditGuildUrl] = useState("");
  const [wowAuditApiKey, setWowAuditApiKey] = useState("");
  const [wowAuditTestStatus, setWowAuditTestStatus] =
    useState<WowAuditTestStatus>("idle");

  const handleFormChange = (key: string, value: any) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  // Api Hooks
  const { isLoading: isServerDataLoading, data: serverData } = useServers();
  const { isLoading: isRegionDataLoading, data: regionData } = useRegions();
  const { url: wowAuditTestUrl, headers: authHeaders } = useKpApi("/teams/wowaudit/test");

  const { mutate, isPending } = useCreateTeam();

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
        wowaudit_integration: wowAuditEnabled,
        ...(wowAuditEnabled && {
          wowaudit_url: wowAuditGuildUrl,
          wowaudit_api_key: wowAuditApiKey,
        }),
      },
      { onSuccess: () => onClose(false) },
    );
  };

  const handleWowAuditTest = async () => {
    setWowAuditTestStatus("loading");
    try {
      const res = await fetch(wowAuditTestUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ api_key: wowAuditApiKey }),
      });
      if (!res.ok) {
        setWowAuditTestStatus("error");
        return;
      }
      const data = await res.json();
      const responseUrlBase = data.url
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

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol !== "" && u.host !== "";
    } catch {
      return false;
    }
  };

  const rioUrlValid = isValidUrl(formState.rioUrl);
  const canSave =
    formState.teamName.trim() !== "" &&
    rioUrlValid &&
    (!wowAuditEnabled || wowAuditTestStatus === "success");

  const wowAuditGuildUrlValid = isValidUrl(wowAuditGuildUrl);
  const wowAuditBothFilled =
    wowAuditGuildUrlValid && wowAuditApiKey.trim() !== "";

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
            disabled={!canSave}
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

        <div
          className={`h-px ${colorMode === "dark" ? "bg-slate-700/50" : "bg-slate-200"}`}
        />

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
                  disabled={wowAuditTestStatus === "loading" || wowAuditTestStatus === "success"}
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
                    ? "Success"
                    : wowAuditTestStatus === "error"
                      ? "Retry"
                      : "Test"}
                </button>
                {wowAuditTestStatus === "error" && (
                  <span
                    className={`text-xs font-montserrat ${colorMode === "dark" ? "text-rose-400" : "text-rose-600"}`}
                  >
                    Could not verify — check the URL and API key.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
