#!/usr/bin/env node
/* DeutschWeg X13.4 vocabulary-core builder.
   Usage:
     node tools/build-vocabulary-core.mjs --base phase1-lexicon.json --enrichment data/vocabulary-enrichment.json --out vocabulary-core-6000.json
   Enrichment input must be licensed/owned by the project. No remote dictionary is silently scraped.
*/
import fs from 'node:fs';
const args=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>{if(x.startsWith('--'))a.push([x.slice(2),arr[i+1]]);return a},[]));
const basePath=args.base||'phase1-lexicon.json', enrichPath=args.enrichment||'', outPath=args.out||'vocabulary-core-6000.json';
const base=JSON.parse(fs.readFileSync(basePath,'utf8'));
let enrichment=[];if(enrichPath&&fs.existsSync(enrichPath)){const x=JSON.parse(fs.readFileSync(enrichPath,'utf8'));enrichment=Array.isArray(x)?x:(x.entries||[])}
const byId=new Map(enrichment.filter(Boolean).map(x=>[x.id,x]));
const allowedLevel=new Set(['A1','A2','B1','B2','C1','C2','UNRATED']);
function validate(e){const errors=[];if(!e.id)errors.push('id');if(!e.word&&!e.lemma)errors.push('lemma');if(e.level&&!allowedLevel.has(e.level))errors.push('cefr');if(e.article&&!['der','die','das'].includes(e.article))errors.push('article');return errors}
const entries=base.map((b,i)=>{const o=byId.get(b.id)||{};const x={...b,...o};const errors=validate(x);return {...x,buildValidation:{pass:!errors.length,errors}}});
const report={version:'13.4.0',total:entries.length,merged:entries.filter(x=>byId.has(x.id)).length,invalid:entries.filter(x=>!x.buildValidation.pass).length};
fs.writeFileSync(outPath,JSON.stringify({version:'13.4.0',schema:'vocab-core-build-1',report,entries},null,2));console.log(JSON.stringify(report,null,2));
