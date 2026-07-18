/* DeutschWeg safe boot — non-destructive by design.
   App updates may refresh code caches, but never remove user localStorage or IndexedDB data. */
(() => {
  'use strict';
  const CURRENT_CACHE_PREFIX = 'deutschweg-x12-2';
  try { localStorage.setItem('dw_last_safe_boot', new Date().toISOString()); } catch (_) {}
  if ('caches' in window) {
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('deutschweg-') && !k.startsWith(CURRENT_CACHE_PREFIX))
          .map(k => caches.delete(k))
    )).catch(() => {});
  }
  // Intentionally: no localStorage deletion, no IndexedDB deletion, no service-worker unregister.
})();
