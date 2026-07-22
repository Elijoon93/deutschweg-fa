/* DeutschWeg X13.7 RC1 — Web Finalization & Real Device Acceptance
   No learning content is generated in this layer. Physical-device PASS remains manual. */
(() => {
  'use strict';
  const VERSION='13.7.0-RC1';
  const STORAGE_KEY='deutschweg_x12_user_data';
  const BACKUP_KEY='deutschweg_x13_7_pre_update_backup';
  const MIRROR_DB='DeutschWegRecovery';
  const MIRROR_STORE='snapshots';
  const CONTENT=window.DW_PHASE1_LANGUAGE_CORE||{lexicon:[],sentences:[]};
  const CEFR=new Set(['A1','A2','B1','B2','C1','C2']);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const tr=(fa,de)=>{try{return t(fa,de)}catch(_){return fa}};
  const safe=(v)=>{try{return esc(String(v??''))}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}};
  const now=()=>new Date().toISOString();
  const lexById=new Map((CONTENT.lexicon||[]).map(x=>[x.id,x]));
  const MANUAL=[
    {id:'onboarding',fa:'ورودی اولیه و عرض صفحه',de:'Onboarding & Viewport',descFa:'ورودی هفت‌مرحله‌ای را کامل کنید؛ صفحه نباید بریده یا افقی جابه‌جا شود.',descDe:'Siebenstufiges Onboarding abschließen; kein Clipping oder horizontaler Versatz.'},
    {id:'bottomnav',fa:'نوار پایین پنج‌تایی',de:'Fünfteilige Bottom-Navigation',descFa:'خانه، برنامه من، یادگیری، پیشرفت و بیشتر را یکی‌یکی باز کنید.',descDe:'Start, Mein Plan, Lernen, Fortschritt und Mehr nacheinander öffnen.'},
    {id:'learnnav',fa:'منوی زمینه‌ای یادگیری',de:'Kontextnavigation Lernen',descFa:'نمای کلی، موضوع‌ها، واژگان، تمرین و جست‌وجو باید مقصد واقعی باز کنند.',descDe:'Übersicht, Themen, Wörter, Üben und Suche müssen echte Ziele öffnen.'},
    {id:'drawer',fa:'جست‌وجو، علاقه‌مندی و اخیر',de:'Suche, Favoriten & Zuletzt',descFa:'در «بیشتر» جست‌وجو کنید، یک مورد را ستاره‌دار کنید و Recent را کنترل کنید.',descDe:'In Mehr suchen, Favorit setzen und Zuletzt verwendet prüfen.'},
    {id:'categories',fa:'کتگوری‌ها و موضوع‌ها',de:'Kategorien & Themen',descFa:'چند کتگوری و موضوع را باز کنید؛ کارت بدون مقصد یا صفحه خالی نباشد.',descDe:'Mehrere Kategorien/Themen öffnen; keine leeren oder toten Ziele.'},
    {id:'browserback',fa:'بازگشت مرورگر',de:'Browser-Zurück',descFa:'بین چند صفحه حرکت کنید و Back را آزمایش کنید؛ مسیر نباید خراب شود.',descDe:'Zwischen Ansichten navigieren und Browser-Zurück prüfen.'},
    {id:'keyboard',fa:'کیبورد و فرم‌ها',de:'Tastatur & Formulare',descFa:'Search و textarea را باز کنید؛ منوی پایین نباید روی فیلد بیفتد.',descDe:'Suche/Textarea öffnen; Bottom-Navigation darf Eingaben nicht verdecken.'},
    {id:'rotation',fa:'حالت عمودی و افقی',de:'Hoch- & Querformat',descFa:'گوشی را بچرخانید؛ هیچ کارت یا منوی اصلی نباید از صفحه خارج شود.',descDe:'Gerät drehen; keine Hauptkarte oder Navigation darf überlaufen.'},
    {id:'pwaoffline',fa:'نصب PWA و آفلاین',de:'PWA & Offline',descFa:'برنامه را نصب و یک‌بار آفلاین باز کنید؛ فایل‌های اصلی باید اجرا شوند.',descDe:'App installieren und einmal offline öffnen; Kernfunktionen müssen laden.'},
    {id:'updatepreserve',fa:'حفظ داده پس از Update',de:'Daten nach Update erhalten',descFa:'پروفایل، برنامه، SRS و پیشرفت را قبل و بعد از Commit مقایسه کنید.',descDe:'Profil, Plan, SRS und Fortschritt vor/nach Update vergleichen.'},
    {id:'backuprestore',fa:'Backup و Restore',de:'Backup & Restore',descFa:'Backup بگیرید، یک مقدار را تغییر دهید و Restore را آزمایش کنید.',descDe:'Backup exportieren, Wert ändern und Restore testen.'},
    {id:'authlabels',fa:'برچسب اصالت محتوا',de:'Inhaltsstatus',descFa:'در هسته واژگان، Verified، Project-curated و Candidate باید جدا نمایش داده شوند.',descDe:'Verified, Project-curated und Candidate müssen getrennt sichtbar sein.'}
  ];
  const ROUTES=[
    ['my-plan',()=>view('today')],['calendar',()=>view('calendar')],['planner',()=>view('builder')],
    ['topics',()=>practice()&&!!window.DW_X136],['learning-path',()=>practice()],['four-skills',()=>practice()&&!!window.DW_X136],
    ['reading',()=>practice()&&!!window.DW_X136],['listening',()=>practice()],['speaking',()=>practice()],['writing',()=>practice()],
    ['vocabulary',()=>typeof window.x134OpenHub==='function'],['srs',()=>practice()],['grammar',()=>practice()],['stories',()=>practice()&&!!window.DW_X136],
    ['media',()=>practice()],['resources',()=>practice()],['methods',()=>practice()],['progress',()=>view('report')],
    ['categories',()=>!!window.DW_X136&&typeof window.DW_X136.openCategories==='function'],
    ['search',()=>typeof window.openGlobalSearch==='function'],['settings',()=>typeof window.openSettings==='function']
  ];
  function view(id){return !!document.getElementById('view-'+id)&&typeof window.go==='function'}
  function practice(){return view('practice')}
  function route(id){return ROUTES.find(x=>x[0]===id)}
  function routeOK(id){const r=route(id);try{return !!r&&!!r[1]()}catch(_){return false}}
  function rootState(){
    state.x137=state.x137||{};
    const x=state.x137;
    x.version=VERSION;
    x.strictContent=x.strictContent!==false;
    x.acceptance=x.acceptance||{};
    x.acceptance.manual=x.acceptance.manual||{};
    x.acceptance.history=Array.isArray(x.acceptance.history)?x.acceptance.history:[];
    x.preflight=x.preflight||{};
    return x;
  }
  function classifyWord(x){
    if(!x)return {code:'missing',fa:'ناموجود',de:'Fehlt'};
    if(x.sourceUrl&&x.license&&x.reviewedAt)return {code:'verified',fa:'تأییدشده مستقل',de:'Extern verifiziert'};
    if(x.quality==='enriched'&&String(x.fa||'').trim()&&CEFR.has(x.level))return {code:'curated',fa:'گردآوری‌شده پروژه',de:'Projekt-kuratiert'};
    return {code:'candidate',fa:'مدخل کاندید',de:'Kandidat'};
  }
  function personalOverride(id){
    const o=state.x13?.vocabCore?.overrides?.[id];
    return !!(o&&String(o.fa||'').trim()&&CEFR.has(o.level)&&String(o.example||'').trim());
  }
  function wordUsable(id){
    if(personalOverride(id))return true;
    const c=classifyWord(lexById.get(id));
    return c.code==='verified'||c.code==='curated'||!rootState().strictContent;
  }
  function contentStats(){
    let verified=0,curated=0,candidate=0;
    (CONTENT.lexicon||[]).forEach(x=>{const c=classifyWord(x).code;if(c==='verified')verified++;else if(c==='curated')curated++;else candidate++});
    let sentenceVerified=0,sentenceCurated=0,sentenceCandidate=0;
    (CONTENT.sentences||[]).forEach(x=>{if(x.sourceUrl&&x.license&&x.reviewedAt)sentenceVerified++;else if(x.reviewedAt&&x.reviewer)sentenceCurated++;else sentenceCandidate++});
    return {verified,curated,candidate,total:verified+curated+candidate,sentenceVerified,sentenceCurated,sentenceCandidate,sentenceTotal:sentenceVerified+sentenceCurated+sentenceCandidate};
  }
  function essentialFingerprint(s=state){
    const v=s.x13?.vocabCore||{};
    const payload={
      name:s.profile?.name||'',currentLevel:s.profile?.currentLevel||'',targetLevel:s.profile?.targetLevel||'',
      planCount:Array.isArray(s.plan)?s.plan.length:Object.keys(s.plan||{}).length,
      completed:Object.keys(s.completed||{}).length,savedWords:Array.isArray(v.saved)?v.saved.length:0,
      srs:Object.keys(v.srs||{}).length,studySessions:Array.isArray(s.studySessions)?s.studySessions.length:0
    };
    const str=JSON.stringify(payload);let h=2166136261;
    for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
    return {payload,hash:(h>>>0).toString(16).padStart(8,'0')};
  }
  function makePreflightBackup(){
    const x=rootState();
    if(x.preflight.backupAt)return;
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        localStorage.setItem(BACKUP_KEY,raw);
        x.preflight.backupAt=now();x.preflight.backupBytes=raw.length;x.preflight.fingerprint=essentialFingerprint();
      }else{x.preflight.backupAt=now();x.preflight.backupBytes=0;x.preflight.fingerprint=essentialFingerprint()}
    }catch(e){x.preflight.backupError=String(e?.message||e)}
    try{save()}catch(_){}
  }
  function openMirrorDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB)return reject(new Error('IndexedDB unavailable'));
      const req=indexedDB.open(MIRROR_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(MIRROR_STORE))db.createObjectStore(MIRROR_STORE,{keyPath:'id'})};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open failed'));
    })
  }
  async function mirrorState(){
    try{
      const db=await openMirrorDB(),tx=db.transaction(MIRROR_STORE,'readwrite');
      tx.objectStore(MIRROR_STORE).put({id:'latest',version:VERSION,at:now(),storageKey:STORAGE_KEY,state:JSON.parse(JSON.stringify(state))});
      await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});
      db.close();rootState().preflight.lastMirrorAt=now();
    }catch(e){rootState().preflight.mirrorError=String(e?.message||e)}
  }
  async function restoreMirror(){
    try{
      const db=await openMirrorDB(),tx=db.transaction(MIRROR_STORE,'readonly'),req=tx.objectStore(MIRROR_STORE).get('latest');
      const row=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});
      db.close();
      if(!row?.state)return notice(tr('نسخه بازیابی در IndexedDB پیدا نشد.','Keine Recovery-Kopie in IndexedDB gefunden.'));
      if(!confirm(tr('State ذخیره‌شده در IndexedDB جایگزین وضعیت فعلی شود؟','Gespeicherten IndexedDB-Stand wiederherstellen?')))return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(row.state));location.reload();
    }catch(e){notice(tr('بازیابی IndexedDB ناموفق بود: ','IndexedDB-Wiederherstellung fehlgeschlagen: ')+String(e?.message||e))}
  }
  let mirrorTimer=0;
  function wrapSave(){
    if(typeof window.save!=='function'||window.save.__x137)return;
    const original=window.save;
    const wrapped=function(...args){const out=original.apply(this,args);clearTimeout(mirrorTimer);mirrorTimer=setTimeout(mirrorState,350);return out};
    wrapped.__x137=true;window.save=wrapped;
  }
  function notice(msg){try{toast(msg)}catch(_){alert(msg)}}
  function automaticChecks(){
    const cs=contentStats(),docW=Math.max(document.documentElement.scrollWidth,document.body?.scrollWidth||0),vp=Math.round(window.innerWidth);
    const routes=ROUTES.map(([id])=>({id,pass:routeOK(id)}));
    const storageProbe=(()=>{
      try{const k='__dw_x137_probe__';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch(_){return false}
    })();
    return [
      {id:'storage-key',labelFa:'کلید ذخیره ثابت',labelDe:'Stabiler Storage-Key',pass:STORAGE_KEY==='deutschweg_x12_user_data',detail:STORAGE_KEY},
      {id:'state-json',labelFa:'State قابل ذخیره',labelDe:'State serialisierbar',pass:(()=>{try{JSON.stringify(state);return true}catch(_){return false}})(),detail:essentialFingerprint().hash},
      {id:'storage-probe',labelFa:'نوشتن LocalStorage',labelDe:'LocalStorage-Schreibtest',pass:storageProbe,detail:storageProbe?'read/write':'blocked'},
      {id:'viewport',labelFa:'عدم سرریز افقی فعلی',labelDe:'Kein horizontaler Overflow',pass:docW<=vp+2,detail:`${docW}/${vp}`},
      {id:'views',labelFa:'پنج View اصلی',labelDe:'Fünf Hauptansichten',pass:['home','today','practice','report','more'].every(view),detail:'home/today/practice/report/more'},
      {id:'bottom-nav',labelFa:'پنج مقصد نوار پایین',labelDe:'Fünf Bottom-Navigation-Ziele',pass:qa('#bottomNav .navbtn').length===5,detail:String(qa('#bottomNav .navbtn').length)},
      {id:'menu-routes',labelFa:'دسترسی منوهای ثبت‌شده',labelDe:'Registrierte Menüziele erreichbar',pass:routes.every(x=>x.pass),detail:`${routes.filter(x=>x.pass).length}/${routes.length}`},
      {id:'content-core',labelFa:'بارگذاری هسته محتوا',labelDe:'Content-Core geladen',pass:cs.total===6000&&cs.sentenceTotal===2579,detail:`${cs.total}/${cs.sentenceTotal}`},
      {id:'auth-separation',labelFa:'تفکیک اصالت محتوا',labelDe:'Inhaltsstatus getrennt',pass:cs.verified===0&&cs.curated===346&&cs.candidate===5654,detail:`V${cs.verified}/C${cs.curated}/K${cs.candidate}`},
      {id:'strict-mode',labelFa:'حالت سخت‌گیرانه',labelDe:'Strenger Inhaltsmodus',pass:rootState().strictContent===true,detail:String(rootState().strictContent)},
      {id:'preflight-backup',labelFa:'Backup پیش از فاز',labelDe:'Preflight-Backup',pass:!!rootState().preflight.backupAt,detail:rootState().preflight.backupAt||'missing'},
      {id:'service-worker-api',labelFa:'پشتیبانی Service Worker',labelDe:'Service-Worker-Unterstützung',pass:'serviceWorker' in navigator,detail:navigator.serviceWorker?.controller?'controlled':'supported'}
    ];
  }
  function releaseStatus(){
    const auto=automaticChecks(),manual=rootState().acceptance.manual;
    const autoFail=auto.some(x=>!x.pass),manualFail=MANUAL.some(x=>manual[x.id]?.status==='fail');
    if(autoFail||manualFail)return 'blocked';
    if(MANUAL.every(x=>manual[x.id]?.status==='pass'))return 'accepted';
    return 'pending';
  }
  function statusText(s=releaseStatus()){
    if(s==='accepted')return tr('پذیرش دستگاه تکمیل شده','Geräteabnahme abgeschlossen');
    if(s==='blocked')return tr('نیازمند اصلاح','Korrektur erforderlich');
    return tr('RC · تست دستگاه ناقص','RC · Geräte-QA offen');
  }
  function deviceInfo(){
    return {userAgent:navigator.userAgent,language:navigator.language,viewport:`${innerWidth}x${innerHeight}`,screen:`${screen.width}x${screen.height}`,dpr:devicePixelRatio,standalone:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,online:navigator.onLine,at:now()};
  }
  function manualRecord(id){return rootState().acceptance.manual[id]||{status:'pending',note:'',at:null,device:null}}
  function setManual(id,status){
    const confirmBox=q(`[data-x137-confirm="${id}"]`);
    if(status!=='pending'&&!confirmBox?.checked)return notice(tr('ابتدا تأیید کنید که این مورد را روی دستگاه واقعی آزمایش کرده‌اید.','Bestätige zuerst den Test auf einem realen Gerät.'));
    const rec=manualRecord(id);rec.status=status;rec.at=now();rec.device=deviceInfo();rootState().acceptance.manual[id]=rec;
    rootState().acceptance.history.unshift({id,status,at:rec.at,device:rec.device});rootState().acceptance.history=rootState().acceptance.history.slice(0,100);
    save();renderCenter();updateBadge();
  }
  function setNote(id,value){const rec=manualRecord(id);rec.note=String(value||'').slice(0,1000);rootState().acceptance.manual[id]=rec;save()}
  function toggleStrict(v){
    rootState().strictContent=!!v;save();renderCenter();
    notice(v?tr('Candidateها برای افزودن جدید به SRS و Planner مسدود شدند.','Kandidaten sind für neue SRS-/Planer-Einträge gesperrt.'):tr('حالت آزمایشی فعال شد؛ وضعیت Candidate همچنان نمایش داده می‌شود.','Experimenteller Modus aktiv; Kandidaten bleiben gekennzeichnet.'));
  }
  function autoRows(){
    return automaticChecks().map(x=>`<div class="x137-row"><div><b>${tr(x.labelFa,x.labelDe)}</b><small>${safe(x.detail)}</small></div><span class="x137-pill ${x.pass?'pass':'fail'}">${x.pass?'PASS':'FAIL'}</span></div>`).join('');
  }
  function routeRows(){
    return ROUTES.map(([id])=>`<div class="x137-row"><div><b>${safe(id)}</b><small>${routeOK(id)?tr('مقصد واقعی ثبت و قابل دسترسی است.','Echtes Ziel registriert und erreichbar.'):tr('مسیر در Runtime موجود نیست و از منو غیرفعال می‌شود.','Runtime-Ziel fehlt und wird deaktiviert.')}</small></div><span class="x137-pill ${routeOK(id)?'pass':'fail'}">${routeOK(id)?'REACHABLE':'BLOCKED'}</span></div>`).join('');
  }
  function manualRows(){
    return MANUAL.map(x=>{const r=manualRecord(x.id);return `<div class="x137-manual"><div class="x137-manual-head"><div><h4>${tr(x.fa,x.de)}</h4><p>${tr(x.descFa,x.descDe)}</p></div><div class="x137-status-buttons"><button data-status="pending" class="${r.status==='pending'?'active':''}" onclick="DW_X137.setManual('${x.id}','pending')" title="Pending">·</button><button data-status="pass" class="${r.status==='pass'?'active':''}" onclick="DW_X137.setManual('${x.id}','pass')" title="Pass">✓</button><button data-status="fail" class="${r.status==='fail'?'active':''}" onclick="DW_X137.setManual('${x.id}','fail')" title="Fail">×</button></div></div><label style="display:flex;gap:7px;align-items:flex-start;margin-top:8px;font-size:11px;color:var(--muted)"><input type="checkbox" data-x137-confirm="${x.id}" style="width:auto;margin-top:2px"> ${tr('این مورد را روی دستگاه واقعی آزمایش کردم.','Auf einem realen Gerät getestet.')}</label><textarea class="x137-note" oninput="DW_X137.note('${x.id}',this.value)" placeholder="${tr('مدل گوشی، مرورگر یا ایراد مشاهده‌شده…','Gerät, Browser oder Beobachtung…')}">${safe(r.note||'')}</textarea></div>`}).join('');
  }
  function renderCenter(){
    const e=overlay(),cs=contentStats(),s=releaseStatus(),auto=automaticChecks(),autoPass=auto.filter(x=>x.pass).length,manualPass=MANUAL.filter(x=>manualRecord(x.id).status==='pass').length;
    e.classList.add('show');document.body.classList.add('x137-center-open');
    e.innerHTML=`<div class="x137-shell"><header class="x137-head"><div><span class="x137-kicker">X13.7 RC1 · WEB FINALIZATION</span><h2>${tr('مرکز نهایی‌سازی و پذیرش دستگاه','Finalisierung & Geräteabnahme')}</h2><p>${statusText(s)} · ${tr('Final فقط پس از PASS دستی تمام تست‌های الزامی فعال می‌شود.','Final wird erst nach manueller Abnahme aller Pflichtprüfungen aktiviert.')}</p></div><button class="x137-close" onclick="DW_X137.close()">×</button></header>
    <div class="x137-summary"><div class="x137-stat"><b>${autoPass}/${auto.length}</b><span>${tr('کنترل خودکار','Automatische Checks')}</span></div><div class="x137-stat"><b>${manualPass}/${MANUAL.length}</b><span>${tr('تست واقعی دستگاه','Reale Gerätetests')}</span></div><div class="x137-stat"><b>${cs.curated}</b><span>${tr('واژه Project-curated','Projekt-kuratierte Wörter')}</span></div><div class="x137-stat"><b>${cs.candidate}</b><span>${tr('Candidate جداشده','Getrennte Kandidaten')}</span></div></div>
    <div class="x137-auth-panel"><h3>${tr('تفکیک واقعی محتوای فعلی','Tatsächliche Trennung des aktuellen Inhalts')}</h3><div class="x137-auth-grid"><div><b>${cs.verified}</b><small>${tr('Verified مستقل','Extern verifiziert')}</small></div><div><b>${cs.curated}</b><small>${tr('Project-curated بدون تأیید مستقل','Projekt-kuratiert, nicht extern geprüft')}</small></div><div><b>${cs.candidate}</b><small>${tr('Candidate lexical index','Kandidatenindex')}</small></div><div><b>${cs.sentenceVerified}</b><small>${tr('جمله Verified','Verifizierte Sätze')}</small></div><div><b>${cs.sentenceCandidate}</b><small>${tr('جمله Candidate/Draft','Satz-Kandidaten/Entwürfe')}</small></div><div><b>${rootState().strictContent?tr('روشن','AN'):tr('خاموش','AUS')}</b><small>${tr('Strict Content Mode','Strenger Inhaltsmodus')}</small></div></div><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" style="width:auto" ${rootState().strictContent?'checked':''} onchange="DW_X137.strict(this.checked)"> ${tr('Candidateهای جدید وارد SRS و Planner نشوند.','Neue Kandidaten nicht zu SRS/Planer hinzufügen.')}</label></div>
    <div class="x137-grid"><main><section class="x137-card"><h3>${tr('کنترل‌های خودکار Runtime','Automatische Runtime-Prüfungen')}</h3>${autoRows()}</section><section class="x137-card"><h3>${tr('آزمون‌های واقعی دستگاه','Reale Gerätetests')}</h3>${manualRows()}</section></main><aside><section class="x137-card"><h3>${tr('ممیزی دسترسی منوها','Menü-Erreichbarkeitsprüfung')}</h3>${routeRows()}</section><section class="x137-card"><h3>${tr('حفاظت داده','Datenschutz & Erhalt')}</h3><p>${tr('کلید ذخیره و Schema تغییر نکرده‌اند. یک Snapshot پیش از این فاز و Mirror در IndexedDB نگهداری می‌شود. حذف Site Data همچنان داده محلی را از بین می‌برد.','Storage-Key und Schema bleiben unverändert. Ein Preflight-Snapshot und eine IndexedDB-Spiegelung werden geführt. Site-Daten löschen entfernt weiterhin lokale Daten.')}</p><div class="x137-row"><div><b>${safe(STORAGE_KEY)}</b><small>${safe(rootState().preflight.backupAt||'backup pending')}</small></div><span class="x137-pill pass">STABLE</span></div><div class="x137-actions"><button onclick="DW_X137.mirror()">${tr('Mirror اکنون','Jetzt spiegeln')}</button><button onclick="DW_X137.restore()">${tr('بازیابی Mirror','Mirror wiederherstellen')}</button><button class="primary" onclick="DW_X137.export()">${tr('خروجی گزارش پذیرش','Abnahmebericht exportieren')}</button></div></section></aside></div></div>`;
  }
  function overlay(){
    let e=document.getElementById('x137Overlay');
    if(!e){e=document.createElement('div');e.id='x137Overlay';e.className='x137-overlay';document.body.appendChild(e)}
    return e
  }
  function close(){overlay().classList.remove('show');document.body.classList.remove('x137-center-open')}
  function exportReport(){
    const report={version:VERSION,status:releaseStatus(),generatedAt:now(),device:deviceInfo(),storageKey:STORAGE_KEY,dataSchemaVersion:typeof DATA_SCHEMA_VERSION!=='undefined'?DATA_SCHEMA_VERSION:null,fingerprint:essentialFingerprint(),content:contentStats(),automatic:automaticChecks(),manual:rootState().acceptance.manual,routeAudit:ROUTES.map(([id])=>({id,reachable:routeOK(id)})),physicalDeviceClaim:'Only manual PASS records are treated as physical-device evidence.'};
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));a.href=url;a.download='DeutschWeg_X13_7_Device_Acceptance_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  function updateBadge(){
    let b=document.getElementById('x137StatusBadge');
    if(!b){b=document.createElement('button');b.id='x137StatusBadge';b.className='x137-status-badge';b.onclick=renderCenter;const target=q('.top-actions')||q('.toprow')||q('.topbar');target?.appendChild(b)}
    if(b){const s=releaseStatus();b.dataset.status=s;b.textContent=statusText(s);b.title=statusText(s)}
    document.documentElement.dataset.releaseAcceptance=releaseStatus();
  }
  function addFinalTile(){
    const root=q('[data-dw1362-more]')||q('#view-more');if(!root||q('.x137-final-tile',root))return;
    const grid=q('.dw1362-app-grid',root)||q('.final-system-grid',root)||root;
    grid.insertAdjacentHTML('afterbegin',`<button class="x137-final-tile" onclick="DW_X137.open()"><span>${safe(VERSION)}</span><b>${tr('نهایی‌سازی و پذیرش دستگاه','Finalisierung & Geräteabnahme')}</b><small>${statusText()}</small></button>`)
  }
  function guardMenus(){
    if(window.DW_X1362&&typeof window.DW_X1362.open==='function'&&!window.DW_X1362.open.__x137){
      const base=window.DW_X1362.open;
      const guarded=function(id){if(!routeOK(id))return notice(tr('این مسیر در نسخه فعلی Runtime واقعی ندارد و غیرفعال شده است.','Dieses Ziel hat aktuell kein echtes Runtime-Modul und wurde deaktiviert.'));return base(id)};
      guarded.__x137=true;window.DW_X1362.open=guarded
    }
    ROUTES.forEach(([id])=>{qa(`[onclick*="DW_X1362.open('${id}')"]`).forEach(el=>{el.classList.toggle('x137-unreachable',!routeOK(id));el.setAttribute('aria-disabled',routeOK(id)?'false':'true')})})
  }
  function enhanceVocabHub(){
    const shell=q('.x134-shell');if(!shell||q('.x137-auth-panel',shell))return;const cs=contentStats();
    const panel=document.createElement('div');panel.className='x137-auth-panel';panel.innerHTML=`<h3>${tr('وضعیت اصالت هسته واژگان','Authentizitätsstatus des Wortschatzkerns')}</h3><div class="x137-auth-grid"><div><b>${cs.verified}</b><small>Verified</small></div><div><b>${cs.curated}</b><small>Project-curated</small></div><div><b>${cs.candidate}</b><small>Candidate</small></div></div><p class="muted" style="margin:9px 0 0">${tr('Project-curated به معنی تأیید مستقل نیست. Candidateها در حالت سخت‌گیرانه برای افزودن جدید به SRS و Planner مسدودند.','Projekt-kuratiert bedeutet nicht extern verifiziert. Kandidaten sind im strengen Modus für neue SRS-/Planer-Einträge gesperrt.')}</p>`;
    q('header',shell)?.insertAdjacentElement('afterend',panel);
    qa('.x134-row',shell).forEach(row=>{
      const hit=String(row.getAttribute('onclick')||'').match(/x134OpenWord\('([^']+)'\)/);if(!hit)return;
      const c=personalOverride(hit[1])?{code:'personal',fa:'شخصی',de:'Persönlich'}:classifyWord(lexById.get(hit[1]));
      const meta=row.querySelector('small');if(meta&&!row.querySelector('.x137-word-status'))meta.insertAdjacentHTML('beforeend',`<em class="x137-word-status ${safe(c.code)}">${tr(c.fa,c.de)}</em>`)
    })
  }
  function enhanceWord(id){
    const shell=q('.x134-shell');if(!shell)return;const x=lexById.get(id),c=personalOverride(id)?{code:'personal',fa:'تکمیل شخصی کاربر',de:'Persönlich ergänzt'}:classifyWord(x);
    const target=q('.x134-detail-grid section',shell)||shell;if(q('.x137-provenance',target))return;
    target.insertAdjacentHTML('afterbegin',`<div class="x137-provenance"><b>${tr('منشأ و وضعیت محتوا','Herkunft & Inhaltsstatus')}: ${tr(c.fa,c.de)}</b><dl><dt>Source</dt><dd>${safe(x?.source||'UNSPECIFIED')}</dd><dt>License</dt><dd>${safe(x?.license||tr('ثبت نشده','Nicht angegeben'))}</dd><dt>Review</dt><dd>${safe(x?.reviewedAt||tr('بازبینی مستقل ثبت نشده','Keine externe Prüfung dokumentiert'))}</dd><dt>${tr('استفاده در SRS','SRS-Nutzung')}</dt><dd>${wordUsable(id)?tr('مجاز در وضعیت فعلی','Im aktuellen Modus erlaubt'):tr('در Strict Mode مسدود','Im strengen Modus gesperrt')}</dd></dl></div>`)
  }
  function patchVocabulary(){
    const block=(id,fn)=>{if(!wordUsable(id))return notice(tr('این مدخل Candidate است و تا تکمیل معنی، سطح و منشأ معتبر وارد SRS یا Planner نمی‌شود.','Dieser Eintrag ist ein Kandidat und wird bis zur Vervollständigung nicht zu SRS/Planer hinzugefügt.'));return fn()};
    if(typeof window.x134OpenHub==='function'&&!window.x134OpenHub.__x137){const old=window.x134OpenHub;window.x134OpenHub=function(){const r=old();setTimeout(enhanceVocabHub,0);return r};window.x134OpenHub.__x137=true}
    if(typeof window.x134OpenWord==='function'&&!window.x134OpenWord.__x137){const old=window.x134OpenWord;window.x134OpenWord=function(id){const r=old(id);setTimeout(()=>enhanceWord(id),0);return r};window.x134OpenWord.__x137=true}
    [['x134ToggleSave'],['x134AddWordPlan'],['x134StartMission']].forEach(([name])=>{if(typeof window[name]!=='function'||window[name].__x137)return;const old=window[name];window[name]=function(id,...rest){return block(id,()=>old(id,...rest))};window[name].__x137=true})
  }
  function wrapRenders(){
    if(typeof window.renderMore==='function'&&!window.renderMore.__x137){const old=window.renderMore;window.renderMore=function(){const r=old();addFinalTile();guardMenus();return r};window.renderMore.__x137=true}
    if(typeof window.renderAll==='function'&&!window.renderAll.__x137){const old=window.renderAll;window.renderAll=function(){const r=old();setTimeout(()=>{addFinalTile();guardMenus();updateBadge()},0);return r};window.renderAll.__x137=true}
  }
  window.DW_X137={open:renderCenter,close,setManual,note:setNote,strict:toggleStrict,export:exportReport,mirror:async()=>{await mirrorState();save();renderCenter()},restore:restoreMirror,contentStats,automaticChecks,releaseStatus};
  rootState();makePreflightBackup();wrapSave();wrapRenders();patchVocabulary();addFinalTile();guardMenus();updateBadge();mirrorState();
  window.addEventListener('resize',()=>{updateBadge();guardMenus()});
  window.addEventListener('beforeunload',()=>{try{mirrorState()}catch(_){}});
})();
