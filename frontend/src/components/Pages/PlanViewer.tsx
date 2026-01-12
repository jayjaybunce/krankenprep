import { useState, type FC, useRef, useLayoutEffect } from "react";
import { Card } from "../Card";
import { useTheme } from "../../hooks";
import { PlanTab } from "../Planner/PlanTab";
import type { Tab } from "../Planner/Planner";

type PlanViewerProps = {
  tabs: Tab[];
};

const PlanViewer: FC<PlanViewerProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colorMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5); // Start with a reasonable default

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const baseH = 800;
  const baseW = 1400;

  useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / baseW, 1);
        setScale(newScale);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(updateScale);

    window.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      cancelAnimationFrame(rafId);
    };
  }, [baseW]);

  return (
    <div className="flex justify-center items-start w-full">
      <div className="w-full max-w-[95vw]" ref={containerRef}>
        <Card variant="elevated" hover={false}>
          <div className="flex flex-col gap-4">
            {/* Canvas Area - View Only */}
            <div className="flex flex-row justify-center mt-2 w-full overflow-hidden">
              <div
                style={{
                  width: `${baseW * scale}px`,
                  height: `${baseH * scale}px`,
                }}
              >
                <div
                  className="relative"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: `${baseW}px`,
                    height: `${baseH}px`,
                  }}
                >
                  {/* Tabs Overlay */}
                  <div className="absolute top-4 left-4 z-10 flex flex-row gap-2 items-center flex-wrap max-w-[calc(100%-2rem)]">
                    {tabs &&
                      tabs.map((tab, index) => (
                        <div
                          key={tab.id}
                          className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl
                        border transition-all duration-200 cursor-pointer
                        backdrop-blur-md shadow-lg
                        ${
                          activeTab === index
                            ? colorMode === "dark"
                              ? "bg-cyan-500/30 border-cyan-500 text-cyan-400 shadow-cyan-500/20"
                              : "bg-cyan-50/90 border-cyan-500 text-cyan-700"
                            : colorMode === "dark"
                              ? "bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900/90 hover:border-slate-700"
                              : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white/90 hover:border-slate-300"
                        }
                      `}
                          onClick={() => handleTabClick(index)}
                        >
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                  {tabs?.map((tab, i) => {
                    return (
                      <PlanTab
                        height={baseH}
                        width={baseW}
                        key={tab.id}
                        ref={tab.ref}
                        isActive={i === activeTab}
                        backgroundSrc={tab.backgroundSrc}
                        selectedId={null}
                        selectedIds={[]}
                        groupKey={0}
                        setSelectedId={() => {}}
                        setSelectedIds={() => {}}
                        shapes={tab?.shapes}
                        handleChange={() => {}}
                        onGroupTransform={() => {}}
                        handleContextMenu={() => {}}
                        drawingMode={false}
                        onAddLine={() => {}}
                        drawingColor="white"
                        drawingThickness={2}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlanViewer;
