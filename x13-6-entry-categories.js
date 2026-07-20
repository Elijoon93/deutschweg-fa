/* DeutschWeg X13.6 — Pflege-inspired entry architecture, universal categories and update-safe persistence.
   Content is not generated here. This layer only organizes the existing 30 domains / 341 topics. */
(() => {
  'use strict';
  const VERSION='13.6.1';
  const ONBOARDING_VERSION=136;
  function isTouchMobileWeb(){
    const coarse=window.matchMedia&&window.matchMedia('(hover:none) and (pointer:coarse)').matches;
    const shortScreen=Math.min(Number(screen.width||0),Number(screen.height||0))<=1024;
    return window.innerWidth<980 || coarse || (Number(navigator.maxTouchPoints||0)>0 && shortScreen);
  }
  function applyWebViewportGuard(){
    const mobile=isTouchMobileWeb();
    document.documentElement.dataset.dwWebMobile=mobile?'1':'0';
    if(mobile){
      document.documentElement.dataset.rail='compact';
      try{state.ui=state.ui||{};state.ui.railExpanded=false}catch(_){ }
    }
  }
  const U=window.DW_CONTENT_UNIVERSE||{domains:[],topics:[]};
  const GROUPS=[
    {id:'alltag',icon:'⌂',fa:'زندگی روزمره و روابط',de:'Alltag & Beziehungen',domains:['daily-life','home-living','family-relations','events-social']},
    {id:'stadt',icon:'▦',fa:'شهر، خدمات و خرید',de:'Stadt, Dienste & Einkaufen',domains:['city-services','shopping-money','administration-law']},
    {id:'food',icon:'◌',fa:'غذا، تفریح و ورزش',de:'Essen, Freizeit & Sport',domains:['food-cooking','leisure-hobbies','sports-fitness']},
    {id:'travel',icon:'→',fa:'سفر و حمل‌ونقل',de:'Reisen & Verkehr',domains:['travel-tourism','transport']},
    {id:'nature',icon:'△',fa:'طبیعت و محیط زیست',de:'Natur & Umwelt',domains:['nature-outdoors','environment']},
    {id:'culture',icon:'◇',fa:'فرهنگ، رسانه، کتاب و داستان',de:'Kultur, Medien & Geschichten',domains:['culture-arts','books-stories','media-news','germany-culture']},
    {id:'study',icon:'▤',fa:'آموزش، علم و آکادمیک',de:'Bildung, Wissen & Akademisch',domains:['education-study','science-knowledge','advanced-academic']},
    {id:'work',icon:'▣',fa:'کار، مشاغل، فناوری و اقتصاد',de:'Arbeit, Berufe, Technik & Wirtschaft',domains:['work-career','professions','technology','finance-business']},
    {id:'society',icon:'◎',fa:'جامعه، ارتباط و مهاجرت',de:'Gesellschaft, Kommunikation & Migration',domains:['society-communication','migration-integration']},
    {id:'health',icon:'＋',fa:'سلامت، ایمنی و شرایط اضطراری',de:'Gesundheit, Sicherheit & Notfall',domains:['health-wellbeing','emergency-safety']},
    {id:'youth',icon:'☆',fa:'کودک و نوجوان',de:'Kinder & Jugendliche',domains:['children-teens']}
  ];
  const PROFESSIONS=[
    ['it','فناوری اطلاعات و نرم‌افزار','IT & Software'],['engineering','مهندسی','Ingenieurwesen'],['mining-hse','معدن، ایمنی و HSE','Bergbau & HSE'],['construction','ساختمان و عمران','Bau'],['healthcare','سلامت و پرستاری','Gesundheit & Pflege'],['education','آموزش','Bildung'],['hospitality','هتل، رستوران و گردشگری','Hotel, Gastronomie & Tourismus'],['retail','فروش و خدمات مشتری','Handel & Kundenservice'],['logistics','لجستیک و رانندگی','Logistik & Fahren'],['office-finance','اداری، مالی و بازاریابی','Büro, Finanzen & Marketing'],['manufacturing','تولید و مشاغل فنی','Produktion & Handwerk']
  ];
  const SKILLS=[['Lesen','خواندن','Lesen'],['Hören','شنیدن','Hören'],['Sprechen','مکالمه','Sprechen'],['Schreiben','نوشتن','Schreiben'],['Wortschatz','واژگان','Wortschatz'],['Grammatik','گرامر','Grammatik']];
  const GOALS=[['general','زندگی روزمره و آلمانی عمومی','Allgemeines Deutsch'],['migration','زندگی و مهاجرت در آلمان','Leben & Migration'],['career','کار و مصاحبه شغلی','Beruf & Bewerbung'],['study','دانشگاه و تحصیل','Studium'],['exam','آزمون زبان','Prüfung'],['travel','سفر و ارتباط واقعی','Reisen'],['profession','آلمانی تخصصی شغل من','Berufsdeutsch']];
  const text=(fa,de)=>{try{return t(fa,de)}catch(_){return fa}};
  const safe=(v)=>{try{return esc(String(v??''))}catch(_){return String(v??'')}};
  const domain=id=>U.domains.find(x=>x.id===id);
  const selected=(arr,id)=>Array.isArray(arr)&&arr.includes(id);
  function ensure(){
    state.x136=state.x136||{};
    const x=state.x136;
    x.version=VERSION;
    x.onboardingVersion=Number(x.onboardingVersion||0);
    x.selectedGroups=Array.isArray(x.selectedGroups)?x.selectedGroups:[];
    x.selectedDomains=Array.isArray(x.selectedDomains)?x.selectedDomains:[];
    x.professionWorlds=Array.isArray(x.professionWorlds)?x.professionWorlds:[];
    x.prioritySkills=Array.isArray(x.prioritySkills)?x.prioritySkills:[];
    x.studyDays=Array.isArray(x.studyDays)?x.studyDays:[0,1,2,3,4];
    x.draft=x.draft||{};
    x.dataGuard=x.dataGuard||{};
    state.profile=state.profile||{};
    if(!Array.isArray(state.profile.interests))state.profile.interests=[];
    if(!Array.isArray(state.profile.categoryIds))state.profile.categoryIds=[];
    if(!Array.isArray(state.profile.professionWorlds))state.profile.professionWorlds=[];
    state.profile.onboardingVersion=Number(state.profile.onboardingVersion||0);
    return x;
  }
  function markVersionGuard(){
    const x=ensure(),last=x.dataGuard.lastAppVersion||state.appVersion||'';
    if(last!==VERSION){
      x.dataGuard.previousAppVersion=last;
      x.dataGuard.lastAppVersion=VERSION;
      x.dataGuard.updatedAt=new Date().toISOString();
      x.dataGuard.storageKey=(typeof STORAGE_KEY!=='undefined'?STORAGE_KEY:'deutschweg_x12_user_data');
      x.dataGuard.packageContract='same-origin-and-package-preserve-data';
    }
  }
  function idbOpen(){return new Promise((resolve,reject)=>{try{const r=indexedDB.open('deutschweg_user_mirror',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('state'))db.createObjectStore('state')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)}catch(e){reject(e)}})}
  async function mirrorState(){try{const db=await idbOpen();await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(JSON.parse(JSON.stringify(state)),'latest');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();ensure().dataGuard.lastMirrorAt=new Date().toISOString()}catch(_){}}
  async function readMirror(){try{const db=await idbOpen();const value=await new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly');const r=tx.objectStore('state').get('latest');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return value}catch(_){return null}}
  async function recoverIfNeeded(){
    const fresh=!state.setup&&!state.lastSaved;
    if(!fresh)return;
    const old=await readMirror();
    if(old&&old.setup&&old.profile){
      try{state=normalizeState(migrateOld(old));ensure();save();renderAll();toast(text('اطلاعات قبلی از حافظه پشتیبان گوشی بازیابی شد','Frühere Daten wurden aus dem Gerätespeicher wiederhergestellt'))}catch(_){ }
    }
  }
  const baseSave=window.save;
  window.save=function(show=false){const result=baseSave(show);clearTimeout(window.__dw136MirrorTimer);window.__dw136MirrorTimer=setTimeout(mirrorState,250);return result};
  function draft(){const x=ensure();return x.draft}
  function setDraft(k,v){draft()[k]=v;save()}
  function toggleArray(k,id){const d=draft(),arr=Array.isArray(d[k])?d[k]:[];const i=arr.indexOf(id);if(i>=0)arr.splice(i,1);else arr.push(id);d[k]=arr;save();renderWizard()}
  function dayLabels(){return state.lang==='de'?['Mo','Di','Mi','Do','Fr','Sa','So']:['د','س','چ','پ','ج','ش','ی']}
  function currentDraft(){
    const x=ensure(),p=state.profile,d=x.draft;
    if(!Object.keys(d).length)Object.assign(d,{name:p.name||'',lang:state.lang||'bi',currentLevel:p.currentLevel||'UNKNOWN',targetLevel:p.targetLevel||'B1',goalType:p.purpose||'general',goalText:p.goal||'',months:Number(p.months||3),daily:Number(p.dailyTarget||60),weekly:Number(p.weeklyTarget||360),days:x.studyDays.slice(),skills:x.prioritySkills.length?x.prioritySkills.slice():['Lesen','Hören','Sprechen','Schreiben'],groups:x.selectedGroups.length?x.selectedGroups.slice():['alltag','travel','work'],domains:x.selectedDomains.slice(),professions:x.professionWorlds.slice()});
    return d
  }
  window.DW_X136={
    toggleChoice:toggleArray,
    choose(k,v){setDraft(k,v);renderWizard()},
    setField(k,v){setDraft(k,v)},
    openCategories(){openCategoryHub()},
    closeCategories(){document.getElementById('x136Drawer')?.classList.remove('show')},
    searchCategories(v){renderCategoryResults(v)},
    openDomain(id){this.closeCategories();if(window.x13OpenUniverse){x13OpenUniverse();setTimeout(()=>x13SetDomain(id),80)}},
    openTopic(id){this.closeCategories();if(window.x13OpenUniverse){x13OpenUniverse();setTimeout(()=>x13OpenTopic(id),100)}},
    editProfile(){openWizard(true)}
  };
  function wizardOption(id,k,title,sub){return `<button type="button" class="x136-choice ${selected(currentDraft()[k],id)?'on':''}" onclick="DW_X136.toggleChoice('${k}','${id}')"><b>${safe(title)}</b>${sub?`<small>${safe(sub)}</small>`:''}</button>`}
  window.openWizard=function(edit=false){currentDraft();wizardStep=1;applyWebViewportGuard();document.body.classList.add('x136-wizard-open');const w=document.getElementById('wizard');w.classList.add('show','x136-setup');w.dataset.edit=edit?'1':'0';w.scrollTop=0;renderWizard()};
  window.renderWizard=function(){
    const el=document.getElementById('wizard'),d=currentDraft();let body='';
    if(wizardStep===1)body=`<div class="card"><div class="x136-welcome"><div class="x136-mark">DW</div><span class="kicker">DeutschWeg</span><h2>${text('مسیر شخصی یادگیری آلمانی','Dein persönlicher Deutschlernweg')}</h2><p class="muted">${text('چند سؤال کوتاه برای ساخت برنامه‌ای متناسب با سطح، هدف، زمان و علایق شما.','Einige kurze Fragen für einen Plan passend zu Niveau, Ziel, Zeit und Interessen.')}</p></div><div class="field"><label>${text('نام یا نام مستعار','Name oder Spitzname')}</label><input id="w136Name" value="${safe(d.name||'')}" oninput="DW_X136.setField('name',this.value)"></div><div class="field"><label>${text('زبان رابط','Menüsprache')}</label><select id="w136Lang" onchange="DW_X136.setField('lang',this.value)"><option value="fa" ${d.lang==='fa'?'selected':''}>فارسی</option><option value="bi" ${d.lang==='bi'?'selected':''}>فارسی + Deutsch</option><option value="de" ${d.lang==='de'?'selected':''}>Deutsch</option></select></div></div>`;
    if(wizardStep===2)body=`<div class="card"><h2>${text('سطح فعلی و مقصد','Aktuelles Niveau und Ziel')}</h2><div class="grid2"><div class="field"><label>${text('سطح فعلی','Aktuelles Niveau')}</label><select onchange="DW_X136.setField('currentLevel',this.value)">${['UNKNOWN','A1','A2','B1','B2','C1','C2'].map(v=>`<option value="${v}" ${d.currentLevel===v?'selected':''}>${v==='UNKNOWN'?text('نمی‌دانم','Unbekannt'):v}</option>`).join('')}</select></div><div class="field"><label>${text('سطح هدف','Zielniveau')}</label><select onchange="DW_X136.setField('targetLevel',this.value)">${['A1','A2','B1','B2','C1','C2'].map(v=>`<option ${d.targetLevel===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="notice">${text('اگر سطح فعلی نامشخص باشد، تعیین سطح به‌عنوان اولین اقدام برنامه ثبت می‌شود.','Bei unbekanntem Niveau wird die Einstufung als erster Schritt geplant.')}</div></div>`;
    if(wizardStep===3)body=`<div class="card"><h2>${text('هدف اصلی شما','Dein Hauptziel')}</h2><div class="x136-options">${GOALS.map(g=>`<button type="button" class="x136-choice ${d.goalType===g[0]?'on':''}" onclick="DW_X136.choose('goalType','${g[0]}')"><b>${text(g[1],g[2])}</b></button>`).join('')}</div><div class="field" style="margin-top:10px"><label>${text('توضیح هدف شخصی (اختیاری)','Persönliches Ziel (optional)')}</label><textarea oninput="DW_X136.setField('goalText',this.value)">${safe(d.goalText||'')}</textarea></div></div>`;
    if(wizardStep===4)body=`<div class="card"><h2>${text('زمان آزاد و روزهای مطالعه','Lernzeit und Lerntage')}</h2><div class="grid2"><div class="field"><label>${text('دقیقه در روز','Minuten pro Tag')}</label><input type="number" min="15" max="480" value="${Number(d.daily||60)}" oninput="DW_X136.setField('daily',Number(this.value||60))"></div><div class="field"><label>${text('مدت هدف به ماه','Zielzeitraum in Monaten')}</label><input type="number" min="1" max="24" value="${Number(d.months||3)}" oninput="DW_X136.setField('months',Number(this.value||3))"></div></div><label class="small muted">${text('روزهای معمول مطالعه','Übliche Lerntage')}</label><div class="x136-days">${dayLabels().map((x,i)=>`<button type="button" class="${selected(d.days,i)?'on':''}" onclick="DW_X136.toggleChoice('days',${i})">${x}</button>`).join('')}</div></div>`;
    if(wizardStep===5)body=`<div class="card"><h2>${text('مهارت‌های مهم‌تر','Priorisierte Fertigkeiten')}</h2><p class="muted">${text('Planner همه مهارت‌ها را پوشش می‌دهد، اما این انتخاب‌ها وزن بیشتری می‌گیرند.','Der Planner deckt alle Fertigkeiten ab, gewichtet diese Auswahl aber stärker.')}</p><div class="x136-options">${SKILLS.map(s=>wizardOption(s[0],'skills',text(s[1],s[2]),'' )).join('')}</div></div>`;
    if(wizardStep===6)body=`<div class="card"><h2>${text('جهان‌های مورد علاقه','Interessante Lernwelten')}</h2><p class="muted">${text('همه ۳۰ حوزه و ۳۴۱ موضوع در برنامه باقی می‌مانند؛ انتخاب شما فقط پیشنهادها را شخصی‌تر می‌کند.','Alle 30 Bereiche und 341 Themen bleiben verfügbar; deine Auswahl personalisiert nur Empfehlungen.')}</p><div class="x136-options">${GROUPS.map(g=>wizardOption(g.id,'groups',text(g.fa,g.de),g.domains.map(id=>domain(id)?.titleFa).filter(Boolean).slice(0,3).join('، '))).join('')}</div></div>`;
    if(wizardStep===7)body=`<div class="card"><h2>${text('دنیای شغلی و جمع‌بندی','Berufswelt und Zusammenfassung')}</h2><details><summary><b>${text('انتخاب حوزه شغلی (اختیاری)','Berufswelt wählen (optional)')}</b></summary><div class="x136-options" style="margin-top:10px">${PROFESSIONS.map(p=>wizardOption(p[0],'professions',text(p[1],p[2]),'')).join('')}</div></details><div class="x136-summary" style="margin-top:12px"><div><small>${text('مسیر','Weg')}</small><b>${safe(d.currentLevel)} → ${safe(d.targetLevel)}</b></div><div><small>${text('زمان','Zeit')}</small><b>${Number(d.daily||60)} min · ${Number(d.months||3)} ${text('ماه','Monate')}</b></div><div><small>${text('مهارت‌های اولویت‌دار','Fokus')}</small><b>${(d.skills||[]).join(' · ')||'—'}</b></div><div><small>${text('جهان‌های منتخب','Welten')}</small><b>${(d.groups||[]).length} / ${GROUPS.length}</b></div></div><div class="x136-data-badge"><span>▣</span><div><b>${text('داده‌های شما هنگام بروزرسانی حفظ می‌شوند','Deine Daten bleiben bei Updates erhalten')}</b><small>${text('کلید ذخیره ثابت، Origin ثابت و Package ID ثابت است؛ همچنین Mirror در IndexedDB و Backup دستی موجود است. حذف برنامه یا پاک‌کردن Data سیستم‌عامل همچنان داده محلی را حذف می‌کند.','Stabiler Speicher-Key, Origin und Package-ID; zusätzlich IndexedDB-Mirror und manuelles Backup. Deinstallation oder Löschen der App-Daten entfernt lokale Daten weiterhin.')}</small></div></div><button class="primary" style="width:100%;margin-top:12px" onclick="finishWizard()">${text('ساخت برنامه و ورود','Plan erstellen und starten')}</button></div>`;
    el.innerHTML=`<div class="wizard"><div class="wizard-brand"><div class="logo">DW</div><div><b>DeutschWeg</b><div class="small muted">${text('Personal Planner + Universal Content Universe','Persönlicher Planner + universelle Lernwelt')}</div></div></div><div class="wizard-progress">${[1,2,3,4,5,6,7].map(x=>`<i class="${x<=wizardStep?'on':''}"></i>`).join('')}</div>${body}<div class="wizard-actions">${wizardStep>1?`<button class="ghost" onclick="wizardBack()">${text('بازگشت','Zurück')}</button>`:'<span></span>'}${wizardStep<7?`<button class="primary" onclick="wizardNext()">${text('ادامه','Weiter')}</button>`:''}</div></div>`
  };
  window.wizardNext=function(){wizardStep=Math.min(7,wizardStep+1);renderWizard()};
  window.wizardBack=function(){wizardStep=Math.max(1,wizardStep-1);renderWizard()};
  window.finishWizard=function(){
    const x=ensure(),d=currentDraft();
    state.profile.name=String(d.name||'').trim();state.lang=d.lang||state.lang||'bi';state.profile.currentLevel=d.currentLevel||'UNKNOWN';state.profile.placementNeeded=state.profile.currentLevel==='UNKNOWN';state.profile.targetLevel=d.targetLevel||'B1';state.profile.purpose=d.goalType||'general';state.profile.goal=String(d.goalText||'').trim();state.profile.months=Math.max(1,Number(d.months||3));state.profile.weeks=Math.max(4,Math.round(state.profile.months*4.345));state.profile.dailyTarget=Math.max(15,Number(d.daily||60));state.profile.weeklyTarget=state.profile.dailyTarget*Math.max(1,(d.days||[]).length||5);state.profile.categoryIds=(d.groups||[]).slice();state.profile.professionWorlds=(d.professions||[]).slice();state.profile.interests=(d.groups||[]).slice();state.profile.onboardingVersion=ONBOARDING_VERSION;
    x.onboardingVersion=ONBOARDING_VERSION;x.selectedGroups=(d.groups||[]).slice();x.professionWorlds=(d.professions||[]).slice();x.prioritySkills=(d.skills||[]).slice();x.studyDays=(d.days||[]).slice();x.selectedDomains=[...new Set(x.selectedGroups.flatMap(id=>GROUPS.find(g=>g.id===id)?.domains||[]))];x.draft={};state.setup=true;state.appVersion=VERSION;markVersionGuard();
    try{state.availability.forEach((r,i)=>r.on=x.studyDays.includes(i))}catch(_){ }
    try{generatePlan(false)}catch(_){ }
    try{closeWizard()}catch(_){document.getElementById('wizard')?.classList.remove('show');document.body.classList.remove('x136-wizard-open')}
    save();renderAll();mirrorState();toast(text('برنامه شخصی ساخته شد','Dein persönlicher Plan wurde erstellt'))
  };
  const baseCloseWizard=window.closeWizard;
  window.closeWizard=function(){
    try{if(typeof baseCloseWizard==='function')baseCloseWizard()}catch(_){ }
    const w=document.getElementById('wizard');if(w)w.classList.remove('show','x136-setup');
    document.body.classList.remove('x136-wizard-open');
  };
  applyWebViewportGuard();
  window.addEventListener('resize',applyWebViewportGuard,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(applyWebViewportGuard,80),{passive:true});
  function recommendedGroups(){const x=ensure();let ids=x.selectedGroups.length?x.selectedGroups:['alltag','travel','work'];return ids.map(id=>GROUPS.find(g=>g.id===id)).filter(Boolean).slice(0,6)}
  function homeEntry(){
    const x=ensure(),name=state.profile.name?`, ${safe(state.profile.name)}`:'',today=(typeof sessionsOn==='function'?sessionsOn(new Date()):[]),pending=today.filter(a=>!taskDone(a.id)),minutes=pending.reduce((a,b)=>a+Number(b.minutes||0),0),cur=state.profile.currentLevel==='UNKNOWN'?'?':state.profile.currentLevel,tar=state.profile.targetLevel||'—';
    return `<section class="x136-entry"><div class="x136-entry-head"><div><span class="x136-entry-kicker">DeutschWeg · ${text('مسیر من','Mein Weg')}</span><h2>${text('امروز از همین‌جا شروع کن','Heute hier starten')}${name}</h2><p>${text('برنامه، موضوع‌ها و تمرین‌ها بر اساس پروفایل شما مرتب شده‌اند.','Plan, Themen und Übungen sind nach deinem Profil geordnet.')}</p></div><div class="x136-level"><b>${safe(cur)}</b><span>→</span><b>${safe(tar)}</b></div></div><button class="x136-main-action" onclick="state.ui.selectedDate=iso(new Date());go('today')"><span><b>${pending.length?text('ادامه برنامه امروز','Tagesplan fortsetzen'):text('بازکردن برنامه من','Meinen Plan öffnen')}</b><small>${pending.length?`${pending.length} ${text('فعالیت','Aufgaben')} · ${minutes} min`:text('برنامه روزانه و هفتگی','Tages- und Wochenplan')}</small></span><i>→</i></button><div class="x136-quick"><button onclick="state.ui.practiceTab='universe';go('practice')"><span>▦</span><b>${text('موضوع‌ها','Themen')}</b></button><button onclick="state.ui.practiceTab='vocab';go('practice')"><span>V</span><b>${text('واژگان','Wörter')}</b></button><button onclick="state.ui.practiceTab='podcast';go('practice')"><span>H</span><b>${text('شنیدار','Hören')}</b></button><button onclick="state.ui.practiceTab='cards';go('practice')"><span>↻</span><b>${text('مرور','Review')}</b></button></div><div class="x136-shelf"><div class="x136-shelf-head"><h3>${text('جهان‌های منتخب شما','Deine Lernwelten')}</h3><button onclick="DW_X136.openCategories()">${text('همه موضوع‌ها','Alle Themen')}</button></div><div class="x136-rail">${recommendedGroups().map(g=>`<button class="x136-world" onclick="DW_X136.openCategories()"><span>${g.icon}</span><b>${text(g.fa,g.de)}</b><small>${g.domains.reduce((n,id)=>n+Number(domain(id)?.topicCount||0),0)} ${text('موضوع','Themen')}</small></button>`).join('')}</div></div><div class="x136-entry-note">▣ ${text('بروزرسانی فایل‌های برنامه، داده‌های یادگیری شما را بازنشانی نمی‌کند. برای انتقال به گوشی دیگر از Backup یا حساب اختیاری استفاده کنید.','App-Updates setzen deine Lerndaten nicht zurück. Für ein anderes Gerät Backup oder optionales Konto verwenden.')}</div></section>`
  }
  const oldHome=window.renderHome;
  window.renderHome=function(){oldHome();const root=document.getElementById('view-home');if(root&&!root.querySelector('.x136-entry'))root.insertAdjacentHTML('afterbegin',homeEntry())};
  const oldMore=window.renderMore;
  window.renderMore=function(){oldMore();const root=document.getElementById('view-more');if(!root||root.querySelector('.x136-more-card'))return;root.insertAdjacentHTML('afterbegin',`<section class="card x136-more-card"><span class="kicker">Content Universe</span><h3>${text('همه موضوع‌ها و کتگوری‌ها','Alle Themen und Kategorien')}</h3><p class="muted">${U.domains.length} ${text('حوزه','Bereiche')} · ${U.topics.length} ${text('موضوع','Themen')} · ${text('پوشش زندگی واقعی و دنیای مشاغل','Alltag und Berufswelten')}</p><div class="actions"><button class="primary" onclick="DW_X136.openCategories()">${text('بازکردن کتگوری‌ها','Kategorien öffnen')}</button><button class="ghost" onclick="DW_X136.editProfile()">${text('ویرایش ورودی و علایق','Profil & Interessen bearbeiten')}</button></div></section>`)};
  function ensureDrawer(){if(document.getElementById('x136Drawer'))return;document.body.insertAdjacentHTML('beforeend',`<div class="x136-drawer" id="x136Drawer" onclick="if(event.target===this)DW_X136.closeCategories()"><div class="x136-drawer-panel"><div class="x136-drawer-grip"></div><div class="x136-drawer-top"><div><span class="kicker">Universal Content Universe</span><h2>${text('همه کتگوری‌ها و موضوع‌ها','Alle Kategorien und Themen')}</h2><small class="muted">${U.domains.length} ${text('حوزه','Bereiche')} · ${U.topics.length} ${text('موضوع','Themen')}</small></div><button class="x136-close" onclick="DW_X136.closeCategories()">×</button></div><div class="x136-search"><input id="x136Search" placeholder="${text('جست‌وجو: سفر، معدن، رستوران، داستان…','Suche: Reisen, Beruf, Restaurant, Geschichten…')}" oninput="DW_X136.searchCategories(this.value)"></div><div id="x136CategoryBody"></div></div></div>`)}
  function groupsHtml(){return GROUPS.map((g,i)=>`<div class="x136-group"><details ${i<2?'open':''}><summary><span>${g.icon}</span><div><b>${text(g.fa,g.de)}</b><small>${g.domains.reduce((n,id)=>n+Number(domain(id)?.topicCount||0),0)} ${text('موضوع','Themen')}</small></div></summary><div class="x136-domains">${g.domains.map(id=>{const d=domain(id);return d?`<button class="x136-domain" onclick="DW_X136.openDomain('${id}')"><b>${text(d.titleFa,d.titleDe)}</b><small>${d.topicCount} ${text('موضوع','Themen')}</small></button>`:''}).join('')}</div></details></div>`).join('')}
  function renderCategoryResults(q=''){const body=document.getElementById('x136CategoryBody');if(!body)return;const term=String(q||'').trim().toLowerCase();if(!term){body.innerHTML=groupsHtml();return}const rows=U.topics.filter(x=>[x.titleFa,x.titleDe,domain(x.domainId)?.titleFa,domain(x.domainId)?.titleDe,(x.skills||[]).join(' ')].join(' ').toLowerCase().includes(term)).slice(0,100);body.innerHTML=`<div class="x136-topic-results">${rows.map(x=>`<button class="x136-topic" onclick="DW_X136.openTopic('${x.id}')"><b>${safe(x.titleFa)}</b><small>${safe(domain(x.domainId)?.titleFa||'')} · ${safe(x.cefrMin)}+ · ${(x.skills||[]).join('، ')}</small></button>`).join('')||`<div class="empty">${text('موضوعی پیدا نشد','Keine Themen gefunden')}</div>`}</div>`}
  function openCategoryHub(){ensureDrawer();renderCategoryResults('');document.getElementById('x136Drawer').classList.add('show');setTimeout(()=>document.getElementById('x136Search')?.focus(),100)}
  const oldSettings=window.openSettings;
  window.openSettings=function(){oldSettings();const sh=document.getElementById('settingsSheet');if(sh&&!sh.querySelector('.x136-settings'))sh.insertAdjacentHTML('beforeend',`<div class="card x136-settings"><span class="kicker">Update-safe Data</span><h3>${text('حفظ داده هنگام بروزرسانی','Daten bei Updates erhalten')}</h3><div class="x136-data-badge"><span>▣</span><div><b>${text('ذخیره محلی فعال است','Lokale Speicherung ist aktiv')}</b><small>${text('Storage Key ثابت: deutschweg_x12_user_data. در Android نیز Package ID و Origin داخلی باید ثابت بماند.','Stabiler Storage Key: deutschweg_x12_user_data. Unter Android müssen Package-ID und interne Origin unverändert bleiben.')}</small></div></div><div class="actions" style="margin-top:10px"><button class="ghost" onclick="DW_X136.editProfile()">${text('اجرای دوباره ورودی بدون حذف داده','Setup erneut ausführen, ohne Daten zu löschen')}</button><button class="ghost" onclick="requestPersistentStorage()">${text('درخواست ذخیره پایدار','Persistenten Speicher anfordern')}</button></div></div>`)};
  applyWebViewportGuard();markVersionGuard();ensureDrawer();save();mirrorState();recoverIfNeeded();try{renderAll()}catch(_){ }
})();
