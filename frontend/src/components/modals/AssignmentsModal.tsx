import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { Info, Pencil, Save, X } from "lucide-react";
import { Modal } from "../Modal";
import { cleanAndSeparate, type ParsedSection } from "../Assignments";
import { useUpsertAssignmentNote } from "../../api/mutationHooks";
import type { AssignmentEntry as AssignmentDef } from "../../types/api/expansion";
import { getPlayerClass } from "../../data/playerClasses";

const normalize = (s: string) => s.trim().toLowerCase();

const findParsedSection = (
  parsed: ParsedSection[],
  assignment: AssignmentDef,
): ParsedSection | undefined =>
  parsed.find(
    (p) =>
      normalize(p.heading) === normalize(assignment.heading) ||
      (assignment.heading_alias &&
        normalize(p.heading) === normalize(assignment.heading_alias)),
  );

const buildRaidplanUrl = (raidplanId: string): string => {
  const url = new URL("https://raidstrats.gg/planner");
  url.searchParams.set("embed", "true");
  url.searchParams.set("id", raidplanId);
  url.searchParams.set("animation", "true");
  url.searchParams.set("hidetrails", "true");
  url.searchParams.set("circleMode", "true");
  url.searchParams.set("maxCharacters", "4");
  return url.toString();
};

const usesPositionalMatch = (sub: { heading: string; heading_alias?: string }) =>
  sub.heading_alias !== undefined
    ? normalize(sub.heading_alias) === ""
    : normalize(sub.heading) === "";

const findParsedPlayers = (
  section: ParsedSection | undefined,
  sub: { heading: string; heading_alias?: string },
  emptyHeadingOccurrence = 0,
): string[] => {
  if (!section) return [];
  if (usesPositionalMatch(sub)) {
    const emptyHeadings = section.subheadings.filter((s) => !normalize(s.heading));
    return emptyHeadings[emptyHeadingOccurrence]?.players ?? [];
  }
  const target =
    sub.heading_alias !== undefined ? normalize(sub.heading_alias) : normalize(sub.heading);
  const found = section.subheadings.find(
    (s) =>
      normalize(s.heading) === target ||
      (s.heading_alias && normalize(s.heading_alias) === target),
  );
  return found?.players ?? [];
};

const buildPostMessagePlayers = (
  assignment: AssignmentDef,
  parsedSection: ParsedSection | undefined,
): Record<string, { name: string; class: string | null }> => {
  const result: Record<string, { name: string; class: string | null }> = {};
  let emptyIdx = 0;

  for (const sub of assignment.subheadings) {
    const eIdx = usesPositionalMatch(sub) ? emptyIdx++ : 0;
    if (sub.raidplan_index === undefined) continue;

    const players = findParsedPlayers(parsedSection, sub, eIdx);
    for (let s = 0; s < sub.available_slots; s++) {
      const pos = sub.raidplan_index + s;
      const player = players[s];
      if (player) {
        const cls = getPlayerClass(player);
        result[`index${pos}`] = { name: player, class: cls ?? null };
      }
    }
  }

  return result;
};

const PlayerSlot: FC<{ index: number; player?: string }> = ({ index, player }) => (
  <div
    className={`flex items-center gap-1.5 border rounded px-2 py-1.5 min-w-24 transition-colors duration-150 ${
      player
        ? "bg-slate-700/60 border-slate-600/50"
        : "bg-slate-800/70 border-slate-700/40"
    }`}
  >
    <span className="text-[14px] font-bold text-slate-600 font-montserrat w-3.5 shrink-0 tabular-nums">
      {index}
    </span>
    <div className="w-px h-3 bg-slate-700/60 shrink-0" />
    {player ? (
      <span className="text-[13px] text-slate-200 font-montserrat font-medium truncate">
        {player}
      </span>
    ) : (
      <span className="text-[11px] text-slate-700 font-montserrat italic truncate select-none">
        empty
      </span>
    )}
  </div>
);

export const AssignmentSubGroup: FC<{
  heading: string;
  available_slots: number;
  slotOffset: number;
  players: string[];
}> = ({ heading, available_slots, slotOffset, players }) => {
  const slots = Array.from({ length: available_slots }, (_, i) => slotOffset + i + 1);

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold font-montserrat text-slate-400 uppercase tracking-wider">
          {heading}
        </span>
        {/* <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-montserrat tabular-nums ${
              filledCount === available_slots ? "text-emerald-500" : "text-slate-600"
            }`}
          >
            {filledCount}/{available_slots}
          </span>
          <button className="text-[9px] font-montserrat text-slate-600 hover:text-slate-300 border border-slate-800 hover:border-slate-600 rounded px-1.5 py-0.5 transition-colors duration-150">
            Clear
          </button>
          <button className="text-[9px] font-montserrat text-slate-600 hover:text-slate-300 border border-slate-800 hover:border-slate-600 rounded px-1.5 py-0.5 transition-colors duration-150">
            Config
          </button>
        </div> */}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slotNum, i) => (
          <PlayerSlot key={slotNum} index={slotNum} player={players[i]} />
        ))}
      </div>
    </div>
  );
};

