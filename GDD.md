# What the crows say — Demo GDD

Version 0.1 · one in-game day, built for playtesting the core loop

---

## 1. Purpose

The full game spans many in-game days. This demo covers exactly one day, and its only job is to help us decide which mechanics to keep, change or drop. Specifically, playtests should answer these questions:

1. **Desk cutouts.** Is cutting snippets out of newspapers and conversations and arranging them on the desk useful and enjoyable, or should information gathering work differently?
2. **Conversations.** Do conversations with 1–3 choices per turn and variable length feel good to read and play?
3. **Seating.** Does choosing where to seat a guest create an interesting decision?
4. **Night management.** Does assigning beds or kicking guests out feel meaningful?
5. **Affinity.** Do the visible meters make choices feel like they matter?
6. **Stress.** Does the bartender stress meter and gated replies feel fair and readable?
7. **Corkboard.** Is pinning cutouts/scrolls and linking them with coloured string useful?

Because the goal is fast iteration, all game content (newspapers, guests, dialogue, pairings, night effects, summary text) lives in data files and Ink scripts, never hardcoded in components. Changing a number or a sentence must never require touching game logic.

---

## 2. Setting

A medieval pub at the only mountain crossroads between three kingdoms. Mountains separate the kingdoms, so anyone travelling between them passes through this pub. The kingdoms are at peace, but the peace is fragile. The player is the bartender: he reads the three kingdoms' newspapers, talks to travellers, decides where they sit and where they sleep, and his choices shift how the kingdoms and the guests see him.

The real kingdom names, the day's event, guests and dialogue will be written in a later script phase. Until then the build uses placeholder content (section 17).

---

## 3. Platform and technology

| Piece | Role | Notes |
|---|---|---|
| React | Screens and UI components | Renders backgrounds, portrait, chat, desk, minimap, overlays |
| TypeScript | Language | Strict mode; typed game state |
| Vite | Dev server and build | React + TS template, no Next.js |
| Zustand | Game state store | One store for phase, meters, guests, desk items, seating, night choices, event log |
| inkjs | Dialogue runtime | Loads compiled Ink JSON; exposes text, choices, tags, variables |
| Inky | Writing tool for Ink | Used to write and test conversations; not part of the build |

Not used in the demo: Howler.js (no sound), localStorage (no saves).

**Running for playtests.** `npm run dev -- --host` (or `vite --host`). Testers on the same network open `http://<host-ip>:5173`. No backend, no hosting.

**Stage and scaling.** The game is designed for a fixed 1920×1080 stage. A `Stage` component scales the stage uniformly to fit the browser window (`scale = min(innerWidth / 1920, innerHeight / 1080)`), centred, with black bars where the aspect ratio differs. All positions in this document are stage coordinates. Pointer coordinates used for drag-and-drop must be converted from screen space to stage space by dividing by the current scale.

**Input.** Mouse only. Clicks, hovers and drag-and-drop. No keyboard input except the debug toggle, and no text fields anywhere.

**Language.** All in-game text is Czech. Use a font that covers Czech diacritics (á, č, ď, é, ě, í, ň, ó, ř, š, ť, ú, ů, ý, ž) and bundle it locally so the game does not depend on a CDN. All UI strings live in `strings.cs.json` (section 14.8).

**Presentation.** Static screens, minimal motion. Allowed motion: fade-to-black transitions (section 13.2), the portrait fade-in on guest change, the horizontal slide of the pub top strip when opening/closing the corkboard (section 6.5), and the browser's native scrolling in the chat log.

---

## 4. Day flow

The day is a simple state machine:

```
TITLE ─► DESK (pub closed) ─► [ CONVERSATION ─► SEATING ] × 3 ─► NIGHT ─► SUMMARY
                ▲                                                            │
                └───────────────────── "Hrát znovu" ─────────────────────────┘
```

