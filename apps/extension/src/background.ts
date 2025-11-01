import {getConfig, setConfig} from './storage';
import {DEFAULT_EXTENSION_CONFIG, type ExtensionMessage, validatePayload} from './types';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await setConfig(DEFAULT_EXTENSION_CONFIG);
    console.info('[EscalAds] Default config saved. Open the options page to provide your API token.');
  }
});

chrome.runtime.onMessage.addListener((rawMessage: unknown, _sender, sendResponse) => {
  const message = rawMessage as ExtensionMessage;

  if (!message || typeof message !== 'object') {
    return false;
  }

  (async () => {
    try {
      switch (message.type) {
        case 'ESCALADS_CONFIG_UPDATED': {
          const next = await setConfig(message.payload);
          sendResponse({ok: true, config: next});
          break;
        }
        case 'ESCALADS_AD_CAPTURED': {
          const payload = validatePayload(message.payload);
          const config = await getConfig();
          if (!config.token) {
            console.warn('[EscalAds] Missing token. Ignoring captured ad.');
            sendResponse({ok: false, error: 'missing-token'});
            return;
          }

          const response = await fetch(`${config.apiBaseUrl}/ads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.token}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const body = await response.text();
            throw new Error(`Failed to ingest ad: ${response.status} ${body}`);
          }

          sendResponse({ok: true});
          break;
        }
        default: {
          sendResponse({ok: false, error: 'unknown-message'});
        }
      }
    } catch (error) {
      console.error('[EscalAds] Error while processing message', error);
      sendResponse({ok: false, error: (error as Error).message});
    }
  })();

  return true;
});