export const AssignmentGroup: FC<{
  assignment: AssignmentDef;
  parsedSection: ParsedSection | undefined;
}> = ({ assignment, parsedSection }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  let slotOffset = 0;
  let emptyHeadingCount = 0;

  const sendPlayers = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const players = buildPostMessagePlayers(assignment, parsedSection);
    if (Object.keys(players).length === 0) return;
    win.postMessage({ type: "updatePlayers", players }, "https://raidstrats.gg");
    win.postMessage({ type: "toggleIndexNumbers", show: true }, "*");
  }, [assignment, parsedSection]);

  const details = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-linear-to-b from-cyan-500 to-blue-600 rounded-full shrink-0" />
          <h3 className="font-montserrat text-base font-bold text-white tracking-wide">
            {assignment.heading}
          </h3>
        </div>
        {assignment.information && (
          <div className="flex items-start gap-1.5 pl-2.5">
            <Info className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
            <p className="text-[11px] font-montserrat text-slate-500 leading-relaxed">
              {assignment.information}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {assignment.subheadings.map((sub, i) => {
          const offset = slotOffset;
          slotOffset += sub.available_slots;
          const emptyIdx = usesPositionalMatch(sub) ? emptyHeadingCount++ : 0;
          const players = findParsedPlayers(parsedSection, sub, emptyIdx);
          return (
            <AssignmentSubGroup
              key={i}
              heading={sub.heading}
              available_slots={sub.available_slots}
              slotOffset={offset}
              players={players}
            />
          );
        })}
      </div>
    </div>
  );

  if (!assignment.raidplan_id) {
    return (
      <div className="border-b border-slate-800/40 pb-6 last:border-b-0 last:pb-0">
        {details}
      </div>
    );
  }

  const iframeSrc = buildRaidplanUrl(assignment.raidplan_id);

  return (
    <div className="flex gap-5 items-start border-b border-slate-800/40 pb-6 last:border-b-0 last:pb-0">
      <div className="w-[60%] shrink-0 aspect-video rounded-xl overflow-hidden border border-slate-800/50 bg-slate-900/40">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title={assignment.heading}
          className="w-full h-full"
          style={{ border: "none" }}
          onLoad={() => setTimeout(sendPlayers, 800)}
        />
      </div>
      <div className="flex-1 min-w-0">{details}</div>
    </div>
  );
};

type AssignmentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assignments: AssignmentDef[];
  note?: string;
  teamId?: string;
  bossId?: string;
  isAdmin?: boolean;
};

export const AssignmentsModal: FC<AssignmentsModalProps> = ({
  isOpen,
  onClose,
  assignments,
  note,
  teamId,
  bossId,
  isAdmin,
}) => {
  const parsed = note ? cleanAndSeparate(note) : [];

  const [showEditor, setShowEditor] = useState(false);
  const [noteContent, setNoteContent] = useState(note ?? "");

  useEffect(() => {
    setNoteContent(note ?? "");
  }, [note]);

  useEffect(() => {
    if (!isOpen) setShowEditor(false);
  }, [isOpen]);

  const { mutate: upsertNote, isPending } = useUpsertAssignmentNote(teamId, bossId);

  const handleSave = () => {
    upsertNote(noteContent, { onSuccess: () => setShowEditor(false) });
  };

  const actions = showEditor ? (
    <>
      <button
        onClick={() => { setNoteContent(note ?? ""); setShowEditor(false); }}
        className="px-4 py-2 rounded-lg font-montserrat text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2"><X className="w-4 h-4" /> Cancel</div>
      </button>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-4 py-2 rounded-lg font-montserrat text-sm font-medium bg-linear-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 transition-all"
      >
        <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Note</div>
      </button>
    </>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title="Assignments"
      subtitle="Role assignments for each mechanic"
      variant="dark"
      size="screen"
      actions={actions}
    >
      <div className="flex flex-col gap-4 pb-4">
        {isAdmin && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowEditor((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-medium border transition-colors duration-150 ${
                showEditor
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              }`}
            >
              <Pencil className="w-3 h-3" />
              {showEditor ? "Editing Note" : "Edit Note"}
            </button>
          </div>
        )}

        {showEditor && (
          <div className="flex flex-col gap-2 p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <p className="text-[11px] font-montserrat text-slate-500">
              Paste the NSRT note string below. Assignments will update on save.
            </p>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono resize-y focus:outline-none focus:border-slate-600 transition-colors"
              placeholder="Paste NSRT note here..."
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex flex-col gap-6">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="font-montserrat text-sm font-medium text-slate-400">
                No assignments configured
              </p>
              <p className="font-montserrat text-xs text-slate-600 text-center max-w-sm">
                Assignment configurations for this boss haven't been set up yet.
              </p>
            </div>
          ) : (
            assignments.map((assignment, i) => (
              <AssignmentGroup
                key={i}
                assignment={assignment}
                parsedSection={findParsedSection(parsed, assignment)}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
