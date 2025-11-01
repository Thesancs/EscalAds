import {adSnapshotPayloadSchema, type AdSnapshotPayload} from '@escalads/shared';

export interface ExtensionConfig {
  apiBaseUrl: string;
  token: string;
}

export type ExtensionMessage =
  | {type: 'ESCALADS_AD_CAPTURED'; payload: AdSnapshotPayload}
  | {type: 'ESCALADS_CONFIG_UPDATED'; payload: ExtensionConfig};

export const DEFAULT_EXTENSION_CONFIG: ExtensionConfig = {
  apiBaseUrl: 'http://localhost:4000',
  token: ''
};

export function validatePayload(payload: unknown): AdSnapshotPayload {
  return adSnapshotPayloadSchema.parse(payload);
}
