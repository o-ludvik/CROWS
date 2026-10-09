import { guestById, t, type StringKey } from '../content'
import { MetersPanel } from '../components/MetersPanel'
import { actions, guestFaction, guestName, useGame, type NightOutcome } from '../store/gameStore'

const OPTIONS: [NightOutcome, StringKey][] = [['r1a', 'bedR1A'], ['r1b', 'bedR1B'], ['r2a', 'bedR2A'], ['r2b', 'bedR2B'], ['kick', 'kick']]

export function NightScreen() {
  const s = useGame()
  const taken = Object.values(s.nightAssignments)
  const allSet = s.todayGuests.every((id) => s.nightAssignments[id])
  return (
    <div className="screen" style={{ backgroundImage: 'url(art/night_bg.png)' }}>
      <h2 className="screen-heading">{t('nightHeading')}</h2>
      <div className="night-rows">
        {s.todayGuests.map((id) => {
          const mine = s.nightAssignments[id]
          return (
            <div key={id} className="night-row">
              <img src={guestById(id).portrait} alt="" />
              <div className="night-who">
                <div>{guestName(id, s)}</div>
                <div className="muted">{guestFaction(id, s)}</div>
              </div>
              <select value={mine ?? ''} onChange={(e) => actions.setNight(id, (e.target.value || null) as NightOutcome | null)}>
                <option value="">{t('nightChoose')}</option>
                {OPTIONS.map(([value, label]) => (
                  <option key={value} value={value} disabled={value !== 'kick' && value !== mine && taken.includes(value)}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
        <button className="btn" disabled={!allSet} onClick={actions.finishNight}>{t('done')}</button>
      </div>
      <div className="side-meters"><MetersPanel /></div>
    </div>
  )
}
