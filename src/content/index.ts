// Typed access to everything in src/content. Components never hardcode content; they read it from here.
import kingdomsJson from './kingdoms.json'
import guestsJson from './guests.json'
import scrollsJson from './scrolls.json'
import pairingsJson from './pairings.json'
import nightJson from './night.json'
import summaryJson from './summary.json'
import stringsJson from './strings.cs.json'
import type { Condition } from '../engine/summary'

export type KingdomId = 'k1' | 'k2' | 'k3'
/** Meter id → delta. Keys: k1–k3, a guest id, or "self"/"a"/"b" depending on context. */
export type Effects = Record<string, number>

export interface Kingdom { id: KingdomId; name: string; startAffinity: number }
export interface Guest { id: string; name: string; faction: KingdomId; portrait: string; startAffinity: number; ink: string }
export interface Segment { id?: string; text: string; cut?: boolean }
export interface Scroll {
  id: string
  kingdom: KingdomId
  title: string
  articles: { headline: string; paragraphs: Segment[][] }[]
}
export interface Pairings {
  pairs: { guests: [string, string]; effects: Effects }[]
  factionFallback: Record<string, Effects>
}
export type Night = Record<string, { bed: Effects; kick: Effects }>
export interface SummaryBlock { id: string; when?: Condition; text: string }
export type StringKey = keyof typeof stringsJson

export const kingdoms = kingdomsJson as unknown as Kingdom[]
export const guests = guestsJson as unknown as Guest[]
export const scrolls = scrollsJson as unknown as Scroll[]
export const pairings = pairingsJson as unknown as Pairings
export const night = nightJson as unknown as Night
export const summaryBlocks = summaryJson as unknown as SummaryBlock[]

const inkFiles = import.meta.glob<object>('./ink/*.json', { eager: true, import: 'default' })
export const inkJson = (name: string) => inkFiles[`./ink/${name}.json`]

export const guestById = (id: string) => guests.find((g) => g.id === id)!
export const kingdomById = (id: string) => kingdoms.find((k) => k.id === id)!

/** UI string with {placeholders} filled in. */
export function t(key: StringKey, vars: Record<string, string> = {}) {
  return stringsJson[key].replace(/\{(\w+)\}/g, (_, v: string) => vars[v] ?? '')
}
