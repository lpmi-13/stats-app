import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type Tab = { id: string; label: ReactNode; content: ReactNode }

/** A card with a tabbed tabset (bslib's navset_card_tab), following the ARIA tabs pattern. */
export function TabsCard({ label, tabs }: { label: string; tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].id)
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1
    const target =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    if (target === null) return
    event.preventDefault()
    setActive(tabs[target].id)
    tabRefs.current[target]?.focus()
  }

  return (
    <div className="card tabs-card">
      <div className="card-header tabs-header">
        <div className="nav-tabs" role="tablist" aria-label={label}>
          {tabs.map((tab, index) => {
            const selected = tab.id === active
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={`nav-link${selected ? ' active' : ''}`}
                onClick={() => setActive(tab.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          className="card-body tab-panel"
          hidden={tab.id !== active}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
