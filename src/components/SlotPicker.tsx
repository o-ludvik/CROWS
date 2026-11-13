import { t, topics } from '../content'
import { actions, useGame, type CutoutItem } from '../store/gameStore'
import { CloseX, Icons, cutoutLook, cutoutTitle, toneStyle } from './IconBadge'

/** Modal opened by clicking a slot bubble: the player's cutouts (desk + corkboard) on that topic; a click puts one in. */
export function SlotPicker({ topic }: { topic: string }) {
  const s = useGame()
  const fitting = s.deskItems.filter((i): i is CutoutItem => i.kind === 'cutout' && i.topic === topic)
  const close = () => actions.openSlotPicker(null)
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader slot-picker" onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={close} />
        <h2>{topics[topic]}</h2>
        {!fitting.length && <p>{t('slotPickerEmpty')}</p>}
        {fitting.map((c) => {
          const look = cutoutLook(c, s)
          return (
            <button
              key={c.id}
              type="button"
              className={`picker-cutout ${look.tone ? 'toned' : ''}`}
              style={toneStyle(look.tone)}
              title={cutoutTitle(c, s)}
              onClick={() => actions.dropOnSlot(topic, c.id)}
            >
              {c.text}
              <Icons icons={look.icons} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
