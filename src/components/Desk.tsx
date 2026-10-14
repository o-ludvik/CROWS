import { useRef, useState, type PointerEvent } from 'react'
import { kingdomById, t } from '../content'
import { DESK, MINIMAP, TOP_H, TRASH, actions, guestName, useGame, type DeskItem } from '../store/gameStore'
import { pointerInCork } from './Corkboard'
import { getScale } from './Stage'
import { stagePoint } from './stageCoords'
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
  const ghosting = useGame((st) => st.dragGhost?.id === item.id)
  const drag = useRef<{
    cx: number; cy: number; x: number; y: number; moved: boolean
    ox: number; oy: number; w: number; h: number
  } | null>(null)

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const el = e.currentTarget
    const p = stagePoint(e)
    drag.current = {
      cx: e.clientX, cy: e.clientY, x: item.x, y: item.y, moved: false,
      ox: p.x - item.x, oy: p.y - (TOP_H + item.y),
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

    if (useGame.getState().corkOpen) {
      const p = stagePoint(e)
      actions.setDragGhost({ id: item.id, stageX: p.x - d.ox, stageY: p.y - d.oy, width: d.w, height: d.h })
      onOverTrash(false)
      return
    }

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
    actions.setDragGhost(null)
    if (!d) return
    if (!d.moved) {
      if (item.kind === 'scroll') actions.openReader(item.scrollId)
      return
    }

    if (useGame.getState().corkOpen) {
      const cork = pointerInCork(e, d.ox, d.oy, d.w, d.h)
      if (cork) return actions.setItemSurface(item.id, 'cork', cork.x, cork.y)
      const p = stagePoint(e)
      const deskX = Math.max(0, Math.min(DESK.w - d.w, p.x - d.ox))
      const deskY = Math.max(0, Math.min(DESK.h - d.h, p.y - d.oy - TOP_H))
      if (p.y - d.oy + d.h / 2 >= TOP_H) {
        if (inside(TRASH, deskX + d.w / 2, deskY + d.h / 2)) return actions.removeItem(item.id)
        actions.moveItem(item.id, deskX, deskY)
        const cx = deskX + d.w / 2
        const cy = deskY + d.h / 2
        if (inside(MINIMAP, cx, cy)) {
          const pushLeft = deskX + d.w - MINIMAP.x
          const pushUp = deskY + d.h - MINIMAP.y
          if (pushLeft <= pushUp) actions.moveItem(item.id, deskX - pushLeft, deskY)
          else actions.moveItem(item.id, deskX, deskY - pushUp)
        }
        return
      }
      // Released above desk but not on cork — snap back to start
      actions.moveItem(item.id, d.x, d.y)
      return
    }

    const p = deskPoint(e)
    if (inside(TRASH, p.x, p.y)) return actions.removeItem(item.id)
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
      className={`desk-item ${item.kind}${ghosting ? ' ghosting' : ''}`}
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
  // Select the array itself — filtering in the selector returns a new ref every time and loops.
  const items = useGame((s) => s.deskItems).filter((i) => i.surface === 'desk')
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
