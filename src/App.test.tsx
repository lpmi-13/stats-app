import { render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { methods, scenarios } from './content'
import type { MethodId, Scenario } from './content/types'

function currentScenario(): Scenario {
  const heading = document.getElementById('scenario-title')
  const scenario = scenarios.find((s) => s.title === heading?.textContent)
  if (!scenario) throw new Error(`No scenario titled "${heading?.textContent}"`)
  return scenario
}

/** From focus on the first radio, pick a method with the arrow keys as a keyboard user would. */
async function chooseWithKeyboard(user: UserEvent, methodId: MethodId) {
  const index = methods.findIndex((m) => m.id === methodId)
  if (index === 0) await user.keyboard(' ')
  for (let i = 0; i < index; i++) await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('radio', { name: new RegExp(methods[index].label) })).toBeChecked()
}

async function tabTo(user: UserEvent, name: RegExp) {
  for (let i = 0; i < 20; i++) {
    await user.tab()
    const active = document.activeElement
    if (active instanceof HTMLElement && name.test(active.textContent ?? '') && active.tagName === 'BUTTON') return
  }
  throw new Error(`Could not reach a button matching ${name} with Tab`)
}

describe('Method Match', () => {
  it('completes a full round, a retry, and a replay using only the keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)

    const intro = screen.getByRole('dialog', { name: /read the question, inspect the variables/i })
    expect(within(intro).getByRole('button', { name: 'Start practicing' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(intro).not.toHaveAttribute('open')
    expect(localStorage.getItem('method-match:intro-seen')).toBe('1')

    const seen = new Set<string>()
    for (let card = 1; card <= 10; card++) {
      const scenario = currentScenario()
      seen.add(scenario.id)
      expect(screen.getByText(`Scenario ${card} of 10`)).toBeInTheDocument()
      expect(document.activeElement).toBe(document.getElementById('scenario-title'))

      if (card === 1) {
        // Miss the first card once, then use Try again.
        const wrong = methods.find(
          (m) => m.id !== scenario.bestMethodId && !scenario.alsoDefensible.some((a) => a.methodId === m.id),
        )!
        await user.tab()
        await chooseWithKeyboard(user, wrong.id)
        await tabTo(user, /^Check match$/)
        await user.keyboard('{Enter}')
        expect(screen.getByRole('heading', { level: 3, name: `Reconsider: ${wrong.label}` })).toHaveFocus()
        expect(screen.getByText(scenario.reconsider[wrong.id]!)).toBeInTheDocument()
        await tabTo(user, /Try again/)
        await user.keyboard('{Enter}')
        expect(screen.getByRole('radio', { name: /Tried/ })).toBeInTheDocument()
      } else {
        await user.tab()
      }

      expect(document.activeElement).toBe(screen.getAllByRole('radio')[0])
      await chooseWithKeyboard(user, scenario.bestMethodId)
      await tabTo(user, /^Check match$/)
      await user.keyboard('{Enter}')

      const best = methods.find((m) => m.id === scenario.bestMethodId)!
      expect(screen.getByRole('heading', { level: 3, name: `Best fit: ${best.label}` })).toHaveFocus()
      expect(screen.getByText(scenario.conditionToCheck)).toBeInTheDocument()

      await tabTo(user, card === 10 ? /^See round summary$/ : /^Next scenario$/)
      await user.keyboard('{Enter}')
    }

    expect(seen.size).toBe(10)
    expect(screen.getByRole('heading', { level: 2, name: 'Round complete' })).toHaveFocus()
    const stat = (title: string) =>
      screen.getByText(title, { selector: '.value-box-title' }).nextElementSibling?.textContent
    expect(stat('Scenarios completed')).toBe('10')
    expect(stat('Understood on the first attempt')).toBe('9')
    expect(stat('Methods to revisit')).toBe('1')

    // Replay the missed card from the summary; the round record stays as it was.
    await tabTo(user, /^Replay/)
    await user.keyboard('{Enter}')
    expect(screen.getByText('Replaying a scenario')).toBeInTheDocument()
    const replayed = currentScenario()
    await user.tab()
    await chooseWithKeyboard(user, replayed.bestMethodId)
    await tabTo(user, /^Check match$/)
    await user.keyboard('{Enter}')
    await tabTo(user, /^Back to summary$/)
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 2, name: 'Round complete' })).toHaveFocus()
    expect(stat('Understood on the first attempt')).toBe('9')
  })

  it('reveals the best fit after two Reconsider results', async () => {
    const user = userEvent.setup()
    localStorage.setItem('method-match:intro-seen', '1')
    render(<App />)

    const scenario = currentScenario()
    const wrong = methods.filter(
      (m) => m.id !== scenario.bestMethodId && !scenario.alsoDefensible.some((a) => a.methodId === m.id),
    )

    await user.click(screen.getByRole('radio', { name: wrong[0].label }))
    await user.click(screen.getByRole('button', { name: 'Check match' }))
    await user.click(screen.getByRole('button', { name: /Try again/ }))

    // Checking the same method again is refused with a message instead of using up the attempt.
    await user.click(screen.getByRole('radio', { name: new RegExp(wrong[0].label) }))
    await user.click(screen.getByRole('button', { name: 'Check match' }))
    expect(screen.getByRole('status')).toHaveTextContent(`You already tried ${wrong[0].label}`)

    await user.click(screen.getByRole('radio', { name: wrong[1].label }))
    await user.click(screen.getByRole('button', { name: 'Check match' }))

    const best = methods.find((m) => m.id === scenario.bestMethodId)!
    expect(screen.getByRole('heading', { level: 3, name: `Reconsider: ${wrong[1].label}` })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: `Best fit: ${best.label}` })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Try again/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next scenario' })).toBeInTheDocument()
  })

  it('asks before discarding a round in progress', async () => {
    const user = userEvent.setup()
    localStorage.setItem('method-match:intro-seen', '1')
    render(<App />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const scenario = currentScenario()
    await user.click(screen.getByRole('radio', { name: methods.find((m) => m.id === scenario.bestMethodId)!.label }))
    await user.click(screen.getByRole('button', { name: 'Check match' }))
    await user.click(screen.getByRole('button', { name: 'New round' }))

    const confirm = screen.getByRole('dialog', { name: 'Start a new round?' })
    await user.click(within(confirm).getByRole('button', { name: 'Keep this round' }))
    expect(screen.getByRole('heading', { level: 3, name: /^Best fit/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New round' }))
    await user.click(within(confirm).getByRole('button', { name: 'Start new round' }))
    expect(screen.queryByRole('heading', { level: 3, name: /^Best fit/ })).not.toBeInTheDocument()
    expect(screen.getByText('Scenario 1 of 10')).toBeInTheDocument()
  })
})
