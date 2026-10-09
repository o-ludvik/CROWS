import { useState } from 'react'
import { guestById, t } from '../content'
import { MetersPanel } from './MetersPanel'
import { Tables } from './Tables'
import { actions, currentGuestId, guestName, useGame } from '../store/gameStore'

export function SeatingOverlay() {
  const s = useGame()
  const [selected, setSelected] = useState<number | null>(null)
  const id = currentGuestId()
  return (
    <div className="overlay seating">
      <h2>{t('seatingHeading')}</h2>
      <div className="seating-guest">
        <img src={guestById(id).portrait} alt="" />
        <div>{guestName(id, s)}</div>
      </div>
      <Tables size="large" selected={selected} onPick={setSelected} />
      <div className="side-meters"><MetersPanel /></div>
      <button className="btn confirm" disabled={selected === null} onClick={() => selected !== null && actions.seat(selected)}>
        {t('seatConfirm')}
      </button>
    </div>
  )
}
