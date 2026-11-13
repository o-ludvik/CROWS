import { useState } from 'react'
import { chronicle, guestById, guests, t } from '../content'
import { actions, readChronicle, saveInfo, useGame, type SaveSlot } from '../store/gameStore'
import { CloseX } from './IconBadge'
import { CharacterLog } from './CharacterLog'

const SLOTS: [SaveSlot, 'slotAuto' | 'slotManual'][] = [['auto', 'slotAuto'], ['manual', 'slotManual']]

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  const close = () => actions.openOverlay(null)
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader menu-panel" onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={close} />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

function InGameMenu() {
  const [saved, setSaved] = useState(false)
  return (
    <Panel title={t('menu')}>
      <button className="btn" onClick={() => { actions.save(); setSaved(true) }}>{t('saveGame')}</button>
      {saved && <p>{t('saved')}</p>}
      <button className="btn" onClick={() => actions.openOverlay('load')}>{t('loadGame')}</button>
      <button className="btn" onClick={() => actions.openOverlay('settings')}>{t('settings')}</button>
    </Panel>
  )
}

function LoadMenu() {
  return (
    <Panel title={t('loadGame')}>
      {SLOTS.map(([slot, label]) => {
        const info = saveInfo(slot)
        return (
          <button key={slot} className="btn" disabled={!info} onClick={() => actions.load(slot)}>
            {t(label)}: {info ? t('saveDay', { n: info.day, time: new Date(info.savedAt).toLocaleString('cs-CZ') }) : t('slotEmpty')}
          </button>
        )
      })}
    </Panel>
  )
}

function Settings() {
  const toggle = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})
  return (
    <Panel title={t('settings')}>
      <button className="btn" onClick={toggle}>{t('fullscreen')}</button>
    </Panel>
  )
}

/** Title-screen chronicle: achievements, characters met and endings across all playthroughs. */
function ChronicleView() {
  const c = readChronicle()
  return (
    <Panel title={t('chronicle')}>
      <h3>{t('achievements')}</h3>
      {chronicle.achievements.map((a) => (
        <p key={a.id} className={c.achievements.includes(a.id) ? '' : 'muted'}>
          <b>{c.achievements.includes(a.id) ? a.name : t('unknown')}</b> – {a.description}
        </p>
      ))}
      <h3>{t('charactersMet')}</h3>
      <div className="chronicle-guests">
        {guests.map((g) => g.id in c.met ? (
          <div key={g.id}><img src={guestById(g.id).portrait} alt="" /><div>{c.met[g.id] ? g.name : t('unknown')}</div></div>
        ) : (
          <div key={g.id} className="muted"><div className="chronicle-unknown">?</div><div>{t('unknown')}</div></div>
        ))}
      </div>
      <h3>{t('endings')}</h3>
      {chronicle.endings.map((e) => <p key={e.id} className={c.endings.includes(e.id) ? '' : 'muted'}>{c.endings.includes(e.id) ? e.name : t('unknown')}</p>)}
    </Panel>
  )
}

/** Whichever menu-type overlay is open. */
export function Menus() {
  const overlay = useGame((s) => s.overlay)
  if (overlay === 'menu') return <InGameMenu />
  if (overlay === 'load') return <LoadMenu />
  if (overlay === 'settings') return <Settings />
  if (overlay === 'chronicle') return <ChronicleView />
  if (overlay === 'log') return <CharacterLog />
  return null
}
