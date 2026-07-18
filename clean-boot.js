(() => {
  const BOOT_FLAG = 'dw_x12_clean_boot_done';
  const CURRENT_CACHE_PREFIX = 'deutschweg-x12';
  if (sessionStorage.getItem(BOOT_FLAG) === '1') return;
  sessionStorage.setItem(BOOT_FLAG, '1');

  const keep = new Set(['deutschweg_x12_user_data']);
  try {
    Object.keys(localStorage).forEach((key) => {
      if (!keep.has(key) && /^(deutsch|dw_|deutschweg)/i.test(key)) localStorage.removeItem(key);
    });
  } catch (_) {}

  Promise.allSettled([
    'caches' in window
      ? caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CURRENT_CACHE_PREFIX)).map((k) => caches.delete(k))))
      : Promise.resolve(),
    'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((r) => r.unregister())))
      : Promise.resolve(),
    new Promise((resolve) => {
      if (!('indexedDB' in window)) return resolve();
      const req = indexedDB.deleteDatabase('deutschweg_x12');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    })
  ]).finally(() => {
    const u = new URL(location.href);
    if (u.searchParams.get('clean') !== '12') {
      u.searchParams.set('clean', '12');
      location.replace(u.toString());
    }
  });
})();
