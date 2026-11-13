import { useState } from 'react'
import { guestById, t } from '../content'
import { actions, guestName, useGame } from '../store/gameStore'
import { ChatLineView } from './ChatPanel'
import { CloseX } from './IconBadge'

/** Character log: everyone talked to, with the days; a portrait opens the full record (lines can still be cut out). */
export function CharacterLog() {
  const s = useGame()
  const [open, setOpen] = useState<string | null>(null)
  const close = () => actions.openOverlay(null)
  const ids = Object.keys(s.transcripts)
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader menu-panel character-log" onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={close} />
        {open ? (
          <>
            <button className="btn" onClick={() => setOpen(null)}>{t('logBack')}</button>
            <h2>{guestName(open, s)}</h2>
            {s.transcripts[open].map((v, vi) => (
              <div key={vi} className="log-visit">
                <h3>{t('dayLabel', { n: v.day })}</h3>
                {v.lines.map((line, i) => <ChatLineView key={i} line={line} guestId={open} />)}
              </div>
            ))}
          </>
        ) : (
          <>
            <h2>{t('characterLog')}</h2>
            {!ids.length && <p>{t('logEmpty')}</p>}
            <div className="chronicle-guests">
              {ids.map((id) => (
                <button key={id} type="button" className="log-guest" onClick={() => setOpen(id)}>
                  <img src={guestById(id).portrait} alt="" />
                  <div>{guestName(id, s)}</div>
                  <div className="muted">{t('logDays', { days: [...new Set(s.transcripts[id].map((v) => v.day))].join(', ') })}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
