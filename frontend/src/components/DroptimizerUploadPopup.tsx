import type { FC } from "react";
import { useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useTeam } from "../hooks";
import {
  useUploadDroptimizer,
  DroptimizerUploadError,
  type DroptimizerProvider,
} from "../api/mutationHooks";

const PROVIDER_LABELS: Record<DroptimizerProvider, string> = {
  wowaudit: "WowAudit",
  wowutils: "WowUtils",
};

type UploadResultRowProps = {
  label: string;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  successMessage?: string;
  errorMessage?: string;
  errorDetails?: string[];
};

// One row per upload target, driven straight off that target's own
// useUploadDroptimizer mutation state — no separate "uploading" state to
// keep in sync by hand. This is the fix for both original complaints in one
// place: an uploading target always shows a spinner, and a failed one
// always shows its message (or structured validation details, when the
// backend has them) right here instead of nowhere.
const UploadResultRow: FC<UploadResultRowProps> = ({
  label,
  isPending,
  isSuccess,
  isError,
  successMessage,
  errorMessage,
  errorDetails,
}) => {
  if (!isPending && !isSuccess && !isError) return null;

  return (
    <div
      className={`rounded-lg border p-2.5 flex flex-col gap-1 ${
        isError
          ? "bg-rose-900/30 border-rose-500/40"
          : isSuccess
            ? "bg-emerald-900/30 border-emerald-500/40"
            : "bg-slate-800/60 border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-white">
        {isPending && (
          <LoaderCircle className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
        )}
        {isSuccess && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}
        {isError && (
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        )}
        <span>{label}</span>
        <span className="ml-auto text-[11px] font-normal text-slate-400">
          {isPending ? "Uploading…" : isSuccess ? "Uploaded" : "Failed"}
        </span>
      </div>
      {isSuccess && successMessage && (
        <p className="text-[11px] text-slate-400">{successMessage}</p>
      )}
      {isError &&
        (errorDetails && errorDetails.length > 0 ? (
          <ul className="text-[11px] text-rose-300 list-disc pl-4">
            {errorDetails.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-rose-300">{errorMessage}</p>
        ))}
    </div>
  );
};

// Replaces the old WowAuditPopup with a target-aware version: a team can
// have WowAudit, WowUtils, both, or neither enabled, and this renders (and
// only renders) whichever of those are actually on. One URL paste can go to
// every enabled target at once — each gets its own row above with live
// pending/success/error state instead of a single shared status.
export const DroptimizerUploadPopup: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(
    null,
  );
  // Only stores explicit user overrides — the effective checked state
  // (isTargetChecked below) falls back to "enabled" so a target defaults to
  // selected the moment it's turned on for the team, without needing this
  // component to re-sync state when that happens.
  const [targetOverrides, setTargetOverrides] = useState<
    Partial<Record<DroptimizerProvider, boolean>>
  >({});
  const [wowAuditValidationError, setWowAuditValidationError] = useState<
    string | null
  >(null);

  const { team } = useTeam();
  const teamId = team?.team_id ?? -1;

  const wowAuditEnabled = !!team?.team?.wowaudit_integration;
  const wowUtilsEnabled = !!team?.team?.wowutils_integration;

  const wowAuditUpload = useUploadDroptimizer(teamId, "wowaudit");
  const wowUtilsUpload = useUploadDroptimizer(teamId, "wowutils");

  if (!wowAuditEnabled && !wowUtilsEnabled) return null;

  const isTargetChecked = (provider: DroptimizerProvider, enabled: boolean) =>
    targetOverrides[provider] ?? enabled;
  const wowAuditChecked = isTargetChecked("wowaudit", wowAuditEnabled);
  const wowUtilsChecked = isTargetChecked("wowutils", wowUtilsEnabled);

  // Only show the picker when there's an actual choice to make — a team
  // with just one integration on doesn't need a checkbox for it.
  const showTargetPicker = wowAuditEnabled && wowUtilsEnabled;

  const configs = team?.team?.wishlist_configs ?? [];
  const effectiveConfigId = selectedConfigId ?? configs[0]?.name ?? null;

  const isUploading = wowAuditUpload.isPending || wowUtilsUpload.isPending;
  const noTargetsSelected =
    !(wowAuditEnabled && wowAuditChecked) &&
    !(wowUtilsEnabled && wowUtilsChecked);

  const handleSubmit = () => {
    setWowAuditValidationError(null);

    if (wowAuditEnabled && wowAuditChecked) {
      if (!effectiveConfigId) {
        setWowAuditValidationError("Pick a wishlist config first.");
      } else {
        wowAuditUpload.mutate({ url: inputValue, wishlist_name: effectiveConfigId });
      }
    }
    if (wowUtilsEnabled && wowUtilsChecked) {
      wowUtilsUpload.mutate({ url: inputValue });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup panel */}
      {isOpen && team ? (
        <div
          className="
            w-80 p-4 flex flex-col gap-3
            bg-gradient-to-b from-slate-900/95 to-slate-800/95
            backdrop-blur-md
            border border-slate-700/50 rounded-xl
            shadow-xl shadow-black/40
          "
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-white font-montserrat">
              Upload Droptimizer
            </h3>
            <p className="text-xs text-slate-400 font-montserrat">
              {team.team.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          {showTargetPicker && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-montserrat">
                Upload to:
              </span>
              <div className="flex gap-4">
                {(["wowaudit", "wowutils"] as DroptimizerProvider[]).map(
                  (provider) => {
                    const enabled =
                      provider === "wowaudit" ? wowAuditEnabled : wowUtilsEnabled;
                    if (!enabled) return null;
                    const checked = isTargetChecked(provider, enabled);
                    return (
                      <label
                        key={provider}
                        className="flex items-center gap-1.5 text-xs text-slate-300 font-montserrat cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setTargetOverrides((prev) => ({
                              ...prev,
                              [provider]: e.target.checked,
                            }))
                          }
                          className="accent-cyan-500"
                        />
                        {PROVIDER_LABELS[provider]}
                      </label>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {wowAuditEnabled && wowAuditChecked && configs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {configs.map((cfg) => (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => setSelectedConfigId(cfg.name)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold font-montserrat transition
                    ${
                      effectiveConfigId === cfg.name
                        ? "bg-cyan-600 text-white border border-transparent"
                        : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/60 hover:text-white border border-slate-600/50"
                    }
                  `}
                >
                  {cfg.name}
                </button>
              ))}
            </div>
          )}
          {wowAuditValidationError && (
            <p className="text-xs text-rose-400 font-montserrat">
              {wowAuditValidationError}
            </p>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste Droptimizer URL..."
            className="
              w-full bg-slate-800/80 border border-slate-600 rounded-lg
              px-3 py-2 text-sm placeholder:text-slate-500 text-white
              transition
              focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30
            "
          />

          {wowAuditEnabled && wowAuditChecked && (
            <UploadResultRow
              label={PROVIDER_LABELS.wowaudit}
              isPending={wowAuditUpload.isPending}
              isSuccess={wowAuditUpload.isSuccess}
              isError={wowAuditUpload.isError}
              successMessage="Uploaded successfully."
              errorMessage={wowAuditUpload.error?.message}
              errorDetails={
                wowAuditUpload.error instanceof DroptimizerUploadError
                  ? wowAuditUpload.error.details
                  : undefined
              }
            />
          )}
          {wowUtilsEnabled && wowUtilsChecked && (
            <UploadResultRow
              label={PROVIDER_LABELS.wowutils}
              isPending={wowUtilsUpload.isPending}
              isSuccess={wowUtilsUpload.isSuccess}
              isError={wowUtilsUpload.isError}
              successMessage="Uploaded successfully."
              errorMessage={wowUtilsUpload.error?.message}
              errorDetails={
                wowUtilsUpload.error instanceof DroptimizerUploadError
                  ? wowUtilsUpload.error.details
                  : undefined
              }
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={isUploading || !inputValue || noTargetsSelected}
            className="
              w-full flex items-center justify-center gap-2
              text-white text-sm font-semibold rounded-lg
              px-4 py-2 transition
              bg-cyan-600 hover:bg-cyan-500
              disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed
            "
          >
            {isUploading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {isUploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      ) : (
        <></>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close" : "Upload Droptimizer"}
        className={`
          flex items-center gap-2 rounded-xl transition-all duration-200
          text-sm font-semibold font-montserrat
          ${
            isOpen
              ? "p-3 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "px-5 py-3 text-white bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60"
          }
        `}
      >
        {isOpen ? <X className="w-6 h-6" /> : "Droptimizer"}
      </button>
    </div>
  );
};
