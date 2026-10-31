# What the crows say — Demo GDD

Version 0.2 · three in-game days, built for playtesting the core loop

---

## 1. Purpose

The full game spans many in-game days. This demo covers three days, and its only job is to help us decide which mechanics to keep, change or drop. Specifically, playtests should answer these questions:

1. **Desk cutouts.** Is cutting snippets out of newspapers and conversations and arranging them on the desk useful and enjoyable? Cutouts are now also used in conversations (cutout reply slots, section 7.5): is that fun and readable, or should information gathering work differently?
2. **Conversations.** Do conversations with 1–3 choices per turn and variable length feel good to read and play?
3. **Seating.** Does choosing where to seat a guest create an interesting decision?
4. **Night management.** Does assigning beds or kicking guests out feel meaningful?
5. **Affinity.** Do the visible meters make choices feel like they matter?
6. **Stress.** Does the bartender stress meter and gated replies feel fair and readable? Does the morning reset make each day feel like a fresh start, or does it remove the consequence?
7. **Corkboard.** Is pinning cutouts/scrolls and linking them with coloured string useful?
8. **Colour coding.** Do colour and icon help the player see at a glance where a piece of information comes from and which story it belongs to?
9. **Cutout replies.** Is dragging a cutout into an empty reply bubble understandable, and does choosing *whose version to spread* feel like a decision?
10. **Lounge.** Is the lounge discoverable, and is inviting a guest to the bar an interesting decision (when to invite, whom to let leave)?
11. **Multi-day.** Does state carrying over between days and the growing number of tables feel like progress?

Because the goal is fast iteration, all game content (newspapers, guests, dialogue, schedule, pairings, night effects, summary text) lives in data files and Ink scripts, never hardcoded in components. Changing a number or a sentence must never require touching game logic.

---

## 2. Setting

A medieval pub at the only mountain crossroads between three kingdoms. Mountains separate the kingdoms, so anyone travelling between them passes through this pub. The kingdoms are at peace, but the peace is fragile. The player is the bartender: he reads the three kingdoms' newspapers, talks to travellers, decides where they sit and where they sleep, and his choices shift how the kingdoms and the guests see him.

The real kingdom names, events, guests and dialogue will be written in a later script phase. Until then the build uses placeholder content (section 17).

---

## 3. Platform and technology

| Piece | Role | Notes |
|---|---|---|
| React | Screens and UI components | Renders backgrounds, portrait, chat, desk, minimap, lounge, overlays |
| TypeScript | Language | Strict mode; typed game state |
| Vite | Dev server and build | React + TS template, no Next.js; `base: '/CROWS/'` for GitHub Pages |
| Zustand | Game state store | One store for phase, day, meters, guests, desk items, seating, lounge, night choices, event log |
| inkjs 2.4 | Dialogue runtime | Loads compiled Ink JSON; exposes text, choices, line **and choice** tags, variables, state save/load |
| Inky | Writing tool for Ink | Used to write and test conversations; not part of the build |

Not used in the demo: Howler.js (no sound), localStorage (no saves). The three days run in memory in one browser session.

**Running for playtests.** `npm run dev -- --host` (or `vite --host`). Testers on the same network open `http://<host-ip>:5173/CROWS/`. Every push to `main` is also built and deployed to GitHub Pages by `.github/workflows/deploy.yml` (`https://o-ludvik.github.io/CROWS/`); keep `base` in `vite.config.ts` and relative asset paths (`art/...`) so both work. No backend.

**Stage and scaling.** The game is designed for a fixed 1920×1080 stage. A `Stage` component scales the stage uniformly to fit the browser window (`scale = min(innerWidth / 1920, innerHeight / 1080)`), centred, with black bars where the aspect ratio differs. All positions in this document are stage coordinates. Pointer coordinates used for drag-and-drop must be converted from screen space to stage space by dividing by the current scale. Drops on the reply slot are hit-tested with `document.elementFromPoint` on screen coordinates, so they are exact at every scale.

**Input.** Mouse only. Clicks, hovers and drag-and-drop. No keyboard input except the debug toggle (and, in dev builds only, the day-jump keys of section 13.3), and no text fields anywhere.

**Language.** All in-game text is Czech. The font (EB Garamond via `@fontsource`) covers Czech diacritics and is bundled locally so the game does not depend on a CDN. All UI strings live in `strings.cs.json` (section 14.8).

**Presentation.** Static screens, minimal motion. Allowed motion: fade-to-black transitions (section 13.2), the portrait fade-in on guest change (including a paused guest returning), the ~300 ms horizontal slide of the pub top strip between corkboard, main view and lounge (sections 5, 6.5, 7a), and the browser's native scrolling in the chat log. A rejected cutout jumps straight back to its place (no bounce animation); the slot bubble turns red for ~700 ms.

---

## 4. Day flow

The demo is a state machine run three times:

```
TITLE ─► [ MORNING/DESK ─► DAY (conversations, seating, lounge) ─► DAY END ─► NIGHT ─► SUMMARY ] × 3 ─► END
                ▲                                                                              │
                └────────────────────────── "Další den" (after days 1 and 2) ──────────────────┘
END = the day-3 summary with the ending blocks and "Hrát znovu" (full reset to day 1)
```

1. **TITLE.** Title screen with the game name and a "Začít" button. Shown only on first launch.
2. **MORNING/DESK** (phase `desk`). Stress resets to 0 (logged as `morning reset`). The day's scrolls (from `days.json`) are added to the desk; scrolls, cutouts and the corkboard from earlier days stay. Articles whose `when` condition is false are hidden for good (section 14.3). Guests with a follow-up for today appear in the lounge (section 7a). The day label "Den {n}" is shown at the top of the pub screen. The player reads, cuts and arranges, then clicks "Otevřít hospodu".
3. **DAY** (phases `conversation` / `seating`). Today's queue arrives one guest at a time (conversation → seating). At any time while the pub is open the player can switch to the lounge and invite a guest to the bar; the invited guest cuts in ahead of the current one (section 7a).
4. **DAY END** (phase `dayEnd`). When the queue is empty and nobody is at the bar, the portrait area shows the closed door with the hint "Fronta je prázdná. Než zavřete, můžete ještě zajít do lounge." and a "Zavřít hospodu" button. The player can still visit the lounge and invite someone. "Zavřít hospodu" fades to NIGHT; guests still waiting in the lounge leave (event log + `leftLounge`, section 14.7).
5. **NIGHT.** One row for every guest seated today (queue + invited from the lounge). See section 11.
6. **SUMMARY.** "Shrnutí dne {n}". After days 1 and 2 the button is "Další den" (fade to the next morning). After day 3 the same screen adds the heading "Konec dema", the ending blocks and "Hrát znovu", which resets everything and starts day 1 again.

The desk (scrolls, cutouts, trashcan) is interactive in MORNING, DAY and DAY END. It is not interactive while the seating overlay is open.

---

## 5. Pub screen layout

The pub screen is used for MORNING, DAY, DAY END and (underneath the overlay) seating. The layout follows the Papers, Please model: the person in front of you at the top, your workspace at the bottom.

The **desk** occupies the bottom quarter of the stage (height 270). The **top strip** (height 810, width 4800) is a sliding row wider than the stage:

| Region | Strip x | y | w | h | Contents |
|---|---|---|---|---|---|
| Corkboard | 0 | 0 | 960 | 810 | Investigation board (section 6.5) |
| Portrait area | 960 | 0 | 600 | 810 | Closed door + "Otevřít hospodu" (MORNING), guest portrait (DAY), door + "Zavřít hospodu" (DAY END) |
| Meters panel | 1560 | 0 | 420 | 810 | Affinity + stress meters (section 9) |
| Chat panel | 1980 | 0 | 900 | 810 | Conversation log, choice buttons and slot bubbles |
| Lounge | 2880 | 0 | 1920 | 810 | Guests waiting with a follow-up (section 7a) |
| Desk | stage 0 | 810 | 1920 | 270 | Always visible in all three views; does not slide |
| Trashcan | desk-relative | | 140 | 140 | Drop target inside the desk, bottom-left |
| Minimap | desk-relative | | 220 | 220 | Fixed seating map inside the desk, bottom-right |

