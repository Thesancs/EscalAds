import {adSnapshotPayloadSchema, type AdSnapshotPayload} from '@escalads/shared';

export interface ExtensionConfig {
  apiBaseUrl: string;
  jwtToken: string;
  apiKey: string;
}

export type ExtensionMessage =
  | {type: 'ESCALADS_AD_CAPTURED'; payload: AdSnapshotPayload}
  | {type: 'ESCALADS_CONFIG_UPDATED'; payload: ExtensionConfig};

export const DEFAULT_EXTENSION_CONFIG: ExtensionConfig = {
  apiBaseUrl: 'http://localhost:4000',
  jwtToken: '',
  apiKey: ''
};

export function validatePayload(payload: unknown): AdSnapshotPayload {
  return adSnapshotPayloadSchema.parse(payload);
}
