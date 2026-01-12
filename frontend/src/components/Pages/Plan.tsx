import { createRef, useEffect, useState, type FC } from "react";
import Planner, { type Tab } from "../Planner/Planner";
import { useLocation } from "react-router-dom";
import {
  useRaidData,
  useUser,
  useRecentlyViewedPlans,
  type RecentPlans,
  type PlanShallow,
} from "../../hooks";
import { Stage as StageType } from "konva/lib/Stage";
import { getIdFromPathname } from "../../utils/idUtils";
import { useGetRaidplanById, type User } from "../../api/queryHooks";

const Plan: FC = () => {
  const location = useLocation();
  const raidData = useRaidData(location.pathname);
  const { isLoading: isUserLoading, user } = useUser();
  const { id, status } = getIdFromPathname(location.pathname);
  const { data, isLoading, error, refetch } = useGetRaidplanById(id, id == "");
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
      id: "1",
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
      setTabs(data?.content);
    }
  }, [data]);

  return (
    <Planner
      tabs={tabs}
      setTabs={setTabs}
      raidData={raidData}
      mode={getMode()}
      id={data?.id}
    />
  );
};

export default Plan;
