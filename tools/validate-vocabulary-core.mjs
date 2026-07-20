#!/usr/bin/env node
import fs from 'node:fs';
const p=process.argv[2]||'vocabulary-core-6000.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));const a=d.entries||[];
const dup=a.length-new Set(a.map(x=>x.id)).size;const target=5200;
const teaching=a.filter(x=>x.teachingReady).length,deep=a.filter(x=>x.deepReady).length;
const out={file:p,total:a.length,duplicateIds:dup,teachingReady:teaching,deepReady:deep,target,pass:a.length>=5000&&dup===0};
console.log(JSON.stringify(out,null,2));if(!out.pass)process.exitCode=1;
