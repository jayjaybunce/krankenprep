import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Pencil, RefreshCw, Save, UserCheck, X } from "lucide-react";
import { Modal } from "../Modal";
import Alert from "../Alert";
import { cleanAndSeparate, type ParsedSection } from "../Assignments";
import { useUpsertAssignmentNote } from "../../api/mutationHooks";
import { useGetTeamById } from "../../api/queryHooks";
import { useUser } from "../../hooks";
import type { AssignmentEntry as AssignmentDef } from "../../types/api/expansion";
import { getClassColor } from "../../data/classes";

const normalize = (s: string) => s.trim().toLowerCase();

const hexToRgba = (hex: string, alpha: number): string => {
  const parsed = hex.replace("#", "");
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Picks black or white text so it stays readable against a solid class-color fill.
const getContrastTextColor = (hex: string): string => {
  const parsed = hex.replace("#", "");
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
};

type CharacterClassLookup = (name: string) => string | undefined;

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

// Shared by buildPostMessagePlayers (needs every filled slot) and
// findRaidplanIndicesForNames (needs just the slots matching a name set) —
// same subheading/empty-heading-occurrence walk either way.
const walkAssignmentSlots = (
  assignment: AssignmentDef,
  parsedSection: ParsedSection | undefined,
): { pos: number; player: string }[] => {
  const result: { pos: number; player: string }[] = [];
  let emptyIdx = 0;

  for (const sub of assignment.subheadings) {
    const eIdx = usesPositionalMatch(sub) ? emptyIdx++ : 0;
    if (sub.raidplan_index === undefined) continue;

    const players = findParsedPlayers(parsedSection, sub, eIdx);
    for (let s = 0; s < sub.available_slots; s++) {
      const pos = sub.raidplan_index + s;
      const player = players[s];
      if (player) result.push({ pos, player });
    }
  }

  return result;
};

const buildPostMessagePlayers = (
  assignment: AssignmentDef,
  parsedSection: ParsedSection | undefined,
  getCharacterClass: CharacterClassLookup,
): Record<string, { name: string; class: string | null }> => {
  const result: Record<string, { name: string; class: string | null }> = {};
  for (const { pos, player } of walkAssignmentSlots(assignment, parsedSection)) {
    const cls = getCharacterClass(player);
    result[`index${pos}`] = { name: player, class: cls ?? null };
  }
  return result;
};

// Raidplan slot indices (the same "pos" values sent as "index<N>" keys in
// buildPostMessagePlayers) whose assigned player matches one of the given
// (lowercased) character names — used to drive the "Highlight me" button.
const findRaidplanIndicesForNames = (
  assignment: AssignmentDef,
  parsedSection: ParsedSection | undefined,
  names: Set<string>,
): number[] =>
  walkAssignmentSlots(assignment, parsedSection)
    .filter(({ player }) => names.has(normalize(player)))
    .map(({ pos }) => pos);

// Whether any of the given names appears anywhere in this assignment's
// parsed player lists — unlike findRaidplanIndicesForNames, this doesn't
// require a raidplan_index, so it also covers assignments with no iframe at
// all (the blurb-only path), matching what AssignmentSubGroup actually
// renders below.
const assignmentIncludesNames = (
  assignment: AssignmentDef,
  parsedSection: ParsedSection | undefined,
  names: Set<string>,
): boolean => {
  let emptyIdx = 0;
  for (const sub of assignment.subheadings) {
    const eIdx = usesPositionalMatch(sub) ? emptyIdx++ : 0;
    const players = findParsedPlayers(parsedSection, sub, eIdx);
    if (players.some((p) => names.has(normalize(p)))) return true;
  }
  return false;
};

const PlayerSlot: FC<{ index: number; player?: string; characterClass?: string; isMe?: boolean }> = ({
  index,
  player,
  characterClass,
  isMe,
}) => {
  const classColor = characterClass ? getClassColor(characterClass) : undefined;
  const textColor = classColor ? getContrastTextColor(classColor) : undefined;

  return (
    <div
      className={`flex items-center gap-1.5 border rounded px-2 py-1.5 min-w-24 transition-colors duration-150 ${
        player
          ? classColor
            ? "border-transparent shadow-sm"
            : "bg-slate-700/60 border-slate-600/50"
          : "bg-slate-800/70 border-slate-700/40"
      } ${isMe ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950" : ""}`}
      style={classColor ? { backgroundColor: classColor } : undefined}
    >
      <span
        className={`text-[14px] font-bold font-montserrat w-3.5 shrink-0 tabular-nums ${classColor ? "" : "text-slate-600"}`}
        style={classColor ? { color: hexToRgba(textColor!, 0.65) } : undefined}
      >
        {index}
      </span>
      <div
        className={`w-px h-3 shrink-0 ${classColor ? "" : "bg-slate-700/60"}`}
        style={classColor ? { backgroundColor: hexToRgba(textColor!, 0.3) } : undefined}
      />
      {player ? (
        <span
          className={`text-[13px] font-montserrat font-semibold truncate ${classColor ? "" : "text-slate-200"}`}
          style={classColor ? { color: textColor } : undefined}
        >
          {player}
        </span>
      ) : (
        <span className="text-[11px] text-slate-700 font-montserrat italic truncate select-none">
          empty
        </span>
      )}
    </div>
  );
};

export const AssignmentSubGroup: FC<{
  heading: string;
  description?: string;
  available_slots: number;
  slotOffset: number;
  players: string[];
  getCharacterClass: CharacterClassLookup;
  myCharacterNames?: Set<string>;
}> = ({ heading, description, available_slots, slotOffset, players, getCharacterClass, myCharacterNames }) => {
  const slots = Array.from({ length: available_slots }, (_, i) => slotOffset + i + 1);

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold font-montserrat text-slate-400 uppercase tracking-wider">
            {heading}
          </span>
        </div>
        {description && (
          <p className="text-[11px] font-montserrat text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slotNum, i) => {
          const player = players[i];
          return (
            <PlayerSlot
              key={slotNum}
              index={slotNum}
              player={player}
              characterClass={player ? getCharacterClass(player) : undefined}
              isMe={player ? myCharacterNames?.has(normalize(player)) : false}
            />
          );
        })}
      </div>
    </div>
  );
};