1. **TITLE.** Title screen with the game name and a "Začít" button. Shown only on first launch.
2. **DESK.** The bartender sits behind his desk in the pub, which is still closed. Three rolled scrolls (newspapers, one per kingdom) lie on the desk. The player reads them, cuts out snippets and arranges the desk. When ready, he clicks "Otevřít hospodu".
3. **CONVERSATION.** A guest enters (their portrait fades in). The bartender's greeting appears automatically, then the guest's Ink script plays. The player picks responses until the script ends, then clicks the closing line.
4. **SEATING.** The minimap expands to full screen and the player chooses an empty seat. Seating effects apply immediately. The chat log is cleared and the next guest walks in at once.
5. After the third guest is seated, the screen fades to **NIGHT**. The player assigns each guest a bed or kicks them out and clicks "Hotovo".
6. **SUMMARY.** A text wall describes what happened that day and night, with final meter values. "Hrát znovu" resets everything, draws a new set of guests and returns to DESK.

The desk (scrolls, cutouts, trashcan) is interactive during DESK and CONVERSATION. It is not interactive while the seating overlay is open.

---

## 5. Pub screen layout

The pub screen is used for DESK, CONVERSATION and (underneath the overlay) SEATING. The layout follows the Papers, Please model: the person in front of you at the top, your workspace at the bottom.

The **desk** occupies roughly the bottom quarter of the stage (height 270). The **top strip** (height 810) is a sliding row wider than the stage:

| Region | Strip x | y | w | h | Contents |
|---|---|---|---|---|---|
| Corkboard | 0 | 0 | 960 | 810 | Investigation board (section 6.5); off-screen left when closed |
| Portrait area | 960 | 0 | 600 | 810 | Closed door with "Otevřít hospodu" in DESK; guest portrait in CONVERSATION |
| Meters panel | 1560 | 0 | 420 | 810 | Affinity + stress meters (section 9) |
| Chat panel | 1980 | 0 | 900 | 810 | Conversation log and choice buttons |
| Desk | stage 0 | 810 | 1920 | 270 | Always visible; does not slide |
| Trashcan | desk-relative | | 180 | ~140 | Drop target inside the desk, bottom-left |
| Minimap | desk-relative | | 220 | 220 | Fixed seating map inside the desk, bottom-right |

When the corkboard is **closed**, the strip is translated by −960 so the stage shows portrait + meters + chat (1920 wide). When **open**, translation is 0: left half corkboard, right half mostly the guest; chat sits further right off the viewpoint. An arrow on the left edge opens the board; an arrow on the right edge closes it. Slide duration ~300 ms.

These coordinates are a starting point and can be tuned once real art exists. The trashcan and minimap are fixed and always render above desk items.

---

## 6. Desk, scrolls and cutouts

### 6.1 Scrolls

At the start of the day, three rolled scrolls lie on the desk, one from each kingdom. Each scroll holds one or two articles. All three scrolls report on the same event, but each kingdom tells it differently (for example, a forest fire where each kingdom names a different suspect). The player decides which version to believe and what to keep.

Scrolls can be dragged around the desk. A click (pointer moved less than 5 px between down and up) opens the scroll in the **reader**: a large unrolled parchment overlay centred on the stage (roughly 1000×900), showing the kingdom's name, the newspaper title and the articles. The reader closes with a "Zavřít" button or a click outside it.

No new scrolls arrive during the day.

### 6.2 Cutting snippets

Articles are made of text segments. Some segments are marked as cuttable in the data (predefined snippets; the player cannot select arbitrary text). Hovering a cuttable segment shows a dotted outline and a scissors cursor. Clicking it creates a new cutout on the desk. The reader stays open so the player can cut several snippets in a row.

The same snippet can be cut any number of times; each click creates a new, independent cutout. A scroll can be reopened as often as the player likes until it is thrown away.

Cuttable guest lines in conversations work the same way (section 7.3).

### 6.3 Cutouts

A cutout is a small paper slip with the snippet's text, fixed width of about 260 px, height fitting the text, body font around 18 px. New cutouts spawn at a random position within the central part of the desk and are placed on top.

Cutouts can be dragged anywhere within the desk bounds and freely overlap and stack. The item being dragged, or last clicked, moves to the top of the stack. If a cutout is dropped with its centre over the minimap, it is pushed just outside the minimap so it never ends up hidden under it.

