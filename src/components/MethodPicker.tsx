import type { Ref } from 'react'
import type { Method, MethodId } from '../content/types'
import { wasTried, type Play } from '../round/round'
import { MethodGlyph } from './MethodGlyph'

type MethodPickerProps = {
  methods: readonly Method[]
  play: Play
  notice: string
  firstOptionRef: Ref<HTMLInputElement>
  onSelect: (methodId: MethodId) => void
  onCheck: () => void
}

export function MethodPicker({ methods, play, notice, firstOptionRef, onSelect, onCheck }: MethodPickerProps) {
  const locked = play.stage === 'feedback'

  return (
    <form
      className="method-picker"
      onSubmit={(event) => {
        event.preventDefault()
        onCheck()
      }}
    >
      <fieldset disabled={locked}>
        <legend className="sidebar-title">Choose a method</legend>
        <p className="form-text" id="picker-help">
          {locked
            ? 'Your choice stays marked while you read the feedback.'
            : 'Pick the method that best fits the research question. You can change it until you check.'}
        </p>
        <div className="method-options">
          {methods.map((method, index) => {
            const selected = play.selection === method.id
            const tried = wasTried(play, method.id) && !selected
            return (
              <label
                key={method.id}
                className={`method-option${selected ? ' is-selected' : ''}${tried ? ' is-tried' : ''}`}
              >
                <input
                  ref={index === 0 ? firstOptionRef : undefined}
                  type="radio"
                  name="method"
                  value={method.id}
                  checked={selected}
                  onChange={() => onSelect(method.id)}
                  aria-describedby="picker-help"
                />
                <MethodGlyph id={method.id} />
                <span className="method-label">
                  <KeepLastWord text={method.label} />
                </span>
                {tried && <span className="badge badge-tried">Tried</span>}
              </label>
            )
          })}
        </div>
      </fieldset>
      {!locked && (
        <button type="submit" className="btn btn-primary btn-block">
          Check match
        </button>
      )}
      <p className="picker-notice" role="status">
        {notice}
      </p>
    </form>
  )
}

/** Keeps the last word on one line, so "t-test" never breaks at its hyphen. */
function KeepLastWord({ text }: { text: string }) {
  const split = text.lastIndexOf(' ')
  if (split < 0) return text
  return (
    <>
      {text.slice(0, split + 1)}
      <span className="nowrap">{text.slice(split + 1)}</span>
    </>
  )
}
