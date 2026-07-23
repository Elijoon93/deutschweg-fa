# DeutschWeg X16.5.1 — Final Acceptance & Stabilization Candidate

ریشه آماده GitHub Pages است. مرکز پذیرش در `final-acceptance.html` قرار دارد.

```bash
node scripts/verify-release.mjs
```

پس از خروجی گزارش پذیرش واقعی:
```bash
node scripts/promote-final-stable.mjs DeutschWeg_X16_5_1_Acceptance_YYYY-MM-DD.json
```

Commit پیشنهادی:
```bash
git add .
git commit -m "chore(release): add X16.5.1 final acceptance center and stabilization gates"
git push origin main
```
