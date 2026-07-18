import {
  ARCHITECTURE_VERSION,
  DATA_SCHEMA_VERSION,
  LEGACY_STORAGE_KEY,
  LEGACY_KEYS,
  FOUNDATION_MARKER
} from './constants.js';
import { idbPut, idbAdd, idbGet } from './idb.js';

function safeParse(text) {
  try { return JSON.parse(text || '{}'); } catch { return null; }
}

export function readAppStateState() {
  const keys = [LEGACY_STORAGE_KEY, ...LEGACY_KEYS];
  for (const key of keys) {
    try {
      const text = localStorage.getItem(key);
      if (!text) continue;
      const parsed = safeParse(text);
      if (parsed && typeof parsed === 'object') return { key, text, state: parsed };
    } catch {}
  }
  return null;
}

async function createArchitectureBackup(record) {
  if (!record?.text) return;
  const existing = await idbGet('meta', FOUNDATION_MARKER);
  if (existing) return;
  const at = new Date().toISOString();
  await idbAdd('backups', {
    id: `pre-${ARCHITECTURE_VERSION}-${at}`,
    type: 'pre-architecture-upgrade',
    architectureVersion: ARCHITECTURE_VERSION,
    sourceKey: record.key,
    schemaVersion: Number(record.state?.schemaVersion || record.state?.version || 1),
    appVersion: record.state?.appVersion || 'app',
    at,
    payload: record.text
  });
  await idbPut('meta', FOUNDATION_MARKER, {
    architectureVersion: ARCHITECTURE_VERSION,
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    createdAt: at
  });
}

export async function mirrorAppState(reason = 'bootstrap') {
  const record = readAppStateState();
  if (!record) return null;
  await createArchitectureBackup(record);
  await idbPut('state', 'current', {
    architectureVersion: ARCHITECTURE_VERSION,
    sourceKey: record.key,
    mirroredAt: new Date().toISOString(),
    reason,
    payload: record.state
  });
  return record.state;
}

export function installDualWriteBridge() {
  const originalSave = typeof window.save === 'function' ? window.save : null;
  if (!originalSave || originalSave.__deutschwegXWrapped) return;
  const wrapped = function (...args) {
    const result = originalSave.apply(this, args);
    queueMicrotask(() => mirrorAppState('app-save').catch(() => {}));
    return result;
  };
  wrapped.__deutschwegXWrapped = true;
  window.save = wrapped;
}

export async function requestPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return { supported: false, persisted: false };
    const already = navigator.storage.persisted ? await navigator.storage.persisted() : false;
    const persisted = already || await navigator.storage.persist();
    return { supported: true, persisted };
  } catch {
    return { supported: true, persisted: false };
  }
}

export async function initDataBridge() {
  const before = readAppStateState();
  if (before) await createArchitectureBackup(before);
  await mirrorAppState('x1-init');
  installDualWriteBridge();
  const persistence = await requestPersistentStorage();
  return { appFound: Boolean(before), persistence };
}
