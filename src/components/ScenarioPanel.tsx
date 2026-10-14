import type { Ref } from 'react'
import type { Scenario } from '../content/types'
import { Icon, type IconName } from './Icon'

type ScenarioPanelProps = {
  scenario: Scenario
  /** "Scenario 3 of 10" during the deck; null while replaying a card from the summary. */
  progress: { current: number; total: number; done: number } | null
  headingRef: Ref<HTMLHeadingElement>
  onBackToSummary: () => void
}

const clueRows: Array<{ key: keyof Scenario['clues']; label: string; icon: IconName }> = [
  { key: 'aim', label: 'Research aim', icon: 'aim' },
  { key: 'outcome', label: 'Outcome', icon: 'outcome' },
  { key: 'predictorOrGroups', label: 'Predictor or groups', icon: 'groups' },
  { key: 'observations', label: 'Observations', icon: 'observations' },
]

export function ScenarioPanel({ scenario, progress, headingRef, onBackToSummary }: ScenarioPanelProps) {
  return (
    <div className="scenario-area">
      <article className="card scenario-card" aria-labelledby="scenario-title">
        <div className="card-header">
          {progress ? (
            <>
              <span>
                Scenario {progress.current} of {progress.total}
              </span>
              <progress className="round-progress" max={progress.total} value={progress.done} aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Replaying a scenario</span>
              <button type="button" className="btn btn-link btn-sm" onClick={onBackToSummary}>
                Back to summary
              </button>
            </>
          )}
        </div>
        <div className="card-body">
          <h2 id="scenario-title" className="scenario-title" ref={headingRef} tabIndex={-1}>
            {scenario.title}
          </h2>
          <p className="scenario-prompt">{scenario.prompt}</p>
          <div className="callout">
            <p className="callout-title">
              <Icon name="question" />
              Research question
            </p>
            <p className="callout-text">{scenario.question}</p>
          </div>
        </div>
      </article>

      <section className="clues" aria-labelledby="clues-title">
        <h3 id="clues-title" className="section-title">
          What we know
        </h3>
        <dl className="value-box-grid">
          {clueRows.map((row) => (
            <div className="value-box" key={row.key}>
              <div className="value-box-showcase">
                <Icon name={row.icon} />
              </div>
              <div className="value-box-area">
                <dt className="value-box-title">{row.label}</dt>
                <dd className="value-box-value">{scenario.clues[row.key]}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
