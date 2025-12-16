import {
  useRef,
  useState,
  type FC,
  type DragEvent,
  useEffect,
  act,
  createRef,
  type RefObject,
  useCallback,
} from "react";
import { Stage, Layer } from "react-konva";
import { Square, Circle as CircleIcon, Plus, X } from "lucide-react";
import { Stage as StageType } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { Reactangle } from "./Planner/Rectangle";
import { Circle } from "./Planner/Circle";
import { Triangle } from "./Planner/Triangle";
import { RightTriangle } from "./Planner/RightTriangle";
import { Image } from "./Planner/Image";
import { Toolbar, type AllowedShapes } from "./Planner/Toolbar";
import Dropdown from "./Dropdown";
import { Card } from "./Card";
import { useTheme } from "../hooks";
import { PlanTab } from "./Planner/PlanTab";
import { backgrounds } from "../data/raids";

export type Shape = {
  type: AllowedShapes;
  x: number;
  y: number;
  id: string;
  scaleX: number;
  scaleY: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  width: number;
  rotation: number;
  fill: string;
  src?: string | null;
  opacity: number;
};

type Tab = {
  id: string;
  shapes: Shape[];
  backgroundSrc: string;
  ref: RefObject<StageType | null>;
  raidIndex: number;
  bossIndex: number;
  backgroundIndex: number;
};

const defaultTab: Tab = {
  shapes: [],
  id: "1",
  backgroundSrc: "./midnight/dreamrift/chimaerus/platform.png",
  ref: createRef<StageType | null>(),
  raidIndex: 0,
  bossIndex: 0,
  backgroundIndex: 0,
};

