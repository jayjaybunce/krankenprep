import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon, LoaderCircle } from "lucide-react";
import { useTheme, useKpApi } from "../../hooks";
import { Dropdown, TextInput } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import {
  IntegrationCredentialsFields,
  type IntegrationTestStatus,
} from "../integrations/IntegrationCredentialsFields";
import { useRegions, useServers } from "../../api/queryHooks";
import { useCreateTeam } from "../../api/mutationHooks";

const REGION_MAP: { [key: string]: string } = {
  na: "North America",
  eu: "Europe",
};

const WOWUTILS_GROUP_ID_REGEX = /^[0-9a-f]{24}$/i;

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
  const [wowAuditEnabled, setWowAuditEnabled] = useState(false);
  const [wowAuditGuildUrl, setWowAuditGuildUrl] = useState("");
  const [wowAuditApiKey, setWowAuditApiKey] = useState("");
  const [wowAuditTestStatus, setWowAuditTestStatus] =
    useState<IntegrationTestStatus>("idle");

  const [wowUtilsEnabled, setWowUtilsEnabled] = useState(false);
  const [wowUtilsGroupId, setWowUtilsGroupId] = useState("");
  const [wowUtilsApiKey, setWowUtilsApiKey] = useState("");
  const [wowUtilsTestStatus, setWowUtilsTestStatus] =
    useState<IntegrationTestStatus>("idle");
  const [wowUtilsTestMessage, setWowUtilsTestMessage] = useState("");

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
  const { url: wowAuditTestUrl, headers: authHeaders } = useKpApi(
    "/teams/wowaudit/test",
  );
  const { url: wowUtilsTestUrl, headers: wowUtilsTestHeaders } = useKpApi(
    "/teams/wowutils/test",
  );

  const { mutate, isPending } = useCreateTeam();

  const handleSave = () => {
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
        wowutils_integration: wowUtilsEnabled,
        ...(wowUtilsEnabled && {
          wowutils_group_id: wowUtilsGroupId,
          wowutils_api_key: wowUtilsApiKey,
        }),
      },
      { onSuccess: () => {
        onClose(false)
      } },
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

  const handleWowUtilsTest = async () => {
    setWowUtilsTestStatus("loading");
    setWowUtilsTestMessage("");
    try {
      const res = await fetch(wowUtilsTestUrl, {
        method: "POST",
        headers: wowUtilsTestHeaders,
        body: JSON.stringify({
          group_id: wowUtilsGroupId,
          api_key: wowUtilsApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWowUtilsTestStatus("error");
        setWowUtilsTestMessage(
          data.error ?? "Could not verify — check your Group ID and API key.",
        );
        return;
      }
      setWowUtilsTestStatus("success");
      setWowUtilsTestMessage(
        `Connected to ${data.name} (${data.member_count} members)`,
      );
    } catch {
      setWowUtilsTestStatus("error");
      setWowUtilsTestMessage("Failed to reach WowUtils.");
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
  const wowUtilsGroupIdValid = WOWUTILS_GROUP_ID_REGEX.test(wowUtilsGroupId);
  const canSave =
    formState.teamName.trim() !== "" &&
    rioUrlValid &&
    (!wowAuditEnabled || wowAuditTestStatus === "success") &&
    (!wowUtilsEnabled || wowUtilsTestStatus === "success");

  const wowAuditGuildUrlValid = isValidUrl(wowAuditGuildUrl);
  const wowAuditBothFilled =
    wowAuditGuildUrlValid && wowAuditApiKey.trim() !== "";
  const wowUtilsFieldsFilled =
    wowUtilsGroupIdValid && wowUtilsApiKey.trim() !== "";

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

        <IntegrationCredentialsFields
          enableLabel="Enable WowAudit integration"
          enabled={wowAuditEnabled}
          onToggleEnabled={(checked) => {
            setWowAuditEnabled(checked);
            setWowAuditTestStatus("idle");
          }}
          fields={[
            {
              key: "guild_url",
              label: "WowAudit Guild URL",
              placeholder: "https://wowaudit.com/us/area-52/your-guild",
              value: wowAuditGuildUrl,
              onChange: (value) => {
                setWowAuditGuildUrl(value);
                setWowAuditTestStatus("idle");
              },
            },
            {
              key: "api_key",
              label: "WowAudit API Key",
              placeholder: "Your WowAudit API key",
              type: "password",
              value: wowAuditApiKey,
              onChange: (value) => {
                setWowAuditApiKey(value);
                setWowAuditTestStatus("idle");
              },
            },
          ]}
          fieldsFilled={wowAuditBothFilled}
          testStatus={wowAuditTestStatus}
          onTest={handleWowAuditTest}
          testErrorMessage="Could not verify — check the URL and API key."
        />

        <div
          className={`h-px ${colorMode === "dark" ? "bg-slate-700/50" : "bg-slate-200"}`}
        />

        <IntegrationCredentialsFields
          enableLabel="Enable WowUtils integration"
          enabled={wowUtilsEnabled}
          onToggleEnabled={(checked) => {
            setWowUtilsEnabled(checked);
            setWowUtilsTestStatus("idle");
          }}
          fields={[
            {
              key: "group_id",
              label: "WowUtils Group ID",
              placeholder: "24-character hex Group ID",
              value: wowUtilsGroupId,
              onChange: (value) => {
                setWowUtilsGroupId(value.trim().toLowerCase());
                setWowUtilsTestStatus("idle");
              },
            },
            {
              key: "api_key",
              label: "WowUtils API Key",
              placeholder: "Your WowUtils API key",
              type: "password",
              value: wowUtilsApiKey,
              onChange: (value) => {
                setWowUtilsApiKey(value);
                setWowUtilsTestStatus("idle");
              },
            },
          ]}
          fieldsFilled={wowUtilsFieldsFilled}
          testStatus={wowUtilsTestStatus}
          onTest={handleWowUtilsTest}
          testSuccessMessage={wowUtilsTestMessage}
          testErrorMessage={
            wowUtilsTestMessage ||
            "Could not verify — check your Group ID and API key."
          }
        />
      </div>
    </Modal>
  );
};
