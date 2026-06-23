import {
  useState,
  type FC,
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react";
import { Card } from "../Card";
import { useTheme } from "../../hooks";
import { PlanTab } from "../Planner/PlanTab";
import type { Tab } from "../Planner/Planner";
import { ExternalLink, XIcon } from "lucide-react";

type PlanViewerProps = {
  viewUrl: string;
  tabs: Tab[];
  startingId?: string | null;
  onClose: () => void;
  onTabChange?: (tabId: string) => void;
};

const PlanViewer: FC<PlanViewerProps> = ({
  tabs,
  startingId,
  onClose,
  onTabChange,
  viewUrl,
}) => {
  const index = useMemo(() => {
    if (startingId) {
      const index = tabs.findIndex((x) => x.id === startingId);
      if (index != -1) {
        return index;
      }
      return 0;
    }
    return 0;
  }, [tabs, startingId]);
  const [activeTab, setActiveTab] = useState(index);
  const { colorMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5); // Start with a reasonable default

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (tabs[index]) {
      onTabChange?.(tabs[index].id);
    }
  };

  const baseH = 720;
  const baseW = 1280;

  useEffect(() => {
    if (startingId) {
      const index = tabs.findIndex((x) => x.id === startingId);
      if (index != -1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(index);
      }
      setActiveTab(index);
    }
  }, [tabs, startingId]);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
        const newScale = containerWidth / baseW;
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
          <div className="flex flex-col gap-1">
            {/* Tabs Overlay - rendered after PlanTabs so it paints on top */}
            <div className=" left-4 z-20 flex flex-row gap-2 items-center flex-wrap max-w-[calc(100%-2rem)]">
              {tabs &&
                tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`
                            flex items-center gap-2 px-3 py-1 rounded-xl
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
                    <span className="text-xl font-medium">{index + 1}</span>
                  </div>
                ))}
              <div
                className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl
                        border transition-all duration-200 cursor-pointer
                        backdrop-blur-md shadow-lg
                        ${
                          colorMode === "dark"
                            ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30 shadow-red-500/20"
                            : "bg-red-50/90 border-red-400 text-red-600 hover:bg-red-100/90"
                        }
                      `}
                onClick={onClose}
              >
                <XIcon size={16} />
              </div>
              <a href={`${window.location.origin}${viewUrl}`} target="_blank">
                <div
                  className={`
                          flex items-center gap-2 px-4 py-2 rounded-xl
                          border transition-all duration-200 cursor-pointer
                          backdrop-blur-md shadow-lg
                          ${
                            colorMode === "dark"
                              ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30 shadow-red-500/20"
                              : "bg-red-50/90 border-red-400 text-red-600 hover:bg-red-100/90"
                          }
                        `}
                >
                  <ExternalLink size={16} />
                </div>
              </a>
            </div>
            {/* Canvas Area - View Only */}
            <div className="flex flex-row justify-center w-full">
              <div
                style={{
                  zoom: scale,
                }}
              >
                <div
                  className="relative z-10 mt-2"
                  // style={{
                  //   transformOrigin: "top left",
                  //   width: `${baseW}px`,
                  //   height: `${baseH}px`,
                  // }}
                >
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
