import { useEffect, useState, type FC } from "react";
import { RefreshCw, Settings, ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
import {
  useGetTierSimRefreshConfig,
} from "../../api/queryHooks";
import {
  useUpdateTierSimRefreshConfig,
  useRefreshTierSimData,
  TierSimRefreshError,
  type TierSimRowValues,
} from "../../api/mutationHooks";

const REFRESH_COOLDOWN_MS = 20 * 60 * 1000;

const FIELD_LABELS: { key: keyof TierSimRowValues; label: string }[] = [
  { key: "score_0pc", label: "0pc" },
  { key: "score_2pc", label: "2pc" },
  { key: "score_4pc", label: "4pc" },
  { key: "score_4pc_prev_tier", label: "4pc (prev tier)" },
  { key: "score_2pc_mixed", label: "2pc mixed" },
  { key: "score_4pc_new_tier", label: "4pc (new tier)" },
];

const formatVal = (v: number | null) => (v == null ? "—" : v.toLocaleString());

// Only used by team owners — this whole component renders nothing for
// anyone else (checked by the caller, not duplicated here).
export const TierSimRefreshControls: FC<{ teamId: number; colorMode: string }> = ({
  teamId,
  colorMode,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [transitionUrl, setTransitionUrl] = useState("");
  const [hasSeeded, setHasSeeded] = useState(false);

  const { data: config } = useGetTierSimRefreshConfig(teamId);
  const updateConfig = useUpdateTierSimRefreshConfig(teamId);
  const refresh = useRefreshTierSimData(teamId);

  // Ticks once a second so the cooldown countdown below stays live —
  // Date.now() can't be called directly during render (impure), so it's
  // read here in an effect instead and stashed in state.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Seed the inputs once when the config first loads — never again, so an
  // unrelated background refetch (e.g. React Query's refetch-on-focus)
  // can't wipe out an in-progress edit. Same footgun this app hit with
  // AddNoteModal/AddSectionModal resetting on prop-reference churn; fixed
  // here the way React's docs recommend — adjusting state during render
  // instead of in an effect. A plain state flag rather than a ref, since
  // reading ref.current during render is itself disallowed.
  if (config && !hasSeeded) {
    setHasSeeded(true);
    setCurrentUrl(config.current_tier_sheet_url);
    setTransitionUrl(config.transition_sheet_url);
  }

  // Cooldown is tracked client-side from whichever last-refreshed timestamp
  // we've seen most recently (loaded config, or this session's own
  // successful refresh) purely so the button can gray itself out without
  // an extra request — the backend enforces the real 20-minute window
  // regardless, this is just to avoid a pointless round trip that would
  // just 429.
  const lastRefreshedAt = refresh.data?.last_refreshed_at ?? config?.last_refreshed_at ?? null;
  const cooldownRemainingMs = lastRefreshedAt
    ? REFRESH_COOLDOWN_MS - (now - new Date(lastRefreshedAt).getTime())
    : 0;
  const onCooldown = cooldownRemainingMs > 0;

  const mutedText = colorMode === "dark" ? "text-slate-400" : "text-slate-500";
  const borderClass = colorMode === "dark" ? "border-slate-700" : "border-slate-300";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || onCooldown}
          title={
            onCooldown
              ? `On cooldown — try again in ${Math.ceil(cooldownRemainingMs / 60000)}m`
              : "Refresh tier sim data from the source spreadsheet"
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium font-montserrat transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            colorMode === "dark"
              ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              : "border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refresh.isPending ? "animate-spin" : ""}`} />
          {refresh.isPending
            ? "Refreshing…"
            : onCooldown
              ? `Refresh (${Math.ceil(cooldownRemainingMs / 60000)}m)`
              : "Refresh"}
        </button>
        <button
          onClick={() => setShowSettings((s) => !s)}
          title="Tier sim data source"
          className={`p-1 rounded-lg border transition-colors ${
            colorMode === "dark"
              ? "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              : "border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSettings && (
        <div className={`flex flex-col gap-2 p-2.5 rounded-lg border ${borderClass}`}>
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <TriangleAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300 leading-snug">
              This isn't per-team — it points the tier sim data source for{" "}
              <span className="font-semibold">every team in the app</span> at
              a new spreadsheet, and refreshing writes those changes
              immediately. Only change this if you're sure it's the right
              sheet.
            </p>
          </div>
          <label className={`text-[11px] font-semibold ${mutedText}`}>
            Current tier sheet URL
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="Paste the Google Sheets tab URL…"
              className={`mt-1 w-full rounded border px-2 py-1 text-xs font-mono ${borderClass} ${
                colorMode === "dark" ? "bg-slate-900/70 text-slate-200" : "bg-white text-slate-800"
              }`}
            />
          </label>
          <label className={`text-[11px] font-semibold ${mutedText}`}>
            Transition sheet URL (blank if not applicable this season)
            <input
              type="text"
              value={transitionUrl}
              onChange={(e) => setTransitionUrl(e.target.value)}
              placeholder="Paste the Google Sheets tab URL…"
              className={`mt-1 w-full rounded border px-2 py-1 text-xs font-mono ${borderClass} ${
                colorMode === "dark" ? "bg-slate-900/70 text-slate-200" : "bg-white text-slate-800"
              }`}
            />
          </label>
          <button
            onClick={() =>
              updateConfig.mutate({
                current_tier_sheet_url: currentUrl,
                transition_sheet_url: transitionUrl,
              })
            }
            disabled={updateConfig.isPending || !currentUrl}
            className="self-start px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateConfig.isPending ? "Saving…" : "Save source"}
          </button>
          {updateConfig.isError && (
            <p className="text-[11px] text-rose-400">{updateConfig.error.message}</p>
          )}
        </div>
      )}

      {refresh.isError && (
        <p className="text-[11px] text-rose-400">
          {refresh.error instanceof TierSimRefreshError
            ? refresh.error.message
            : "Refresh failed."}
        </p>
      )}

      {refresh.isSuccess && (
        <RefreshResultSummary result={refresh.data} colorMode={colorMode} />
      )}
    </div>
  );
};

const RefreshResultSummary: FC<{
  result: NonNullable<ReturnType<typeof useRefreshTierSimData>["data"]>;
  colorMode: string;
}> = ({ result, colorMode }) => {
  const [expanded, setExpanded] = useState(false);
  const mutedText = colorMode === "dark" ? "text-slate-400" : "text-slate-500";
  const borderClass = colorMode === "dark" ? "border-slate-700" : "border-slate-300";

  if (result.changed.length === 0 && result.unmatched_sheet_rows.length === 0) {
    return <p className={`text-[11px] ${mutedText}`}>Up to date — no changes.</p>;
  }

  return (
    <div className={`flex flex-col gap-1.5 p-2 rounded-lg border ${borderClass}`}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {result.changed.length} row{result.changed.length === 1 ? "" : "s"} updated
      </button>
      {expanded && (
        <ul className="flex flex-col gap-2">
          {result.changed.map((c) => (
            <li key={c.label} className="text-[11px]">
              <span className="font-semibold text-slate-300">{c.label}</span>
              <ul className="pl-3 list-disc">
                {FIELD_LABELS.filter(
                  ({ key }) => !c.old || c.old[key] !== c.new[key],
                ).map(({ key, label }) => (
                  <li key={key} className={mutedText}>
                    {label}: {c.old ? formatVal(c.old[key]) : "—"} → {formatVal(c.new[key])}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {result.unmatched_sheet_rows.length > 0 && (
        <p className="text-[11px] text-amber-400">
          {result.unmatched_sheet_rows.length} sheet row
          {result.unmatched_sheet_rows.length === 1 ? "" : "s"} didn't match a known spec, ignored:{" "}
          {result.unmatched_sheet_rows.join(", ")}
        </p>
      )}
    </div>
  );
};
