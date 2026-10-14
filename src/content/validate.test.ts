import { describe, expect, it } from 'vitest'
import { methods } from './methods'
import { scenarios } from './scenarios'
import type { Scenario } from './types'
import { validateContent } from './validate'

describe('authored content', () => {
  it('passes the startup checks', () => {
    expect(validateContent(methods, scenarios)).toEqual([])
  })

  it('has the eight MVP answer choices and ten cards', () => {
    expect(methods.map((m) => m.id)).toEqual([
      'independent-t',
      'paired-t',
      'one-way-anova',
      'pearson-correlation',
      'simple-linear-regression',
      'chi-square-independence',
      'binary-logistic-regression',
      'none-fits',
    ])
    expect(scenarios).toHaveLength(10)
  })

  it('reuses methods across cards, so there is no elimination trick', () => {
    const counts = new Map<string, number>()
    for (const s of scenarios) counts.set(s.bestMethodId, (counts.get(s.bestMethodId) ?? 0) + 1)
    expect([...counts.values()].some((n) => n > 1)).toBe(true)
  })
})

describe('validateContent', () => {
  const base = scenarios[0]
  const check = (overrides: Partial<Scenario>) => validateContent(methods, [{ ...base, ...overrides }])

  it('reports an unknown best method', () => {
    expect(check({ bestMethodId: 'mann-whitney' as never })).toContain(
      'Scenario "01" names an unknown best method "mann-whitney".',
    )
  })

  it('reports a best method that is also listed as defensible', () => {
    const errors = check({
      alsoDefensible: [...base.alsoDefensible, { methodId: base.bestMethodId, explanation: 'Same thing.' }],
    })
    expect(errors).toContain('Scenario "01" lists its best method "independent-t" as also defensible.')
  })

  it('reports a missing reconsider hint', () => {
    const { 'paired-t': _removed, ...rest } = base.reconsider
    expect(check({ reconsider: rest })).toContain('Scenario "01" has no reconsider hint for "paired-t".')
  })

  it('reports a reconsider hint for a method the card accepts', () => {
    const errors = check({ reconsider: { ...base.reconsider, 'independent-t': 'Try again.' } })
    expect(errors).toContain('Scenario "01" has a reconsider hint for "independent-t", which it also accepts.')
  })

  it('reports duplicate scenario IDs and empty text', () => {
    const errors = validateContent(methods, [base, { ...base, title: ' ' }])
    expect(errors).toContain('Scenario "01" is defined more than once.')
    expect(errors).toContain('Scenario "01" has an empty title.')
  })
})
