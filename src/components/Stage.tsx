import { useEffect, useState, type ReactNode } from 'react'

const W = 1920
const H = 1080
const fit = () => (currentScale = Math.min(innerWidth / W, innerHeight / H))
let currentScale = 1
/** Current stage scale; divide screen-space pointer deltas by this to get stage coordinates. */
export const getScale = () => currentScale

export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(fit)
  useEffect(() => {
    const onResize = () => setScale(fit())
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])
  return (
    <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      {children}
    </div>
  )
}
