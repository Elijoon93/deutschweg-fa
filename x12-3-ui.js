/* DeutschWeg X12.3 — UI Consolidation & Persian UX Cleanup
   Final presentation layer only. It does not change STORAGE_KEY or delete user data.
*/
(() => {
  'use strict';
  const SVG={
    play:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
    target:'<svg class="x123-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M22 12h-3"/></svg>',
    clock:'<svg class="x123-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    book:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"/></svg>',
    audio:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M5 9h4l5-4v14l-5-4H5zM17 9c1.5 1.7 1.5 4.3 0 6M19.5 6.5c3 3 3 8 0 11"/></svg>',
    mic:'<svg class="x123-svg" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/></svg>',
    pen:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M4 20l4.5-1 10-10-3.5-3.5-10 10zM13.5 7l3.5 3.5"/></svg>',
    cards:'<svg class="x123-svg" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h6"/></svg>',
    exam:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M7 3h10l3 3v15H4V3zM17 3v4h4M8 11h8M8 15h6"/></svg>',
    search:'<svg class="x123-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>',
    bell:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3zM10 20h4"/></svg>',
    install:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M12 3v12M8 11l4 4 4-4M5 20h14"/></svg>',
    settings:'<svg class="x123-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9L1.1 5.9l.9 1.9-.7 1.7L0 10.5v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z" transform="translate(2 0) scale(.83)"/></svg>',
    chevron:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    menu:'<svg class="x123-svg" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };
  function txt(fa,de){try{return t(fa,de)}catch(e){return fa}}
  function safe(v){try{return esc(String(v??''))}catch(e){return String(v??'')}}
  function todayKey(){return new Date().toISOString().slice(0,10)}
  function allToday(){try{return sessionsOn(new Date())||[]}catch(e){return []}}
  function done(x){try{return taskDone(x.id)}catch(e){return !!state.completed?.[x.id]}}
  function modBadge(mid){const M={Lesen:'R',Hören:'H',Schreiben:'W',Sprechen:'S',Grammatik:'G',Wortschatz:'V',Podcast:'P',Flashcards:'K',Prüfung:'T',Shadowing:'SH',Film:'F',Musik:'M'};return M[mid]||String(mid||'').slice(0,2).toUpperCase()}
  function weakest(){let skills=['Lesen','Hören','Schreiben','Sprechen','Grammatik','Wortschatz'],m=state.learning?.x12?.mastery||{};return skills.map(s=>[s,Number(m[s]||0)]).sort((a,b)=>a[1]-b[1])[0][0]}
  function overdueCount(){let k=todayKey();return (state.plan?.sessions||[]).filter(x=>x.date<k&&!done(x)).length}
  function goalStatus(){let o=overdueCount(),sum=studySummary(),target=Number(state.profile.weeklyTarget||360),ratio=target?sum.week/target:1;if(o>=5||ratio<.45)return txt('نیازمند توجه','Aufmerksamkeit nötig');if(o>=2||ratio<.75)return txt('کمی عقب‌تر از برنامه','Leicht hinter Plan');return txt('هم‌مسیر با هدف','Im Plan')}
  function deadline(){try{let d=new Date((state.profile.startDate||todayKey())+'T12:00:00');d.setDate(d.getDate()+Number(state.profile.weeks||12)*7);return new Intl.DateTimeFormat(state.lang==='de'?'de-DE':'fa-IR',{year:'numeric',month:'short',day:'numeric'}).format(d)}catch(e){return '—'}}
  function openPlan(tab='today'){state.ui.myPlanTab=tab;state.ui.selectedDate=todayKey();save();go('today')}
  window.x123OpenPlan=openPlan;

  const previousHome=window.renderHome;
  window.renderHome=function(){
    let p=planStats(),sum=studySummary(),tasks=allToday(),pending=tasks.filter(x=>!done(x)),next=pending[0],cur=state.profile.currentLevel==='UNKNOWN'?txt('تعیین‌نشده','Unbekannt'):state.profile.currentLevel,tar=state.profile.targetLevel||'—',weak=weakest(),who=state.profile.name?safe(state.profile.name):txt('زبان‌آموز','Lernende/r'),remaining=pending.reduce((a,x)=>a+Number(x.minutes||0),0),over=overdueCount();
    let preview=tasks.slice(0,4).map(x=>`<button class="x123-plan-item" onclick="${done(x)?`x123OpenPlan('today')`:`x121OpenModule('${safe(x.module)}','${safe(x.id)}')`}"><span class="x123-module-badge">${modBadge(x.module)}</span><span><b>${safe(moduleName(x.module))}</b><small>${safe(x.start||'')}${x.start?' · ':''}${Number(x.minutes||0)} ${txt('دقیقه','Min.')}${done(x)?' · '+txt('انجام‌شده','erledigt'):''}</small></span><em>${done(x)?txt('تمام','Fertig'):txt('شروع','Start')}</em></button>`).join('');
    document.getElementById('view-home').innerHTML=`<div class="x123-home">
      <section class="x123-hero">
        <div class="x123-hero-top"><div><span class="x123-eyebrow">${txt('برنامه شخصی یادگیری شما','Dein persönlicher Lernplan')}</span><h2>${txt('سلام','Hallo')} ${who}</h2><p>${txt('DeutschWeg هر روز از برنامه، عملکرد و هدف شما یک قدم بعدی روشن می‌سازد.','DeutschWeg verbindet Plan, Leistung und Ziel zu einem klaren nächsten Schritt.')}</p></div><div class="x123-level"><b>${safe(cur)} → ${safe(tar)}</b><span>${txt('هدف تا','Ziel bis')} ${safe(deadline())}</span></div></div>
        <div class="x123-hero-action"><div><strong>${next?txt('ادامه برنامه امروز','Heutigen Plan fortsetzen'):txt('برنامه امروز را بررسی کنید','Heutigen Plan ansehen')}</strong><small>${pending.length?`${pending.length} ${txt('فعالیت','Aufgaben')} · ${remaining} ${txt('دقیقه باقی‌مانده','Min. übrig')}`:txt('برای امروز فعالیت بازی باقی نمانده است.','Für heute sind keine offenen Aufgaben mehr vorhanden.')}</small></div><button onclick="${next?`x121OpenModule('${safe(next.module)}','${safe(next.id)}')`:`x123OpenPlan('today')`}">${txt('ادامه','Weiter')}</button></div>
      </section>
      <div class="x123-grid"><main class="x123-stack">
        <section class="x123-panel"><div class="x123-panel-head"><div><h3>${txt('برنامه امروز','Heutiger Plan')}</h3><p>${tasks.length?`${tasks.filter(done).length}/${tasks.length} ${txt('انجام شده','erledigt')}`:txt('هنوز جلسه‌ای برای امروز ندارید.','Noch keine Sitzung für heute.')}</p></div><button class="ghost" onclick="x123OpenPlan('today')">${txt('برنامه من','Mein Plan')}</button></div><div class="x123-plan-list">${preview||`<div class="empty">${txt('از «برنامه من» زمان‌های مطالعه را تنظیم کنید.','Lege unter „Mein Plan“ deine Lernzeiten fest.')}</div>`}</div></section>
        <section class="x123-panel x123-insight"><span class="x123-eyebrow">${txt('پیشنهاد هوشمند','Intelligente Empfehlung')}</span><h3>${txt(`این هفته توجه بیشتری به ${moduleName(weak)} بدهید.`,`Diese Woche ${moduleName(weak)} stärker gewichten.`)}</h3><p>${over?txt(`${over} جلسه عقب‌افتاده شناسایی شده است. برنامه من می‌تواند آن‌ها را بدون تغییر فعالیت‌های تکمیل‌شده بازتنظیم کند.`,`${over} überfällige Sitzungen wurden erkannt. Mein Plan kann sie neu verteilen, ohne erledigte Aufgaben zu verändern.`):txt('ترکیب هفته بعد بر اساس مهارت‌های ضعیف‌تر و عملکرد واقعی شما قابل تطبیق است.','Der nächste Wochenmix kann anhand deiner Schwächen und echten Leistung angepasst werden.')}</p><button class="ghost" onclick="x123OpenPlan('intelligence')">${txt('بازکردن تحلیل و تطبیق برنامه','Plananalyse öffnen')}</button></section>
      </main><aside class="x123-stack">
        <section class="x123-panel"><div class="x123-panel-head"><div><h3>${txt('وضعیت مسیر','Lernstatus')}</h3><p>${goalStatus()}</p></div></div><div class="x123-metrics"><div class="x123-metric"><b>${Math.round(p.pct||0)}%</b><span>${txt('پیشرفت مسیر','Lernweg')}</span></div><div class="x123-metric"><b>${fmtMin(sum.week)}</b><span>${txt('مطالعه این هفته','Diese Woche')}</span></div><div class="x123-metric"><b>${over}</b><span>${txt('جلسه عقب‌افتاده','Überfällig')}</span></div><div class="x123-metric"><b>${safe(moduleName(weak))}</b><span>${txt('نیازمند توجه','Fokusbedarf')}</span></div></div></section>
        <section class="x123-panel"><div class="x123-panel-head"><div><h3>${txt('دسترسی سریع','Schnellzugriff')}</h3><p>${txt('ابزارها در خدمت برنامه شما هستند.','Werkzeuge folgen deinem Plan.')}</p></div></div><div class="x123-quick"><button onclick="startFocusTimer()">${SVG.clock}<b>${txt('حالت تمرکز','Fokusmodus')}</b><span>${txt('ثبت خودکار زمان','Zeit automatisch erfassen')}</span></button><button onclick="state.ui.practiceTab='vocab';go('practice')">${SVG.cards}<b>${txt('واژگان و مرور','Wortschatz')}</b><span>${txt('بانک واژه و مرور فاصله‌دار','Wortbank & Wiederholung')}</span></button><button onclick="state.ui.practiceTab='pron';go('practice')">${SVG.mic}<b>${txt('تلفظ و مکالمه','Aussprache')}</b><span>${txt('شنیدن، تکرار و تمرین','Hören & Nachsprechen')}</span></button><button onclick="window.openExamCenter?window.openExamCenter():go('practice')">${SVG.exam}<b>${txt('آزمون و آمادگی','Prüfung')}</b><span>${txt('سطح و آمادگی آزمون','Niveau & Prüfung')}</span></button></div></section>
      </aside></div>
    </div>`;
  };

  const previousMore=window.renderMore;
  window.renderMore=function(){
    let installed=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    document.getElementById('view-more').innerHTML=`<div class="x123-more"><header class="x123-page-head"><span class="x123-eyebrow">DeutschWeg</span><h2>${txt('بیشتر','Mehr')}</h2><p>${txt('ابزارهای مکمل، منابع، آزمون و تنظیمات؛ برنامه‌ریزی اصلی در «برنامه من» باقی می‌ماند.','Ergänzende Werkzeuge, Quellen, Prüfungen und Einstellungen; die Planung bleibt unter „Mein Plan“.')}</p></header>
      <section class="x123-group"><h3>${txt('ابزارهای یادگیری','Lernwerkzeuge')}</h3><div class="x123-tile-grid"><button class="x123-tile" onclick="state.ui.practiceTab='vocab';go('practice')">${SVG.cards}<b>${txt('واژگان و فلش‌کارت','Wortschatz & Karten')}</b><span>${txt('مرور و یادگیری واژگان','Wörter lernen und wiederholen')}</span></button><button class="x123-tile" onclick="state.ui.practiceTab='pron';go('practice')">${SVG.mic}<b>${txt('تلفظ و مکالمه','Aussprache & Sprechen')}</b><span>${txt('تکرار، شنیدن و تمرین گفتار','Nachsprechen und Sprechen')}</span></button><button class="x123-tile" onclick="state.ui.practiceTab='podcast';go('practice')">${SVG.audio}<b>${txt('پادکست و شنیدار','Podcast & Hören')}</b><span>${txt('تمرین شنیداری هدفمند','Gezieltes Hörtraining')}</span></button><button class="x123-tile" onclick="window.openWritingLab?window.openWritingLab():go('practice')">${SVG.pen}<b>${txt('آزمایشگاه نوشتن','Schreibwerkstatt')}</b><span>${txt('تمرین تولید نوشتاری','Schreibproduktion üben')}</span></button></div></section>
      <section class="x123-group"><h3>${txt('آزمون و منابع','Prüfung & Quellen')}</h3><div class="x123-tile-grid"><button class="x123-tile" onclick="openResource('goethe-test')">${SVG.target}<b>${txt('تعیین سطح','Einstufung')}</b><span>${txt('ارزیابی اولیه سطح','Niveau orientieren')}</span></button><button class="x123-tile" onclick="window.openExamCenter?window.openExamCenter():go('practice')">${SVG.exam}<b>${txt('مرکز آزمون','Prüfungszentrum')}</b><span>Goethe · telc · ÖSD</span></button><button class="x123-tile" onclick="state.ui.practiceTab='resources';go('practice')">${SVG.book}<b>${txt('منابع معتبر','Verlässliche Quellen')}</b><span>Goethe · DW · Duden</span></button></div></section>
      <section class="x123-group"><h3>${txt('حساب، داده و برنامه','Konto, Daten & App')}</h3><div class="x123-tile-grid"><button class="x123-tile" onclick="openGlobalSearch()">${SVG.search}<b>${txt('جست‌وجوی سراسری','Globale Suche')}</b><span>${txt('واژه، مهارت و منبع','Wort, Fertigkeit, Quelle')}</span></button><button class="x123-tile" onclick="openNotifications()">${SVG.bell}<b>${txt('پیگیری‌ها','Hinweise')}</b><span>${txt('کارهای مهم و عقب‌افتادگی‌ها','Wichtige Punkte & Rückstände')}</span></button><button class="x123-tile" onclick="openInstallHelp()">${SVG.install}<b>${installed?txt('برنامه نصب شده','App installiert'):txt('نصب برنامه','App installieren')}</b><span>${txt('PWA و دسترسی سریع','PWA & Schnellzugriff')}</span></button><button class="x123-tile" onclick="openSettings()">${SVG.settings}<b>${txt('تنظیمات و داده','Einstellungen & Daten')}</b><span>${txt('ظاهر، پشتیبان‌گیری و همگام‌سازی','Darstellung, Backup & Sync')}</span></button></div></section>
    </div>`;
  };

  const prevNotifications=window.openNotifications;
  window.openNotifications=function(){prevNotifications();let h=document.querySelector('#notificationsSheet h2');if(h)h.textContent=txt('پیگیری‌ها','Hinweise');let k=document.querySelector('#notificationsSheet .kicker');if(k)k.textContent=txt('موارد نیازمند توجه','Zu beachten')};

  // Remove remaining theme emoji from Settings and use explicit text labels.
  const prevSettings=window.openSettings;
  window.openSettings=function(){prevSettings();let sh=document.getElementById('settingsSheet');if(!sh)return;sh.querySelectorAll('button').forEach(b=>{b.innerHTML=b.innerHTML.replace(/[]/g,'').trim()})};

  window.x123ToggleRail=function(){let ex=document.documentElement.dataset.rail==='expanded';document.documentElement.dataset.rail=ex?'compact':'expanded';state.ui=state.ui||{};state.ui.railExpanded=!ex;save()};
  const prevNav=window.nav;
  window.nav=function(){prevNav();document.documentElement.dataset.rail=state.ui?.railExpanded?'expanded':'compact';let n=document.getElementById('bottomNav');if(n&&window.innerWidth>=980&&!n.querySelector('.rail-toggle')){let b=document.createElement('button');b.type='button';b.className='rail-toggle';b.setAttribute('aria-label',txt('باز و بسته کردن منوی کناری','Seitenleiste ein-/ausklappen'));b.innerHTML=SVG.menu;b.onclick=x123ToggleRail;n.appendChild(b)}};

  // Stable user storage contract: presentation updates must never change or clear it.
  if(typeof STORAGE_KEY!=='undefined' && STORAGE_KEY!=='deutschweg_x12_user_data') console.warn('[DeutschWeg X12.3] unexpected storage key',STORAGE_KEY);
  state.ui=state.ui||{};if(typeof state.ui.railExpanded!=='boolean')state.ui.railExpanded=false;save();renderAll();
})();
