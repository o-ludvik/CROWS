// Colour coding and icons for scrolls and cutouts (GDD 6.6).
import type { CSSProperties } from 'react'
import { UNKNOWN_ICON, guestById, guestIcon, kingdomById, questById, scrollById, t } from '../content'
import { guestName, useGame, type CutoutSource, type DeskItem, type UsedCutout } from '../store/gameStore'

type State = ReturnType<typeof useGame.getState>
interface Look { tone?: string; icons: string[] }

/** Quest colour beats kingdom colour; kingdom icon whenever the source is a kingdom; "?" until a guest's faction is revealed. */
export function cutoutLook(c: { source: CutoutSource; quest?: string }, s: State): Look {
  const quest = questById(c.quest)
  if (c.source.type === 'scroll') {
    const k = kingdomById(c.source.kingdom)
    return { tone: quest?.color ?? k.color, icons: [k.icon] }
  }
  const g = guestById(c.source.guestId)
  const k = kingdomById(g.faction)
  const known = s.revealed[g.id]?.faction
  return { tone: quest?.color ?? (known ? k.color : undefined), icons: [guestIcon(g.id), known ? k.icon : UNKNOWN_ICON] }
}

export function itemLook(item: DeskItem, s: State): Look {
  if (item.kind === 'cutout') return cutoutLook(item, s)
  const k = kingdomById(scrollById(item.scrollId).kingdom)
  return { tone: k.color, icons: [k.icon] }
}

export const toneStyle = (tone?: string) => (tone ? ({ '--tone': tone } as CSSProperties) : undefined)

/** Source tooltip, e.g. "Zdroj: Svitek – Velesie · Linka: Most přes Vranku". */
export function cutoutTitle(c: { source: CutoutSource; quest?: string }, s: State) {
  const src = c.source.type === 'scroll'
    ? t('sourceScroll', { kingdom: kingdomById(c.source.kingdom).name })
    : t('sourceConversation', { name: guestName(c.source.guestId, s) })
  const quest = questById(c.quest)
  return quest ? `${src} · ${t('sourceQuest', { quest: quest.name })}` : src
}

export function Icons({ icons }: { icons: string[] }) {
  return <span className="icons">{icons.map((src, i) => <img key={i} src={src} alt="" draggable={false} />)}</span>
}

/** Inside of a desk / corkboard / ghost item. */
export function ItemFace({ item }: { item: DeskItem }) {
  const s = useGame()
  return (
    <>
      {item.kind === 'scroll' ? <img src="art/scroll_rolled.png" alt="" draggable={false} /> : item.text}
      <Icons icons={itemLook(item, s).icons} />
    </>
  )
}

/** Small tag under a bartender bubble showing which cutout was used in a slot. */
export function CutoutTag({ used }: { used: UsedCutout }) {
  const s = useGame()
  const look = cutoutLook(used, s)
  return (
    <div className={`cutout-tag ${look.tone ? 'toned' : ''}`} style={toneStyle(look.tone)} title={cutoutTitle(used, s)}>
      <Icons icons={look.icons} />
      <span className="cutout-tag-text">{used.text}</span>
    </div>
  )
}
