import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd(),passes=[],failures=[];
const fp=r=>path.join(root,r),exists=r=>fs.existsSync(fp(r)),read=r=>fs.readFileSync(fp(r),'utf8');
const pass=m=>{passes.push(m);console.log('PASS ',m)},fail=m=>{failures.push(m);console.error('FAIL ',m)},assert=(c,m)=>c?pass(m):fail(m);
function json(r){try{const v=JSON.parse(read(r));pass(`${r} parses as JSON`);return v}catch(e){fail(`${r} JSON: ${e.message}`);return null}}
function sha(r){return crypto.createHash('sha256').update(fs.readFileSync(fp(r))).digest('hex')}
function png(r){const b=fs.readFileSync(fp(r));return b.length>=24&&b.subarray(0,8).toString('hex')==='89504e470d0a1a0a'?{w:b.readUInt32BE(16),h:b.readUInt32BE(20)}:null}

const required=['.nojekyll','index.html','404.html','offline.html','privacy.html','professional-curriculum-audit.html','manifest.webmanifest','sw.js','app.css','app-config.js','version.json','LOCKED_ASSUMPTIONS.json','LOCKED_ASSUMPTIONS_X16_5.json','HANDOFF_X16_5_FA.md','COMPETENCY_EVIDENCE_ARCHITECTURE_X16_5_FA.md','CEFR_COMPETENCY_GRAPH_X16_5.json','DIAGNOSTIC_BANK_X16_5.json','REMAINING_ACCEPTANCE_GATES_X16_5.json','RELEASE_NOTES_X16_5_REVIEW.md','DIAGNOSTIC_VALIDITY_NOTE_X16_5_FA.md','CONTENT_REVIEW_WORKFLOW_X16_5_FA.md','ACCEPTANCE_EVIDENCE_X16_5.template.json','QA_X16_5_STATIC.json','QA_X16_5_RUNTIME.json','QA_X16_5_REPORT.txt','assets/icon-192.png','assets/icon-512.png','assets/screenshot-home-390x844.png','assets/screenshot-session-390x844.png','scripts/verify-release.mjs','.github/workflows/x165-release-qa.yml'];
required.forEach(r=>assert(exists(r),`required file exists: ${r}`));

const version=json('version.json');
assert(version?.version==='16.5.0','version is 16.5.0');
assert(version?.channel==='review-candidate','channel remains review-candidate');
assert(version?.build==='competency-graph-diagnostic-evidence-engine','build identity is correct');

const graph=json('CEFR_COMPETENCY_GRAPH_X16_5.json');
assert(graph?.nodeCount===54,'competency graph has 54 nodes');
assert(graph?.descriptorCount===108,'competency graph has 108 descriptors');
assert(graph?.levels?.join(',')==='A1,A2,B1,B2,C1,C2','competency graph covers A1-C2');
assert(graph?.domains?.length===9,'competency graph has nine domains');
assert(new Set((graph?.nodes||[]).map(x=>x.id)).size===54,'competency node ids are unique');
for(const l of ['A1','A2','B1','B2','C1','C2'])assert(graph?.nodes?.filter(x=>x.level===l).length===9,`${l} has nine competency nodes`);

const bank=json('DIAGNOSTIC_BANK_X16_5.json');
assert(bank?.items?.length===18,'diagnostic bank has 18 objective items');
for(const l of ['A1','A2','B1','B2','C1','C2'])assert(bank?.items?.filter(x=>x.level===l).length===3,`${l} has three diagnostic items`);
for(const q of bank?.items||[]){assert(Array.isArray(q.options)&&q.options.length===3,`${q.id} has three options`);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length,`${q.id} answer index is valid`)}

