/**
 * AccountSection Component
 * Story 6.4: Settings Page - Task 1
 *
 * Displays user email and logout button in Mon compte section
 */

'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from '@/components/features/auth/LogoutButton';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * AccountSection displays user account information and logout functionality
 *
 * Features:
 * - Fetches and displays user email from Supabase Auth
 * - Loading skeleton while fetching
 * - LogoutButton for sign out
 * - User icon for visual identification
 */
export function AccountSection() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      // Only update state if component is still mounted
      if (isMounted) {
        if (!error && data.user?.email) {
          setEmail(data.user.email);
        }
        setIsLoading(false);
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Mon compte</h2>

      {isLoading ? (
        <div data-testid="account-section-skeleton" className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {email && (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
              <div
                data-testid="user-icon"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10"
              >
                <User className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span data-testid="user-email" className="text-sm font-medium">
                {email}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      )}
    </section>
  );
}
