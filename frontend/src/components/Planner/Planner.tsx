import {
  useRef,
  useState,
  type FC,
  type DragEvent,
  useEffect,
  createRef,
  type RefObject,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Square, Circle as CircleIcon, Plus } from "lucide-react";
import { Stage as StageType } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { Toolbar, type AllowedShapes } from "./Toolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import Dropdown from "../Dropdown";
import { Card } from "../Card";
import { useRaidData, useTheme, useUser } from "../../hooks";
import { PlanTab } from "./PlanTab";
import { useCreateRaidplan, useUpdateRaidplan } from "../../api/mutationHooks";
import { useLocation, useNavigate } from "react-router-dom";
import { getIdFromPathname } from "../../utils/idUtils";
import { useGetRaidplanById } from "../../api/queryHooks";
import type { RaidData } from "../../data/raids";
// import { raidData } from "../../data/raids";

export type Shape = {
  type: AllowedShapes;
  x: number;
  y: number;
  id: string;
  scaleX: number;
  scaleY: number;
  height?: number;
  stroke: string;
  strokeWidth: number;
  width?: number;
  rotation: number;
  fill: string;
  src?: string | null;
  opacity: number;
  radiusX?: number;
  radiusY?: number;
  points?: number[]; // For line drawing
  text?: string; // For text elements
  fontSize?: number; // For text elements
  fontFamily?: string; // For text elements
  locked?: boolean; // For locking shapes
};

export type Tab = {
  id: string;
  shapes: Shape[];
  backgroundSrc: string;
  ref: RefObject<StageType | null>;
  raidIndex: number;
  bossIndex: number;
  backgroundIndex: number;
  boss: string;
};

type PlannerProps = {
  tabs: Tab[];
  setTabs: Dispatch<SetStateAction<Tab[]>>;
  raidData: RaidData;
  mode?: "edit" | "view" | "create";
  id?: number | undefined;
  minimode?: boolean;
};

