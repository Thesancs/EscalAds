import type { OfferStatus } from '@/lib/supabase/types';

export function calculateVariation(previousCount: number, currentCount: number): number {
  if (previousCount === 0) {
    return currentCount === 0 ? 0 : 100;
  }

  const variation = ((currentCount - previousCount) / previousCount) * 100;
  return Number.isFinite(variation) ? Number(variation.toFixed(2)) : 0;
}

export function determineStatus(variation: number | null | undefined): OfferStatus {
  if (variation === null || variation === undefined) {
    return 'estável';
  }

  if (variation >= 10) {
    return 'escalando';
  }

  if (variation <= -10) {
    return 'caindo';
  }

  return 'estável';
}

export function describeStatus(status: OfferStatus) {
  switch (status) {
    case 'escalando':
      return { label: 'Em escala', tone: 'success' as const };
    case 'caindo':
      return { label: 'Caindo', tone: 'destructive' as const };
    default:
      return { label: 'Estável', tone: 'default' as const };
  }
}
