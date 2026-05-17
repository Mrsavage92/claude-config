import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SpringButton,
  MagneticButton,
  NumberTicker,
  SplitReveal,
  Marquee,
  AnimatedModal,
} from '../src'

describe('Tier 2 — Escalation micro-interactions', () => {
  it('SpringButton fires onClick', async () => {
    const onClick = vi.fn()
    render(<SpringButton onClick={onClick}>Click me</SpringButton>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('SpringButton renders text content', () => {
    render(<SpringButton>Submit</SpringButton>)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('MagneticButton renders accessible content and calls onClick', async () => {
    const onClick = vi.fn()
    render(
      <MagneticButton aria-label="magnetic cta" onClick={onClick}>
        Click
      </MagneticButton>
    )
    const btn = screen.getByRole('button', { name: 'magnetic cta' })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it('NumberTicker exposes final formatted value via aria-label', () => {
    render(<NumberTicker to={1234} />)
    expect(screen.getByLabelText('1,234')).toBeInTheDocument()
  })

  it('NumberTicker supports custom formatter', () => {
    render(<NumberTicker to={9999} format={(n) => `$${n}`} />)
    expect(screen.getByLabelText('$9999')).toBeInTheDocument()
  })

  it('SplitReveal exposes full text via aria-label', () => {
    render(<SplitReveal text="Hello world" />)
    expect(screen.getByLabelText('Hello world')).toBeInTheDocument()
  })

  it('SplitReveal splits by char when requested', () => {
    render(<SplitReveal text="hi" by="char" data-testid="split" />)
    expect(screen.getByLabelText('hi')).toBeInTheDocument()
  })

  it('Marquee renders children twice for seamless loop', () => {
    render(
      <Marquee>
        <span>logo</span>
      </Marquee>
    )
    expect(screen.getAllByText('logo')).toHaveLength(2)
  })

  it('AnimatedModal renders children when open', () => {
    render(
      <AnimatedModal open onClose={() => {}}>
        <h2 id="title">Modal heading</h2>
      </AnimatedModal>
    )
    expect(screen.getByText('Modal heading')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('AnimatedModal does not render dialog when closed', () => {
    render(
      <AnimatedModal open={false} onClose={() => {}}>
        <p>Hidden</p>
      </AnimatedModal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('AnimatedModal Escape key closes', async () => {
    const onClose = vi.fn()
    render(
      <AnimatedModal open onClose={onClose}>
        <p>Body</p>
      </AnimatedModal>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
