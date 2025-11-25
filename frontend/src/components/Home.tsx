import { useUser } from "../hooks";
import { useState, type FC } from "react";
import { useSession } from "@descope/react-sdk";
import Login from "./Login";
import Layout from "./Layout";
import { OrderableContainer } from "./DnD/OrderableContainer";

export const Home: FC = () => {
  const user = useUser();
  const { isAuthenticated, isSessionLoading } = useSession();

  const [bosses, setBosses] = useState([
    {
      id: 1,
      name: "Gnarlroot",
      status: "killed",
      phases: [
        {
          id: 1,
          phaseNumber: 1,
          name: "Root Phase",
          isExpanded: true,
          isCurrent: false,
          hasNewNotes: false,
          posts: [],
        },
      ],
    },
    {
      id: 2,
      name: "Volcoross",
      status: "progressing",
      phases: [
        {
          id: 1,
          phaseNumber: 1,
          name: "Ground Phase",
          isExpanded: true,
          isCurrent: false,
          hasNewNotes: true,
          posts: [],
        },
        {
          id: 2,
          phaseNumber: 2,
          name: "Flight Phase",
          isExpanded: true,
          isCurrent: false,
          hasNewNotes: false,
          posts: [],
        },
        {
          id: 3,
          phaseNumber: 3,
          name: "First Overlaps",
          isExpanded: true,
          isCurrent: true,
          hasNewNotes: true,
          posts: [
            {
              id: 1,
              title: "Mythic Mechanics",
              cardType: "mechanic",
              content: [
                {
                  type: "text",
                  value:
                    'There are 8 stars that spawn at the beginning of the phase. If there are ever 6 people "in" a single star, it explodes and wipes the raid.',
                  bold: false,
                  color: "#ffffff",
                },
                {
                  type: "text",
                  value:
                    "Pay close attention to your angle and movement so you don't step into a star and wipe the raid",
                  bold: true,
                  color: "#f59e0b",
                },
                {
                  type: "text",
                  value:
                    "Just like Phase Two we will have to manage gravity circles, we'll play these with the tank grip.",
                  bold: false,
                  color: "#ffffff",
                },
              ],
            },
            {
              id: 2,
              title: "Rings",
              cardType: "positioning",
              content: [
                {
                  type: "text",
                  value:
                    "The same rings from Heroic but they hurt a lot more. I will call either left or right and we'll move that direction to the first ring and cross it as early as possible after it pops. We'll then continue moving the direction called to take the second ring. Finally, we'll step away from boss to allow maximum timing before getting hit by the third ring.",
                  bold: false,
                  color: "#ffffff",
                },
                {
                  type: "text",
                  value:
                    "⚠️ Getting hit by a ring with the debuff will just one tap you",
                  bold: true,
                  color: "#ef4444",
                },
                {
                  type: "text",
                  value:
                    "🛡️ The active tank will be eating 2 rings with the debuff, they will get an external to make living this easier",
                  bold: false,
                  color: "#10b981",
                },
              ],
            },
            {
              id: 3,
              title: "Devour Star Assignments",
              cardType: "assignment",
              content: [
                {
                  type: "text",
                  value:
                    "Everyone is assigned a specific star to hide under for Devour - we cannot have more than 5 people hide in a single star or we wipe.",
                  bold: true,
                  color: "#06b6d4",
                },
                {
                  type: "text",
                  value:
                    "@Uchai Will be positioning near the stars we want to use and ping himself with Attack Ping. He is the center of the four stars we'll use.",
                  bold: false,
                  color: "#ffffff",
                },
                {
                  type: "image",
                  url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
                  caption:
                    "Star positioning diagram - Uchai's left or clockwise are Star and Circle. To Uchai's right or counter-clockwise are Diamond and Triangle",
                },
                {
                  type: "text",
                  value:
                    "⚠️ When Devour is coming, look for his attack ping and position close to your assigned star. If you turbo fuck up and can't get to your star, don't enter any star in a panic, just die instead of potentially wiping the raid",
                  bold: true,
                  color: "#ef4444",
                },
              ],
            },
            {
              id: 4,
              title: "Gravity 1 in P3",
              cardType: "cooldown",
              content: [
                {
                  type: "text",
                  value:
                    "We always get gravity before the tank pull, and it resolves shortly after the grip occurs. The assignments for these are identical to the assignments from P2, both specific locations and which gravity to be in.",
                  bold: false,
                  color: "#ffffff",
                },
                {
                  type: "text",
                  value:
                    "After Supernova (right after Devour) everyone runs clockwise to the 2nd safe star and stacks there. You want to use natty movement abilities like blink, roll, disengage.",
                  bold: true,
                  color: "#f59e0b",
                },
                {
                  type: "text",
                  value:
                    "❌ Ranged Circle - Cheat left prior to the tank suck, the moment the suck happens, run directly against the pull effect",
                  bold: false,
                  color: "#ef4444",
                },
                {
                  type: "text",
                  value:
                    "✅ Melee Circle - Starts directly on top of the healer circle, the moment the suck happens, run directly with the pull effect",
                  bold: false,
                  color: "#10b981",
                },
                {
                  type: "text",
                  value:
                    "✅ Healer Circle - Stars directly on top of the melee circle, when the tank suck happens do not move",
                  bold: false,
                  color: "#10b981",
                },
                {
                  type: "text",
                  value:
                    "After the pull effect, the players with the big circles need to position close to boss and out of the way of rotating stars",
                  bold: true,
                  color: "#ffffff",
                },
              ],
            },
            {
              id: 5,
              title: "P3 - First Overlaps Raidplan",
              cardType: "media",
              content: [
                {
                  type: "text",
                  value:
                    "Attached a video going over the first segment in Phase 3",
                  bold: false,
                  color: "#ffffff",
                },
                {
                  type: "text",
                  value: "@Raider @Trial",
                  bold: false,
                  color: "#06b6d4",
                },
                {
                  type: "video",
                  url: "https://cdn.discordapp.com/attachments/1387087001383337986/1440188398538063992/P3_Dimmy_-_First_Overlaps.mp4",
                  caption: "P3 - First Overlaps Raidplan walkthrough",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
  const [selectedBoss, setSelectedBoss] = useState(bosses[1]);
  const [phases, setPhases] = useState(selectedBoss.phases);

  if (!isAuthenticated && !isSessionLoading) {
    return <Login />;
  }

  return (
    <Layout>
      <div className="w-full h-full flex flex-col items-center p-20">
        <div className="h-full w-5xl flex flex-col gap-5">
          <h1 className="">{selectedBoss.name}</h1>
          {/* {selectedBoss.phases?.map((item) => {
            return (
              <PhaseCard
                phaseNotes={item.posts}
                subtitle={`${item.posts.length} note${item.posts.length > 1 ? "s" : ""}`}
                key={item.id}
                title={item?.name}
                phaseNumber={item?.phaseNumber}
              />
            );
          })} */}
          <OrderableContainer items={phases} setItems={setPhases} />
        </div>
      </div>
    </Layout>
  );
};