The strip has three positions (`view` in the store):

| View | Translate | Visible | Arrows |
|---|---|---|---|
| `cork` | 0 | corkboard + portrait | right edge → `main` |
| `main` | −960 | portrait + meters + chat | left edge → `cork`; right edge → `lounge` (with a red badge showing how many guests wait) |
| `lounge` | −2880 | lounge | left edge → `main` |

The chat panel has extra right padding so the lounge arrow never covers bartender lines. Inviting a guest, closing a conversation and the start of each morning switch back to `main`. These coordinates are a starting point and can be tuned once real art exists. The trashcan and minimap are fixed and always render above desk items.

---

## 6. Desk, scrolls and cutouts

### 6.1 Scrolls

Every morning the scrolls listed for that day in `days.json` are added to the desk (any number; the placeholder story has three on days 1–2 and two on day 3). Each scroll belongs to one kingdom and holds one or more articles. Scrolls from earlier days stay until the player throws them away. No new scrolls arrive during the day.

Scrolls can be dragged around the desk. A click (pointer moved less than 5 px between down and up) opens the scroll in the **reader**: a large unrolled parchment overlay centred on the stage (roughly 1000×900), showing the kingdom's icon and name, the newspaper title and the articles. The reader closes with a "Zavřít" button or a click outside it.

A rolled scroll shows its kingdom's icon in the corner and a strip in the kingdom colour (section 6.6). In the reader the parchment has a kingdom-coloured top edge; an article that belongs to a quest line has a quest-coloured bar along its left side, and a segment with its own quest is underlined in the quest colour.

### 6.2 Cutting snippets

Articles are made of text segments. Some segments are marked as cuttable in the data (predefined snippets; the player cannot select arbitrary text). Hovering a cuttable segment shows a dotted outline and a scissors cursor. Clicking it creates a new cutout on the desk. The reader stays open so the player can cut several snippets in a row.

The same snippet can be cut any number of times; each click creates a new, independent cutout. A scroll can be reopened as often as the player likes until it is thrown away.

Cuttable guest lines in conversations work the same way (section 7.3).

### 6.3 Cutouts

A cutout is a small paper slip with the snippet's text, fixed width of about 260 px, height fitting the text, body font around 18 px. New cutouts spawn at a random position within the central part of the desk and are placed on top.

Each cutout carries, copied from its source, an optional **topic** and **claim** (used by reply slots, section 7.5) and an optional **quest** line. It takes its colour and icons from its source (section 6.6):

- Scroll cutout: kingdom icon; quest colour if the segment (or its article) belongs to a quest, otherwise the kingdom colour.
- Conversation cutout: the guest's small icon and the guest's kingdom icon. Until the guest's faction is revealed the kingdom icon is a question mark and the kingdom colour is not applied; after `#reveal:faction` every existing cutout from that guest updates.

Cutouts can be dragged anywhere within the desk bounds and freely overlap and stack. The item being dragged, or last clicked, moves to the top of the stack. If a cutout is dropped with its centre over the minimap, it is pushed just outside the minimap so it never ends up hidden under it. A cutout lifted above the desk (in the main view) follows the pointer as a floating copy so it can be dropped on a reply slot; when released anywhere above the desk it returns to where it was picked up.

Hovering a cutout shows a tooltip with its source and quest line, for example "Zdroj: Svitek – Velesie · Linka: Most přes Vranku" or "Zdroj: Rozhovor – Hana" (or "Zdroj: Rozhovor – ???" if the guest's name is not yet known).

There is no limit on the number of cutouts. Desk space is the only natural limit.

The game reads cutouts in exactly one place: reply slots in conversations (section 7.5). Apart from that they have no gameplay effect. Using a cutout in a slot does not consume it. Cutouts and the corkboard persist across all three days and reset on "Hrát znovu".

### 6.4 Trashcan

Dropping a cutout or a scroll on the trashcan removes it permanently. The trashcan highlights while something is being dragged over it. A thrown-away scroll can no longer be read; existing cutouts from it stay on the desk. The trashcan only accepts drops while the item is over the desk (not the corkboard).

### 6.5 Corkboard

The corkboard is the bartender's investigation board on the left of the sliding top strip. The same scrolls and cutouts that live on the desk can be dragged onto the corkboard and back. Items on the corkboard show a **pin**; the player can connect two pins with coloured string (three colours: red, twine/yellow, blue). Select a colour, then click two pins to link them; right-click an existing string to remove it. Corkboard items keep their colour coding and icons.

Hovering a cutout on the corkboard shows its text in a tooltip. Clicking a cutout opens a full-screen parchment reader with the note text. Scrolls keep the normal scroll reader.

Layout and strings persist across all three days and reset on "Hrát znovu". The corkboard itself has **no gameplay effect**. A cutout cannot be dragged from the corkboard into a reply slot (the chat is off-screen while the board is open); slots take cutouts from the desk.

### 6.6 Colour coding

Every kingdom has a `color` and an `icon` (`kingdoms.json`). Every quest line has an `id`, a `name` and a `color` (`quests.json`); quest lines have no icon.

| Item | Colour | Icons |
|---|---|---|
| Rolled scroll / reader | kingdom | kingdom |
| Scroll article / segment in a quest | quest (bar / underline in the reader) | – |
| Scroll cutout | quest if any, else kingdom | kingdom |
| Conversation cutout | quest if any, else kingdom once the faction is revealed, else neutral paper | guest + kingdom (or `?`) |
| Guest chat line tagged `#quest` | quest (bar on the left of the bubble) | – |
| Slot tag under a bartender bubble | as the cutout used | as the cutout used |

Colour is applied as an 8 px left border plus a 14 % tint of the paper, so text stays readable. Icons are 28 px circles on the top-right corner of the item.

---

## 7. Conversations

### 7.1 Opening and closing

When a guest arrives from the queue, the engine inserts the bartender's generic greeting as the first line of the chat log ("Zdravím, čím posloužím?"), then starts the guest's Ink knot for the visit. A guest invited from the lounge gets `greetingReturning` instead ("Á, vy jste tu ještě. Co pro vás můžu udělat?"). Writers do not repeat the greeting in Ink; each visit begins with the guest's reply.

When the knot reaches its end, the engine shows a single choice button with the bartender's closing line ("Pojďte, najdu vám místo."). Clicking it opens the seating overlay. After the guest is seated, the chat log is cleared (or replaced by a paused guest's log, section 7a).

### 7.2 Chat panel

The chat panel is a scrollable log. New lines are appended at the bottom and the panel auto-scrolls to the newest line. The player can scroll up to reread the whole conversation. Guest lines are left-aligned with the guest's name (or "???") as the label; bartender lines are right-aligned with the label "Hostinský".

Lines produced between two choice points appear all at once (no typewriter effect). Below the last line come the reply slots (one bubble per slot topic, section 7.5), then the normal choice buttons. Clicking a choice appends its text to the log as a bartender line and continues the story.

**Gated choices.** Some options are locked (not rendered) based on Ink conditions that read synced variables: `stress`, kingdom affinity (`aff_k1`…`aff_k3`), current guest affinity (`aff_self`), any guest met so far (`aff_<guestId>`) and the current day (`day`, 1–3). Writers gate with Ink syntax such as `* { stress < 5 && aff_k1 >= 0 } [Text]`. The engine shows only choices Ink exposes; there is no greyed-out locked UI.

**Stress feedback.** Choice buttons do not preview stress changes. When a chosen answer changes stress, a small circle with `+N` or `−N` appears in the corner of that bartender chat bubble.

