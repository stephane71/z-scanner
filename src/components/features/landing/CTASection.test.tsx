import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CTASection } from './CTASection'

describe('CTASection', () => {
  it('renders the section heading', () => {
    render(<CTASection />)

    expect(
      screen.getByRole('heading', {
        name: /pr\u00eat \u00e0 simplifier ta comptabilit\u00e9/i,
      })
    ).toBeInTheDocument()
  })

  it('renders the secondary CTA button', () => {
    render(<CTASection />)

    const ctaButton = screen.getByRole('link', {
      name: /s'inscrire gratuitement/i,
    })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/register')
  })

  it('renders the login link', () => {
    render(<CTASection />)

    const loginLink = screen.getByRole('link', { name: /se connecter/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('renders the description text', () => {
    render(<CTASection />)

    expect(
      screen.getByText(/rejoins les commer\u00e7ants qui ont d\u00e9j\u00e0 adopt\u00e9 z-scanner/i)
    ).toBeInTheDocument()
  })
})
