import Link from 'next/link';
import { fetchOffers } from '@/lib/supabase/queries';
import type { Offer } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfferDetailsDialog } from './offer-details-dialog';

async function loadOffers(): Promise<{ offers: Offer[]; error?: string }> {
  try {
    const offers = await fetchOffers();
    return { offers };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível carregar as ofertas.';
    return { offers: [], error: message };
  }
}

export default async function OffersPage() {
  const { offers, error } = await loadOffers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ofertas escaladas</h1>
        <p className="text-muted-foreground max-w-2xl">
          Acompanhe a quantidade diária de anúncios ativos, variação percentual e status automático das suas ofertas mais fortes.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Supabase não configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error}. Verifique as variáveis de ambiente <code>SUPABASE_URL</code> e <code>SUPABASE_ANON_KEY</code>.
            </p>
          </CardContent>
        </Card>
      ) : offers.length === 0 ? (
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-xl">Ofertas cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nenhuma oferta cadastrada até o momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const statusDescriptor = describeStatus(offer.status);
            const variation =
              typeof offer.variation_percent === 'number'
                ? `${offer.variation_percent > 0 ? '+' : ''}${offer.variation_percent.toFixed(2)}%`
                : '—';

            return (
              <Card key={offer.id} className="glassmorphic flex h-full flex-col justify-between">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-start justify-between gap-3 text-xl">
                    <span className="flex-1 text-left leading-tight">{offer.name}</span>
                    <Badge variant={statusDescriptor.tone === 'success' ? 'default' : statusDescriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                      {statusDescriptor.label}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {offer.summary || 'Sem resumo cadastrado para esta oferta.'}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Anúncios hoje</p>
                      <p className="text-lg font-semibold text-foreground">{offer.total_ads_today}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Variação</p>
                      <p className="text-lg font-semibold text-foreground">{variation}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {offer.funnel_type && <Badge variant="outline">{offer.funnel_type}</Badge>}
                    {offer.niche && <Badge variant="secondary">{offer.niche}</Badge>}
                    {offer.platform && <Badge variant="secondary">{offer.platform}</Badge>}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <OfferDetailsDialog offer={offer} />
                  <Button asChild>
                    <Link href={`/dashboard/offers/${offer.id}`}>Entrar na página</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
