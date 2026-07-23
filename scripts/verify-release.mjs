import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const passed = [];
const failed = [];
const at = relative => path.join(root, relative);
const exists = relative => fs.existsSync(at(relative));
const read = relative => fs.readFileSync(at(relative), 'utf8');
const check = (condition, message) => {
  (condition ? passed : failed).push(message);
  console[condition ? 'log' : 'error']((condition ? 'PASS ' : 'FAIL ') + message);
};
const parseJson = relative => {
  try {
    const value = JSON.parse(read(relative));
    check(true, relative + ' parses');
    return value;
  } catch (error) {
    check(false, relative + ' ' + error.message);
    return null;
  }
};

const required = ['index.html','404.html','final-acceptance.html','manifest.webmanifest','sw.js','app-config.js','version.json','LOCKED_ASSUMPTIONS.json','LOCKED_ASSUMPTIONS_X16_5_1.json','HANDOFF_X16_5_1_FA.md','ACCEPTANCE_PROTOCOL_X16_5_1_FA.md','ACCEPTANCE_EVIDENCE_X16_5_1.template.json','REMAINING_ACCEPTANCE_GATES_X16_5_1.json','RELEASE_NOTES_X16_5_1_ACCEPTANCE.md','CEFR_COMPETENCY_GRAPH_X16_5.json','DIAGNOSTIC_BANK_X16_5.json','scripts/promote-final-stable.mjs','.github/workflows/x1651-release-qa.yml'];
required.forEach(file => check(exists(file), 'required ' + file));

const version = parseJson('version.json');
check(version?.version === '16.5.1', 'version 16.5.1');
const stable = version?.channel === 'stable';
check(stable || version?.channel === 'final-acceptance-candidate', 'valid release channel');
check(version?.build === (stable ? 'final-stable' : 'final-acceptance-stabilization'), 'build matches channel');

const index = read('index.html');
const acceptance = read('final-acceptance.html');
const worker = read('sw.js');
const config = read('app-config.js');
const manifest = read('manifest.webmanifest');
for (const [needle, message] of [["const VERSION='16.5.1'",'runtime version'],['SPONSOR_DELAY_SECONDS=26','26 second sponsor'],['deutschweg_sponsor_gate_24s_v2','sponsor key'],['deutschweg_x14_6_integrated_state','storage key'],['./final-acceptance.html','acceptance link']]) check(index.includes(needle), message);
for (const [needle, message] of [["VERSION='16.5.1'",'acceptance version'],['حداقل دو شرکت‌کننده','two participant guard'],['A1 تا C2','language coverage'],['Critical/High','defect blocker'],['promotionAllowed','promotion decision'],['SPONSOR_DELAY=26','acceptance sponsor delay']]) check(acceptance.includes(needle), message);
check(read('404.html') === index, '404 mirrors index');
check(worker.includes(`deutschweg-x16-5-1-${stable ? 'stable' : 'final-acceptance-candidate'}`), 'worker cache matches channel');
check(worker.includes("version:'16.5.1'"), 'worker version');
check(worker.includes('./final-acceptance.html'), 'worker precaches acceptance page');
check(config.includes(`channel:'${stable ? 'stable' : 'final-acceptance-candidate'}'`), 'app config channel');
check(config.includes(`build:'${stable ? 'final-stable' : 'final-acceptance-stabilization'}'`), 'app config build');
check(manifest.includes(stable ? 'Final Stable' : 'Final Acceptance Candidate'), 'manifest label matches channel');
check(index.includes(stable ? 'Final Stable' : 'Final Acceptance & Stabilization Candidate'), 'index label matches channel');

const assumptions = parseJson('LOCKED_ASSUMPTIONS.json');
check(assumptions?.preserved?.sponsor_gate?.required === true, 'sponsor mandatory');
check(assumptions?.preserved?.sponsor_gate?.delay_seconds === 26, 'sponsor delay locked');
check(assumptions?.preserved?.account_login === false, 'login disabled');
const graph = parseJson('CEFR_COMPETENCY_GRAPH_X16_5.json');
const bank = parseJson('DIAGNOSTIC_BANK_X16_5.json');
check(graph?.nodeCount === 54, '54 competency nodes');
check(graph?.descriptorCount === 108, '108 descriptors');
check(bank?.items?.length === 18, '18 diagnostic items');
const promotion = read('scripts/promote-final-stable.mjs');
for (const token of ['PROMOTION BLOCKED','promotionAllowed','critical','high','participants','A1','C2','ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json']) check(promotion.includes(token), 'promotion guard ' + token);

if (stable) {
  check(exists('ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json'), 'locked acceptance evidence exists');
  check(exists('RELEASE_NOTES_X16_5_1_FINAL_STABLE.md'), 'stable release notes exist');
  const evidence = exists('ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json') ? parseJson('ACCEPTANCE_EVIDENCE_LOCKED_X16_5_1.json') : null;
  check(evidence?.promotionAllowed === true && evidence?.status === 'FINAL_ELIGIBLE', 'locked evidence permits promotion');
  check((evidence?.decision?.blockers || []).length === 0, 'locked evidence has no blockers');
}

console.log(`\nRelease verification summary: ${passed.length} passed, ${failed.length} failed.`);
if (failed.length) process.exit(1);
