import type { Verdict } from '../round/round'
import type { IconName } from './Icon'

/** Status is always shown as icon plus text, never color alone. */
export const verdictText: Record<Verdict, { label: string; icon: IconName }> = {
  best: { label: 'Best fit', icon: 'best' },
  defensible: { label: 'Also defensible', icon: 'defensible' },
  reconsider: { label: 'Reconsider', icon: 'reconsider' },
}
