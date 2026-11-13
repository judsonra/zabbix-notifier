import type { StoredData } from './types';

const extensionGlobal = globalThis as typeof globalThis & { browser?: typeof chrome };
export const api = extensionGlobal.browser ?? chrome;

export async function readStorage(): Promise<StoredData> {
  return await api.storage.local.get(['config', 'state', 'controls']) as StoredData;
}
export async function writeStorage(data: Partial<StoredData>): Promise<void> {
  await api.storage.local.set(data);
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
