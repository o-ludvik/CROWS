import { guestById, t } from '../content'
import { ChatPanel } from '../components/ChatPanel'
import { Corkboard, DragGhost } from '../components/Corkboard'
import { Desk } from '../components/Desk'
import { Lounge } from '../components/Lounge'
import { MetersPanel } from '../components/MetersPanel'
import { NoteReader } from '../components/NoteReader'
import { ScrollReader } from '../components/ScrollReader'
import { SeatingOverlay } from '../components/SeatingOverlay'
import { SlotPicker } from '../components/SlotPicker'
import { actions, useGame } from '../store/gameStore'

export function PubScreen() {
  const phase = useGame((s) => s.phase)
  const guestId = useGame((s) => s.current?.guest)
  const readerOpen = useGame((s) => s.readerOpen)
  const noteOpen = useGame((s) => s.noteOpen)
  const slotPicker = useGame((s) => s.slotPicker)
  const view = useGame((s) => s.view)
  const waiting = useGame((s) => s.loungeGuests.length)
  const day = useGame((s) => s.day)
  return (
    <div className="screen pub">
      <div className={`pub-top view-${view}`}>
        <Corkboard />
        <div className="portrait-area">
          {phase === 'desk' || phase === 'dayEnd' || !guestId ? (
            <>
              <img src="art/pub_door_closed.png" alt="" />
              {phase === 'desk' && <button className="btn open-pub" onClick={actions.openPub}>{t('openPub')}</button>}
              {phase === 'dayEnd' && (
                <div className="day-end">
                  <p>{t('dayEndHint')}</p>
                  <button className="btn" onClick={actions.closePub}>{t('closePub')}</button>
                </div>
              )}
            </>
          ) : (
            // key → remount → CSS fade-in for each new (or returning) guest
            <img key={guestId} className="portrait" src={guestById(guestId).portrait} alt="" />
          )}
        </div>
        <MetersPanel />
        <ChatPanel />
        <Lounge />
      </div>
      {view === 'main' && (
        <>
          <button type="button" className="side-arrow left" title={t('corkOpen')} onClick={() => actions.setView('cork')}>
            <img src="art/cork_arrow.png" alt="" draggable={false} />
          </button>
          <button type="button" className="side-arrow right" title={t('loungeTitle')} onClick={() => actions.setView('lounge')}>
            <img src="art/lounge_arrow.png" alt="" draggable={false} />
            {waiting > 0 && <span className="arrow-badge">{waiting}</span>}
          </button>
        </>
      )}
      {view === 'cork' && (
        <button type="button" className="side-arrow right" title={t('corkClose')} onClick={() => actions.setView('main')}>
          <img src="art/cork_arrow.png" alt="" draggable={false} />
        </button>
      )}
      {view === 'lounge' && (
        <button type="button" className="side-arrow left" title={t('loungeBack')} onClick={() => actions.setView('main')}>
          <img src="art/lounge_arrow.png" alt="" draggable={false} />
        </button>
      )}
      <div className="day-label">{t('dayLabel', { n: day })}</div>
      <Desk />
      <DragGhost />
      {readerOpen && <ScrollReader scrollId={readerOpen} />}
      {noteOpen && <NoteReader itemId={noteOpen} />}
      {slotPicker && <SlotPicker topic={slotPicker} />}
      {phase === 'seating' && <SeatingOverlay />}
    </div>
  )
}
