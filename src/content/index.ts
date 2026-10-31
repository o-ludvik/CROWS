// Typed access to everything in src/content. Components never hardcode content; they read it from here.
import kingdomsJson from './kingdoms.json'
import guestsJson from './guests.json'
import scrollsJson from './scrolls.json'
import questsJson from './quests.json'
import topicsJson from './topics.json'
import daysJson from './days.json'
import pairingsJson from './pairings.json'
import nightJson from './night.json'
import summaryJson from './summary.json'
import stringsJson from './strings.cs.json'
import type { Condition, SummaryBlockData } from '../engine/summary'
import { validateContent } from '../engine/days'

export type KingdomId = 'k1' | 'k2' | 'k3'
/** Meter id → delta. Keys: k1–k3, a guest id, or "self"/"a"/"b" depending on context. */
export type Effects = Record<string, number>

export interface Kingdom { id: KingdomId; name: string; startAffinity: number; color: string; icon: string }
export interface Guest { id: string; name: string; faction: KingdomId; portrait: string; icon?: string; startAffinity: number; ink: string }
export interface Quest { id: string; name: string; color: string }
export interface Segment { id?: string; text: string; cut?: boolean; quest?: string; topic?: string; claim?: string }
export interface Article { headline: string; quest?: string; when?: Condition; paragraphs: Segment[][] }
export interface Scroll { id: string; kingdom: KingdomId; title: string; articles: Article[] }
export interface Visit { guest: string; knot: string; when?: Condition }
export interface DayDef { day: number; tables: number; scrolls: string[]; queue: Visit[]; shuffle?: boolean; lounge: Visit[] }
export interface Pairings {
  pairs: { guests: [string, string]; effects: Effects }[]
  factionFallback: Record<string, Effects>
}
interface NightRule { bed: Effects; kick: Effects }
/** Per guest: default effects, optionally overridden per day as `day2: { bed, kick }`. */
export type Night = Record<string, NightRule & Record<`day${number}`, NightRule | undefined>>
export interface SummaryBlock extends SummaryBlockData { id: string }
export type StringKey = keyof typeof stringsJson

export const kingdoms = kingdomsJson as unknown as Kingdom[]
export const guests = guestsJson as unknown as Guest[]
export const scrolls = scrollsJson as unknown as Scroll[]
export const quests = questsJson as unknown as Quest[]
/** Slot topic id → label shown on the empty bubble. */
export const topics = topicsJson as Record<string, string>
export const days = daysJson as unknown as DayDef[]
export const pairings = pairingsJson as unknown as Pairings
export const night = nightJson as unknown as Night
export const summaryBlocks = summaryJson as unknown as SummaryBlock[]

const inkFiles = import.meta.glob<object>('./ink/*.json', { eager: true, import: 'default' })
export const inkJson = (name: string) => inkFiles[`./ink/${name}.json`]

export const guestById = (id: string) => guests.find((g) => g.id === id)!
export const kingdomById = (id: string) => kingdoms.find((k) => k.id === id)!
export const questById = (id: string | undefined) => quests.find((q) => q.id === id)
export const scrollById = (id: string) => scrolls.find((s) => s.id === id)!
export const guestIcon = (id: string) => guestById(id).icon ?? guestById(id).portrait
export const UNKNOWN_ICON = 'art/icons/unknown.png'

/** UI string with {placeholders} filled in. */
export function t(key: StringKey, vars: Record<string, string | number> = {}) {
  return stringsJson[key].replace(/\{(\w+)\}/g, (_, v: string) => String(vars[v] ?? ''))
}

// Start-up validation: broken content shows up as clear console errors instead of a stuck game.
const problems = validateContent({
  kingdoms, guests, scrolls, quests, topics, days, summary: summaryBlocks, night, pairings,
  ink: Object.fromEntries(guests.map((g) => [g.ink, inkJson(g.ink)])),
})
for (const p of problems) console.error(`[content] ${p}`)
