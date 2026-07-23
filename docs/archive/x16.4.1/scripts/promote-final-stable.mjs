import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const evidencePath = path.join(root, 'ACCEPTANCE_EVIDENCE_X16_4_2.json');
const templatePath = path.join(root, 'ACCEPTANCE_EVIDENCE_X16_4_2.template.json');

function stop(message) {
  console.error(`PROMOTION BLOCKED: ${message}`);
  process.exit(1);
}
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function write(rel, content) { fs.writeFileSync(path.join(root, rel), content); }
function isPass(value) { return String(value || '').toLowerCase() === 'pass'; }

if (!fs.existsSync(evidencePath)) {
  stop(`Create ACCEPTANCE_EVIDENCE_X16_4_2.json from ${path.basename(templatePath)} and record objective evidence first.`);
}

let evidence;
try { evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8')); }
catch (error) { stop(`Acceptance evidence is not valid JSON: ${error.message}`); }

const missing = [];
const automatedKeys = ['githubActions','publishedVersionJson','publishedChecksums','serviceWorker','offlineReload','backupRestore'];
for (const key of automatedKeys) if (!isPass(evidence.automated?.[key]?.status)) missing.push(`automated.${key}.status`);

const androidKeys = ['tts','microphone','recordPlayback','speechRecognition','pwaInstall','standalone','offline','persistence'];
if (!isPass(evidence.android?.status)) missing.push('android.status');
for (const key of androidKeys) if (!isPass(evidence.android?.[key])) missing.push(`android.${key}`);
if (!evidence.android?.device || !evidence.android?.androidVersion || !evidence.android?.browser) missing.push('android device metadata');

const iphoneKeys = ['tts','microphone','recordPlayback','speechRecognitionOrFallback','addToHomeScreen','standalone','offline','persistence'];
if (!isPass(evidence.iphone?.status)) missing.push('iphone.status');
for (const key of iphoneKeys) if (!isPass(evidence.iphone?.[key])) missing.push(`iphone.${key}`);
if (!evidence.iphone?.device || !evidence.iphone?.iosVersion || !evidence.iphone?.safariVersion) missing.push('iPhone device metadata');

if (!isPass(evidence.beginnerUsability?.status)) missing.push('beginnerUsability.status');
for (const learner of ['learner1','learner2']) {
  if (evidence.beginnerUsability?.[learner]?.completedWithoutExternalHelp !== true) missing.push(`beginnerUsability.${learner}.completedWithoutExternalHelp`);
  if ((evidence.beginnerUsability?.[learner]?.criticalFindings || []).length) missing.push(`beginnerUsability.${learner}.criticalFindings`);
}

if (!isPass(evidence.humanLanguageReview?.status)) missing.push('humanLanguageReview.status');
for (const level of ['A1','A2','B1','B2','C1','C2']) if (!isPass(evidence.humanLanguageReview?.[level])) missing.push(`humanLanguageReview.${level}`);
if ((evidence.humanLanguageReview?.openCriticalOrHighFindings || []).length) missing.push('humanLanguageReview.openCriticalOrHighFindings');

if (Number(evidence.signoff?.criticalDefects) !== 0) missing.push('signoff.criticalDefects');
if (Number(evidence.signoff?.highDefects) !== 0) missing.push('signoff.highDefects');
if (!evidence.signoff?.approvedBy || !evidence.signoff?.approvedAt) missing.push('signoff approval identity/date');

if (missing.length) stop(`Mandatory evidence is incomplete:\n- ${missing.join('\n- ')}`);

const version = JSON.parse(read('version.json'));
if (version.version !== '16.4.1' || version.channel !== 'review-candidate') {
  stop(`Expected 16.4.1 review-candidate baseline, found ${version.version} ${version.channel}.`);
}

const approvedDate = String(evidence.signoff.approvedAt).slice(0, 10);
write('version.json', JSON.stringify({
  version: '16.4.2',
  channel: 'stable',
  build: 'professional-experience-final-stable',
  date: approvedDate
}, null, 2) + '\n');

let index = read('index.html');
index = index.replaceAll('X16.4.1', 'X16.4.2');
index = index.replaceAll('Level-Aware Entry & Sponsor 26s Review Candidate', 'Professional Experience Final Stable');
index = index.replaceAll('Review Candidate', 'Final Stable');
index = index.replace(/const VERSION=['"]16\.4\.1['"]/g, "const VERSION='16.4.2'");
index = index.replace(/const X1631_VERSION=['"]16\.4\.1['"]/g, "const X1631_VERSION='16.4.2'");
write('index.html', index);
write('404.html', index);

const manifest = JSON.parse(read('manifest.webmanifest'));
manifest.name = 'DeutschWeg X16.4.2 — Professional Adaptive Coach';
manifest.description = 'نسخه پایدار مسیر حرفه‌ای آلمانی A1 تا C2 با شروع سطح‌محور، مربی تطبیقی و پذیرش واقعی ثبت‌شده.';
write('manifest.webmanifest', JSON.stringify(manifest, null, 2) + '\n');

let sw = read('sw.js');
sw = sw.replace('deutschweg-x16-4-1-level-aware-sponsor-26s-review', 'deutschweg-x16-4-2-final-stable');
sw = sw.replaceAll("version:'16.4.1'", "version:'16.4.2'");
write('sw.js', sw);

const notes = `# DeutschWeg X16.4.2 — Final Stable\n\nPromoted from X16.4.1 Review Candidate after objective acceptance evidence was completed in \`ACCEPTANCE_EVIDENCE_X16_4_2.json\`.\n\n- Android acceptance: PASS\n- iPhone acceptance: PASS\n- PWA install/offline/persistence: PASS\n- Beginner usability: PASS\n- Human language review A1–C2: PASS\n- Critical defects: 0\n- High defects: 0\n- Approved by: ${evidence.signoff.approvedBy}\n- Approved at: ${evidence.signoff.approvedAt}\n`;
write('RELEASE_NOTES_X16_4_2_FINAL_STABLE.md', notes);

const excluded = new Set([
  './SHA256SUMS.txt',
  './PUBLISH_X16_4_FINAL_ACCEPTANCE.ps1',
  './ACCEPTANCE_EVIDENCE_X16_4_2.json'
]);
function walk(dir, prefix = '.') {
  const rows = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}/${entry.name}`;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) rows.push(...walk(abs, rel));
    else if (!excluded.has(rel)) rows.push(rel);
  }
  return rows;
}
const files = walk(root).sort();
const sums = files.map(rel => `${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel.slice(2)))).digest('hex')}  ${rel}`).join('\n') + '\n';
write('SHA256SUMS.txt', sums);

execFileSync(process.execPath, ['scripts/verify-release.mjs'], { cwd: root, stdio: 'inherit' });
console.log('PROMOTION COMPLETE: source is now DeutschWeg X16.4.2 Final Stable. Commit and publish only this verified tree.');
