# DeutschWeg X v10 — معماری پایه جهانی

## اصل طراحی
نسخه ۱۰ یک Clean Break پیش از ورود کاربران واقعی است. هدف، حذف بدهی فنی ناشی از سازگاری با v8/v9 و تثبیت یک Base قابل توسعه است.

## لایه‌ها
- App Shell / Responsive PWA
- Learning Core
- Gadget Layer
- Integration Hub
- Adaptive Engine
- Local Data Layer (LocalStorage + IndexedDB جدید)
- Optional Cloud Layer
- Update Manager / Service Worker

## داده
- LocalStorage: `deutschweg_x10_user_data`
- IndexedDB: `deutschweg_x10`
- Schema: `1`

## Update Strategy
- Service Worker در install از `skipWaiting()` استفاده می‌کند.
- در activate همه Cacheهای قدیمی حذف می‌شوند و `clients.claim()` اجرا می‌شود.
- Navigation و فایل‌های کد/داده Network-First هستند.
- `version.json` مرجع نسخه انتشار است.
