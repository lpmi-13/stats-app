import type { Method } from './types'

/**
 * The learner-facing method palette. The order here is the order of the answer
 * buttons, and it stays fixed on every card so learners can find choices by position.
 */
export const methods: Method[] = [
  {
    id: 'independent-t',
    label: 'Independent-samples t-test',
    question: 'Do two independent groups differ in mean continuous outcome?',
    cue: 'Different people or objects in each of two groups, with one numeric outcome each.',
    check: 'Independence, and whether the outcome’s distribution (skew, outliers) supports a t procedure.',
  },
  {
    id: 'paired-t',
    label: 'Paired t-test',
    question: 'Is the mean within-pair difference different from zero?',
    cue: 'Two measurements on the same unit, or deliberately matched pairs.',
    check: 'Inspect the distribution of the paired differences.',
  },
  {
    id: 'one-way-anova',
    label: 'One-way ANOVA',
    question: 'Do mean continuous outcomes differ among three or more independent groups?',
    cue: 'One categorical grouping variable with at least three levels.',
    check: 'Independence, and residual behavior: similar spread within groups and no extreme outliers.',
  },
  {
    id: 'pearson-correlation',
    label: 'Pearson correlation',
    question:
      'What is the direction and strength of a linear association between two quantitative variables?',
    cue: 'A descriptive, symmetric association question in which neither variable is singled out as the response.',
    check: 'Inspect a scatterplot for nonlinearity and outliers.',
  },
  {
    id: 'simple-linear-regression',
    label: 'Simple linear regression',
    question: 'How does the expected continuous outcome change with one predictor?',
    cue: 'A named response and one predictor, with the slope as the target.',
    check: 'Inspect the relationship and the model residuals.',
  },
  {
    id: 'chi-square-independence',
    label: 'Chi-square test of independence',
    question: 'Are two categorical variables associated in a contingency table?',
    cue: 'Counts in categories, with no adjusted model requested.',
    check: 'Independent observations, each counted once, and adequate expected cell counts.',
  },
  {
    id: 'binary-logistic-regression',
    label: 'Binary logistic regression',
    question: 'How do predictor values relate to the odds of a yes/no outcome?',
    cue: 'A binary response, possibly with several predictors or an adjustment.',
    check: 'Model fit, and whether observations are independent.',
  },
  {
    id: 'none-fits',
    label: 'No listed method fits',
    question: 'Is the question outside this introductory palette?',
    cue: 'An open-ended thematic question, for example, needs a qualitative analysis plan.',
    check: 'Do not force a numeric test onto a question with no numeric outcome or counts.',
  },
]
