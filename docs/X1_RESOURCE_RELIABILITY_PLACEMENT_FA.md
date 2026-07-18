# DeutschWeg X 9.1 — X1 Resource Reliability & Placement

## هدف
این فاز دو مشکل زیرساختی را حل می‌کند:
1. لینک‌های خارجی نباید مستقیماً و پراکنده داخل UI مدیریت شوند.
2. تعیین سطح باید یک Gadget مستقل باشد و نتیجه آن بدون حذف داده‌های قبلی وارد پروفایل کاربر شود.

## Data Safety
- Storage Key اصلی: `deutschweg_user_data`
- Data Schema: `14` (بدون تغییر)
- قبل از فعال‌شدن معماری X1 یک Backup یک‌باره در IndexedDB ساخته می‌شود.
- save قدیمی Dual-Write شده و Snapshot در IndexedDB نگهداری می‌شود.
- IndexedDB از Version 1 به 2 ارتقا می‌یابد و Storeهای جدید اضافه می‌شوند؛ Storeهای قبلی حذف نمی‌شوند.

## Resource Reliability
- Primary URL و Fallback URL در `src/integrations/catalog.js`
- گزارش سلامت در `resource-health.json`
- بررسی روزانه توسط `.github/workflows/link-health.yml`
- انتخاب Best URL در `src/services/resource-service.js`
- Safe opener برای جلوگیری از Popup Block در iOS/PWA

## Placement Center
- آزمون رسمی سریع Goethe
- لینک تمرین آزمون‌های A1-C2
- ثبت سطح تقریبی در پروفایل موجود
- ذخیره تاریخچه نتیجه در IndexedDB

## قانون ادامه توسعه
هیچ Gadget جدید نباید URL خارجی را مستقیم داخل کد UI هاردکد کند. تمام Integrationها باید از Integration Hub عبور کنند.
