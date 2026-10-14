import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { Icon } from './Icon'

type ModalProps = {
  open: boolean
  title: string
  /** Called for every way the dialog closes: the close button, Escape, or a footer action. */
  onClose: () => void
  /** The element to focus when the dialog opens. Defaults to the dialog's first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>
  footer: ReactNode
  children: ReactNode
}

/** A Shiny-style modal dialog built on the native <dialog> element, which handles focus containment and Escape. */
export function Modal({ open, title, onClose, initialFocus, footer, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      initialFocus?.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, initialFocus])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-header">
        <h2 id={titleId} className="modal-title">
          {title}
        </h2>
        <button type="button" className="btn-close" onClick={onClose}>
          <Icon name="close" />
          <span className="visually-hidden">Close</span>
        </button>
      </div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">{footer}</div>
    </dialog>
  )
}
