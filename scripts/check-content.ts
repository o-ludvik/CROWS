// Content check (part of `npm run check`):
// 1. validateContent() – the same validation the game runs at start-up;
// 2. every .ink compiles and matches its committed .json;
// 3. every knot from days.json is walked through every branch: no choice point may consist only of slots;
// 4. random full 3-day playthroughs (random choices, slots, seats, beds, lounge invites) must never get stuck,
//    and each run's final summary must pick exactly one ending.
import { readFileSync, readdirSync } from 'node:fs'
import { Compiler } from 'inkjs/full'
import { Story } from 'inkjs'
import { validateContent } from '../src/engine/days.ts'
import { selectLounge, selectQueue } from '../src/engine/days.ts'
import { buildSummary, type Ctx, type DayRecord, type NightOutcome } from '../src/engine/summary.ts'
import { parseChoices } from '../src/engine/slots.ts'
import type { DayDef, Guest, Kingdom, Night, Pairings, Quest, Scroll, SummaryBlock } from '../src/content/index.ts'

const dir = new URL('../src/content/', import.meta.url)
const load = <T,>(f: string): T => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
const kingdoms = load<Kingdom[]>('kingdoms.json')
const guests = load<Guest[]>('guests.json')
const days = load<DayDef[]>('days.json')
const summary = load<SummaryBlock[]>('summary.json')
const night = load<Night>('night.json')
const failures: string[] = []
const fail = (msg: string) => failures.push(msg)

// 2. compile
const ink: Record<string, object> = {}
for (const f of readdirSync(new URL('ink/', dir)).filter((x) => x.endsWith('.ink'))) {
  const name = f.slice(0, -4)
  const compiler = new Compiler(readFileSync(new URL(`ink/${f}`, dir), 'utf8'))
  try {
    const json = compiler.Compile().ToJson()!
    ink[name] = JSON.parse(json)
    let committed = ''
    try { committed = readFileSync(new URL(`ink/${name}.json`, dir), 'utf8') } catch { /* missing */ }
    if (committed !== json) fail(`ink/${name}.json is stale – run npm run ink`)
  } catch (e) {
    fail(`ink/${f} does not compile: ${compiler.errors.join('; ') || e}`)
  }
}

// 1. validation
for (const p of validateContent({
  kingdoms, guests, scrolls: load<Scroll[]>('scrolls.json'), quests: load<Quest[]>('quests.json'),
  topics: load<Record<string, string>>('topics.json'), days, summary, night, pairings: load<Pairings>('pairings.json'), ink,
})) fail(p)

const guest = (id: string) => guests.find((g) => g.id === id)!
const newStory = (id: string) => new Story(JSON.stringify(ink[guest(id).ink]))

// 3. exhaustive walk per knot, from a fresh story, under a few synced-variable presets
const PRESETS = [{ stress: 0 }, { stress: 8 }, { stress: -5, aff_self: 5, aff_k3: 5 }]
let paths = 0
for (const d of days) {
  for (const v of [...d.queue, ...d.lounge]) {
    for (const preset of PRESETS) {
      const story = newStory(v.guest)
      for (const [k, val] of Object.entries(preset)) if (story.variablesState.GlobalVariableExistsWithName(k)) story.variablesState.$(k, val)
      story.ChoosePathString(v.knot)
      const walk = (state: string, depth: number) => {
        story.state.LoadJson(state)
        while (story.canContinue) story.Continue()
        const choices = parseChoices(story.currentChoices)
        if (!choices.length) { paths++; return }
        if (depth > 30) return fail(`${v.guest}:${v.knot} looks endless`)
        if (choices.every((c) => c.slot)) fail(`${v.guest}:${v.knot} has a choice point with only slot options (${choices.map((c) => c.text).join(' | ')})`)
        const here = story.state.toJson()
        for (const c of choices) {
          story.state.LoadJson(here)
          story.ChooseChoiceIndex(c.index)
          walk(story.state.toJson(), depth + 1)
        }
      }
      walk(story.state.toJson(), 0)
    }
  }
}
// First visit of every guest must reveal the name in its first line (GDD 14.4 convention).
const firstKnot = new Map<string, string>()
for (const d of days) for (const v of d.queue) if (!firstKnot.has(v.guest)) firstKnot.set(v.guest, v.knot)
for (const [id, knot] of firstKnot) {
  const s = newStory(id)
  s.ChoosePathString(knot)
  s.Continue()
  if (!(s.currentTags ?? []).includes('reveal:name')) fail(`${id}:${knot} first line lacks #reveal:name`)
}

