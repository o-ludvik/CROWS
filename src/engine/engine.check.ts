// Self-check for the pure engine: `npm run check`. Throws on the first failure.
import { buildSummary, evaluate, type Condition, type Ctx } from './summary.ts'
import { parseChoices, pickSlot, slotTopics } from './slots.ts'
import { selectLounge, selectQueue } from './days.ts'
import type { DayDef } from '../content/index.ts'

const ok = (cond: boolean, msg: string) => { if (!cond) throw new Error(msg) }

// --- summary conditions -------------------------------------------------------
const r: Ctx = {
  day: 2,
  days: {
    1: {
      present: ['mira', 'bohdan', 'eliska'],
      seats: ['mira', null, 'bohdan', null, 'eliska', null, null, null],
      night: { mira: 'r1a', bohdan: 'r1b', eliska: 'kick' },
      invited: [],
      left: [],
    },
    2: {
      present: ['bohdan', 'radek', 'mira'],
      seats: ['radek', 'mira', null, null, 'bohdan', null, null, null],
      night: { bohdan: 'r2a', radek: 'kick', mira: 'r2b' },
      invited: ['mira'],
      left: ['eliska'],
    },
  },
  meters: { stress: 6, k1: -3, k2: 0, k3: 2, mira: 1, bohdan: 0, eliska: -4 },
  inkVars: { mira: { told_secret: true, side: 'k2' } },
  usedClaims: [{ topic: 'fire', claim: 'k2_soldiers' }],
}

const cases: [Condition, boolean][] = [
  [{ day: 2 }, true],
  [{ day: 1 }, false],
  [{ present: 'radek' }, true],
  [{ present: 'eliska' }, false],
  [{ present: ['eliska', 1] }, true],
  [{ outcome: ['mira', 'bed'] }, true],
  [{ outcome: ['radek', 'kick'] }, true],
  [{ outcome: ['eliska', 'kick'] }, false], // not here today
  [{ outcome: ['eliska', 'kick', 1] }, true],
  [{ roommates: ['bohdan', 'mira'] }, true],
  [{ roommates: ['eliska', 'mira', 1] }, false], // kicked guest has no room
  [{ roommates: ['mira', 'bohdan', 1] }, true], // r1a + r1b share room 1
  [{ sameTable: ['radek', 'mira'] }, true],
  [{ sameTable: ['mira', 'bohdan'] }, false],
  [{ sameTable: ['mira', 'bohdan', 1] }, true],
  [{ meter: ['k1', '<=', -3] }, true],
  [{ meter: ['k1', '<', -3] }, false],
  [{ meter: ['radek', '<', 100] }, false], // never met → no meter
  [{ meter: ['stress', '>=', 5] }, true],
  [{ inkVar: ['mira', 'told_secret', true] }, true],
  [{ inkVar: ['mira', 'side', 'k2'] }, true],
  [{ inkVar: ['bohdan', 'told_secret', true] }, false],
  [{ invitedFromLounge: 'mira' }, true],
  [{ invitedFromLounge: ['mira', 1] }, false],
  [{ leftLounge: 'eliska' }, true],
  [{ leftLounge: 'mira' }, false],
  [{ usedClaim: ['fire', 'k2_soldiers'] }, true],
  [{ usedClaim: ['fire', 'accident'] }, false],
  [{ all: [{ present: 'mira' }, { not: { present: 'eliska' } }] }, true],
  [{ any: [{ present: 'eliska' }, { leftLounge: 'bohdan' }] }, false],
]
cases.forEach(([c, want], i) => ok(evaluate(c, r) === want, `summary case ${i} failed: ${JSON.stringify(c)} expected ${want}`))

const blocks = [
  { text: 'every day' },
  { day: 2, text: 'day two' },
  { day: 1, text: 'day one' },
  { day: 'final' as const, text: 'ending {name:mira}' },
  { day: 2, when: { leftLounge: 'mira' } as Condition, text: 'never' },
]
const names = (id: string) => id.toUpperCase()
ok(JSON.stringify(buildSummary(blocks, r, names)) === '["every day","day two"]', 'buildSummary day filter')
ok(JSON.stringify(buildSummary(blocks, r, names, true)) === '["ending MIRA"]', 'buildSummary final + names')

// --- slots ----------------------------------------------------------------------
const choices = parseChoices([
  { text: 'Soldiers', tags: ['slot:fire:k2_soldiers'] },
  { text: 'Anything', tags: [' slot:fire:* '] },
  { text: 'Plain', tags: [] },
  { text: 'Other topic', tags: ['slot:letter:forged'] },
])
ok(JSON.stringify(slotTopics(choices)) === '["fire","letter"]', 'slotTopics')
ok(pickSlot(choices, 'fire', { topic: 'fire', claim: 'k2_soldiers' })?.text === 'Soldiers', 'slot exact claim')
ok(pickSlot(choices, 'fire', { topic: 'fire', claim: 'accident' })?.text === 'Anything', 'slot * fallback')
ok(pickSlot(choices, 'fire', { topic: 'letter', claim: 'forged' }) === null, 'slot wrong topic rejected')
ok(pickSlot(choices, 'fire', {}) === null, 'slot cutout without topic rejected')
ok(pickSlot(choices, 'letter', { topic: 'letter', claim: 'genuine' }) === null, 'slot without * rejects unknown claim')
ok(choices[2].slot === undefined && choices[3].index === 3, 'plain choices keep their ink index')

// --- days: queue + lounge selection ------------------------------------------------
const day3: DayDef = {
  day: 3, tables: 2, scrolls: [], shuffle: false,
  queue: [
    { guest: 'bohdan', knot: 'day3' },
    { guest: 'eliska', knot: 'day3', when: { not: { outcome: ['eliska', 'kick', 1] } } },
  ],
  lounge: [
    { guest: 'mira', knot: 'followup_secret', when: { inkVar: ['mira', 'told_secret', true] } },
    { guest: 'mira', knot: 'followup' },
    { guest: 'radek', knot: 'followup' }, // kicked last night → never in the lounge
    { guest: 'bohdan', knot: 'followup', when: { roommates: ['bohdan', 'radek'] } },
  ],
}
// Morning of day 3 looks at day 2 (ctx.day = 2).
ok(JSON.stringify(selectQueue(day3, r).map((v) => v.guest)) === '["bohdan"]', 'queue when filters eliska (kicked day 1)')
const lounge = selectLounge(day3, r)
ok(JSON.stringify(lounge.map((v) => `${v.guest}:${v.knot}`)) === '["mira:followup_secret"]', `lounge selection: ${JSON.stringify(lounge)}`)
const noSecret = { ...r, inkVars: {} }
ok(selectLounge(day3, noSecret)[0].knot === 'followup', 'lounge falls through to the next entry for the guest')
const shuffled = selectQueue({ ...day3, shuffle: true, queue: [day3.queue[0], { guest: 'x', knot: 'k' }] }, r, () => 0)
ok(shuffled.length === 2 && shuffled[0].guest === 'x', 'shuffle uses the random source')

console.log(`engine.check: ${cases.length} conditions, slots, days ok`)
