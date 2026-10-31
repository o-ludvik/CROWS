import { useEffect, useRef } from 'react'
import { questById, t, topics } from '../content'
import { slotTopics } from '../engine/slots'
import { actions, currentGuestId, guestName, useGame } from '../store/gameStore'
import { CutoutTag, toneStyle } from './IconBadge'

/** Empty bubble a cutout is dropped into (GDD 7.5). The desk drag finds it via data-slot; a click opens the picker. */
function CutoutSlot({ topic }: { topic: string }) {
  const rejected = useGame((s) => s.slotRejected === topic)
  return (
    <div className={`cutout-slot ${rejected ? 'rejected' : ''}`} data-slot={topic} onClick={() => actions.openSlotPicker(topic)}>
      <div className="slot-topic">{topics[topic]}</div>
      <div className="slot-hint">{rejected ? t('slotRejected') : t('slotPlaceholder')}</div>
    </div>
  )
}

export function ChatPanel() {
  const s = useGame()
  const bottom = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [s.chatLog.length, s.choices.length, s.storyEnded])

  if (s.phase !== 'conversation' && s.phase !== 'seating') return <div className="chat" />
  const id = currentGuestId()
  return (
    <div className="chat">
      {s.chatLog.map((line, i) => {
        const tone = questById(line.meta?.quest)?.color
        return (
          <div key={i} className={`line ${line.speaker}`}>
            <div className="label">{line.speaker === 'bartender' ? t('bartenderLabel') : guestName(id, s)}</div>
            <div className={`bubble ${tone ? 'toned' : ''}`} style={toneStyle(tone)}>
              {line.cuttable ? (
                <span className="cut" onClick={() => actions.addCutout(line.text, { type: 'conversation', guestId: id }, line.meta)}>{line.text}</span>
              ) : (
                <span>{line.text}</span>
              )}
              {line.stressDelta != null && line.stressDelta !== 0 && (
                <span className={`stress-badge ${line.stressDelta > 0 ? 'up' : 'down'}`}>
                  {line.stressDelta > 0 ? '+' : ''}{line.stressDelta}
                </span>
              )}
            </div>
            {line.usedCutout && <CutoutTag used={line.usedCutout} />}
          </div>
        )
      })}
      <div className="choices" ref={bottom}>
        {slotTopics(s.choices).map((topic) => <CutoutSlot key={topic} topic={topic} />)}
        {s.choices.filter((c) => !c.slot).map((c) => (
          <button key={c.index} className="btn choice" onClick={() => actions.choose(c.index)}>{c.text}</button>
        ))}
        {s.storyEnded && s.phase === 'conversation' && (
          <button className="btn choice" onClick={actions.closeConversation}>{t('closingLine')}</button>
        )}
      </div>
    </div>
  )
}
