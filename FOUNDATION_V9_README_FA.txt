DeutschWeg X Foundation v9.0.0

این بسته یک بازنویسی مخرب نیست. هسته v8.0.2 را حفظ می‌کند و معماری جدید را به‌صورت لایه‌ای روی آن اضافه می‌کند.

نکات ایمنی داده:
- deutschweg_user_data ثابت مانده است.
- Data Schema روی 14 ثابت است.
- Snapshot اولیه در IndexedDB ساخته می‌شود.
- save() قدیمی به Mirror IndexedDB متصل می‌شود.
- هیچ داده‌ای در Update حذف نمی‌شود.

تغییرات زیرساخت:
- src/core: Data Bridge / IndexedDB / Event Bus
- src/services: Integration Hub / Resource Service
- src/integrations: Integration Catalog
- src/gadgets: Gadget Registry
- GitHub Action روزانه برای بررسی لینک منابع
- Goethe Placement لینک اصلی به 30-item test اصلاح شد.

این نسخه Foundation است: پایه معماری بین‌المللی برای توسعه X1 تا X7.
