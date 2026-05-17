import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FadeUp, StaggerContainer } from '../src'

describe('Tier 1 — Baseline reveals', () => {
  it('FadeUp renders children', () => {
    render(<FadeUp>Hello world</FadeUp>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('FadeUp accepts mount mode', () => {
    render(
      <FadeUp mode="mount" data-testid="fade">
        Mounted
      </FadeUp>
    )
    expect(screen.getByTestId('fade')).toBeInTheDocument()
  })

  it('StaggerContainer renders nested children', () => {
    render(
      <StaggerContainer>
        <FadeUp>First</FadeUp>
        <FadeUp>Second</FadeUp>
        <FadeUp>Third</FadeUp>
      </StaggerContainer>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('StaggerContainer accepts custom stagger timing', () => {
    render(
      <StaggerContainer stagger={0.2} delayChildren={0.1} data-testid="stagger">
        <FadeUp>Child</FadeUp>
      </StaggerContainer>
    )
    expect(screen.getByTestId('stagger')).toBeInTheDocument()
  })
})
