import { integrationById, INTEGRATIONS } from '../integrations/catalog.js';
import { RESOURCES_PATH, RESOURCE_HEALTH_PATH } from '../core/constants.js';

let resourceCache = null;
let healthCache = null;

async function readJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch { return fallback; }
}

export async function loadResources({ refresh = false } = {}) {
  if (refresh || !resourceCache) resourceCache = await readJson(RESOURCES_PATH, []);
  if (refresh || !healthCache) healthCache = await readJson(RESOURCE_HEALTH_PATH, {});
  return resourceCache;
}

export async function loadHealth({ refresh = false } = {}) {
  await loadResources({ refresh });
  return healthCache || {};
}

function healthFor(id) {
  return healthCache?.[id] || null;
}

function bestUrl(primaryUrl, fallbackUrls, health) {
  if (health?.bestUrl) return health.bestUrl;
  if (health?.primary?.ok === false) {
    const good = (health.fallbacks || []).find(x => x.ok && x.finalUrl);
    if (good) return good.finalUrl;
  }
  return primaryUrl || fallbackUrls?.[0] || null;
}

export async function resolveResource(id) {
  const resources = await loadResources();
  const base = resources.find(x => x.id === id) || null;
  const integration = integrationById(id);
  const health = healthFor(id);
  if (!base && !integration) return null;
  const primaryUrl = integration?.primaryUrl || base?.url || null;
  const fallbackUrls = integration?.fallbackUrls || [];
  return {
    ...(base || {}),
    ...(integration || {}),
    id,
    primaryUrl,
    fallbackUrls,
    health,
    url: bestUrl(primaryUrl, fallbackUrls, health)
  };
}

export function knownIntegration(id) {
  return Boolean(integrationById(id));
}

export async function resourceHealthSummary() {
  const health = await loadHealth();
  const items = INTEGRATIONS.filter(x => x.primaryUrl).map(x => {
    const h = health?.[x.id] || null;
    return { id:x.id, name:x.name, category:x.category, primaryUrl:x.primaryUrl, health:h };
  });
  return {
    generatedAt: health?._meta?.generatedAt || null,
    items,
    healthy: items.filter(x => x.health?.ok === true || x.health?.primary?.ok === true).length,
    unknown: items.filter(x => !x.health).length
  };
}

// Important for iOS/PWA: open the tab synchronously while the user gesture is still active,
// then resolve redirects/health asynchronously. This avoids popup blocking after await().
export async function openResolvedResource(id, { query = '' } = {}) {
  let popup = null;
  try { popup = window.open('about:blank', '_blank'); } catch {}
  try {
    const item = await resolveResource(id);
    if (!item?.url) {
      if (popup) popup.close();
      return false;
    }
    let url = item.url;
    if (id === 'duden' && query) url += encodeURIComponent(query.trim());
    if (popup) {
      try { popup.opener = null; } catch {}
      popup.location.replace(url);
    } else {
      // Fallback when the browser blocks a new tab.
      window.location.href = url;
    }
    return true;
  } catch (error) {
    if (popup) popup.close();
    console.error('[DeutschWegX] open resource failed', id, error);
    return false;
  }
}
