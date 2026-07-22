/* DeutschWeg X13.6.2 — Pflege-style navigation parity for the web build.
   Reuses existing content/routes; no vocabulary, sentence or CEFR content is generated here. */
(() => {
  'use strict';
  const VERSION='13.6.2';
  const U=window.DW_CONTENT_UNIVERSE||{domains:[],topics:[]};
  const txt=(fa,de)=>{try{return t(fa,de)}catch(_){return fa}};
  const safe=v=>{try{return esc(String(v??''))}catch(_){return String(v??'')}};
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
  const APPS=[
    {id:'my-plan',icon:'▣',fa:'برنامه من',de:'Mein Plan',descFa:'برنامه امروز و جلسه بعدی',descDe:'Tagesplan und nächste Einheit',cat:'plan'},
    {id:'calendar',icon:'▦',fa:'تقویم آموزشی',de:'Lernkalender',descFa:'نمای روزانه و هفتگی',descDe:'Tages- und Wochenansicht',cat:'plan'},
    {id:'planner',icon:'◎',fa:'سازنده برنامه',de:'Planer',descFa:'هدف، زمان و ترکیب مهارت‌ها',descDe:'Ziele, Zeit und Skill-Mix',cat:'plan'},
    {id:'topics',icon:'◇',fa:'همه موضوع‌ها',de:'Alle Themen',descFa:'۳۰ حوزه و ۳۴۱ موضوع',descDe:'30 Bereiche und 341 Themen',cat:'learn'},
    {id:'learning-path',icon:'→',fa:'مسیر سطحی',de:'Lernpfad',descFa:'A1 تا C2 و قدم بعدی',descDe:'A1 bis C2 und nächster Schritt',cat:'learn'},
    {id:'four-skills',icon:'4',fa:'چهار مهارت',de:'Vier Fertigkeiten',descFa:'خواندن، شنیدن، گفتن و نوشتن',descDe:'Lesen, Hören, Sprechen, Schreiben',cat:'skills'},
    {id:'reading',icon:'R',fa:'خواندن',de:'Lesen',descFa:'متن، درک مطلب و واژه در متن',descDe:'Texte, Verständnis und Kontext',cat:'skills'},
    {id:'listening',icon:'H',fa:'شنیدن',de:'Hören',descFa:'پادکست، دیکته و شنیدار',descDe:'Podcast, Diktat und Hörtraining',cat:'skills'},
    {id:'speaking',icon:'S',fa:'مکالمه و تلفظ',de:'Sprechen',descFa:'تلفظ، تکرار و بازگویی',descDe:'Aussprache, Shadowing, Nacherzählung',cat:'skills'},
    {id:'writing',icon:'W',fa:'نوشتن',de:'Schreiben',descFa:'جمله، متن و بازخورد',descDe:'Sätze, Texte und Feedback',cat:'skills'},
    {id:'vocabulary',icon:'V',fa:'هسته واژگان',de:'Wortschatzkern',descFa:'واژگان، جزئیات و کیفیت',descDe:'Wörter, Details und Qualität',cat:'words'},
    {id:'srs',icon:'↻',fa:'مرور هوشمند',de:'SRS Review',descFa:'مرورهای موعددار و فلش‌کارت',descDe:'Fällige Wiederholungen und Karten',cat:'words'},
    {id:'grammar',icon:'G',fa:'گرامر و تمرین',de:'Grammatik & Üben',descFa:'تمرین سطح‌بندی‌شده',descDe:'Niveaugerechte Übungen',cat:'learn'},
    {id:'stories',icon:'B',fa:'کتاب و داستان',de:'Bücher & Geschichten',descFa:'داستان، خواندن و بازگویی',descDe:'Geschichten, Lesen und Erzählen',cat:'learn'},
    {id:'media',icon:'◉',fa:'رسانه و فیلم',de:'Medien & Film',descFa:'فیلم، موسیقی و محتوای شنیداری',descDe:'Film, Musik und Audio',cat:'resources'},
    {id:'resources',icon:'↗',fa:'منابع معتبر',de:'Verlässliche Quellen',descFa:'Goethe، DW و منابع آموزشی',descDe:'Goethe, DW und Lernquellen',cat:'resources'},
    {id:'methods',icon:'◈',fa:'روش‌های یادگیری',de:'Lernmethoden',descFa:'مرور فاصله‌دار و بازیابی فعال',descDe:'Spacing und Retrieval',cat:'resources'},
    {id:'progress',icon:'▥',fa:'پیشرفت',de:'Fortschritt',descFa:'زمان، مهارت و روند یادگیری',descDe:'Zeit, Skills und Lerntrend',cat:'progress'},
    {id:'categories',icon:'☷',fa:'کتگوری‌ها',de:'Kategorien',descFa:'پوشش کامل موضوع‌ها و مشاغل',descDe:'Alle Themen- und Berufswelten',cat:'system'},
    {id:'search',icon:'⌕',fa:'جست‌وجوی سراسری',de:'Globale Suche',descFa:'واژه، موضوع، مهارت و منبع',descDe:'Wort, Thema, Skill und Quelle',cat:'system'},
    {id:'settings',icon:'⚙',fa:'تنظیمات و داده',de:'Einstellungen & Daten',descFa:'زبان، ظاهر، Backup و بازیابی',descDe:'Sprache, Ansicht, Backup',cat:'system'}
  ];
  const CATS=[['all','همه','Alle'],['plan','برنامه','Plan'],['learn','یادگیری','Lernen'],['skills','مهارت‌ها','Skills'],['words','واژگان','Wörter'],['resources','منابع','Quellen'],['progress','پیشرفت','Fortschritt'],['system','سیستم','System']];
  function xs(){
    state.x1362=state.x1362||{};
    const x=state.x1362;
    x.version=VERSION;
    x.favorites=Array.isArray(x.favorites)?x.favorites:[];
    x.recent=Array.isArray(x.recent)?x.recent:[];
    x.category=x.category||'all';
    x.query=String(x.query||'');
    return x;
  }
  function app(id){return APPS.find(x=>x.id===id)}
  function remember(id){const x=xs();x.recent=[id,...x.recent.filter(v=>v!==id)].slice(0,12);save()}
  function openTab(tab){state.ui.practiceTab=tab;save();go('practice')}
  function openDomain(id){if(window.DW_X136?.openDomain)return DW_X136.openDomain(id);openTab('universe')}
  function openApp(id){
    const a=app(id);if(!a)return;remember(id);
    switch(id){
      case 'my-plan':state.ui.selectedDate=iso(new Date());return go('today');
      case 'calendar':return go('calendar');
      case 'planner':return go('builder');
      case 'topics':case 'four-skills':return openTab('universe');
      case 'learning-path':return openTab('learn');
      case 'reading':return openDomain('books-stories');
      case 'listening':return openTab('podcast');
      case 'speaking':return openTab('pron');
      case 'writing':return openTab('exercise');
      case 'vocabulary':if(typeof window.x134OpenHub==='function')return x134OpenHub();return openTab('vocab');
      case 'srs':return openTab('cards');
      case 'grammar':return openTab('exercise');
      case 'stories':return openDomain('books-stories');
      case 'media':return openTab('media');
      case 'resources':return openTab('resources');
      case 'methods':return openTab('methods');
      case 'progress':return go('report');
      case 'categories':return window.DW_X136?.openCategories?.();
      case 'search':return openGlobalSearch();
      case 'settings':return openSettings();
    }
  }
  function toggleFav(id,e){if(e){e.preventDefault();e.stopPropagation()}const x=xs(),i=x.favorites.indexOf(id);if(i>=0)x.favorites.splice(i,1);else x.favorites.unshift(id);save();refreshVisibleMenus()}
  function card(a,badge=''){
    const fav=xs().favorites.includes(a.id);
    return `<button class="dw1362-card" onclick="DW_X1362.open('${a.id}')"><span class="dw1362-icon">${safe(a.icon)}</span><b>${txt(a.fa,a.de)}</b><small>${txt(a.descFa,a.descDe)}</small>${badge?`<span class="dw1362-badge">${safe(badge)}</span>`:''}<span class="dw1362-fav ${fav?'on':''}" onclick="DW_X1362.favorite('${a.id}',event)">★</span></button>`
  }
  function appTile(a){const fav=xs().favorites.includes(a.id);return `<button class="dw1362-app" onclick="DW_X1362.open('${a.id}')"><span class="dw1362-icon">${safe(a.icon)}</span><b>${txt(a.fa,a.de)}</b><small>${txt(a.descFa,a.descDe)}</small><span class="dw1362-fav ${fav?'on':''}" onclick="DW_X1362.favorite('${a.id}',event)">★</span></button>`}
  function rail(title,items,more=''){return `<section class="dw1362-section"><div class="dw1362-section-head"><h3>${title}</h3>${more}</div><div class="dw1362-rail">${items.length?items.map(x=>card(x)).join(''):`<div class="dw1362-empty">${txt('هنوز موردی ثبت نشده است.','Noch keine Einträge.')}</div>`}</div></section>`}
  function homeHTML(){
    const today=(typeof sessionsOn==='function'?sessionsOn(new Date()):[]),pending=today.filter(x=>!taskDone(x.id));
    const continueItems=[];
    continueItems.push(app('my-plan'));
    if((typeof dueCardsCount==='function'?dueCardsCount():0)>0)continueItems.push(app('srs'));
    (xs().recent||[]).map(app).filter(Boolean).forEach(a=>{if(!continueItems.includes(a)&&continueItems.length<5)continueItems.push(a)});
    const priority=(state.x136?.prioritySkills||[]).map(s=>({Lesen:'reading',Hören:'listening',Sprechen:'speaking',Schreiben:'writing',Wortschatz:'vocabulary',Grammatik:'grammar'}[s])).map(app).filter(Boolean);
    const recommended=(priority.length?priority:['topics','four-skills','vocabulary','listening'].map(app)).slice(0,6);
    const groups=(state.x136?.selectedGroups?.length?state.x136.selectedGroups:['alltag','travel','work']).map(id=>GROUPS.find(g=>g.id===id)).filter(Boolean).slice(0,6);
    const groupApps=groups.map(g=>({id:'group-'+g.id,icon:g.icon,fa:g.fa,de:g.de,descFa:`${g.domains.reduce((n,id)=>n+Number(U.domains?.find(d=>d.id===id)?.topicCount||0),0)} موضوع`,descDe:`${g.domains.reduce((n,id)=>n+Number(U.domains?.find(d=>d.id===id)?.topicCount||0),0)} Themen`,cat:'learn',groupId:g.id}));
    return `<section class="dw1362-home" data-dw1362-home><div class="dw1362-home-note">${pending.length?`${pending.length} ${txt('فعالیت در برنامه امروز باقی مانده است.','Aufgaben im Tagesplan sind offen.')}`:txt('مسیر، موضوع‌ها و ابزارها مانند برنامه مرجع در قفسه‌های روشن و مرحله‌ای مرتب شده‌اند.','Lernweg, Themen und Werkzeuge sind in klaren, schrittweisen Regalen geordnet.')}</div>${rail(txt('ادامه مسیر','Weiterlernen'),continueItems,`<button onclick="DW_X1362.open('my-plan')">${txt('برنامه من','Mein Plan')}</button>`)}${rail(txt('پیشنهاد برای شما','Für dich empfohlen'),recommended)}<section class="dw1362-section"><div class="dw1362-section-head"><h3>${txt('جهان‌های منتخب','Deine Lernwelten')}</h3><button onclick="DW_X1362.open('categories')">${txt('همه کتگوری‌ها','Alle Kategorien')}</button></div><div class="dw1362-rail">${groupApps.map(g=>`<button class="dw1362-card" onclick="DW_X1362.openGroup('${g.groupId}')"><span class="dw1362-icon">${g.icon}</span><b>${txt(g.fa,g.de)}</b><small>${txt(g.descFa,g.descDe)}</small><span class="dw1362-badge">CEFR</span></button>`).join('')}</div></section>${rail(txt('اخیراً استفاده‌شده','Zuletzt verwendet'),xs().recent.map(app).filter(Boolean).slice(0,6))}</section>`
  }
  function learnHTML(){
    const launch=['topics','learning-path','four-skills','vocabulary','listening','speaking','grammar','stories'].map(app);
    return `<section class="dw1362-learn-launch" data-dw1362-learn><div class="dw1362-learn-launch-head"><div><span class="kicker">LEARN CENTER</span><h2>${txt('مرکز یادگیری','Lernzentrum')}</h2><p>${txt('ورودی‌های اصلی مثل برنامه مرجع در یک مرکز فشرده قرار گرفته‌اند؛ جزئیات فقط پس از انتخاب باز می‌شوند.','Die Hauptbereiche liegen wie in der Referenz-App in einem kompakten Zentrum; Details öffnen sich erst nach Auswahl.')}</p></div><button class="dw1362-learn-search" onclick="DW_X1362.open('search')">⌕</button></div><div class="dw1362-launch-grid">${launch.map(a=>`<button class="dw1362-launch" onclick="DW_X1362.open('${a.id}')"><span>${a.icon}</span><b>${txt(a.fa,a.de)}</b><small>${txt(a.descFa,a.descDe)}</small></button>`).join('')}</div>${rail(txt('میانبرهای یادگیری','Lern-Schnellzugriff'),['reading','listening','speaking','writing','srs'].map(app))}</section>`
  }
  function filteredApps(){const x=xs(),q=x.query.trim().toLowerCase();return APPS.filter(a=>(x.category==='all'||a.cat===x.category)&&(!q||[a.fa,a.de,a.descFa,a.descDe,a.cat].join(' ').toLowerCase().includes(q)))}
  function moreHTML(){
    const x=xs(),favs=x.favorites.map(app).filter(Boolean),recent=x.recent.map(app).filter(Boolean);
    return `<section class="dw1362-more" data-dw1362-more><div class="dw1362-more-head"><span class="kicker">APP DRAWER</span><h2>${txt('بیشتر و همه ابزارها','Mehr & alle Werkzeuge')}</h2><p>${txt('جست‌وجو، علاقه‌مندی‌ها، موارد اخیر و همه ماژول‌ها؛ مشابه معماری منوی برنامه مرجع.','Suche, Favoriten, zuletzt verwendet und alle Module – nach der Architektur der Referenz-App.')}</p></div><div class="dw1362-searchbox"><span>⌕</span><input value="${safe(x.query)}" oninput="DW_X1362.search(this.value)" placeholder="${txt('جست‌وجو در منوها، موضوع‌ها و ابزارها…','Menüs, Themen und Werkzeuge durchsuchen…')}"></div><div class="dw1362-chips">${CATS.map(c=>`<button class="dw1362-chip ${x.category===c[0]?'active':''}" onclick="DW_X1362.category('${c[0]}')">${txt(c[1],c[2])}</button>`).join('')}</div>${favs.length?rail(txt('علاقه‌مندی‌ها','Favoriten'),favs):''}${recent.length?rail(txt('اخیراً استفاده‌شده','Zuletzt verwendet'),recent.slice(0,8)):''}<details class="dw1362-collapsed" open><summary>${txt('همه برنامه‌ها و ابزارها','Alle Apps & Werkzeuge')}</summary><div class="dw1362-app-grid" id="dw1362AllApps">${filteredApps().map(appTile).join('')||`<div class="dw1362-empty">${txt('موردی پیدا نشد.','Keine Treffer.')}</div>`}</div></details></section>`
  }
  function ensureContextNav(){
    if(document.getElementById('dw1362ContextNav'))return;
    document.body.insertAdjacentHTML('beforeend',`<nav class="dw1362-context-nav" id="dw1362ContextNav"><button data-dwctx="overview" onclick="DW_X1362.open('learning-path')"><span>⌂</span>${txt('نمای کلی','Übersicht')}</button><button data-dwctx="topics" onclick="DW_X1362.open('topics')"><span>◇</span>${txt('موضوع‌ها','Themen')}</button><button data-dwctx="words" onclick="DW_X1362.open('vocabulary')"><span>V</span>${txt('واژگان','Wörter')}</button><button data-dwctx="practice" onclick="DW_X1362.open('four-skills')"><span>4</span>${txt('تمرین','Üben')}</button><button data-dwctx="search" onclick="DW_X1362.open('search')"><span>⌕</span>${txt('جست‌وجو','Suche')}</button></nav>`)
  }
  function updateContext(){ensureContextNav();const n=document.getElementById('dw1362ContextNav'),show=state.ui?.view==='practice'&&!document.body.classList.contains('x136-wizard-open');n?.classList.toggle('show',show);document.body.classList.toggle('dw1362-learn-context',show);n?.querySelectorAll('button').forEach(b=>b.classList.remove('active'));let key=state.ui?.practiceTab==='universe'?'topics':['vocab','cards'].includes(state.ui?.practiceTab)?'words':['exercise','podcast','pron','media'].includes(state.ui?.practiceTab)?'practice':'overview';n?.querySelector(`[data-dwctx="${key}"]`)?.classList.add('active')}
  function renderBottomLabels(){
    const labels={home:[txt('خانه','Start'),'home'],today:[txt('برنامه من','Mein Plan'),'plan'],practice:[txt('یادگیری','Lernen'),'learn'],report:[txt('پیشرفت','Fortschritt'),'progress'],more:[txt('بیشتر','Mehr'),'more']};
    document.querySelectorAll('#bottomNav .navbtn').forEach(b=>{const v=b.dataset.view;if(!labels[v])return;const s=b.querySelector('span');if(s)s.textContent=labels[v][0];b.setAttribute('aria-label',labels[v][0]);b.dataset.dwRole=labels[v][1]})
  }
  function refreshVisibleMenus(){
    const h=document.querySelector('[data-dw1362-home]');if(h)h.outerHTML=homeHTML();
    const m=document.querySelector('[data-dw1362-more]');if(m)m.outerHTML=moreHTML();
  }
  window.DW_X1362={
    open:openApp,
    favorite:toggleFav,
    search(v){xs().query=String(v||'');save();const box=document.getElementById('dw1362AllApps');if(box)box.innerHTML=filteredApps().map(appTile).join('')||`<div class="dw1362-empty">${txt('موردی پیدا نشد.','Keine Treffer.')}</div>`},
    category(v){xs().category=v||'all';save();const root=document.querySelector('[data-dw1362-more]');if(root)root.outerHTML=moreHTML()},
    openGroup(id){const g=GROUPS.find(x=>x.id===id);if(!g)return openApp('categories');remember('topics');if(window.DW_X136?.openDomain&&g.domains[0])return DW_X136.openDomain(g.domains[0]);openTab('universe')}
  };
  const oldNav=window.nav;window.nav=function(){oldNav();renderBottomLabels();updateContext()};
  const oldHome=window.renderHome;window.renderHome=function(){oldHome();const root=document.getElementById('view-home');if(root&&!root.querySelector('[data-dw1362-home]'))root.insertAdjacentHTML('beforeend',homeHTML())};
  const oldPractice=window.renderPractice;window.renderPractice=function(){oldPractice();const root=document.getElementById('view-practice');if(root&&!root.querySelector('[data-dw1362-learn]'))root.insertAdjacentHTML('afterbegin',learnHTML());updateContext()};
  const oldMore=window.renderMore;window.renderMore=function(){oldMore();const root=document.getElementById('view-more');if(root&&!root.querySelector('[data-dw1362-more]'))root.insertAdjacentHTML('afterbegin',moreHTML())};
  const oldGo=window.go;window.go=function(v){oldGo(v);setTimeout(updateContext,0)};
  xs();ensureContextNav();try{save()}catch(_){ }try{renderAll()}catch(e){console.error('[DeutschWeg X13.6.2 navigation]',e)}
})();