const Planner: FC<PlannerProps> = ({ tabs, setTabs, raidData, mode, id }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dragEl, setDragEl] = useState<AllowedShapes | null>(null);
  const [dragSrc, setDragSrc] = useState<string | null | undefined>(null);
  const [isNpcDrag, setIsNpcDrag] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [raid, setRaid] = useState<string | null>(raidData[0].raidName);

  const [activeTab, setActiveTab] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [groupKey, setGroupKey] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    shapeId?: string;
  } | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState("white");
  const [drawingThickness, setDrawingThickness] = useState(2);
  const stageRef = useRef<StageType>(null);
  const user = useUser();

  const { mutate: createRaidplan } = useCreateRaidplan();
  const { mutate: updateRaidPlan } = useUpdateRaidplan(id);

  const isViewing = mode === "view";

  // const isEditing = status === "edit";

  // useEffect(() => {
  //   setTabs(data?.content);
  // }, [data]);

  const handleSave = () => {
    if (mode === "create") {
      createRaidplan(
        {
          boss: tabs[0].boss,
          name: planName,
          user_id: user?.user?.id,
          content: tabs,
          sequence: location.pathname,
          raid: raid ?? "",
        },
        {
          onSuccess: (res) => {
            navigate(location.pathname + `/${res.edit_id}`, {
              flushSync: true,
            });
          },
        },
      );
    }
    if (mode === "edit") {
      console.log("Attempting update");
      updateRaidPlan({
        boss: tabs[0].boss,
        name: planName,
        user_id: user?.user?.id,
        content: tabs,
        raidplan_id: id,
        raid: raid ?? "",
      });
    }
  };

  const handleToolbarShapeDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stageRef = tabs[activeTab].ref;
    if (!stageRef.current || !dragEl) return;
    const stage = stageRef.current;
    stage?.setPointersPositions(e);
    const position = stage.getPointerPosition();
    const copyTabs = [...tabs];

    // Only shapes get 0.7 opacity, images get full opacity (1.0)
    const isShape =
      dragEl === "rect" ||
      dragEl === "circle" ||
      dragEl === "triangle" ||
      dragEl === "right triangle";

    // NPC icons should be twice as large (80x80 instead of 40x40)
    // Use the isNpcDrag flag set when dragging from the NPC icons section
    const iconSize = isNpcDrag ? 80 : 40;

    if (dragEl === "text") {
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
          fill: "white",
          rotation: 0,
          opacity: 1,
          text: "Text",
          fontSize: 24,
          fontFamily: "Arial",
        },
      ];

      setTabs(copyTabs);
      return;
    }

    if (dragEl === "circle") {
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
          radiusX: 20,
          radiusY: 20,
          fill: "white",
          rotation: 0,
          src: dragSrc,
          opacity: isShape ? 0.7 : 1.0,
        },
      ];

      setTabs(copyTabs);
      return;
    }

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
        height: iconSize,
        width: iconSize,
        fill: "white",
        rotation: 0,
        src: dragSrc,
        opacity: isShape ? 0.7 : 1.0,
      },
    ];

    setTabs(copyTabs);
  };

  const handleChange = (changes: Shape) => {
    // Handles changes movement and transform of all single selected shapes and icons
    console.log(changes);
    console.log(tabs);
    const copyTabs = [...tabs];
    const nonSelectedShapes = copyTabs[activeTab].shapes.filter(
      (shape) => shape.id != selectedId,
    );
    copyTabs[activeTab].shapes = [...nonSelectedShapes, changes];
    setTabs(copyTabs);
  };

  const handlePropertyUpdate = (changes: Partial<Shape>) => {
    // Update properties for selected shape(s)
    const copyTabs = [...tabs];

    if (selectedId) {
      // Single selection - update the selected shape
      copyTabs[activeTab].shapes = copyTabs[activeTab].shapes.map((shape) =>
        shape.id === selectedId ? { ...shape, ...changes } : shape,
      );
    } else if (selectedIds.length > 0) {
      // Multi-selection - update all selected shapes
      copyTabs[activeTab].shapes = copyTabs[activeTab].shapes.map((shape) =>
        selectedIds.includes(shape.id) ? { ...shape, ...changes } : shape,
      );
    }

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
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();

    if (!pointerPosition) return;

    // Check if a shape was right-clicked
    const shapeId = e.target.id();
    const isShape = shapeId && shapeId !== "background";

    setContextMenu({
      x: pointerPosition.x,
      y: pointerPosition.y,
      shapeId: isShape ? shapeId : undefined,
    });
  };

  const handleLockShape = () => {
    if (!contextMenu?.shapeId) return;

    const copyTabs = [...tabs];
    const shapeIndex = copyTabs[activeTab].shapes.findIndex(
      (s) => s.id === contextMenu.shapeId
    );

    if (shapeIndex !== -1) {
      copyTabs[activeTab].shapes[shapeIndex] = {
        ...copyTabs[activeTab].shapes[shapeIndex],
        locked: true,
      };
      setTabs(copyTabs);
      setSelectedId(null);
      setSelectedIds([]);
    }
    setContextMenu(null);
  };

  const handleUnlockShape = () => {
    if (!contextMenu?.shapeId) return;

    const copyTabs = [...tabs];
    const shapeIndex = copyTabs[activeTab].shapes.findIndex(
      (s) => s.id === contextMenu.shapeId
    );

    if (shapeIndex !== -1) {
      copyTabs[activeTab].shapes[shapeIndex] = {
        ...copyTabs[activeTab].shapes[shapeIndex],
        locked: false,
      };
      setTabs(copyTabs);
    }
    setContextMenu(null);
  };

  const handleAddShape = (type: AllowedShapes) => {
    console.log("hi");
    if (!contextMenu) return;

    // Only shapes get 0.7 opacity, images get full opacity (1.0)
    const isShape =
      type === "rect" ||
      type === "circle" ||
      type === "triangle" ||
      type === "right triangle";

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

        fill: "bladk",
        rotation: 0,
        radiusX: 40,
        radiusY: 40,
        opacity: isShape ? 0.7 : 1.0,
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
    const newBoss = raidData[raidIndex].bosses[bossIndex];

    // Update all tabs to use the same boss, but preserve or reset backgroundIndex
    const copyTabs = tabs.map((tab) => {
      // Keep the current backgroundIndex if the new boss has that many raidData,
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
        boss: newBoss.name,
        backgroundSrc: newBoss.backgrounds[backgroundIndex].src,
      };
    });
    setRaid(raidData[raidIndex].raidName);
    setTabs(copyTabs);
  };

  const getCurrentBoss = () => {
    const currentTab = tabs[activeTab];
    if (!currentTab) return null;
    return raidData[currentTab.raidIndex]?.bosses[currentTab.bossIndex];
  };

  const handleAddTab = () => {
    const currentTab = tabs[activeTab];
    const { raidIndex, bossIndex } = currentTab;
    const newTab: Tab = {
      id: Date.now().toString(),
      shapes: [],
      backgroundSrc: raidData[raidIndex].bosses[bossIndex].backgrounds[0].src,
      ref: createRef<StageType>(),
      raidIndex,
      bossIndex,
      backgroundIndex: 0,
      boss: raidData[raidIndex].bosses[bossIndex].name,
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
      backgroundSrc: raidData[raidIndex].bosses[bossIndex].backgrounds[n].src,
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
      // Delete key handler
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

      // Copy (Ctrl+C) handler
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const shapesToCopy = tabs[activeTab].shapes.filter(
          (shape) => shape.id === selectedId || selectedIds.includes(shape.id),
        );
        if (shapesToCopy.length > 0) {
          setCopiedShapes(shapesToCopy);
          e.preventDefault();
        }
      }

      // Paste (Ctrl+V) handler
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (copiedShapes.length > 0) {
          const newShapes = copiedShapes.map((shape) => ({
            ...shape,
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            x: shape.x + 20, // Offset by 20px so it's visible
            y: shape.y + 20,
          }));

          setTabs((prevTabs) => {
            const copyTabs = [...prevTabs];
            copyTabs[activeTab].shapes = [
              ...copyTabs[activeTab].shapes,
              ...newShapes,
            ];
            return copyTabs;
          });

          // Select the newly pasted shapes
          if (newShapes.length === 1) {
            setSelectedId(newShapes[0].id);
            setSelectedIds([]);
          } else {
            setSelectedIds(newShapes.map((s) => s.id));
            setSelectedId(null);
          }

          e.preventDefault();
        }
      }

      // Toggle drawing mode (D key)
      // if (e.key === "d" || e.key === "D") {
      //   setDrawingMode((prev) => !prev);
      //   e.preventDefault();
      // }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, selectedIds, activeTab, copiedShapes, tabs]);

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

  const handleAddLine = (line: Shape) => {
    setTabs((prevTabs) => {
      const copyTabs = [...prevTabs];
      copyTabs[activeTab].shapes = [...copyTabs[activeTab].shapes, line];
      return copyTabs;
    });
  };

  console.log(tabs);

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
                disabled={isViewing}
                className={`
                  px-4 py-2.5 min-h-[42px] text-sm
                  border rounded-xl font-medium
                  transition-all duration-200
                  ${
                    colorMode === "dark"
                      ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-50 placeholder-slate-500 hover:bg-slate-900/70 hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                      : "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                  }
                  ${isViewing ? "opacity-50 cursor-not-allowed" : ""}
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
                disabled={isViewing}
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
                  ${isViewing ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onChange={handleBossChange}
                value={
                  tabs[activeTab]
                    ? `${tabs[activeTab].raidIndex}-${tabs[activeTab].bossIndex}`
                    : ""
                }
              >
                <option value="">-- Select a Boss --</option>
                {raidData?.map((raid, raidIndex) => (
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
                disabled={
                  isViewing ||
                  !currentBoss ||
                  currentBoss.backgrounds.length === 0
                }
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
            {!isViewing && (
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
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-row justify-center mt-2">
          {!isViewing && (
            <div className="flex flex-col gap-2">
              <Toolbar
                setDragEl={setDragEl}
                setDragSrc={setDragSrc}
                drawingMode={drawingMode}
                setDrawingMode={setDrawingMode}
                drawingColor={drawingColor}
                setDrawingColor={setDrawingColor}
                drawingThickness={drawingThickness}
                setDrawingThickness={setDrawingThickness}
                onSave={handleSave}
              />
            </div>
          )}
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
                  drawingMode={drawingMode}
                  onAddLine={handleAddLine}
                  drawingColor={drawingColor}
                  drawingThickness={drawingThickness}
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
                  {contextMenu.shapeId ? (
                    // Show lock/unlock for shapes
                    <>
                      {tabs[activeTab]?.shapes.find((s) => s.id === contextMenu.shapeId)?.locked ? (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                          onClick={handleUnlockShape}
                        >
                          Unlock
                        </button>
                      ) : (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                          onClick={handleLockShape}
                        >
                          Lock
                        </button>
                      )}
                    </>
                  ) : (
                    // Show add shape options for empty space
                    <>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                        onClick={() => handleAddShape("rect")}
                      >
                        <Square size={16} />
                        Add Rectangle
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                        onClick={() => handleAddShape("circle")}
                      >
                        <CircleIcon size={16} />
                        Add Circle
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {!isViewing && (
            <div className="w-64 pl-4 flex flex-col gap-4">
              {/* Properties Panel */}
              <PropertiesPanel
                selectedShape={
                  selectedId
                    ? tabs[activeTab]?.shapes.find(
                        (s) => s.id === selectedId,
                      ) || null
                    : selectedIds.length === 1
                      ? tabs[activeTab]?.shapes.find(
                          (s) => s.id === selectedIds[0],
                        ) || null
                      : null
                }
                onUpdate={handlePropertyUpdate}
              />

              {/* Encounter Icons */}
              <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700 p-3 overflow-y-auto max-h-[400px]">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1 mb-2">
                  Encounter Icons
                </h3>
                {currentBoss && (
                  <div className="flex flex-col gap-3">
                    {/* NPC Icons Section */}
                    {currentBoss.npcIcons &&
                      currentBoss.npcIcons.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-slate-400 mb-2">
                            NPCs
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {currentBoss.npcIcons.map((icon, index) => (
                              <div
                                key={index}
                                className="relative group flex items-center justify-center p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                                draggable
                                onDragStart={() => {
                                  setDragEl("img");
                                  setDragSrc(icon.iconSrc);
                                  setIsNpcDrag(true);
                                }}
                                onDragEnd={() => {
                                  setIsNpcDrag(false);
                                }}
                              >
                                <img
                                  src={icon.iconSrc}
                                  alt={icon.name}
                                  className="w-12 h-12 object-contain"
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-slate-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  {icon.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Spell Icons Section */}
                    {currentBoss.spellIcons &&
                      currentBoss.spellIcons.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-slate-400 mb-2">
                            Spells
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {currentBoss.spellIcons.map((icon, index) => (
                              <div
                                key={index}
                                className="relative group flex items-center justify-center p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                                draggable
                                onDragStart={() => {
                                  setDragEl("img");
                                  setDragSrc(icon.iconSrc);
                                  setIsNpcDrag(false);
                                }}
                              >
                                <img
                                  src={icon.iconSrc}
                                  alt={icon.name}
                                  className="w-12 h-12 object-contain"
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-slate-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  {icon.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Planner;
