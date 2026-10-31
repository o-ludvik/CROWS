import { useEffect } from 'react'
import { t } from './content'
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
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') actions.toggleDebug()
      // Dev-only exception to "mouse only": jump to the start of day N while the debug panel is open.
      else if (import.meta.env.DEV && useGame.getState().debugOpen && /^Digit[1-9]$/.test(e.code)) actions.debugJump(Number(e.code.slice(5)))
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <Stage>
      {phase === 'title' && <TitleScreen />}
      {(phase === 'desk' || phase === 'conversation' || phase === 'seating' || phase === 'dayEnd') && <PubScreen />}
      {phase === 'night' && <NightScreen />}
      {phase === 'summary' && <SummaryScreen />}
      {!debugOpen && <div className="debug-hint">{t('debugHint')}</div>}
      <div className={`fade ${fading ? 'on' : ''}`} />
      {debugOpen && <DebugPanel />}
    </Stage>
  )
}
