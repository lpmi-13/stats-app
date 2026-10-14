const INTRO_SEEN_KEY = 'method-match:intro-seen'

// The only thing kept between visits is whether the introduction has been seen.
// Storage can be blocked or throw (private windows, strict settings), so reads and writes fail quietly.
export function hasSeenIntro(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen(): void {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // Not remembering the preference is harmless.
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Move keyboard and screen reader focus to an element and bring it into view. */
export function focusAndReveal(element: HTMLElement | null): void {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView?.({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
