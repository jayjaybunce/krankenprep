import {
  CircleIcon,
  Square,
  TriangleIcon,
  TriangleRight,
  Save,
  Type,
} from "lucide-react";
import type { Dispatch, FC, ReactNode, SetStateAction } from "react";

type ToolbarProps = {
  setDragEl: Dispatch<SetStateAction<AllowedShapes | null>>;
  setDragSrc: Dispatch<SetStateAction<string | null | undefined>>;
  drawingMode: boolean;
  setDrawingMode: Dispatch<SetStateAction<boolean>>;
  drawingColor: string;
  setDrawingColor: Dispatch<SetStateAction<string>>;
  drawingThickness: number;
  setDrawingThickness: Dispatch<SetStateAction<number>>;
  onSave?: () => void;
};

export type AllowedShapes =
  | "rect"
  | "circle"
  | "triangle"
  | "right triangle"
  | "img"
  | "line"
  | "text";

type ToolbarShape = {
  toolbarEl: ReactNode;
  type: AllowedShapes;
  src?: string;
};

const shapes: ToolbarShape[] = [
  {
    toolbarEl: <Square height={24} width={24} fill="white" stroke="white" />,
    type: "rect",
  },
  {
    toolbarEl: (
      <CircleIcon height={24} width={24} fill="white" stroke="white" />
    ),
    type: "circle",
  },
  {
    toolbarEl: (
      <TriangleIcon height={24} width={24} fill="white" stroke="white" />
    ),
    type: "triangle",
  },
  {
    toolbarEl: (
      <TriangleRight height={24} width={24} fill="white" stroke="white" />
    ),
    type: "right triangle",
  },
  {
    toolbarEl: <Type height={24} width={24} stroke="white" />,
    type: "text",
  },
];

const worldMarkers: ToolbarShape[] = [
  {
    toolbarEl: <img src="/star.png" className="h-6 w-6" />,
    type: "img",
    src: "/star.png",
  },
  {
    toolbarEl: <img src="/circle.png" className="h-6 w-6" />,
    type: "img",
    src: "/circle.png",
  },
  {
    toolbarEl: <img src="/cross.png" className="h-6 w-6" />,
    type: "img",
    src: "/cross.png",
  },
  {
    toolbarEl: <img src="/diamond.png" className="h-6 w-6" />,
    type: "img",
    src: "/diamond.png",
  },
  {
    toolbarEl: <img src="/moon.png" className="h-6 w-6" />,
    type: "img",
    src: "/moon.png",
  },
  {
    toolbarEl: <img src="/skull.png" className="h-6 w-6" />,
    type: "img",
    src: "/skull.png",
  },
  {
    toolbarEl: <img src="/square.png" className="h-6 w-6" />,
    type: "img",
    src: "/square.png",
  },
  {
    toolbarEl: <img src="/triangle.png" className="h-6 w-6" />,
    type: "img",
    src: "/triangle.png",
  },
];

const classIcons: ToolbarShape[] = [
  {
    toolbarEl: <img src="/deathknight.png" className="h-6 w-6" />,
    type: "img",
    src: "/deathknight.png",
  },
  {
    toolbarEl: <img src="/demonhunter.png" className="h-6 w-6" />,
    type: "img",
    src: "/demonhunter.png",
  },
  {
    toolbarEl: <img src="/druid.png" className="h-6 w-6" />,
    type: "img",
    src: "/druid.png",
  },
  {
    toolbarEl: <img src="/evoker.png" className="h-6 w-6" />,
    type: "img",
    src: "/evoker.png",
  },
  {
    toolbarEl: <img src="/hunter.png" className="h-6 w-6" />,
    type: "img",
    src: "/hunter.png",
  },
  {
    toolbarEl: <img src="/mage.png" className="h-6 w-6" />,
    type: "img",
    src: "/mage.png",
  },
  {
    toolbarEl: <img src="/monk.png" className="h-6 w-6" />,
    type: "img",
    src: "/monk.png",
  },
  {
    toolbarEl: <img src="/paladin.png" className="h-6 w-6" />,
    type: "img",
    src: "/paladin.png",
  },
  {
    toolbarEl: <img src="/priest.png" className="h-6 w-6" />,
    type: "img",
    src: "/priest.png",
  },
  {
    toolbarEl: <img src="/rogue.png" className="h-6 w-6" />,
    type: "img",
    src: "/rogue.png",
  },
  {
    toolbarEl: <img src="/shaman.png" className="h-6 w-6" />,
    type: "img",
    src: "/shaman.png",
  },
  {
    toolbarEl: <img src="/warlock.png" className="h-6 w-6" />,
    type: "img",
    src: "/warlock.png",
  },
  {
    toolbarEl: <img src="/warrior.png" className="h-6 w-6" />,
    type: "img",
    src: "/warrior.png",
  },
];

