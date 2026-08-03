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
}
