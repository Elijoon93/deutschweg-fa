DeutschWeg X12.3 — UI Consolidation & Persian UX Cleanup

هسته محصول: برنامه شخصی و تطبیقی یادگیری زبان.
منوی اصلی: خانه / برنامه من / یادگیری / پیشرفت / بیشتر.

تغییرات اصلی:
- یک Design System واحد در app-ui.css
- حذف فایل‌های CSS لایه‌ای X11/X12/X12.1/X12.2 از بسته نهایی
- بازطراحی Home با اولویت برنامه شخصی و قدم بعدی
- ساده‌سازی More و حذف تکرار برنامه‌ریز/تقویم از آن
- فارسی‌سازی اصطلاحات Focus, Smart Plan DNA, Plan Rescue, Goal Risk
- حذف Emojiهای رنگی از رابط اصلی و استفاده از SVGهای یکدست در Navigation و صفحات کلیدی
- Desktop Rail با حالت جمع‌شده/بازشده
- حفظ کامل STORAGE_KEY = deutschweg_x12_user_data
- بدون localStorage.clear، بدون حذف IndexedDB و بدون unregister اجباری Service Worker

این نسخه Feature جدید آموزشی اضافه نمی‌کند؛ هدف آن یکپارچه‌سازی تجربه و ظاهر است.
