import type { Ref } from 'react'
import { methodLabel, methods, methodsById, scenariosById } from '../content'
import { understoodFirstTime, type RoundState, type RoundSummary as Summary } from '../round/round'
import { Icon, type IconName } from './Icon'
import { MethodGlyph } from './MethodGlyph'
import { TabsCard } from './TabsCard'
import { verdictText } from './verdicts'

type RoundSummaryProps = {
  state: RoundState
  summary: Summary
  headingRef: Ref<HTMLHeadingElement>
  onReplay: (scenarioId: string) => void
}

export function RoundSummary({ state, summary, headingRef, onReplay }: RoundSummaryProps) {
  const revisitCount = summary.revisit.length

  return (
    <div className="summary-area">
      <div className="summary-intro">
        <h2 className="summary-title" ref={headingRef} tabIndex={-1}>
          Round complete
        </h2>
        <p>
          You worked through {summary.completed} scenarios. Use the lists below to replay any card, or start a new
          round to reshuffle the deck.
        </p>
      </div>

      <div className="value-box-row">
        <StatBox theme="primary" icon="completed" title="Scenarios completed" value={summary.completed} />
        <StatBox theme="success" icon="firstTry" title="Understood on the first attempt" value={summary.understoodFirstTime} />
        <StatBox theme="warning" icon="reconsider" title="Methods to revisit" value={revisitCount} />
      </div>

      <TabsCard
        label="Round review"
        tabs={[
          {
            id: 'revisit',
            label: (
              <>
                Methods to revisit <span className="badge badge-count">{revisitCount}</span>
              </>
            ),
            content: <RevisitList summary={summary} onReplay={onReplay} />,
          },
          { id: 'all', label: 'All scenarios', content: <AllScenarios state={state} onReplay={onReplay} /> },
          { id: 'map', label: 'Method map', content: <MethodMap /> },
        ]}
      />
    </div>
  )
}

function StatBox({ theme, icon, title, value }: { theme: string; icon: IconName; title: string; value: number }) {
  return (
    <div className={`value-box stat-box theme-${theme}`}>
      <div className="value-box-showcase">
        <Icon name={icon} />
      </div>
      <div className="value-box-area">
        <p className="value-box-title">{title}</p>
        <p className="value-box-value stat-value">{value}</p>
      </div>
    </div>
  )
}

function ReplayButton({ scenarioId, title, onReplay }: { scenarioId: string; title: string; onReplay: (id: string) => void }) {
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={() => onReplay(scenarioId)}>
      <Icon name="replay" />
      Replay<span className="visually-hidden"> {title}</span>
    </button>
  )
}

function RevisitList({ summary, onReplay }: { summary: Summary; onReplay: (id: string) => void }) {
  if (summary.revisit.length === 0) {
    return (
      <p className="empty-state">
        Every scenario was matched on the first attempt. Replay any card from All scenarios, or check the Method map to
        review the cues.
      </p>
    )
  }

  return (
    <div className="revisit-list">
      {summary.revisit.map((group) => {
        const method = methodsById.get(group.methodId)
        return (
          <section className="revisit-group" key={group.methodId} aria-labelledby={`revisit-${group.methodId}`}>
            <h3 className="revisit-title" id={`revisit-${group.methodId}`}>
              <MethodGlyph id={group.methodId} />
              {methodLabel(group.methodId)}
            </h3>
            {method && <p className="form-text">{method.cue}</p>}
            <ul className="revisit-cards">
              {group.cards.map((card) => {
                const scenario = scenariosById.get(card.scenarioId)
                const title = scenario?.title ?? card.scenarioId
                return (
                  <li key={card.scenarioId}>
                    <div>
                      <span className="revisit-card-title">{title}</span>
                      <span className="form-text">First choice: {methodLabel(card.firstChoice)}</span>
                    </div>
                    <ReplayButton scenarioId={card.scenarioId} title={title} onReplay={onReplay} />
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function AllScenarios({ state, onReplay }: { state: RoundState; onReplay: (id: string) => void }) {
  return (
    <table className="table results-table">
      <thead>
        <tr>
          <th scope="col">Scenario</th>
          <th scope="col">Best fit</th>
          <th scope="col">First attempt</th>
          <th scope="col">
            <span className="visually-hidden">Replay</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {state.deck.map((scenarioId) => {
          const scenario = scenariosById.get(scenarioId)
          const record = state.records[scenarioId]
          if (!scenario || !record) return null
          const first = record.attempts[0]
          const { label, icon } = verdictText[first.verdict]
          return (
            <tr key={scenarioId}>
              <th scope="row" data-label="Scenario">
                {scenario.title}
              </th>
              <td data-label="Best fit">{methodLabel(scenario.bestMethodId)}</td>
              <td data-label="First attempt">
                <span className={`badge verdict-badge verdict-${first.verdict}`}>
                  <Icon name={icon} />
                  {label}
                </span>
                {!understoodFirstTime(record) && (
                  <span className="form-text first-choice">You chose {methodLabel(first.methodId)}</span>
                )}
              </td>
              <td className="cell-action">
                <ReplayButton scenarioId={scenarioId} title={scenario.title} onReplay={onReplay} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MethodMap() {
  return (
    <>
      <p className="form-text method-map-intro">
        The key decision cues for each method in this deck. Every method still needs context and checks before you use
        it on real data.
      </p>
      <div className="method-map">
        {methods.map((method) => (
          <section className="method-map-item" key={method.id} aria-labelledby={`map-${method.id}`}>
            <h3 className="method-map-title" id={`map-${method.id}`}>
              <MethodGlyph id={method.id} />
              {method.label}
            </h3>
            <dl>
              <dt>Answers</dt>
              <dd>{method.question}</dd>
              <dt>Look for</dt>
              <dd>{method.cue}</dd>
              <dt>Check</dt>
              <dd>{method.check}</dd>
            </dl>
          </section>
        ))}
      </div>
    </>
  )
}
