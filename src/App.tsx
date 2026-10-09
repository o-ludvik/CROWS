import { useEffect } from 'react'
import { Stage } from './components/Stage'
import { DebugPanel } from './components/DebugPanel'
import { TitleScreen } from './screens/TitleScreen'
import { PubScreen } from './screens/PubScreen'
import { NightScreen } from './screens/NightScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { actions, useGame } from './store/gameStore'

export default function App() {
  const phase = useGame((s) => s.phase)
  const fading = useGame((s) => s.fading)
  const debugOpen = useGame((s) => s.debugOpen)

  useEffect(() => {
    // Backquote = the physical key under Esc, on any layout (including Czech).
    const onKey = (e: KeyboardEvent) => e.code === 'Backquote' && actions.toggleDebug()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <Stage>
      {phase === 'title' && <TitleScreen />}
      {(phase === 'desk' || phase === 'conversation' || phase === 'seating') && <PubScreen />}
      {phase === 'night' && <NightScreen />}
      {phase === 'summary' && <SummaryScreen />}
      <div className={`fade ${fading ? 'on' : ''}`} />
      {debugOpen && <DebugPanel />}
    </Stage>
  )
}
