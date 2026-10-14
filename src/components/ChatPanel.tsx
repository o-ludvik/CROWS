import { useEffect, useRef } from 'react'
import { t } from '../content'
import { actions, currentGuestId, guestName, useGame } from '../store/gameStore'

export function ChatPanel() {
  const s = useGame()
  const bottom = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [s.chatLog.length, s.choices.length, s.storyEnded])

  if (s.phase === 'desk') return <div className="chat" />
  const id = currentGuestId()
  return (
    <div className="chat">
      {s.chatLog.map((line, i) => (
        <div key={i} className={`line ${line.speaker}`}>
          <div className="label">{line.speaker === 'bartender' ? t('bartenderLabel') : guestName(id, s)}</div>
          <div className="bubble">
            {line.cuttable ? (
              <span className="cut" onClick={() => actions.addCutout(line.text, { type: 'conversation', guestId: id })}>{line.text}</span>
            ) : (
              <span>{line.text}</span>
            )}
            {line.stressDelta != null && line.stressDelta !== 0 && (
              <span className={`stress-badge ${line.stressDelta > 0 ? 'up' : 'down'}`}>
                {line.stressDelta > 0 ? '+' : ''}{line.stressDelta}
              </span>
            )}
          </div>
        </div>
      ))}
      <div className="choices" ref={bottom}>
        {s.choices.map((c, i) => <button key={i} className="btn choice" onClick={() => actions.choose(i)}>{c}</button>)}
        {s.storyEnded && s.phase === 'conversation' && (
          <button className="btn choice" onClick={actions.closeConversation}>{t('closingLine')}</button>
        )}
      </div>
    </div>
  )
}
