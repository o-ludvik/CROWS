import { kingdoms, t } from '../content'
import { guestName, useGame } from '../store/gameStore'

function Meter({
  label, value, delta, active, invertColors,
}: {
  label: string; value: number; delta?: number; active?: boolean; invertColors?: boolean
}) {
  const pct = (Math.abs(value) / 10) * 50
  // Affinity: + green / − red. Stress: + (tense) red / − (calm) green.
  const hot = invertColors ? value > 0 : value < 0
  return (
    <div className={`meter ${active ? 'active' : ''}`}>
      <div className="meter-label">
        <span>{label}</span>
        <span>{value}{delta ? ` (${delta > 0 ? '+' : ''}${delta})` : ''}</span>
      </div>
      <div className="meter-bar">
        <div className={`meter-fill ${hot ? 'neg' : 'pos'}`} style={{ width: `${pct}%`, left: value < 0 ? `${50 - pct}%` : '50%' }} />
        <div className="meter-mid" />
      </div>
    </div>
  )
}

export function MetersPanel() {
  const s = useGame()
  const current = s.current?.guest
  return (
    <div className="meters">
      <Meter label={t('stress')} value={s.meters.stress ?? 0} delta={s.lastDelta.stress} invertColors />
      <hr />
      {kingdoms.map((k) => <Meter key={k.id} label={k.name} value={s.meters[k.id]} delta={s.lastDelta[k.id]} />)}
      <hr />
      {s.todayGuests.map((id) => (
        <Meter key={id} label={guestName(id, s)} value={s.meters[id]} delta={s.lastDelta[id]} active={id === current} />
      ))}
    </div>
  )
}
