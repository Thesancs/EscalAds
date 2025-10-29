import { fetchMonitoredOffers } from '@/lib/supabase/queries';
import type { MonitoredOffer } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddMonitoredOfferForm } from './add-monitored-offer-form';
import { UpdateMonitoredOfferButton } from './update-monitored-offer-button';

async function loadMonitoredOffers(): Promise<{ offers: MonitoredOffer[]; error?: string }> {
  try {
    const offers = await fetchMonitoredOffers();
    return { offers };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível carregar as ofertas monitoradas.';
    return { offers: [], error: message };
  }
}

export default async function MonitoredOffersPage() {
  const { offers, error } = await loadMonitoredOffers();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Monitoramento externo</h1>
        <p className="text-muted-foreground max-w-3xl">
          Cadastre links da Meta Ad Library ou de outras fontes para acompanhar diariamente a quantidade de anúncios ativos.
        </p>
      </div>

      <AddMonitoredOfferForm />

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
            <CardTitle className="text-xl">Ofertas monitoradas manualmente</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Anúncios</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const statusDescriptor = describeStatus(offer.status);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.offer_name ?? 'Sem nome'}</TableCell>
                      <TableCell>
                        <a
                          href={offer.offer_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {offer.offer_url}
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {typeof offer.last_ads_count === 'number' ? offer.last_ads_count : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof offer.last_variation === 'number' ? `${offer.last_variation.toFixed(2)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusDescriptor.tone === 'success' ? 'default' : statusDescriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                          {statusDescriptor.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <UpdateMonitoredOfferButton offerId={offer.id} currentCount={offer.last_ads_count ?? 0} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {offers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum link monitorado ainda. Cadastre o primeiro acima.
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
