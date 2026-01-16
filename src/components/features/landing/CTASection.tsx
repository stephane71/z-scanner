import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Final call-to-action section at the bottom of the landing page
 */
export function CTASection() {
  return (
    <section className="px-4 py-12 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-lg font-semibold text-foreground">
          Pr&ecirc;t &agrave; simplifier ta comptabilit&eacute; ?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Rejoins les commer&ccedil;ants qui ont d&eacute;j&agrave; adopt&eacute; Z-Scanner
        </p>

        {/* Secondary CTA */}
        <Button
          variant="outline"
          className="mt-6 h-16 w-full max-w-xs border-primary text-lg font-semibold text-primary hover:bg-primary/10"
          asChild
        >
          <Link href="/register">S&apos;inscrire gratuitement</Link>
        </Button>

        {/* Login Link */}
        <p className="mt-4 text-sm text-muted">
          D&eacute;j&agrave; inscrit ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </section>
  )
}
