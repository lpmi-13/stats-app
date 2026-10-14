import { describe, expect, it } from 'vitest'
import { scenariosById } from '../content'
import type { MethodId } from '../content/types'
import {
  canTryAgain,
  createRound,
  isResolved,
  judge,
  roundReducer,
  shuffle,
  summarizeRound,
  type RoundAction,
  type RoundState,
} from './round'

const card = (id: string) => scenariosById.get(id)!

function run(state: RoundState, ...actions: RoundAction[]) {
  return actions.reduce(roundReducer, state)
}

/** Select a method and check it against the current card. */
function answer(state: RoundState, methodId: MethodId) {
  return run(state, { type: 'select', methodId }, { type: 'check', scenario: card(state.play.scenarioId) })
}

describe('judge', () => {
  it('distinguishes best fit, also defensible, and reconsider', () => {
    expect(judge(card('04'), 'pearson-correlation')).toBe('best')
    expect(judge(card('04'), 'simple-linear-regression')).toBe('defensible')
    expect(judge(card('04'), 'chi-square-independence')).toBe('reconsider')
  })
})

describe('roundReducer', () => {
  it('lets the learner change their selection before checking', () => {
    const state = run(
      createRound(['02']),
      { type: 'select', methodId: 'independent-t' },
      { type: 'select', methodId: 'paired-t' },
      { type: 'check', scenario: card('02') },
    )
    expect(state.play.attempts).toEqual([{ methodId: 'paired-t', verdict: 'best' }])
    expect(state.records['02']).toEqual({ attempts: state.play.attempts, resolution: 'matched' })
  })

  it('ignores a check with no selection', () => {
    const state = createRound(['02'])
    expect(roundReducer(state, { type: 'check', scenario: card('02') })).toBe(state)
  })

  it('locks the selection while feedback is showing', () => {
    const state = answer(createRound(['02']), 'pearson-correlation')
    expect(run(state, { type: 'select', methodId: 'paired-t' }).play.selection).toBe('pearson-correlation')
  })

  it('allows one retry after Reconsider, then records a second-attempt match', () => {
    let state = answer(createRound(['02', '03']), 'independent-t')
    expect(state.play.stage).toBe('feedback')
    expect(canTryAgain(state.play)).toBe(true)
    expect(run(state, { type: 'next' })).toBe(state)

    state = run(state, { type: 'tryAgain' })
    expect(state.play).toMatchObject({ stage: 'choosing', selection: null })

    state = answer(state, 'paired-t')
    expect(isResolved(state.play)).toBe(true)
    expect(state.records['02'].resolution).toBe('matched')
    expect(state.records['02'].attempts.map((a) => a.verdict)).toEqual(['reconsider', 'best'])
  })

  it('refuses to re-check a method already marked Reconsider', () => {
    let state = answer(createRound(['02']), 'independent-t')
    state = run(state, { type: 'tryAgain' })
    const before = run(state, { type: 'select', methodId: 'independent-t' })
    expect(run(before, { type: 'check', scenario: card('02') })).toBe(before)
  })

  it('reveals the best fit after a second Reconsider so no one gets stuck', () => {
    let state = answer(createRound(['02']), 'independent-t')
    state = answer(run(state, { type: 'tryAgain' }), 'pearson-correlation')
    expect(isResolved(state.play)).toBe(true)
    expect(canTryAgain(state.play)).toBe(false)
    expect(state.records['02'].resolution).toBe('revealed')
  })

  it('treats an also-defensible choice as a successful first-attempt match', () => {
    const state = answer(createRound(['04']), 'simple-linear-regression')
    expect(isResolved(state.play)).toBe(true)
    expect(state.records['04'].resolution).toBe('matched')
  })

  it('moves through the deck and ends on the summary', () => {
    let state = answer(createRound(['01', '08']), 'independent-t')
    state = run(state, { type: 'next' })
    expect(state).toMatchObject({ position: 1, view: 'deck', play: { scenarioId: '08', attempts: [] } })
    // The same method is accepted again on a later card.
    state = run(answer(state, 'independent-t'), { type: 'next' })
    expect(state.view).toBe('summary')
  })

  it('replays a card without changing the round record', () => {
    let state = answer(createRound(['02']), 'independent-t')
    state = run(answer(run(state, { type: 'tryAgain' }), 'paired-t'), { type: 'next' })
    const recorded = state.records

    state = run(state, { type: 'replay', scenarioId: '02' })
    expect(state).toMatchObject({ view: 'replay', play: { scenarioId: '02', attempts: [] } })
    state = run(answer(state, 'paired-t'), { type: 'next' })
    expect(state.view).toBe('replay')
    state = run(state, { type: 'backToSummary' })
    expect(state.view).toBe('summary')
    expect(state.records).toBe(recorded)
  })

  it('starts a fresh round with a new deck', () => {
    const state = run(answer(createRound(['01', '02']), 'independent-t'), { type: 'newRound', deck: ['02', '01'] })
    expect(state).toEqual(createRound(['02', '01']))
  })
})

describe('summarizeRound', () => {
  it('counts first-attempt understanding and groups methods to revisit', () => {
    let state = createRound(['02', '04', '09', '05'])
    state = run(answer(state, 'paired-t'), { type: 'next' })
    state = run(answer(state, 'simple-linear-regression'), { type: 'next' }) // also defensible
    state = answer(state, 'one-way-anova')
    state = run(answer(run(state, { type: 'tryAgain' }), 'pearson-correlation'), { type: 'next' }) // revealed
    state = answer(state, 'pearson-correlation')
    state = run(answer(run(state, { type: 'tryAgain' }), 'simple-linear-regression'), { type: 'next' })

    expect(summarizeRound(state, scenariosById)).toEqual({
      completed: 4,
      understoodFirstTime: 2,
      revisit: [
        {
          methodId: 'simple-linear-regression',
          cards: [
            { scenarioId: '09', firstChoice: 'one-way-anova' },
            { scenarioId: '05', firstChoice: 'pearson-correlation' },
          ],
        },
      ],
    })
  })
})

describe('shuffle', () => {
  it('returns a permutation without changing the input', () => {
    const input = ['a', 'b', 'c', 'd']
    const output = shuffle(input, () => 0)
    expect(output).toEqual(['b', 'c', 'd', 'a'])
    expect(input).toEqual(['a', 'b', 'c', 'd'])
  })
})
