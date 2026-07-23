# HANDOFF — DeutschWeg X16.4.0

## آخرین نسخه
`DeutschWeg X16.4.0 — Professional Experience Hardening Final Candidate`

این نسخه از X16.3.1 ساخته شده و مفروضات، مسیر A1 تا C2، داده‌های قبلی، Sponsor Gate، Coach Flow، Beginner Guided Mode، جلسه ده‌مرحله‌ای و Adaptive Coach را حفظ می‌کند.

## تغییرات محوری
- نظام بصری و فاصله‌گذاری حرفه‌ای‌تر
- هدر و ناوبری موبایل واضح‌تر
- صفحه «امروز» کم‌تراکم‌تر و توضیحات ثانویه جمع‌شونده
- جلسه تمام‌صفحه با یک اسکرول و بدون نشت محتوای زیرین
- Scroll Lock و بازگشت دقیق به موقعیت قبلی
- Touch/Focus/Reduced Motion/High Contrast
- حفظ مرکز پذیرش دستگاه و PWA

## خطای واقعی پیدا و رفع‌شده
First-run هنوز تابع Onboarding قدیمی هفت‌مرحله‌ای را اجرا می‌کرد. در X16.4 مسیر سه‌مرحله‌ای Coach Flow در Boot و عملیات تنظیم برنامه جایگزین شد. تور پنج‌مرحله‌ای قدیمی نیز دیگر به‌صورت خودکار اجرا نمی‌شود و فقط از راهنمای دستی در دسترس است.

## QA کنترل‌شده
- 55 PASS
- 0 FAIL
- 1 NOT RUN: اجرای Runtime سرویس‌ورکر X16.4 روی Origin واقعی
- Runtime موبایل و دسکتاپ بدون خطای Console/Page و بدون Overflow
- 404 parity، JavaScript syntax، JSON، Manifest assets، Precache و ZIP integrity کنترل می‌شوند

## محدودیت و تصمیم انتشار
این بسته Final Candidate است. Final Stable فقط پس از عبور تمام گیت‌های بیرونی مجاز است:
1. انتشار دقیق ریشه روی HTTPS
2. TTS آلمانی روی Android و iPhone
3. میکروفون، ضبط و بازپخش واقعی
4. Speech Recognition آلمانی
5. نصب و Standalone PWA
6. Offline Reload بعد از اولین بازدید
7. Backup/Restore روی Origin منتشرشده
8. دو آزمون بدون راهنمای بیرونی A1/A2
9. بازبینی انسانی نمونه‌های A1 تا C2
10. صفر خطای باز Critical/High
