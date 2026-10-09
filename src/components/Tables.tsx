import { guestById, t } from '../content'
import { guestFaction, guestName, useGame } from '../store/gameStore'

/** Both tables with their seats. Used by the minimap (read-only) and the seating overlay (onPick). */
export function Tables({ size, selected, onPick }: { size: 'small' | 'large'; selected?: number | null; onPick?: (seat: number) => void }) {
  const s = useGame()
  return (
    <div className={`tables ${size}`}>
      {[0, 1].map((table) => (
        <div key={table} className="table">
          <div className="table-label">{t(table === 0 ? 'table1' : 'table2')}</div>
          <div className="seats">
            {[0, 1, 2, 3].map((n) => {
              const seat = table * 4 + n
              const id = s.seats[seat]
              return (
                <div
                  key={seat}
                  className={`seat ${id ? 'taken' : onPick ? 'free' : ''} ${selected === seat ? 'selected' : ''}`}
                  title={id ? `${guestName(id, s)} – ${guestFaction(id, s)}` : undefined}
                  onClick={() => !id && onPick?.(seat)}
                >
                  {id && <img src={guestById(id).portrait} alt="" />}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
