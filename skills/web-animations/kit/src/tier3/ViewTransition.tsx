'use client'

// web-animations: Tier 3 (T3.12 ViewTransition - zero-library route transitions)
// Source: https://developer.chrome.com/docs/web-platform/view-transitions/same-document
// Wraps any DOM update (router navigation, state change) in document.startViewTransition.
// Auto-bypasses on browsers with native UA visual transition (iOS Safari swipe-back).

import type { MouseEvent, ReactNode } from 'react'

type StartViewTransition = (
  callback: () => void | Promise<void>
) => { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> }

interface NavigatorEventLike {
  hasUAVisualTransition?: boolean
}

declare global {
  interface Document {
    startViewTransition?: StartViewTransition
  }
}

interface NavigateOpts {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  bypassIfNative?: boolean
}

/**
 * Wrap a DOM-updating callback with a View Transition.
 * Returns immediately if the API isn't available or if the user agent
 * is about to provide a native visual transition.
 */
export function startTransition(
  update: () => void | Promise<void>,
  hasUAVisualTransition = false
): void {
  if (hasUAVisualTransition) {
    void update()
    return
  }
  if (typeof document === 'undefined' || !document.startViewTransition) {
    void update()
    return
  }
  document.startViewTransition(() => update())
}

interface TransitionLinkProps {
  to: string
  navigate: (to: string) => void
  children: ReactNode
  className?: string
}

/**
 * Drop-in <a> replacement that wraps the navigation call in a View Transition.
 * The `navigate` prop should call your router's push (`router.push`, `useNavigate`, etc).
 */
export function TransitionLink({ to, navigate, children, className }: TransitionLinkProps) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const nav = e.nativeEvent as unknown as NavigatorEventLike
    startTransition(() => navigate(to), Boolean(nav.hasUAVisualTransition))
  }

  return (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  )
}
