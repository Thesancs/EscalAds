import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchOfferById, fetchOfferTracking } from '@/lib/supabase/queries';
import type { OfferTrackingRow } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UpdateOfferButton } from '../update-offer-button';

interface OfferDetailsPageProps {
  params: { id: string };
}

function formatVariation(value: number | null) {
  if (typeof value !== 'number') return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

export default async function OfferDetailsPage({ params }: OfferDetailsPageProps) {
  try {
    const offer = await fetchOfferById(params.id);
    const tracking = await fetchOfferTracking(params.id).catch(() => [] as OfferTrackingRow[]);
    const statusDescriptor = describeStatus(offer.status);

    const links = [
      { label: 'Página de anúncios', href: offer.ads_page_url },
      { label: 'Página de conversão', href: offer.conversion_page_url },
      { label: 'Página de checkout', href: offer.checkout_url },
    ] as const;

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/dashboard/offers" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para ofertas escaladas
            </Link>
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{offer.name}</h1>
              <p className="max-w-3xl text-muted-foreground">{offer.summary || 'Sem descrição cadastrada para esta oferta.'}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusDescriptor.tone === 'success' ? 'default' : statusDescriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                  {statusDescriptor.label}
                </Badge>
                {offer.funnel_type && <Badge variant="outline">{offer.funnel_type}</Badge>}
                {offer.niche && <Badge variant="secondary">{offer.niche}</Badge>}
                {offer.platform && <Badge variant="secondary">{offer.platform}</Badge>}
                {offer.country && <Badge variant="secondary">{offer.country}</Badge>}
              </div>
            </div>
            <UpdateOfferButton offerId={offer.id} currentCount={offer.total_ads_today} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Anúncios ativos</CardTitle>
              <CardDescription>Total de criativos em circulação hoje.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-foreground">{offer.total_ads_today}</p>
            </CardContent>
          </Card>
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Variação diária</CardTitle>
              <CardDescription>Comparativo com a última coleta realizada.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-foreground">{formatVariation(offer.variation_percent)}</p>
            </CardContent>
          </Card>
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Monitoramento</CardTitle>
              <CardDescription>Status do acompanhamento automático.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-foreground">{offer.is_monitored ? 'Ativo' : 'Manual'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Páginas estratégicas</CardTitle>
            <CardDescription>Detalhes de destino para auditoria rápida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {links.map((link) => (
              <div key={link.label} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {link.href ? link.href : 'Não cadastrada'}
                    </p>
                  </div>
                  {link.href && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                        Abrir
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Histórico diário</CardTitle>
            <CardDescription>Acompanhe a evolução de criativos e status ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {tracking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados históricos cadastrados para esta oferta.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Anúncios</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracking.map((row) => {
                    const descriptor = describeStatus(row.status);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell>{row.ads_count}</TableCell>
                        <TableCell>{formatVariation(row.variation ?? null)}</TableCell>
                        <TableCell>
                          <Badge variant={descriptor.tone === 'success' ? 'default' : descriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                            {descriptor.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load offer details', error);
    notFound();
  }
}
