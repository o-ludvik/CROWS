import { currentGuestId, liveInkVars, useGame } from '../store/gameStore'

/** Read-only state dump, toggled with the key under Esc. In dev builds, keys 1–3 jump to that day (GDD 13.3). */
export function DebugPanel() {
  const s = useGame()
  const dump = {
    phase: s.phase,
    day: s.day,
    tables: s.tableCount,
    view: s.view,
    queue: s.queue.map((v) => `${v.guest}:${v.knot}`),
    lounge: s.loungeGuests.map((v) => `${v.guest}:${v.knot}`),
    invitedFromLounge: s.invitedFromLounge,
    leftLounge: s.leftLounge,
    currentGuest: s.current && `${currentGuestId()}:${s.current.knot}`,
    pausedConversation: s.paused && `${s.paused.visit.guest}:${s.paused.visit.knot}`,
    todayGuests: s.todayGuests,
    meters: s.meters,
    revealed: Object.fromEntries(Object.entries(s.revealed).filter(([, r]) => r.name || r.faction)),
    seats: s.seats,
    nightAssignments: s.nightAssignments,
    nightHistory: Object.fromEntries(Object.entries(s.history).map(([d, r]) => [d, r.night])),
    usedClaims: s.usedClaims.slice(-5).map((u) => `d${u.day} ${u.guestId}: ${u.topic}=${u.claim}`),
    inkTags: s.inkTags,
    currentInkVars: liveInkVars(),
    inkVarSnapshots: s.inkVars,
  }
  const state = Object.entries(dump).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')
  const log = s.eventLog.slice(-20).map((e) => `#${e.seq} ${e.source} → ${e.description}`)
  const jump = import.meta.env.DEV ? 'DEV: 1/2/3 = skok na začátek dne\n\n' : ''
  return <pre className="debug">{`${jump}eventLog:\n${log.join('\n') || '(empty)'}\n\n${state}`}</pre>
}
