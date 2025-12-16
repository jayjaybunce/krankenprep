import { CircleIcon, Square, TriangleIcon, TriangleRight } from "lucide-react";
import type { Dispatch, FC, ReactNode, SetStateAction } from "react";

type ToolbarProps = {
  setDragEl: Dispatch<SetStateAction<AllowedShapes | null>>;
  setDragSrc: Dispatch<SetStateAction<string | null | undefined>>;
};

export type AllowedShapes =
  | "rect"
  | "circle"
  | "triangle"
  | "right triangle"
  | "img";

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
    className="z-10 p-1.5 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all cursor-grab active:cursor-grabbing hover:scale-105 flex items-center justify-center"
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

export const Toolbar: FC<ToolbarProps> = ({ setDragEl, setDragSrc }) => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-xl border border-slate-700">
      {/* Shapes Section */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1">
          Shapes
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {shapes.map((shape) => renderToolbarItem(shape, setDragEl, setDragSrc))}
        </div>
      </div>

      {/* World Markers Section */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1">
          Markers
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {worldMarkers.map((shape) =>
            renderToolbarItem(shape, setDragEl, setDragSrc),
          )}
        </div>
      </div>

      {/* Class Icons Section */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1">
          Classes
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {classIcons.map((shape) =>
            renderToolbarItem(shape, setDragEl, setDragSrc),
          )}
        </div>
      </div>

      {/* Role Icons Section */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-slate-700 pb-1">
          Roles
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {roleIcons.map((shape) =>
            renderToolbarItem(shape, setDragEl, setDragSrc),
          )}
        </div>
      </div>
    </div>
  );
};