const Plan: FC = () => {
  const [dragEl, setDragEl] = useState<AllowedShapes | null>(null);
  const [dragSrc, setDragSrc] = useState<string | null | undefined>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([defaultTab]);
  const [activeTab, setActiveTab] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [groupKey, setGroupKey] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const stageRef = useRef<StageType>(null);

  const handleToolbarShapeDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stageRef = tabs[activeTab].ref;
    if (!stageRef.current || !dragEl) return;
    const stage = stageRef.current;
    stage?.setPointersPositions(e);
    const position = stage.getPointerPosition();
    const copyTabs = [...tabs];
    copyTabs[activeTab].shapes = [
      ...copyTabs[activeTab].shapes,
      {
        type: dragEl,
        x: position?.x as number,
        y: position?.y as number,
        id: Date.now().toString(),
        scaleX: 1,
        scaleY: 1,
        stroke: "white",
        strokeWidth: 0,
        height: 40,
        width: 40,
        fill: "white",
        rotation: 0,
        src: dragSrc,
        opacity: 0.7,
      },
    ];

    setTabs(copyTabs);
  };

  const handleChange = (changes: Shape) => {
    // Handles changes movement and transform of all single selected shapes and icons
    const copyTabs = [...tabs];
    const nonSelectedShapes = copyTabs[activeTab].shapes.filter(
      (shape) => shape.id != selectedId,
    );
    copyTabs[activeTab].shapes = [...nonSelectedShapes, changes];
    setTabs(copyTabs);
  };

  const handleGroupTransform = (ids: string[], groupNode: Konva.Group) => {
    if (!groupNode) return;

    const transform = groupNode.getAbsoluteTransform();
    const copyTabs = [...tabs];

    // Get the group's current position, rotation, and scale
    // const groupPos = groupNode.position();
    // const groupRotation = groupNode.rotation();
    // const groupScale = { x: groupNode.scaleX(), y: groupNode.scaleY() };

    copyTabs[activeTab].shapes = copyTabs[activeTab].shapes.map((shape) => {
      if (!ids.includes(shape.id)) return shape;

      // Apply group transform to shape position
      const pos = transform.point({ x: shape.x, y: shape.y });
      const decomposed = transform.decompose();

      return {
        ...shape,
        x: pos.x,
        y: pos.y,
        scaleX: shape.scaleX * decomposed.scaleX,
        scaleY: shape.scaleY * decomposed.scaleY,
        rotation: shape.rotation + decomposed.rotation,
      };
    });

    // Reset group transform BEFORE updating state
    groupNode.position({ x: 0, y: 0 });
    groupNode.rotation(0);
    groupNode.scaleX(1);
    groupNode.scaleY(1);
    setTabs(copyTabs);
  };

  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    if (e.target === stageRef.current) {
      const stage = stageRef.current;
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        setContextMenu({
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
    }
  };

  const handleAddShape = (type: AllowedShapes) => {
    if (!contextMenu) return;
    setShapes([
      ...shapes,
      {
        type,
        x: contextMenu.x,
        y: contextMenu.y,
        id: Date.now().toString(),
        scaleX: 1,
        scaleY: 1,
        strokeWidth: 0,
        stroke: "",
        height: 40,
        width: 40,
        fill: "white",
        rotation: 0,
        opacity: 0.7,
      },
    ]);
    setContextMenu(null);
  };

  const handleBossChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      return;
    }
    const [raidIndex, bossIndex] = value.split("-").map(Number);
    const newBoss = backgrounds[raidIndex].bosses[bossIndex];

    // Update all tabs to use the same boss, but preserve or reset backgroundIndex
    const copyTabs = tabs.map((tab) => {
      // Keep the current backgroundIndex if the new boss has that many backgrounds,
      // otherwise reset to 0
      const backgroundIndex =
        tab.backgroundIndex < newBoss.backgrounds.length
          ? tab.backgroundIndex
          : 0;

      return {
        ...tab,
        raidIndex,
        bossIndex,
        backgroundIndex,
        backgroundSrc: newBoss.backgrounds[backgroundIndex].src,
      };
    });

    setTabs(copyTabs);
  };

  const getCurrentBoss = () => {
    const currentTab = tabs[activeTab];
    if (!currentTab) return null;
    return backgrounds[currentTab.raidIndex]?.bosses[currentTab.bossIndex];
  };

  const handleAddTab = () => {
    const currentTab = tabs[activeTab];
    const { raidIndex, bossIndex } = currentTab;
    const newTab: Tab = {
      id: Date.now().toString(),
      shapes: [],
      backgroundSrc:
        backgrounds[raidIndex].bosses[bossIndex].backgrounds[0].src,
      ref: createRef<StageType>(),
      raidIndex,
      bossIndex,
      backgroundIndex: 0,
    };
    const newTabs = tabs ? [...tabs, newTab] : [newTab];
    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
  };

  const handleRemoveTab = (index: number) => {
    if (!tabs || tabs.length <= 1) return;
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    setActiveTab(Math.max(0, Math.min(activeTab, newTabs.length - 1)));
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleBackgroundChange = (n: number) => {
    const currentTab = tabs[activeTab];
    if (!currentTab) return;
    const { raidIndex, bossIndex } = currentTab;
    const copyTabs = [...tabs];
    copyTabs[activeTab] = {
      ...copyTabs[activeTab],
      backgroundSrc:
        backgrounds[raidIndex].bosses[bossIndex].backgrounds[n].src,
      backgroundIndex: n,
    };
    setTabs(copyTabs);
  };

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    const handleShiftPress = (e: KeyboardEvent) => {
      if (e.key == "Shift") {
        if (e.type == "keyup") {
          if (shiftPressed) {
            setShiftPressed(false);
          }
        }
        if (e.type == "keydown") {
          if (!shiftPressed) {
            setShiftPressed(true);
          }
        }
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleShiftPress);
    window.addEventListener("keyup", handleShiftPress);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleShiftPress);
      window.removeEventListener("keyup", handleShiftPress);
    };
  }, [shiftPressed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        if (selectedId || selectedIds.length > 0) {
          setTabs((prevTabs) => {
            const copyTabs = [...prevTabs];
            const nonSelectedShapes = copyTabs[activeTab].shapes.filter(
              (s) => s.id !== selectedId && !selectedIds.includes(s.id),
            );
            copyTabs[activeTab].shapes = nonSelectedShapes;
            return copyTabs;
          });
          setSelectedId(null);
          setSelectedIds([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, selectedIds, activeTab]);

  const currentBoss = getCurrentBoss();
  const { colorMode } = useTheme();

  // Prepare options for background dropdown
  const backgroundOptions = currentBoss
    ? currentBoss.backgrounds.map((bg, index) => ({
        value: index.toString(),
        label: bg.name,
      }))
    : [];

  const handleShapeClick = useCallback(
    (id: string) => {
      if (shiftPressed) {
        // If we have a single selection, start multi-select with it
        const currentSelection =
          selectedId && !selectedIds.includes(selectedId)
            ? [...selectedIds, selectedId]
            : [...selectedIds];

        // Toggle the id in selectedIds
        if (currentSelection.includes(id)) {
          // Remove from selection
          setSelectedIds(
            currentSelection.filter((selectedId) => selectedId !== id),
          );
        } else {
          // Add to selection
          setSelectedIds([...currentSelection, id]);
        }
        // Clear single selection when in multi-select mode
        setSelectedId(null);
      } else {
        // Single selection - clear multi-select
        setSelectedId(id);
        setSelectedIds([]);
      }
    },
    [shiftPressed, selectedIds, selectedId],
  );

  return (
    <div className="flex justify-center items-start min-h-screen p-8">
      <Card variant="elevated" hover={false}>
        <div className="flex flex-col pl-4 ">
          {/* Top Controls Row */}
          <div className="flex flex-row gap-4 flex-wrap">
            <div className="flex flex-col gap-2 min-w-[250px]">
              <label
                htmlFor="plan-name"
                className={`text-sm font-semibold ${
                  colorMode === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Plan Name:
              </label>
              <input
                id="plan-name"
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name..."
                className={`
                  px-4 py-2.5 min-h-[42px] text-sm
                  border rounded-xl font-medium
                  transition-all duration-200
                  ${
                    colorMode === "dark"
                      ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-50 placeholder-slate-500 hover:bg-slate-900/70 hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                      : "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                  }
                `}
              />
            </div>

            <div className="flex flex-col gap-2 min-w-[250px]">
              <label
                htmlFor="boss-select"
                className={`text-sm font-semibold ${
                  colorMode === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Select Boss:
              </label>
              <select
                id="boss-select"
                className={`
                  px-4 py-2.5 min-h-[42px] text-sm
                  border rounded-xl font-medium
                  transition-all duration-200
                  cursor-pointer
                  ${
                    colorMode === "dark"
                      ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-50 hover:bg-slate-900/70 hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      : "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 hover:bg-white hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  }
                `}
                onChange={handleBossChange}
                value={
                  tabs[activeTab]
                    ? `${tabs[activeTab].raidIndex}-${tabs[activeTab].bossIndex}`
                    : ""
                }
              >
                <option value="">-- Select a Boss --</option>
                {backgrounds.map((raid, raidIndex) => (
                  <optgroup key={raidIndex} label={raid.raidName}>
                    {raid.bosses.map((boss, bossIndex) => (
                      <option
                        key={bossIndex}
                        value={`${raidIndex}-${bossIndex}`}
                      >
                        {boss.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 min-w-[200px]">
              <Dropdown
                label="Select Map:"
                options={backgroundOptions}
                value={tabs[activeTab]?.backgroundIndex.toString() ?? "0"}
                onChange={(value) => handleBackgroundChange(value)}
                placeholder="Choose a map..."
                variant="default"
                size="md"
                disabled={!currentBoss || currentBoss.backgrounds.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-2 pl-4">
          <label
            className={`text-sm font-semibold ${
              colorMode === "dark" ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Slides:
          </label>
          <div className="flex flex-row w-full gap-2 items-center flex-wrap">
            {tabs &&
              tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl
                    border transition-all duration-200 cursor-pointer
                    ${
                      activeTab === index
                        ? colorMode === "dark"
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "bg-cyan-50 border-cyan-500 text-cyan-700"
                        : colorMode === "dark"
                          ? "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900/70 hover:border-slate-700"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                    }
                  `}
                  onClick={() => handleTabClick(index)}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
              ))}
            <button
              onClick={handleAddTab}
              className={`
                  flex items-center justify-center p-2 rounded-xl
                  border transition-all duration-200
                  ${
                    colorMode === "dark"
                      ? "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900/70 hover:border-slate-700"
                      : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                  }
                `}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-row justify-center mt-2">
          <div className="flex flex-col gap-2">
            <Toolbar setDragEl={setDragEl} setDragSrc={setDragSrc} />
          </div>
          <div
            className="relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleToolbarShapeDrop}
          >
            {tabs?.map((tab, i) => {
              return (
                <PlanTab
                  key={tab.id}
                  ref={tab.ref}
                  isActive={i === activeTab}
                  backgroundSrc={tab.backgroundSrc}
                  selectedId={selectedId}
                  selectedIds={selectedIds}
                  groupKey={groupKey}
                  setSelectedId={handleShapeClick}
                  setSelectedIds={setSelectedIds}
                  shapes={tab?.shapes}
                  handleChange={handleChange}
                  onGroupTransform={handleGroupTransform}
                  handleContextMenu={handleContextMenu}
                />
              );
            })}
            {contextMenu && (
              <div
                className="absolute bg-white border border-gray-300 rounded shadow-lg z-50"
                style={{
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`,
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAddShape("rect")}
                  >
                    <Square size={16} />
                    Add Rectangle
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAddShape("circle")}
                  >
                    <CircleIcon size={16} />
                    Add Circle
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="w-50 pl-4 flex flex-col gap-4">
            {/* Properties Panel */}
            <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700 p-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1 mb-2">
                Properties
              </h3>
              {/* Properties content will go here */}
            </div>

            {/* Encounter Icons */}
            <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700 p-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1 mb-2">
                Encounter Icons
              </h3>
              {/* Encounter icons content will go here */}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Plan;
