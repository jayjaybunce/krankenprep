package seed

import (
	"krankenprep/models"
	"time"
)

// NewsEntries is edited directly to publish new "what's new" posts — there's
// no in-app authoring UI. Title must stay unique (it's how seeding stays
// idempotent across restarts/deploys). Order in the slice doesn't matter,
// the feed sorts by PublishedAt.
var NewsEntries = []models.News{
	{
		Title: "Note editor toolbar",
		Body: `Added buttons to insert spell icons, raid plan links, and images/GIFs directly from the note editor — no more remembering to type ` + "`$`" + ` or ` + "`@`" + `.

Check the **Markdown Guide** for the full rundown.`,
		PublishedAt: time.Date(2026, 7, 18, 0, 0, 0, 0, time.UTC),
	},
	{
		Title: "Clearer assignment setup",
		Body: `A few quality-of-life fixes for admins setting up assignments:

- Explains *where* the NSRT string actually comes from (WoWutils → Setups view)
- Flags players pasted into a note who **aren't in your roster yet**
- Nudges you to set up your roster if it's empty

No more mystery blank slots.`,
		PublishedAt: time.Date(2026, 7, 18, 0, 0, 0, 0, time.UTC),
	},
	{
		Title: "WowUtils integration",
		Body: `Upload droptimizer sims straight to **WowUtils**, alongside (or instead of) WowAudit — a team can run either, both, or neither. Turn it on under **Team → Settings**.

The upload button also actually shows what's happening now: a spinner while it's in flight, and the real reason if it fails, instead of going quiet and leaving you guessing.`,
		PublishedAt: time.Date(2026, 8, 16, 0, 0, 0, 0, time.UTC),
	},
	{
		Title:       "Unset a boss's bonus roll priority",
		Body:        `Done with a boss, or just want to pause it for a bit? Clear its priority right from the Bonus Roll Planner, or drag it out of the list entirely in **Fix Priorities** — no more priorities stuck in place with no way back out.`,
		PublishedAt: time.Date(2026, 8, 16, 0, 0, 0, 0, time.UTC),
	},
	{
		Title: "New team? Start here",
		Body: `A first-time visit now actually explains what this app does, with a direct path to create your team instead of hunting for it in Profile. Team owners get a setup checklist right on the Team page — invite teammates, build your roster, get a character claimed — that tracks real progress and disappears once you're set up.

Also new:
- Role descriptions when assigning Member / Admin / Loot Council
- A **Loot Guide** covering priority, bonus rolls, and how this differs from WowAudit/WowUtils wishlists
- Clearer guidance throughout Roster and Team invites for anyone joining a team for the first time`,
		PublishedAt: time.Date(2026, 8, 16, 0, 0, 0, 0, time.UTC),
	},
}
