'use client'

// web-animations: Tier 2 (T2.6 AnimatedModal)
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { easings } from '../utils/easings'

interface AnimatedModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  labelledBy?: string
  className?: string
}

export function AnimatedModal({
  open,
  onClose,
  children,
  labelledBy,
  className,
}: AnimatedModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
          />
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: easings.outExpo }}
            className={className}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
