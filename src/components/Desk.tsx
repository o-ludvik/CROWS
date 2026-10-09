import { useRef, useState, type PointerEvent } from 'react'
import { kingdomById, t } from '../content'
import { DESK, MINIMAP, TRASH, actions, guestName, useGame, type DeskItem } from '../store/gameStore'
import { getScale } from './Stage'
import { Tables } from './Tables'

const inside = (r: { x: number; y: number; w: number; h: number }, x: number, y: number) =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h

/** Pointer position in desk coordinates. */
function deskPoint(e: PointerEvent) {
  const rect = (e.currentTarget as HTMLElement).closest('.desk')!.getBoundingClientRect()
  return { x: (e.clientX - rect.left) / getScale(), y: (e.clientY - rect.top) / getScale() }
}

function Item({ item, onOverTrash }: { item: DeskItem; onOverTrash: (over: boolean) => void }) {
  const s = useGame()
  const drag = useRef<{ cx: number; cy: number; x: number; y: number; moved: boolean } | null>(null)

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { cx: e.clientX, cy: e.clientY, x: item.x, y: item.y, moved: false }
    actions.raise(item.id)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.cx
    const dy = e.clientY - d.cy
    if (Math.hypot(dx, dy) >= 5) d.moved = true
    if (!d.moved) return
    const el = e.currentTarget
    const x = Math.max(0, Math.min(DESK.w - el.offsetWidth, d.x + dx / getScale()))
    const y = Math.max(0, Math.min(DESK.h - el.offsetHeight, d.y + dy / getScale()))
    actions.moveItem(item.id, x, y)
    const p = deskPoint(e)
    onOverTrash(inside(TRASH, p.x, p.y))
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    onOverTrash(false)
    if (!d) return
    if (!d.moved) {
      if (item.kind === 'scroll') actions.openReader(item.scrollId)
      return
    }
    const p = deskPoint(e)
    if (inside(TRASH, p.x, p.y)) return actions.removeItem(item.id)
    // Never leave an item hidden under the minimap: push it out the shorter way (left or up).
    const el = e.currentTarget
    const { x, y } = useGame.getState().deskItems.find((i) => i.id === item.id)!
    const cx = x + el.offsetWidth / 2
    const cy = y + el.offsetHeight / 2
    if (inside(MINIMAP, cx, cy)) {
      const pushLeft = x + el.offsetWidth - MINIMAP.x
      const pushUp = y + el.offsetHeight - MINIMAP.y
      if (pushLeft <= pushUp) actions.moveItem(item.id, x - pushLeft, y)
      else actions.moveItem(item.id, x, y - pushUp)
    }
  }

  const title =
    item.kind === 'cutout'
      ? item.source.type === 'scroll'
        ? t('sourceScroll', { kingdom: kingdomById(item.source.kingdom).name })
        : t('sourceConversation', { name: guestName(item.source.guestId, s) })
      : undefined

  return (
    <div
      className={`desk-item ${item.kind}`}
      style={{ left: item.x, top: item.y, zIndex: item.z }}
      title={title}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
    >
      {item.kind === 'scroll' ? <img src="art/scroll_rolled.png" alt="" draggable={false} /> : item.text}
    </div>
  )
}

export function Desk() {
  const items = useGame((s) => s.deskItems)
  const [overTrash, setOverTrash] = useState(false)
  return (
    <div className="desk">
      <div className="desk-items">
        {items.map((i) => <Item key={i.id} item={i} onOverTrash={setOverTrash} />)}
      </div>
      <img
        className={`trash ${overTrash ? 'over' : ''}`}
        src="art/trashcan.png"
        alt=""
        style={{ left: TRASH.x, top: TRASH.y, width: TRASH.w, height: TRASH.h }}
      />
      <div className="minimap" style={{ left: MINIMAP.x, top: MINIMAP.y, width: MINIMAP.w, height: MINIMAP.h }}>
        <Tables size="small" />
      </div>
    </div>
  )
}
