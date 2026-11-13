import { create } from 'zustand'
import { Story } from 'inkjs'
import {
  STRESS_THRESHOLD, chronicle, days, guestById, guests, inkJson, kingdomById, kingdoms, night, pairings, scrollById, summaryBlocks, t,
  type Effects, type KingdomId, type PairingRules, type Visit,
} from '../content'
import { evaluate, type Ctx, type DayRecord, type NightOutcome } from '../engine/summary'
import { parseChoices, pickSlot, type InkChoice } from '../engine/slots'
import { selectLounge, selectQueue } from '../engine/days'

export type Phase = 'title' | 'desk' | 'conversation' | 'seating' | 'dayEnd' | 'night' | 'summary'
export type View = 'cork' | 'main' | 'lounge'
/** Menu-type overlays: in-game menu, save list, settings, title chronicle, character log. */
export type Overlay = 'menu' | 'load' | 'settings' | 'chronicle' | 'log'
export type SaveSlot = 'auto' | 'manual'
export type { NightOutcome }
export type CorkColor = 'red' | 'twine' | 'blue'
export type ItemSurface = 'desk' | 'cork'

interface DeskItemBase { id: string; x: number; y: number; z: number; surface: ItemSurface }
export interface ScrollItem extends DeskItemBase { kind: 'scroll'; scrollId: string }
export type CutoutSource = { type: 'scroll'; kingdom: KingdomId } | { type: 'conversation'; guestId: string }
/** Slot topic/claim a cutout carries over from its source. */
export interface CutoutMeta { topic?: string; claim?: string }
export interface CutoutItem extends DeskItemBase, CutoutMeta { kind: 'cutout'; text: string; source: CutoutSource }
/** Something a guest handed over (items.json); desk only. */
export interface ThingItem extends DeskItemBase { kind: 'item'; itemId: string }
export type DeskItem = ScrollItem | CutoutItem | ThingItem
/** Snapshot of the cutout used in a slot, for the tag on the bartender bubble. */
export interface UsedCutout extends CutoutMeta { text: string; source: CutoutSource }
export interface ChatLine {
  speaker: 'guest' | 'bartender'
  text: string
  cuttable: boolean
  meta?: CutoutMeta
  usedCutout?: UsedCutout
}
/** One finished visit, for the character log. */
export interface Transcript { day: number; lines: ChatLine[] }
export interface LogEntry { seq: number; source: string; description: string; effects: Effects }
export interface CorkString { id: string; a: string; b: string; color: CorkColor }
export interface ActiveVisit extends Visit { fromLounge: boolean }
export interface PausedConversation { visit: ActiveVisit; inkState: string; chatLog: ChatLine[] }
export interface UsedClaim { topic: string; claim: string; cutoutId: string; day: number; guestId: string }
/** Floating clone while dragging across desk ↔ corkboard / chat. */
export interface DragGhost {
  id: string
  stageX: number
  stageY: number
  width: number
  height: number
}

export const TOP_H = 810
export const CORK = { w: 960, h: 810 }
export const DESK = { w: 1920, h: 270 }
export const TRASH = { x: 20, y: 100, w: 140, h: 140 }
export const MINIMAP = { x: 1680, y: 30, w: 220, h: 220 }
export const LAST_DAY = days.length
const FADE_MS = 400
const BEDS: NightOutcome[] = ['r1a', 'r1b', 'r2a', 'r2b']
const SAVE_VERSION = 1
const saveKey = (slot: SaveSlot) => `crows.save.${slot}`
const CHRONICLE_KEY = 'crows.chronicle'
/** UI-only state that is never saved. */
const TRANSIENT = ['fading', 'debugOpen', 'dragGhost', 'slotRejected', 'slotPicker', 'readerOpen', 'noteOpen', 'corkPinFrom', 'overlay'] as const

