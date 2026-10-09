import { kingdomById, scrolls, t } from '../content'
import { actions } from '../store/gameStore'

export function ScrollReader({ scrollId }: { scrollId: string }) {
  const scroll = scrolls.find((s) => s.id === scrollId)!
  const close = () => actions.openReader(null)
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader" onClick={(e) => e.stopPropagation()}>
        <div className="reader-kingdom">{kingdomById(scroll.kingdom).name}</div>
        <h2>{scroll.title}</h2>
        {scroll.articles.map((a, ai) => (
          <article key={ai}>
            <h3>{a.headline}</h3>
            {a.paragraphs.map((p, pi) => (
              <p key={pi}>
                {p.map((seg, si) =>
                  seg.cut ? (
                    <span key={seg.id ?? si} className="cut" onClick={() => actions.addCutout(seg.text, { type: 'scroll', kingdom: scroll.kingdom })}>
                      {seg.text}
                    </span>
                  ) : (
                    <span key={si}>{seg.text}</span>
                  ),
                )}
              </p>
            ))}
          </article>
        ))}
        <button className="btn" onClick={close}>{t('close')}</button>
      </div>
    </div>
  )
}
