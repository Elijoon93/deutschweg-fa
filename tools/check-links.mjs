import fs from 'node:fs/promises';
import { INTEGRATIONS } from '../src/integrations/catalog.js';

const resources = JSON.parse(await fs.readFile(new URL('../resources.json', import.meta.url), 'utf8'));
const byId = new Map(resources.filter(x=>x?.id).map(x=>[x.id, x]));
for (const integration of INTEGRATIONS) {
  if (!integration?.id || !integration?.primaryUrl) continue;
  const old = byId.get(integration.id) || {};
  byId.set(integration.id, {
    ...old,
    id: integration.id,
    name: integration.name || old.name,
    url: integration.primaryUrl,
    fallbackUrls: integration.fallbackUrls || []
  });
}

const targets = [...byId.values()].filter(x=>x?.id && x?.url && /^https?:/i.test(x.url));
const out = { _meta: { generatedAt: new Date().toISOString(), checked: targets.length, checker:'DeutschWeg-X1' } };

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 DeutschWeg-LinkHealth/1.1' }
    });
    return { ok: res.ok, status: res.status, finalUrl: res.url, checkedAt: new Date().toISOString() };
  } catch (error) {
    return { ok:false, status:0, error:String(error?.name || error), checkedAt:new Date().toISOString() };
  } finally { clearTimeout(timer); }
}

async function checkItem(item) {
  const primary = await checkUrl(item.url);
  const fallbacks = [];
  if (!primary.ok) {
    for (const url of item.fallbackUrls || []) {
      const h = await checkUrl(url);
      fallbacks.push({ url, ...h });
      if (h.ok) break;
    }
  }
  const goodFallback = fallbacks.find(x=>x.ok);
  return {
    ok: primary.ok || Boolean(goodFallback),
    primary: { url:item.url, ...primary },
    fallbacks,
    bestUrl: primary.ok ? primary.finalUrl || item.url : goodFallback?.finalUrl || goodFallback?.url || item.url
  };
}

const concurrency = 5;
let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const index = cursor++;
    const item = targets[index];
    out[item.id] = await checkItem(item);
    console.log(`${item.id}: ${out[item.id].ok ? 'OK' : 'FAIL'} -> ${out[item.id].bestUrl}`);
  }
}
await Promise.all(Array.from({length:Math.min(concurrency, targets.length)}, worker));
await fs.writeFile(new URL('../resource-health.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`Checked ${targets.length} resources.`);
