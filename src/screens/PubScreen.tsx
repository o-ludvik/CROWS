import { guestById, t } from '../content'
import { ChatPanel } from '../components/ChatPanel'
import { Desk } from '../components/Desk'
import { MetersPanel } from '../components/MetersPanel'
import { ScrollReader } from '../components/ScrollReader'
import { SeatingOverlay } from '../components/SeatingOverlay'
import { actions, useGame } from '../store/gameStore'

export function PubScreen() {
  const phase = useGame((s) => s.phase)
  const guestId = useGame((s) => s.todayGuests[s.currentGuestIndex])
  const readerOpen = useGame((s) => s.readerOpen)
  return (
    <div className="screen pub">
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
      <Desk />
      {readerOpen && <ScrollReader scrollId={readerOpen} />}
      {phase === 'seating' && <SeatingOverlay />}
    </div>
  )
}
