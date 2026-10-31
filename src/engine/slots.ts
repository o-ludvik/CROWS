// Cutout reply slots (GDD 7.5). Pure, so the node checks can run it.

export interface SlotTag { topic: string; claim: string }
export interface InkChoice { index: number; text: string; slot?: SlotTag }

/** Ink choices → engine choices; a `#slot:<topic>:<claim>` tag on the choice makes it a slot option. */
export function parseChoices(choices: { text: string; tags?: string[] | null }[]): InkChoice[] {
  return choices.map((c, index) => {
    const tag = (c.tags ?? []).map((t) => t.trim().split(':')).find((p) => p[0] === 'slot')
    return tag ? { index, text: c.text, slot: { topic: tag[1], claim: tag[2] } } : { index, text: c.text }
  })
}

/** Topics that currently have a slot bubble, in choice order. */
export const slotTopics = (choices: InkChoice[]) => [...new Set(choices.flatMap((c) => (c.slot ? [c.slot.topic] : [])))]

/** Which choice a dropped cutout selects: same claim, else the `*` option, else null (rejected). */
export function pickSlot(choices: InkChoice[], topic: string, cutout: { topic?: string; claim?: string }): InkChoice | null {
  if (cutout.topic !== topic) return null
  const group = choices.filter((c) => c.slot?.topic === topic)
  return group.find((c) => c.slot!.claim === cutout.claim) ?? group.find((c) => c.slot!.claim === '*') ?? null
}
