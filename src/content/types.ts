/** Stable identifiers for the answer choices. Scoring always uses these, never the display labels. */
export type MethodId =
  | 'independent-t'
  | 'paired-t'
  | 'one-way-anova'
  | 'pearson-correlation'
  | 'simple-linear-regression'
  | 'chi-square-independence'
  | 'binary-logistic-regression'
  | 'none-fits'

export type Method = {
  id: MethodId
  label: string
  /** The introductory question this method answers. */
  question: string
  /** The cue that distinguishes it from the other methods. */
  cue: string
  /** One useful condition to check before using it on real data. */
  check: string
}

export type Scenario = {
  id: string
  title: string
  /** The study description: design, sample, and what was measured. */
  prompt: string
  /** The precise research question the learner matches a method to. */
  question: string
  /** Facts already stated in the story, laid out so they can be inspected. They must not reveal the answer. */
  clues: {
    aim: string
    outcome: string
    predictorOrGroups: string
    observations: string
  }
  bestMethodId: MethodId
  /** Methods that also answer the stated question. Choosing one counts as a successful match. */
  alsoDefensible: Array<{ methodId: MethodId; explanation: string }>
  /** Why the best method fits, in two or three sentences built from the case details. */
  explanation: string
  decisiveClue: string
  likelyConfusion: string
  /** The "Before using this with real data" note. */
  conditionToCheck: string
  /** Optional caution about interpretation, for example association versus causation. */
  designNote?: string
  /** A case-specific hint for every method that is neither the best fit nor also defensible. */
  reconsider: Partial<Record<MethodId, string>>
}
