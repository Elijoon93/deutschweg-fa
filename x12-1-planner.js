/* DeutschWeg X12.1 — Planner-First Intelligence & Cross-Module Routing */
(() => {
  'use strict';
  const SKILLS=['Lesen','Hören','Schreiben','Sprechen','Grammatik','Wortschatz'];
  const ROUTES={
    'Hören':'Smart Podcast → Listening','Podcast':'Smart Podcast → Listening','Sprechen':'Pronunciation Studio','Shadowing':'Pronunciation Studio','Schreiben':'Writing Lab','Wortschatz':'Vocabulary Bank','Flashcards':'SRS Review','Prüfung':'Exam Center','Lesen':'Adaptive Lesson','Grammatik':'Adaptive Lesson','Film':'Media Learning','Musik':'Media Learning'
  };
  function planner(){
    state.learning=state.learning||{};
    state.learning.plannerX121=state.learning.plannerX121||{version:'12.1.0',autoReplan:true,replans:[],lastAnalysis:null};
    return state.learning.plannerX121;
  }
  function dateKey(d){return typeof d==='string'?d:new Date(d).toISOString().slice(0,10)}
  function parse(k){let [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12)}
  function daysBetween(a,b){return Math.floor((parse(dateKey(b))-parse(dateKey(a)))/86400000)}
  function taskDoneSafe(x){try{return taskDone(x.id)}catch(e){return !!state.completed?.[x.id]}}
  function allPlanTasks(){return [...(state.plan?.sessions||[]),...(state.customTasks||[])]}
  function currentWeek(){try{return weekIndex(new Date())}catch(e){return 1}}
  function weekTasks(w=currentWeek()){return allPlanTasks().filter(x=>Number(x.week)===Number(w))}
  function todayTasks(){let k=dateKey(new Date());return allPlanTasks().filter(x=>x.date===k)}
  function overdueTasks(){let k=dateKey(new Date());return (state.plan?.sessions||[]).filter(x=>x.date<k&&!taskDoneSafe(x))}
  function plannedMinutes(list){return list.reduce((a,x)=>a+Number(x.minutes||0),0)}
  function doneMinutes(list){return list.filter(taskDoneSafe).reduce((a,x)=>a+Number(state.actualMinutes?.[x.id]||x.minutes||0),0)}
  function weeksRemaining(){let end=parse(state.profile.startDate||dateKey(new Date()));end.setDate(end.getDate()+Math.max(1,Number(state.profile.weeks||12))*7);return Math.max(0,Math.ceil((end-new Date())/604800000))}
  function mastery(skill){try{let x=state.learning?.x12?.mastery?.[skill];return Number(x||0)}catch(e){return 0}}
  function allocation(){
    let base={Lesen:16,Hören:18,Schreiben:16,Sprechen:16,Grammatik:16,Wortschatz:18};
    let vals=SKILLS.map(s=>[s,mastery(s)]),min=Math.min(...vals.map(x=>x[1]));
    vals.forEach(([s,v])=>{if(v===min)base[s]+=10;if(v<45)base[s]+=5});
    if(String(state.profile.exam||'').toLowerCase().indexOf('ohne')<0&&String(state.profile.exam||'').indexOf('بدون')<0){base.Lesen+=3;base.Hören+=3;base.Schreiben+=3;base.Sprechen+=3}
    let sum=Object.values(base).reduce((a,b)=>a+b,0);return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Math.round(v/sum*100)]));
  }
  function weakest(){return SKILLS.map(s=>[s,mastery(s)]).sort((a,b)=>a[1]-b[1])[0][0]}
  function analysis(){
    let w=weekTasks(),over=overdueTasks(),alloc=allocation(),a={at:new Date().toISOString(),week:currentWeek(),planned:plannedMinutes(w),done:doneMinutes(w),overdue:over.length,weakest:weakest(),allocation:alloc,weeksRemaining:weeksRemaining()};
    planner().lastAnalysis=a;return a;
  }
  function moduleLabel(id){try{return moduleName(id)}catch(e){return id}}
  function escx(v){try{return esc(String(v??''))}catch(e){return String(v??'')}}
  function pairx(fa,de){try{return t(fa,de)}catch(e){return fa}}
  function setPlanTab(tab){state.ui.myPlanTab=tab;save();renderToday()}
  window.x121SetPlanTab=setPlanTab;
  function nextAvailableDate(afterKey){
    let start=parse(afterKey),limit=28;
    for(let n=1;n<=limit;n++){
      let d=new Date(start);d.setDate(d.getDate()+n);let idx=(d.getDay()+6)%7,row=state.availability?.[idx];
      if(row?.on&&(row.slots||[]).length)return {date:dateKey(d),row,dayIdx:idx};
    }
    return null;
  }
  function autoReplan(){
    let missed=overdueTasks();if(!missed.length){toast(pairx('جلسه عقب‌افتاده‌ای برای بازتنظیم وجود ندارد.','Keine überfällige Sitzung zum Neuplanen.'));return}
    let moves=[];let cursor=dateKey(new Date());
    missed.forEach(task=>{let slot=nextAvailableDate(cursor);if(!slot)return;let old={date:task.date,week:task.week,day:task.day,start:task.start,end:task.end};task.date=slot.date;task.week=weekIndex(parse(slot.date));task.day=slot.dayIdx;let first=slot.row.slots?.[0];if(first){task.start=first[0];task.end=first[1]}moves.push({id:task.id,old,next:{date:task.date,week:task.week,day:task.day,start:task.start,end:task.end}});cursor=slot.date});
    if(!moves.length){toast(pairx('زمان آزادی برای بازتنظیم پیدا نشد.','Keine freie Zeit für die Neuplanung gefunden.'));return}
    planner().replans.push({id:'replan-'+Date.now(),at:new Date().toISOString(),moves});save(true);renderAll();toast(pairx(`${moves.length} جلسه بدون دست‌زدن به فعالیت‌های تکمیل‌شده بازتنظیم شد.`,`${moves.length} Sitzungen wurden neu geplant; abgeschlossene Aufgaben blieben unverändert.`))
  }
  window.x121AutoReplan=autoReplan;
  function undoReplan(){let r=planner().replans.pop();if(!r)return toast(pairx('بازتنظیمی برای بازگشت وجود ندارد.','Keine Neuplanung zum Rückgängig machen.'));for(let m of r.moves){let task=(state.plan?.sessions||[]).find(x=>x.id===m.id);if(task)Object.assign(task,m.old)}save(true);renderAll();toast(pairx('آخرین بازتنظیم برگردانده شد.','Die letzte Neuplanung wurde rückgängig gemacht.'))}
  window.x121UndoReplan=undoReplan;
  function openModule(mid,taskId){
    planner().activeTaskId=taskId||null;planner().lastRoute={module:mid,at:new Date().toISOString()};save();
    if(mid==='Hören'||mid==='Podcast'){if(window.openSmartPodcast)return openSmartPodcast();state.ui.practiceTab='podcast';return go('practice')}
    if(mid==='Sprechen'||mid==='Shadowing'){if(window.openPronunciationStudio)return openPronunciationStudio();state.ui.practiceTab='pron';return go('practice')}
    if(mid==='Schreiben'&&window.openWritingLab)return openWritingLab();
    if(mid==='Prüfung'&&window.openExamCenter)return openExamCenter();
    if(mid==='Wortschatz'){state.ui.practiceTab='vocab';return go('practice')}
    if(mid==='Flashcards'){state.ui.practiceTab='cards';return go('practice')}
    if(mid==='Film'||mid==='Musik'){state.ui.practiceTab='media';return go('practice')}
    if(window.startX12Lesson)return startX12Lesson(0);state.ui.practiceTab='exercise';go('practice')
  }
  window.x121OpenModule=openModule;
  function markTask(id){let task=allPlanTasks().find(x=>x.id===id);if(!task)return;state.completed=state.completed||{};state.completed[id]=!taskDoneSafe(task);if(state.completed[id])state.actualMinutes[id]=Number(state.actualMinutes[id]||task.minutes||0);save(true);renderAll()}
  window.x121MarkTask=markTask;
  function taskRow(x){let done=taskDoneSafe(x),route=ROUTES[x.module]||'Adaptive Learning';return `<div class="x121-task ${done?'done':''}"><div class="x121-task-time">${escx(x.start||'—')}<br><span>${Number(x.minutes||0)} min</span></div><div class="x121-task-body"><b>${escx(moduleLabel(x.module))}</b><small>${escx((x.theme&&x.theme[0])||'')}</small><div class="x121-route">${escx(route)}</div></div><div class="x121-task-actions"><button class="ghost" onclick="x121OpenModule('${escx(x.module)}','${escx(x.id)}')">${pairx('شروع','Start')}</button><button class="${done?'ghost':'primary'}" onclick="x121MarkTask('${escx(x.id)}')">${done?'✓':pairx('انجام','Fertig')}</button></div></div>`}
  function allocationHTML(a){return `<div class="x121-allocation">${Object.entries(a).map(([k,v])=>`<div class="x121-allocation-row"><span>${escx(moduleLabel(k))}</span><div class="x121-allocation-track"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')}</div>`}
  const oldRenderToday=window.renderToday;
  window.renderToday=function(){
    let A=analysis(),tab=state.ui.myPlanTab||'today',today=todayTasks(),week=weekTasks(),done=today.filter(taskDoneSafe).length,over=overdueTasks();
    let body='';
    if(tab==='today')body=`<section class="x121-plan-card"><div class="section-head"><div><h3>${pairx('برنامه امروز','Heutiger Plan')}</h3><div class="small muted">${done}/${today.length} ${pairx('انجام‌شده','erledigt')} · ${plannedMinutes(today)} min</div></div><button class="ghost" onclick="startFocusTimer()">${pairx('حالت تمرکز','Fokus')}</button></div>${today.length?today.map(taskRow).join(''):`<div class="empty">${pairx('برای امروز جلسه‌ای برنامه‌ریزی نشده است.','Für heute ist keine Sitzung geplant.')}</div>`}</section>`;
    if(tab==='week'){let mods={};week.forEach(x=>{mods[x.module]=mods[x.module]||{p:0,d:0};mods[x.module].p+=Number(x.minutes||0);if(taskDoneSafe(x))mods[x.module].d+=Number(state.actualMinutes?.[x.id]||x.minutes||0)});body=`<div class="x121-grid"><div class="x121-stat"><b>${plannedMinutes(week)}</b><span>${pairx('دقیقه برنامه‌ریزی‌شده این هفته','Geplante Minuten diese Woche')}</span></div><div class="x121-stat"><b>${doneMinutes(week)}</b><span>${pairx('دقیقه انجام‌شده','Erledigte Minuten')}</span></div></div><section class="x121-plan-card"><h3>${pairx('ترکیب هوشمند هفته','Intelligenter Wochenmix')}</h3>${allocationHTML(A.allocation)}</section><section class="x121-plan-card">${Object.entries(mods).map(([k,v])=>`<div class="scorebar"><span>${moduleLabel(k)}</span><div class="bar"><i style="width:${Math.min(100,Math.round(v.d/Math.max(1,v.p)*100))}%"></i></div><b>${Math.round(v.d/Math.max(1,v.p)*100)}%</b></div>`).join('')}</section>`}
    if(tab==='month'){let recent=allPlanTasks().filter(x=>{let d=daysBetween(x.date,dateKey(new Date()));return d>=-28&&d<=0}),p=recent.length?Math.round(recent.filter(taskDoneSafe).length/recent.length*100):0;body=`<div class="x121-grid"><div class="x121-stat"><b>${p}%</b><span>${pairx('پایبندی ۲۸ روزه','28-Tage-Planerfüllung')}</span></div><div class="x121-stat"><b>${A.weeksRemaining}</b><span>${pairx('هفته تا پایان هدف','Wochen bis zum Ziel')}</span></div></div><section class="x121-plan-card"><h3>${pairx('سیگنال تطبیقی','Adaptives Signal')}</h3><p>${pairx(`تمرکز پیشنهادی بعدی روی ${moduleLabel(A.weakest)} است.`,`Nächster empfohlener Fokus: ${moduleLabel(A.weakest)}.`)}</p>${allocationHTML(A.allocation)}</section>`}
    if(tab==='calendar')body=`<section class="x121-plan-card"><h3>${pairx('تقویم کامل','Vollständiger Kalender')}</h3><p class="muted small">${pairx('برای جابه‌جایی بین ماه‌ها و دیدن جلسات برنامه‌ریزی‌شده، تقویم کامل را باز کنید.','Öffne den vollständigen Kalender für Monate und geplante Sitzungen.')}</p><button class="primary" style="width:100%" onclick="go('calendar')">${pairx('بازکردن تقویم','Kalender öffnen')}</button></section>`;
    document.getElementById('view-today').innerHTML=`<div class="x121-plan-hero"><span class="kicker" style="color:#dff9f5">${pairx('برنامه من · هسته اصلی DeutschWeg','Mein Plan · DeutschWeg Kern')}</span><h2>${state.profile.currentLevel==='UNKNOWN'?'?':state.profile.currentLevel} → ${state.profile.targetLevel||'—'}</h2><p>${pairx('برنامه شخصی شما بر اساس هدف، زمان آزاد، عملکرد واقعی و مهارت‌های ضعیف‌تر تنظیم می‌شود.','Dein persönlicher Plan verbindet Ziel, verfügbare Zeit, echte Leistung und schwächere Fertigkeiten.')}</p><div class="x121-plan-meta"><span class="x121-pill">${A.weeksRemaining} ${pairx('هفته باقی‌مانده','Wochen verbleibend')}</span><span class="x121-pill">${A.overdue} ${pairx('جلسه عقب‌افتاده','überfällige Sitzungen')}</span><span class="x121-pill">${pairx('مهارت نیازمند توجه','Fokusbedarf')}: ${moduleLabel(A.weakest)}</span></div></div><nav class="x121-tabs"><button class="${tab==='today'?'active':''}" onclick="x121SetPlanTab('today')">${pairx('امروز','Heute')}</button><button class="${tab==='week'?'active':''}" onclick="x121SetPlanTab('week')">${pairx('هفته','Woche')}</button><button class="${tab==='month'?'active':''}" onclick="x121SetPlanTab('month')">${pairx('ماه','Monat')}</button><button class="${tab==='calendar'?'active':''}" onclick="x121SetPlanTab('calendar')">${pairx('تقویم','Kalender')}</button></nav>${over.length?`<section class="x121-plan-card attention"><div class="section-head"><div><h3>${pairx('برنامه نیاز به تنظیم دارد','Plananpassung empfohlen')}</h3><p class="small muted">${over.length} ${pairx('جلسه تکمیل‌نشده از روزهای قبل باقی مانده است.','nicht erledigte Sitzungen liegen zurück.')}</p></div><button class="primary" onclick="x121AutoReplan()">${pairx('بازتنظیم هوشمند','Intelligent neu planen')}</button></div>${planner().replans.length?`<button class="ghost" onclick="x121UndoReplan()">${pairx('بازگشت آخرین بازتنظیم','Letzte Neuplanung rückgängig')}</button>`:''}</section>`:''}${body}`;
  };
  const oldNav=window.nav;
  window.nav=function(){
    const icons={home:'<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>',today:'<svg viewBox="0 0 24 24"><path d="M5 3v3M19 3v3M4 8h16M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2zM7 12h4v4H7z"/></svg>',practice:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',report:'<svg viewBox="0 0 24 24"><path d="M4 20V13h4v7zM10 20V8h4v12zM16 20V4h4v16z"/></svg>',more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>'};
    let items=[['home','خانه','Start'],['today','برنامه من','Mein Plan'],['practice','یادگیری','Lernen'],['report','پیشرفت','Fortschritt'],['more','بیشتر','Mehr']];
    let root=document.getElementById('bottomNav');if(root)root.innerHTML=items.map(x=>`<button type="button" aria-label="${pairx(x[1],x[2])}" data-view="${x[0]}" class="navbtn ${state.ui.view===x[0]?'active':''}" onclick="go('${x[0]}')"><i>${icons[x[0]]}</i><span>${pairx(x[1],x[2])}</span></button>`).join('')
  };
  const oldHome=window.renderHome;
  window.renderHome=function(){oldHome();let root=document.getElementById('view-home');if(!root)return;let A=analysis(),today=todayTasks(),next=today.find(x=>!taskDoneSafe(x));let strip=document.createElement('section');strip.className='x121-home-strip';strip.innerHTML=`<div class="head"><div><span class="kicker">${pairx('برنامه‌محور','Planer-first')}</span><h3>${pairx('برنامه شخصی امروز','Dein persönlicher Plan heute')}</h3><p>${next?`${escx(moduleLabel(next.module))} · ${Number(next.minutes||0)} min · ${escx(next.start||'')}`:pairx('برنامه امروز کامل شده یا جلسه‌ای تعیین نشده است.','Der heutige Plan ist erledigt oder leer.')}</p></div><button class="primary" onclick="${next?`x121OpenModule('${escx(next.module)}','${escx(next.id)}')`:`go('today')`}">${next?pairx('ادامه برنامه','Plan fortsetzen'):pairx('مشاهده برنامه','Plan ansehen')}</button></div><div class="x121-loop"><span>${pairx('برنامه','Plan')}</span><span>→</span><span>${pairx('یادگیری','Lernen')}</span><span>→</span><span>${pairx('اندازه‌گیری','Messen')}</span><span>→</span><span>${pairx('تطبیق','Anpassen')}</span></div>${A.overdue?`<div class="x121-progress-link">${A.overdue} ${pairx('جلسه عقب‌افتاده شناسایی شده؛ از «برنامه من» بازتنظیم کنید.','überfällige Sitzungen erkannt; unter „Mein Plan“ neu planen.')}</div>`:''}`;root.prepend(strip)};
  const oldReport=window.renderReport;
  window.renderReport=function(){oldReport();let root=document.getElementById('view-report');if(!root)return;let A=analysis(),card=document.createElement('section');card.className='x121-plan-card';card.innerHTML=`<span class="kicker">${pairx('برنامه ↔ پیشرفت','Plan ↔ Fortschritt')}</span><h3>${pairx('بازخورد پیشرفت به برنامه','Fortschritt steuert den Plan')}</h3><p class="small muted">${pairx(`ضعیف‌ترین سیگنال فعلی: ${moduleLabel(A.weakest)}. برنامه پیشنهادی هفته بعد بر همین اساس وزن‌دهی می‌شود.`,`Aktuell schwächstes Signal: ${moduleLabel(A.weakest)}. Die nächste Woche wird entsprechend gewichtet.`)}</p>${allocationHTML(A.allocation)}<button class="ghost" style="width:100%;margin-top:10px" onclick="go('today');x121SetPlanTab('week')">${pairx('دیدن اثر در برنامه من','Im Plan ansehen')}</button>`;root.prepend(card)};
  const oldPractice=window.renderPractice;
  window.renderPractice=function(){oldPractice();let root=document.getElementById('view-practice');if(!root)return;let next=todayTasks().find(x=>!taskDoneSafe(x));if(!next)return;let note=document.createElement('div');note.className='x121-progress-link';note.innerHTML=`<b>${pairx('یادگیری در خدمت برنامه','Lernen folgt deinem Plan')}</b><div class="small muted">${pairx(`جلسه بعدی برنامه: ${moduleLabel(next.module)} · ${Number(next.minutes||0)} دقیقه`,`Nächste Plansitzung: ${moduleLabel(next.module)} · ${Number(next.minutes||0)} Minuten`)}</div><button class="ghost" style="margin-top:8px" onclick="x121OpenModule('${escx(next.module)}','${escx(next.id)}')">${pairx('اجرای جلسه برنامه','Plansitzung starten')}</button>`;root.prepend(note)};
  // Keep user data key stable forever from X12 onward. Initialize only additive planner fields.
  planner();state.ui=state.ui||{};state.ui.myPlanTab=state.ui.myPlanTab||'today';save();renderAll();
})();
