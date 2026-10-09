import { currentGuestId, liveInkVars, useGame } from '../store/gameStore'

/** Read-only state dump, toggled with the key under Esc. */
export function DebugPanel() {
  const s = useGame()
  const dump = {
    phase: s.phase,
    todayGuests: s.todayGuests,
    currentGuest: currentGuestId(),
    meters: s.meters,
    revealed: s.revealed,
    seats: s.seats,
    nightAssignments: s.nightAssignments,
    inkTags: s.inkTags,
    currentInkVars: liveInkVars(),
    inkVarSnapshots: s.inkVars,
    eventLog: s.eventLog.slice(-20).map((e) => `#${e.seq} ${e.source}: ${e.description}`),
  }
  const { eventLog, ...rest } = dump
  const text = Object.entries(rest).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')
  return <pre className="debug">{`${text}\n\neventLog:\n${eventLog.join('\n')}`}</pre>
}
