import { kingdomById, scrollById } from '../content'
import { actions, useGame } from '../store/gameStore'
import { CloseX, Icons, toneStyle } from './IconBadge'

export function ScrollReader({ scrollId }: { scrollId: string }) {
  const hidden = useGame((s) => s.hiddenArticles)
  const scroll = scrollById(scrollId)
  const kingdom = kingdomById(scroll.kingdom)
  const close = () => actions.openReader(null)
  return (
    <div className="backdrop" onClick={close}>
      <div className="reader toned" style={toneStyle(kingdom.color)} onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={close} />
        <div className="reader-kingdom"><Icons icons={[kingdom.icon]} /> {kingdom.name}</div>
        <h2>{scroll.title}</h2>
        {scroll.articles.map((a, ai) => hidden.includes(`${scrollId}#${ai}`) ? null : (
          <article key={ai}>
            <h3>{a.headline}</h3>
            {a.paragraphs.map((p, pi) => (
              <p key={pi}>
                {p.map((seg, si) => seg.cut ? (
                  <span
                    key={seg.id ?? si}
                    className="cut"
                    onClick={() => actions.addCutout(seg.text, { type: 'scroll', kingdom: scroll.kingdom }, { topic: seg.topic, claim: seg.claim })}
                  >
                    {seg.text}
                  </span>
                ) : (
                  <span key={si}>{seg.text}</span>
                ))}
              </p>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}