There is no time pressure.

### 7.3 Cuttable guest lines

A guest line tagged `#cut` in Ink is a predefined snippet. It shows the same hover affordance as cuttable newspaper segments, and clicking it creates a cutout with the guest as its source. `#cut:<topic>:<claim>` also gives the cutout a slot topic and claim, and `#quest:<questId>` on the same line gives it a quest line. A plain `#cut` cutout has no topic and fits no slot. Bartender lines are never cuttable. Lines can be cut repeatedly, like scroll snippets.

### 7.4 Ink conventions

See section 14.4 for the tag reference. The engine runs the standard inkjs loop: `Continue()` while `canContinue`, read `currentTags` for each line, apply tags, append the line; then render `currentChoices`; on click, call `ChooseChoiceIndex()` and repeat.

Writers use bracketed choice text (`* [Choice text]`) so Ink does not echo the choice; the engine appends the choice text itself as the bartender's line. **Choice tags go inside the brackets** (`* [Text #slot:topic:claim]`); a tag after `]` belongs to the first line of the branch, not to the choice.

**One story per guest, one knot per visit.** Each guest has one Ink file. The root content is just `-> END`; every visit is a knot (`=== day1 ===`, `=== followup_day2 ===`, …) named in `days.json`. The engine keeps the story state per guest across visits (`story.state.toJson()` when a visit ends, `LoadJson` + `ChoosePathString(knot)` on the next one), so `VAR`s set on day 1 are still there on day 3. A guest's first visit says the name in its first line with `#reveal:name`.

### 7.5 Cutout reply slots

A reply can be a **slot**: instead of a button, the chat shows an empty dashed bubble labelled with the slot's topic (e.g. "Proč spadl most?") and the hint "Přetáhněte sem výstřižek". The player drags a cutout from the desk onto it.

In Ink a slot is a group of choices tagged with the same topic:

```ink
* [Velesští. Lukovinský posel píše o vorařích se sekerami. #slot:bridge_cause:k1_axe]
    Velesští! Ti by podřízli i vlastní matku. #aff:k1:-2 #aff:k2:+1
    ~ blames = "k1"
* [Lukovina. Lana byla shnilá. #slot:bridge_cause:k3_rot]
    Přesně tak. #aff:k3:-2
* [Tohle jsem četl. #slot:bridge_cause:*]
    Noviny. Každé píšou, co se hodí jejich pánovi.
* [Nevím.]
    Tak to zjistěte.
```

The engine does not render slot choices as buttons; it shows one bubble per topic. When a cutout is dropped on the bubble:

