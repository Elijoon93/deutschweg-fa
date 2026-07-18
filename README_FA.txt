DeutschWeg X11 — Global Product UI v11.0.0

DeutschWeg X v10.0.0 — Global Clean Architecture Reset

این نسخه یک Clean Break واقعی است و برای شروع پیش از ورود کاربران ساخته شده است.

تغییرات کلیدی:
- حذف سازگاری اجباری با v8/v9 و حذف Migrationهای قدیمی از مسیر اصلی.
- Storage namespace جدید: deutschweg_x10_user_data
- IndexedDB جدید: deutschweg_x10
- Data Schema از نو: 1
- پاک‌سازی یک‌باره Cache/Service Worker/IndexedDB قدیمی هنگام اولین اجرای v10.
- Service Worker جدید با skipWaiting + clientsClaim و Network-First برای کد و داده.
- version.json برای تشخیص نسخه منتشرشده.
- حذف فایل‌های HOTFIX و اسناد تاریخی از بسته Production.
- همه برچسب‌های نسخه UI باید از APP_VERSION خوانده شوند.

Commit پیشنهادی:
feat!: rebuild DeutschWeg X v10.0.0 global clean architecture
