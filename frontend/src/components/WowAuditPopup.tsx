import type { FC } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { useTeam } from "../hooks";

const DISABLED_STATE = {
  disabled: true,
  message:
    "Raidbots and WoWAudit are not yet updated for Midnight. When they are, this feature will be enabled.",
};

export const WowAuditPopup: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const { team } = useTeam();

  if (!team?.team?.wowaudit_integration) return null;

  const configs = team.team.wishlist_configs ?? [];
  const effectiveConfigId = selectedConfigId ?? configs[0]?.id ?? null;
  console.log("team", team);

  const handleSubmit = () => {
    // Stub — wire up to upload endpoint when available
    // effectiveConfigId holds the selected wishlist config id
    setErrors([]);
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
              Upload Droptimizer to WowAudit
            </h3>
            <p className="text-xs text-slate-400 font-montserrat">
              {team.team.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          {DISABLED_STATE.disabled && (
            <p className="text-xs text-amber-400/90 font-montserrat">
              {DISABLED_STATE.message}
            </p>
          )}
          {configs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {configs.map((cfg) => (
                <button
                  key={cfg.id}
                  type="button"
                  disabled={DISABLED_STATE.disabled}
                  onClick={() => setSelectedConfigId(cfg.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold font-montserrat transition
                    ${DISABLED_STATE.disabled
                      ? "bg-slate-700/40 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                      : effectiveConfigId === cfg.id
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
          <input
            type="text"
            disabled={DISABLED_STATE.disabled}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste Droptimizer URL..."
            className={`
              w-full bg-slate-800/80 border border-slate-600 rounded-lg
              px-3 py-2 text-sm placeholder:text-slate-500
              transition
              ${DISABLED_STATE.disabled
                ? "text-slate-500 cursor-not-allowed opacity-50"
                : "text-white focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30"
              }
            `}
          />
          {errors.length > 0 && (
            <div className="bg-rose-900/30 border border-rose-500/40 rounded-lg p-3 flex flex-col gap-1">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-rose-300">
                  {err}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={DISABLED_STATE.disabled}
            className={`
              w-full text-white text-sm font-semibold rounded-lg
              px-4 py-2 transition
              ${DISABLED_STATE.disabled
                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500"
              }
            `}
          >
            Upload
          </button>
        </div>
      ) : (
        <></>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close" : "Upload Droptimizer to WowAudit"}
        className={`
          flex items-center gap-2 rounded-xl transition-all duration-200
          ${
            isOpen
              ? "p-3 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-semibold"
              : "p-3 bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60"
          }
        `}
      >
        {isOpen ? (
          <>
            <X className="w-9 h-9" />
          </>
        ) : (
          <img
            src="https://c10.patreonusercontent.com/4/patreon-media/p/campaign/755238/5eacc9137c934113bfc94d735ffde8ac/eyJoIjozNjAsInciOjM2MH0%3D/2.png?token-hash=rlSTP0vHqNnabZ5owSM7QVIx-4-Dp7Pnwe_rd68Wk_U%3D&token-time=1772928000"
            alt="WowAudit"
            className="w-9 h-9"
          />
        )}
      </button>
    </div>
  );
};
