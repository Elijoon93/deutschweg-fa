import { integrationById } from '../integrations/catalog.js';

let resourceCache = null;
let healthCache = null;

async function readJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch { return fallback; }
}

export async function loadResources() {
  if (!resourceCache) resourceCache = await readJson('./resources.json', []);
  if (!healthCache) healthCache = await readJson('./resource-health.json', {});
  return resourceCache;
}

export async function resolveResource(id) {
  const resources = await loadResources();
  const base = resources.find(x => x.id === id) || null;
  const integration = integrationById(id);
  const health = healthCache?.[id] || null;
  if (!base && !integration) return null;
  const primaryUrl = integration?.primaryUrl || base?.url || null;
  const fallbackUrls = integration?.fallbackUrls || [];
  return {
    ...(base || {}),
    ...(integration || {}),
    id,
    url: primaryUrl,
    primaryUrl,
    fallbackUrls,
    health
  };
}

export async function openResolvedResource(id) {
  const item = await resolveResource(id);
  if (!item?.url) return false;
  window.open(item.url, '_blank', 'noopener,noreferrer');
  return true;
}