/** localStorage that never throws (private mode, blocked storage). */
function readStore<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null } catch { return null }
}
function writeStore(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

interface GameState {
  phase: Phase
  day: number
  view: View
  tableCount: number
  /** Guests expected today (queue + lounge); the candle burns down by 1/dayTotal per seated guest. */
  dayTotal: number
  /** Hidden from the player; only the debug panel shows them. */
  meters: Record<string, number>
  /** Guests still waiting in today's queue. */
  queue: Visit[]
  /** Guest at the bar. */
  current: ActiveVisit | null
  paused: PausedConversation | null
  loungeGuests: Visit[]
  /** Today's guests in arrival order (queue + invited). */
  todayGuests: string[]
  invitedFromLounge: string[]
  /** Finished days, keyed by day number. */
  history: Record<number, DayRecord>
  usedClaims: UsedClaim[]
  /** Saved Ink state per guest between visits. */
  inkStates: Record<string, string>
  inkVars: Record<string, Record<string, unknown>>
  revealed: Record<string, { name: boolean; faction: boolean }>
  /** Finished visits per guest (character log). */
  transcripts: Record<string, Transcript[]>
  /** Portrait variant from a `#portrait:<variant>` tag in the lines since the last reply (lie tells), else null. */
  portraitVariant: string | null
  chatLog: ChatLine[]
  choices: InkChoice[]
  storyEnded: boolean
  inkTags: string[]
  slotRejected: string | null
  /** Topic whose cutout picker modal is open. */
  slotPicker: string | null
  deskItems: DeskItem[]
  /** `${scrollId}#${articleIndex}` of articles whose `when` was false that morning. */
  hiddenArticles: string[]
  corkStrings: CorkString[]
  corkStringColor: CorkColor
  corkPinFrom: string | null
  dragGhost: DragGhost | null
  readerOpen: string | null
  noteOpen: string | null
  seats: (string | null)[]
  nightAssignments: Record<string, NightOutcome | null>
  eventLog: LogEntry[]
  overlay: Overlay | null
  debugOpen: boolean
  fading: boolean
}

// The live inkjs story for the guest at the bar stays outside the store; only its outputs go in.
let story: Story | null = null
let seq = 0

function newGame(): Partial<GameState> {
  story = null
  const meters: Record<string, number> = { stress: 0 }
  kingdoms.forEach((k) => (meters[k.id] = k.startAffinity))
  return {
    day: 0,
    meters,
    history: {},
    usedClaims: [],
    inkStates: {},
    inkVars: {},
    revealed: Object.fromEntries(guests.map((g) => [g.id, { name: false, faction: false }])),
    transcripts: {},
    portraitVariant: null,
    deskItems: [],
    hiddenArticles: [],
    corkStrings: [],
    corkStringColor: 'red',
    corkPinFrom: null,
    dragGhost: null,
    eventLog: [],
  }
}

export const useGame = create<GameState>(() => ({
  ...(newGame() as GameState),
  phase: 'title',
  view: 'main',
  tableCount: 1,
  dayTotal: 0,
  queue: [],
  current: null,
  paused: null,
  loungeGuests: [],
  todayGuests: [],
  invitedFromLounge: [],
  chatLog: [],
  choices: [],
  storyEnded: false,
  inkTags: [],
  slotRejected: null,
  slotPicker: null,
  readerOpen: null,
  noteOpen: null,
  seats: Array(8).fill(null),
  nightAssignments: {},
  overlay: null,
  debugOpen: false,
  fading: false,
}))

const get = useGame.getState
const set = useGame.setState
export const currentGuestId = () => get().current?.guest ?? ''

/** Fade to black, run the change, fade back in. */
function fadeTo(change: () => void) {
  set({ fading: true })
  setTimeout(() => {
    change()
    set({ fading: false })
  }, FADE_MS)
}

function logEvent(source: string, description: string, effects: Effects = {}) {
  set({ eventLog: [...get().eventLog, { seq: ++seq, source, description, effects }] })
}

/** The single entry point for every meter change: clamps and logs the event. */
export function applyEffects(effects: Effects, source: string): Effects {
  const meters = { ...get().meters }
  const applied: Effects = {}
  for (const [id, d] of Object.entries(effects)) {
    if (!(id in meters) || !d) continue // unknown or not-yet-met guest → ignored
    const next = Math.max(-10, Math.min(10, meters[id] + d))
    const delta = next - meters[id]
    if (!delta) continue // already at clamp
    applied[id] = delta
    meters[id] = next
  }
  if (!Object.keys(applied).length) { syncInkVars(); return applied }
  set({ meters })
  logEvent(source, Object.entries(applied).map(([id, d]) => `${id} ${d > 0 ? '+' : ''}${d}`).join(', '), applied)
  syncInkVars()
  return applied
}

function syncInkVars() {
  if (!story) return
  const m = get().meters
  const values: Record<string, number> = { stress: m.stress, stress_threshold: STRESS_THRESHOLD, aff_self: m[currentGuestId()] ?? 0, day: get().day }
  for (const [id, v] of Object.entries(m)) if (id !== 'stress') values[`aff_${id}`] = v
  for (const [name, v] of Object.entries(values)) {
    if (story.variablesState.GlobalVariableExistsWithName(name)) story.variablesState.$(name, v)
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
  // A `#portrait:<variant>` tell anywhere in this stretch of lines stays on until the player's next reply.
  let variant: string | null = null
  while (story.canContinue) {
    const text = story.Continue()!.trim()
    const tags = story.currentTags ?? []
    const line: ChatLine = { speaker: 'guest', text, cuttable: false }
    const meta: CutoutMeta = {}
    const effects: Effects = {}
    for (const tag of tags) {
      const [kind, a, b] = tag.trim().split(':')
      if (kind === 'cut') { line.cuttable = true; if (a) Object.assign(meta, { topic: a, claim: b }) }
      else if (kind === 'bartender') line.speaker = 'bartender'
      else if (kind === 'item') addThing(a)
      else if (kind === 'portrait') variant = a
      else if (kind === 'reveal' && (a === 'name' || a === 'faction')) {
        set({ revealed: { ...get().revealed, [id]: { ...get().revealed[id], [a]: true } } })
        if (a === 'name') noteMet(id, true)
      }
      else if (kind === 'aff') effects[a === 'self' ? id : a] = (effects[a === 'self' ? id : a] ?? 0) + Number(b)
      else if (kind === 'stress') effects.stress = (effects.stress ?? 0) + Number(a)
      else console.warn(`Unknown ink tag "${tag}" in ${id}`)
    }
    if (line.speaker === 'bartender') line.cuttable = false
    if (Object.keys(meta).length) line.meta = meta
    set({ inkTags: tags })
    if (text) set({ chatLog: [...get().chatLog, line] })
    if (Object.keys(effects).length) applyEffects(effects, action ?? `ink:${id}`)
  }
  set({ portraitVariant: variant })
  const choices = parseChoices(story.currentChoices)
  if (!choices.length) {
    // Visit over: keep the story state for the guest's next visit and snapshot VARs for conditions.
    set({ inkVars: { ...get().inkVars, [id]: liveInkVars() }, inkStates: { ...get().inkStates, [id]: story.state.toJson() } })
  }
  set({ choices, storyEnded: !choices.length })
}

const todayRecord = (s: GameState = get()): DayRecord => ({
  present: s.todayGuests, seats: s.seats, night: s.nightAssignments, invited: s.invitedFromLounge,
})

/** Condition context; `day` picks the default day for guest conditions (morning data uses yesterday). */
export function conditionCtx(day = get().day): Ctx {
  const s = get()
  return {
    day,
    days: s.history[s.day] ? s.history : { ...s.history, [s.day]: todayRecord(s) },
    meters: s.meters,
    inkVars: s.inkVars,
    usedClaims: s.usedClaims,
  }
}

function morning(day: number) {
  story = null
  const def = days[day - 1]
  const ctx = conditionCtx(day - 1)
  const s = get()
  let z = Math.max(0, ...s.deskItems.map((i) => i.z))
  const newScrolls: ScrollItem[] = def.scrolls.map((id, i) => ({
    id, kind: 'scroll', scrollId: id, surface: 'desk', x: 260 + i * 260, y: 40 + (i % 2) * 30, z: ++z,
  }))
  const hidden = def.scrolls.flatMap((id) =>
    scrollById(id).articles.flatMap((a, ai) => (a.when && !evaluate(a.when, ctx) ? [`${id}#${ai}`] : [])),
  )
  const queue = selectQueue(def, ctx)
  const loungeGuests = selectLounge(def, ctx)
  set({
    day,
    phase: 'desk',
    view: 'main',
    tableCount: def.tables,
    dayTotal: queue.length + loungeGuests.length,
    queue,
    loungeGuests,
    current: null,
    paused: null,
    portraitVariant: null,
    todayGuests: [],
    invitedFromLounge: [],
    seats: Array(8).fill(null),
    nightAssignments: {},
    chatLog: [],
    choices: [],
    storyEnded: false,
    inkTags: [],
    slotRejected: null,
    slotPicker: null,
    readerOpen: null,
    noteOpen: null,
    deskItems: [...s.deskItems, ...newScrolls],
    hiddenArticles: [...s.hiddenArticles, ...hidden],
  })
  if (s.meters.stress) applyEffects({ stress: -s.meters.stress }, 'morning reset')
  logEvent(`day ${day}`, `morning: queue ${queue.map((v) => v.guest).join(', ') || '–'}; lounge ${loungeGuests.map((v) => v.guest).join(', ') || '–'}`)
  saveGame('auto')
}

/** A guest steps up to the bar: load their persistent story and jump to today's knot. */
function arrive(v: Visit, fromLounge: boolean) {
  const s = get()
  const g = guestById(v.guest)
  story = new Story(inkJson(g.ink))
  if (s.inkStates[v.guest]) story.state.LoadJson(s.inkStates[v.guest])
  story.ChoosePathString(v.knot)
  noteMet(v.guest, s.revealed[v.guest]?.name ?? false)
  // The guest greets first: the knot's opening lines are the greeting.
  set({
    phase: 'conversation',
    current: { ...v, fromLounge },
    meters: v.guest in s.meters ? s.meters : { ...s.meters, [v.guest]: g.startAffinity },
    todayGuests: s.todayGuests.includes(v.guest) ? s.todayGuests : [...s.todayGuests, v.guest],
    portraitVariant: null,
    chatLog: [],
    choices: [],
    storyEnded: false,
    inkTags: [],
  })
  syncInkVars()
  continueStory()
}

/** After a seating: the paused guest returns, else the next in the queue, else lounge guests come on their own, else the day can end. */
function next() {
  const s = get()
  if (s.paused) {
    const p = s.paused
    story = new Story(inkJson(guestById(p.visit.guest).ink))
    story.state.LoadJson(p.inkState)
    const choices = parseChoices(story.currentChoices)
    set({ phase: 'conversation', paused: null, current: p.visit, chatLog: p.chatLog, choices, storyEnded: !choices.length, inkTags: [], portraitVariant: null })
    syncInkVars()
    logEvent('lounge', `${p.visit.guest} returns to the bar`)
    return
  }
  if (s.queue.length) {
    set({ queue: s.queue.slice(1) })
    arrive(s.queue[0], false)
    return
  }
  if (s.loungeGuests.length) {
    const [v, ...rest] = s.loungeGuests
    set({ loungeGuests: rest })
    logEvent('lounge', `${v.guest} comes to the bar on their own`)
    arrive(v, true)
    return
  }
  story = null
  set({ phase: 'dayEnd', current: null, chatLog: [], choices: [], storyEnded: false, inkTags: [] })
}

function closeDay() {
  set({
    phase: 'night', view: 'main', readerOpen: null, noteOpen: null,
    nightAssignments: Object.fromEntries(get().todayGuests.map((id) => [id, null])),
  })
}

function endNight() {
  const s = get()
  for (const [id, o] of Object.entries(s.nightAssignments)) {
    const rules = night[id]
    const rule = (rules?.[`day${s.day}`] ?? rules)?.[o === 'kick' ? 'kick' : 'bed'] ?? {}
    const effects: Effects = {}
    for (const [k, d] of Object.entries(rule)) effects[k === 'self' ? id : k] = d
    applyEffects(effects, `night:${id}:${o}`)
  }
  // Roommates (same room, e.g. r1a + r1b) affect each other and their kingdoms.
  const beds = Object.entries(s.nightAssignments).filter(([, o]) => o && o !== 'kick') as [string, NightOutcome][]
  beds.forEach(([a, ra], i) => beds.slice(i + 1).forEach(([b, rb]) => {
    if (ra.slice(0, 2) === rb.slice(0, 2)) applyEffects(pairingEffects(pairings.room, a, b), `room:${a}+${b}`)
  }))
  set({ history: { ...get().history, [s.day]: todayRecord() } })
  recordChronicle()
}

/** Pairing rule for two guests at one table / in one room: a specific pair, else the faction fallback. */
function pairingEffects(rules: PairingRules, newId: string, otherId: string): Effects {
  const specific = rules.pairs.find((p) => p.guests.includes(newId) && p.guests.includes(otherId))
  const [aId, bId] = specific ? specific.guests : [newId, otherId]
  let rule = specific?.effects
  if (!rule) {
    const fa = guestById(aId).faction
    const fb = guestById(bId).faction
    rule = rules.factionFallback[fa === fb ? 'same' : [fa, fb].sort().join('-')] ?? {}
  }
  const out: Effects = {}
  for (const [k, d] of Object.entries(rule)) {
    const target = k === 'a' ? aId : k === 'b' ? bId : k
    out[target] = (out[target] ?? 0) + d
  }
  return out
}

/** Inviting from the lounge needs a conversation at the bar (not seating) and no conversation already paused. */
export const canInvite = (s: GameState = get()) => s.phase === 'conversation' && !s.paused

// --- Chronicle (across playthroughs) --------------------------------------------------
export interface ChronicleProgress { met: Record<string, boolean>; achievements: string[]; endings: string[] }
export const readChronicle = (): ChronicleProgress =>
  ({ met: {}, achievements: [], endings: [], ...readStore<ChronicleProgress>(CHRONICLE_KEY) })

/** Remember a met guest; `named` once the player learned the name. */
function noteMet(id: string, named: boolean) {
  const c = readChronicle()
  if (id in c.met && (c.met[id] || !named)) return
  writeStore(CHRONICLE_KEY, { ...c, met: { ...c.met, [id]: named } })
}

/** After each night: unlock achievements; after the last night also the ending reached. */
function recordChronicle() {
  const c = readChronicle()
  const ctx = conditionCtx()
  const add = (have: string[], ids: string[]) => [...new Set([...have, ...ids])]
  const achievements = add(c.achievements, chronicle.achievements.filter((a) => evaluate(a.when, ctx)).map((a) => a.id))
  const endings = get().day < LAST_DAY ? c.endings : add(c.endings, chronicle.endings.filter((e) => {
    const block = summaryBlocks.find((b) => b.id === e.block)
    return !!block && (!block.when || evaluate(block.when, ctx))
  }).map((e) => e.id))
  writeStore(CHRONICLE_KEY, { ...c, achievements, endings })
}

// --- Saves ------------------------------------------------------------------------------
interface SaveData { v: number; savedAt: number; state: Partial<GameState>; liveInk: string | null }
export const saveInfo = (slot: SaveSlot) => {
  const d = readStore<SaveData>(saveKey(slot))
  return d?.v === SAVE_VERSION ? { day: d.state.day ?? 1, savedAt: d.savedAt } : null
}

function saveGame(slot: SaveSlot) {
  const state: Record<string, unknown> = { ...get() }
  for (const k of TRANSIENT) delete state[k]
  writeStore(saveKey(slot), { v: SAVE_VERSION, savedAt: Date.now(), state, liveInk: story?.state.toJson() ?? null })
}

function loadGame(slot: SaveSlot) {
  const d = readStore<SaveData>(saveKey(slot))
  if (d?.v !== SAVE_VERSION) return
  story = null
  set({ ...d.state, overlay: null, readerOpen: null, noteOpen: null, slotPicker: null, corkPinFrom: null, dragGhost: null, slotRejected: null })
  const cur = get().current
  if (cur && d.liveInk) {
    story = new Story(inkJson(guestById(cur.guest).ink))
    story.state.LoadJson(d.liveInk)
  }
}

/** Dev only: play earlier days automatically (first non-slot choice, first free seat, beds in arrival order). */
function autoplayDay() {
  next()
  for (let guard = 0; guard < 1000 && get().phase !== 'dayEnd'; guard++) {
    const s = get()
    if (s.phase === 'seating') { actions.seat(s.seats.findIndex((x, i) => !x && i < s.tableCount * 4)); continue }
    const c = s.choices.find((ch) => !ch.slot)
    if (c) actions.choose(c.index)
    else if (s.storyEnded) actions.closeConversation()
    else break
  }
  closeDay()
  set({ nightAssignments: Object.fromEntries(get().todayGuests.map((id, i) => [id, BEDS[i] ?? 'kick'])) })
  endNight()
}

function addThing(itemId: string) {
  const items = get().deskItems
  const z = Math.max(0, ...items.map((i) => i.z)) + 1
  const thing: ThingItem = { id: crypto.randomUUID(), kind: 'item', itemId, z, surface: 'desk', x: 500 + Math.random() * 900, y: 40 + Math.random() * 100 }
  set({ deskItems: [...items, thing] })
}

export const actions = {
  start: () => fadeTo(() => { set({ ...newGame(), overlay: null }); morning(1) }),
  playAgain: () => fadeTo(() => { set(newGame()); morning(1) }),
  nextDay: () => fadeTo(() => morning(get().day + 1)),
  // Opening/closing the pub always returns to the main view (the door button is also visible from the corkboard).
  openPub: () => { set({ view: 'main', corkPinFrom: null }); fadeTo(next) },
  closePub: () => { set({ view: 'main', corkPinFrom: null }); fadeTo(closeDay) },
  choose(index: number, usedCutout?: UsedCutout) {
    const c = get().choices.find((ch) => ch.index === index)
    if (!story || !c) return
    set({ chatLog: [...get().chatLog, { speaker: 'bartender', text: c.text, cuttable: false, usedCutout }], choices: [], slotPicker: null })
    story.ChooseChoiceIndex(index)
    continueStory(`choice:${currentGuestId()}:${c.text}`)
  },
  /** A cutout dropped on the slot bubble for `topic`. Returns false when rejected. */
  dropOnSlot(topic: string, cutoutId: string): boolean {
    const s = get()
    const item = s.deskItems.find((i) => i.id === cutoutId)
    const pick = item?.kind === 'cutout' && s.phase === 'conversation' ? pickSlot(s.choices, topic, item) : null
    if (!pick || item?.kind !== 'cutout') {
      set({ slotRejected: topic, slotPicker: null })
      setTimeout(() => get().slotRejected === topic && set({ slotRejected: null }), 700)
      return false
    }
    const guestId = currentGuestId()
    set({ usedClaims: [...s.usedClaims, { topic, claim: item.claim!, cutoutId, day: s.day, guestId }] })
    const from = item.source.type === 'scroll' ? `scroll ${item.source.kingdom}` : `conversation ${item.source.guestId}`
    logEvent(`slot:${guestId}`, `${topic} ← ${item.claim} (${from}) → choice "${pick.text}"`)
    actions.choose(pick.index, { text: item.text, source: item.source, topic: item.topic, claim: item.claim })
    return true
  },
  closeConversation: () => set({ phase: 'seating', readerOpen: null, noteOpen: null, view: 'main' }),
  /** Seat picker closed without seating: back to the finished conversation. */
  closeSeating: () => set({ phase: 'conversation' }),
  seat(seatIndex: number) {
    const s = get()
    const id = currentGuestId()
    if (s.seats[seatIndex] || seatIndex < 0 || Math.floor(seatIndex / 4) >= s.tableCount) return
    const table = Math.floor(seatIndex / 4)
    const mates = s.seats.slice(table * 4, table * 4 + 4).filter((x): x is string => !!x)
    const seats = [...s.seats]
    seats[seatIndex] = id
    const transcripts = { ...s.transcripts, [id]: [...(s.transcripts[id] ?? []), { day: s.day, lines: s.chatLog }] }
    set({ seats, transcripts })
    for (const other of mates) applyEffects(pairingEffects(pairings.table, id, other), `seating:${id}+${other}`)
    story = null
    set({ current: null, portraitVariant: null })
    next()
    saveGame('auto')
  },
  invite(guestId: string) {
    const s = get()
    const v = s.loungeGuests.find((x) => x.guest === guestId)
    if (!v || !canInvite(s)) return
    const paused = s.current && story ? { visit: s.current, inkState: story.state.toJson(), chatLog: s.chatLog } : null
    set({
      paused, view: 'main', readerOpen: null, noteOpen: null,
      loungeGuests: s.loungeGuests.filter((x) => x !== v),
      invitedFromLounge: [...s.invitedFromLounge, guestId],
    })
    logEvent('lounge', `invited ${guestId}${paused ? `, paused ${paused.visit.guest}` : ''}`)
    arrive(v, true)
  },
  setNight: (id: string, outcome: NightOutcome | null) =>
    set({ nightAssignments: { ...get().nightAssignments, [id]: outcome } }),
  finishNight() {
    endNight()
    fadeTo(() => set({ phase: 'summary' }))
  },
  /** Dev only: restart and auto-play up to the morning of `day`. */
  debugJump(day: number) {
    if (day < 1 || day > LAST_DAY) return
    set(newGame())
    morning(1)
    while (get().day < day) { autoplayDay(); morning(get().day + 1) }
  },

  // Desk / corkboard
  raise(id: string) {
    const items = get().deskItems
    const z = Math.max(0, ...items.map((i) => i.z)) + 1
    set({ deskItems: items.map((i) => (i.id === id ? { ...i, z } : i)) })
  },
  moveItem: (id: string, x: number, y: number) =>
    set({ deskItems: get().deskItems.map((i) => (i.id === id ? { ...i, x, y } : i)) }),
  setItemSurface(id: string, surface: ItemSurface, x: number, y: number) {
    const strings = get().corkStrings.filter((s) => s.a !== id && s.b !== id)
    set({
      deskItems: get().deskItems.map((i) => (i.id === id ? { ...i, surface, x, y } : i)),
      corkStrings: strings,
      corkPinFrom: get().corkPinFrom === id ? null : get().corkPinFrom,
    })
  },
  removeItem: (id: string) =>
    set({
      deskItems: get().deskItems.filter((i) => i.id !== id),
      corkStrings: get().corkStrings.filter((s) => s.a !== id && s.b !== id),
      readerOpen: get().readerOpen === id ? null : get().readerOpen,
      noteOpen: get().noteOpen === id ? null : get().noteOpen,
      corkPinFrom: get().corkPinFrom === id ? null : get().corkPinFrom,
    }),
  // Menu, saves, overlays
  openOverlay: (overlay: Overlay | null) => set({ overlay }),
  save: () => saveGame('manual'),
  load: (slot: SaveSlot) => fadeTo(() => loadGame(slot)),

  addCutout(text: string, source: CutoutSource, meta: CutoutMeta = {}) {
    const items = get().deskItems
    const z = Math.max(0, ...items.map((i) => i.z)) + 1
    const item: CutoutItem = {
      id: crypto.randomUUID(), kind: 'cutout', text, source, z, surface: 'desk', ...meta,
      x: 500 + Math.random() * 700,
      y: 20 + Math.random() * 120,
    }
    set({ deskItems: [...items, item] })
  },
  openReader: (scrollId: string | null) => set({ readerOpen: scrollId }),
  openSlotPicker: (topic: string | null) => set({ slotPicker: topic }),
  openNote: (id: string | null) => set({ noteOpen: id }),
  setView: (view: View) => set({ view, corkPinFrom: null }),
  setCorkStringColor: (corkStringColor: CorkColor) => set({ corkStringColor, corkPinFrom: null }),
  clearCorkPin: () => set({ corkPinFrom: null }),
  setDragGhost: (dragGhost: DragGhost | null) => set({ dragGhost }),
  clickCorkPin(id: string) {
    const from = get().corkPinFrom
    if (!from) { set({ corkPinFrom: id }); return }
    if (from === id) { set({ corkPinFrom: null }); return }
    const color = get().corkStringColor
    const samePair = (s: CorkString) =>
      (s.a === from && s.b === id) || (s.a === id && s.b === from)
    // Same colour on the same pair toggles off; different colours can coexist.
    const existing = get().corkStrings.find((s) => samePair(s) && s.color === color)
    if (existing) {
      set({ corkStrings: get().corkStrings.filter((s) => s.id !== existing.id), corkPinFrom: null })
      return
    }
    set({
      corkStrings: [...get().corkStrings, { id: crypto.randomUUID(), a: from, b: id, color }],
      corkPinFrom: null,
    })
  },
  removeCorkString: (id: string) => set({ corkStrings: get().corkStrings.filter((s) => s.id !== id) }),
  toggleDebug: () => set({ debugOpen: !get().debugOpen }),
}

/** Display helpers: "???" until revealed. */
export function guestName(id: string, s: GameState = get()) {
  return s.revealed[id]?.name ? guestById(id).name : t('unknown')
}
export function guestFaction(id: string, s: GameState = get()) {
  return s.revealed[id]?.faction ? kingdomById(guestById(id).faction).name : t('unknown')
}
