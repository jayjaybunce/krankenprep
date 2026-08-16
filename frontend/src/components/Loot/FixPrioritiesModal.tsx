import { useEffect, useRef, useState, type FC } from "react";
import { useDrag, useDrop } from "react-dnd";
import update from "immutability-helper";
import { GripVertical, X } from "lucide-react";
import { Modal } from "../Modal";
import { useTheme } from "../../hooks";
import { useReorderBossPriorities } from "../../api/mutationHooks";

// Not a real Blizzard/DOM concept — just the react-dnd item type shared
// between useDrag/useDrop for this list, so rows only accept drops from
// other rows in the same list (mirrors PhaseCard.tsx's "card" literal, but
// named instead of an ad hoc string repeated in two places).
const BOSS_PRIORITY_DND_TYPE = "boss-priority-row";

export type PriorityBoss = {
  id: number;
  name: string;
  icon_img_url: string;
};

const BossPriorityRow: FC<{
  boss: PriorityBoss;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  // Drops this boss from the list entirely (unsets its priority) — separate
  // from moveRow since it changes the list's length, not just its order.
  removeRow: (index: number) => void;
  colorMode: string;
}> = ({ boss, index, moveRow, removeRow, colorMode }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Same hover/swap mechanics as PhaseCard.tsx — reused verbatim rather than
  // reinvented, since that's the app's one existing react-dnd pattern.
  const [{ handlerId }, drop] = useDrop({
    accept: BOSS_PRIORITY_DND_TYPE,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = (item as { index: number }).index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveRow(dragIndex, hoverIndex);
      (item as { index: number }).index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: BOSS_PRIORITY_DND_TYPE,
    item: () => ({ id: boss.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  // Attaching react-dnd's connectors in an effect (rather than calling
  // drag(drop(ref)) directly during render) avoids reading ref.current
  // synchronously while rendering.
  useEffect(() => {
    drag(drop(ref));
  }, [drag, drop]);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      } ${
        colorMode === "dark"
          ? "border-slate-800 bg-slate-900/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <GripVertical
        className={`w-4 h-4 shrink-0 ${colorMode === "dark" ? "text-slate-600" : "text-slate-400"}`}
      />
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold font-montserrat shrink-0 ${
          colorMode === "dark"
            ? "bg-cyan-500/20 text-cyan-400"
            : "bg-cyan-100 text-cyan-700"
        }`}
      >
        {index + 1}
      </span>
      <img
        src={boss.icon_img_url}
        alt=""
        className="w-8 h-8 rounded-md shrink-0"
      />
      <span
        className={`text-sm font-medium font-montserrat truncate flex-1 ${colorMode === "dark" ? "text-slate-200" : "text-slate-800"}`}
      >
        {boss.name}
      </span>
      <button
        type="button"
        onClick={() => removeRow(index)}
        title={`Unset priority on ${boss.name}`}
        className={`shrink-0 p-1 rounded-md transition-colors ${
          colorMode === "dark"
            ? "text-slate-500 hover:text-rose-400 hover:bg-slate-800"
            : "text-slate-400 hover:text-rose-500 hover:bg-slate-100"
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

type FixPrioritiesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  characterId: number;
  difficulty: string;
  // Initial order (by current priority) — the row at index 0 is priority 1.
  bosses: PriorityBoss[];
};

export const FixPrioritiesModal: FC<FixPrioritiesModalProps> = ({
  isOpen,
  onClose,
  teamId,
  characterId,
  difficulty,
  bosses,
}) => {
  const { colorMode } = useTheme();
  const [orderedBosses, setOrderedBosses] = useState<PriorityBoss[]>(bosses);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { mutate: reorder, isPending } = useReorderBossPriorities(
    teamId,
    characterId,
  );

  useEffect(() => {
    // Only re-sync when the modal opens with a fresh set of bosses — not on
    // every parent re-render while it's already open, which would fight an
    // in-progress drag.
    if (isOpen) {
      setOrderedBosses(bosses);
      setSaveError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    setOrderedBosses((prev) =>
      update(prev, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev[dragIndex]],
        ],
      }),
    );
  };

  // Drops a boss from the list — unsetting its priority. Nothing is sent
  // until "Save order" is clicked, same as reordering; the removed boss's
  // slot is closed automatically since this list is the source of truth for
  // the save (index 0 -> priority 1, etc).
  const removeRow = (index: number) => {
    setOrderedBosses((prev) => update(prev, { $splice: [[index, 1]] }));
  };

  const handleSave = () => {
    setSaveError(null);
    reorder(
      { difficulty, boss_ids: orderedBosses.map((b) => b.id) },
      {
        onSuccess: () => onClose(),
        onError: (err) =>
          setSaveError(
            err instanceof Error ? err.message : "Failed to save priority order.",
          ),
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title="Fix priorities"
      subtitle={`Drag to reorder your ${difficulty} priorities — position in the list is the new priority. Click ✕ to unset a boss entirely.`}
      actions={
        <>
          <button
            onClick={() => onClose()}
            className={`px-4 py-2 text-sm font-medium font-montserrat rounded-lg border transition-colors ${
              colorMode === "dark"
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium font-montserrat rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save order"}
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {saveError && (
          <p className="text-sm font-montserrat text-rose-500">{saveError}</p>
        )}
        {orderedBosses.length === 0 ? (
          <p
            className={`text-sm font-montserrat ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}`}
          >
            No priorities set — save to clear them all, or cancel to leave
            things as they are.
          </p>
        ) : (
          orderedBosses.map((boss, index) => (
            <BossPriorityRow
              key={boss.id}
              boss={boss}
              index={index}
              moveRow={moveRow}
              removeRow={removeRow}
              colorMode={colorMode}
            />
          ))
        )}
      </div>
    </Modal>
  );
};
