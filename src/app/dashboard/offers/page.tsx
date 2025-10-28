import { fetchOffers } from '@/lib/supabase/queries';
import type { Offer } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UpdateOfferButton } from './update-offer-button';

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Monitoramento de ofertas internas</h1>
        <p className="text-muted-foreground max-w-2xl">
          Acompanhe a quantidade diária de anúncios ativos, variação percentual e status automático das suas ofertas cadastradas.
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
      ) : (
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-xl">Ofertas cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-right">Anúncios hoje</TableHead>
                  <TableHead className="text-right">Variação %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const statusDescriptor = describeStatus(offer.status);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.name}</TableCell>
                      <TableCell>{offer.platform ?? '—'}</TableCell>
                      <TableCell>{offer.country ?? '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{offer.total_ads_today}</TableCell>
                      <TableCell className="text-right">
                        {typeof offer.variation_percent === 'number' ? `${offer.variation_percent.toFixed(2)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusDescriptor.tone === 'success' ? 'default' : statusDescriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                          {statusDescriptor.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <UpdateOfferButton offerId={offer.id} currentCount={offer.total_ads_today} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {offers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma oferta cadastrada até o momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
