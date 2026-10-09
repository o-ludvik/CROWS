import { create } from 'zustand'
import { Story } from 'inkjs'
import {
  guests, guestById, inkJson, kingdomById, kingdoms, night, pairings, scrolls, t,
  type Effects, type KingdomId,
} from '../content'
import type { NightOutcome } from '../engine/summary'

export type Phase = 'title' | 'desk' | 'conversation' | 'seating' | 'night' | 'summary'
export type { NightOutcome }

interface DeskItemBase { id: string; x: number; y: number; z: number }
export interface ScrollItem extends DeskItemBase { kind: 'scroll'; scrollId: string }
export interface CutoutItem extends DeskItemBase {
  kind: 'cutout'
  text: string
  source: { type: 'scroll'; kingdom: KingdomId } | { type: 'conversation'; guestId: string }
}
export type DeskItem = ScrollItem | CutoutItem
export interface ChatLine { speaker: 'guest' | 'bartender'; text: string; cuttable: boolean }
export interface LogEntry { seq: number; source: string; description: string; effects: Effects }

export const DESK = { w: 1920, h: 460 }
export const TRASH = { x: 20, y: 260, w: 180, h: 180 } // desk coordinates
export const MINIMAP = { x: 1640, y: 180, w: 260, h: 260 } // desk coordinates
const FADE_MS = 400
const SYNC_VARS = ['aff_self', 'aff_k1', 'aff_k2', 'aff_k3']

interface GameState {
  phase: Phase
  meters: Record<string, number>
  lastDelta: Record<string, number>
  todayGuests: string[]
  currentGuestIndex: number
  revealed: Record<string, { name: boolean; faction: boolean }>
  chatLog: ChatLine[]
  choices: string[]
  storyEnded: boolean
  inkTags: string[]
  deskItems: DeskItem[]
  readerOpen: string | null
  seats: (string | null)[]
  nightAssignments: Record<string, NightOutcome | null>
  inkVars: Record<string, Record<string, unknown>>
  eventLog: LogEntry[]
  debugOpen: boolean
  fading: boolean
}

// The live inkjs story for the current guest stays outside the store; only its outputs go in.
let story: Story | null = null
let seq = 0

const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function freshDay(): Partial<GameState> {
  story = null
  const todayGuests = shuffle(guests.map((g) => g.id)).slice(0, 3)
  const meters: Record<string, number> = {}
  kingdoms.forEach((k) => (meters[k.id] = k.startAffinity))
  todayGuests.forEach((id) => (meters[id] = guestById(id).startAffinity))
  return {
    phase: 'desk',
    meters,
    lastDelta: {},
    todayGuests,
    currentGuestIndex: 0,
    revealed: Object.fromEntries(todayGuests.map((id) => [id, { name: false, faction: false }])),
    chatLog: [],
    choices: [],
    storyEnded: false,
    inkTags: [],
    deskItems: scrolls.map((s, i) => ({ id: s.id, kind: 'scroll', scrollId: s.id, x: 260 + i * 260, y: 60 + (i % 2) * 40, z: i + 1 })),
    readerOpen: null,
    seats: Array(8).fill(null),
    nightAssignments: Object.fromEntries(todayGuests.map((id) => [id, null])),
    inkVars: {},
    eventLog: [],
  }
}

export const useGame = create<GameState>(() => ({
  ...(freshDay() as GameState),
  phase: 'title',
  debugOpen: false,
  fading: false,
}))

const get = useGame.getState
const set = useGame.setState
export const currentGuestId = () => get().todayGuests[get().currentGuestIndex]

/** Fade to black, run the change, fade back in. */
function fadeTo(change: () => void) {
  set({ fading: true })
  setTimeout(() => {
    change()
    set({ fading: false })
  }, FADE_MS)
}

