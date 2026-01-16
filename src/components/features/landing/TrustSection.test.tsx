import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrustSection } from './TrustSection'

describe('TrustSection', () => {
  it('renders the NF525 certification heading', () => {
    render(<TrustSection />)

    expect(
      screen.getByRole('heading', { name: /certification nf525/i })
    ).toBeInTheDocument()
  })

  it('renders the data security description', () => {
    render(<TrustSection />)

    expect(
      screen.getByText(
        /vos donn\u00e9es sont s\u00e9curis\u00e9es et conserv\u00e9es 6 ans/i
      )
    ).toBeInTheDocument()
  })

  it('renders trust indicators', () => {
    render(<TrustSection />)

    expect(screen.getByText(/chiffrement/i)).toBeInTheDocument()
    expect(screen.getByText(/horodatage/i)).toBeInTheDocument()
    expect(screen.getByText(/immutable/i)).toBeInTheDocument()
  })

  it('renders the shield icon', () => {
    render(<TrustSection />)

    // Check for shield icon SVG
    const shieldIcon = document.querySelector('svg[aria-hidden="true"]')
    expect(shieldIcon).toBeInTheDocument()
  })
})
