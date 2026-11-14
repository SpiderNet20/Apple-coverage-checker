# Apple Coverage Checker

ويدجت بسيط لفحص ضمان أجهزة Apple. يتحقق من الرقم التسلسلي أو IMEI، وينسخه، ثم يفتح صفحة Apple الرسمية لإظهار حالة التغطية.

> أداة مستقلة غير تابعة أو معتمدة من Apple Inc. لا تعرض حالة الضمان بنفسها، ولا ترسل الرقم إلى أي خادم.

## الاستخدام في موقعك

```html
<div id="apple-checker"></div>
<script src="https://cdn.jsdelivr.net/gh/SpiderNet20/Apple-coverage-checker@main/apple-checker.js" defer></script>
```

يمكن وضع `<div id="apple-checker"></div>` أكثر من مرة في الصفحة. التنسيق معزول (Shadow DOM) فلا يتأثر بتنسيق موقعك.

## الملفات

| الملف | الوصف |
|---|---|
| `apple-checker.js` | الويدجت كملف واحد يُحمَّل من الرابط أعلاه |
| `apple-checker-widget.html` | نسخة جاهزة للصق مباشرة في صفحة HTML |

## تحديث النسخة المخزنة بعد أي تعديل

```
https://purge.jsdelivr.net/gh/SpiderNet20/Apple-coverage-checker@main/apple-checker.js
```

## المميزات

- التحقق من الرقم التسلسلي (8 إلى 24 خانة) ومن IMEI (15 رقماً مع اختبار رقم التحقق).
- استخراج الرقم تلقائياً من النص الملصوق.
- نسخ الرقم ثم فتح موقع Apple الرسمي في تبويب جديد.
