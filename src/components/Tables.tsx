import { guestById, t } from '../content'
import { guestFaction, guestName, useGame } from '../store/gameStore'

/** Both tables with their seats; tables beyond today's count show as locked (GDD 10). Used by the minimap (read-only) and the seating overlay (onPick). */
export function Tables({ size, selected, onPick }: { size: 'small' | 'large'; selected?: number | null; onPick?: (seat: number) => void }) {
  const s = useGame()
  return (
    <div className={`tables ${size}`}>
      {[0, 1].map((table) => (
        <div key={table} className={`table ${table < s.tableCount ? '' : 'locked'}`}>
          <div className="table-label">
            {t(table === 0 ? 'table1' : 'table2')}
            {table >= s.tableCount && ` – ${t('tableLocked')}`}
          </div>
          <div className="seats">
            {[0, 1, 2, 3].map((n) => {
              const seat = table * 4 + n
              const id = s.seats[seat]
              const open = table < s.tableCount
              return (
                <div
                  key={seat}
                  className={`seat ${id ? 'taken' : onPick && open ? 'free' : ''} ${selected === seat ? 'selected' : ''}`}
                  title={id ? `${guestName(id, s)} – ${guestFaction(id, s)}` : undefined}
                  onClick={() => !id && open && onPick?.(seat)}
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
