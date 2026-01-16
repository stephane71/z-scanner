/**
 * Trust section displaying NF525 compliance and data security messaging
 */
export function TrustSection() {
  return (
    <section className="bg-surface px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        {/* NF525 Badge */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust/10">
          <svg
            className="h-8 w-8 text-trust"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Trust Headline */}
        <h2 className="text-lg font-semibold text-foreground">
          Certification NF525
        </h2>

        {/* Trust Description */}
        <p className="mt-2 text-sm text-muted">
          Vos donn&eacute;es sont s&eacute;curis&eacute;es et conserv&eacute;es 6 ans
          conform&eacute;ment &agrave; la r&eacute;glementation fiscale
        </p>

        {/* Additional Trust Points */}
        <div className="mt-6 flex justify-center gap-6 text-xs text-muted">
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Chiffrement
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Horodatage
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Immutable
          </div>
        </div>
      </div>
    </section>
  )
}
