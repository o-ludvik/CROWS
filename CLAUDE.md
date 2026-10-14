# What the crows say — demo

One-day playtest build of a medieval pub/bartender game. **GDD.md is the spec**; read the relevant section before changing behaviour.

## Commands

- `npm run dev -- --host` — playtest server (LAN testers open `http://<host-ip>:5173`)
- `npm run build` — type-check (`tsc -b`) + production build. Run before calling a change done.
- `npm run ink` — compile `src/content/ink/*.ink` → `*.json`. Run after every `.ink` edit; commit both files.
- `npm run check` — self-check for summary conditions (`src/engine/summary.check.ts`, plain node, no test framework).
- `npx oxlint` — lint.

## Layout

- `src/content/` — **all game content**: JSON data, `strings.cs.json`, Ink stories. `content/index.ts` types and exposes it, plus `t(key, vars)` for UI strings.
- `src/store/gameStore.ts` — Zustand store + game engine: phases, Ink runner, tag handling, `applyEffects`, pairings, night, desk actions. Components call the exported `actions`; they don't `setState` directly.
- `src/engine/summary.ts` — pure summary-condition evaluator (no store/content imports so node can run its check).
- `src/screens/` — one component per phase (Title, Pub, Night, Summary). `src/components/` — pieces of those screens.
- `public/art/` — placeholder PNGs at fixed names (GDD §16). Replace art by dropping in a file with the same name.

## Conventions

- **No content in components.** Every visible sentence, label, number, pairing or condition lives in `src/content/`. Czech UI text goes in `strings.cs.json` and is read with `t()`.
- **Every meter change goes through `applyEffects(effects, source)`** — it clamps to −10…+10, records `lastDelta` and writes the event log.
- **Stage coordinates.** Everything is laid out on a fixed 1920×1080 stage scaled by `Stage`. Pointer deltas must be divided by `getScale()`. Desk positions (`DESK`, `TRASH`, `MINIMAP` in the store) are relative to the desk, not the stage.
- **Names/factions show "???" until revealed** — use `guestName(id, s)` / `guestFaction(id, s)`, never `guest.name` directly in UI (the summary screen is the one exception: it uses true names).
- **No motion** except the 400 ms fade-to-black (`fadeTo`), portrait fade-in on guest change, and the ~300 ms corkboard top-strip slide. Overlays (reader, seating) switch instantly.
- **Mouse only**; the only key is Backquote (key under Esc) for the debug panel. No text inputs.
- Out of scope (GDD §18): sound, saves/localStorage, multiple days, animation, mobile/touch, other languages.
- Strict TypeScript. Styling is a single `src/index.css`, plain CSS with stage-pixel units.
- The live inkjs `Story` is a module variable in the store; only its outputs go into state.

## Writing Ink

- Story starts with the guest's reply (the engine inserts the greeting) and says the guest's name in the first line with `#reveal:name`.
- Use bracketed choices `* [Text]` — the engine echoes choice text as the bartender's line.
- Tags: `#cut`, `#reveal:name`, `#reveal:faction`, `#aff:self:+2`, `#aff:k1:-1`, `#aff:<guestId>:+1`, `#stress:+2`, `#bartender`. To make a choice move a meter, tag the first line inside its branch.
- Optional `VAR stress` / `aff_self` / `aff_k1..3` / `aff_<guestId>` are kept in sync with the meters (for branching and hiding choices). All `VAR`s are snapshotted at story end and readable from `summary.json` via `inkVar`.
- Unknown tags log a console warning.
