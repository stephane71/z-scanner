import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Hero section for the landing page
 * Displays the main value proposition and primary CTA
 */
export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {/* NF525 Badge - Trust indicator */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-trust/10 px-4 py-2 text-sm font-medium text-trust">
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
        Conforme NF525
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
        Scanne ton ticket Z, valide en 1 tap, c&apos;est conforme
      </h1>

      {/* Subheadline */}
      <p className="mt-4 text-base text-muted md:text-lg">
        L&apos;app qui simplifie ta comptabilit&eacute; de march&eacute;
      </p>

      {/* Primary CTA */}
      <Button
        className="mt-8 h-16 w-full max-w-xs text-lg font-semibold"
        asChild
      >
        <Link href="/register">Commencer</Link>
      </Button>
    </section>
  )
}