Hovering a cutout shows a tooltip with its source, for example "Zdroj: Svitek – Království A" or "Zdroj: Rozhovor – Mira" (or "Zdroj: Rozhovor – ???" if the guest's name is not yet known).

There is no limit on the number of cutouts. Desk space is the only natural limit.

Cutouts have no effect on game state. They are purely the player's memory aid, and nothing in the game reads them.

### 6.4 Trashcan

Dropping a cutout or a scroll on the trashcan removes it permanently. The trashcan highlights while something is being dragged over it. A thrown-away scroll can no longer be read; existing cutouts from it stay on the desk. The trashcan only accepts drops while the item is over the desk (not the corkboard).

### 6.5 Corkboard

The corkboard is the bartender's investigation board on the left of the sliding top strip. The same scrolls and cutouts that live on the desk can be dragged onto the corkboard and back. Items on the corkboard show a **pin**; the player can connect two pins with coloured string (three colours: red, twine/yellow, blue). Select a colour, then click two pins to link them; click an existing string to remove it.

Hovering a cutout on the corkboard shows its text in a tooltip. Clicking a cutout opens a full-screen parchment reader with the note text. Scrolls keep the normal scroll reader.

Layout and strings persist for the whole day and reset on "Hrát znovu". Like desk cutouts, the corkboard has **no gameplay effect** — it is only a memory aid.

---

## 7. Conversations

### 7.1 Opening and closing

When a guest arrives, the engine inserts the bartender's generic greeting as the first line of the chat log ("Zdravím, čím posloužím?"), then starts the guest's Ink story. Writers do not repeat the greeting in Ink; each guest's story begins with the guest's reply.

When the story reaches its end, the engine shows a single choice button with the bartender's closing line ("Pojďte, najdu vám místo."). Clicking it opens the seating overlay. This line signals to the player that the conversation is over and the log will disappear. After the guest is seated, the chat log is cleared.

### 7.2 Chat panel

The chat panel is a scrollable log. New lines are appended at the bottom and the panel auto-scrolls to the newest line. The player can scroll up to reread the whole conversation. Guest lines are left-aligned with the guest's name (or "???") as the label; bartender lines are right-aligned with the label "Hostinský".

Lines produced between two choice points appear all at once (no typewriter effect). Choice buttons appear below the last line at the bottom of the panel. Clicking a choice appends its text to the log as a bartender line and continues the story.

**Gated choices.** Some options are locked (not rendered) based on Ink conditions that read synced variables: stress, kingdom affinity (`aff_k1`…`aff_k3`), current guest affinity (`aff_self`), and optionally other present guests' meters (`aff_<guestId>`). Writers gate with Ink syntax such as `* { stress < 5 && aff_k1 >= 0 } [Text]`. The engine shows only choices Ink exposes; there is no greyed-out locked UI.

**Stress feedback.** Choice buttons do not preview stress changes. When a chosen answer changes stress, a small circle with `+N` or `−N` appears in the corner of that bartender chat bubble.

There is no time pressure.

### 7.3 Cuttable guest lines

A guest line tagged `#cut` in Ink is a predefined snippet. It shows the same hover affordance as cuttable newspaper segments, and clicking it creates a cutout with the guest as its source. Bartender lines are never cuttable. Lines can be cut repeatedly, like scroll snippets.

### 7.4 Ink conventions

See section 14.4 for the tag reference. The engine runs the standard inkjs loop: `Continue()` while `canContinue`, read `currentTags` for each line, apply tags, append the line; then render `currentChoices`; on click, call `ChooseChoiceIndex()` and repeat.

Writers should use bracketed choice text (`* [Choice text]`) so Ink does not echo the choice; the engine appends the choice text itself as the bartender's line.

---

## 8. Guests

The guest pool has 5 guests. At the start of each day, 3 are drawn at random without replacement, in random order. They arrive one by one; the next guest walks in immediately after the previous one is seated.

Each guest has an id, name, faction (one of the three kingdoms), portrait, starting affinity and an Ink story (section 14.2).

**Reveal.** The portrait is always visible. The name and faction start hidden and display as "???" everywhere (chat label, meters panel, minimap tooltip, night screen, cutout source) until revealed by the Ink tags `#reveal:name` and `#reveal:faction`. By writing convention, every guest says their name in their first line, so the name is revealed right away; the faction is revealed whenever the script decides.

The game logic always knows each guest's true faction (it uses it for seating fallbacks and summary conditions) regardless of what the player has seen.

---

## 9. Affinity and stress meters

### 9.1 Meters

All meters use the scale −10 to +10, clamped at both ends:

1. **Stress meter (1).** How tense the bartender is. Starts at 0. Changed only by Ink `#stress` tags during conversation. Does not change seating or night mechanics; summary text can react to it.
2. **Kingdom meters (3).** How each kingdom views the bartender. Starting values come from data (default 0).
3. **Guest meters (one per guest present today).** How that guest views the bartender. Starting values come from the guest data and need not be 0 (a guest may arrive already distrustful).

### 9.2 What changes them

Affinity (kingdom/guest) can change from a line or choice in a conversation (Ink `#aff` tags), a seating decision (pairing rules), and a night decision (night effects). Stress changes only from Ink `#stress:+N` / `#stress:-N` tags.

All changes go through one function, `applyEffects(effects, source)`, which clamps values, records the change for display and writes an entry to the event log.

### 9.3 Display

The meters are always visible in the demo. The meters panel shows the stress meter first, then the three kingdom meters, then a meter for each guest who has arrived today, in arrival order, labelled with the guest's name or "???". The current guest's meter is highlighted.

Each meter is a horizontal bar from −10 to +10 with a centre mark and the numeric value. The most recent change to a meter is shown next to it, for example "(+2)", until that meter changes again. Stress changes from a dialogue answer are also shown as a badge on that bartender chat bubble (section 7.2).

The meters panel (or an equivalent block) is also visible on the seating overlay, the night screen and the summary screen.

---

## 10. Seating

### 10.1 Layout

The pub has 2 tables with 4 seats each. Seats are indexed 0–3 (Stůl 1) and 4–7 (Stůl 2). All seats are empty at the start of the day. Seating is final: a seated guest stays in place until the next day.

### 10.2 Minimap

A fixed square in the bottom-right corner of the desk shows both tables and their seats. Occupied seats show a small portrait. Hovering an occupied seat shows a tooltip with the guest's name and faction ("???" if unrevealed). The minimap cannot be moved and cannot be used to seat anyone outside the seating phase.

### 10.3 Seating phase

After the closing line, the minimap expands into a full-screen overlay (instant switch, no animation). The overlay shows the two tables large and easy to click, the current guest's portrait and name in a corner, and the heading "Kam posadíte hosta?". Clicking an empty seat selects it (highlight); clicking another empty seat changes the selection. The "Usadit" button confirms. Occupied seats are not selectable but still show hover tooltips.

### 10.4 Pairing effects

"Neighbours" means every guest at the same table. When a guest is seated, the engine evaluates one pairing for each guest already sitting at that table:

1. If `pairings.json` has a specific rule for those two guests, that rule applies.
2. Otherwise, the faction fallback rule for their two kingdoms applies (same kingdom, or a specific pair of kingdoms).

A rule can move both guests' meters and any kingdom meters, positively (allies) or negatively (enemies). Effects apply immediately and are visible in the meters panel. The engine also records who shared a table, so summary blocks can react to it.

After confirming, the overlay closes, the chat log is cleared and the next guest's portrait fades in. After the third guest is seated, the game fades to NIGHT.

---

## 11. Night management

The night screen is a separate full screen with a night illustration, the heading "Noc – kde budou hosté spát?", the meters panel and one row per guest (3 rows). Each row shows the guest's portrait thumbnail, name and faction ("???" if unrevealed) and a dropdown with these options:

| Value | Label |
|---|---|
| `r1a` | Pokoj 1 – postel A |
| `r1b` | Pokoj 1 – postel B |
| `r2a` | Pokoj 2 – postel A |
| `r2b` | Pokoj 2 – postel B |
| `kick` | Vyhodit |

Each bed can hold one guest: a bed chosen by one guest is disabled in the other dropdowns. Any number of guests can be kicked out. The "Hotovo" button is enabled only when every guest has an outcome.

On "Hotovo" the engine applies each guest's night effects from `night.json` (one set of effects for getting a bed, one for being kicked out). Guests sharing a room are recorded as roommates. In the demo, roommates only affect the summary text, not the meters. The game then fades to SUMMARY.

---

## 12. Summary

The summary screen shows the heading "Shrnutí dne", a single continuous text wall on the left, the final meter values on the right and a "Hrát znovu" button.

The text is assembled from authored blocks in `summary.json` (section 14.7). The engine evaluates every block in file order and includes each block whose condition is true, joining them as paragraphs. Conditions can check night outcomes, roommates, table-mates, meter values (including `stress`), Ink variables and which guests were present. This lets the summary describe what happened in the kingdoms that day, how the bartender's decisions and stress affected things, and what it caused for the pub and the guests (for example, a guest who was kicked out was taken by bandits).

"Hrát znovu" resets all state to initial values, draws 3 new guests and returns to DESK with fresh scrolls.

---

## 13. Title, transitions and debug

### 13.1 Title screen

A background, the title "What the crows say" and a "Začít" button that fades to DESK.

### 13.2 Transitions

Screen changes use fade to black and fade back in (about 400 ms each way): title → desk, desk → first guest, seated guest → next guest (portrait area), last guest seated → night, night → summary, summary → desk. Opening and closing the scroll reader and the seating overlay are instant.

### 13.3 Debug panel

A read-only overlay toggled by the physical key under Esc (`event.code === "Backquote"`, which works regardless of keyboard layout, including Czech). It shows the current phase; drawn guest ids and their order; the current guest; raw values of all meters; reveal flags; seat occupancy; night assignments; the current guest's Ink tags and global variables; and the last ~20 event log entries. It has no controls.

---

## 14. Data and content formats

### 14.1 Folder structure (suggested)

```
src/
  main.tsx
  App.tsx
  store/gameStore.ts
  screens/      TitleScreen, PubScreen, NightScreen, SummaryScreen
  components/   Stage, Fade, Desk, ScrollItem, ScrollReader, Cutout, Trashcan,
                Portrait, ChatPanel, MetersPanel, Minimap, SeatingOverlay, DebugPanel
  engine/       ink.ts, tags.ts, effects.ts, pairings.ts, summary.ts, random.ts
  content/
    kingdoms.json
    guests.json
    scrolls.json
    pairings.json
    night.json
    summary.json
    strings.cs.json
    ink/        <guestId>.ink  (source)  →  <guestId>.json (compiled)
public/
  art/          placeholder images with fixed file names (section 16)
```

Ink files are written in Inky. Add an `npm run ink` script that compiles every `src/content/ink/*.ink` to JSON with the compiler bundled in inkjs (check the correct import path for the installed inkjs version). Exporting JSON from Inky by hand also works.

### 14.2 kingdoms.json and guests.json

```json
[
  { "id": "k1", "name": "Království A", "startAffinity": 0 },
  { "id": "k2", "name": "Království B", "startAffinity": 0 },
  { "id": "k3", "name": "Království C", "startAffinity": 0 }
]
```

```json
[
  {
    "id": "mira",
    "name": "Mira",
    "faction": "k1",
    "portrait": "art/guest_mira.png",
    "startAffinity": -2,
    "ink": "mira"
  }
]
```

### 14.3 scrolls.json

Each scroll belongs to one kingdom. Articles consist of paragraphs; each paragraph is a list of segments rendered inline. Segments with `"cut": true` are cuttable snippets and need a stable `id`.

```json
[
  {
    "id": "scroll_k1",
    "kingdom": "k1",
    "title": "Hlasatel Království A",
    "articles": [
      {
        "headline": "Požár v pohraničním lese",
        "paragraphs": [
          [
            { "text": "Včera v noci vypukl požár v lese u průsmyku. " },
            { "id": "k1_a1_s1", "text": "Svědci viděli prchat muže v barvách Království B.", "cut": true }
          ]
        ]
      }
    ]
  }
]
```

### 14.4 Ink tag reference

| Tag | Meaning |
|---|---|
| `#cut` | This guest line is a cuttable snippet |
| `#reveal:name` | Reveal the current guest's name |
| `#reveal:faction` | Reveal the current guest's faction |
| `#aff:self:+2` | Change the current guest's meter |
| `#aff:k1:-1` | Change a kingdom meter (`k1`, `k2`, `k3`) |
| `#aff:<guestId>:+1` | Change another guest's meter (ignored if that guest is not present today) |
| `#stress:+2` / `#stress:-1` | Change the bartender stress meter |
| `#bartender` | This non-choice line is spoken by the bartender, not the guest |

Several tags can be attached to one line. To make choosing an option change a meter, put the tag on the first line inside that choice's branch.

**Optional variable sync.** If a story declares any of `VAR stress`, `VAR aff_self`, `VAR aff_k1`, `VAR aff_k2`, `VAR aff_k3`, or `VAR aff_<guestId>` for a guest present today, the engine writes the current meter values into them when the story starts and after every effect, so dialogue can branch and **hide choices** with Ink conditions. When the story ends, the engine stores a snapshot of all the story's global variables under the guest's id, so summary conditions can read flags set during the conversation (for example `VAR told_secret = false`).

Minimal example:

```ink
VAR told_secret = false

Jmenuji se Mira, jdu z Království A. #reveal:name
Slyšel jste o tom požáru? Prý to byli lidé z Béčka. #cut
* [Taky jsem to četl.]
    Vidíte! Celý svět to ví. #aff:self:+2 #aff:k2:-1
* [Noviny lžou.]
    Hm. To jste divný hostinský. #aff:self:-1
- Mezi námi, já tam byla. #reveal:faction
~ told_secret = true
-> END
```

### 14.5 pairings.json

Specific pairs take priority; the faction fallback applies to any pair without a specific rule. In each rule, `a` and `b` are the two guests' meters (in the order listed in `guests` for specific pairs). Kingdom keys are optional.

```json
{
  "pairs": [
    { "guests": ["mira", "bohdan"], "effects": { "a": -2, "b": -2, "k1": -1 } },
    { "guests": ["mira", "eliska"], "effects": { "a": 1, "b": 1 } }
  ],
  "factionFallback": {
    "same":  { "a": 1,  "b": 1 },
    "k1-k2": { "a": -1, "b": -1 },
    "k1-k3": { "a": 0,  "b": 0 },
    "k2-k3": { "a": -1, "b": -1 }
  }
}
```

### 14.6 night.json

Per guest, effects for getting any bed and for being kicked out. `self` is that guest's meter.

```json
{
  "mira":   { "bed": { "self": 1 },  "kick": { "self": -3, "k1": -1 } },
  "bohdan": { "bed": { "self": 0 },  "kick": { "self": -2 } }
}
```

### 14.7 summary.json

An ordered list of blocks. A block without `when` is always included. Text may contain `{name:<guestId>}` and `{kingdom:<kingdomId>}`, which are replaced with names.

```json
[
  { "id": "intro", "text": "Den v hospodě U Tří vran skončil." },
  {
    "id": "mira_kicked",
    "when": { "outcome": ["mira", "kick"] },
    "text": "{name:mira} strávila noc venku. Ráno ji nikdo neviděl – na cestě prý řádili lapkové."
  },
  {
    "id": "k1_angry",
    "when": { "meter": ["k1", "<=", -3] },
    "text": "Z {kingdom:k1} přicházejí zprávy, že hostinský u průsmyku nadržuje sousedům."
  }
]
```

Condition types:

| Condition | Meaning |
|---|---|
| `{ "present": "mira" }` | Guest was among today's guests |
| `{ "outcome": ["mira", "kick"] }` | Night outcome is `kick` or `bed` (any bed) |
| `{ "roommates": ["mira", "bohdan"] }` | Both slept in the same room |
| `{ "sameTable": ["mira", "bohdan"] }` | Both sat at the same table |
| `{ "meter": ["k1", ">=", 3] }` | Final meter comparison; meter id is `stress`, `k1`–`k3` or a guest id; operators `<`, `<=`, `==`, `>=`, `>` |
| `{ "inkVar": ["mira", "told_secret", true] }` | Ink variable snapshot equals a value |
| `{ "all": [ ... ] }` / `{ "any": [ ... ] }` / `{ "not": { ... } }` | Combinators |

A condition that refers to a guest who was not present evaluates to false.

### 14.8 strings.cs.json

All fixed UI text, so wording can be changed without touching code:

```json
{
  "start": "Začít",
  "openPub": "Otevřít hospodu",
  "greeting": "Zdravím, čím posloužím?",
  "closingLine": "Pojďte, najdu vám místo.",
  "bartenderLabel": "Hostinský",
  "unknown": "???",
  "close": "Zavřít",
  "sourceScroll": "Zdroj: Svitek – {kingdom}",
  "sourceConversation": "Zdroj: Rozhovor – {name}",
  "seatingHeading": "Kam posadíte hosta?",
  "seatConfirm": "Usadit",
  "table1": "Stůl 1",
  "table2": "Stůl 2",
  "nightHeading": "Noc – kde budou hosté spát?",
  "bedR1A": "Pokoj 1 – postel A",
  "bedR1B": "Pokoj 1 – postel B",
  "bedR2A": "Pokoj 2 – postel A",
  "bedR2B": "Pokoj 2 – postel B",
  "kick": "Vyhodit",
  "done": "Hotovo",
  "summaryHeading": "Shrnutí dne",
  "playAgain": "Hrát znovu"
}
```

---

## 15. Game state (Zustand)

A sketch of the store; exact shape is up to the implementation.

```ts
type Phase = "title" | "desk" | "conversation" | "seating" | "night" | "summary";
type KingdomId = "k1" | "k2" | "k3";
type NightOutcome = "r1a" | "r1b" | "r2a" | "r2b" | "kick";

interface DeskItemBase {
  id: string; x: number; y: number; z: number;
  surface: "desk" | "cork";
}
interface ScrollItem extends DeskItemBase { kind: "scroll"; scrollId: string; }
interface CutoutItem extends DeskItemBase {
  kind: "cutout";
  text: string;
  source: { type: "scroll"; kingdom: KingdomId } | { type: "conversation"; guestId: string };
}

interface ChatLine {
  speaker: "guest" | "bartender";
  text: string;
  cuttable: boolean;
  stressDelta?: number;                     // badge on bartender answer bubble
}

interface CorkString { id: string; a: string; b: string; color: "red" | "twine" | "blue"; }

interface GameState {
  phase: Phase;
  meters: Record<string, number>;          // "stress" | "k1" | "k2" | "k3" | guestId → −10..10
  lastDelta: Record<string, number>;        // most recent change per meter, for display
  todayGuests: string[];                    // 3 guest ids in arrival order
  currentGuestIndex: number;
  revealed: Record<string, { name: boolean; faction: boolean }>;
  chatLog: ChatLine[];
  deskItems: (ScrollItem | CutoutItem)[];
  corkOpen: boolean;
  corkStrings: CorkString[];
  corkStringColor: "red" | "twine" | "blue";
  readerOpen: string | null;                // scrollId shown in the reader
  noteOpen: string | null;                  // cutout id shown full-screen on corkboard
  seats: (string | null)[];                 // length 8: 0–3 table 1, 4–7 table 2
  nightAssignments: Record<string, NightOutcome | null>;
  inkVars: Record<string, Record<string, unknown>>; // snapshot per guest
  eventLog: { seq: number; source: string; description: string; effects: Record<string, number> }[];
  debugOpen: boolean;
}
```

The live inkjs `Story` object for the current guest can be held outside the store (for example in a module-level ref); only its outputs go into the store.

---

## 16. Placeholder art

Art will come from the user's sketches. Until then, each image is a simple placeholder (flat colour, outline and a Czech label) at a fixed path in `public/art/`, so real art can replace it by dropping in a file with the same name.

| File | Size | Use |
|---|---|---|
| `title_bg.png` | 1920×1080 | Title screen |
| `pub_door_closed.png` | 600×810 | Portrait area before opening |
| `guest_<id>.png` | 600×620 | Guest portraits (thumbnails are scaled down; portrait area may letterbox) |
| `desk.png` | 1920×270 | Desk surface |
| `scroll_rolled.png` | ~200×80 | Scroll on the desk / corkboard |
| `parchment.png` | ~1000×900 | Scroll / note reader background |
| `cutout_paper.png` | tileable | Cutout background |
| `trashcan.png` | 180×180 | Trashcan |
| `corkboard.png` | 960×810 | Corkboard surface |
| `pin.png` | ~32×40 | Pin on corkboard items |
| `cork_arrow.png` | ~48×200 | Open/close corkboard tab |
| `night_bg.png` | 1920×1080 | Night screen |
| `summary_bg.png` | 1920×1080 | Summary screen |

The upper-area background behind the meters and chat panels can be a plain colour for now.

---

## 17. Placeholder content to generate

So the loop is playable end to end before the script phase, generate minimal Czech placeholder content, clearly marked as placeholder:

1. Three kingdoms named "Království A/B/C".
2. One event (a forest fire at the border) reported by three scrolls, one per kingdom, each blaming someone different. One article per scroll with 3–4 cuttable segments.
3. Five guests across the three kingdoms with different starting affinities, each with a short Ink story (3–6 exchanges, 1–3 choices per turn) that says the name in the first line. Across all stories, every tag from section 14.4 must be used at least once, including one optional variable flag.
4. Pairings: at least one specific enemy pair, one specific ally pair and a complete faction fallback.
5. Night effects for all five guests.
6. About 8–10 summary blocks that together use every condition type.

---

## 18. Out of scope for the demo

Sound and music; saving and loading; more than one day; character movement or animation beyond allowed fades/slides; consequences other than meter changes and summary text; hint or glow systems that point at relevant cutouts (intentionally removed so the player alone decides what matters); meter effects from roommates; corkboard affecting gameplay (memory aid only); touch and mobile support; languages other than Czech; telemetry or choice logging for export.

---

## 19. Acceptance checklist

- [ ] Stage renders at 1920×1080 and scales to any window with letterboxing; drag-and-drop stays accurate at every scale.
- [ ] Title → desk → 3 × (conversation → seating) → night → summary → "Hrát znovu" works end to end, with fades.
- [ ] Scrolls open in the reader, cuttable segments create cutouts, the same snippet can be cut repeatedly.
- [ ] Scrolls and cutouts drag freely, stack, come to front when grabbed, stay within the desk and never hide under the minimap.
- [ ] Dropping on the trashcan removes items permanently; source tooltips show on hover.
- [ ] Greeting is inserted automatically; chat appends at the bottom, auto-scrolls and can be scrolled up; `#cut` guest lines create cutouts.
- [ ] All Ink tags work; name and faction show "???" until revealed.
- [ ] Closing line opens the seating overlay; seat selection plus "Usadit" seats the guest; pairing effects (specific, then faction fallback) apply immediately; log clears and the next guest arrives.
- [ ] Meters (including stress) are always visible, clamp to −10…+10 and show the last change; stress badge appears on the bartender answer bubble.
- [ ] Ink can hide choices via conditions on synced stress/affinity vars.
- [ ] Corkboard slides open/closed; items drag between desk and board; pins and three string colours work; layout resets on replay.
- [ ] Night dropdowns prevent double-booked beds; "Hotovo" is disabled until all guests have an outcome; night effects apply.
- [ ] Summary text is assembled correctly from conditions, with final meters shown.
- [ ] "Hrát znovu" fully resets state and draws a new random set of 3 guests.
- [ ] Debug panel toggles with the key under Esc and shows all listed state.
- [ ] All content (text, numbers, conditions) lives in `src/content/`; no content is hardcoded in components.

---

## 20. Open items for the script phase

To be written together after the build skeleton exists: kingdom names, identities and relationships; the day's event and the three newspaper versions; the five guests (name, faction, portrait brief, starting affinity, personality, dialogue); specific pairings and faction fallback values; night effects; summary blocks; final wording of the greeting and closing line.
