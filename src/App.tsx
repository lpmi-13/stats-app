import { useEffect, useReducer, useRef, useState } from 'react'
import { FeedbackCard } from './components/FeedbackCard'
import { Icon } from './components/Icon'
import { MethodPicker } from './components/MethodPicker'
import { Modal } from './components/Modal'
import { RoundSummary } from './components/RoundSummary'
import { ScenarioPanel } from './components/ScenarioPanel'
import { contentErrors, methodLabel, methods, scenarios, scenariosById } from './content'
import type { MethodId } from './content/types'
import { focusAndReveal, hasSeenIntro, markIntroSeen } from './lib/browser'
import { createRound, isResolved, roundReducer, shuffle, summarizeRound, wasTried } from './round/round'

const newDeck = () => shuffle(scenarios.map((s) => s.id))

type FocusTarget = 'scenario' | 'feedback' | 'methods' | 'summary' | 'newRound'

export default function App() {
  if (contentErrors.length > 0) return <ContentErrors errors={contentErrors} />
  return <MethodMatch />
}

function MethodMatch() {
  const [state, dispatch] = useReducer(roundReducer, undefined, () => createRound(newDeck()))
  const [introOpen, setIntroOpen] = useState(() => !hasSeenIntro())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [focusRequest, setFocusRequest] = useState<{ target: FocusTarget; seq: number } | null>(null)

  const scenarioHeading = useRef<HTMLHeadingElement>(null)
  const feedbackHeading = useRef<HTMLHeadingElement>(null)
  const summaryHeading = useRef<HTMLHeadingElement>(null)
  const firstOption = useRef<HTMLInputElement>(null)
  const newRoundButton = useRef<HTMLButtonElement>(null)
  const introStart = useRef<HTMLButtonElement>(null)
  const confirmCancel = useRef<HTMLButtonElement>(null)

  const { play, view } = state
  const scenario = scenariosById.get(play.scenarioId)!
  const isLastCard = state.position === state.deck.length - 1

  useEffect(() => {
    if (!focusRequest) return
    const targets = {
      scenario: scenarioHeading,
      feedback: feedbackHeading,
      methods: firstOption,
      summary: summaryHeading,
      newRound: newRoundButton,
    }
    const element = targets[focusRequest.target].current
    // Headings are moved into view; controls are focused where they already sit.
    if (element instanceof HTMLHeadingElement) focusAndReveal(element)
    else element?.focus()
  }, [focusRequest])

  const requestFocus = (target: FocusTarget) => setFocusRequest((prev) => ({ target, seq: (prev?.seq ?? 0) + 1 }))
  const mainFocus = (): FocusTarget => (view === 'summary' ? 'summary' : 'scenario')

  function select(methodId: MethodId) {
    setNotice('')
    dispatch({ type: 'select', methodId })
  }

  function check() {
    if (!play.selection) {
      setNotice('Choose a method first, then check your match.')
      return
    }
    if (wasTried(play, play.selection)) {
      setNotice(`You already tried ${methodLabel(play.selection)} on this card. Choose a different method.`)
      return
    }
    setNotice('')
    dispatch({ type: 'check', scenario })
    requestFocus('feedback')
  }

  function tryAgain() {
    dispatch({ type: 'tryAgain' })
    requestFocus('methods')
  }

  function continueOn() {
    if (view === 'replay') {
      dispatch({ type: 'backToSummary' })
      requestFocus('summary')
      return
    }
    dispatch({ type: 'next' })
    requestFocus(isLastCard ? 'summary' : 'scenario')
  }

  function replay(scenarioId: string) {
    setNotice('')
    dispatch({ type: 'replay', scenarioId })
    requestFocus('scenario')
  }

  function backToSummary() {
    dispatch({ type: 'backToSummary' })
    requestFocus('summary')
  }

  function startNewRound() {
    setConfirmOpen(false)
    setNotice('')
    dispatch({ type: 'newRound', deck: newDeck() })
    requestFocus('scenario')
  }

  function askForNewRound() {
    const inProgress = view === 'deck' && (state.position > 0 || play.attempts.length > 0)
    if (inProgress) setConfirmOpen(true)
    else startNewRound()
  }

  function closeIntro() {
    markIntroSeen()
    setIntroOpen(false)
    requestFocus(mainFocus())
  }

  const summary = view === 'summary' ? summarizeRound(state, scenariosById) : null

  return (
    <div className="page">
      <header className="title-bar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" />
            <path d="M7 24 25 9" />
            <circle cx="9" cy="19" r="2.2" />
            <circle cx="14" cy="18" r="2.2" />
            <circle cx="18" cy="12" r="2.2" />
            <circle cx="24" cy="13" r="2.2" />
          </svg>
          <h1 className="app-title">Method Match</h1>
        </div>
        <nav className="title-actions" aria-label="App">
          <button type="button" className="btn btn-nav" onClick={() => setIntroOpen(true)}>
            <Icon name="about" />
            <span className="nav-text">About</span>
          </button>
          <button type="button" className="btn btn-nav" onClick={askForNewRound} ref={newRoundButton}>
            <Icon name="newRound" />
            <span className="nav-text">New round</span>
          </button>
        </nav>
      </header>

      <main className={`layout layout-${view === 'summary' ? 'summary' : 'practice'}`}>
        {view === 'summary' && summary ? (
          <>
            <div className="layout-main">
              <RoundSummary state={state} summary={summary} headingRef={summaryHeading} onReplay={replay} />
            </div>
            <section className="layout-sidebar" aria-labelledby="next-steps-title">
              <div className="sidebar-inner">
                <h2 className="sidebar-title" id="next-steps-title">
                  Next steps
                </h2>
                <p className="form-text">
                  Replay any scenario from the review, or start a new round. A new round reshuffles the deck; the
                  method choices stay in the same order.
                </p>
                <button type="button" className="btn btn-primary btn-block" onClick={startNewRound}>
                  <Icon name="newRound" />
                  New round
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="layout-main">
              <ScenarioPanel
                key={`${view}-${scenario.id}`}
                scenario={scenario}
                progress={
                  view === 'deck'
                    ? {
                        current: state.position + 1,
                        total: state.deck.length,
                        done: state.position + (isResolved(play) ? 1 : 0),
                      }
                    : null
                }
                headingRef={scenarioHeading}
                onBackToSummary={backToSummary}
              />
            </div>
            <section className="layout-sidebar" aria-label="Choose a method">
              <div className="sidebar-inner">
                <MethodPicker
                  methods={methods}
                  play={play}
                  notice={notice}
                  firstOptionRef={firstOption}
                  onSelect={select}
                  onCheck={check}
                />
              </div>
            </section>
            {play.stage === 'feedback' && (
              <div className="layout-feedback">
                <FeedbackCard
                  key={play.attempts.length}
                  scenario={scenario}
                  play={play}
                  continueLabel={view === 'replay' ? 'Back to summary' : isLastCard ? 'See round summary' : 'Next scenario'}
                  headingRef={feedbackHeading}
                  onTryAgain={tryAgain}
                  onContinue={continueOn}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Modal
        open={introOpen}
        title="Read the question, inspect the variables, choose a method"
        onClose={closeIntro}
        initialFocus={introStart}
        footer={
          <button type="button" className="btn btn-primary" onClick={closeIntro} ref={introStart}>
            {hasSeenIntro() ? 'Close' : 'Start practicing'}
          </button>
        }
      >
        <p>
          A label like “survey” or “experiment” doesn’t decide the analysis on its own. A campus survey might record
          each student’s sleep hours, concentration score, year of study, and preferred study location: asking how
          strongly sleep and concentration move together calls for a correlation, while asking whether year of study
          is linked to study location calls for a chi-square test.
        </p>
        <ol className="intro-steps">
          <li>Read the scenario and the research question, then inspect What we know.</li>
          <li>Choose the method that best fits the question, and select Check match.</li>
          <li>
            Read the feedback. If it says Reconsider, you get one more try before the best fit is shown, along with
            why it fits.
          </li>
        </ol>
        <p className="form-text">
          There’s no timer and no grade, and your answers stay in this browser. This is a practice aid: for a real
          study, check your analysis plan with your instructor or a statistician.
        </p>
      </Modal>

      <Modal
        open={confirmOpen}
        title="Start a new round?"
        onClose={() => {
          setConfirmOpen(false)
          requestFocus('newRound')
        }}
        initialFocus={confirmCancel}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              ref={confirmCancel}
              onClick={() => {
                setConfirmOpen(false)
                requestFocus('newRound')
              }}
            >
              Keep this round
            </button>
            <button type="button" className="btn btn-primary" onClick={startNewRound}>
              Start new round
            </button>
          </>
        }
      >
        <p>The deck will be reshuffled and this round’s progress will be cleared.</p>
      </Modal>
    </div>
  )
}

function ContentErrors({ errors }: { errors: string[] }) {
  return (
    <main className="content-errors">
      <h1>The scenario content needs fixing</h1>
      <p>The app checks the method and scenario files when it starts. Fix these problems in src/content, then reload:</p>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </main>
  )
}
