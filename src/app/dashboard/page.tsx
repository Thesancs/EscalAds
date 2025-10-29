import { fetchMonitoredOffers, fetchOffers } from '@/lib/supabase/queries';
import type { Offer, MonitoredOffer } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CombinedRow {
  id: string;
  name: string;
  ads: number;
  variation: number | null;
  status: Offer['status'];
  source: 'offer' | 'monitored';
}

async function loadData() {
  try {
    const [offers, monitored] = await Promise.all([fetchOffers(), fetchMonitoredOffers()]);
    return { offers, monitored, error: null as string | null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível conectar ao Supabase.';
    return { offers: [] as Offer[], monitored: [] as MonitoredOffer[], error: message };
  }
}

function buildCombinedRows(offers: Offer[], monitored: MonitoredOffer[]): CombinedRow[] {
  const offerRows: CombinedRow[] = offers.map((offer) => ({
    id: offer.id,
    name: offer.name,
    ads: offer.total_ads_today,
    variation: offer.variation_percent,
    status: offer.status,
    source: 'offer',
  }));

  const monitoredRows: CombinedRow[] = monitored.map((offer) => ({
    id: offer.id,
    name: offer.offer_name ?? offer.offer_url,
    ads: offer.last_ads_count ?? 0,
    variation: offer.last_variation,
    status: offer.status,
    source: 'monitored',
  }));

  return [...offerRows, ...monitoredRows];
}

export default async function DashboardPage() {
  const { offers, monitored, error } = await loadData();
  const combined = buildCombinedRows(offers, monitored);

  const totalOffers = offers.length;
  const totalMonitored = monitored.length;
  const totalAds = combined.reduce((acc, item) => acc + (item.ads ?? 0), 0);
  const scaling = combined.filter((item) => item.status === 'escalando');
  const falling = combined.filter((item) => item.status === 'caindo');
  const topGrowth = [...combined]
    .filter((row) => typeof row.variation === 'number')
    .sort((a, b) => (b.variation ?? 0) - (a.variation ?? 0))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inteligência de anúncios</h1>
        <p className="text-muted-foreground max-w-3xl">
          Visão consolidada do volume de anúncios ativos, variações percentuais e status diário das suas ofertas escaladas e links monitorados.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Supabase não configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error}. Configure as variáveis <code>SUPABASE_URL</code> e <code>SUPABASE_ANON_KEY</code> para carregar os dados em tempo real.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Ofertas escaladas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalOffers}</p>
                <p className="text-sm text-muted-foreground">com contagem diária monitorada</p>
              </CardContent>
            </Card>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Links monitorados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalMonitored}</p>
                <p className="text-sm text-muted-foreground">cadastrados manualmente</p>
              </CardContent>
            </Card>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Anúncios ativos hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalAds}</p>
                <p className="text-sm text-muted-foreground">somando ofertas escaladas e monitoradas</p>
              </CardContent>
            </Card>
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Status geral</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{scaling.length}</p>
                  <p className="text-xs text-muted-foreground">escalando</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{combined.length - scaling.length - falling.length}</p>
                  <p className="text-xs text-muted-foreground">estáveis</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{falling.length}</p>
                  <p className="text-xs text-muted-foreground">caindo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <Card className="glassmorphic">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">Variações de destaque</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ofertas com maior crescimento percentual nas últimas atualizações.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/offers">Ver escaladas</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/monitored">Ver monitoradas</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {topGrowth.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma atualização registrada ainda.</p>
                ) : (
                  topGrowth.map((row) => {
                    const descriptor = describeStatus(row.status);
                    const formattedVariation =
                      row.variation !== null
                        ? `${row.variation > 0 ? '+' : ''}${row.variation.toFixed(2)}%`
                        : '—';
                    return (
                      <div key={`${row.source}-${row.id}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                        <div>
                          <p className="font-semibold text-foreground">{row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.source === 'offer' ? 'Oferta escalada' : 'Link monitorado'} • {row.ads} anúncios ativos
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={descriptor.tone === 'success' ? 'default' : descriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                            {descriptor.label}
                          </Badge>
                          <p className="text-sm font-semibold text-emerald-400">{formattedVariation}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="text-xl">Próximos passos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Configure uma rotina diária (cron job ou Supabase Edge Function) para chamar <code>updateAllOffersDaily</code> e manter as variações atualizadas automaticamente.
                </p>
                <p>
                  Utilize o botão “Atualizar contagem” em cada listagem para registrar coletas manuais durante o dia.
                </p>
                <p>
                  As variações maiores ou iguais a 10% são marcadas como <span className="text-emerald-400 font-medium">escalando</span>, enquanto quedas de -10% sinalizam <span className="text-red-400 font-medium">caindo</span>.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
