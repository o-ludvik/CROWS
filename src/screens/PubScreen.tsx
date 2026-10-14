import { guestById, t } from '../content'
import { ChatPanel } from '../components/ChatPanel'
import { Corkboard, DragGhost } from '../components/Corkboard'
import { Desk } from '../components/Desk'
import { MetersPanel } from '../components/MetersPanel'
import { NoteReader } from '../components/NoteReader'
import { ScrollReader } from '../components/ScrollReader'
import { SeatingOverlay } from '../components/SeatingOverlay'
import { actions, useGame } from '../store/gameStore'

export function PubScreen() {
  const phase = useGame((s) => s.phase)
  const guestId = useGame((s) => s.todayGuests[s.currentGuestIndex])
  const readerOpen = useGame((s) => s.readerOpen)
  const noteOpen = useGame((s) => s.noteOpen)
  const corkOpen = useGame((s) => s.corkOpen)
  return (
    <div className="screen pub">
      <div className={`pub-top ${corkOpen ? 'cork-open' : ''}`}>
        <Corkboard />
        <div className="portrait-area">
          {phase === 'desk' ? (
            <>
              <img src="art/pub_door_closed.png" alt="" />
              <button className="btn open-pub" onClick={actions.openPub}>{t('openPub')}</button>
            </>
          ) : (
            // key → remount → CSS fade-in for each new guest
            <img key={guestId} className="portrait" src={guestById(guestId).portrait} alt="" />
          )}
        </div>
        <MetersPanel />
        <ChatPanel />
      </div>
      {!corkOpen && (
        <button type="button" className="cork-arrow left" title={t('corkOpen')} onClick={() => actions.setCorkOpen(true)}>
          <img src="art/cork_arrow.png" alt="" draggable={false} />
        </button>
      )}
      {corkOpen && (
        <button type="button" className="cork-arrow right" title={t('corkClose')} onClick={() => actions.setCorkOpen(false)}>
          <img src="art/cork_arrow.png" alt="" draggable={false} />
        </button>
      )}
      <Desk />
      <DragGhost />
      {readerOpen && <ScrollReader scrollId={readerOpen} />}
      {noteOpen && <NoteReader itemId={noteOpen} />}
      {phase === 'seating' && <SeatingOverlay />}
    </div>
  )
}
