# DeutschWeg X — معماری پایه بین‌المللی

## اصل صفر: داده کاربر مستقل از نسخه برنامه است

- کلید سازگاری قدیمی برای همیشه حفظ می‌شود: `deutschweg_user_data`
- `DATA_SCHEMA_VERSION` در این Foundation عمداً روی 14 ثابت مانده است.
- تغییر معماری برنامه به معنی تغییر Schema داده کاربر نیست.
- قبل از شروع معماری جدید، یک Snapshot از داده فعلی در IndexedDB ذخیره می‌شود.
- در فاز Foundation، LocalStorage همچنان Source of Truth است و IndexedDB فقط Mirror امن است.

## الگوی مهاجرت بدون ریسک (Strangler Migration)

### Phase 0 — Legacy Stable
نسخه v8.0.2 فعلی کار می‌کند و داده را در LocalStorage نگه می‌دارد.

### Phase 1 — Foundation Mirror (این بسته)
- UI و منطق قدیمی حفظ می‌شود.
- هر `save()` قدیمی Wrap می‌شود و Snapshot در IndexedDB نیز ذخیره می‌شود.
- هیچ داده‌ای حذف یا Reset نمی‌شود.

### Phase 2 — Dual Write
ماژول‌های جدید مانند Vocabulary/Analytics مستقیماً در IndexedDB ذخیره می‌شوند و یک نمای سازگاری برای Legacy نگه داشته می‌شود.

### Phase 3 — IndexedDB Primary
IndexedDB منبع اصلی می‌شود؛ LocalStorage فقط Compatibility/Fallback است.

### Phase 4 — Optional Cloud Sync
Supabase Auth + RLS برای همگام‌سازی اختیاری چنددستگاهی اضافه می‌شود. هیچ کلید Service Role در Client قرار نمی‌گیرد.

## لایه‌ها

1. Presentation Shell — iOS / Android / Tablet / Desktop
2. Feature Modules — Today, Planner, Vocabulary, Pronunciation, Writing, Podcast, Exam
3. Gadget Registry — افزونه‌های قابل فعال/غیرفعال
4. Integration Hub — Goethe, Duden, DW, LanguageTool, DeepL, Forvo
5. Adaptive Engine — پیشنهاد بر اساس زمان، خطا، تمرین و هدف
6. Data Gateway — LocalStorage Compatibility + IndexedDB
7. Sync Layer — Offline queue + Cloud اختیاری
8. PWA Runtime — Service Worker + Update Strategy
9. Observability — Link Health + Error/Performance diagnostics

## قانون توسعه

هیچ Feature جدید مستقیماً به `localStorage` دسترسی نداشته باشد. همه Featureهای جدید باید از Data Gateway استفاده کنند.
