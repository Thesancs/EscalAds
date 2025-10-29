'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { describeStatus } from '@/lib/monitoring/status';
import type { Offer } from '@/lib/supabase/types';
import { UpdateOfferButton } from './update-offer-button';

interface OfferDetailsDialogProps {
  offer: Offer;
}

function formatVariation(value: Offer['variation_percent']) {
  if (typeof value !== 'number') return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function OfferDetailsDialog({ offer }: OfferDetailsDialogProps) {
  const statusDescriptor = describeStatus(offer.status);

  const links = [
    { label: 'Página de anúncios', href: offer.ads_page_url },
    { label: 'Página de conversão', href: offer.conversion_page_url },
    { label: 'Página de checkout', href: offer.checkout_url },
  ] as const;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Ver mais</Button>
      </DialogTrigger>
      <DialogContent className="glassmorphic max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 text-left">
            <span>{offer.name}</span>
            <Badge variant={statusDescriptor.tone === 'success' ? 'default' : statusDescriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
              {statusDescriptor.label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground">
            {offer.summary || 'Sem descrição cadastrada para esta oferta.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-4 rounded-xl border border-border/60 bg-background/40 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Anúncios ativos hoje</p>
              <p className="text-2xl font-semibold text-foreground">{offer.total_ads_today}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Variação diária</p>
              <p className="text-2xl font-semibold text-foreground">{formatVariation(offer.variation_percent)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monitoramento automático</p>
              <p className="text-2xl font-semibold text-foreground">{offer.is_monitored ? 'Sim' : 'Não'}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</p>
              <p className="text-base font-semibold">{offer.funnel_type ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nicho</p>
              <p className="text-base font-semibold">{offer.niche ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plataforma</p>
              <p className="text-base font-semibold">{offer.platform ?? '—'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40">
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground">Páginas principais</p>
              <p className="text-sm text-muted-foreground">Acesse rapidamente os recursos estratégicos dessa oferta.</p>
            </div>
            <Separator className="bg-border/60" />
            <ul className="divide-y divide-border/60">
              {links.map((link) => (
                <li key={link.label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {link.href ? link.href : 'Não cadastrada'}
                    </p>
                  </div>
                  {link.href ? (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={link.href} target="_blank" rel="noreferrer">
                        Abrir
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary">Em breve</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Atualize a contagem após uma nova coleta manual para recalcular a variação automaticamente.
          </p>
          <UpdateOfferButton offerId={offer.id} currentCount={offer.total_ads_today} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
