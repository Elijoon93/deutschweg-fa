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
const report = { version: '13.7.1-RC2', startedAt: new Date().toISOString(), checks: [], errors: [] };
const check = (name, pass, detail='') => { report.checks.push({ name, pass: !!pass, detail }); expect(pass, `${name}: ${detail}`); };

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
  await page.waitForTimeout(1000);
  const onboarding = await page.evaluate(() => ({ setup: state.setup, current: state.profile.currentLevel, target: state.profile.targetLevel, appVersion: state.appVersion, planCount: state.plan.sessions.length }));
  check('onboarding preserves selected current level', onboarding.current === 'B1', JSON.stringify(onboarding));
  check('onboarding preserves selected target level', onboarding.target === 'C1', JSON.stringify(onboarding));
  check('runtime version is not downgraded by legacy layer', onboarding.appVersion === '13.7.1-RC2', JSON.stringify(onboarding));
  check('planner generated sessions from onboarding', onboarding.planCount > 0, String(onboarding.planCount));

  const nav = await page.locator('#bottomNav button').all();
  check('bottom navigation has five real destinations', nav.length === 5, String(nav.length));
  const expectedViews = ['view-home','view-today','view-practice','view-report','view-more'];
  for (let i=0;i<nav.length;i++) {
    await nav[i].click(); await page.waitForTimeout(250);
    const visible = await page.evaluate(() => [...document.querySelectorAll('.view')].filter(e => e.classList.contains('active')).map(e => e.id));
    check(`bottom navigation destination ${i+1}`, visible.includes(expectedViews[i]), visible.join(','));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth === innerWidth && document.body.scrollWidth === innerWidth);
    check(`bottom navigation destination ${i+1} no overflow`, overflow, expectedViews[i]);
  }

  await page.locator('#bottomNav button').last().click();
  const appCount = await page.locator('#dw1362AllApps .dw1362-app').count();
  check('More drawer exposes all 21 registered tools', appCount === 21, String(appCount));
  const unreachable = await page.locator('#dw1362AllApps .x137-unreachable').count();
  check('No registered tool is marked unreachable', unreachable === 0, String(unreachable));
  const routeAudit = await page.evaluate(() => DW_X137.automaticChecks().find(x => x.id === 'menu-routes'));
  check('Runtime route audit passes', routeAudit?.pass === true && routeAudit?.detail === '21/21', JSON.stringify(routeAudit));

  await page.evaluate(() => { state.profile.name='Acceptance User'; state.learning.customVocab=[{id:'accept-1',word:'Prüfung',fa:'آزمون'}]; state.completed['accept-task']=true; save(); });
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => ({ name:state.profile.name, vocab:state.learning.customVocab?.[0]?.id, completed:state.completed['accept-task'], target:state.profile.targetLevel, version:state.appVersion }));
  check('profile persists after reload/update-style boot', persisted.name === 'Acceptance User', JSON.stringify(persisted));
  check('custom vocabulary persists after reload', persisted.vocab === 'accept-1', JSON.stringify(persisted));
  check('progress marker persists after reload', persisted.completed === true, JSON.stringify(persisted));
  check('target level persists after reload', persisted.target === 'C1', JSON.stringify(persisted));
  check('runtime version remains RC2 after reload', persisted.version === '13.7.1-RC2', JSON.stringify(persisted));

  const content = await page.evaluate(() => DW_X137.contentStats());
  check('content authenticity counts remain explicit', content.verified === 0 && content.curated === 346 && content.candidate === 5654, JSON.stringify(content));
  const strict = await page.evaluate(() => state.x137.strictContent);
  check('Strict Content Mode defaults ON', strict === true, String(strict));
  check('No browser runtime errors in full flow', errors.length === 0, errors.join(' | '));
  await page.screenshot({ path: `${outputDir}/mobile-home-after-onboarding.png`, fullPage: true });
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
