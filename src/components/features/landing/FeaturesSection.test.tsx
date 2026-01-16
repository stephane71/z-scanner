import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from './FeaturesSection'

describe('FeaturesSection', () => {
  it('renders all three feature cards', () => {
    render(<FeaturesSection />)

    expect(screen.getByText('OCR intelligent')).toBeInTheDocument()
    expect(screen.getByText('Conforme NF525')).toBeInTheDocument()
    expect(screen.getByText('100% offline')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<FeaturesSection />)

    expect(
      screen.getByText(/photo \u2192 donn\u00e9es en 5 secondes/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/archivage certifi\u00e9 et horodat\u00e9/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/fonctionne sans connexion/i)).toBeInTheDocument()
  })

  it('has a visually hidden heading for accessibility', () => {
    render(<FeaturesSection />)

    // The h2 heading with sr-only class exists - use querySelector for sr-only
    const heading = document.querySelector('h2.sr-only')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Fonctionnalit')
  })

  it('renders feature icons', () => {
    render(<FeaturesSection />)

    // Check that SVG icons are present (3 features = 3 icons)
    const svgElements = document.querySelectorAll('svg[aria-hidden="true"]')
    expect(svgElements.length).toBeGreaterThanOrEqual(3)
  })
})
