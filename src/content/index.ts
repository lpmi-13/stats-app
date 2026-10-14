import { methods } from './methods'
import { scenarios } from './scenarios'
import type { Method, MethodId, Scenario } from './types'
import { validateContent } from './validate'

export { methods, scenarios }
export type { Method, MethodId, Scenario }

export const methodsById: ReadonlyMap<MethodId, Method> = new Map(methods.map((m) => [m.id, m]))
export const scenariosById: ReadonlyMap<string, Scenario> = new Map(scenarios.map((s) => [s.id, s]))

export const contentErrors = validateContent(methods, scenarios)

export function methodLabel(id: MethodId): string {
  return methodsById.get(id)?.label ?? id
}
