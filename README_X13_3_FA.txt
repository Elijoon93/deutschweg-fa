DeutschWeg X13.3 — Lexicon Intelligence & Context Graph

هدف این مرحله:
- تبدیل بانک ۶۰۰۰ مدخلی از یک عدد خام به یک سیستم دارای کنترل کیفیت روشن.
- حفظ کامل داده کاربران با STORAGE_KEY = deutschweg_x12_user_data و DATA_SCHEMA_VERSION = 1.
- عدم ساخت ترجمه فارسی، Artikel، Plural یا CEFR جعلی برای مدخل‌های خام.
- اتصال واژه‌های موجود به بانک 2579 جمله و چهار مهارت.
- افزودن Enrichment Studio برای تکمیل دستی و غیرمخرب هر مدخل.
- اتصال واژه به Personal Vocabulary، Planner و چهار مهارت.

آمار کیفیت فعلی پس از تحلیل خودکار:
{
  "version": "13.3.0",
  "totalLexicon": 6000,
  "sentenceBank": 2579,
  "rich": 10,
  "contextReady": 336,
  "enriched": 0,
  "contextualized": 31,
  "indexOnly": 5623,
  "contextLinked": 377,
  "levelCurated": 346,
  "levelEstimated": 31,
  "levelUnrated": 5623,
  "learningReady": 346,
  "reviewQueue": 6000
}

تعریف کیفیت:
- rich: معنی فارسی + مثال واقعی/تأییدشده در داده پایه.
- enriched: معنی فارسی دارد ولی مثال پایه هنوز کامل/واقعی نیست.
- contextualized: معنی فارسی ندارد ولی در Sentence Bank شاهد مستقیم دارد.
- index-only: فقط مدخل واژگانی است و باید پیش از آموزش جدی تکمیل/بررسی شود.

نکته مهم:
عدد ۶۰۰۰ به معنی ۶۰۰۰ واژه کاملاً ترجمه‌شده و CEFR-تأییدشده نیست. X13.3 این تفاوت را در UI آشکار می‌کند و صف تکمیل محتوا می‌سازد.
