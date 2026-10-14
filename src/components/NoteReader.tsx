import { t } from '../content'
import { actions, useGame } from '../store/gameStore'

export function NoteReader({ itemId }: { itemId: string }) {
  const item = useGame((s) => s.deskItems.find((i) => i.id === itemId))
  const close = () => actions.openNote(null)
  if (!item || item.kind !== 'cutout') return null
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader note-reader" onClick={(e) => e.stopPropagation()}>
        <div className="reader-kingdom">{t('noteHeading')}</div>
        <p className="note-body">{item.text}</p>
        <button className="btn" onClick={close}>{t('close')}</button>
      </div>
    </div>
  )
}
