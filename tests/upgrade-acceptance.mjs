import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import process from 'node:process';

const baseURL='http://127.0.0.1:4174/';
const outputDir='test-results/upgrade-acceptance';
await mkdir(outputDir,{recursive:true});
const server=spawn('python3',['-m','http.server','4174','--bind','127.0.0.1'],{stdio:['ignore','pipe','pipe']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={version:'13.7.2-RC3',startedAt:new Date().toISOString(),checks:[],errors:[]};
const check=(name,pass,detail='')=>{report.checks.push({name,pass:!!pass,detail});if(!pass)throw new Error(`${name}: ${detail}`)};

try{
  await sleep(1200);
  const fixture=JSON.parse(await readFile('tests/fixtures/rc2-state-contract.json','utf8'));
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,locale:'fa-IR'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(payload=>{localStorage.setItem('deutschweg_x12_user_data',JSON.stringify(payload));location.reload()},fixture);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  const upgraded=await page.evaluate(()=>({
    version:state.appVersion,schema:state.schemaVersion,setup:state.setup,
    name:state.profile.name,current:state.profile.currentLevel,target:state.profile.targetLevel,
    session:state.plan.sessions?.[0]?.id,completed:state.completed['upgrade-task-1'],
    minutes:state.actualMinutes['upgrade-task-1'],note:state.notes['upgrade-task-1'],
    vocab:state.learning.customVocab?.[0]?.id,study:state.studySessions?.[0]?.id,
    storageKeyPresent:!!localStorage.getItem('deutschweg_x12_user_data')
  }));
  check('RC2 contract upgrades to RC3 runtime',upgraded.version==='13.7.2-RC3',JSON.stringify(upgraded));
  check('schema remains 1',Number(upgraded.schema)===1,JSON.stringify(upgraded));
  check('setup and profile preserved',upgraded.setup===true&&upgraded.name==='Upgrade Acceptance User'&&upgraded.current==='B1'&&upgraded.target==='C1',JSON.stringify(upgraded));
  check('plan session preserved',upgraded.session==='upgrade-session-1',JSON.stringify(upgraded));
  check('completed, actual minutes and note preserved',upgraded.completed===true&&upgraded.minutes===70&&upgraded.note==='preserve me',JSON.stringify(upgraded));
  check('custom vocabulary and study session preserved',upgraded.vocab==='upgrade-word-1'&&upgraded.study==='upgrade-study-1',JSON.stringify(upgraded));
  check('stable storage key remains populated',upgraded.storageKeyPresent===true,JSON.stringify(upgraded));
  await page.reload({waitUntil:'networkidle'});
  const secondBoot=await page.evaluate(()=>({version:state.appVersion,name:state.profile.name,vocab:state.learning.customVocab?.[0]?.id,session:state.plan.sessions?.[0]?.id}));
  check('second boot keeps upgraded data',secondBoot.version==='13.7.2-RC3'&&secondBoot.name==='Upgrade Acceptance User'&&secondBoot.vocab==='upgrade-word-1'&&secondBoot.session==='upgrade-session-1',JSON.stringify(secondBoot));
  check('no runtime error during upgrade',errors.length===0,errors.join(' | '));
  await page.screenshot({path:`${outputDir}/upgrade-preserved-mobile.png`,fullPage:true});
  await context.close();await browser.close();report.status='PASS';
}catch(error){report.status='FAIL';report.errors.push(String(error?.stack||error));process.exitCode=1}
finally{server.kill('SIGTERM');report.finishedAt=new Date().toISOString();await writeFile(`${outputDir}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}
