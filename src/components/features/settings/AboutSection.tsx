/**
 * AboutSection Component
 * Story 6.4: Settings Page - Task 3
 *
 * Displays app information, NF525 compliance badge, and support contact
 */

import { Info, Shield, Mail } from 'lucide-react';
import pkg from '../../../../package.json';

/**
 * AboutSection displays app information and compliance status
 *
 * Features:
 * - App version from package.json
 * - NF525 compliance badge
 * - Support email link
 * - Developer credit
 */
export function AboutSection() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">À propos</h2>

      <div className="space-y-3">
        {/* Version */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">Version {pkg.version}</span>
        </div>

        {/* NF525 Compliance */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div
            data-testid="nf525-check-icon"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Conforme NF525
          </span>
        </div>

        {/* Support Email */}
        <a
          href="mailto:support@z-scanner.fr"
          aria-label="Contacter le support par email"
          className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-primary">support@z-scanner.fr</span>
        </a>

        {/* Developer Credit */}
        <div className="text-center text-xs text-muted-foreground py-2">
          Développé par Z-Scanner SAS
        </div>
      </div>
    </section>
  );
}
