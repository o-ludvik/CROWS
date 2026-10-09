import { t } from '../content'
import { actions } from '../store/gameStore'

export function TitleScreen() {
  return (
    <div className="screen" style={{ backgroundImage: 'url(art/title_bg.png)' }}>
      <h1 className="title">{t('title')}</h1>
      <button className="btn title-start" onClick={actions.start}>{t('start')}</button>
    </div>
  )
}
