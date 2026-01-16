import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection', () => {
  it('renders the main headline', () => {
    render(<HeroSection />)

    expect(
      screen.getByRole('heading', {
        name: /scanne ton ticket z, valide en 1 tap, c'est conforme/i,
      })
    ).toBeInTheDocument()
  })

  it('renders the subheadline', () => {
    render(<HeroSection />)

    expect(
      screen.getByText(/l'app qui simplifie ta comptabilité de marché/i)
    ).toBeInTheDocument()
  })

  it('renders the NF525 badge', () => {
    render(<HeroSection />)

    expect(screen.getByText(/conforme nf525/i)).toBeInTheDocument()
  })

  it('renders the Commencer CTA button', () => {
    render(<HeroSection />)

    const ctaButton = screen.getByRole('link', { name: /commencer/i })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/register')
  })

  it('has proper accessibility with heading level', () => {
    render(<HeroSection />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
