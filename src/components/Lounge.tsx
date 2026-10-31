import { useState } from 'react'
import { guestById, t } from '../content'
import { actions, canInvite, guestFaction, guestName, useGame } from '../store/gameStore'

/** Room right of the bar (GDD 7a): guests who slept here and have a follow-up wait to be invited. */
export function Lounge() {
  const s = useGame()
  const [picked, setPicked] = useState<string | null>(null)
  const can = canInvite(s)
  const why = can ? undefined : s.current?.fromLounge ? t('inviteBusy') : t('inviteClosed')
  return (
    <div className="lounge" onClick={() => setPicked(null)}>
      <img className="lounge-bg" src="art/lounge_bg.png" alt="" draggable={false} />
      <h2 className="lounge-title">{t('loungeTitle')}</h2>
      {!s.loungeGuests.length && <div className="lounge-empty">{t('loungeEmpty')}</div>}
      {s.loungeGuests.map((v, i) => (
        <div
          key={v.guest}
          className={`lounge-guest spot-${i} ${picked === v.guest ? 'picked' : ''}`}
          title={`${guestName(v.guest, s)} – ${guestFaction(v.guest, s)}`}
          onClick={(e) => { e.stopPropagation(); setPicked(picked === v.guest ? null : v.guest) }}
        >
          <img src={guestById(v.guest).portrait} alt="" draggable={false} />
          <div className="lounge-name">{guestName(v.guest, s)}</div>
          {picked === v.guest && (
            <div className="invite">
              <button className="btn" disabled={!can} onClick={(e) => { e.stopPropagation(); setPicked(null); actions.invite(v.guest) }}>
                {t('inviteToBar')}
              </button>
              {why && <div className="invite-why">{why}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
