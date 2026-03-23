import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { BullLogo } from '@/components/icons/BullLogo'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello World</GlassCard>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Content</GlassCard>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('applies role="button" when onClick is provided', () => {
    render(<GlassCard onClick={() => {}}>Clickable</GlassCard>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

describe('GlassButton', () => {
  it('renders with label', () => {
    render(<GlassButton>Click Me</GlassButton>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('renders as a button element', () => {
    render(<GlassButton>Submit</GlassButton>)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is set', () => {
    render(<GlassButton disabled>Disabled</GlassButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading', () => {
    render(<GlassButton loading>Loading</GlassButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('GlassBadge', () => {
  it('renders with text content', () => {
    render(<GlassBadge>Active</GlassBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with default variant styling', () => {
    const { container } = render(<GlassBadge>Default</GlassBadge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('rounded-full')
  })

  it('renders with success variant styling', () => {
    const { container } = render(<GlassBadge variant="success">Success</GlassBadge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('emerald')
  })

  it('renders with danger variant styling', () => {
    const { container } = render(<GlassBadge variant="danger">Danger</GlassBadge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('red')
  })
})

describe('BullLogo', () => {
  it('renders img element', () => {
    render(<BullLogo />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'AgriEID')
  })

  it('renders with default size', () => {
    render(<BullLogo />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '32')
    expect(img).toHaveAttribute('height', '32')
  })

  it('renders with custom size', () => {
    render(<BullLogo size={48} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '48')
    expect(img).toHaveAttribute('height', '48')
  })
})
