'use client'

// web-animations: Tier 2 (T2.7 SharedLayoutCard / layoutId)
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

interface SharedLayoutCardProps {
  id: string
  preview: ReactNode
  expanded: ReactNode
  className?: string
}

export function SharedLayoutCard({ id, preview, expanded, className }: SharedLayoutCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        layoutId={`card-${id}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={`card-${id}-expanded`}
        className={className}
        style={{ cursor: 'pointer', textAlign: 'left', border: 'none', background: 'transparent' }}
      >
        {preview}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 40,
              }}
            />
            <motion.div
              layoutId={`card-${id}`}
              id={`card-${id}-expanded`}
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: 'min(90vw, 720px)',
                maxHeight: '90vh',
                overflow: 'auto',
                zIndex: 50,
              }}
            >
              {expanded}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              >
                ×
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
