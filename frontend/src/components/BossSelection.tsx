import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FC,
} from "react";
import { createPortal, preload } from "react-dom";
import { ChevronDown, Check, Swords } from "lucide-react";
import { useCurrentExpansion } from "../api/queryHooks";
import { type Boss, type Raid } from "../types/api/expansion";
import { useTeam } from "../hooks";
import { useNavigate } from "react-router-dom";

const raidColors = [
  { accent: "from-cyan-400 to-blue-500",      text: "text-cyan-400/80"    },
  { accent: "from-purple-400 to-fuchsia-500", text: "text-purple-400/80"  },
  { accent: "from-emerald-400 to-teal-500",   text: "text-emerald-400/80" },
  { accent: "from-rose-400 to-pink-500",       text: "text-rose-400/80"    },
];

type BossDropdownProps = {
  raids: { raid: Raid; index: number }[];
  boss: Boss | null;
  setBoss: (b: Boss | null) => void;
};

const BossDropdown: FC<BossDropdownProps> = ({ raids, boss, setBoss }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 280) });
    }
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [isOpen, updatePos]);

  const handleSelect = (b: Boss) => {
    if (boss?.id === b.id) {
      setBoss(null);
      navigate("/prep", { replace: true });
    } else {
      setBoss(b);
      navigate(`/prep/${b.id}`, { replace: true });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { updatePos(); setIsOpen((o) => !o); }}
        className={`flex items-center gap-2.5 pl-2 pr-3 h-10 rounded-xl border font-montserrat
          backdrop-blur-xl transition-all duration-200 cursor-pointer
          ${boss
            ? "bg-slate-900/70 border-cyan-400/50 shadow-[0_0_18px_rgba(34,211,238,0.2)]"
            : "bg-slate-900/50 border-slate-700/60 hover:border-slate-600"
          }`}
      >
        {boss ? (
          <>
            <img
              src={boss.icon_img_url}
              className="w-6 h-6 rounded-md object-cover shrink-0"
            />
            <span className="text-sm font-semibold text-cyan-300 whitespace-nowrap">
              {boss.name}
            </span>
          </>
        ) : (
          <>
            <Swords className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-500 whitespace-nowrap">
              Select a boss
            </span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
            ${boss ? "text-cyan-400/60" : "text-slate-500"}`}
        />
      </button>

      {/* Panel */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          className="fixed z-50 rounded-xl border border-slate-700/60
            bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-950/60
            overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="overflow-y-auto max-h-[360px]">
            {raids.map(({ raid, index }, i) => {
              const colors = raidColors[index % raidColors.length];
              const sortedBosses = [...(raid.bosses ?? [])].sort((a, b) =>
                a.order < b.order ? -1 : 1,
              );
              return (
                <div key={raid.id}>
                  {/* Raid header */}
                  {i > 0 && <div className="mx-3 h-px bg-slate-800/80" />}
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                    <div
                      className={`w-[3px] h-3 rounded-full bg-linear-to-b shrink-0 ${colors.accent}`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-[0.12em] font-montserrat font-bold ${colors.text}`}
                    >
                      {raid.name}
                    </span>
                  </div>
                  {/* Boss rows */}
                  {sortedBosses.map((b) => {
                    const selected = b.id === boss?.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelect(b)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2
                          font-montserrat transition-all duration-100 cursor-pointer
                          ${selected
                            ? "bg-cyan-500/15 text-cyan-300"
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300"
                          }`}
                      >
                        <img
                          src={b.icon_img_url}
                          className="w-7 h-7 rounded-md object-cover shrink-0"
                        />
                        <span className="text-sm font-medium text-left flex-1 truncate">
                          {b.name}
                        </span>
                        {selected && (
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                  <div className="pb-1.5" />
                </div>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export const BossSelection: FC = () => {
  const { boss, setBoss } = useTeam();
  const { isLoading: isExpLoading, data: expData, error: expError } =
    useCurrentExpansion();

  console.log(isExpLoading, expError);

  useEffect(() => {
    expData?.forEach((exp) => {
      exp?.seasons?.forEach((s) => {
        s?.raids?.forEach((r) => {
          r?.bosses?.forEach((b) => {
            if (b?.splash_img_url) preload(b.splash_img_url, { as: "image" });
          });
        });
      });
    });
  }, [expData]);

  const raids =
    expData
      ?.flatMap((exp) =>
        exp?.seasons?.flatMap((s) =>
          s?.raids?.map((raid, i) => ({ raid, index: i })) ?? [],
        ) ?? [],
      )
      ?.sort((a, b) => a.raid.order - b.raid.order) ?? [];

  return (
    <div className="sticky top-5 z-10">
      <BossDropdown raids={raids} boss={boss} setBoss={setBoss} />
    </div>
  );
};
