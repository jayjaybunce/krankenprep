import {
  useEffect,
  useState,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";
import { useCurrentExpansion } from "../api/queryHooks";
import { preload } from "react-dom";
import { type Boss, type Raid } from "../types/api/expansion";
import type { DropdownOption } from "./form/Dropdown";
import { useTeam } from "../hooks";
import { useNavigate } from "react-router-dom";

type BossButtonProps = {
  selected: boolean;
  boss: Boss;
  setBoss: Dispatch<SetStateAction<Boss | null>>;
};

const BossButton: FC<BossButtonProps> = ({ boss: b, selected, setBoss }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        if (selected) {
          setBoss(null);
          navigate("/prep", { replace: true });
        } else {
          setBoss(b);
          navigate(`/prep/${b.id}`, { replace: true });
        }
      }}
      className={`flex h-8 overflow-hidden rounded-lg bg-gradient-to-r
                                      ${selected ? "from-cyan-900/60 to-blue-900/60" : "from-slate-800/80 to-slate-700/80"}
                                      hover:from-cyan-900/60 hover:to-blue-900/60 border
                                      ${selected ? "border-cyan-400/40" : "border-cyan-500/20"}
                                      hover:border-cyan-400/40 shadow-lg
                                      ${selected ? "shadow-cyan-500/20" : "shadow-slate-900/40"}
                                      hover:shadow-cyan-500/20 backdrop-blur-sm
                                      transition-all duration-200 ${selected ? "scale-[1.02]" : ""}
                                      hover:scale-[1.02] cursor-pointer group`}
    >
      <img className="w-auto h-full object-cover" src={b.icon_img_url} />
      <div
        className={`flex font-montserrat items-center w-full truncate px-3 font-semibold text-sm ${selected ? "text-cyan-300" : "text-slate-200"} group-hover:text-cyan-300`}
      >
        {b.name}
      </div>
    </button>
  );
};

export const BossSelection: FC = () => {
  const [raid] = useState<Raid | null>(() => {
    const stored = localStorage.getItem("kp_selected_expansion");
    return stored ? JSON.parse(stored) : null;
  });
  const {
    isLoading: isExpLoading,
    data: expData,
    error: expError,
  } = useCurrentExpansion();

  console.log(isExpLoading, expError);

  useEffect(() => {
    // Preload all boss splash images ezpz lol
    expData?.forEach((exp) => {
      exp?.seasons?.forEach((s) => {
        s?.raids?.forEach((r) => {
          r?.bosses?.forEach((b) => {
            if (b?.splash_img_url) {
              preload(b.splash_img_url, { as: "image" });
            }
          });
        });
      });
    });
  }, [expData]);

  const raidOptions: DropdownOption<Raid>[] = [];
  expData?.forEach((exp) => {
    exp?.seasons?.forEach((s) => {
      s.raids?.forEach((r) => raidOptions.push({ value: r, label: r?.name }));
    });
  });

  useEffect(() => {
    localStorage.setItem("kp_selected_expansion", JSON.stringify(raid));
  }, [raid]);

  return (
    <div className="flex flex-row w-full gap-2 items-center sticky top-5 z-10">
      {/* <div className="w-60"> */}
      {/* <Dropdown<Raid>
          size="sm"
          value={raid}
          onChange={(value) => {
            // Handle the generic dropdown type (supports arrays) but we only use single selection
            if (typeof value === "function") {
              // If it's a function, we need to call it with the current state
              setRaid((prev) => {
                const newValue = value(prev);
                if (Array.isArray(newValue)) {
                  return newValue[0] ?? null;
                }
                return newValue;
              });
            } else if (Array.isArray(value)) {
              setRaid(value[0] ?? null);
            } else {
              setRaid(value);
            }
          }}
          valueComparator={(a, b) => a.id === b.id}
          getOptionKey={(option) => option.value.id}
          options={raidOptions}
        /> */}
      {/* </div> */}
      <div className="flex flex-row gap-1.5">
        {expData?.map((exp) => {
          return exp?.seasons?.map((seasons) => {
            return seasons?.raids
              ?.sort((a, b) => (a.order > b.order ? 1 : -1))
              .map((raid, i) => {
                return <RaidDisplay raid={raid} index={i} />;
              });
          });
        })}
      </div>
      {/* {temp?.map((b) => {
        return (
          <BossButton boss={b} selected={b.id === boss?.id} setBoss={setBoss} />
        );
      })} */}
    </div>
  );
};

const dividerStyles = [
  "from-cyan-400/80 to-blue-500/60 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
  "from-purple-400/80 to-fuchsia-500/60 shadow-[0_0_8px_rgba(192,132,252,0.4)]",
  "from-emerald-400/80 to-teal-500/60 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  "from-rose-400/80 to-pink-500/60 shadow-[0_0_8px_rgba(251,113,133,0.4)]",
];

type RaidDisplayProps = {
  raid: Raid;
  index: number;
};

const RaidDisplay: FC<RaidDisplayProps> = ({ raid, index }) => {
  const { setBoss, boss } = useTeam();
  const dividerStyle = dividerStyles[index % dividerStyles.length];
  const sortedBosses = raid?.bosses?.sort((a, b) =>
    a?.order < b?.order ? -1 : 1,
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="font-montserrat font-bold text-2xl text-white flex-1">
          <h3 className="w-max">{raid.name}</h3>
        </div>
        <div
          className={`w-full h-px bg-gradient-to-r ${dividerStyle} backdrop-blur-sm rounded-full`}
        />
      </div>

      <div className="flex flex-row gap-1.5">
        {sortedBosses?.map((b) => (
          <BossButton
            boss={b}
            setBoss={setBoss}
            selected={b?.id === boss?.id}
          />
        ))}
      </div>
    </div>
  );
};
