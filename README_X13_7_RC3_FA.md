# DeutschWeg X13.7 RC3 — Web Finalization Acceptance

این بسته فقط روی نهایی‌سازی نسخه وب تمرکز دارد. قابلیت آموزشی پراکنده جدیدی اضافه نشده است.

## Release Gate

Final فقط وقتی مجاز است که:

1. آزمون مرورگر خودکار PASS باشد.
2. آزمون تعامل واقعی هر ۲۱ مقصد منو PASS باشد.
3. آزمون حفظ داده از قرارداد RC2 به RC3 روی همان Origin PASS باشد.
4. Backup/Restore و Service Worker PASS باشند.
5. تمام آزمون‌های الزامی گوشی فیزیکی به‌صورت دستی PASS ثبت شوند.

تا قبل از بند ۵، نام صحیح خروجی `RC3 / Physical Device Acceptance Pending` است.

Storage Key: `deutschweg_x12_user_data`

Data Schema: `1`
