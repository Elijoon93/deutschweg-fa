function lang() { return document.documentElement.lang === 'de' ? 'de' : 'fa'; }
function tr(fa, de) { return lang() === 'de' ? de : fa; }

export function createResourceCenter({ integrations }) {
  let modal = document.getElementById('dwxResourceModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dwxResourceModal';
    modal.className = 'dwx1-modal';
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
    document.body.appendChild(modal);
  }

  async function open() {
    modal.innerHTML = `<div class="dwx1-sheet"><span class="kicker">Integration Hub</span><h2>${tr('در حال بررسی منابع…','Quellen werden geprüft…')}</h2></div>`;
    modal.classList.add('show');
    const summary = await integrations.resourceHealthSummary();
    const rows = summary.items.map(x => {
      const h = x.health;
      const ok = h?.ok === true || h?.primary?.ok === true;
      const bad = h && (h?.ok === false || h?.primary?.ok === false);
      const cls = ok ? 'ok' : bad ? 'bad' : 'warn';
      const label = ok ? tr('فعال','Online') : bad ? tr('نیازمند بررسی','Prüfen') : tr('وضعیت نامشخص','Unbekannt');
      return `<div class="dwx1-resource-row"><div><b><span class="dwx1-dot ${cls}"></span> ${x.name}</b><div class="tiny muted">${x.category} · ${label}</div></div><button class="ghost" data-open="${x.id}">${tr('بازکردن ↗','Öffnen ↗')}</button></div>`;
    }).join('');
    modal.innerHTML = `<div class="dwx1-sheet">
      <button class="iconbtn close" onclick="document.getElementById('dwxResourceModal').classList.remove('show')">×</button>
      <span class="kicker">Resource Reliability · Integration Hub</span>
      <h2>${tr('مرکز منابع و سلامت لینک‌ها','Quellen & Link-Status')}</h2>
      <p class="small muted">${tr('لینک‌های اصلی و مسیرهای جایگزین از یک لایه مرکزی مدیریت می‌شوند. گزارش سلامت روزانه توسط GitHub Actions به‌روزرسانی می‌شود.','Primär- und Fallback-Links werden zentral verwaltet. Der tägliche Status wird per GitHub Actions aktualisiert.')}</p>
      ${rows || `<div class="empty">${tr('منبعی ثبت نشده است.','Keine Quelle gefunden.')}</div>`}
      <div class="tiny muted">${tr('آخرین گزارش:','Letzter Bericht:')} ${summary.generatedAt || tr('هنوز اجرا نشده','noch nicht ausgeführt')}</div>
    </div>`;
    modal.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => integrations.openResource(btn.dataset.open)));
  }

  window.openResourceReliabilityCenter = open;
  return { open };
}