const roleIcons: ToolbarShape[] = [
  {
    toolbarEl: <img src="/healer.svg" className="h-6 w-6" />,
    type: "img",
    src: "/healer.svg",
  },
  {
    toolbarEl: <img src="/mdps.svg" className="h-6 w-6" />,
    type: "img",
    src: "/mdps.svg",
  },
  {
    toolbarEl: <img src="/rdps.svg" className="h-6 w-6" />,
    type: "img",
    src: "/rdps.svg",
  },
  {
    toolbarEl: <img src="/tank.svg" className="h-6 w-6" />,
    type: "img",
    src: "/tank.svg",
  },
];

const renderToolbarItem = (
  shape: ToolbarShape,
  setDragEl: Dispatch<SetStateAction<AllowedShapes | null>>,
  setDragSrc: Dispatch<SetStateAction<string | null | undefined>>,
) => (
  <div
    key={shape.src || shape.type}
    draggable
    className="z-10 p-1 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all cursor-grab active:cursor-grabbing hover:scale-105 flex items-center justify-center"
    data-id={shape.type}
    onDragStart={() => {
      setDragEl(shape.type);
      if (shape.type === "img") {
        setDragSrc(shape?.src || null);
      }
    }}
    onDragEnd={() => {
      setDragEl(null);
      if (shape.type === "img") {
        setDragSrc(null);
      }
    }}
  >
    {shape.toolbarEl}
  </div>
);

export const Toolbar: FC<ToolbarProps> = ({
  setDragEl,
  setDragSrc,
  drawingMode,
  setDrawingMode,
  drawingColor,
  setDrawingColor,
  drawingThickness,
  setDrawingThickness,
  onSave,
}) => {
  const colors = [
    { name: "White", value: "white" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Purple", value: "#a855f7" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
  ];

  const thicknesses = [1, 2, 3, 4, 5, 8, 10, 15];

  const isPresetColor = colors.some((c) => c.value === drawingColor);

  return (
    <div className="flex flex-col gap-2.5 p-2.5 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700 w-30">
      {/* Save Button */}
      {onSave && (
        <div className="space-y-1">
          <button
            onClick={onSave}
            className="
              w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
              border transition-all duration-200 font-medium text-xs
              bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30 hover:border-green-400
            "
          >
            <Save size={14} />
            Save Plan
          </button>
        </div>
      )}

      {/* Drawing Mode Toggle */}
      <div className="space-y-1">
        <button
          onClick={() => setDrawingMode(!drawingMode)}
          className={`
            w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
            border transition-all duration-200 font-medium text-xs
            ${
              drawingMode
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          {drawingMode ? "Draw ON" : "Draw"}
        </button>
      </div>

      {drawingMode ? (
        <>
          {/* Color Selection */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Color
            </h3>
            <div className="grid grid-cols-4 gap-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setDrawingColor(color.value)}
                  className={`
                    h-7 rounded border-2 transition-all duration-200
                    ${
                      drawingColor === color.value
                        ? "border-cyan-500 scale-110"
                        : "border-slate-600 hover:border-slate-500"
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {/* Custom Color Picker */}
            <div className="relative">
              <label className="flex items-center gap-2 p-1.5 rounded border border-slate-700 hover:border-slate-600 transition-all cursor-pointer bg-slate-800/50">
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  Custom
                </span>
                <div
                  className={`ml-auto w-4 h-4 rounded border ${
                    isPresetColor ? "border-slate-600" : "border-cyan-500"
                  }`}
                  style={{ backgroundColor: drawingColor }}
                />
              </label>
            </div>
          </div>

          {/* Thickness Selection */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Thickness
            </h3>
            <div className="grid grid-cols-4 gap-1">
              {thicknesses.map((thickness) => (
                <button
                  key={thickness}
                  onClick={() => setDrawingThickness(thickness)}
                  className={`
                    h-7 rounded border transition-all duration-200 flex items-center justify-center
                    ${
                      drawingThickness === thickness
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    }
                  `}
                >
                  <span className="text-[10px] font-medium">{thickness}px</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Shapes Section */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Shapes
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {shapes.map((shape) =>
                renderToolbarItem(shape, setDragEl, setDragSrc),
              )}
            </div>
          </div>

          {/* World Markers Section */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Markers
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {worldMarkers.map((shape) =>
                renderToolbarItem(shape, setDragEl, setDragSrc),
              )}
            </div>
          </div>

          {/* Class Icons Section */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Classes
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {classIcons.map((shape) =>
                renderToolbarItem(shape, setDragEl, setDragSrc),
              )}
            </div>
          </div>

          {/* Role Icons Section */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-0.5">
              Roles
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {roleIcons.map((shape) =>
                renderToolbarItem(shape, setDragEl, setDragSrc),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
