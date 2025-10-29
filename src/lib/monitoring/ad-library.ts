const SCRAPER_ENDPOINT = process.env.AD_LIBRARY_SCRAPER_URL;
const SCRAPER_TOKEN = process.env.AD_LIBRARY_SCRAPER_TOKEN;

export class MissingAdLibraryConfigError extends Error {
  constructor() {
    super(
      'AD_LIBRARY_SCRAPER_URL não configurado. Defina a URL do serviço responsável por retornar a contagem de anúncios ativos.',
    );
  }
}

export function extractAdLibraryIdentifier(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const idParam = parsed.searchParams.get('id');
      if (idParam) {
        return idParam;
      }

      const pathnameSegment = parsed.pathname.split('/').filter(Boolean).pop();
      return pathnameSegment ?? null;
    } catch (error) {
      console.warn('Não foi possível analisar a URL da Ad Library', error);
      return null;
    }
  }

  return trimmed;
}

export async function fetchAdLibraryAdsCount(identifier: string): Promise<number | null> {
  if (!SCRAPER_ENDPOINT) {
    throw new MissingAdLibraryConfigError();
  }

  if (!identifier) {
    return null;
  }

  const endpoint = SCRAPER_ENDPOINT.endsWith('/') ? SCRAPER_ENDPOINT.slice(0, -1) : SCRAPER_ENDPOINT;
  const url = new URL(endpoint);
  url.searchParams.set('id', identifier);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (SCRAPER_TOKEN) {
    headers.Authorization = `Bearer ${SCRAPER_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao consultar Ad Library (${response.status}): ${text}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const possibleCount =
    data.ads_count ?? data.active_ads ?? data.count ?? data.total ?? data.total_ads ?? null;

  if (typeof possibleCount === 'number' && Number.isFinite(possibleCount)) {
    return possibleCount;
  }

  return null;
}

export async function tryFetchAdsCountFromSource(source: string | null | undefined) {
  const identifier = extractAdLibraryIdentifier(source);
  if (!identifier) {
    return null;
  }

  try {
    const count = await fetchAdLibraryAdsCount(identifier);
    return count;
  } catch (error) {
    console.warn('Falha ao obter contagem de anúncios via serviço externo', {
      identifier,
      error,
    });
    return null;
  }
}
