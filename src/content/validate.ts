import type { Method, Scenario } from './types'

/**
 * Content-only checks run at startup. Returns a list of problems; an empty list means the deck is usable.
 * The types already catch most mistakes at build time, but reviewers may edit content
 * with casts or loosened types, so the rules are enforced again at runtime.
 */
export function validateContent(methods: readonly Method[], scenarios: readonly Scenario[]): string[] {
  const errors: string[] = []
  const methodIds = new Set<string>()

  for (const method of methods) {
    if (methodIds.has(method.id)) errors.push(`Method "${method.id}" is defined more than once.`)
    methodIds.add(method.id)
    for (const field of ['label', 'question', 'cue', 'check'] as const) {
      if (!method[field]?.trim()) errors.push(`Method "${method.id}" has an empty ${field}.`)
    }
  }

  if (scenarios.length === 0) errors.push('The deck has no scenarios.')

  const scenarioIds = new Set<string>()
  for (const scenario of scenarios) {
    const where = `Scenario "${scenario.id}"`
    if (scenarioIds.has(scenario.id)) errors.push(`${where} is defined more than once.`)
    scenarioIds.add(scenario.id)

    const text: Array<[string, string | undefined]> = [
      ['title', scenario.title],
      ['prompt', scenario.prompt],
      ['question', scenario.question],
      ['clues.aim', scenario.clues?.aim],
      ['clues.outcome', scenario.clues?.outcome],
      ['clues.predictorOrGroups', scenario.clues?.predictorOrGroups],
      ['clues.observations', scenario.clues?.observations],
      ['explanation', scenario.explanation],
      ['decisiveClue', scenario.decisiveClue],
      ['likelyConfusion', scenario.likelyConfusion],
      ['conditionToCheck', scenario.conditionToCheck],
    ]
    for (const [field, value] of text) {
      if (!value?.trim()) errors.push(`${where} has an empty ${field}.`)
    }

    if (!methodIds.has(scenario.bestMethodId)) {
      errors.push(`${where} names an unknown best method "${scenario.bestMethodId}".`)
    }

    const defensible = new Set<string>()
    for (const alt of scenario.alsoDefensible) {
      if (!methodIds.has(alt.methodId)) {
        errors.push(`${where} lists an unknown also-defensible method "${alt.methodId}".`)
      }
      if (alt.methodId === scenario.bestMethodId) {
        errors.push(`${where} lists its best method "${alt.methodId}" as also defensible.`)
      }
      if (defensible.has(alt.methodId)) {
        errors.push(`${where} lists "${alt.methodId}" as also defensible more than once.`)
      }
      if (!alt.explanation?.trim()) {
        errors.push(`${where} has no explanation for also-defensible method "${alt.methodId}".`)
      }
      defensible.add(alt.methodId)
    }

    for (const [methodId, hint] of Object.entries(scenario.reconsider)) {
      if (!methodIds.has(methodId)) {
        errors.push(`${where} has a reconsider hint for unknown method "${methodId}".`)
      } else if (methodId === scenario.bestMethodId || defensible.has(methodId)) {
        errors.push(`${where} has a reconsider hint for "${methodId}", which it also accepts.`)
      }
      if (!hint?.trim()) errors.push(`${where} has an empty reconsider hint for "${methodId}".`)
    }

    // Every choice a learner can make must lead to authored, case-specific feedback.
    for (const methodId of methodIds) {
      if (methodId === scenario.bestMethodId || defensible.has(methodId)) continue
      if (!(methodId in scenario.reconsider)) {
        errors.push(`${where} has no reconsider hint for "${methodId}".`)
      }
    }
  }

  return errors
}