1. If the cutout's topic differs from the bubble's (or it has none), the bubble turns red with "Tohle sem nepatří." for ~700 ms, the cutout jumps back to its place, nothing is chosen.
2. Otherwise the engine picks the choice whose claim equals the cutout's claim; if none, the choice with claim `*`; if neither exists, the cutout is rejected as in 1.
3. The picked choice's text is appended as the bartender's line with a small **cutout tag** beneath it (colour + icons + the cutout's text, truncated) so it is visible whose information the bartender spreads. The cutout is not consumed and returns to where it was picked up.
4. The engine records `{ topic, claim, cutoutId, day, guestId }` in `usedClaims` (for the `usedClaim` condition) and writes the slot, the claim, the source and the picked choice to the event log.

Effects (affinity to the kingdom whose version is spread, stress, flags such as `~ blames = "k1"`) live in the Ink branch as usual (`#aff`, `#stress`). Several sources can share a topic with different claims; the placeholder story has five claims for `bridge_cause` from three newspapers and two guests (section 17).

A slot stands next to normal choices. **Authoring rule:** every choice point must also offer at least one normal (non-slot) choice, because the player may have no fitting cutout. `npm run check` fails if a choice point consists only of slots. The slot shows only its topic, never which cutout fits.

---

## 7a. Lounge

A room to the right of the main view (section 5). Background `lounge_bg.png`, heading "Lounge", up to four guests shown as clickable portraits (300×310) at fixed spots with their name ("???" if unknown) underneath and a name – faction tooltip. With nobody waiting it shows "Nikdo tu nečeká."

**Who appears.** On the morning of day N, a lounge entry from `days.json` for day N is used if the guest (a) slept in a bed last night (night N−1) and (b) its optional `when` condition holds. A guest can have several entries (for example one for "shared a room with X" and a fallback); the first entry that matches wins. `when` is evaluated against the previous day (section 14.7). Day 1 has no lounge guests. Lounge guests stay for that one day only.

**Inviting.** Clicking a portrait selects it and shows a "Pozvat k pultu" button below it (a second click or a click elsewhere deselects). Inviting is possible while the pub is open (`conversation` or `dayEnd`) and outside the seating overlay; otherwise the button is disabled and the reason is shown under it ("Hospoda je zavřená." / "Nejdřív doběhněte rozhovor s pozvaným hostem.").

**Cutting in.** The invited guest goes straight to the bar and the view slides back to the main view. If a queue guest is at the bar mid-conversation, that conversation is paused: the engine stores the Ink state (`story.state.toJson()`) and the chat log. The invited guest has a full conversation (with `greetingReturning`) and is seated; then the paused guest's portrait fades back in, their chat log is restored and the conversation continues at the same choice point (choices are rebuilt from the restored state; synced variables are refreshed, so meter changes made in between count). If the bar is empty, the invited guest simply comes in. At most one conversation can be paused: while a guest invited from the lounge is at the bar, further invites are blocked.

**Leaving.** Guests still in the lounge when "Zavřít hospodu" is clicked leave: they are logged (`… left without being invited`), recorded in `leftLounge` and do not appear on the night screen.

The right arrow in the main view shows a red badge with the number of waiting guests.

---

## 8. Guests

Guests come from a per-day schedule in `days.json` (section 14.9), not a random draw. Each day has a **queue** (optionally `shuffle: true`; each entry may have a `when` condition evaluated against the previous day) and a list of **lounge** follow-ups. They arrive one by one; the next queue guest walks in immediately after the previous one is seated (or after a paused guest finishes).

Each guest has an id, name, faction (one of the three kingdoms), portrait, optional small icon, starting affinity and an Ink story (section 14.2). A guest may come on several days. Their meter, name/faction reveal and Ink variables persist for the whole demo.

**Reveal.** The portrait is always visible. The name and faction start hidden and display as "???" everywhere (chat label, meters panel, minimap tooltip, lounge, night screen, cutout source and icon) until revealed by the Ink tags `#reveal:name` and `#reveal:faction`. By writing convention, a guest's first visit says the name in its first line; the faction is revealed whenever the script decides.

The game logic always knows each guest's true faction (it uses it for seating fallbacks) regardless of what the player has seen.

**Capacity.** For every day, queue length + number of distinct lounge guests must not exceed the seats available that day (`tables × 4`). This is validated at start-up (section 14.11).

---

## 9. Affinity and stress meters

### 9.1 Meters

All meters use the scale −10 to +10, clamped at both ends:

1. **Stress meter (1).** How tense the bartender is. Starts at 0 and **resets to 0 every morning** (applied through `applyEffects` and logged as `morning reset`, so the meter shows the drop, e.g. "0 (−6)"). Changed only by Ink `#stress` tags during conversation. Does not change seating or night mechanics; the day summary reads the stress at the end of the day.
2. **Kingdom meters (3).** How each kingdom views the bartender. Starting values come from data (default 0). Persist across days.
3. **Guest meters.** How a guest views the bartender. Created from the guest's starting affinity when the guest first arrives, then persist across days.

### 9.2 What changes them

Affinity (kingdom/guest) can change from a line or choice in a conversation (Ink `#aff` tags), including slot choices (section 7.5), a seating decision (pairing rules) and a night decision (night effects). Stress changes only from Ink `#stress:+N` / `#stress:-N` tags and the morning reset. `#aff:<guestId>` affects any guest met so far and is ignored for guests not met yet.

All changes go through one function, `applyEffects(effects, source)`, which clamps values, records the change for display and writes an entry to the event log.

### 9.3 Display

The meters are always visible in the demo. The meters panel shows the stress meter first, then the three kingdom meters, then a meter for each guest who has arrived **today** (queue + invited), in arrival order, labelled with the guest's name or "???". The guest at the bar is highlighted. Guests from earlier days who did not come today are not shown (the debug panel shows all meters).

Each meter is a horizontal bar from −10 to +10 with a centre mark and the numeric value. The most recent change to a meter is shown next to it, for example "(+2)", until that meter changes again. Stress changes from a dialogue answer are also shown as a badge on that bartender chat bubble (section 7.2).

The meters panel is also visible on the seating overlay, the night screen and the summary screen.

---

## 10. Seating

### 10.1 Layout

The pub has up to 2 tables with 4 seats each. Seats are indexed 0–3 (Stůl 1) and 4–7 (Stůl 2). The number of usable tables comes from `days.json` (`tables`): in the placeholder story day 1 has only Stůl 1, days 2–3 both. All seats are emptied every morning. Seating is final until the next day.

### 10.2 Minimap

A fixed square in the bottom-right corner of the desk shows both tables and their seats. A table not available today is drawn faded with the label "Stůl 2 – zatím nemáte" and cannot be used. Occupied seats show a small portrait. Hovering an occupied seat shows a tooltip with the guest's name and faction ("???" if unrevealed). The minimap cannot be moved and cannot be used to seat anyone outside the seating phase.

### 10.3 Seating phase

After the closing line, the minimap expands into a full-screen overlay (instant switch, no animation). The overlay shows the tables large and easy to click (a locked table faded and not clickable), the current guest's portrait and name in a corner, and the heading "Kam posadíte hosta?". Clicking an empty seat selects it (highlight); clicking another empty seat changes the selection. The "Usadit" button confirms. Occupied seats are not selectable but still show hover tooltips.

### 10.4 Pairing effects

"Neighbours" means every guest at the same table. When a guest is seated, the engine evaluates one pairing for each guest already sitting at that table:

1. If `pairings.json` has a specific rule for those two guests, that rule applies.
2. Otherwise, the faction fallback rule for their two kingdoms applies (same kingdom, or a specific pair of kingdoms).

A rule can move both guests' meters and any kingdom meters, positively (allies) or negatively (enemies). Effects apply immediately and are visible in the meters panel. The engine also records who shared a table, so summary blocks can react to it. With a single table every guest is everyone's neighbour, which is the point of day 1: the player cannot keep enemies apart and has to manage them in conversation.

After confirming, the overlay closes and the next guest's portrait fades in (or the paused guest returns). When the queue is empty the day moves to DAY END (section 4).

---

## 11. Night management

The night screen is a separate full screen with a night illustration, the heading "Noc – kde budou hosté spát?", the meters panel and one row for every guest seated today (queue + invited from the lounge; not guests who left the lounge). Each row shows the guest's portrait thumbnail, name and faction ("???" if unrevealed) and a dropdown with these options:

| Value | Label |
|---|---|
| `r1a` | Pokoj 1 – postel A |
| `r1b` | Pokoj 1 – postel B |
| `r2a` | Pokoj 2 – postel A |
| `r2b` | Pokoj 2 – postel B |
| `kick` | Vyhodit |

Each bed can hold one guest: a bed chosen by one guest is disabled in the other dropdowns. Any number of guests can be kicked out (with more than four guests some must be). The "Hotovo" button is enabled only when every guest has an outcome.

On "Hotovo" the engine applies each guest's night effects from `night.json` (one set for getting any bed, one for being kicked out; optionally overridden for a specific day, section 14.6). Guests sharing a room are recorded as roommates. The whole day — present guests, seats, night outcomes, invited and left lounge guests — is stored as `history[day]`; the next morning reads it to decide who appears in the lounge, which queue entries and articles apply, and summary conditions can refer back to it. Roommates affect only the summary text and which follow-ups unlock, not the meters. The game then fades to SUMMARY.

---

## 12. Summary

The summary screen shows the heading "Shrnutí dne {n}", a continuous text wall on the left, the final meter values on the right and the button for the next step: "Další den" after days 1–2, "Hrát znovu" after day 3.

The text is assembled from authored blocks in `summary.json` (section 14.7). The engine evaluates every block in file order and includes each block whose condition is true, joining them as paragraphs. A block's optional `day` field limits it to one day (`1`–`3`); blocks without `day` are evaluated every day; blocks with `"day": "final"` are the ending. After day 3 the screen shows the day-3 blocks, then the heading "Konec dema" and the final blocks.

Conditions can check night outcomes, roommates, table-mates, meter values (including `stress`), Ink variables, which guests were present, the current day, lounge invites and departures, and which claims the player spread through slots. Guest-day conditions default to the day being summarised and can name an earlier day explicitly.

"Hrát znovu" resets all state to initial values (meters, desk, corkboard, reveals, Ink states, history) and starts the morning of day 1.

---

## 13. Title, transitions and debug

### 13.1 Title screen

A background, the title "What the crows say" (Czech: "Co říkají vrány") and a "Začít" button that fades to the morning of day 1.

### 13.2 Transitions

Fade to black and back (about 400 ms each way): title → day 1 morning, desk → first guest, last seating → (nothing; DAY END is in place), "Zavřít hospodu" → night, night → summary, summary → next morning, "Hrát znovu" → day 1 morning. Guest changes at the bar (next guest, invited guest, paused guest returning) use the portrait fade-in. Main view ↔ corkboard ↔ lounge use the strip slide, not a fade. Opening and closing the scroll reader and the seating overlay are instant.

### 13.3 Debug panel

A read-only overlay toggled by the physical key under Esc (`event.code === "Backquote"`, which works regardless of keyboard layout, including Czech). It shows the last 20 event log entries (meter changes, morning resets, lounge invites/departures, paused/returning guests, slot uses) and: phase; day; table count; view; remaining queue; lounge (`guest:knot`); invited and left today; guest at the bar and the knot; paused conversation; today's guests; all meter values; reveal flags; seats; tonight's assignments; night history per day; the last used slot claims; the current guest's Ink tags and live variables; Ink variable snapshots per guest.

**Day jump (dev builds only, documented exception to "mouse only").** With the debug panel open, keys `1`–`3` restart the game and jump to the morning of that day. Earlier days are played automatically: first non-slot choice everywhere, first free seat, beds in arrival order (the fifth guest onwards is kicked), nobody invited from the lounge. It is compiled out of production builds (`import.meta.env.DEV`).

---

## 14. Data and content formats

### 14.1 Folder structure

```
src/
  main.tsx, App.tsx
  store/gameStore.ts      Zustand store + game engine: days, phases, Ink runner, tags, applyEffects,
                          pairings, lounge/pause, slots, night, desk actions
  engine/                 pure modules (no store/content imports), runnable in node
    summary.ts            conditions + summary assembly
    slots.ts              choice parsing (#slot), slot matching
    days.ts               queue/lounge selection, start-up content validation, Ink knot/tag scanning
    engine.check.ts       self-check (npm run check)
  screens/                TitleScreen, PubScreen, NightScreen, SummaryScreen
  components/             Stage, Desk, Corkboard (+ DragGhost), ScrollReader, NoteReader, ChatPanel (+ CutoutSlot),
                          MetersPanel, Tables, SeatingOverlay, Lounge, IconBadge (colour/icon helpers), DebugPanel
  content/
    index.ts              typed access + t() + start-up validation
    kingdoms.json, guests.json, quests.json, topics.json, days.json, scrolls.json,
    pairings.json, night.json, summary.json, strings.cs.json
    ink/                  <guestId>.ink (source) → <guestId>.json (compiled, committed)
scripts/
  compile-ink.mjs         npm run ink
  check-content.ts        npm run check (content part)
public/
  art/                    placeholder images with fixed file names (section 16)
  art/icons/              kingdom, guest and "unknown" icons
```

`npm run ink` compiles every `src/content/ink/*.ink` to JSON with the compiler bundled in inkjs (`inkjs/full`). Commit both files; `npm run check` fails if a `.json` is stale.

### 14.2 kingdoms.json and guests.json

```json
[
  { "id": "k1", "name": "Velesie",  "startAffinity": 0, "color": "#8b2e2e", "icon": "art/icons/k1.png" },
  { "id": "k2", "name": "Kamenec",  "startAffinity": 0, "color": "#2e4f7a", "icon": "art/icons/k2.png" },
  { "id": "k3", "name": "Lukovina", "startAffinity": 0, "color": "#3f6b35", "icon": "art/icons/k3.png" }
]
```

```json
[
  {
    "id": "hana",
    "name": "Hana",
    "faction": "k3",
    "portrait": "art/guest_hana.png",
    "icon": "art/icons/guest_hana.png",
    "startAffinity": 0,
    "ink": "hana"
  }
]
```

`icon` is optional; without it the portrait is scaled down.

### 14.3 scrolls.json

Each scroll belongs to one kingdom. Articles consist of paragraphs; each paragraph is a list of segments rendered inline. Segments with `"cut": true` are cuttable snippets and need a stable `id`. Which day a scroll arrives is set only in `days.json` (one source of truth; scrolls have no `day` field).

- `article.quest` / `segment.quest` – quest line (colour). A segment inherits its article's quest.
- `segment.topic` + `segment.claim` – slot topic and claim of the cutout (cuttable segments only).
- `article.when` – a condition (section 14.7) evaluated once on the morning the scroll arrives, against the previous day. If false the article is hidden. This is how newspapers react to the player's earlier choices.

```json
{
  "id": "velesie_d2",
  "kingdom": "k1",
  "title": "Velesský hlásník",
  "articles": [
    {
      "headline": "I hostinský proti nám",
      "quest": "bridge",
      "when": { "usedClaim": ["bridge_cause", "k1_axe"] },
      "paragraphs": [
        [
          { "text": "Hostinský U Tří vran prý tvrdí, že most podťali Velesští. " },
          { "id": "v2_s2", "text": "Vorařské cechy vyhlásily hospodě bojkot.", "cut": true }
        ]
      ]
    }
  ]
}
```

```json
{ "id": "l1_s1", "text": "Večer předtím viděli u rokle velesské voraře se sekerami.", "cut": true,
  "topic": "bridge_cause", "claim": "k1_axe" }
```

### 14.4 Ink tag reference

| Tag | Where | Meaning |
|---|---|---|
| `#cut` | guest line | This line is a cuttable snippet |
| `#cut:<topic>:<claim>` | guest line | Cuttable snippet with a slot topic and claim |
| `#quest:<questId>` | guest line | Line belongs to a quest line (bubble bar; cutouts get the quest colour) |
| `#slot:<topic>:<claim>` / `#slot:<topic>:*` | **inside the choice brackets** | The choice is picked by dropping a cutout (section 7.5) |
| `#reveal:name` | line | Reveal the current guest's name |
| `#reveal:faction` | line | Reveal the current guest's faction |
| `#aff:self:+2` | line | Change the current guest's meter |
| `#aff:k1:-1` | line | Change a kingdom meter (`k1`, `k2`, `k3`) |
| `#aff:<guestId>:+1` | line | Change another guest's meter (ignored if that guest has not been met yet) |
| `#stress:+2` / `#stress:-1` | line | Change the bartender stress meter |
| `#bartender` | line | This non-choice line is spoken by the bartender, not the guest |

Several tags can be attached to one line. To make choosing an option change a meter, put the tag on the first line inside that choice's branch. Unknown tags log a console warning at runtime and are reported by the start-up validation.

**Optional variable sync.** If a story declares any of `VAR stress`, `VAR aff_self`, `VAR aff_k1`…`aff_k3`, `VAR aff_<guestId>` or `VAR day`, the engine writes the current values into them when a visit starts (or resumes) and after every effect, so dialogue can branch and **hide choices** with Ink conditions. `aff_<guestId>` is only written for guests already met, so a default such as `VAR aff_bertold = -99` lets a story test "has Bertold arrived?" (`{aff_bertold > -99}`). When a visit ends, the engine stores a snapshot of all the story's global variables under the guest's id (for summary and `when` conditions) and keeps the full story state for the guest's next visit.

Minimal example:

```ink
VAR stress = 0
VAR told_saw = false

-> END

=== day1 ===
Hana. Jen Hana. Nemáte tu místo u kamen? #reveal:name
Všichni říkají, že to Lukovina nechala shnít. #cut:bridge_cause:k3_rot #quest:bridge
* {stress < 6} [Věřím vám. Co jste viděla?]
    Lano bylo nařezané pilou. #cut:bridge_cause:sawn #quest:bridge #aff:self:+1
    ~ told_saw = true
* [Tohle psaly noviny. #slot:bridge_cause:*]
    Noviny nebyly u mostu. #aff:self:-1 #stress:+1
* [Noviny píšou něco jiného.]
    Noviny nebyly u mostu. Já ano. #aff:self:-1
- -> END

=== followup_day2 ===
Ráno jsem šla k mostu. Přinesla jsem kus lana.
-> END
```

### 14.5 pairings.json

Specific pairs take priority; the faction fallback applies to any pair without a specific rule. In each rule, `a` and `b` are the two guests' meters (in the order listed in `guests` for specific pairs). Kingdom keys are optional.

```json
{
  "pairs": [
    { "guests": ["ota", "vojtech"], "effects": { "a": -2, "b": -2, "k1": -1, "k2": -1 } },
    { "guests": ["hana", "vojtech"], "effects": { "a": 1, "b": 1 } }
  ],
  "factionFallback": {
    "same":  { "a": 1,  "b": 1 },
    "k1-k2": { "a": -1, "b": -1 },
    "k1-k3": { "a": 0,  "b": 0 },
    "k2-k3": { "a": -1, "b": -1, "k2": -1, "k3": -1 }
  }
}
```

### 14.6 night.json

Per guest, effects for getting any bed and for being kicked out. `self` is that guest's meter. An optional `day<N>` entry overrides both for that day.

```json
{
  "ota":  { "bed": { "self": 1, "k2": 1 }, "kick": { "self": -3, "k2": -1 } },
  "hana": { "bed": { "self": 2 }, "kick": { "self": -3, "k3": -1 },
            "day2": { "bed": { "self": 2, "k3": 1 }, "kick": { "self": -4, "k3": -2 } } }
}
```

### 14.7 summary.json and conditions

An ordered list of blocks. A block without `when` is always included (on its days). `day` is `1`–`3`, `"final"` (ending, shown after day 3 under "Konec dema") or absent (every day). Text may contain `{name:<guestId>}` and `{kingdom:<kingdomId>}`, which are replaced with the nominative name; Czech declension is not handled, so write other cases literally.

```json
[
  { "id": "d1_intro", "day": 1, "text": "První den po pádu mostu přes Vranku…" },
  { "id": "d2_hana_left", "day": 2, "when": { "leftLounge": "hana" },
    "text": "{name:hana} na vás čekala v lounge celé dopoledne. Nikdo pro ni nepřišel." },
  { "id": "final_hana_lost", "day": "final", "when": { "leftLounge": ["hana", 2] },
    "text": "{name:hana} se nikdy nevrátila." }
]
```

The same condition language is used by summary blocks, lounge and queue `when` (section 14.9) and article `when` (section 14.3). **Context day:** for summaries it is the day being summarised; for morning data (lounge, queue, articles) it is the previous day, so `{ "roommates": ["ota", "vojtech"] }` in a day-2 lounge entry means "shared a room last night".

| Condition | Meaning |
|---|---|
| `{ "day": 2 }` | The context day is 2 |
| `{ "present": "hana" }` / `{ "present": ["hana", 1] }` | Guest was at the pub (queue or invited) on the context day / on day 1 |
| `{ "outcome": ["hana", "kick"] }` / `["hana", "bed", 1]` | Night outcome was `kick` / any bed, on the context day or the given day |
| `{ "roommates": ["ota", "vojtech"] }` / `[…, 1]` | Both slept in the same room |
| `{ "sameTable": ["ota", "vojtech"] }` / `[…, 1]` | Both sat at the same table |
| `{ "leftLounge": "hana" }` / `["hana", 2]` | Guest waited in the lounge and left without being invited |
| `{ "invitedFromLounge": "hana" }` / `["hana", 2]` | Guest was invited from the lounge |
| `{ "usedClaim": ["bridge_cause", "k1_axe"] }` | The player has (on any day so far) dropped a cutout with this claim into a slot of this topic |
| `{ "meter": ["k1", ">=", 3] }` | Current meter comparison; meter id is `stress`, `k1`–`k3` or a guest id; operators `<`, `<=`, `==`, `>=`, `>` |
| `{ "inkVar": ["ota", "blames", "k1"] }` | The guest's latest Ink variable snapshot equals a value |
| `{ "all": [ … ] }` / `{ "any": [ … ] }` / `{ "not": { … } }` | Combinators |

A guest-day condition about a guest who was not there that day evaluates to false; `meter` and `inkVar` about a guest never met evaluate to false.

### 14.8 strings.cs.json

All fixed UI text, so wording can be changed without touching code (excerpt; see the file for all keys):

```json
{
  "openPub": "Otevřít hospodu",
  "closePub": "Zavřít hospodu",
  "dayEndHint": "Fronta je prázdná. Než zavřete, můžete ještě zajít do lounge.",
  "greeting": "Zdravím, čím posloužím?",
  "greetingReturning": "Á, vy jste tu ještě. Co pro vás můžu udělat?",
  "closingLine": "Pojďte, najdu vám místo.",
  "dayLabel": "Den {n}",
  "sourceScroll": "Zdroj: Svitek – {kingdom}",
  "sourceConversation": "Zdroj: Rozhovor – {name}",
  "sourceQuest": "Linka: {quest}",
  "slotPlaceholder": "Přetáhněte sem výstřižek",
  "slotRejected": "Tohle sem nepatří.",
  "loungeTitle": "Lounge",
  "loungeBack": "Zpět k pultu",
  "loungeEmpty": "Nikdo tu nečeká.",
  "inviteToBar": "Pozvat k pultu",
  "inviteClosed": "Hospoda je zavřená.",
  "inviteBusy": "Nejdřív doběhněte rozhovor s pozvaným hostem.",
  "tableLocked": "zatím nemáte",
  "summaryHeading": "Shrnutí dne {n}",
  "nextDay": "Další den",
  "endOfDemo": "Konec dema",
  "playAgain": "Hrát znovu"
}
```

### 14.9 days.json

```json
[
  { "day": 1, "tables": 1, "scrolls": ["velesie_d1", "kamenec_d1", "lukovina_d1"],
    "queue": [ { "guest": "ota", "knot": "day1" }, { "guest": "hana", "knot": "day1" }, { "guest": "vojtech", "knot": "day1" } ],
    "lounge": [] },
  { "day": 2, "tables": 2, "scrolls": ["velesie_d2", "kamenec_d2", "lukovina_d2"],
    "queue": [ { "guest": "bertold", "knot": "day2" } ],
    "shuffle": false,
    "lounge": [
      { "guest": "hana", "knot": "followup_day2", "when": { "inkVar": ["hana", "told_saw", true] } },
      { "guest": "hana", "knot": "followup_day2_quiet" },
      { "guest": "vojtech", "knot": "followup_day2_room", "when": { "roommates": ["ota", "vojtech"] } }
    ] },
  { "day": 3, "tables": 2, "scrolls": ["kamenec_d3", "lukovina_d3"],
    "queue": [ { "guest": "ota", "knot": "day3", "when": { "not": { "outcome": ["ota", "kick", 1] } } } ],
    "lounge": [] }
]
```

- `tables` – 1 or 2.
- `scrolls` – scroll ids added that morning (each scroll may arrive only once).
- `queue` – arrivals in order; optional `shuffle: true`; optional `when` per entry (previous day).
- `lounge` – follow-ups. A guest appears only if they slept in a bed last night and `when` (previous day) holds; several entries per guest, first match wins.
- `knot` – Ink knot to jump to in the guest's story.

### 14.10 quests.json and topics.json

```json
[
  { "id": "bridge", "name": "Most přes Vranku", "color": "#c27a1a" },
  { "id": "crows",  "name": "Vraní pošta",      "color": "#7a4a9a" }
]
```

`topics.json` maps each slot topic to the label shown on the empty bubble:

```json
{ "bridge_cause": "Proč spadl most?", "letter": "Je ten dopis pravý?", "crow_reader": "Kdo čte vraní poštu?" }
```

### 14.11 Validation and checks

At start-up `content/index.ts` runs `validateContent()` (`engine/days.ts`) and logs every problem as `console.error("[content] …")`: unknown guest/kingdom/quest/topic/scroll ids, a knot from `days.json` missing in the guest's Ink, a scroll scheduled twice, a guest both queued and in the lounge on one day, lounge entries on day 1, more possible guests than seats, unknown Ink tags, `#slot`/`#cut:…` with an unknown topic or without a claim, `#aff` on an unknown meter, unknown ids in pairings/night/summary text.

`npm run check` runs the same validation in node plus:

- `src/engine/engine.check.ts` – all condition types, summary day/final filtering, slot matching (exact claim, `*` fallback, rejection), queue and lounge selection;
- `scripts/check-content.ts` – recompiles every `.ink` and compares it with the committed `.json`; walks every branch of every knot listed in `days.json` under several stress/affinity presets and fails if a choice point has only slot options; checks that each guest's first knot reveals the name in its first line; plays 3 000 random full 3-day runs (random choices including slots, seats, beds/kicks, lounge invites at random moments) and fails if a run gets stuck, a day summary is empty, the ending is not exactly one of the five ending blocks, a knot is never reached or a summary block never fires.

---

## 15. Game state (Zustand)

The shape as implemented (`src/store/gameStore.ts`):

```ts
type Phase = "title" | "desk" | "conversation" | "seating" | "dayEnd" | "night" | "summary";
type View = "cork" | "main" | "lounge";
type KingdomId = "k1" | "k2" | "k3";
type NightOutcome = "r1a" | "r1b" | "r2a" | "r2b" | "kick";

interface Visit { guest: string; knot: string; when?: Condition }
interface ActiveVisit extends Visit { fromLounge: boolean }

interface DeskItemBase { id: string; x: number; y: number; z: number; surface: "desk" | "cork" }
interface ScrollItem extends DeskItemBase { kind: "scroll"; scrollId: string }
type CutoutSource = { type: "scroll"; kingdom: KingdomId } | { type: "conversation"; guestId: string };
interface CutoutMeta { topic?: string; claim?: string; quest?: string }
interface CutoutItem extends DeskItemBase, CutoutMeta { kind: "cutout"; text: string; source: CutoutSource }

interface ChatLine {
  speaker: "guest" | "bartender";
  text: string;
  cuttable: boolean;
  meta?: CutoutMeta;                        // from #cut:<topic>:<claim> / #quest
  stressDelta?: number;                     // badge on the bartender answer bubble
  usedCutout?: CutoutMeta & { text: string; source: CutoutSource }; // slot tag
}

interface DayRecord {
  present: string[]; seats: (string | null)[]; night: Record<string, NightOutcome | null>;
  invited: string[]; left: string[];
}

interface GameState {
  phase: Phase;
  day: number;                              // 1..3
  view: View;
  tableCount: number;
  meters: Record<string, number>;           // "stress" | "k1".."k3" | guestId (once met) → −10..10
  lastDelta: Record<string, number>;
  queue: Visit[];                           // still waiting today
  current: ActiveVisit | null;              // at the bar
  paused: { visit: ActiveVisit; inkState: string; chatLog: ChatLine[] } | null;
  loungeGuests: Visit[];
  todayGuests: string[];                    // queue + invited, in arrival order
  invitedFromLounge: string[];              // today
  leftLounge: string[];                     // today
  history: Record<number, DayRecord>;       // finished days (night history = history[d].night)
  usedClaims: { topic: string; claim: string; cutoutId: string; day: number; guestId: string }[];
  inkStates: Record<string, string>;        // persistent Ink state per guest
  inkVars: Record<string, Record<string, unknown>>; // VAR snapshot per guest
  revealed: Record<string, { name: boolean; faction: boolean }>;
  chatLog: ChatLine[];
  choices: { index: number; text: string; slot?: { topic: string; claim: string } }[];
  storyEnded: boolean;
  slotRejected: string | null;              // topic flashing red
  deskItems: (ScrollItem | CutoutItem)[];
  hiddenArticles: string[];                 // `${scrollId}#${articleIndex}`
  corkStrings: { id: string; a: string; b: string; color: "red" | "twine" | "blue" }[];
  readerOpen: string | null;
  noteOpen: string | null;
  seats: (string | null)[];                 // length 8: 0–3 table 1, 4–7 table 2
  nightAssignments: Record<string, NightOutcome | null>;
  eventLog: { seq: number; source: string; description: string; effects: Record<string, number> }[];
  debugOpen: boolean;
  fading: boolean;
}
```

The live inkjs `Story` for the guest at the bar is a module-level variable outside the store; only its outputs go into the store. Pausing serialises it into `paused.inkState`; ending a visit serialises it into `inkStates[guestId]`.

---

## 16. Placeholder art

Art will come from the user's sketches. Until then, each image is a simple placeholder (flat colour, outline and a Czech label) at a fixed path in `public/art/`, so real art can replace it by dropping in a file with the same name.

| File | Size | Use |
|---|---|---|
| `title_bg.png` | 1920×1080 | Title screen |
| `pub_door_closed.png` | 600×810 | Portrait area before opening and at day end |
| `guest_<id>.png` | 600×620 | Guest portraits (faction-tinted placeholders; thumbnails are scaled down) |
| `desk.png` | 1920×270 | Desk surface |
| `scroll_rolled.png` | ~200×80 | Scroll on the desk / corkboard |
| `parchment.png` | ~1000×900 | Scroll / note reader background |
| `cutout_paper.png` | tileable | Cutout background (tinted by CSS for colour coding) |
| `trashcan.png` | 180×180 | Trashcan |
| `corkboard.png` | 960×810 | Corkboard surface |
| `pin.png` | ~32×40 | Pin on corkboard items |
| `cork_arrow.png` | 48×280 | Corkboard tab (mirrored for "back") |
| `lounge_bg.png` | 1920×810 | Lounge background |
| `lounge_arrow.png` | 48×280 | Lounge tab (mirrored for "back") |
| `icons/k1.png` … `k3.png` | 48×48 | Kingdom icons (shown at 28 px) |
| `icons/guest_<id>.png` | 48×48 | Guest icons (fallback: scaled portrait) |
| `icons/unknown.png` | 48×48 | Question mark for an unrevealed faction |
| `night_bg.png` | 1920×1080 | Night screen |
| `summary_bg.png` | 1920×1080 | Summary screen |

The empty slot bubble is plain CSS (dashed outline), so there is no `cutout_slot.png`. The upper-area background behind the meters and chat panels is a plain colour for now.

---

## 17. Placeholder content

The build ships a three-day placeholder story, clearly marked `PLACEHOLDER STORY` in every Ink file header, written to exercise every mechanic. It is meant to be replaced in the script phase.

**World.** The pub U Tří vran on the Vraní sedlo crossroads between **Velesie** (k1, forests and raftsmen, red, icon "V"), **Kamenec** (k2, silver mines and powder, blue, "K") and **Lukovina** (k3, lowlands, the river Vranka and its ferry, green, "L"). The bartender keeps the crows that carry letters between the kingdoms.

**Quest lines.** *Most přes Vranku* (orange): the rope bridge over the Vranka gorge fell with a Kamenec silver caravan on it. Every kingdom blames another; in truth the ferryman Šebor sawed the ropes to force traffic onto his ferry and emptied the silver chests. *Vraní pošta* (purple): someone reads and forges the crow mail; it is the pedlar Mikuláš, who sold Šebor the caravan's schedule and sells black sealing wax.

**Slot topics and claims.**

| Topic | Claims (sources) |
|---|---|
| `bridge_cause` "Proč spadl most?" | `k2_blasting` (Velesský hlásník d1/d2), `k3_rot` (Kamenecké listy d1/d2, Ota, Šebor), `k1_axe` (Lukovinský posel d1), `sawn` (Hana d1/d2), `ferry_saw` (Hana d2/d3, Bertold d3, Kamenecké listy d3) |
| `letter` "Je ten dopis pravý?" | `genuine` (Velesský hlásník d2, Kamenecké listy d2, Bertold), `forged` (Lukovinský posel d2, Jitka) |
| `crow_reader` "Kdo čte vraní poštu?" | `k3_spies` (Kamenecké listy d2, Mikuláš), `k2_spies` (Lukovinský posel d3), `mikulas` (Jitka d3 after sharing a room with him, Šebor's confession) |

**Day 1 – Most spadl (one table).** Ota (Kamenec carter, lost his wagon and his driver), Hana (bridge-keeper's daughter from Lukovina, saw the sawn rope) and Vojtěch (Velesian raftsman with an axe on his belt) all have to sit at the single table; Ota and Vojtěch are a hostile pair. Ota's slot has no `*` fallback, Vojtěch's has one and also accepts Hana's `sawn` cutout from earlier the same day. The day is built to be stressful (summary reacts to stress ≥ 5). Room choices matter: Ota + Vojtěch in one room unlock Vojtěch's day-2 follow-up (a brawl if Ota was told it was Velesie, otherwise a flask and a lead to the ferry).

**Day 2 – Vraní pošta (two tables).** Morning stress reset; newspapers react to day 1 (`usedClaim`, `outcome` with day). Queue: Bertold (Kamenec guard captain with the "chancellor's letter"), Mikuláš (pedlar, the spy), Jitka (Lukovinian scribe who knows the letter is forged). Bertold's letter slot is the main conflicting-sources choice (Velesie + Kamenec vs. Lukovina + Jitka) and changes day-3 Kamenec headlines. He then asks about the bridge-keeper's daughter: Hana waits in the lounge (follow-up with `when: told_saw`) with the `ferry_saw` evidence, so the player is motivated to invite her mid-conversation and come back with the cutout. If Hana is left in the lounge she goes home over the ferry and disappears (day-3 newspaper, final summary). Ota's follow-up offers him a rope for the gorge.

**Day 3 – Převoz.** Queue: Ota (only if not kicked on night 1; found the chests opened with a key and asks who reads the crow mail) and Šebor (the ferryman, paying in Kamenec silver). Lounge: Jitka (if she shared a room with Mikuláš she saw him copying the seal → `crow_reader:mikulas`, which Ota is asking for: second cut-in moment), Mikuláš (leaves for good if not invited), Hana (if invited on day 2), Bertold (only if he was sent to the ferry). Šebor's slot: `ferry_saw` → confrontation with an `#bartender` line, then expose him or take the bribe; `sawn` → he gets nervous; `*` → he deflects.

