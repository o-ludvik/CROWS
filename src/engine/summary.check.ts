// Self-check for summary conditions: `npm run check`. Throws on the first failure.
import { evaluate, type Condition, type DayResult } from './summary.ts'

const r: DayResult = {
  present: ['mira', 'bohdan', 'eliska'],
  seats: ['mira', null, 'bohdan', null, 'eliska', null, null, null],
  nightAssignments: { mira: 'r1a', bohdan: 'r1b', eliska: 'kick' },
  meters: { k1: -3, k2: 0, k3: 2, mira: 1, bohdan: 0, eliska: -4 },
  inkVars: { mira: { told_secret: true } },
}

const cases: [Condition, boolean][] = [
  [{ present: 'mira' }, true],
  [{ present: 'radek' }, false],
  [{ outcome: ['mira', 'bed'] }, true],
  [{ outcome: ['eliska', 'kick'] }, true],
  [{ outcome: ['radek', 'kick'] }, false],
  [{ roommates: ['mira', 'bohdan'] }, true],
  [{ roommates: ['mira', 'eliska'] }, false],
  [{ sameTable: ['mira', 'bohdan'] }, true],
  [{ sameTable: ['mira', 'eliska'] }, false],
  [{ meter: ['k1', '<=', -3] }, true],
  [{ meter: ['k1', '<', -3] }, false],
  [{ meter: ['radek', '<', 100] }, false],
  [{ inkVar: ['mira', 'told_secret', true] }, true],
  [{ inkVar: ['bohdan', 'told_secret', true] }, false],
  [{ all: [{ present: 'mira' }, { not: { present: 'radek' } }] }, true],
  [{ any: [{ present: 'radek' }, { present: 'vlasta' }] }, false],
]

cases.forEach(([c, want], i) => {
  if (evaluate(c, r) !== want) throw new Error(`case ${i} failed: ${JSON.stringify(c)} expected ${want}`)
})
console.log(`summary.check: ${cases.length} ok`)
