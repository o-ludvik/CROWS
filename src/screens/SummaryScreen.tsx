import { guestById, kingdomById, kingdoms, summaryBlocks, t } from '../content'
import { MetersPanel } from '../components/MetersPanel'
import { buildSummary } from '../engine/summary'
import { LAST_DAY, actions, conditionCtx, useGame } from '../store/gameStore'

const names = (id: string) => (kingdoms.some((k) => k.id === id) ? kingdomById(id).name : guestById(id).name)

export function SummaryScreen() {
  const day = useGame((s) => s.day)
  useGame((s) => s.history) // re-render once the day is recorded
  const ctx = conditionCtx()
  const last = day >= LAST_DAY
  const paragraphs = buildSummary(summaryBlocks, ctx, names)
  const ending = last ? buildSummary(summaryBlocks, ctx, names, true) : []
  return (
    <div className="screen" style={{ backgroundImage: 'url(art/summary_bg.png)' }}>
      <h2 className="screen-heading">{t('summaryHeading', { n: day })}</h2>
      <div className="summary-text">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {last && <h3>{t('endOfDemo')}</h3>}
        {ending.map((p, i) => <p key={`f${i}`}>{p}</p>)}
        {last
          ? <button className="btn" onClick={actions.playAgain}>{t('playAgain')}</button>
          : <button className="btn" onClick={actions.nextDay}>{t('nextDay')}</button>}
      </div>
      <div className="side-meters"><MetersPanel /></div>
    </div>
  )
}