**Endings** (exactly one of): truth (Šebor exposed), bribe, war (a kingdom ≤ −4), shared blame (you spread a kingdom's version), fog (nobody blamed). Plus independent final paragraphs: Hana lost / ill / safe, crow mail clean / still compromised, Mikuláš fled, the crow sold to Mikuláš, Ota gone / a friend, bartender's stress.

**Coverage.** Every tag in 14.4 (including `#aff:<guestId>`, `#bartender`, `#slot` with `*`) and every condition type in 14.7 is used at least once. 7 guests, 18 knots, 8 scrolls, 2 quest lines, 3 topics, 50 summary blocks.

---

## 18. Out of scope for the demo

Sound and music; saving and loading (also between sessions); more than three days; character movement or animation beyond the allowed fades/slides; consequences other than meter changes, summary text, newspaper articles and which guests/follow-ups appear; consuming cutouts; hint or glow systems that point at relevant cutouts (a slot shows only its topic, never which cutout fits); meter effects from roommates; the corkboard affecting gameplay; rooms other than the lounge; talking to guests directly in the lounge (only inviting them to the bar); touch and mobile support; languages other than Czech; telemetry or choice logging for export.

---

## 19. Acceptance checklist

`[x]` = verified for v0.2 (by `npm run build`, `npm run check` and a scripted Chrome run at 1280×720, i.e. scale 0.67).

- [x] Stage renders at 1920×1080 and scales to any window with letterboxing; drag-and-drop stays accurate at every scale (including drops on reply slots).
- [x] Title → 3 × (morning → conversations/seating → day end → night → summary) works end to end, with fades; after day 3 the final summary and "Hrát znovu" return to day 1 with a clean state.
- [x] Stress is 0 every morning; other meters, cutouts, the corkboard and reveals persist.
- [x] Day 1 has one table, days 2–3 two; the unavailable table cannot be picked (minimap and overlay).
- [x] Scrolls open in the reader, cuttable segments create cutouts, the same snippet can be cut repeatedly; conditional articles appear only when their condition held.
- [x] Scrolls and cutouts have the right colour (quest > kingdom) and kingdom icon; conversation cutouts have the guest icon and the kingdom icon / `?` until the faction is revealed.
- [x] Scrolls and cutouts drag freely, stack, come to front when grabbed, stay within the desk and never hide under the minimap.
- [x] Dropping on the trashcan removes items permanently; source tooltips (with quest line) show on hover.
- [x] Greeting / returning greeting is inserted automatically; chat appends at the bottom, auto-scrolls and can be scrolled up; `#cut` guest lines create cutouts.
- [x] All Ink tags work; name and faction show "???" until revealed.
- [x] Closing line opens the seating overlay; seat selection plus "Usadit" seats the guest; pairing effects apply immediately; the next guest arrives.
- [x] Meters (including stress) are always visible, clamp to −10…+10 and show the last change; stress badge appears on the bartender answer bubble.
- [x] Ink can hide choices via conditions on synced stress/affinity/day vars.
- [x] Right arrow switches to the lounge, left arrow back; the desk stays visible; the arrow badge counts waiting guests.
- [x] In the morning the lounge shows only guests who slept in a bed last night and have a matching follow-up for the day.
- [x] An invited guest cuts in; the paused conversation resumes after their seating with the same log and state.
- [x] Uninvited lounge guests leave on "Zavřít hospodu" and are not on the night screen.
- [x] The slot accepts a cutout with the right topic, picks the choice by claim (or `*`), rejects others; the cutout is not consumed.
- [x] The used claim is in the event log and can be used in summary / article conditions.
- [x] Corkboard slides open/closed; items drag between desk and board; pins and three string colours work; layout resets on replay.
- [x] Night dropdowns prevent double-booked beds; "Hotovo" is disabled until all guests have an outcome; night effects (incl. per-day overrides) apply.
- [x] Summary text is assembled correctly per day and for the ending, with final meters shown.
- [x] Debug panel toggles with the key under Esc and shows day, lounge, paused conversation, night history and used claims; dev day jump works.
- [x] All content (text, numbers, conditions, schedule) lives in `src/content/`; no content is hardcoded in components.
- [ ] Playtest with real testers on LAN / GitHub Pages (not done yet).

---

## 20. Open items for the script phase

To be written together now that the multi-day skeleton exists: kingdom names, identities, relationships, colours and icons; the events of each day and the newspaper versions; quest lines and their colours; slot topics and the claims each source makes; the guests (name, faction, portrait brief, starting affinity, personality, dialogue per visit); which follow-ups exist per day and their conditions; specific pairings and faction fallback values; night effects (and per-day overrides); summary and ending blocks; final wording of the greetings, closing line and lounge strings.

Design questions for the team:

- Should a guest be able to stay in the lounge for more than one morning? (v0.2: no.)
- Should rejected cutouts animate back (a short bounce) or keep jumping back instantly?
- Should the kingdom colour of a conversation cutout leak the guest's faction before `#reveal:faction`? (v0.2: no – neutral paper and `?` icon.)
- Should Czech declension be supported in `{name:…}` / `{kingdom:…}` placeholders (e.g. per-case name forms in data)?
- Should newspapers be able to react within the same day (v0.2: only on the morning a scroll arrives)?

---

## Changes since v0.1

- Three days instead of one: morning (stress reset, new scrolls, lounge) → day → day end ("Zavřít hospodu") → night → summary ("Další den"); day 3 ends with the ending blocks and "Hrát znovu". New `dayEnd` phase; no separate `end` phase (the day-3 summary is the end screen).
- `days.json`: per-day tables, scrolls, queue (with optional `shuffle` and per-entry `when`) and lounge follow-ups (several per guest, first match wins). Replaces the random draw of 3 out of 5 guests.
- Tables per day (1 on day 1, 2 later); the locked table is shown faded with "zatím nemáte".
- Colour coding: kingdom `color`/`icon`, `quests.json`, quest > kingdom rule, icons on scrolls/cutouts/slot tags; conversation cutouts carry guest + kingdom (`?`) icons. Kingdom colour on conversation cutouts only after the faction is revealed.
- Lounge (strip position 3, arrows, badge), inviting with pause/resume of the current conversation, departures on closing.
- Cutout reply slots: `#slot:<topic>:<claim>` choice tags (inside the brackets), `*` fallback, rejection, slot tag on the bartender bubble, `usedClaims`, `topics.json` for bubble labels. Cutouts now carry topic/claim/quest. Authoring rule enforced by `npm run check`: every choice point needs a non-slot option.
- Persistent Ink: one story state per guest across visits, one knot per visit; `VAR day` synced; `aff_<guestId>` synced for every guest met; snapshot per guest kept across days.
- Conditions: new `day`, `leftLounge`, `invitedFromLounge`, `usedClaim`; optional day parameter on `present`, `outcome`, `roommates`, `sameTable`, `leftLounge`, `invitedFromLounge`; `inkVar` no longer requires the guest to be present today. The same conditions drive summary blocks, lounge/queue `when` and newspaper article `when` (new: newspapers react to earlier days).
- `summary.json` blocks have `day` (`1`–`3` or `"final"`); `night.json` supports `day<N>` overrides.
- Guest meters are created on first arrival and persist; the meters panel lists today's guests only.
- Debug panel extended; dev-only day jump (keys 1–3 with the panel open).
- Start-up content validation with console errors; `npm run check` now also validates content, walks every Ink branch and runs 3 000 random full playthroughs.
- New placeholder art: lounge background and arrow, kingdom/guest/unknown icons, seven guest portraits. The slot bubble is CSS only.
- New three-day placeholder story (section 17) replacing the one-day courier story; kingdoms renamed to original placeholder names.
