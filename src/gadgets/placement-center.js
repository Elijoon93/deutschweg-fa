import { idbPutValue } from '../core/idb.js';

const LEVELS = ['UNKNOWN','A1','A2','B1','B2','C1','C2'];

function lang() { return document.documentElement.lang === 'de' ? 'de' : 'fa'; }
function tr(fa, de) { return lang() === 'de' ? de : fa; }

function injectStyles() {
  if (document.getElementById('dwx1Styles')) return;
  const style = document.createElement('style');
  style.id = 'dwx1Styles';
  style.textContent = `
  .dwx1-card{border:1px solid color-mix(in srgb,var(--brand) 35%,var(--line));background:linear-gradient(145deg,color-mix(in srgb,var(--brand) 9%,var(--surface)),var(--surface));border-radius:20px;padding:14px;margin:10px 0;box-shadow:var(--shadow)}
  .dwx1-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.dwx1-tile{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:12px;text-align:right}.dwx1-tile b{display:block;margin:4px 0}.dwx1-tile span{font-size:10px;color:var(--muted)}
  .dwx1-modal{position:fixed;inset:0;z-index:190;background:rgba(0,0,0,.5);display:none;align-items:flex-end;justify-content:center;padding:10px}.dwx1-modal.show{display:flex}.dwx1-sheet{width:min(100%,760px);max-height:92vh;overflow:auto;background:var(--surface);border-radius:25px 25px 18px 18px;padding:17px;box-shadow:0 25px 80px rgba(0,0,0,.35)}
  .dwx1-resource-row{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;border:1px solid var(--line);border-radius:15px;padding:11px;margin:8px 0}.dwx1-dot{width:9px;height:9px;border-radius:50%;display:inline-block;background:#8a999b}.dwx1-dot.ok{background:#238a61}.dwx1-dot.bad{background:#c54a54}.dwx1-dot.warn{background:#e6a62b}
  .dwx1-levels{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}.dwx1-levels button{border:1px solid var(--line);background:var(--surface2);border-radius:13px;padding:10px}.dwx1-levels button.on{background:var(--brand);color:white;border-color:var(--brand)}
  @media(max-width:520px){.dwx1-grid{grid-template-columns:1fr}.dwx1-levels{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(style);
}

function ensureModal(id) {
  let el = document.getElementById(id);
  if (el) return el;
  el = document.createElement('div');
  el.id = id;
  el.className = 'dwx1-modal';
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
  document.body.appendChild(el);
  return el;
}

export function createPlacementCenter({ integrations, events }) {
  injectStyles();
  const modal = ensureModal('dwxPlacementModal');
  let selected = 'UNKNOWN';

  function render() {
    const profile = window.DeutschWegLegacyBridge?.getProfile?.() || {};
    selected = profile.currentLevel || 'UNKNOWN';
    modal.innerHTML = `<div class="dwx1-sheet">
      <button class="iconbtn close" onclick="document.getElementById('dwxPlacementModal').classList.remove('show')">×</button>
      <span class="kicker">Placement Center · Einstufung</span>
      <h2>${tr('مرکز تعیین سطح و شروع مسیر','Einstufungszentrum')}</h2>
      <p class="muted small">${tr('آزمون گوته یک ارزیابی اولیه است. نتیجه را پس از آزمون در پروفایل ثبت کنید تا برنامه شخصی شما به‌روز شود.','Der Goethe-Test bietet eine erste Orientierung. Speichere danach dein Ergebnis im Profil, damit dein Lernweg aktualisiert wird.')}</p>
      <div class="dwx1-card">
        <h3>${tr('۱. آزمون سریع رسمی گوته','1. Offizieller Goethe-Schnelltest')}</h3>
        <p class="small muted">${tr('ارزیابی تقریبی درک شنیداری/نوشتاری، گرامر و واژگان؛ مدرک رسمی نیست.','Orientierung für rezeptive Kenntnisse, Grammatik und Wortschatz; kein offizielles Zertifikat.')}</p>
        <div class="actions">
          <button class="primary" id="dwxGoetheStart">${tr('شروع آزمون گوته ↗','Goethe-Test starten ↗')}</button>
          <button class="ghost" id="dwxGoetheExam">${tr('تمرین آزمون‌های A1–C2 ↗','Prüfungstraining A1–C2 ↗')}</button>
        </div>
      </div>
      <div class="dwx1-card">
        <h3>${tr('۲. ثبت نتیجه تقریبی','2. Ergebnis speichern')}</h3>
        <div class="dwx1-levels">${LEVELS.map(l=>`<button data-level="${l}" class="${selected===l?'on':''}">${l==='UNKNOWN'?tr('نامشخص','Unbekannt'):l}</button>`).join('')}</div>
        <button class="primary" style="width:100%" id="dwxSavePlacement">${tr('ثبت سطح و به‌روزرسانی مسیر','Niveau speichern & Lernweg aktualisieren')}</button>
      </div>
      <div class="notice">${tr('اطلاعات فعلی شما پاک نمی‌شود. این تغییر روی همان پروفایل موجود ذخیره و هم‌زمان در لایه پشتیبان IndexedDB منعکس می‌شود.','Deine bestehenden Daten bleiben erhalten. Das Ergebnis wird im bestehenden Profil gespeichert und zusätzlich in IndexedDB gespiegelt.')}</div>
    </div>`;
    modal.querySelectorAll('[data-level]').forEach(btn => btn.addEventListener('click', () => {
      selected = btn.dataset.level;
      modal.querySelectorAll('[data-level]').forEach(x => x.classList.toggle('on', x.dataset.level === selected));
    }));
    modal.querySelector('#dwxGoetheStart')?.addEventListener('click', () => integrations.openResource('goethe-test'));
    modal.querySelector('#dwxGoetheExam')?.addEventListener('click', () => integrations.openResource('goethe-exam'));
    modal.querySelector('#dwxSavePlacement')?.addEventListener('click', async () => {
      const at = new Date().toISOString();
      const payload = { id:`placement-${Date.now()}`, level:selected, source:'goethe-or-manual', at };
      try { await idbPutValue('placement_results', payload); } catch {}
      const ok = window.DeutschWegLegacyBridge?.applyPlacementResult?.(payload);
      if (ok) {
        events.emit('placement:updated', payload);
        modal.classList.remove('show');
      }
    });
  }

  function open() { render(); modal.classList.add('show'); }
  window.openPlacementCenter = open;
  return { open };
}
