import {DEFAULT_EXTENSION_CONFIG, type ExtensionConfig} from './types';

function withPromise<T>(executor: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void) {
  return new Promise<T>((resolve, reject) => executor(resolve, reject));
}

export async function getConfig(): Promise<ExtensionConfig> {
  const stored = await withPromise<ExtensionConfig>((resolve) => {
    chrome.storage.sync.get(DEFAULT_EXTENSION_CONFIG, (items) => {
      resolve(items as ExtensionConfig);
    });
  });
  return {
    ...DEFAULT_EXTENSION_CONFIG,
    ...stored
  };
}

export async function setConfig(config: Partial<ExtensionConfig>): Promise<ExtensionConfig> {
  const next = {...DEFAULT_EXTENSION_CONFIG, ...(await getConfig()), ...config};
  await withPromise<void>((resolve) => {
    chrome.storage.sync.set(next, () => resolve());
  });
  return next;
}

export async function clearConfig() {
  await withPromise<void>((resolve) => {
    chrome.storage.sync.set(DEFAULT_EXTENSION_CONFIG, () => resolve());
  });
}
