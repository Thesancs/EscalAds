
'use client';

import {useMemo, useState, type ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Search, ArrowRight, Globe, BarChart, PlayCircle, VideoIcon} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useAuth} from '@/lib/auth-context';
import {getAds, getSummary, type GetAdsParams, getAssetDownloadUrl} from '@/lib/api-client';
import {useToast} from '@/hooks/use-toast';

const platformLabels: Record<string, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram'
};

const sortLabels: Record<string, string> = {
  recent: 'Mais recentes',
  active_days: 'Dias ativos',
  variations: 'Variações'
};

export default function DashboardPage() {
  const {token} = useAuth();
  const {toast} = useToast();
  const [filters, setFilters] = useState<GetAdsParams>({
    sortBy: 'recent',
    page: 1,
    pageSize: 9
  });

  const {data: summary, isLoading: isLoadingSummary} = useQuery({
    queryKey: ['ads-summary', token],
    queryFn: () => getSummary(token!),
    enabled: Boolean(token)
  });

  const {
    data: ads,
    isLoading: isLoadingAds,
    isFetching: isFetchingAds
  } = useQuery({
    queryKey: ['ads', token, filters],
    queryFn: () => getAds(token!, filters),
    keepPreviousData: true,
    enabled: Boolean(token)
  });

  const totalPages = useMemo(() => {
    if (!ads) return 1;
    return Math.max(1, Math.ceil(ads.total / ads.pageSize));
  }, [ads]);

  const handleDownloadAsset = async (adId: string, assetId: string) => {
    if (!token || !assetId) {
      toast({
        variant: 'destructive',
        title: 'Criativo indisponível',
        description: 'Nenhum asset foi vinculado a este anúncio ainda.'
      });
      return;
    }
    try {
      const {url} = await getAssetDownloadUrl(token, adId, assetId);
      window.open(url, '_blank', 'noopener');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível obter o criativo',
        description: 'Tente novamente em instantes ou atualize a página.'
      });
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoadingSummary ? (
          Array.from({length: 4}).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)
        ) : (
          <>
            <InsightCard
              title="Anúncios monitorados"
              value={summary?.totals.trackedAds ?? 0}
              subtitle={`${summary?.totals.recentCaptures ?? 0} capturas nos últimos 7 dias`}
            />
            <InsightCard
              title="Ativos agora"
              value={summary?.totals.activeAds ?? 0}
              subtitle="Ad Library + observações da comunidade"
            />
            <InsightCard
              title="Anunciantes únicos"
              value={summary?.totals.advertisers ?? 0}
              subtitle="Operações analisadas"
            />
            <InsightCard
              title="Tempo médio ativo"
              value={`${summary?.velocity.averageActiveDays ?? 0} dias`}
              subtitle={`${summary?.velocity.averageVariants ?? 0} variações em média`}
            />
          </>
        )}
      </section>

      <FiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isFetchingAds}
        disabled={!ads && isLoadingAds}
      />

      {summary && (
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold text-white">Top anunciantes escalados</CardTitle>
              <span className="text-xs text-muted-foreground">Ordenado por volume de criativos ativos</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.topAdvertisers.map((adv) => (
                <div key={adv.advertiserName} className="flex items-start justify-between rounded-lg border border-white/5 bg-neutral-950/40 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{adv.advertiserName}</p>
                    <p className="text-xs text-muted-foreground">
                      {adv.activeAds} anúncios ativos • {adv.avgVariants} variações
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs uppercase">
                    {adv.avgActiveDays} dias
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold text-white">Países mais quentes</CardTitle>
              <span className="text-xs text-muted-foreground">Onde os anúncios seguem ativos por mais tempo</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.topCountries.map((country) => (
                <div key={country.country} className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {country.country}
                    </Badge>
                    <span className="text-sm text-white">{country.activeAds} anúncios</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold text-white">Breakdown por plataforma</CardTitle>
              <span className="text-xs text-muted-foreground">Distribuição de criativos ativos por rede</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.platformBreakdown.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 px-3 py-3">
                  <span className="text-sm font-medium text-white">
                    {platformLabels[platform.platform] ?? platform.platform}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {platform.activeAds} ativos
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista de criativos</TabsTrigger>
          <TabsTrigger value="heatmap" disabled>
            Heatmap (em breve)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-6">
          {isLoadingAds ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({length: filters.pageSize ?? 9}).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : ads && ads.items.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ads.items.map((ad) => (
                  <Card
                    key={ad.id}
                    className="flex h-full flex-col justify-between border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-950/70 shadow-lg transition hover:border-primary/50 hover:shadow-primary/20"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {platformLabels[ad.platform] ?? ad.platform}
                        </Badge>
                        <Badge variant="outline" className="font-mono uppercase">
                          {ad.metrics?.activeDays ?? 0} dias
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg font-semibold">{ad.headline ?? ad.primaryText ?? 'Criativo sem título'}</CardTitle>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{ad.primaryText ?? 'Sem descrição disponível para este criativo.'}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <MetricPill label="Países" value={ad.countries.join(', ') || 'não informado'} icon={<Globe className="h-3 w-3" />} />
                        <MetricPill
                          label="Variações"
                          value={String(ad.variationsCount)}
                          icon={<BarChart className="h-3 w-3" />}
                        />
                        <MetricPill
                          label="Observações"
                          value={String(ad.metrics?.totalObservations ?? 0)}
                          icon={<VideoIcon className="h-3 w-3" />}
                        />
                        <MetricPill
                          label="Atualizado"
                          value={new Date(ad.lastSeenAt).toLocaleDateString('pt-BR')}
                          icon={<PlayCircle className="h-3 w-3" />}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full justify-between"
                        onClick={() => handleDownloadAsset(ad.id, ad.assets[0]?.id ?? '')}
                        disabled={!ad.assets.length}
                      >
                        Ver criativos
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900/70 px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  Página {ads.page} de {totalPages} — {ads.total} anúncios
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((prev) => ({...prev, page: Math.max(1, (prev.page ?? 1) - 1)}))}
                    disabled={(filters.page ?? 1) === 1 || isFetchingAds}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(totalPages, (prev.page ?? 1) + 1)
                      }))
                    }
                    disabled={(filters.page ?? 1) >= totalPages || isFetchingAds}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="border-white/10 bg-neutral-900/60">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Nenhum criativo encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajuste os filtros ou utilize palavras-chave diferentes para ampliar sua pesquisa.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FiltersBarProps {
  filters: GetAdsParams;
  onFiltersChange: (filters: GetAdsParams) => void;
  isLoading: boolean;
  disabled?: boolean;
}

function FiltersBar({filters, onFiltersChange, isLoading, disabled}: FiltersBarProps) {
  return (
    <Card className="border-white/10 bg-neutral-900/80 backdrop-blur">
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Busque por produto, promessa, copy, CTA..."
              className="pl-9"
              value={filters.query ?? ''}
              onChange={(event) => onFiltersChange({...filters, page: 1, query: event.target.value})}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <Select
              value={filters.platform ?? 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  page: 1,
                  platform: value === 'all' ? undefined : (value as GetAdsParams['platform'])
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="País (ex: BR, US)"
              value={filters.country ?? ''}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  page: 1,
                  country: event.target.value.toUpperCase()
                })
              }
              disabled={disabled}
            />
            <Select
              value={filters.sortBy ?? 'recent'}
              onValueChange={(value) => onFiltersChange({...filters, sortBy: value as GetAdsParams['sortBy']})}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{sortLabels.recent}</SelectItem>
                <SelectItem value="active_days">{sortLabels.active_days}</SelectItem>
                <SelectItem value="variations">{sortLabels.variations}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled>
              Salvar filtro (em breve)
            </Button>
          </div>
        </div>
        {isLoading && (
          <span className="text-xs text-muted-foreground">
            Atualizando resultados com os filtros selecionados...
          </span>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

function InsightCard({title, value, subtitle}: InsightCardProps) {
  return (
    <Card className="border-white/10 bg-neutral-900/70 shadow-lg">
      <CardHeader className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <CardTitle className="text-3xl font-semibold text-white">{value}</CardTitle>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </CardHeader>
    </Card>
  );
}

interface MetricPillProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function MetricPill({label, value, icon}: MetricPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-neutral-900/60 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-white">{value}</span>
      </div>
    </div>
  );
}
