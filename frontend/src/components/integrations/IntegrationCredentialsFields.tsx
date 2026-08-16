import type { FC } from "react";
import { CheckCircle, FlaskConical, LoaderCircle } from "lucide-react";
import { Toggle, TextInput } from "../form";
import { useTheme } from "../../hooks";

export type IntegrationTestStatus = "idle" | "loading" | "success" | "error";

export type IntegrationField = {
  key: string;
  label: string;
  placeholder: string;
  value: string;
  type?: "text" | "password";
  onChange: (value: string) => void;
};

type IntegrationCredentialsFieldsProps = {
  enableLabel: string;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  fields: IntegrationField[];
  // Whether every field has a value worth testing against — same gate both
  // existing WowAudit forms use to hide the Test button until there's
  // something to test.
  fieldsFilled: boolean;
  testStatus: IntegrationTestStatus;
  onTest: () => void;
  // Shown next to the Test button once it's succeeded, e.g. "Connected to
  // <group name>" — richer than a bare checkmark where the API gives us
  // something to confirm against.
  testSuccessMessage?: string;
  // Shown on failure — pass the actual backend error when you have one
  // (WowUtils' test endpoint returns a specific message per failure mode)
  // rather than a generic fallback.
  testErrorMessage?: string;
  // Locks the fields once verified, so a save can't drift from what was
  // actually tested. Matches existing WowAudit behavior; off for cases
  // where re-testing after a field edit should stay unlocked.
  lockFieldsOnSuccess?: boolean;
};

// Shared "enable this integration + its credential fields + a Test button"
// block — used by both WowAudit and WowUtils, in both the team Settings tab
// and the create-team modal (4 call sites total). Only the credentials
// sub-form is generalized here; provider-specific surrounding content (e.g.
// WowAudit's sync button and wishlist config list) stays in the page that
// owns it.
export const IntegrationCredentialsFields: FC<
  IntegrationCredentialsFieldsProps
> = ({
  enableLabel,
  enabled,
  onToggleEnabled,
  fields,
  fieldsFilled,
  testStatus,
  onTest,
  testSuccessMessage,
  testErrorMessage = "Could not verify — check your credentials.",
  lockFieldsOnSuccess = true,
}) => {
  const { colorMode } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <Toggle
        variant="default"
        label={enableLabel}
        checked={enabled}
        onChange={(e) => onToggleEnabled(e.target.checked)}
      />
      {enabled && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {fields.map((field) => (
              <TextInput
                key={field.key}
                value={field.value}
                variant="minimal"
                className="font-montserrat"
                label={field.label}
                placeholder={field.placeholder}
                type={field.type ?? "text"}
                disabled={lockFieldsOnSuccess && testStatus === "success"}
                onChange={(e) => field.onChange(e.target.value)}
              />
            ))}
          </div>
          {fieldsFilled && (
            <div className="flex items-center gap-3">
              <button
                onClick={onTest}
                disabled={
                  testStatus === "loading" || testStatus === "success"
                }
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium font-montserrat text-sm
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    testStatus === "success"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : testStatus === "error"
                        ? "bg-rose-600 text-white hover:bg-rose-500"
                        : colorMode === "dark"
                          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }
                `}
              >
                {testStatus === "loading" ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : testStatus === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <FlaskConical className="w-4 h-4" />
                )}
                {testStatus === "success"
                  ? "Verified"
                  : testStatus === "error"
                    ? "Retry"
                    : "Test"}
              </button>
              {testStatus === "success" && testSuccessMessage && (
                <span
                  className={`text-xs font-montserrat ${
                    colorMode === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {testSuccessMessage}
                </span>
              )}
              {testStatus === "error" && (
                <span
                  className={`text-xs font-montserrat ${
                    colorMode === "dark" ? "text-rose-400" : "text-rose-600"
                  }`}
                >
                  {testErrorMessage}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
