import {adSnapshotPayloadSchema, type AdSnapshotPayload} from '@escalads/shared';
import type {ExtensionMessage} from './types';

const AD_CARD_SELECTORS = [
  'div[data-testid="ad-card"]',
  'div[role="article"][data-pagelet]',
  'div[data-ad-preview="true"]'
];

const seenAds = new Set<string>();
let scanTimeout: number | null = null;

function scheduleScan(delay = 1000) {
  if (scanTimeout !== null) {
    window.clearTimeout(scanTimeout);
  }
  scanTimeout = window.setTimeout(() => {
    scanTimeout = null;
    scanForAds();
  }, delay) as unknown as number;
}

function scanForAds() {
  const selector = AD_CARD_SELECTORS.join(',');
  const adElements = document.querySelectorAll<HTMLElement>(selector);

  adElements.forEach((element) => {
    const adId = ensureAdId(element);
    if (seenAds.has(adId)) {
      return;
    }

    const payload = buildPayloadFromElement(element, adId);
    if (!payload) {
      return;
    }

    seenAds.add(adId);
    sendToBackground({type: 'ESCALADS_AD_CAPTURED', payload});
  });
}

function ensureAdId(element: HTMLElement) {
  const existing = element.getAttribute('data-escalads-id');
  if (existing) {
    return existing;
  }

  const domId = element.getAttribute('data-ad-id') ?? element.getAttribute('data-test-ad-id') ?? element.getAttribute('data-testid');
  if (domId) {
    element.setAttribute('data-escalads-id', domId);
    return domId;
  }

  const base = element.innerText.slice(0, 120);
  let hash = 0;
  for (let index = 0; index < base.length; index += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(index);
    hash |= 0;
  }
  const id = `ad-${Math.abs(hash).toString(16)}`;
  element.setAttribute('data-escalads-id', id);
  return id;
}

function buildPayloadFromElement(element: HTMLElement, adId: string): AdSnapshotPayload | null {
  const advertiserName = element.querySelector('a[role="link"], a[aria-label]')?.textContent?.trim();
  const primaryText = element.querySelector('[data-ad-preview-primary-text], div[data-content-feature="ad-text"]')?.textContent?.trim();
  const headline = element.querySelector('h4, h3, strong')?.textContent?.trim() ?? null;
  const cta = element.querySelector('a[role="button"] span, button span')?.textContent?.trim() ?? null;

  const assetCandidates: Array<AdSnapshotPayload['assets'][number]> = [];

  element.querySelectorAll('img').forEach((img) => {
    const src = img.src;
    if (!src || src.startsWith('data:')) {
      return;
    }
    assetCandidates.push({
      type: 'IMAGE',
      url: src,
      mimeType: img.currentSrc?.includes('.png') ? 'image/png' : 'image/jpeg',
      width: img.naturalWidth || null,
      height: img.naturalHeight || null,
      durationMs: null
    });
  });

  element.querySelectorAll('video').forEach((video) => {
    const src = video.currentSrc || video.src;
    if (!src) {
      return;
    }
    assetCandidates.push({
      type: 'VIDEO',
      url: src,
      mimeType: 'video/mp4',
      width: video.videoWidth || null,
      height: video.videoHeight || null,
      durationMs: Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : null
    });
  });

  if (!advertiserName && !primaryText) {
    return null;
  }

  const creativeFormat = assetCandidates.some((asset) => asset.type === 'VIDEO')
    ? 'VIDEO'
    : assetCandidates.length > 1
      ? 'CAROUSEL'
      : 'IMAGE';

  const payload = {
    adLibraryId: adId,
    platform: window.location.hostname.includes('instagram') ? 'INSTAGRAM' : 'FACEBOOK',
    advertiserName: advertiserName ?? 'Unknown advertiser',
    pageUrl: window.location.href,
    primaryText: primaryText ?? null,
    headline,
    callToAction: cta,
    countries: [],
    languages: [],
    creativeFormat,
    spendBucket: null,
    impressionsRange: null,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    assets: assetCandidates.length > 0 ? assetCandidates : []
  } satisfies Omit<AdSnapshotPayload, 'raw'>;

  const validated = adSnapshotPayloadSchema.safeParse(payload);
  if (!validated.success) {
    console.debug('[EscalAds] Skipping card: schema validation failed', validated.error);
    return null;
  }

  return {
    ...validated.data,
    raw: {
      html: element.innerHTML.slice(0, 4000)
    }
  } satisfies AdSnapshotPayload;
}

function sendToBackground(message: ExtensionMessage) {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[EscalAds] Failed to send message', chrome.runtime.lastError.message);
      return;
    }

    if (!response?.ok) {
      console.warn('[EscalAds] API rejected ad payload', response?.error);
    }
  });
}

const observer = new MutationObserver(() => scheduleScan());
observer.observe(document.documentElement, {childList: true, subtree: true});

scheduleScan(500);


