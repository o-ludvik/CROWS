import { t } from '../content'
import { actions, saveInfo } from '../store/gameStore'

export function TitleScreen() {
  const canLoad = !!(saveInfo('auto') || saveInfo('manual'))
  return (
    <div className="screen" style={{ backgroundImage: 'url(art/title_bg.png)' }}>
      <h1 className="title">{t('title')}</h1>
      <div className="title-menu">
        <button className="btn" onClick={actions.start}>{t('newGame')}</button>
        <button className="btn" disabled={!canLoad} onClick={() => actions.openOverlay('load')}>{t('loadGame')}</button>
        <button className="btn" onClick={() => actions.openOverlay('chronicle')}>{t('chronicle')}</button>
        <button className="btn" onClick={() => actions.openOverlay('settings')}>{t('settings')}</button>
      </div>
    </div>
  )
}
