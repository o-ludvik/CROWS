# What the crows say — demo

Three-day playtest build of a medieval pub/bartender game. **GDD.md is the spec**; read the relevant section before changing behaviour.

## Commands

- `npm run dev -- --host` — playtest server (LAN testers open `http://<host-ip>:5173/CROWS/`). Pushes to `main` deploy to GitHub Pages (`base: '/CROWS/'`).
- `npm run build` — type-check (`tsc -b`) + production build. Run before calling a change done.
- `npm run ink` — compile `src/content/ink/*.ink` → `*.json`. Run after every `.ink` edit; commit both files.
- `npm run check` — `src/engine/engine.check.ts` (conditions, slots, queue/lounge selection) + `scripts/check-content.ts` (content validation, stale ink JSON, walks every Ink branch, 3000 random 3-day playthroughs). Plain node, no test framework. Run after content changes.
- `npx oxlint` — lint.

## Layout

- `src/content/` — **all game content**: JSON data (`days.json` = per-day schedule, `quests.json`, `topics.json` = slot labels, …), `strings.cs.json`, Ink stories. `content/index.ts` types and exposes it, plus `t(key, vars)`, and logs start-up validation errors.
- `src/store/gameStore.ts` — Zustand store + game engine: days, phases, persistent per-guest Ink runner, tag handling, `applyEffects`, lounge invite/pause/resume, slot drops, pairings, night, desk actions. Components call the exported `actions`; they don't `setState` directly.
- `src/engine/` — pure modules (no store/content value imports so node can run them): `summary.ts` (conditions), `slots.ts`, `days.ts` (queue/lounge selection, `validateContent`).
- `src/screens/` — one component per phase (Title, Pub, Night, Summary). `src/components/` — pieces of those screens.
- `public/art/` — placeholder PNGs at fixed names (GDD §16). Replace art by dropping in a file with the same name.

## Conventions

- **No content in components.** Every visible sentence, label, number, pairing or condition lives in `src/content/`. Czech UI text goes in `strings.cs.json` and is read with `t()`.
- **Every meter change goes through `applyEffects(effects, source)`** — it clamps to −10…+10, records `lastDelta` and writes the event log.
- **Stage coordinates.** Everything is laid out on a fixed 1920×1080 stage scaled by `Stage`. Pointer deltas must be divided by `getScale()`. Desk positions (`DESK`, `TRASH`, `MINIMAP` in the store) are relative to the desk, not the stage.
- **Names/factions show "???" until revealed** — use `guestName(id, s)` / `guestFaction(id, s)`, never `guest.name` directly in UI (the summary screen is the one exception: it uses true names).
- **No motion** except the 400 ms fade-to-black (`fadeTo`), portrait fade-in on guest change, and the ~300 ms top-strip slide (cork | main | lounge). Overlays (reader, seating) switch instantly.
- **Mouse only**; the only key is Backquote (key under Esc) for the debug panel. Exception: dev builds, debug panel open, keys 1–3 jump to that day. No text inputs.
- Out of scope (GDD §18): sound, saves/localStorage, more than 3 days, animation, mobile/touch, other languages.
- Strict TypeScript. Styling is a single `src/index.css`, plain CSS with stage-pixel units.
- The live inkjs `Story` is a module variable in the store; only its outputs go into state.

## Writing Ink

- One file per guest; root is just `-> END`; one knot per visit (`day1`, `followup_day2`, …) as named in `days.json`. Story state persists across visits. Header comment: who, what they want, which days, which mechanics.
- A visit starts with the guest's reply (the engine inserts the greeting); a guest's first visit says the name in its first line with `#reveal:name`.
- Use bracketed choices `* [Text]` — the engine echoes choice text as the bartender's line. **Choice tags go inside the brackets**: `* [Text #slot:topic:claim]` (a tag after `]` lands on the branch's first line).
- Tags: `#cut`, `#cut:<topic>:<claim>`, `#quest:<id>`, `#slot:<topic>:<claim|*>` (choice), `#reveal:name`, `#reveal:faction`, `#aff:self:+2`, `#aff:k1:-1`, `#aff:<guestId>:+1`, `#stress:+2`, `#bartender`. To make a choice move a meter, tag the first line inside its branch.
- Every choice point needs at least one non-slot choice (`npm run check` enforces it).
- Optional `VAR stress` / `aff_self` / `aff_k1..3` / `aff_<guestId>` (met guests only; default `-99` = "not met") / `day` are kept in sync. All `VAR`s are snapshotted at visit end and readable via `inkVar` conditions.
- Unknown tags log a console warning.