/** The single entry point for every meter change: clamps, records the delta, logs the event. */
export function applyEffects(effects: Effects, source: string) {
  const meters = { ...get().meters }
  const lastDelta = { ...get().lastDelta }
  const applied: Effects = {}
  for (const [id, d] of Object.entries(effects)) {
    if (!(id in meters) || !d) continue // unknown or absent guest → ignored
    const next = Math.max(-10, Math.min(10, meters[id] + d))
    const delta = next - meters[id]
    if (!delta) continue // already at clamp
    applied[id] = delta
    meters[id] = next
    lastDelta[id] = delta
  }
  if (!Object.keys(applied).length) { syncInkVars(); return }
  const description = Object.entries(applied).map(([id, d]) => `${id} ${d > 0 ? '+' : ''}${d}`).join(', ')
  set({ meters, lastDelta, eventLog: [...get().eventLog, { seq: ++seq, source, description, effects: applied }] })
  syncInkVars()
}

function syncInkVars() {
  if (!story) return
  const id = currentGuestId()
  const values: Record<string, number> = { aff_self: get().meters[id], aff_k1: get().meters.k1, aff_k2: get().meters.k2, aff_k3: get().meters.k3 }
  for (const name of SYNC_VARS) {
    if (story.variablesState.GlobalVariableExistsWithName(name)) story.variablesState.$(name, values[name])
  }
}

/** Current values of every global VAR in the live story (empty when no story is running). */
export function liveInkVars(): Record<string, unknown> {
  if (!story) return {}
  // inkjs has no public "list globals"; _globalVariables is its internal Map of declared VARs.
  const names = [...(story.variablesState as unknown as { _globalVariables: Map<string, unknown> })._globalVariables.keys()]
  return Object.fromEntries(names.map((n) => [n, story!.variablesState.$(n)]))
}

/** Standard inkjs loop: Continue() while possible, applying tags per line, then expose choices. */
function continueStory(action?: string) {
  if (!story) return
  const id = currentGuestId()
  while (story.canContinue) {
    const text = story.Continue()!.trim()
    const tags = story.currentTags ?? []
    const line: ChatLine = { speaker: 'guest', text, cuttable: false }
    const effects: Effects = {}
    for (const tag of tags) {
      const [kind, a, b] = tag.trim().split(':')
      if (kind === 'cut') line.cuttable = true
      else if (kind === 'bartender') line.speaker = 'bartender'
      else if (kind === 'reveal' && (a === 'name' || a === 'faction'))
        set({ revealed: { ...get().revealed, [id]: { ...get().revealed[id], [a]: true } } })
      else if (kind === 'aff') effects[a === 'self' ? id : a] = (effects[a === 'self' ? id : a] ?? 0) + Number(b)
      else console.warn(`Unknown ink tag "${tag}" in ${id}`)
    }
    if (line.speaker === 'bartender') line.cuttable = false
    set({ inkTags: tags })
    if (text) set({ chatLog: [...get().chatLog, line] })
    if (Object.keys(effects).length) applyEffects(effects, action ?? `ink:${id}`)
  }
  const choices = story.currentChoices.map((c) => c.text)
  if (!choices.length) set({ inkVars: { ...get().inkVars, [id]: liveInkVars() } })
  set({ choices, storyEnded: !choices.length })
}

function startGuest() {
  const g = guestById(currentGuestId())
  story = new Story(inkJson(g.ink))
  set({ chatLog: [{ speaker: 'bartender', text: t('greeting'), cuttable: false }], choices: [], storyEnded: false, inkTags: [] })
  syncInkVars()
  continueStory()
}

function pairingEffects(newId: string, otherId: string): Effects {
  const specific = pairings.pairs.find((p) => p.guests.includes(newId) && p.guests.includes(otherId))
  const [aId, bId] = specific ? specific.guests : [newId, otherId]
  let rule = specific?.effects
  if (!rule) {
    const fa = guestById(aId).faction
    const fb = guestById(bId).faction
    rule = pairings.factionFallback[fa === fb ? 'same' : [fa, fb].sort().join('-')] ?? {}
  }
  const out: Effects = {}
  for (const [k, d] of Object.entries(rule)) {
    const target = k === 'a' ? aId : k === 'b' ? bId : k
    out[target] = (out[target] ?? 0) + d
  }
  return out
}

