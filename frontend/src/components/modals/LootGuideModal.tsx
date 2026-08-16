import type { FC } from "react";
import { Modal } from "../Modal";
import { X as XIcon } from "lucide-react";
import { useTheme } from "../../hooks";
import { MarkdownRenderer } from "../MarkdownRenderer";

type LootGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const lootGuide = `# Loot System Guide

This app tracks **bonus roll planning** — who's sending rolls on which
bosses, in what order, and who's already wished for or obtained specific
items. It's a separate system from WowAudit/WowUtils gear wishlists (see
below), even though the vocabulary overlaps.

---

## Priority

Your **priority** on a boss is the order you're sending bonus rolls on it,
relative to your other bosses this tier — 1 is first. Two bosses can't
share the same priority for one character; if you try, the app will ask
you to use **Fix Priorities** to drag things into the order you actually
want, since that reorder can move a priority "through" another boss's
current value in ways a single edit can't.

Unsetting a priority (clearing the box, or the **Clear** button next to
it) doesn't leave a gap — everything below it shifts up automatically, the
same way finishing a boss does.

## Bonus Rolls

A simple running total of how many bonus rolls you've spent on a boss this
reset. There's no lockout or weekly reset built in — it's just a manual
counter you (or loot council) adjust as rolls happen.

---

## Per-Item / Per-Boss / Raid-Wide (Loot Council)

These three tabs are for loot council, admins, and the team owner — they
show *everyone's* standing at once, not just your own:

- **Per-Item** — who's wished for one specific item, and their priority/
  bonus rolls/obtained status.
- **Per-Boss** — every player's priority, bonus rolls, and item wishes for
  one boss.
- **Raid-Wide** — the same priority/bonus-roll data as Per-Boss, but for
  every boss in the tier at once, laid out as a character × boss matrix.

## Tier Tracker

Tracks which player has claimed each tier-set slot (head/shoulders/chest/
hands/legs), so the team can see at a glance who still needs what. Each
slot shows where the piece came from:

- **Champion / Veteran / Hero Track / Myth Track** — the gear upgrade track
  the piece dropped on (not the same axis as the Heroic/Mythic *difficulty*
  toggle used elsewhere on this page — a piece from a Heroic-difficulty kill
  can still be on the Champion track, for example).
- **Embellishment** — an embellishment item filled the slot instead of an
  actual tier piece.
- **In Vault (...)** — the piece is sitting unclaimed in the player's Great
  Vault rather than already equipped.

## BoE Sales

A simple log of Bind-on-Equip items sold, for keeping track of guild bank
income or player payouts — not connected to the bonus roll plan/priority
system.

## Audit Log

Loot council's accountability trail — every wish, obtained mark, priority
change, and bonus roll adjustment, with who made it and when.

---

## WowAudit / WowUtils — a different kind of "wishlist"

WowAudit and WowUtils are separate third-party tools some teams also use
for **droptimizer sims** (Raidbots/QE Live reports that simulate expected
gear upgrades). Their "wishlist" is a sim configuration, not a priority
list — uploading a droptimizer there tells WowAudit/WowUtils which gear
upgrades matter most for your character's simmed DPS, which is a different
question from "which boss am I sending bonus rolls on first."

A team can have either, both, or neither enabled — an admin turns them on
under **Team → Settings**, and the floating **Droptimizer** button (bottom
right, once at least one is enabled) uploads a pasted report to whichever
service(s) are turned on.

---

## Roles

- **Member** — view the team, claim a character, manage your own bonus roll
  plan/priorities.
- **Loot Council** — everything a Member can, plus every council-only tab
  above.
- **Admin** — everything a Member can, plus team settings, integrations,
  invites, and member roles.
- **Owner** — full control; set once at team creation, can't be reassigned.
`;

export const LootGuideModal: FC<LootGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colorMode } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Loot System Guide"
      subtitle="Priority, bonus rolls, loot council views, and how this differs from WowAudit/WowUtils"
      variant="neon-gradient"
      size="full"
      actions={
        <button
          onClick={onClose}
          className={`
            px-4 py-2 rounded-xl font-medium font-montserrat
            transition-all duration-200
            ${
              colorMode === "dark"
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <XIcon className="w-4 h-4" />
            Close
          </div>
        </button>
      }
    >
      <div
        className={`
          p-6 rounded-xl overflow-y-auto
          ${
            colorMode === "dark"
              ? "bg-slate-900/50 border border-slate-700"
              : "bg-white border border-slate-300"
          }
        `}
        style={{
          height: "calc(90vh - 195px)",
        }}
      >
        <MarkdownRenderer>{lootGuide}</MarkdownRenderer>
      </div>
    </Modal>
  );
};
