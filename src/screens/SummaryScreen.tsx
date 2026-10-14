import { guestById, kingdomById, kingdoms, summaryBlocks, t } from '../content'
import { MetersPanel } from '../components/MetersPanel'
import { buildSummary } from '../engine/summary'
import { actions, useGame } from '../store/gameStore'

export function SummaryScreen() {
  const s = useGame()
  // Explicit DayResult — avoid spreading unrelated store fields into the evaluator.
  const paragraphs = buildSummary(
    summaryBlocks,
    {
      present: s.todayGuests,
      seats: s.seats,
      nightAssignments: s.nightAssignments,
      meters: s.meters,
      inkVars: s.inkVars,
    },
    (id) => kingdoms.some((k) => k.id === id) ? kingdomById(id).name : guestById(id).name,
  )
  return (
    <div className="screen" style={{ backgroundImage: 'url(art/summary_bg.png)' }}>
      <h2 className="screen-heading">{t('summaryHeading')}</h2>
      <div className="summary-text">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <button className="btn" onClick={actions.playAgain}>{t('playAgain')}</button>
      </div>
      <div className="side-meters"><MetersPanel /></div>
    </div>
  )
}
