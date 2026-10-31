// Condition evaluation (GDD 14.7). Pure: no store or content imports, so the node checks can run it.

export type NightOutcome = 'r1a' | 'r1b' | 'r2a' | 'r2b' | 'kick'
type Op = '<' | '<=' | '==' | '>=' | '>'
/** A guest id, or [guestId, day] to look at a specific day instead of the context day. */
type GuestRef = string | [string, number]

export type Condition =
  | { present: GuestRef }
  | { leftLounge: GuestRef }
  | { invitedFromLounge: GuestRef }
  | { outcome: [string, 'kick' | 'bed'] | [string, 'kick' | 'bed', number] }
  | { roommates: [string, string] | [string, string, number] }
  | { sameTable: [string, string] | [string, string, number] }
  | { meter: [string, Op, number] }
  | { inkVar: [string, string, unknown] }
  | { day: number }
  | { usedClaim: [string, string] }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }

/** What happened on one day. Filled while the day runs; frozen into history after the night. */
export interface DayRecord {
  present: string[]
  seats: (string | null)[]
  night: Record<string, NightOutcome | null>
  invited: string[]
  left: string[]
}

export interface Ctx {
  /** Day the guest-day conditions look at by default. */
  day: number
  days: Record<number, DayRecord>
  meters: Record<string, number>
  inkVars: Record<string, Record<string, unknown>>
  usedClaims: { topic: string; claim: string }[]
}

const tableOf = (seats: (string | null)[], id: string) => {
  const i = seats.indexOf(id)
  return i < 0 ? -1 : Math.floor(i / 4)
}
const isBed = (o: NightOutcome | null | undefined): o is Exclude<NightOutcome, 'kick'> => !!o && o !== 'kick'

export function evaluate(c: Condition, r: Ctx): boolean {
  const rec = (day?: number) => r.days[day ?? r.day] as DayRecord | undefined
  const ref = (g: GuestRef): [string, DayRecord | undefined] => (typeof g === 'string' ? [g, rec()] : [g[0], rec(g[1])])
  if ('all' in c) return c.all.every((x) => evaluate(x, r))
  if ('any' in c) return c.any.some((x) => evaluate(x, r))
  if ('not' in c) return !evaluate(c.not, r)
  if ('day' in c) return r.day === c.day
  if ('present' in c) { const [id, d] = ref(c.present); return !!d?.present.includes(id) }
  if ('leftLounge' in c) { const [id, d] = ref(c.leftLounge); return !!d?.left.includes(id) }
  if ('invitedFromLounge' in c) { const [id, d] = ref(c.invitedFromLounge); return !!d?.invited.includes(id) }
  if ('outcome' in c) {
    const [id, want, day] = c.outcome
    const o = rec(day)?.night[id]
    return !!o && (want === 'kick' ? o === 'kick' : isBed(o))
  }
  if ('roommates' in c) {
    const [a, b, day] = c.roommates
    const n = rec(day)?.night
    const ra = n?.[a]
    const rb = n?.[b]
    return isBed(ra) && isBed(rb) && ra.slice(0, 2) === rb.slice(0, 2)
  }
  if ('sameTable' in c) {
    const [a, b, day] = c.sameTable
    const seats = rec(day)?.seats ?? []
    const ta = tableOf(seats, a)
    return ta >= 0 && ta === tableOf(seats, b)
  }
  if ('meter' in c) {
    const [id, op, n] = c.meter
    const v = r.meters[id]
    if (v === undefined) return false // guest never met
    return { '<': v < n, '<=': v <= n, '==': v === n, '>=': v >= n, '>': v > n }[op]
  }
  if ('inkVar' in c) {
    const [id, name, value] = c.inkVar
    return r.inkVars[id]?.[name] === value
  }
  if ('usedClaim' in c) {
    const [topic, claim] = c.usedClaim
    return r.usedClaims.some((u) => u.topic === topic && u.claim === claim)
  }
  return false
}

export interface SummaryBlockData { day?: number | 'final'; when?: Condition; text: string }

/** Paragraphs for the day summary; `final` selects only blocks with `day: "final"`. */
export function buildSummary(blocks: SummaryBlockData[], r: Ctx, names: (key: string) => string, final = false) {
  return blocks
    .filter((b) => (final ? b.day === 'final' : b.day === undefined || b.day === r.day))
    .filter((b) => !b.when || evaluate(b.when, r))
    .map((b) => b.text.replace(/\{(name|kingdom):(\w+)\}/g, (_, _kind, id: string) => names(id)))
}
