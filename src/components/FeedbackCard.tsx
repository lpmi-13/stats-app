import type { Ref } from 'react'
import { methodLabel } from '../content'
import type { MethodId, Scenario } from '../content/types'
import { isResolved, type Play } from '../round/round'
import { Icon, type IconName } from './Icon'
import { MethodGlyph } from './MethodGlyph'
import { verdictText } from './verdicts'

type FeedbackCardProps = {
  scenario: Scenario
  play: Play
  /** Label for the button that moves on once the card is resolved. */
  continueLabel: string
  headingRef: Ref<HTMLHeadingElement>
  onTryAgain: () => void
  onContinue: () => void
}

export function FeedbackCard({ scenario, play, continueLabel, headingRef, onTryAgain, onContinue }: FeedbackCardProps) {
  const last = play.attempts.at(-1)
  if (!last) return null

  const resolved = isResolved(play)
  const revealed = resolved && last.verdict === 'reconsider'
  const { label, icon } = verdictText[last.verdict]
  const chosenAlternative = scenario.alsoDefensible.find((alt) => alt.methodId === last.methodId)
  const otherAlternatives = scenario.alsoDefensible.filter((alt) => alt.methodId !== last.methodId)

  return (
    <section className={`card feedback-card verdict-${last.verdict}`} aria-labelledby="feedback-title">
      <div className="card-header feedback-header">
        <h3 id="feedback-title" className="feedback-title" ref={headingRef} tabIndex={-1}>
          <Icon name={icon} />
          <span>
            {label}: {methodLabel(last.methodId)}
          </span>
        </h3>
      </div>

      <div className={`card-body feedback-body${resolved ? ' has-notes' : ''}`}>
        <div className="feedback-main">
          {last.verdict === 'best' && <p className="feedback-lead">{scenario.explanation}</p>}
          {chosenAlternative && <p className="feedback-lead">{chosenAlternative.explanation}</p>}
          {last.verdict === 'reconsider' && (
            <p className="feedback-lead">{scenario.reconsider[last.methodId]}</p>
          )}

          {(chosenAlternative || revealed) && (
            <BestFit methodId={scenario.bestMethodId} explanation={scenario.explanation} />
          )}

          {resolved && otherAlternatives.length > 0 && (
            <div className="alternatives">
              <h4 className="subsection-title">Also defensible here</h4>
              <dl>
                {otherAlternatives.map((alt) => (
                  <div key={alt.methodId}>
                    <dt>{methodLabel(alt.methodId)}</dt>
                    <dd>{alt.explanation}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {resolved && (
          <div className="feedback-notes">
            <Note icon="clue" title="Decisive clue" text={scenario.decisiveClue} />
            <Note icon="confusion" title="Likely confusion" text={scenario.likelyConfusion} />
            <Note icon="check" title="Before using this with real data" text={scenario.conditionToCheck} />
            {scenario.designNote && <Note icon="caution" title="Interpreting the design" text={scenario.designNote} />}
          </div>
        )}
      </div>

      <div className="card-footer">
        {resolved ? (
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            {continueLabel}
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={onTryAgain}>
              <Icon name="replay" />
              Try again
            </button>
            <span className="form-text">You have one more try before the best fit is shown.</span>
          </>
        )}
      </div>
    </section>
  )
}

function BestFit({ methodId, explanation }: { methodId: MethodId; explanation: string }) {
  return (
    <div className="best-fit">
      <h4 className="best-fit-title">
        <Icon name="best" />
        Best fit: {methodLabel(methodId)}
        <MethodGlyph id={methodId} />
      </h4>
      <p>{explanation}</p>
    </div>
  )
}

function Note({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="note">
      <h4 className="note-title">
        <Icon name={icon} />
        {title}
      </h4>
      <p>{text}</p>
    </div>
  )
}
