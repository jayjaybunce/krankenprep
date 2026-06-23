import { ChevronLeft } from "lucide-react";
import { Card, type CardProps } from "./Card";
import { useRef, useState } from "react";
import type { FC } from "react";
import { useDrag, useDrop } from "react-dnd";

type PhaseCardProps = {
  cardProps?: CardProps;
  phaseNumber: number;
  title: string;
  subtitle?: string;
  phaseNotes: [];
  hasNewNotes: boolean;
  // Sortable Props
  id: number;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
};

const getPhaseColor = (phaseNumber: number) => {
  const colors = [
    "bg-emerald-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-pink-500",
  ];
  return colors[phaseNumber - 1] || colors[0];
};

export const PhaseCard: FC<PhaseCardProps> = ({
  phaseNumber,
  title,
  subtitle = null,
  phaseNotes,
  hasNewNotes = true,
  // Sortable Props
  id,
  index,
  moveCard,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "card",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = (item as { index: number }).index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      (item as { index: number }).index = hoverIndex;
    },
  });
  const [, drag] = useDrag({
    type: "card",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <button ref={ref} data-handler-id={handlerId}>
      <Card
        variant="neon-gradient"
        isActive={isExpanded}
        onClick={setIsExpanded}
      >
        <div className="flex flex-row gap-2">
          <div
            className={`w-10 h-10 ${getPhaseColor(phaseNumber)} rounded-lg flex items-center justify-center text-white font-bold text-sm relative`}
          >
            {phaseNumber}
            {hasNewNotes && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-0 border-neutral-950 animate-pulse"></div>
            )}
          </div>
          <div className="flex w-full justify-between">
            <div className="flex flex-col items-start ">
              <div className="dark:text-white leading-5 font-montserrat font-bold">
                {title}
              </div>
              <div
                className="m-0 p-0 text-neutral-600 text-sm dark:text-neutral-400"
                style={{
                  fontFamily: "Montserrat",
                }}
              >
                {subtitle}
              </div>
            </div>
            <div
              className={`flex items-center transition-all ease-in-out duration-300 ${isExpanded ? "-rotate-90 animate-pulse" : "rotate-none"}`}
            >
              <ChevronLeft className="dark:text-white" />
            </div>
          </div>
        </div>
      </Card>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="pl-5 pr-5 pt-4 pb-4">
          {phaseNotes.length === 0 ? (
            <div className="w-full flex items-center justify-center self-center align-middle dark:text-white">
              No notes yet
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </button>
  );
};
