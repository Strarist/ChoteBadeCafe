import { useCallback, useEffect, useRef } from "react"

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal focus management: store trigger, focus close on open, restore on close,
 * trap Tab, Escape to close. Call requestClose instead of onClose directly.
 */
export function useModalFocus(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const requestClose = useCallback(() => {
    const trigger = triggerRef.current
    onClose()
    requestAnimationFrame(() => trigger?.focus())
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    triggerRef.current = document.activeElement as HTMLElement | null
    const id = requestAnimationFrame(() => closeButtonRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        requestClose()
        return
      }
      if (e.key !== "Tab") return

      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener("keydown", onKeyDown)
    return () => panel.removeEventListener("keydown", onKeyDown)
  }, [isOpen, requestClose])

  return { panelRef, closeButtonRef, requestClose }
}
