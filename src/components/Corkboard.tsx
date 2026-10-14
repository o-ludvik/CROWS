import { useRef, useState, type PointerEvent } from 'react'
import { kingdomById, t } from '../content'
import {
  CORK, DESK, TOP_H, actions, guestName, useGame,
  type CorkColor, type CorkString, type DeskItem,
} from '../store/gameStore'
import { getScale } from './Stage'
import { stagePoint } from './stageCoords'

const COLORS: CorkColor[] = ['red', 'twine', 'blue']
const STRING_GAP = 12

function CorkItem({ item }: { item: DeskItem }) {
  const s = useGame()
  const ghosting = useGame((st) => st.dragGhost?.id === item.id)
  const drag = useRef<{
    cx: number; cy: number; x: number; y: number; moved: boolean
    ox: number; oy: number; w: number; h: number
  } | null>(null)
  const [tip, setTip] = useState(false)

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.cork-pin')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const el = e.currentTarget
    const p = stagePoint(e)
    drag.current = {
      cx: e.clientX, cy: e.clientY, x: item.x, y: item.y, moved: false,
      ox: p.x - item.x, oy: p.y - item.y,
      w: el.offsetWidth, h: el.offsetHeight,
    }
    actions.raise(item.id)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.cx
    const dy = e.clientY - d.cy
    if (Math.hypot(dx, dy) >= 5) d.moved = true
    if (!d.moved) return

    const p = stagePoint(e)
    const stageX = p.x - d.ox
    const stageY = p.y - d.oy
    // Ghost only when the item centre crosses onto the desk — stay cork-local otherwise (no edge snap).
    if (stageY + d.h / 2 >= TOP_H) {
      actions.setDragGhost({ id: item.id, stageX, stageY, width: d.w, height: d.h })
      return
    }
    actions.setDragGhost(null)
    const x = Math.max(0, Math.min(CORK.w - d.w, stageX))
    const y = Math.max(24, Math.min(CORK.h - d.h, stageY))
    actions.moveItem(item.id, x, y)
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    actions.setDragGhost(null)
    if (!d) return
    if (!d.moved) {
      if (item.kind === 'scroll') actions.openReader(item.scrollId)
      else actions.openNote(item.id)
      return
    }
    const p = stagePoint(e)
    const stageX = p.x - d.ox
    const stageY = p.y - d.oy
    if (stageY + d.h / 2 >= TOP_H) {
      const deskX = Math.max(0, Math.min(DESK.w - d.w, stageX))
      const deskY = Math.max(0, Math.min(DESK.h - d.h, stageY - TOP_H))
      actions.setItemSurface(item.id, 'desk', deskX, deskY)
      return
    }
    // Keep the last cork position from move() — no pointerInCork re-snap.
    const x = Math.max(0, Math.min(CORK.w - d.w, stageX))
    const y = Math.max(24, Math.min(CORK.h - d.h, stageY))
    actions.moveItem(item.id, x, y)
  }

  const title =
    item.kind === 'cutout'
      ? item.source.type === 'scroll'
        ? t('sourceScroll', { kingdom: kingdomById(item.source.kingdom).name })
        : t('sourceConversation', { name: guestName(item.source.guestId, s) })
      : undefined

  return (
    <div
      className={`desk-item cork-item ${item.kind}${ghosting ? ' ghosting' : ''}`}
      style={{ left: item.x, top: item.y, zIndex: item.z }}
      title={title}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerEnter={() => item.kind === 'cutout' && setTip(true)}
      onPointerLeave={() => setTip(false)}
    >
      <button
        type="button"
        className={`cork-pin ${s.corkPinFrom === item.id ? 'selected' : ''}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); actions.clickCorkPin(item.id) }}
      >
        <img src="art/pin.png" alt="" draggable={false} />
      </button>
      {item.kind === 'scroll' ? <img src="art/scroll_rolled.png" alt="" draggable={false} /> : item.text}
      {tip && item.kind === 'cutout' && <div className="cork-tip">{item.text}</div>}
    </div>
  )
}

function pairKey(s: CorkString) {
  return s.a < s.b ? `${s.a}|${s.b}` : `${s.b}|${s.a}`
}

function StringLines({ items }: { items: DeskItem[] }) {
  const strings = useGame((s) => s.corkStrings)
  const byId = Object.fromEntries(items.map((i) => [i.id, i]))
  const groups = new Map<string, CorkString[]>()
  for (const str of strings) {
    const k = pairKey(str)
    const g = groups.get(k) ?? []
    g.push(str)
    groups.set(k, g)
  }
  return (
    <svg className="cork-strings" width={CORK.w} height={CORK.h}>
      {strings.map((str) => {
        const a = byId[str.a]
        const b = byId[str.b]
        if (!a || !b) return null
        const group = groups.get(pairKey(str)) ?? [str]
        const idx = group.indexOf(str)
        const x1 = a.x + 20
        const y1 = a.y + 8
        const x2 = b.x + 20
        const y2 = b.y + 8
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const off = (idx - (group.length - 1) / 2) * STRING_GAP
        return (
          <line
            key={str.id}
            x1={x1 + nx * off} y1={y1 + ny * off}
            x2={x2 + nx * off} y2={y2 + ny * off}
            className={`cork-string color-${str.color}`}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              actions.removeCorkString(str.id)
            }}
          />
        )
      })}
    </svg>
  )
}

export function Corkboard() {
  // Select the array itself — filtering in the selector returns a new ref every time and loops.
  const items = useGame((s) => s.deskItems).filter((i) => i.surface === 'cork')
  const color = useGame((s) => s.corkStringColor)

  return (
    <div
      className="corkboard"
      style={{ width: CORK.w, height: CORK.h }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('corkboard-bg'))
          actions.clearCorkPin()
      }}
      data-cork-drop
    >
      <img className="corkboard-bg" src="art/corkboard.png" alt="" draggable={false} />
      <div className="cork-palette" title={t('corkColors')}>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`cork-swatch color-${c} ${color === c ? 'active' : ''}`}
            onClick={() => actions.setCorkStringColor(c)}
          />
        ))}
      </div>
      <div className="cork-items">
        {items.map((i) => <CorkItem key={i.id} item={i} />)}
      </div>
      {/* Strings above notes so threads read on top */}
      <StringLines items={items} />
    </div>
  )
}

/** Drop helper: cork-local top-left from pointer + grab offset. */
export function pointerInCork(
  e: { clientX: number; clientY: number },
  ox = 40,
  oy = 20,
  w = 260,
  h = 60,
) {
  const el = document.querySelector('[data-cork-drop]') as HTMLElement | null
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const scale = getScale()
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return null
  return {
    x: Math.max(0, Math.min(CORK.w - w, (e.clientX - rect.left) / scale - ox)),
    y: Math.max(24, Math.min(CORK.h - h, (e.clientY - rect.top) / scale - oy)),
  }
}

/** Floating clone that follows the pointer across desk and corkboard. */
export function DragGhost() {
  const ghost = useGame((s) => s.dragGhost)
  const item = useGame((s) => (ghost ? s.deskItems.find((i) => i.id === ghost.id) : undefined))
  if (!ghost || !item) return null
  return (
    <div
      className={`desk-item drag-ghost ${item.kind}${item.surface === 'cork' ? ' cork-item' : ''}`}
      style={{ left: ghost.stageX, top: ghost.stageY, width: ghost.width, zIndex: 50, pointerEvents: 'none' }}
    >
      {item.surface === 'cork' && (
        <span className="cork-pin"><img src="art/pin.png" alt="" draggable={false} /></span>
      )}
      {item.kind === 'scroll' ? <img src="art/scroll_rolled.png" alt="" draggable={false} /> : item.text}
    </div>
  )
}
