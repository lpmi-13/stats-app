import type { MethodId, Scenario } from '../content/types'

export type Verdict = 'best' | 'defensible' | 'reconsider'

export type Attempt = { methodId: MethodId; verdict: Verdict }

/** After this many Reconsider results, the best fit is revealed so no one gets stuck on a card. */
export const MAX_ATTEMPTS = 2

/** The current interaction with one card. */
export type Play = {
  scenarioId: string
  attempts: Attempt[]
  selection: MethodId | null
  stage: 'choosing' | 'feedback'
}

/** What happened the first time a card was played in this round. Replays never change it. */
export type CardRecord = {
  attempts: Attempt[]
  resolution: 'matched' | 'revealed'
}

export type RoundState = {
  /** Scenario IDs in the order this round presents them. */
  deck: string[]
  position: number
  view: 'deck' | 'replay' | 'summary'
  play: Play
  records: Record<string, CardRecord>
}

export type RoundAction =
  | { type: 'select'; methodId: MethodId }
  | { type: 'check'; scenario: Scenario }
  | { type: 'tryAgain' }
  | { type: 'next' }
  | { type: 'replay'; scenarioId: string }
  | { type: 'backToSummary' }
  | { type: 'newRound'; deck: string[] }

export function judge(scenario: Scenario, methodId: MethodId): Verdict {
  if (methodId === scenario.bestMethodId) return 'best'
  if (scenario.alsoDefensible.some((alt) => alt.methodId === methodId)) return 'defensible'
  return 'reconsider'
}

export function isResolved(play: Play): boolean {
  const last = play.attempts.at(-1)
  if (!last) return false
  return last.verdict !== 'reconsider' || play.attempts.length >= MAX_ATTEMPTS
}

export function canTryAgain(play: Play): boolean {
  return play.stage === 'feedback' && !isResolved(play)
}

export function wasTried(play: Play, methodId: MethodId): boolean {
  return play.attempts.some((attempt) => attempt.methodId === methodId)
}

export function understoodFirstTime(record: CardRecord): boolean {
  return record.attempts[0]?.verdict !== 'reconsider'
}

/** Fisher–Yates shuffle. Returns a new array. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function freshPlay(scenarioId: string): Play {
  return { scenarioId, attempts: [], selection: null, stage: 'choosing' }
}

export function createRound(deck: string[]): RoundState {
  if (deck.length === 0) throw new Error('A round needs at least one scenario.')
  return { deck, position: 0, view: 'deck', play: freshPlay(deck[0]), records: {} }
}

export function roundReducer(state: RoundState, action: RoundAction): RoundState {
  const { play } = state

  switch (action.type) {
    case 'select':
      if (play.stage !== 'choosing' || state.view === 'summary') return state
      return { ...state, play: { ...play, selection: action.methodId } }

    case 'check': {
      if (play.stage !== 'choosing' || !play.selection) return state
      if (action.scenario.id !== play.scenarioId) return state
      // Re-checking a method already marked Reconsider would only burn the last attempt.
      if (wasTried(play, play.selection)) return state

      const attempt = { methodId: play.selection, verdict: judge(action.scenario, play.selection) }
      const nextPlay: Play = { ...play, attempts: [...play.attempts, attempt], stage: 'feedback' }

      const records =
        state.view === 'deck' && isResolved(nextPlay)
          ? {
              ...state.records,
              [play.scenarioId]: {
                attempts: nextPlay.attempts,
                resolution: attempt.verdict === 'reconsider' ? 'revealed' : 'matched',
              } satisfies CardRecord,
            }
          : state.records

      return { ...state, play: nextPlay, records }
    }

    case 'tryAgain':
      if (!canTryAgain(play)) return state
      return { ...state, play: { ...play, selection: null, stage: 'choosing' } }

    case 'next': {
      if (state.view !== 'deck' || !isResolved(play)) return state
      const position = state.position + 1
      if (position >= state.deck.length) return { ...state, view: 'summary' }
      return { ...state, position, play: freshPlay(state.deck[position]) }
    }

    case 'replay':
      if (state.view === 'deck' || !state.deck.includes(action.scenarioId)) return state
      return { ...state, view: 'replay', play: freshPlay(action.scenarioId) }

    case 'backToSummary':
      if (state.view !== 'replay') return state
      return { ...state, view: 'summary' }

    case 'newRound':
      return createRound(action.deck)
  }
}

export type RevisitGroup = {
  methodId: MethodId
  cards: Array<{ scenarioId: string; firstChoice: MethodId }>
}

export type RoundSummary = {
  completed: number
  understoodFirstTime: number
  /** Best-fit methods of the cards that were not understood on the first attempt, in deck order. */
  revisit: RevisitGroup[]
}

export function summarizeRound(state: RoundState, scenariosById: ReadonlyMap<string, Scenario>): RoundSummary {
  let completed = 0
  let firstTime = 0
  const groups = new Map<MethodId, RevisitGroup>()

  for (const scenarioId of state.deck) {
    const record = state.records[scenarioId]
    const scenario = scenariosById.get(scenarioId)
    if (!record || !scenario) continue
    completed++
    if (understoodFirstTime(record)) {
      firstTime++
      continue
    }
    const group = groups.get(scenario.bestMethodId) ?? { methodId: scenario.bestMethodId, cards: [] }
    group.cards.push({ scenarioId, firstChoice: record.attempts[0].methodId })
    groups.set(scenario.bestMethodId, group)
  }

  return { completed, understoodFirstTime: firstTime, revisit: [...groups.values()] }
}