export const actions = {
  start: () => fadeTo(() => set(freshDay())),
  playAgain: () => fadeTo(() => set(freshDay())),
  openPub: () => fadeTo(() => {
    set({ phase: 'conversation', currentGuestIndex: 0 })
    startGuest()
  }),
  choose(i: number) {
    if (!story) return
    const text = get().choices[i]
    set({ chatLog: [...get().chatLog, { speaker: 'bartender', text, cuttable: false }], choices: [] })
    story.ChooseChoiceIndex(i)
    continueStory(`choice:${currentGuestId()}:${text}`)
  },
  closeConversation: () => set({ phase: 'seating', readerOpen: null }),
  seat(seatIndex: number) {
    const s = get()
    const id = currentGuestId()
    if (s.seats[seatIndex]) return
    const table = Math.floor(seatIndex / 4)
    const mates = s.seats.slice(table * 4, table * 4 + 4).filter((x): x is string => !!x)
    const seats = [...s.seats]
    seats[seatIndex] = id
    set({ seats })
    for (const other of mates) applyEffects(pairingEffects(id, other), `seating:${id}+${other}`)
    story = null
    if (s.currentGuestIndex < s.todayGuests.length - 1) {
      set({ phase: 'conversation', currentGuestIndex: s.currentGuestIndex + 1 })
      startGuest()
    } else {
      fadeTo(() => set({ phase: 'night', chatLog: [], choices: [], storyEnded: false }))
    }
  },
  setNight: (id: string, outcome: NightOutcome | null) =>
    set({ nightAssignments: { ...get().nightAssignments, [id]: outcome } }),
  finishNight() {
    for (const [id, o] of Object.entries(get().nightAssignments)) {
      const rule = night[id]?.[o === 'kick' ? 'kick' : 'bed'] ?? {}
      const effects: Effects = {}
      for (const [k, d] of Object.entries(rule)) effects[k === 'self' ? id : k] = d
      applyEffects(effects, `night:${id}:${o}`)
    }
    fadeTo(() => set({ phase: 'summary' }))
  },

  // Desk
  raise(id: string) {
    const items = get().deskItems
    const z = Math.max(0, ...items.map((i) => i.z)) + 1
    set({ deskItems: items.map((i) => (i.id === id ? { ...i, z } : i)) })
  },
  moveItem: (id: string, x: number, y: number) =>
    set({ deskItems: get().deskItems.map((i) => (i.id === id ? { ...i, x, y } : i)) }),
  removeItem: (id: string) =>
    set({ deskItems: get().deskItems.filter((i) => i.id !== id), readerOpen: get().readerOpen === id ? null : get().readerOpen }),
  addCutout(text: string, source: CutoutItem['source']) {
    const items = get().deskItems
    const z = Math.max(0, ...items.map((i) => i.z)) + 1
    const item: CutoutItem = {
      id: crypto.randomUUID(), kind: 'cutout', text, source, z,
      x: 500 + Math.random() * 700,
      y: 40 + Math.random() * 240,
    }
    set({ deskItems: [...items, item] })
  },
  openReader: (scrollId: string | null) => set({ readerOpen: scrollId }),
  toggleDebug: () => set({ debugOpen: !get().debugOpen }),
}

/** Display helpers: "???" until revealed. */
export function guestName(id: string, s: GameState = get()) {
  return s.revealed[id]?.name ? guestById(id).name : t('unknown')
}
export function guestFaction(id: string, s: GameState = get()) {
  return s.revealed[id]?.faction ? kingdomById(guestById(id).faction).name : t('unknown')
}
