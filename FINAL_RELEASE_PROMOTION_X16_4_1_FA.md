# ارتقای کنترل‌شده به DeutschWeg X16.4.1 Final Stable

این بسته عمداً در وضعیت `16.4.0 final-candidate` باقی می‌ماند. ارتقا فقط زمانی انجام می‌شود که شواهد واقعی تکمیل شده باشند.

## ۱. ثبت شواهد

فایل زیر را کپی کنید:

```text
ACCEPTANCE_EVIDENCE_X16_4_1.template.json
```

نام نسخه تکمیل‌شده باید باشد:

```text
ACCEPTANCE_EVIDENCE_X16_4_1.json
```

همه کنترل‌های Android، iPhone، PWA، آزمون دو زبان‌آموز و بازبینی A1 تا C2 باید با مشخصات دستگاه، تاریخ و تأییدکننده ثبت شوند.

## ۲. اجرای ارتقا

```bash
node scripts/promote-final-stable.mjs
```

اسکریپت در صورت نبود هر مدرک الزامی متوقف می‌شود. در صورت عبور:

- نسخه به `16.4.1` تغییر می‌کند.
- کانال به `stable` تغییر می‌کند.
- Cache سرویس‌ورکر به `deutschweg-x16-4-1-final-stable` تغییر می‌کند.
- عنوان‌های قابل مشاهده به Final Stable تغییر می‌کنند.
- Release Notes نهایی ساخته می‌شود.
- `SHA256SUMS.txt` بازسازی می‌شود.
- کنترل انتشار دوباره اجرا می‌شود.

## ۳. Commit نهایی

```bash
git add --all
git commit -m "release: promote DeutschWeg X16.4.1 final stable"
git push origin main
git tag -a v16.4.1 -m "DeutschWeg X16.4.1 Final Stable"
git push origin v16.4.1
```

Tag فقط پس از بررسی مجدد Origin منتشرشده ساخته شود.