const index=read('index.html');
const markers=[
 ['DeutschWeg X16.5','index identifies X16.5'],
 ["const VERSION='16.5.0'",'runtime version is 16.5.0'],
 ['SPONSOR_DELAY_SECONDS=26','sponsor delay remains 26 seconds'],
 ['deutschweg_sponsor_gate_24s_v2','legacy sponsor key is preserved'],
 ['deutschweg_x14_6_integrated_state','legacy localStorage key is preserved'],
 ['deutschweg-x14-6','legacy IndexedDB name is preserved'],
 ['const X165_COMPETENCIES=','embedded competency graph exists'],
 ['const X165_DIAGNOSTIC_ITEMS=','embedded diagnostic bank exists'],
 ['function x165StartDiagnostic','diagnostic workflow exists'],
 ['function x165ApplyEvidence','evidence weighting exists'],
 ['function x165Center','competency center exists'],
 ['function x165Feedback','local content feedback exists'],
 ['function x165SessionEvidence','sessions feed the evidence ledger'],
 ['غربالگری داخلی','diagnostic limitation is visible'],
 ['مدرک رسمی نیست','non-accreditation limitation is visible'],
 ['امروز','four-tab Coach Flow keeps Today'],['مسیر','four-tab Coach Flow keeps Path'],['تمرین','four-tab Coach Flow keeps Practice'],['من','four-tab Coach Flow keeps Profile']
];
markers.forEach(([n,m])=>assert(index.includes(n),m));
assert(!index.includes('لطفاً ۲۴ ثانیه صبر کنید'),'no stale 24-second button copy');
assert(!/<script[^>]+src=["']https?:\/\//i.test(index),'no externally hosted executable script');
assert(!/<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//i.test(index),'no externally hosted stylesheet');
assert(read('404.html')===index,'404.html mirrors index.html');

const assumptions=json('LOCKED_ASSUMPTIONS.json');
assert(assumptions?.version==='16.5.0','locked assumptions match X16.5');
assert(assumptions?.preserved?.sponsor_gate?.required===true,'sponsor gate remains mandatory');
assert(assumptions?.preserved?.sponsor_gate?.delay_seconds===26,'locked sponsor delay is 26 seconds');
assert(assumptions?.preserved?.account_login===false,'account/login remains disabled');
assert(assumptions?.preserved?.levels==='A1-C2','A1-C2 remains preserved');

const manifest=json('manifest.webmanifest');
assert(manifest?.name?.includes('X16.5'),'manifest identifies X16.5');
assert(manifest?.start_url==='./index.html','manifest start_url is relative');
assert(manifest?.scope==='./','manifest scope is relative');
assert(manifest?.display==='standalone','manifest requests standalone display');
for(const i of manifest?.icons||[])assert(exists(i.src),`manifest icon exists: ${i.src}`);
for(const s of manifest?.screenshots||[])assert(exists(s.src),`manifest screenshot exists: ${s.src}`);

const sw=read('sw.js');
assert(sw.includes("deutschweg-x16-5-competency-diagnostic-review"),'service worker cache is X16.5');
assert(sw.includes("version:'16.5.0'"),'service worker reports X16.5');
for(const r of ['index.html','offline.html','manifest.webmanifest','app-config.js','app.css','privacy.html','professional-curriculum-audit.html','CEFR_COMPETENCY_GRAPH_X16_5.json','DIAGNOSTIC_BANK_X16_5.json','assets/icon-192.png','assets/icon-512.png'])assert(sw.includes(`./${r}`),`service worker precaches ${r}`);

for(const [r,w,h] of [['assets/icon-192.png',192,192],['assets/icon-512.png',512,512],['assets/screenshot-home-390x844.png',390,844],['assets/screenshot-session-390x844.png',390,844]]){const d=png(r);assert(d?.w===w&&d?.h===h,`${r} dimensions are ${w}x${h}`)}

if(exists('SHA256SUMS.txt')){
 const lines=read('SHA256SUMS.txt').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);assert(lines.length>=25,'checksum inventory is substantial');
 for(const line of lines){const m=line.match(/^([a-f0-9]{64})\s+\.\/(.+)$/);if(!m){fail(`bad checksum line: ${line}`);continue}const [,expected,r]=m;if(!exists(r)){fail(`checksummed file missing: ${r}`);continue}assert(sha(r)===expected,`checksum matches: ${r}`)}
}

console.log(`\nRelease verification summary: ${passes.length} passed, ${failures.length} failed.`);
if(failures.length)process.exit(1);
