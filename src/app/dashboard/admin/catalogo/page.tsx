import { fetchOffers } from '@/lib/supabase/queries';
import type { Offer } from '@/lib/supabase/types';
import { describeStatus } from '@/lib/monitoring/status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

async function loadOffers(): Promise<{ offers: Offer[]; error?: string }> {
  try {
    const offers = await fetchOffers();
    return { offers };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível carregar as ofertas.';
    return { offers: [], error: message };
  }
}

export default async function CatalogoAdminPage() {
  const { offers, error } = await loadOffers();

  return (
    <div className="container mx-auto max-w-7xl py-8 animate-fade-in space-y-8">
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Catálogo de ofertas</CardTitle>
          <CardDescription>
            Visualize e audite as ofertas cadastradas no Supabase. Use a interface de monitoramento para atualizar contagens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-muted-foreground">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Anúncios hoje</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const descriptor = describeStatus(offer.status);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="overflow-hidden rounded-md bg-primary/20">
                            <Image src="/placeholder.svg" alt="Capa" width={40} height={40} className="object-cover" />
                          </div>
                          <span className="font-medium text-foreground">{offer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{offer.platform ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{offer.country ?? '—'}</TableCell>
                      <TableCell className="font-semibold">{offer.total_ads_today}</TableCell>
                      <TableCell>
                        {typeof offer.variation_percent === 'number' ? `${offer.variation_percent.toFixed(2)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={descriptor.tone === 'success' ? 'default' : descriptor.tone === 'destructive' ? 'destructive' : 'secondary'}>
                          {descriptor.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {offers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhuma oferta cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
