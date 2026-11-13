// Colour coding and icons: scrolls and cutouts carry their kingdom's colour and icon.
import type { CSSProperties } from 'react'
import { UNKNOWN_ICON, guestById, guestIcon, itemById, kingdomById, scrollById, t } from '../content'
import { guestName, useGame, type CutoutSource, type DeskItem, type UsedCutout } from '../store/gameStore'

type State = ReturnType<typeof useGame.getState>
interface Look { tone?: string; icons: string[] }

/** Kingdom colour + icon; a conversation cutout shows the guest's icon and "?" (no colour) until the faction is revealed. */
export function cutoutLook(c: { source: CutoutSource }, s: State): Look {
  if (c.source.type === 'scroll') {
    const k = kingdomById(c.source.kingdom)
    return { tone: k.color, icons: [k.icon] }
  }
  const g = guestById(c.source.guestId)
  const k = kingdomById(g.faction)
  const known = s.revealed[g.id]?.faction
  return { tone: known ? k.color : undefined, icons: [guestIcon(g.id), known ? k.icon : UNKNOWN_ICON] }
}

export function itemLook(item: DeskItem, s: State): Look {
  if (item.kind === 'cutout') return cutoutLook(item, s)
  if (item.kind === 'item') return { icons: [] }
  const k = kingdomById(scrollById(item.scrollId).kingdom)
  return { tone: k.color, icons: [k.icon] }
}

export const toneStyle = (tone?: string) => (tone ? ({ '--tone': tone } as CSSProperties) : undefined)

/** Source tooltip, e.g. "Zdroj: Svitek – Varhoř". */
export function cutoutTitle(c: { source: CutoutSource }, s: State) {
  return c.source.type === 'scroll'
    ? t('sourceScroll', { kingdom: kingdomById(c.source.kingdom).name })
    : t('sourceConversation', { name: guestName(c.source.guestId, s) })
}

/** Hover tooltip for anything on the desk / corkboard. */
export function itemTitle(item: DeskItem, s: State) {
  if (item.kind === 'cutout') return cutoutTitle(item, s)
  if (item.kind === 'item') return itemById(item.itemId).name
  const scroll = scrollById(item.scrollId)
  return `${scroll.title} – ${kingdomById(scroll.kingdom).name}`
}

export function Icons({ icons }: { icons: string[] }) {
  return <span className="icons">{icons.map((src, i) => <img key={i} src={src} alt="" draggable={false} />)}</span>
}

/** Inside of a desk / corkboard / ghost item. */
export function ItemFace({ item }: { item: DeskItem }) {
  const s = useGame()
  if (item.kind === 'item') return <img src={itemById(item.itemId).image} alt="" draggable={false} />
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
    </div>
  )
}

/** ✕ button in the corner of an overlay. */
export function CloseX({ onClick }: { onClick: () => void }) {
  return <button type="button" className="overlay-close" title={t('close')} onClick={onClick}>✕</button>
}
