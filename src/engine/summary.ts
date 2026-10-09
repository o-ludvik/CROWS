// Summary condition evaluation (GDD 14.7). Pure: no store or content imports, so summary.check.ts can run it in node.

export type NightOutcome = 'r1a' | 'r1b' | 'r2a' | 'r2b' | 'kick'
type Op = '<' | '<=' | '==' | '>=' | '>'

export type Condition =
  | { present: string }
  | { outcome: [string, 'kick' | 'bed'] }
  | { roommates: [string, string] }
  | { sameTable: [string, string] }
  | { meter: [string, Op, number] }
  | { inkVar: [string, string, unknown] }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }

export interface DayResult {
  present: string[]
  seats: (string | null)[]
  nightAssignments: Record<string, NightOutcome | null>
  meters: Record<string, number>
  inkVars: Record<string, Record<string, unknown>>
}

const tableOf = (seats: (string | null)[], id: string) => {
  const i = seats.indexOf(id)
  return i < 0 ? -1 : Math.floor(i / 4)
}

export function evaluate(c: Condition, r: DayResult): boolean {
  const here = (...ids: string[]) => ids.every((id) => r.present.includes(id))
  if ('all' in c) return c.all.every((x) => evaluate(x, r))
  if ('any' in c) return c.any.some((x) => evaluate(x, r))
  if ('not' in c) return !evaluate(c.not, r)
  if ('present' in c) return here(c.present)
  if ('outcome' in c) {
    const [id, want] = c.outcome
    const o = r.nightAssignments[id]
    return here(id) && !!o && (want === 'kick' ? o === 'kick' : o !== 'kick')
  }
  if ('roommates' in c) {
    const [a, b] = c.roommates.map((id) => r.nightAssignments[id])
    return here(...c.roommates) && !!a && !!b && a !== 'kick' && b !== 'kick' && a.slice(0, 2) === b.slice(0, 2)
  }
  if ('sameTable' in c) {
    const [a, b] = c.sameTable.map((id) => tableOf(r.seats, id))
    return here(...c.sameTable) && a >= 0 && a === b
  }
  if ('meter' in c) {
    const [id, op, n] = c.meter
    const v = r.meters[id]
    if (v === undefined) return false // guest not present
    return { '<': v < n, '<=': v <= n, '==': v === n, '>=': v >= n, '>': v > n }[op]
  }
  if ('inkVar' in c) {
    const [id, name, value] = c.inkVar
    return here(id) && r.inkVars[id]?.[name] === value
  }
  return false
}

export function buildSummary(blocks: { when?: Condition; text: string }[], r: DayResult, names: (key: string) => string) {
  return blocks
    .filter((b) => !b.when || evaluate(b.when, r))
    .map((b) => b.text.replace(/\{(name|kingdom):(\w+)\}/g, (_, _kind, id: string) => names(id)))
}
