import {getConfig, setConfig} from './storage';
import {DEFAULT_EXTENSION_CONFIG} from './types';

async function bootstrap() {
  const form = document.getElementById('options-form') as HTMLFormElement | null;
  const apiBaseInput = document.getElementById('apiBase') as HTMLInputElement | null;
  const jwtInput = document.getElementById('jwtToken') as HTMLInputElement | null;
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement | null;
  const status = document.getElementById('status');

  if (!form || !apiBaseInput || !jwtInput || !apiKeyInput || !status) {
    console.error('[EscalAds] Options DOM not ready');
    return;
  }

  const config = await getConfig();
  apiBaseInput.value = config.apiBaseUrl || DEFAULT_EXTENSION_CONFIG.apiBaseUrl;
  jwtInput.value = config.jwtToken || '';
  apiKeyInput.value = config.apiKey || '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Saving configuration...';

    const nextConfig = await setConfig({
      apiBaseUrl: apiBaseInput.value.trim() || DEFAULT_EXTENSION_CONFIG.apiBaseUrl,
      jwtToken: jwtInput.value.trim(),
      apiKey: apiKeyInput.value.trim()
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
