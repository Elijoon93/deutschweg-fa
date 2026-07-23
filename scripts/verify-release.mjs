import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const failures = [];
const passes = [];

function pass(message) { passes.push(message); console.log(`PASS  ${message}`); }
function fail(message) { failures.push(message); console.error(`FAIL  ${message}`); }
function assert(condition, message) { condition ? pass(message) : fail(message); }
function filePath(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(filePath(rel)); }
function read(rel) { return fs.readFileSync(filePath(rel), 'utf8'); }
function parseJson(rel) {
  try { const value = JSON.parse(read(rel)); pass(`${rel} parses as JSON`); return value; }
  catch (error) { fail(`${rel} JSON parse failed: ${error.message}`); return null; }
}
function sha256(rel) { return crypto.createHash('sha256').update(fs.readFileSync(filePath(rel))).digest('hex'); }
function pngDimensions(rel) {
  const buffer = fs.readFileSync(filePath(rel));
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature || buffer.length < 24) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const required = [
  '.nojekyll', 'index.html', '404.html', 'offline.html', 'privacy.html',
  'professional-curriculum-audit.html', 'manifest.webmanifest', 'sw.js',
  'app.css', 'app-config.js', 'version.json', 'SHA256SUMS.txt',
  'LOCKED_ASSUMPTIONS.json', 'LOCKED_ASSUMPTIONS_X16_4.json',
  'HANDOFF_X16_4_FA.md', 'RELEASE_CHECKLIST_X16_4.json',
  'REMAINING_ACCEPTANCE_GATES_X16_4.json', 'QA_X16_4_STATIC.json',
  'QA_X16_4_RUNTIME.json', 'QA_X16_4_REPORT.txt',
  'assets/icon-192.png', 'assets/icon-512.png',
  'assets/screenshot-home-390x844.png',
  'assets/screenshot-session-390x844.png',
  '.gitattributes', '.github/workflows/x16-final-acceptance.yml',
  'scripts/verify-release.mjs', 'FINAL_ACCEPTANCE_X16_4_1.md',
  'ACCEPTANCE_EVIDENCE_X16_4_1.template.json',
  'scripts/promote-final-stable.mjs', 'FINAL_RELEASE_PROMOTION_X16_4_1_FA.md'
];
for (const rel of required) assert(exists(rel), `required file exists: ${rel}`);

const version = parseJson('version.json');
if (version) {
  const supported = version.version === '16.4.0' || version.version === '16.4.1';
  assert(supported, 'version.json is a supported X16.4 release');
  if (version.version === '16.4.0') {
    assert(version.channel === 'final-candidate', '16.4.0 remains final-candidate before physical acceptance');
    assert(version.build === 'professional-experience-hardening', 'candidate build identity is professional-experience-hardening');
  } else {
    assert(version.channel === 'stable', '16.4.1 channel is stable');
    assert(version.build === 'professional-experience-final-stable', 'stable build identity is professional-experience-final-stable');
  }
}

const manifest = parseJson('manifest.webmanifest');
if (manifest) {
  assert(manifest.name?.includes('X16.4'), 'manifest name contains X16.4');
  assert(manifest.start_url === './index.html', 'manifest start_url is repository-relative');
  assert(manifest.scope === './', 'manifest scope is repository-relative');
  assert(manifest.display === 'standalone', 'manifest requests standalone display');
  assert(manifest.dir === 'rtl' && manifest.lang === 'fa', 'manifest language and direction are Persian RTL');
  const icons = new Map((manifest.icons || []).map(icon => [icon.sizes, icon.src]));
  assert(icons.get('192x192') === 'assets/icon-192.png', 'manifest references 192px icon');
  assert(icons.get('512x512') === 'assets/icon-512.png', 'manifest references 512px icon');
  for (const icon of manifest.icons || []) assert(exists(icon.src), `manifest icon exists: ${icon.src}`);
  for (const shot of manifest.screenshots || []) assert(exists(shot.src), `manifest screenshot exists: ${shot.src}`);
}

const index = read('index.html');
const indexMarkers = [
  [`DeutschWeg X${version?.version || '16.4.0'}`, 'index identifies the version from version.json'],
  ['deutschweg_x14_6_integrated_state', 'legacy localStorage state key is preserved'],
  ['deutschweg-x14-6', 'legacy IndexedDB name is preserved'],
  ['deutschweg_sponsor_gate_24s_v2', 'sponsor gate key is preserved'],
  ['@persian_Germanymovie', 'sponsor channel is preserved'],
  ['@kingman007', 'presenter/admin handle is preserved'],
  ['مرکز پذیرش دستگاه و PWA', 'device and PWA acceptance center is present'],
  ['تصمیم انتشار: HOLD', 'release remains held until all acceptance gates pass'],
  ['./manifest.webmanifest', 'manifest link is repository-relative'],
  ['./app.css', 'stylesheet link is repository-relative'],
  ['./app-config.js', 'configuration script is repository-relative']
];
for (const [needle, message] of indexMarkers) assert(index.includes(needle), message);
assert(!/<script[^>]+src=["']https?:\/\//i.test(index), 'index has no externally hosted executable scripts');
assert(!/<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//i.test(index), 'index has no externally hosted stylesheet');

const sw = read('sw.js');
const expectedCache = version?.version === '16.4.1' ? 'deutschweg-x16-4-1-final-stable' : 'deutschweg-x16-4-0-professional-final-candidate';
assert(sw.includes(expectedCache), `service worker cache name matches ${version?.version}`);
assert(sw.includes(`version:'${version?.version}'`), `service worker reports version ${version?.version}`);
for (const rel of ['index.html','offline.html','manifest.webmanifest','app-config.js','app.css','privacy.html','professional-curriculum-audit.html','assets/icon-192.png','assets/icon-512.png']) {
  assert(sw.includes(`./${rel}`), `service worker precaches ${rel}`);
}

for (const [rel, width, height] of [
  ['assets/icon-192.png', 192, 192],
  ['assets/icon-512.png', 512, 512],
  ['assets/screenshot-home-390x844.png', 390, 844],
  ['assets/screenshot-session-390x844.png', 390, 844]
]) {
  if (!exists(rel)) continue;
  const dim = pngDimensions(rel);
  assert(dim?.width === width && dim?.height === height, `${rel} dimensions are ${width}x${height}`);
}

const checksums = read('SHA256SUMS.txt').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
assert(checksums.length >= 30, 'SHA256SUMS contains the release payload inventory');
for (const line of checksums) {
  const match = line.match(/^([a-f0-9]{64})\s+\.\/(.+)$/);
  if (!match) { fail(`invalid SHA256SUMS line: ${line}`); continue; }
  const [, expected, rel] = match;
  if (!exists(rel)) { fail(`checksummed file missing: ${rel}`); continue; }
  assert(sha256(rel) === expected, `checksum matches: ${rel}`);
}

for (const rel of ['RELEASE_CHECKLIST_X16_4.json','REMAINING_ACCEPTANCE_GATES_X16_4.json','QA_X16_4_STATIC.json','QA_X16_4_RUNTIME.json','LOCKED_ASSUMPTIONS.json','ACCEPTANCE_EVIDENCE_X16_4_1.template.json']) parseJson(rel);

console.log(`\nRelease verification summary: ${passes.length} passed, ${failures.length} failed.`);
if (failures.length) process.exit(1);
