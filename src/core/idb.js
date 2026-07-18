import { IDB_NAME, IDB_VERSION } from './constants.js';

let dbPromise;

function ensureStore(db, name, options) {
  if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, options);
}

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      ensureStore(db, 'state');
      ensureStore(db, 'meta');
      ensureStore(db, 'backups', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) {
        const s = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        s.createIndex('by_type', 'type', { unique: false });
        s.createIndex('by_at', 'at', { unique: false });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const s = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        s.createIndex('by_status', 'status', { unique: false });
      }
      ensureStore(db, 'resource_cache');
      ensureStore(db, 'placement_results', { keyPath: 'id' });
      ensureStore(db, 'gadget_state');
      ensureStore(db, 'integration_cache');
      ensureStore(db, 'dictionary_history', { keyPath: 'id' });
      ensureStore(db, 'pronunciation_history', { keyPath: 'id' });
      ensureStore(db, 'podcast_history', { keyPath: 'id' });
      ensureStore(db, 'writing_history', { keyPath: 'id' });
      ensureStore(db, 'coach_history', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => console.warn('[DeutschWegX] IndexedDB upgrade blocked by another open tab.');
  });
  return dbPromise;
}

export async function idbPut(store, key, value) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbPutValue(store, value) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbAdd(store, value) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).add(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(store, key) {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetAll(store) {
  const db = await openDatabase();
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbDelete(store, key) {
  const db = await openDatabase();
  if (!db) return false;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export { openDatabase };
