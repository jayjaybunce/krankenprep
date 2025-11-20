import type { FC, PropsWithChildren } from "react";
import Header from "./Header";
import Button from "./Button";
import SidebarItem from "./SidebarItem";
import { Sun, Moon, Settings, Target } from "lucide-react";
import { useTheme } from "../hooks";
import { useState } from "react";

interface ContentBlock {
  type: "text" | "image" | "video";
  value: string;
  caption?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean;
  color?: string;
}

interface Post {
  id: number;
  title: string;
  cardType:
    | "assignment"
    | "warning"
    | "cooldown"
    | "positioning"
    | "mechanic"
    | "media"
    | "general";
  content: ContentBlock[];
  linkedGameId?: number;
}

interface Phase {
  id: number;
  phaseNumber: number;
  name: string;
  isExpanded: boolean;
  isCurrent: boolean;
  hasNewNotes: boolean;
  posts: Post[];
}

interface Boss {
  id: number;
  name: string;
  status: "killed" | "progressing";
  phases: Phase[];
}

const Layout: FC<PropsWithChildren> = ({ children }) => {
  // Layout component thats rendered with every Secure Route
  const { colorMode, toggleColorMode } = useTheme();

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [bosses] = useState<Boss[]>([
    {
      id: 2,
      name: "Volcoross",
      status: "progressing",
      phases: [
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
                  value: "There are 8 stars that spawn. Practice movement!",
                  bold: false,
                  color: "#ffffff",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return (
    <div className="flex h-screen">
      <div
        className={`w-72 bg-gray-900 dark:bg-black border-gray-200 dark:border-neutral-900 border-r flex flex-col`}
      >
        <Header
          title="Raid Prep"
          subtitle="Boss Strategies"
          actions={
            <button
              onClick={() => toggleColorMode()}
              className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition"
            >
              {colorMode === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-400" />
              )}
            </button>
          }
        />

        <div className="p-5 border-b border-neutral-900">
          <Button
            variant={isAdmin ? "primary" : "secondary"}
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setIsAdmin(!isAdmin)}
            className="w-full"
          >
            {isAdmin ? "Admin: ON" : "Admin: OFF"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-500" />
            <h2
              className={`text-xs uppercase text-gray-500 dark:text-neutral-500 font-semibold`}
            >
              Progression
            </h2>
          </div>
          {bosses.map((boss) => (
            <SidebarItem
              key={boss.id}
              isActive={selectedBoss?.id === boss.id}
              onClick={() => setSelectedBoss(boss)}
              icon={<div />}
            >
              {boss.name}
            </SidebarItem>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto dark:bg-neutral-950 bg-gray-200">
        {children}
      </div>
    </div>
  );
};

export default Layout;
