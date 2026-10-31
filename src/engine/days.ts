// Day schedule (GDD 4, 7a, 14.9) and start-up content validation. Pure, so the node checks can run it.
import type { DayDef, Guest, Kingdom, Night, Pairings, Quest, Scroll, SummaryBlock, Visit } from '../content/index.ts'
import { evaluate, type Ctx } from './summary.ts'

/** Today's queue: entries whose `when` holds (ctx = previous day), shuffled if the day asks for it. */
export function selectQueue(def: DayDef, ctx: Ctx, random = Math.random): Visit[] {
  const q = def.queue.filter((v) => !v.when || evaluate(v.when, ctx))
  if (!def.shuffle) return q
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[q[i], q[j]] = [q[j], q[i]]
  }
  return q
}

/** Morning lounge: per guest the first entry whose `when` holds, only if the guest slept in a bed last night (ctx.day). */
export function selectLounge(def: DayDef, ctx: Ctx): Visit[] {
  const out: Visit[] = []
  for (const v of def.lounge) {
    if (out.some((o) => o.guest === v.guest)) continue
    const bed = ctx.days[ctx.day]?.night[v.guest]
    if (!bed || bed === 'kick') continue
    if (!v.when || evaluate(v.when, ctx)) out.push(v)
  }
  return out
}

/** Knot names in a compiled Ink story. */
export function inkKnots(json: object): string[] {
  const root = (json as { root: unknown[] }).root
  const named = root[root.length - 1] as Record<string, unknown> | null
  return Object.keys(named ?? {}).filter((k) => k !== 'global decl' && !k.startsWith('#'))
}

/** Every tag string in a compiled Ink story (line and choice tags). */
export function inkTags(json: object): string[] {
  return [...JSON.stringify(json).matchAll(/"#","\^([^"]*)","\/#"/g)].map((m) => m[1].trim())
}

export interface ContentBundle {
  kingdoms: Kingdom[]
  guests: Guest[]
  scrolls: Scroll[]
  quests: Quest[]
  topics: Record<string, string>
  days: DayDef[]
  summary: SummaryBlock[]
  night: Night
  pairings: Pairings
  ink: Record<string, object | undefined>
}

const TAG_KINDS = new Set(['cut', 'quest', 'slot', 'reveal', 'aff', 'stress', 'bartender'])

/** Human-readable problems with the content; empty when everything is consistent. */
export function validateContent(c: ContentBundle): string[] {
  const errors: string[] = []
  const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`)
  const kingdom = new Set<string>(c.kingdoms.map((k) => k.id))
  const guest = new Map(c.guests.map((g) => [g.id, g]))
  const quest = new Set(c.quests.map((q) => q.id))
  const scroll = new Set(c.scrolls.map((s) => s.id))

  for (const g of c.guests) {
    if (!kingdom.has(g.faction)) err(`guests.json ${g.id}`, `unknown faction "${g.faction}"`)
    if (!c.ink[g.ink]) err(`guests.json ${g.id}`, `missing ink/${g.ink}.json (run npm run ink)`)
  }
  for (const s of c.scrolls) {
    if (!kingdom.has(s.kingdom)) err(`scrolls.json ${s.id}`, `unknown kingdom "${s.kingdom}"`)
    s.articles.forEach((a, ai) => {
      if (a.quest && !quest.has(a.quest)) err(`scrolls.json ${s.id}[${ai}]`, `unknown quest "${a.quest}"`)
      for (const seg of a.paragraphs.flat()) {
        if (seg.quest && !quest.has(seg.quest)) err(`scrolls.json ${s.id}`, `unknown quest "${seg.quest}"`)
        if (seg.topic && !(seg.topic in c.topics)) err(`scrolls.json ${s.id}`, `unknown topic "${seg.topic}"`)
        if (seg.topic && !seg.claim) err(`scrolls.json ${s.id}`, `segment with topic "${seg.topic}" has no claim`)
        if ((seg.topic || seg.quest) && !seg.cut) err(`scrolls.json ${s.id}`, `topic/quest on a segment that is not cuttable`)
      }
    })
  }

  const seen = new Set<string>()
  c.days.forEach((d, i) => {
    const where = `days.json day ${d.day}`
    if (d.day !== i + 1) err(where, `days must be listed in order 1, 2, 3…`)
    if (d.tables !== 1 && d.tables !== 2) err(where, `tables must be 1 or 2`)
    for (const s of d.scrolls) {
      if (!scroll.has(s)) err(where, `unknown scroll "${s}"`)
      if (seen.has(s)) err(where, `scroll "${s}" already arrived on an earlier day`)
      seen.add(s)
    }
    for (const v of [...d.queue, ...d.lounge]) {
      const g = guest.get(v.guest)
      if (!g) { err(where, `unknown guest "${v.guest}"`); continue }
      const json = c.ink[g.ink]
      if (json && !inkKnots(json).includes(v.knot)) err(where, `ink/${g.ink}.ink has no knot "${v.knot}"`)
    }
    const queued = d.queue.map((v) => v.guest)
    const lounge = [...new Set(d.lounge.map((v) => v.guest))]
    if (new Set(queued).size !== queued.length) err(where, `a guest is queued twice`)
    for (const id of lounge) if (queued.includes(id)) err(where, `"${id}" is both in the queue and in the lounge`)
    if (i === 0 && d.lounge.length) err(where, `day 1 cannot have lounge follow-ups (nobody slept here yet)`)
    const most = queued.length + lounge.length
    if (most > d.tables * 4) err(where, `up to ${most} guests (queue + lounge) but only ${d.tables * 4} seats`)
  })

  for (const [name, json] of Object.entries(c.ink)) {
    if (!json) continue
    for (const tag of inkTags(json)) {
      const [kind, a, b] = tag.split(':')
      const where = `ink/${name}.ink #${tag}`
      if (!TAG_KINDS.has(kind)) err(where, `unknown tag`)
      if ((kind === 'slot' || (kind === 'cut' && a)) && !(a in c.topics)) err(where, `unknown topic "${a}"`)
      if ((kind === 'slot' || (kind === 'cut' && a)) && !b) err(where, `missing claim`)
      if (kind === 'quest' && !quest.has(a)) err(where, `unknown quest "${a}"`)
      if (kind === 'aff' && a !== 'self' && !kingdom.has(a) && !guest.has(a)) err(where, `unknown meter "${a}"`)
    }
  }

  for (const p of c.pairings.pairs) for (const id of p.guests) if (!guest.has(id)) err('pairings.json', `unknown guest "${id}"`)
  for (const id of Object.keys(c.night)) if (!guest.has(id)) err('night.json', `unknown guest "${id}"`)
  for (const b of c.summary) {
    for (const m of b.text.matchAll(/\{(name|kingdom):(\w+)\}/g)) {
      if (m[1] === 'name' ? !guest.has(m[2]) : !kingdom.has(m[2])) err(`summary.json ${b.id}`, `unknown ${m[1]} "${m[2]}"`)
    }
  }
  return errors
}
