import fs from 'node:fs/promises';

const resources = JSON.parse(await fs.readFile(new URL('../resources.json', import.meta.url), 'utf8'));
const out = { _meta: { generatedAt: new Date().toISOString(), checked: resources.length } };

async function check(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(item.url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'DeutschWeg-LinkHealth/1.0' }
    });
    clearTimeout(timer);
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: String(error?.name || error), checkedAt: new Date().toISOString() };
  }
}

for (const item of resources) {
  if (!item?.id || !item?.url) continue;
  out[item.id] = await check(item);
}

await fs.writeFile(new URL('../resource-health.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`Checked ${Object.keys(out).length - 1} resources.`);
