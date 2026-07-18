/* DeutschWeg X12.2 — Adaptive Planner Engine 2.0
   Additive intelligence layer. It never changes STORAGE_KEY and never deletes user data.
*/
(() => {
  'use strict';
  const SKILLS=['Lesen','Hören','Schreiben','Sprechen','Grammatik','Wortschatz'];
  const ENERGY_SKILLS={high:['Schreiben','Grammatik','Sprechen','Prüfung'],medium:['Lesen','Hören','Shadowing'],low:['Wortschatz','Flashcards','Podcast','Musik']};
  const LEVEL_INDEX={A1:0,A2:1,B1:2,B2:3,C1:4,C2:5};
  function txt(fa,de){try{return t(fa,de)}catch(e){return fa}}
  function esc2(v){try{return esc(String(v??''))}catch(e){return String(v??'')}}
  function nowKey(){return new Date().toISOString().slice(0,10)}
  function parseDateSafe(k){let [y,m,d]=String(k||nowKey()).split('-').map(Number);return new Date(y,m-1,d,12)}
  function dayDiff(a,b){return Math.floor((parseDateSafe(b)-parseDateSafe(a))/86400000)}
  function allTasks(){return [...(state.plan?.sessions||[]),...(state.customTasks||[])]}
  function isDone(x){try{return taskDone(x.id)}catch(e){return !!state.completed?.[x.id]}}
  function planner2(){
    state.learning=state.learning||{};
    state.learning.plannerX122=state.learning.plannerX122||{
      version:'12.2.0',
      energy:{morning:'high',afternoon:'medium',evening:'low'},
      weeklyReviews:[],rescues:[],adaptiveApplies:[],
      autoApply:false,lastDNA:null,lastRisk:null,lastReview:null,lastAdaptive:null
    };
    return state.learning.plannerX122;
  }
  function mastery(skill){return Number(state.learning?.x12?.mastery?.[skill]||0)}
  function completedStudy(){return Array.isArray(state.studySessions)?state.studySessions:[]}
  function timeBucket(dateLike){let d=new Date(dateLike||Date.now()),h=d.getHours();return h<12?'morning':h<18?'afternoon':'evening'}
  function studyByBucket(){let out={morning:0,afternoon:0,evening:0};completedStudy().forEach(s=>{out[timeBucket(s.startedAt||s.date)]+=Number(s.minutes||0)});return out}
  function strongestBucket(){let x=studyByBucket();return Object.entries(x).sort((a,b)=>b[1]-a[1])[0][0]}
  function consistency(){
    let keys=new Set(completedStudy().filter(s=>Number(s.minutes||0)>0).map(s=>String(s.date||'').slice(0,10)));
    let count=0;for(let i=0;i<28;i++){let d=new Date();d.setDate(d.getDate()-i);if(keys.has(d.toISOString().slice(0,10)))count++}
    return Math.round(count/28*100);
  }
  function preferredModules(){
    let counts={};completedStudy().forEach(s=>{let k=s.module||'Andere';counts[k]=(counts[k]||0)+Number(s.minutes||0)});
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  }
  function weakestSkill(){return SKILLS.map(s=>[s,mastery(s)]).sort((a,b)=>a[1]-b[1])[0][0]}
  function strongestSkill(){return SKILLS.map(s=>[s,mastery(s)]).sort((a,b)=>b[1]-a[1])[0][0]}
  function buildDNA(){
    let p=planner2(),bestBucket=strongestBucket(),pref=preferredModules(),weak=weakestSkill(),strong=strongestSkill(),cons=consistency();
    let dna={
      generatedAt:new Date().toISOString(),
      chronotype:bestBucket,
      consistency:cons,
      consistencyBand:cons>=70?'high':cons>=35?'medium':'low',
      strongest:strong,weakest:weak,
      preferredModules:pref,
      examOriented:!String(state.profile.exam||'').match(/Ohne|بدون/i),
      mediaAffinity:pref.some(x=>['Podcast','Film','Musik'].includes(x)),
      dailyTarget:Number(state.profile.dailyTarget||60),weeklyTarget:Number(state.profile.weeklyTarget||360)
    };
    p.lastDNA=dna;return dna;
  }
  function weeksRemaining(){
    let start=parseDateSafe(state.profile.startDate||nowKey());let weeks=Math.max(1,Number(state.profile.weeks||12));let end=new Date(start);end.setDate(end.getDate()+weeks*7);return Math.max(0,Math.ceil((end-new Date())/604800000));
  }
  function levelGap(){let a=LEVEL_INDEX[state.profile.currentLevel],b=LEVEL_INDEX[state.profile.targetLevel];if(a==null||b==null)return 1;return Math.max(0,b-a)}
  function goalRisk(){
    let p=planner2(),remaining=weeksRemaining(),gap=levelGap(),weekly=Number(state.profile.weeklyTarget||360),avgMastery=Math.round(SKILLS.reduce((a,s)=>a+mastery(s),0)/SKILLS.length),overdue=allTasks().filter(x=>x.date<nowKey()&&!isDone(x)).length;
    // Transparent heuristic: 90 study-hours per CEFR step, reduced by current mastery signal.
    let requiredMinutes=Math.max(0,gap*90*60*(1-Math.min(0.45,avgMastery/220)));
    let capacity=remaining*weekly;let ratio=requiredMinutes?capacity/requiredMinutes:2;
    let score=0;if(ratio<0.75)score+=45;else if(ratio<1)score+=25;else if(ratio<1.25)score+=10;if(overdue>=8)score+=25;else if(overdue>=3)score+=12;if(consistency()<30)score+=18;else if(consistency()<55)score+=8;if(remaining<=4&&gap>0)score+=12;score=Math.min(100,score);
    let band=score>=55?'high':score>=28?'medium':'low';
    let extra=Math.max(0,Math.ceil((requiredMinutes-capacity)/Math.max(1,remaining)/15)*15);
    let risk={at:new Date().toISOString(),band,score,remaining,gap,capacity,requiredMinutes:Math.round(requiredMinutes),extraMinutesPerWeek:extra,overdue,consistency:consistency()};p.lastRisk=risk;return risk;
  }
  function energyForTime(time){let h=Number(String(time||'12:00').split(':')[0]);let bucket=h<12?'morning':h<18?'afternoon':'evening';return planner2().energy[bucket]||'medium'}
  function skillForEnergy(level){return ENERGY_SKILLS[level]||ENERGY_SKILLS.medium}
  function adaptiveWeights(){
    let dna=buildDNA(),base={Lesen:16,Hören:17,Schreiben:16,Sprechen:16,Grammatik:16,Wortschatz:19};
    SKILLS.forEach(s=>{let m=mastery(s);if(s===dna.weakest)base[s]+=14;if(m<40)base[s]+=8;else if(m>75)base[s]-=4});
    if(dna.examOriented){['Lesen','Hören','Schreiben','Sprechen'].forEach(s=>base[s]+=4)}
    if(dna.mediaAffinity){base.Hören+=5;base.Wortschatz+=2}
    let sum=Object.values(base).reduce((a,b)=>a+b,0);return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Math.round(v/sum*100)]));
  }
  function chooseSkillForSlot(time,weights,usage){
    let energy=energyForTime(time),allowed=skillForEnergy(energy).filter(x=>SKILLS.includes(x));if(!allowed.length)allowed=SKILLS;
    return allowed.sort((a,b)=>((weights[b]||0)-(usage[b]||0))-((weights[a]||0)-(usage[a]||0)))[0]||weakestSkill();
  }
  function next7Incomplete(){let today=nowKey();return (state.plan?.sessions||[]).filter(x=>x.date>=today&&dayDiff(today,x.date)<=7&&!isDone(x)).sort((a,b)=>String(a.date+a.start).localeCompare(String(b.date+b.start)))}
  function applyAdaptiveWeek(){
    let tasks=next7Incomplete();if(!tasks.length)return toast(txt('جلسه آینده‌ای برای تطبیق وجود ندارد.','Keine zukünftigen Sitzungen zum Anpassen.'));
    let p=planner2(),weights=adaptiveWeights(),usage=Object.fromEntries(SKILLS.map(s=>[s,0])),changes=[];
    tasks.forEach(task=>{let old={module:task.module,theme:task.theme};let mod=chooseSkillForSlot(task.start,weights,usage);usage[mod]+=Number(task.minutes||0);task.module=mod;if(task.theme&&Array.isArray(task.theme))task.theme=[txt('جلسه تطبیقی '+moduleName(mod),'Adaptive Einheit '+moduleName(mod)),txt('بر اساس عملکرد و انرژی','Basierend auf Leistung und Energie')];changes.push({id:task.id,old,next:{module:task.module,theme:task.theme}})});
    p.adaptiveApplies.push({id:'adaptive-'+Date.now(),at:new Date().toISOString(),changes,weights});p.lastAdaptive={at:new Date().toISOString(),weights,count:changes.length};save(true);renderAll();toast(txt(`${changes.length} جلسه هفته آینده با حفظ زمان‌های شما تطبیق داده شد.`,`${changes.length} Sitzungen der nächsten Woche wurden bei unveränderten Zeiten angepasst.`));
  }
  window.x122ApplyAdaptiveWeek=applyAdaptiveWeek;
  function undoAdaptive(){let p=planner2(),r=p.adaptiveApplies.pop();if(!r)return toast(txt('تطبیقی برای بازگشت وجود ندارد.','Keine Anpassung zum Rückgängig machen.'));r.changes.forEach(c=>{let x=(state.plan?.sessions||[]).find(t=>t.id===c.id);if(x)Object.assign(x,c.old)});save(true);renderAll();toast(txt('آخرین تطبیق هفتگی برگردانده شد.','Die letzte Wochenanpassung wurde rückgängig gemacht.'))}
  window.x122UndoAdaptive=undoAdaptive;
  function buildWeeklyReview(){
    let today=new Date(),start=new Date(today);start.setDate(today.getDate()-6);let from=start.toISOString().slice(0,10),to=nowKey();let tasks=allTasks().filter(x=>x.date>=from&&x.date<=to),planned=tasks.reduce((a,x)=>a+Number(x.minutes||0),0),done=tasks.filter(isDone).reduce((a,x)=>a+Number(state.actualMinutes?.[x.id]||x.minutes||0),0),pct=planned?Math.round(done/planned*100):0,weak=weakestSkill(),weights=adaptiveWeights();let rec={at:new Date().toISOString(),from,to,planned,done,pct,weakest:weak,weights,consistency:consistency()};planner2().lastReview=rec;return rec;
  }
  function saveWeeklyReview(){let r=buildWeeklyReview(),p=planner2();p.weeklyReviews.push(r);if(p.weeklyReviews.length>24)p.weeklyReviews=p.weeklyReviews.slice(-24);save(true);renderAll();toast(txt('مرور هفتگی ذخیره شد.','Wochenrückblick gespeichert.'))}
  window.x122SaveWeeklyReview=saveWeeklyReview;
  function overdue(){return (state.plan?.sessions||[]).filter(x=>x.date<nowKey()&&!isDone(x)).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
  function rescueMode(){
    let list=overdue();if(!list.length)return toast(txt('برنامه نیازی به نجات ندارد.','Der Plan benötigt keinen Rettungsmodus.'));
    let p=planner2(),snapshot=list.map(x=>({id:x.id,date:x.date,week:x.week,day:x.day,start:x.start,end:x.end,module:x.module,rescueDeferred:x.rescueDeferred}));let essential=list.filter(x=>['Prüfung','Schreiben','Hören','Sprechen','Grammatik'].includes(x.module)).slice(0,5),optional=list.filter(x=>!essential.includes(x));
    let cursor=new Date();essential.forEach((task,i)=>{let d=new Date(cursor);d.setDate(d.getDate()+1+i*2);task.date=d.toISOString().slice(0,10);task.week=typeof weekIndex==='function'?weekIndex(d):task.week;task.rescueDeferred=false});optional.forEach((task,i)=>{let d=new Date(cursor);d.setDate(d.getDate()+10+i);task.date=d.toISOString().slice(0,10);task.week=typeof weekIndex==='function'?weekIndex(d):task.week;task.rescueDeferred=true});
    p.rescues.push({id:'rescue-'+Date.now(),at:new Date().toISOString(),snapshot,essential:essential.map(x=>x.id),deferred:optional.map(x=>x.id)});save(true);renderAll();toast(txt(`حالت نجات فعال شد: ${essential.length} جلسه ضروری نزدیک و ${optional.length} جلسه کم‌فشار به بعد منتقل شد.`,`Rettungsmodus aktiv: ${essential.length} wichtige Sitzungen vorgezogen, ${optional.length} optionale Einheiten verschoben.`));
  }
  window.x122RescueMode=rescueMode;
  function undoRescue(){let p=planner2(),r=p.rescues.pop();if(!r)return toast(txt('حالت نجاتی برای بازگشت وجود ندارد.','Kein Rettungsmodus zum Rückgängig machen.'));r.snapshot.forEach(s=>{let x=(state.plan?.sessions||[]).find(t=>t.id===s.id);if(x)Object.assign(x,s)});save(true);renderAll();toast(txt('آخرین حالت نجات برگردانده شد.','Der letzte Rettungsmodus wurde rückgängig gemacht.'))}
  window.x122UndoRescue=undoRescue;
  function setEnergy(bucket,value){planner2().energy[bucket]=value;save(true);renderToday()}
  window.x122SetEnergy=setEnergy;
  function energySelect(bucket,label){let v=planner2().energy[bucket]||'medium';return `<label class="x122-energy"><span>${label}</span><select onchange="x122SetEnergy('${bucket}',this.value)"><option value="high" ${v==='high'?'selected':''}>${txt('انرژی بالا','Hohe Energie')}</option><option value="medium" ${v==='medium'?'selected':''}>${txt('متوسط','Mittel')}</option><option value="low" ${v==='low'?'selected':''}>${txt('کم','Niedrig')}</option></select></label>`}
  function riskHTML(r){let label=r.band==='high'?txt('ریسک بالا','Hohes Risiko'):r.band==='medium'?txt('ریسک متوسط','Mittleres Risiko'):txt('ریسک پایین','Niedriges Risiko');return `<div class="x122-risk ${r.band}"><div><span class="kicker">Goal Risk</span><h3>${label}</h3><p>${r.extraMinutesPerWeek>0?txt(`برای کاهش ریسک، حدود ${r.extraMinutesPerWeek} دقیقه در هفته به ظرفیت مطالعه اضافه کنید.`,`Zur Risikoreduktion etwa ${r.extraMinutesPerWeek} Minuten pro Woche ergänzen.`):txt('با ریتم فعلی، ظرفیت برنامه با هدف شما هم‌راستاست.','Deine aktuelle Kapazität passt zum Ziel.')}</p></div><b>${r.score}</b></div>`}
  function dnaHTML(d){let bucket=d.chronotype==='morning'?txt('صبح','Morgen'):d.chronotype==='afternoon'?txt('بعدازظهر','Nachmittag'):txt('شب','Abend');return `<div class="x122-dna-grid"><div><span>${txt('ریتم غالب','Bevorzugte Zeit')}</span><b>${bucket}</b></div><div><span>${txt('استمرار ۲۸روزه','28-Tage-Konstanz')}</span><b>${d.consistency}%</b></div><div><span>${txt('قوی‌ترین مهارت','Stärkste Fertigkeit')}</span><b>${moduleName(d.strongest)}</b></div><div><span>${txt('نیازمند توجه','Fokusbedarf')}</span><b>${moduleName(d.weakest)}</b></div></div>`}
  function weightsHTML(w){return `<div class="x122-weights">${Object.entries(w).map(([k,v])=>`<div><span>${moduleName(k)}</span><i><em style="width:${v}%"></em></i><b>${v}%</b></div>`).join('')}</div>`}
  function intelligencePanel(){let d=buildDNA(),r=goalRisk(),review=buildWeeklyReview(),w=adaptiveWeights(),p=planner2(),ov=overdue();return `<section class="x122-intro"><span class="kicker">Adaptive Planner Engine 2.0</span><h2>${txt('هوشمندی برنامه من','Intelligenz meines Plans')}</h2><p>${txt('این بخش از هدف، سطح، زمان‌های آزاد، عملکرد واقعی، انرژی و مهارت‌های ضعیف برای پیشنهاد برنامه استفاده می‌کند. هیچ داده‌ای با آپدیت حذف نمی‌شود.','Dieser Bereich nutzt Ziel, Niveau, Verfügbarkeit, Leistung, Energie und Schwächen für den Plan. Updates löschen keine Lerndaten.')}</p></section>${riskHTML(r)}<section class="x121-plan-card"><div class="section-head"><h3>Smart Plan DNA</h3><span class="chip">${d.consistencyBand}</span></div>${dnaHTML(d)}</section><section class="x121-plan-card"><h3>${txt('انرژی در طول روز','Energie im Tagesverlauf')}</h3><div class="x122-energy-grid">${energySelect('morning',txt('صبح','Morgen'))}${energySelect('afternoon',txt('بعدازظهر','Nachmittag'))}${energySelect('evening',txt('شب','Abend'))}</div><p class="small muted">${txt('جلسات دشوارتر در بازه‌های انرژی بالاتر و مرورهای سبک در بازه‌های انرژی پایین‌تر پیشنهاد می‌شوند.','Anspruchsvollere Einheiten werden in energiereiche Zeiten, leichte Wiederholungen in energieärmere Zeiten gelegt.')}</p></section><section class="x121-plan-card"><div class="section-head"><div><h3>${txt('ترکیب پیشنهادی هفته بعد','Empfohlener Mix für nächste Woche')}</h3><p class="small muted">${txt('وزن‌ها از مهارت ضعیف، هدف آزمون و تاریخچه مطالعه ساخته می‌شوند.','Die Gewichte entstehen aus Schwächen, Prüfungsziel und Lernhistorie.')}</p></div></div>${weightsHTML(w)}<div class="actions"><button class="primary" onclick="x122ApplyAdaptiveWeek()">${txt('اعمال روی ۷ روز آینده','Auf nächste 7 Tage anwenden')}</button>${p.adaptiveApplies.length?`<button class="ghost" onclick="x122UndoAdaptive()">${txt('بازگشت آخرین تطبیق','Letzte Anpassung rückgängig')}</button>`:''}</div></section><section class="x121-plan-card"><div class="section-head"><div><h3>${txt('مرور هفتگی تطبیقی','Adaptiver Wochenrückblick')}</h3><p class="small muted">${review.done}/${review.planned} min · ${review.pct}% · ${txt('تمرکز بعدی','Nächster Fokus')}: ${moduleName(review.weakest)}</p></div><button class="ghost" onclick="x122SaveWeeklyReview()">${txt('ذخیره مرور','Rückblick speichern')}</button></div>${weightsHTML(review.weights)}</section>${ov.length>=3?`<section class="x122-rescue"><div><span class="kicker">Plan Rescue</span><h3>${txt('برنامه نیاز به نجات دارد','Dein Plan braucht einen Rettungsmodus')}</h3><p>${txt(`${ov.length} جلسه عقب‌افتاده وجود دارد. به‌جای انباشتن همه جلسات، موارد ضروری نزدیک‌تر و موارد کم‌فشار به بعد منتقل می‌شوند.`,`${ov.length} Sitzungen sind überfällig. Wichtige Einheiten werden priorisiert, weniger dringende später eingeplant.`)}</p></div><div class="actions"><button class="primary" onclick="x122RescueMode()">${txt('نجات برنامه','Plan retten')}</button>${p.rescues.length?`<button class="ghost" onclick="x122UndoRescue()">${txt('بازگشت نجات','Rettung rückgängig')}</button>`:''}</div></section>`:''}`}
  const prevSetPlanTab=window.x121SetPlanTab;
  window.x121SetPlanTab=function(tab){state.ui.myPlanTab=tab;save();renderToday()};
  const prevRenderToday=window.renderToday;
  window.renderToday=function(){prevRenderToday();let tabs=document.querySelector('#view-today .x121-tabs');if(tabs&&!tabs.querySelector('[data-x122]')){let b=document.createElement('button');b.dataset.x122='1';b.className=(state.ui.myPlanTab==='intelligence'?'active':'');b.textContent=txt('هوشمندی','Intelligenz');b.onclick=()=>window.x121SetPlanTab('intelligence');tabs.appendChild(b)}if(state.ui.myPlanTab==='intelligence'){let root=document.getElementById('view-today');let tabs2=root.querySelector('.x121-tabs');let hero=root.querySelector('.x121-plan-hero');root.querySelectorAll('.x122-injected').forEach(x=>x.remove());let wrap=document.createElement('div');wrap.className='x122-injected';wrap.innerHTML=intelligencePanel();tabs2.insertAdjacentElement('afterend',wrap);Array.from(root.children).forEach(el=>{if(el!==hero&&el!==tabs2&&el!==wrap)el.style.display='none'})}}
  const prevHome=window.renderHome;
  window.renderHome=function(){prevHome();let root=document.getElementById('view-home');if(!root)return;let r=goalRisk(),d=buildDNA();let card=document.createElement('section');card.className='x122-home-insight';card.innerHTML=`<div><span class="kicker">Planner Intelligence</span><h3>${txt('برنامه شما هر هفته با عملکرد واقعی تطبیق پیدا می‌کند','Dein Plan passt sich wöchentlich deiner echten Leistung an')}</h3><p>${txt(`تمرکز فعلی: ${moduleName(d.weakest)} · استمرار: ${d.consistency}% · ریسک هدف: ${r.band==='high'?'بالا':r.band==='medium'?'متوسط':'پایین'}`,`Aktueller Fokus: ${moduleName(d.weakest)} · Konstanz: ${d.consistency}% · Zielrisiko: ${r.band}`)}</p></div><button class="ghost" onclick="state.ui.myPlanTab='intelligence';go('today')">${txt('بازکردن هوشمندی برنامه','Planintelligenz öffnen')}</button>`;let target=root.querySelector('.x121-home-strip')||root.firstElementChild;target?.insertAdjacentElement('afterend',card)};
  const prevReport=window.renderReport;
  window.renderReport=function(){prevReport();let root=document.getElementById('view-report');if(!root)return;let r=buildWeeklyReview(),risk=goalRisk();let card=document.createElement('section');card.className='x122-report-card';card.innerHTML=`<span class="kicker">Weekly Intelligence</span><h3>${txt('مرور هفتگی و ریسک هدف','Wochenrückblick & Zielrisiko')}</h3><div class="x122-report-grid"><div><b>${r.pct}%</b><span>${txt('اجرای برنامه هفته','Planerfüllung')}</span></div><div><b>${r.consistency}%</b><span>${txt('استمرار ۲۸روزه','28-Tage-Konstanz')}</span></div><div><b>${risk.score}</b><span>${txt('امتیاز ریسک هدف','Zielrisiko')}</span></div></div><button class="ghost" onclick="state.ui.myPlanTab='intelligence';go('today')">${txt('تنظیم برنامه بر اساس این داده‌ها','Plan mit diesen Daten anpassen')}</button>`;root.prepend(card)};
  // Persist only additive state. Never alter STORAGE_KEY or clear local/IndexedDB data.
  planner2();state.ui=state.ui||{};save();
})();
