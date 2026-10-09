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
  }
  const state = Object.entries(dump).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')
  const log = s.eventLog.slice(-20).map((e) => `#${e.seq} ${e.source} → ${e.description}`)
  return <pre className="debug">{`eventLog (affiliation changes):\n${log.join('\n') || '(empty)'}\n\n${state}`}</pre>
}