// 4. random playthroughs with a minimal copy of the store's day loop
const BEDS: NightOutcome[] = ['r1a', 'r1b', 'r2a', 'r2b']
const ENDINGS = ['final_truth', 'final_bribe', 'final_war', 'final_blame', 'final_fog']
const seen = { knots: new Set<string>(), blocks: new Set<string>(), claims: new Set<string>() }
let rnd = 12345
const random = () => ((rnd = (rnd * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
const pick = <T,>(a: T[]) => a[Math.floor(random() * a.length)]

function playthrough() {
  const meters: Record<string, number> = { stress: 0 }
  kingdoms.forEach((k) => (meters[k.id] = k.startAffinity))
  const history: Record<number, DayRecord> = {}
  const inkStates: Record<string, string> = {}
  const inkVars: Record<string, Record<string, unknown>> = {}
  const usedClaims: { topic: string; claim: string }[] = []
  const ctx = (day: number): Ctx => ({ day, days: history, meters, inkVars, usedClaims })

  for (const def of days) {
    meters.stress = 0
    const queue = selectQueue(def, ctx(def.day - 1), random)
    const lounge = selectLounge(def, ctx(def.day - 1))
    const rec: DayRecord = { present: [], seats: Array(8).fill(null), night: {}, invited: [], left: [] }
    history[def.day] = rec
    // Random subset of the lounge gets invited, at a random point in the queue.
    const invites = lounge.filter(() => random() < 0.6).map((v) => ({ v, at: Math.floor(random() * (queue.length + 1)) }))
    const order = queue.flatMap((v, i) => [...invites.filter((x) => x.at === i).map((x) => x.v), v])
      .concat(invites.filter((x) => x.at === queue.length).map((x) => x.v))
    for (const v of order) {
      if (lounge.includes(v)) rec.invited.push(v.guest)
      rec.present.push(v.guest)
      if (!(v.guest in meters)) meters[v.guest] = guest(v.guest).startAffinity
      seen.knots.add(`${v.guest}:${v.knot}`)
      const story = newStory(v.guest)
      if (inkStates[v.guest]) story.state.LoadJson(inkStates[v.guest])
      story.ChoosePathString(v.knot)
      const sync = () => {
        const vals: Record<string, number> = { stress: meters.stress, aff_self: meters[v.guest], day: def.day }
        for (const [id, m] of Object.entries(meters)) if (id !== 'stress') vals[`aff_${id}`] = m
        for (const [k, val] of Object.entries(vals)) if (story.variablesState.GlobalVariableExistsWithName(k)) story.variablesState.$(k, val)
      }
      sync()
      for (let guard = 0; ; guard++) {
        if (guard > 50) throw new Error(`${v.guest}:${v.knot} never ends`)
        while (story.canContinue) {
          story.Continue()
          for (const tag of story.currentTags ?? []) {
            const [kind, a, b] = tag.split(':')
            const target = kind === 'stress' ? 'stress' : kind === 'aff' ? (a === 'self' ? v.guest : a) : null
            const delta = Number(kind === 'stress' ? a : b)
            if (target && target in meters) meters[target] = Math.max(-10, Math.min(10, meters[target] + delta))
          }
          sync()
        }
        const choices = parseChoices(story.currentChoices)
        if (!choices.length) break
        const c = pick(choices) // slot options count as "player had a fitting cutout"
        if (c.slot) { usedClaims.push(c.slot); seen.claims.add(`${c.slot.topic}:${c.slot.claim}`) }
        story.ChooseChoiceIndex(c.index)
      }
      inkStates[v.guest] = story.state.toJson()
      inkVars[v.guest] = Object.fromEntries(
        [...(story.variablesState as unknown as { _globalVariables: Map<string, unknown> })._globalVariables.keys()]
          .map((n) => [n, story.variablesState.$(n)]),
      )
      const free = rec.seats.map((x, i) => (!x && i < def.tables * 4 ? i : -1)).filter((i) => i >= 0)
      if (!free.length) throw new Error(`day ${def.day}: no free seat for ${v.guest}`)
      rec.seats[pick(free)] = v.guest
    }
    rec.left = lounge.filter((v) => !rec.invited.includes(v.guest)).map((v) => v.guest)
    const beds = [...BEDS].sort(() => random() - 0.5)
    for (const id of rec.present) rec.night[id] = random() < 0.25 ? 'kick' : (beds.pop() ?? 'kick')
    const paragraphs = buildSummary(summary, ctx(def.day), (x) => x)
    if (!paragraphs.length) throw new Error(`day ${def.day}: empty summary`)
  }
  const final = summary.filter((b) => b.day === 'final')
  const last = days.length
  const firing = final.filter((b) => buildSummary([b], ctx(last), (x) => x, true).length)
  firing.forEach((b) => seen.blocks.add(b.id))
  for (const d of days) summary.filter((b) => b.day !== 'final' && buildSummary([b], ctx(d.day), (x) => x).length).forEach((b) => seen.blocks.add(b.id))
  const endings = firing.filter((b) => ENDINGS.includes(b.id)).map((b) => b.id)
  if (endings.length !== 1) throw new Error(`expected exactly one ending, got ${JSON.stringify(endings)}`)
}

const RUNS = 3000
for (let i = 0; i < RUNS; i++) {
  try { playthrough() } catch (e) { fail(`playthrough ${i}: ${(e as Error).message}`); break }
}
for (const d of days) for (const v of [...d.queue, ...d.lounge]) if (!seen.knots.has(`${v.guest}:${v.knot}`)) fail(`knot ${v.guest}:${v.knot} never reached in ${RUNS} runs`)
const neverFired = summary.filter((b) => !seen.blocks.has(b.id)).map((b) => b.id)
if (neverFired.length) fail(`summary blocks that never fired in ${RUNS} runs: ${neverFired.join(', ')}`)

if (failures.length) {
  console.error(failures.map((f) => `FAIL ${f}`).join('\n'))
  process.exit(1)
}
console.log(`check-content: ${Object.keys(ink).length} stories, ${paths} branch paths, ${RUNS} playthroughs, ${seen.claims.size} slot claims, all summary blocks reached`)
