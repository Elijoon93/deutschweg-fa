import fs from 'node:fs';
import path from 'node:path';

const stop = message => {
  console.error('PROMOTION BLOCKED:', message);
  process.exit(1);
};
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const evidenceArg = process.argv[2];
if (!evidenceArg) stop('pass an exported X16.5.1 acceptance JSON');
const evidencePath = path.resolve(evidenceArg);
let evidence;
try { evidence = readJson(evidencePath); } catch (error) { stop(error.message); }

if (evidence.product !== 'DeutschWeg' || evidence.version !== '16.5.1') stop('wrong product/version');
if (evidence.promotionAllowed !== true || evidence.status !== 'FINAL_ELIGIBLE') stop('decision is not FINAL_ELIGIBLE');

const requiredGates = ['published','secure','storage','indexeddb','manifest','serviceworker','cache','metadata','migration','sponsor','competency','backup','tts','microphone','speech','offline','install','restore','usability','language'];
const nonPass = requiredGates.filter(id => evidence.tests?.[id]?.status !== 'pass');
if (nonPass.length) stop('non-PASS gates: ' + nonPass.join(', '));
const blockers = (evidence.defects || []).filter(item => item.status !== 'closed' && ['critical','high'].includes(item.severity));
if (blockers.length) stop('open critical/high defects');
const passEvidence = id => (evidence.evidence || []).find(item => item.gate === id && item.status === 'pass' && String(item.notes || '').trim().length >= 8);
for (const id of ['published','tts','microphone','speech','offline','install','restore','usability','language']) {
  if (!passEvidence(id)) stop('auditable evidence missing: ' + id);
}
if (Number(passEvidence('usability').participants || 0) < 2) stop('usability needs two participants');
if (!['A1','A2','B1','B2','C1','C2'].every(level => (passEvidence('language').levels || []).includes(level))) stop('language review must cover A1-C2');

const version = readJson('version.json');
version.channel = 'stable';
version.build = 'final-stable';
version.promoted_at = new Date().toISOString();
version.evidence_file = 'ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json';
writeJson('version.json', version);

const replacements = [
  ['Final Acceptance & Stabilization Candidate', 'Final Stable'],
  ['Final Acceptance Candidate', 'Final Stable'],
  ['final-acceptance-candidate', 'stable'],
  ['final-acceptance-stabilization', 'final-stable']
];
for (const file of ['index.html','404.html','final-acceptance.html','manifest.webmanifest','app-config.js','sw.js']) {
  let source = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  fs.writeFileSync(file, source);
}

const lockedEvidence = {
  ...evidence,
  lockedAt: new Date().toISOString(),
  sourceFile: path.basename(evidencePath),
  sha256Note: 'Run scripts/verify-release.mjs and regenerate SHA256SUMS.txt before committing.'
};
writeJson('ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json', lockedEvidence);

const releaseNotes = `# DeutschWeg X16.5.1 — Final Stable\n\n` +
  `- Promotion time: ${version.promoted_at}\n` +
  `- Acceptance status: FINAL_ELIGIBLE\n` +
  `- Gates: ${requiredGates.length}/${requiredGates.length} PASS\n` +
  `- Open Critical/High defects: 0\n` +
  `- Usability participants: ${Number(passEvidence('usability').participants || 0)}\n` +
  `- Human language review: A1–C2\n\n` +
  `This promotion is based on the locked acceptance evidence file.\n`;
fs.writeFileSync('RELEASE_NOTES_X16_5_1_FINAL_STABLE.md', releaseNotes);
console.log('PROMOTION READY: run node scripts/verify-release.mjs, regenerate SHA256SUMS.txt, review the diff, then commit.');
