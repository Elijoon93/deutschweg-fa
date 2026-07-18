# قرارداد داده DeutschWeg

## شناسه‌های قفل‌شده

- Legacy storage key: `deutschweg_user_data`
- Current legacy schema: `14`
- IndexedDB database: `deutschweg_x`
- Architecture version: `9.0.0-foundation`

## قوانین غیرقابل نقض

1. هیچ Update برنامه حق اجرای `localStorage.clear()` ندارد.
2. هیچ Release حق حذف `deutschweg_user_data` را بدون Export/Backup و تأیید صریح کاربر ندارد.
3. تغییر `APP_VERSION` مستقل از `DATA_SCHEMA_VERSION` است.
4. Migration باید idempotent باشد؛ اجرای دوباره نباید داده را خراب کند.
5. قبل از Migration نسخه Schema، Backup خام ساخته شود.
6. Cache Service Worker هرگز محل نگهداری داده شخصی کاربر نیست.
7. Reset فقط با اقدام صریح کاربر انجام شود.
