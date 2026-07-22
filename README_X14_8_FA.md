# DeutschWeg X14.8 — Production Release Candidate

این نسخه ادامه مستقیم X14.7 است و مدل داده، SRS، Mastery، برنامه‌ها، عضویت اجباری ۲۴ ثانیه‌ای و Backup نسخه‌های قبلی را حفظ می‌کند.

## قابلیت‌های افزوده‌شده

### Scenario Coach
- ۶ سناریوی چندمرحله‌ای از A1 تا B1
- ۲۴ نوبت مکالمه هدف‌محور
- مأموریت ارتباطی مشخص برای هر نوبت
- Hint، ترجمه اختیاری، تکرار صوت و پاسخ گفتاری
- بازخورد پایان مکالمه بدون قطع‌کردن جریان پاسخ
- ذخیره نتیجه در Guided History و Mastery گفتاری

### Pronunciation Lab
- ۸ عبارت سطح‌بندی‌شده A2 تا C1
- پخش طبیعی و آهسته با موتور گفتار مرورگر
- Speech Recognition و مقایسه واژه‌ای
- ضبط صوت و Playback
- Evidence Portfolio شامل متن تشخیص‌شده، امتیاز و تاریخ
- بدون ادعای ارزیابی واج‌به‌واج یا لهجه

### Immersion Studio
- ۴ صحنه شنیداری: ایستگاه، اداره، محیط کار و داروخانه
- ۱۲ قطعه Transcript با ترجمه فارسی
- پخش عادی و آهسته
- کلیدواژه‌های هدف
- ثبت فعالیت شنیداری و اثر در Mastery

### CEFR Checkpoints
- Checkpoint مستقل برای هر مرحله A1.1 تا C1
- سؤال‌های گرامر و واژگان همان مرحله
- حد عبور آموزشی ۷۰٪
- ثبت نتیجه و امکان بازکردن مرحله بعد
- نتیجه داخلی است و مدرک رسمی CEFR محسوب نمی‌شود

### Content Quality
- ۳۰ بسته پایه در Course Map
- ۱۲ بسته پرتکرار به وضعیت `editorial-reviewed / teaching-ready` ارتقا یافته‌اند
- ترجمه Reading و نکته کاربردی برای این بسته‌ها افزوده شده است
- باقی بسته‌ها همچنان Draft هستند و در UI به‌عنوان محتوای تأییدشده نمایش داده نمی‌شوند

### Production Center
- Release Gate Dashboard
- آمار رویدادهای محلی
- اتصال اختیاری GA4، Plausible یا Custom Endpoint
- نصب PWA و Diagnostics
- خروجی JSON رویدادهای Analytics

### PWA Hardening
- Cache نسخه‌بندی‌شده
- App Shell و صفحه Offline
- Stale-while-revalidate برای فایل‌های داخلی
- Navigation fallback
- اعلان نسخه جدید
- آیکون‌های Any و Maskable
- App Shortcuts برای Practice، Speaking و SRS

### Accessibility
- Skip Link
- Focus restoration پس از بستن Dialog
- Focus trap برای Overlayها
- Escape برای خروج
- نام قابل‌خواندن برای دکمه‌ها
- RTL و `lang=fa`
- Reduced Motion از نسخه پایه حفظ شده است

## Analytics چندکاربره

نسخه به‌صورت پیش‌فرض فقط آمار ناشناس همین دستگاه را نگه می‌دارد. برای فهمیدن تعداد کاربران لینک، یکی از موارد زیر را در `app-config.js` تنظیم کنید:

```js
window.DEUTSCHWEG_CONFIG = {
  analytics: {
    ga4MeasurementId: 'G-XXXXXXXXXX',
    plausibleDomain: '',
    endpoint: ''
  }
};
```

یا برای Plausible:

```js
analytics: {
  ga4MeasurementId: '',
  plausibleDomain: 'elijoon93.github.io',
  endpoint: ''
}
```

هیچ کلید خصوصی یا Secret نباید در GitHub Pages قرار گیرد.

## محدودیت‌های صادقانه RC

- Free Conversation واقعی نیازمند Backend/API یا مدل محلی است و در این نسخه جعل نشده است.
- Pronunciation Lab پوشش واژه‌ای و Transcript ارائه می‌کند، نه تحلیل تخصصی فونم.
- صوت فعلی از Web Speech Synthesis مرورگر استفاده می‌کند؛ صوت انسانی استودیویی هنوز اضافه نشده است.
- تست Runtime کنترل‌شده انجام شده، اما تست نصب/Offline روی گوشی فیزیکی Android و iPhone همچنان باید ثبت شود.
- Analytics چندکاربره تا زمان واردکردن شناسه سرویس خارجی فعال نیست.
- ۱۸ بسته محتوایی هنوز Draft هستند.

## انتشار GitHub Pages

فایل‌های این پوشه را در ریشه مخزن `Elijoon93/deutschweg-fa` جایگزین کنید و سپس:

```bash
git add .
git commit -m "release(web): publish DeutschWeg X14.8 production release candidate"
git push origin main
```

در GitHub:

```text
Settings → Pages → Deploy from a branch → main → /(root)
```
