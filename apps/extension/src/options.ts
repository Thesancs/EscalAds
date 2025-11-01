import {getConfig, setConfig} from './storage';
import {DEFAULT_EXTENSION_CONFIG} from './types';

async function bootstrap() {
  const form = document.getElementById('options-form') as HTMLFormElement | null;
  const apiBaseInput = document.getElementById('apiBase') as HTMLInputElement | null;
  const tokenInput = document.getElementById('token') as HTMLInputElement | null;
  const status = document.getElementById('status');

  if (!form || !apiBaseInput || !tokenInput || !status) {
    console.error('[EscalAds] Options DOM not ready');
    return;
  }

  const config = await getConfig();
  apiBaseInput.value = config.apiBaseUrl || DEFAULT_EXTENSION_CONFIG.apiBaseUrl;
  tokenInput.value = config.token || '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Saving configuration...';

    const nextConfig = await setConfig({
      apiBaseUrl: apiBaseInput.value.trim() || DEFAULT_EXTENSION_CONFIG.apiBaseUrl,
      token: tokenInput.value.trim()
    });

    chrome.runtime.sendMessage({
      type: 'ESCALADS_CONFIG_UPDATED',
      payload: nextConfig
    });

    status.textContent = 'Configuration updated successfully!';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
