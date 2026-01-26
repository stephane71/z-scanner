'use client';

/**
 * AddMarketForm - Inline form for adding new markets
 * Story 4.5: Market Management (CRUD)
 *
 * Creates a market in Dexie and queues it for Supabase sync.
 * useLiveQuery in parent updates the list reactively.
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addMarket, queueCreate } from '@/hooks';

interface AddMarketFormProps {
  userId: string;
}

export function AddMarketForm({ userId }: AddMarketFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSubmitting(true);
    setError('');
    try {
      const createdAt = new Date().toISOString();
      const marketId = await addMarket({ name: trimmedName, userId, createdAt });
      await queueCreate('market', marketId, { name: trimmedName, userId, createdAt });
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Nom du marché"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          Ajouter
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
