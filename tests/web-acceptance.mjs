import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import process from 'node:process';

const baseURL = 'http://127.0.0.1:4173/';
const outputDir = 'test-results/web-acceptance';
await mkdir(outputDir, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const expect = (ok, message) => { if (!ok) throw new Error(message); };
const report = { version: '13.7.2-RC3', startedAt: new Date().toISOString(), checks: [], errors: [] };
const check = (name, pass, detail='') => { report.checks.push({ name, pass: !!pass, detail }); expect(pass, `${name}: ${detail}`); };

const routeExpectations = {
  'my-plan': s => s.view === 'today',
  'calendar': s => s.view === 'calendar',
  'planner': s => s.view === 'builder',
  'topics': s => s.view === 'practice' && s.tab === 'universe',
  'learning-path': s => s.view === 'practice' && s.tab === 'learn',
  'four-skills': s => s.view === 'practice' && s.tab === 'universe',
  'reading': s => s.universeOpen,
  'listening': s => s.view === 'practice' && s.tab === 'podcast',
  'speaking': s => s.view === 'practice' && s.tab === 'pron',
  'writing': s => s.view === 'practice' && s.tab === 'exercise',
  'vocabulary': s => s.vocabOpen,
  'srs': s => s.view === 'practice' && s.tab === 'cards',
  'grammar': s => s.view === 'practice' && s.tab === 'exercise',
  'stories': s => s.universeOpen,
  'media': s => s.view === 'practice' && s.tab === 'media',
  'resources': s => s.view === 'practice' && s.tab === 'resources',
  'methods': s => s.view === 'practice' && s.tab === 'methods',
  'progress': s => s.view === 'report',
  'categories': s => s.categoryOpen,
  'search': s => s.searchOpen,
  'settings': s => s.settingsOpen
};

async function runtimeState(page) {
  return page.evaluate(() => ({
    view: state.ui?.view,
    tab: state.ui?.practiceTab,
    vocabOpen: !!document.querySelector('.x134-overlay.show,.x134-shell'),
    universeOpen: !!document.querySelector('.x13-universe'),
    categoryOpen: document.getElementById('x136Drawer')?.classList.contains('show') === true,
    searchOpen: document.getElementById('searchModal')?.classList.contains('show') === true,
    settingsOpen: document.getElementById('settingsModal')?.classList.contains('show') === true
  }));
}

try {
  await sleep(1200);
  const browser = await chromium.launch({ headless: true });
  for (const device of [
    { name: 'mobile-360', width: 360, height: 800, mobile: true },
    { name: 'mobile-393', width: 393, height: 852, mobile: true },
    { name: 'tablet-768', width: 768, height: 1024, mobile: true },
    { name: 'desktop-1366', width: 1366, height: 900, mobile: false }
  ]) {
    const context = await browser.newContext({ viewport: { width: device.width, height: device.height }, isMobile: device.mobile, hasTouch: device.mobile, locale: 'fa-IR' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const fresh = await page.evaluate(() => ({ innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, wizard: document.getElementById('wizard')?.classList.contains('show') }));
    check(`${device.name}: no horizontal overflow`, fresh.doc === fresh.innerWidth && fresh.body === fresh.innerWidth, JSON.stringify(fresh));
    check(`${device.name}: onboarding visible`, fresh.wizard === true, 'fresh profile');
    check(`${device.name}: no page error`, pageErrors.length === 0, pageErrors.join(' | '));
    await page.screenshot({ path: `${outputDir}/${device.name}-onboarding.png`, fullPage: true });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, locale: 'fa-IR', acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('#wizard .wizard-actions button.primary').click();
  const selects = page.locator('#wizard select');
  await selects.nth(0).selectOption('B1');
  await selects.nth(1).selectOption('C1');
  await page.locator('#wizard .wizard-actions button.primary').click();
  for (let i=0;i<4;i++) await page.locator('#wizard .wizard-actions button.primary').click();
  await page.getByText(/ساخت برنامه و ورود/).click();
  await page.waitForTimeout(900);
  const onboarding = await page.evaluate(() => ({ setup: state.setup, current: state.profile.currentLevel, target: state.profile.targetLevel, appVersion: state.appVersion, planCount: state.plan.sessions.length }));
  check('onboarding preserves selected current level', onboarding.current === 'B1', JSON.stringify(onboarding));
  check('onboarding preserves selected target level', onboarding.target === 'C1', JSON.stringify(onboarding));
  check('runtime version is RC3', onboarding.appVersion === '13.7.2-RC3', JSON.stringify(onboarding));
  check('planner generated sessions from onboarding', onboarding.planCount > 0, String(onboarding.planCount));

  const nav = await page.locator('#bottomNav button').all();
  check('bottom navigation has five real destinations', nav.length === 5, String(nav.length));
  const expectedViews = ['view-home','view-today','view-practice','view-report','view-more'];
  for (let i=0;i<nav.length;i++) {
    await nav[i].click(); await page.waitForTimeout(220);
    const visible = await page.evaluate(() => [...document.querySelectorAll('.view')].filter(e => e.classList.contains('active')).map(e => e.id));
    check(`bottom navigation destination ${i+1}`, visible.includes(expectedViews[i]), visible.join(','));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth === innerWidth && document.body.scrollWidth === innerWidth);
    check(`bottom navigation destination ${i+1} no overflow`, overflow, expectedViews[i]);
  }

  const registry = await page.evaluate(() => DW_X1362.registry());
  check('menu registry exposes 21 tools', registry.length === 21, String(registry.length));
  for (const item of registry) {
    await page.evaluate(id => {
      document.querySelectorAll('.modal.show,.x136-drawer.show,.x134-overlay.show,.x13-overlay.show').forEach(x => x.classList.remove('show'));
      DW_X1362.open(id);
    }, item.id);
    await page.waitForTimeout(260);
    const snapshot = await runtimeState(page);
    const predicate = routeExpectations[item.id];
    check(`menu interaction: ${item.id}`, !!predicate && predicate(snapshot), JSON.stringify(snapshot));
  }

  await page.evaluate(() => { state.profile.name='Acceptance User'; state.learning.customVocab=[{id:'accept-1',word:'Prüfung',fa:'آزمون'}]; state.completed['accept-task']=true; state.notes['accept-task']='backup-roundtrip'; save(); });
  const beforeBackup = await page.evaluate(() => JSON.parse(localStorage.getItem('deutschweg_x12_user_data')));
  await page.evaluate(() => { state.profile.name='Changed User'; state.learning.customVocab=[]; delete state.completed['accept-task']; save(); });
  await page.evaluate(payload => { localStorage.setItem('deutschweg_x12_user_data', JSON.stringify(payload)); location.reload(); }, beforeBackup);
  await page.waitForLoadState('networkidle');
  const restored = await page.evaluate(() => ({ name:state.profile.name, vocab:state.learning.customVocab?.[0]?.id, completed:state.completed['accept-task'], note:state.notes['accept-task'] }));
  check('backup roundtrip restores profile', restored.name === 'Acceptance User', JSON.stringify(restored));
  check('backup roundtrip restores custom vocabulary', restored.vocab === 'accept-1', JSON.stringify(restored));
  check('backup roundtrip restores progress and notes', restored.completed === true && restored.note === 'backup-roundtrip', JSON.stringify(restored));

  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => ({ name:state.profile.name, vocab:state.learning.customVocab?.[0]?.id, completed:state.completed['accept-task'], target:state.profile.targetLevel, version:state.appVersion, schema:state.schemaVersion }));
  check('profile persists after reload/update-style boot', persisted.name === 'Acceptance User', JSON.stringify(persisted));
  check('custom vocabulary persists after reload', persisted.vocab === 'accept-1', JSON.stringify(persisted));
  check('progress marker persists after reload', persisted.completed === true, JSON.stringify(persisted));
  check('target level persists after reload', persisted.target === 'C1', JSON.stringify(persisted));
  check('runtime version remains RC3 after reload', persisted.version === '13.7.2-RC3', JSON.stringify(persisted));
  check('data schema remains 1', Number(persisted.schema) === 1, JSON.stringify(persisted));

  const content = await page.evaluate(() => DW_X137.contentStats());
  check('content authenticity counts remain explicit', content.verified === 0 && content.curated === 346 && content.candidate === 5654, JSON.stringify(content));
  const strict = await page.evaluate(() => state.x137.strictContent);
  check('Strict Content Mode defaults ON', strict === true, String(strict));
  const policy = await page.evaluate(() => window.DW_RELEASE_POLICY);
  check('release policy requires physical device pass', policy?.physicalDevicePassRequired === true && policy?.finalMayNotBeAutoClaimed === true, JSON.stringify(policy));
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported:false };
    const reg = await navigator.serviceWorker.ready;
    return { supported:true, active:!!reg.active, script:reg.active?.scriptURL||'' };
  });
  check('service worker installs and activates', sw.supported === true && sw.active === true && sw.script.endsWith('/sw.js'), JSON.stringify(sw));
  check('No browser runtime errors in full flow', errors.length === 0, errors.join(' | '));
  await page.screenshot({ path: `${outputDir}/mobile-final-state.png`, fullPage: true });
  await context.close();
  await browser.close();
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.errors.push(String(error?.stack || error));
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
  report.finishedAt = new Date().toISOString();
  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