export const AssignmentGroup: FC<{
  assignment: AssignmentDef;
  parsedSection: ParsedSection | undefined;
  getCharacterClass: CharacterClassLookup;
  myCharacterNames: Set<string>;
  isHighlighted: boolean;
}> = ({ assignment, parsedSection, getCharacterClass, myCharacterNames, isHighlighted }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  let slotOffset = 0;
  let emptyHeadingCount = 0;

  const sendPlayers = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const players = buildPostMessagePlayers(assignment, parsedSection, getCharacterClass);
    if (Object.keys(players).length === 0) return;
    win.postMessage({ type: "updatePlayers", players }, "https://raidstrats.gg");
    win.postMessage({ type: "toggleIndexNumbers", show: true }, "*");
  }, [assignment, parsedSection, getCharacterClass]);

  const myIndices = useMemo(
    () => findRaidplanIndicesForNames(assignment, parsedSection, myCharacterNames),
    [assignment, parsedSection, myCharacterNames],
  );

  // The assignment note and roster fetches (parsedSection/getCharacterClass)
  // are independent of the iframe's own onLoad timing — either can still be
  // in flight when the iframe finishes loading. sendPlayers gets a new
  // identity every time either of them resolves with real data, so this
  // effect re-sends automatically once they do, instead of leaving whatever
  // (possibly empty) postMessage went out on the first onLoad as the last
  // word until someone manually hits "Resync players."
  useEffect(() => {
    if (!iframeLoaded) return;
    sendPlayers();
  }, [iframeLoaded, sendPlayers]);

  // Driven by the modal-wide "Highlight me" toggle rather than a per-
  // assignment button, so every assignment the user appears in lights up
  // (or clears) together. raidstrats.gg dims everyone else and glows the
  // given indices salmon, persisting across scene switches until cleared
  // with an empty array — that empty-array clear is what runs when the
  // toggle turns off, not a different message type.
  useEffect(() => {
    if (!iframeLoaded || myIndices.length === 0) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: "highlightPlayers",
        indices: isHighlighted ? (myIndices.length === 1 ? myIndices[0] : myIndices) : [],
      },
      "*",
    );
  }, [isHighlighted, myIndices, iframeLoaded]);

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
        {assignment.description && (
          <p className="text-[11px] font-montserrat text-slate-500 leading-relaxed pl-2.5">
            {assignment.description}
          </p>
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
              description={sub.description}
              available_slots={sub.available_slots}
              slotOffset={offset}
              players={players}
              getCharacterClass={getCharacterClass}
              myCharacterNames={isHighlighted ? myCharacterNames : undefined}
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
      <div className="relative w-[60%] shrink-0 aspect-video rounded-xl overflow-hidden border border-slate-800/50 bg-slate-900/40">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title={assignment.heading}
          className="w-full h-full"
          style={{ border: "none" }}
          onLoad={() => setTimeout(() => setIframeLoaded(true), 500)}
        />
        <button
          onClick={sendPlayers}
          title="Resync players"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 backdrop-blur-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
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
  noteUpdatedAt?: string;
  teamId?: string;
  bossId?: string;
  isAdmin?: boolean;
};

export const AssignmentsModal: FC<AssignmentsModalProps> = ({
  isOpen,
  onClose,
  assignments,
  note,
  noteUpdatedAt,
  teamId,
  bossId,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();

  // The note actually being parsed/displayed/sent to raidplan iframes —
  // deliberately buffered separately from the live `note` prop (which keeps
  // polling in the background while the modal is open, see Prep.tsx) so a
  // background update never silently swaps assignments out from under
  // someone mid-read. Only re-synced when the modal is freshly opened, or
  // when the user explicitly hits Refresh on the "updated" banner below.
  const [displayedNote, setDisplayedNote] = useState(note);
  const [displayedNoteUpdatedAt, setDisplayedNoteUpdatedAt] = useState(noteUpdatedAt);

  useEffect(() => {
    if (!isOpen) return;
    setDisplayedNote(note);
    setDisplayedNoteUpdatedAt(noteUpdatedAt);
    // Deliberately keyed on isOpen only — re-syncing whenever note/
    // noteUpdatedAt change while already open would defeat the whole point
    // of buffering them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const hasNewerNote = !!noteUpdatedAt && noteUpdatedAt !== displayedNoteUpdatedAt;

  const handleRefreshNote = () => {
    setDisplayedNote(note);
    setDisplayedNoteUpdatedAt(noteUpdatedAt);
  };

  const parsed = useMemo(
    () => (displayedNote ? cleanAndSeparate(displayedNote) : []),
    [displayedNote],
  );

  const { data: teamData } = useGetTeamById(teamId ? Number(teamId) : -1);

  // Every character name the logged-in user owns on this team — not just
  // their "main" — so "Highlight me" and the local ring highlight both
  // catch whichever of their characters actually got assigned this raid.
  const myCharacterNames = useMemo(() => {
    const set = new Set<string>();
    if (!user) return set;
    for (const player of teamData?.players ?? []) {
      if (!player.user || String(player.user.id) !== String(user.id)) continue;
      for (const character of player.characters ?? []) {
        set.add(character.name.trim().toLowerCase());
      }
    }
    return set;
  }, [teamData, user]);

  const isUserAssignedAnywhere = useMemo(
    () =>
      myCharacterNames.size > 0 &&
      assignments.some((assignment) =>
        assignmentIncludesNames(assignment, findParsedSection(parsed, assignment), myCharacterNames),
      ),
    [assignments, parsed, myCharacterNames],
  );

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsHighlighted(false);
  }, [isOpen]);

  const characterClassMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const player of teamData?.players ?? []) {
      for (const character of player.characters ?? []) {
        map.set(character.name.trim().toLowerCase(), character.class);
      }
    }
    return map;
  }, [teamData]);

  const getCharacterClass = useCallback<CharacterClassLookup>(
    (name) => characterClassMap.get(name.trim().toLowerCase()),
    [characterClassMap],
  );

  const uniqueParsedPlayerNames = useMemo(() => {
    const seen = new Map<string, string>();
    for (const section of parsed) {
      for (const raw of section.indexed_players) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!seen.has(key)) seen.set(key, trimmed);
      }
    }
    return Array.from(seen.values());
  }, [parsed]);

  const unmatchedPlayers = useMemo(
    () =>
      uniqueParsedPlayerNames.filter(
        (name) => !characterClassMap.has(name.toLowerCase()),
      ),
    [uniqueParsedPlayerNames, characterClassMap],
  );

  const rosterIsEmpty = (teamData?.players?.length ?? 0) === 0;

  const goToRoster = () => {
    navigate("/team/roster");
    onClose();
  };

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

  const actions = !isUserAssignedAnywhere && !showEditor ? undefined : (
    <>
      {isUserAssignedAnywhere && (
        <button
          onClick={() => setIsHighlighted((v) => !v)}
          title="Highlight every assignment you're in — in the raidplan and below"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-montserrat text-sm font-medium border transition-colors ${
            isHighlighted
              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {isHighlighted ? "Highlighting me" : "Highlight me"}
        </button>
      )}
      {showEditor && (
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
      )}
    </>
  );

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
        {hasNewerNote && (
          <Alert type="info" title="Assignments have been updated">
            Someone changed this note since you opened it.
            <br />
            <button
              onClick={handleRefreshNote}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Refresh
            </button>
          </Alert>
        )}
        {isAdmin && rosterIsEmpty && (
          <Alert type="info" title="Set up your roster first">
            Add your team's players and characters in the Roster tab so
            assignments can show each player's class color.
            <br />
            <button
              onClick={goToRoster}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Go to Roster →
            </button>
          </Alert>
        )}
        {isAdmin && !rosterIsEmpty && unmatchedPlayers.length > 0 && (
          <Alert
            type="warning"
            title={`${unmatchedPlayers.length} player${unmatchedPlayers.length === 1 ? "" : "s"} not found in your roster`}
          >
            {unmatchedPlayers.join(", ")} — add them in the Roster tab to show
            their class color here.
            <br />
            <button
              onClick={goToRoster}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Go to Roster →
            </button>
          </Alert>
        )}
        {!isAdmin && unmatchedPlayers.length > 0 && (
          <p className="text-xs text-slate-500 font-montserrat">
            Some players in this note aren't in the team roster yet, so their
            class colors may be missing.
          </p>
        )}
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
              Paste the NSRT string from WoWutils below (WoWutils → Setups
              view → copy the string). Assignments will update on save.
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
                getCharacterClass={getCharacterClass}
                myCharacterNames={myCharacterNames}
                isHighlighted={isHighlighted}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
