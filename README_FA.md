# DeutschWeg X16.4.0 — Professional Experience Hardening Final Candidate

نسخه تجمعی A1 تا C2 با Coach Flow چهارقسمتی، جلسه ده‌مرحله‌ای، شنیداری و گفتار هدایت‌شده، مربی تطبیقی، داده محلی و مرکز پذیرش دستگاه/PWA.

## تغییرات محوری X16.4
- بازطراحی حرفه‌ای سلسله‌مراتب بصری در موبایل و دسکتاپ
- صفحه «امروز» کم‌تراکم با یک اقدام اصلی
- چهار مقصد ثابت: امروز، مسیر، تمرین، من
- جلسه آموزشی تمام‌صفحه با یک Scroll Context
- قفل Scroll صفحه زیرین و بازیابی موقعیت پس از بستن جلسه
- Touch Target، Focus Visible، Reduced Motion و High Contrast
- اصلاح یک خطای واقعی First-run: Onboarding قدیمی هفت‌مرحله‌ای حذف و مسیر سه‌مرحله‌ای Coach Flow به‌عنوان مسیر اصلی فعال شد
- جلوگیری از اجرای خودکار تور قدیمی؛ راهنما فقط با درخواست کاربر باز می‌شود

## نتیجه کنترل‌شده
- Static QA: 55 PASS، 0 FAIL، 1 NOT RUN
- Runtime موبایل و دسکتاپ: بدون Page/Console Error و بدون Horizontal Overflow
- شمارش محتوای حرفه‌ای: 181 ماژول، 724 جلسه و 1810 تکلیف
- Service Worker: Syntax/Precache/Version PASS؛ اجرای Runtime آن برای X16.4 باید پس از انتشار HTTPS تکرار شود

## وضعیت رسمی
`Final Candidate` — نه `Final Stable`.

انتشار HTTPS، آزمون واقعی Android و iPhone، TTS، میکروفون، ضبط/بازپخش، Speech Recognition، نصب و Offline PWA، Backup/Restore روی Origin منتشرشده، آزمون دو کاربر مبتدی و بازبینی انسانی A1 تا C2 هنوز الزامی است.

## فایل شروع
`index.html`

## داده‌های حفظ‌شده
- localStorage: `deutschweg_x14_6_integrated_state`
- IndexedDB: `deutschweg-x14-6`
- Sponsor Gate: `deutschweg_sponsor_gate_24s_v2`
