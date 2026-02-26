import { createRef, useEffect, useState, type FC } from "react";
import { RotateCw } from "lucide-react";
import Planner, { type Tab } from "../Planner/Planner";
import { v4 as uuid } from "uuid";
import { useLocation } from "react-router-dom";
import {
  useRaidData,
  useUser,
  useRecentlyViewedPlans,
  useDocumentTitle,
  type RecentPlans,
  type PlanShallow,
} from "../../hooks";
import { Stage as StageType } from "konva/lib/Stage";
import { getIdFromPathname } from "../../utils/idUtils";
import { useGetRaidplanById } from "../../api/queryHooks";

const Plan: FC = () => {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth && window.innerWidth < 1024,
  );

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const handler = () =>
      setIsPortrait(mq.matches && window.innerWidth < 1024);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const location = useLocation();
  const raidData = useRaidData(location.pathname);
  const { isLoading: isUserLoading, user } = useUser();
  const { id, status } = getIdFromPathname(location.pathname);
  const { data, isLoading, refetch } = useGetRaidplanById(id, id == "");
  useDocumentTitle("Planner", raidData[0].raidName);
  const getMode = () => {
    if (!id) {
      return "create";
    }
    if (status === "edit") {
      return "edit";
    }
    if (status === "share") {
      return "view";
    }
  };

  const recentlyViewedPlans = useRecentlyViewedPlans(user);

  const persistViewedPlan = () => {
    if (isUserLoading) return;
    if (isLoading && !data) return;
    console.log("here");
    const authedLSKey = user
      ? `user_${user.btag}_recent_plans`
      : "user_null_recent_plans";
    if (user && data) {
      if (Object.keys(recentlyViewedPlans).length === 0) {
        const plans: RecentPlans = {
          user_tag: user.btag,
          plans: [
            {
              id: data?.id,
              share_id: data?.share_id,
              name: data?.name,
              boss: data?.boss,
              raid: data?.raid,
              tabCount: data?.content?.length,
              created_at: data?.created_at,
              updated_at: data?.updated_at,
              sequence: data?.sequence,
            },
          ],
        };
        localStorage.setItem(authedLSKey, JSON.stringify(plans));
      } else {
        const idInRv = recentlyViewedPlans.plans.find((p) => p.id === data?.id);
        if (!idInRv) {
          if (recentlyViewedPlans.plans.length === 10) {
            recentlyViewedPlans.plans.shift();
          }
          recentlyViewedPlans.plans.push({
            id: data?.id,
            share_id: data?.share_id,
            name: data?.name,
            boss: data?.boss,
            raid: data?.raid,
            tabCount: data?.content?.length,
            created_at: data?.created_at,
            updated_at: data?.updated_at,
            sequence: data?.sequence,
          } as PlanShallow);
          localStorage.setItem(
            authedLSKey,
            JSON.stringify(recentlyViewedPlans),
          );
          return;
        }
      }
    }
  };

  if (status === "share") {
    persistViewedPlan();
  }

  const [tabs, setTabs] = useState<Tab[]>([
    {
      shapes: [],
      id: uuid(),
      backgroundSrc: raidData[0].bosses[0].backgrounds[0].src,
      ref: createRef<StageType | null>(),
      boss: raidData[0].bosses[0].name,
      raidIndex: 0,
      bossIndex: 0,
      backgroundIndex: 0,
    },
  ]);
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  useEffect(() => {
    if (id && !isLoading && data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTabs(data?.content);
    }
  }, [data, id, isLoading]);

  if (isPortrait) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
        <RotateCw className="w-14 h-14 text-cyan-400" />
        <div>
          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            Rotate your device
          </h2>
          <p className="text-slate-400 text-sm font-montserrat">
            The Raid Planner requires landscape mode
          </p>
        </div>
      </div>
    );
  }

  return (
    <Planner
      tabs={tabs}
      name={data?.name}
      setTabs={setTabs}
      raidData={raidData}
      mode={getMode()}
      id={data?.id}
    />
  );
};

export default Plan;
