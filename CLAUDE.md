# What the crows say — demo

Three-day playtest build of a medieval pub/bartender game. **gameplay_SoT.md is the spec** (gameplay + UI); read the relevant section before changing behaviour.

## Commands

- `npm run dev -- --host` — playtest server (LAN testers open `http://<host-ip>:5173/CROWS/`). Pushes to `main` deploy to GitHub Pages (`base: '/CROWS/'`).
- `npm run build` — type-check (`tsc -b`) + production build. Run before calling a change done.
- `npm run ink` — compile `src/content/ink/*.ink` → `*.json`. Run after every `.ink` edit; commit both files.
- `npm run check` — `src/engine/engine.check.ts` (conditions, slots, queue/lounge selection) + `scripts/check-content.ts` (content validation, stale ink JSON, walks every Ink branch, 3000 random 3-day playthroughs). Plain node, no test framework. Run after content changes.
- `npx oxlint` — lint.

## Layout

- `src/content/` — **all game content**: JSON data (`days.json` = per-day schedule, `topics.json` = slot labels, `pairings.json` = `table` + `room` rules, `items.json` = desk items, `chronicle.json` = achievements/endings, `config.json` = stress threshold, …), `strings.cs.json`, Ink stories. `content/index.ts` types and exposes it, plus `t(key, vars)`, and logs start-up validation errors.
- `src/store/gameStore.ts` — Zustand store + game engine: days, phases, persistent per-guest Ink runner, tag handling, `applyEffects`, lounge invite/pause/resume (uninvited lounge guests come last on their own), slot drops, table/room pairings, night, desk actions, saves (`crows.save.auto|manual`) and the cross-playthrough chronicle (`crows.chronicle`) in localStorage. Components call the exported `actions`; they don't `setState` directly.
- `src/engine/` — pure modules (no store/content value imports so node can run them): `summary.ts` (conditions), `slots.ts`, `days.ts` (queue/lounge selection, `validateContent`).
- `src/screens/` — one component per phase (Title, Pub, Night = overnight assignment, Summary = end-of-day evaluation). `src/components/` — pieces of those screens; `Menus.tsx` holds the menu/load/settings/chronicle overlays, `CharacterLog.tsx` the character log.
- `public/art/` — placeholder PNGs at fixed names (`guest_<id>.png`, `guest_<id>_<variant>.png` for `#portrait` tells, `items/<id>.png`, …). Replace art by dropping in a file with the same name.

## Conventions

- **No content in components.** Every visible sentence, label, number, pairing or condition lives in `src/content/`. Czech UI text goes in `strings.cs.json` and is read with `t()`.
- **Meters are hidden.** Stress, kingdom and guest affinity are never shown in the UI (only in the debug panel); feedback is reactions, the candle, tooltips and the evaluation.
- **Every meter change goes through `applyEffects(effects, source)`** — it clamps to −10…+10 and writes the event log.
- **Stage coordinates.** Everything is laid out on a fixed 1920×1080 stage scaled by `Stage`. Pointer deltas must be divided by `getScale()`. Desk positions (`DESK`, `TRASH`, `MINIMAP` in the store) are relative to the desk, not the stage.
- **Names/factions show "???" until revealed** — use `guestName(id, s)` / `guestFaction(id, s)`, never `guest.name` directly in UI (the summary screen is the one exception: it uses true names).
- **No motion** except the 400 ms fade-to-black (`fadeTo`), portrait fade-in on guest change, and the ~300 ms top-strip slide (cork | main | lounge). Overlays (reader, picker, seating, menus, character log) switch instantly and close with ✕ (`CloseX`) or a click outside.
- **Mouse only**; the only key is Backquote (key under Esc) for the debug panel. Exception: dev builds, debug panel open, keys 1–3 jump to that day. No text inputs.
- Out of scope: sound, more than 3 days, animation, mobile/touch, other languages.
- Strict TypeScript. Styling is a single `src/index.css`, plain CSS with stage-pixel units.
- The live inkjs `Story` is a module variable in the store; only its outputs go into state.

## Writing Ink

- One file per guest; root is just `-> END`; one knot per visit (`day1`, `followup_day2`, …) as named in `days.json`. Story state persists across visits. Header comment: who, what they want, which days, which mechanics.
- A visit starts with the guest greeting the innkeeper (the engine inserts nothing); a guest's first visit says the name in its first line with `#reveal:name`.
- Use bracketed choices `* [Text]` — the engine echoes choice text as the bartender's line. **Choice tags go inside the brackets**: `* [Text #slot:topic:claim]` (a tag after `]` lands on the branch's first line).
- Tags: `#cut`, `#cut:<topic>:<claim>`, `#slot:<topic>:<claim|*>` (choice), `#reveal:name`, `#reveal:faction`, `#aff:self:+2`, `#aff:k1:-1`, `#aff:<guestId>:+1`, `#stress:+2`, `#bartender`, `#item:<itemId>` (puts an item on the desk), `#portrait:<variant>` (lie tell: shows `guest_<id>_<variant>.png` from that line until the player's next reply). To make a choice move a meter, tag the first line inside its branch.
- Every choice point needs at least one non-slot choice, and every slot topic needs a `*` option — a clipping on the right topic is never rejected (`npm run check` enforces both).
- Optional `VAR stress` / `stress_threshold` / `aff_self` / `aff_k1..3` / `aff_<guestId>` (met guests only; default `-99` = "not met") / `day` are kept in sync. All `VAR`s are snapshotted at visit end and readable via `inkVar` conditions.
- Unknown tags log a console warning.
