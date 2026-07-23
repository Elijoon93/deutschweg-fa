# HANDOFF — DeutschWeg X16.5.1

## وضعیت جاری

`Final Acceptance & Stabilization Candidate`

این نسخه Final Stable نیست. تصمیم پیش‌فرض انتشار `HOLD` است و فقط پس از ثبت شواهد واقعی همه گیت‌ها می‌تواند به `FINAL_ELIGIBLE` برسد.

## موارد اضافه‌شده

- مرکز مستقل `final-acceptance.html` با ۲۰ گیت پذیرش
- کنترل خودکار ساختار PWA، نسخه، داده، Sponsor Gate و موتور شایستگی
- ثبت PASS/FAIL دستی همراه نام آزمونگر، دستگاه، مرورگر و شرح نتیجه
- الزام حداقل دو زبان‌آموز A1/A2 برای آزمون کاربردپذیری
- الزام بازبینی انسانی همه سطوح A1 تا C2
- دفتر نقص با شدت Critical/High/Medium/Low
- مسدودشدن ارتقا در صورت وجود نقص باز Critical یا High
- خروجی و ورود گزارش پذیرش JSON
- اسکریپت ارتقای محافظت‌شده به Final Stable
- GitHub Actions برای کنترل ساختار هر Push و Pull Request

## مفروضات حفظ‌شده

- Sponsor Gate اجباری با تأخیر ۲۶ ثانیه
- `@persian_Germanymovie` و `@kingman007`
- تأیید عضویت فقط محلی؛ بدون ادعای استعلام واقعی تلگرام
- کلید سازگار `deutschweg_sponsor_gate_24s_v2`
- LocalStorage: `deutschweg_x14_6_integrated_state`
- IndexedDB: `deutschweg-x14-6`
- بدون حساب کاربری
- مسیر باز A1 تا C2 و شروع واقعی از سطح انتخابی
- چهار بخش امروز، مسیر، تمرین و من
- ۵۴ گره شایستگی، ۱۰۸ Can-Do و ۱۸ سؤال تشخیصی

## QA داخلی

- Static functional: 96 PASS / 0 FAIL
- Release verification: 58 PASS / 0 FAIL
- HTTP asset probes: 9 PASS / 0 FAIL
- Controlled runtime: 22 PASS / 0 FAIL
- Promotion guard: بدون شاهد BLOCK؛ مسیر ارتقا در کپی ایزوله با داده مصنوعی PASS

آزمون Runtime با `Page.setContent` و عبور کنترل‌شده Sponsor فقط برای QA انجام شده و جایگزین پذیرش HTTPS یا دستگاه واقعی نیست.

## گیت‌های خارجی باقی‌مانده

- انتشار و بررسی HTTPS عمومی
- Android واقعی: TTS، میکروفون، ضبط، Speech Recognition و PWA
- iPhone واقعی: TTS، میکروفون/fallback، نصب و Offline
- Backup/Restore روی Origin منتشرشده
- دو آزمون کاربردپذیری A1/A2
- بازبینی انسانی A1 تا C2
- صفر نقص باز Critical/High
