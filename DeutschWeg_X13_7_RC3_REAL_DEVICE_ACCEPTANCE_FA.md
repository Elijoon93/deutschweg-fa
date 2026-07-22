# DeutschWeg X13.7 RC3 — پذیرش واقعی گوشی

این فایل برای تست روی گوشی واقعی است. هیچ موردی بدون مشاهده واقعی PASS نشود.

## اطلاعات دستگاه

- مدل گوشی:
- نسخه Android / iOS:
- مرورگر و نسخه:
- حالت اجرا: Browser / Installed PWA
- تاریخ و ساعت تست:

## آزمون‌های الزامی

1. ورودی هفت‌مرحله‌ای بدون برش یا اسکرول افقی.
2. حفظ دقیق سطح فعلی و هدف پس از ورود.
3. نوار پایین: خانه، برنامه من، یادگیری، پیشرفت و بیشتر.
4. بازشدن واقعی هر ۲۱ مقصد منو؛ بدون صفحه سفید یا کارت صوری.
5. جست‌وجو، Favorites، Recent و Category Drawer.
6. Back مرورگر و بازگشت از Modal/Drawer.
7. کیبورد روی Search و textarea بدون پوشاندن نوارها.
8. Portrait و Landscape بدون سرریز افقی.
9. نصب PWA و اجرای آفلاین پس از یک بار بارگذاری کامل.
10. ایجاد Profile، واژه شخصی، SRS و Progress در RC2؛ سپس Update به RC3 و مقایسه داده‌ها.
11. Export Backup، تغییر داده و Import/Restore.
12. نمایش جداگانه Verified، Project-curated و Candidate.
13. Strict Content Mode روشن و جلوگیری از ورود Candidate جدید به Planner/SRS.
14. Service Worker Update بدون ترکیب فایل‌های RC2 و RC3.

## Gate

فقط وقتی همه موارد الزامی PASS شده‌اند، وضعیت دستگاه می‌تواند Accepted ثبت شود. این فایل به‌تنهایی برنامه را Final نمی‌کند؛ شواهد GitHub Actions و گزارش دستگاه نیز لازم است.
