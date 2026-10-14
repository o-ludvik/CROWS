import { getScale } from './Stage'

/** Pointer position in stage coordinates (1920×1080). */
export function stagePoint(e: { clientX: number; clientY: number }) {
  const rect = document.querySelector('.stage')!.getBoundingClientRect()
  const scale = getScale()
  return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale }
}
