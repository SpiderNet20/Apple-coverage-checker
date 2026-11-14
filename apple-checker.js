/*!
 * Apple Coverage Checker widget (أداة فحص ضمان Apple) v1.1
 * أداة مستقلة غير تابعة أو معتمدة من Apple Inc.
 * لا ترسل الرقم لأي خادم: تحلل الرقم داخل المتصفح، وتفتح موقع Apple الرسمي عند طلبك.
 *
 * الاستخدام في الصفحة:
 *   <div id="apple-checker"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/apple-checker.js" defer></script>
 */
(function () {
  'use strict';

  var APPLE_URL = 'https://checkcoverage.apple.com/';

  var CSS = [
    ':host{display:block}',
    '*{box-sizing:border-box}',
    '.box{--ink:#1d1d1f;--muted:#6e6e73;--blue:#0071e3;--line:#d2d2d7;--red:#c9342d;--green:#16834b;max-width:560px;margin:24px auto;padding:22px;background:#fff;color:var(--ink);border:1px solid #e4e4e7;border-radius:18px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,Arial,sans-serif;line-height:1.7}',
    'h3{margin:0 0 6px;font-size:20px}',
    'p{margin:0 0 14px;color:var(--muted);font-size:14px}',
    'label{display:block;font-weight:650;font-size:14px;margin-bottom:8px}',
    'input{width:100%;height:50px;border:1px solid var(--line);border-radius:12px;padding:0 14px;font:inherit;font-size:16px;direction:ltr;text-align:left;background:#fff;color:var(--ink);outline:none}',
    'input:focus{border-color:var(--blue);box-shadow:0 0 0 4px rgba(0,113,227,.15)}',
    'input.bad{border-color:var(--red)}',
    '.msg{min-height:22px;margin:8px 2px 0;font-size:13px}',
    '.err{color:var(--red)}.ok{color:var(--green)}',
    '.btns{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}',
    'button{flex:1 1 auto;min-height:48px;padding:0 18px;border:0;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}',
    '.go{background:var(--blue);color:#fff;flex:2 1 220px}.go:hover{background:#0077ed}',
    '.sec{background:#f0f0f2;color:var(--ink)}',
    'button:focus-visible{outline:3px solid rgba(0,113,227,.4);outline-offset:2px}',
    '.res{margin-top:16px;border:1px solid #cfe8d8;background:#f2fbf5;border-radius:12px;padding:14px 16px}',
    '.res:empty{display:none}',
    '.rhead{font-weight:700;color:var(--green);margin-bottom:8px}',
    '.rows{margin:8px 0;display:grid;gap:6px}',
    '.rows div{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px 12px;font-size:14px}',
    '.rows dt{color:var(--muted)}',
    '.rows dd{margin:0;font-weight:700;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;direction:ltr}',
    '.rnote{font-size:13px;margin:8px 0}',
    '.next{margin:10px 0 0;padding:0 18px 0 0;font-size:13px;color:var(--muted)}',
    '.next li{margin-bottom:4px}',
    '.apple{width:100%;margin-top:12px;background:var(--blue);color:#fff}.apple:hover{background:#0077ed}',
    'small{display:block;margin-top:14px;color:var(--muted);font-size:12px}'
  ].join('\n');

  var HTML = [
    '<div class="box" dir="rtl">',
    '  <h3>فحص رقم جهاز Apple</h3>',
    '  <p>أدخل الرقم التسلسلي أو IMEI لنحلل الرقم، ثم أكمل فحص الضمان من موقع Apple الرسمي.</p>',
    '  <form novalidate>',
    '    <label>الرقم التسلسلي أو IMEI',
    '      <input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="مثال: F2LXXXXXXXXX">',
    '    </label>',
    '    <div class="msg" role="status" aria-live="polite"></div>',
    '    <div class="btns">',
    '      <button class="go" type="submit">تحقق من الرقم</button>',
    '      <button class="sec" type="button" data-clear>مسح</button>',
    '    </div>',
    '  </form>',
    '  <div class="res" aria-live="polite"></div>',
    '  <small>أداة مستقلة غير تابعة أو معتمدة من Apple Inc. التحليل أعلاه فحص لصيغة الرقم فقط، وحالة الضمان الرسمية تظهر في موقع Apple.</small>',
    '</div>'
  ].join('\n');

  function extract(raw) {
    var s = String(raw || '').toUpperCase();
    var digits = s.replace(/[\s\-\/.]/g, '');
    if (/^\d{15}$/.test(digits)) return digits;
    var cleaned = s.replace(/(SERIAL\s*(NUMBER|NO\.?)?|S\/N|IMEI|الرقم\s*التسلسلي)\s*[:：]?/g, ' ');
    var t = cleaned.match(/[A-Z0-9]{8,24}/g);
    return t && t.length ? t[0] : s.replace(/[^A-Z0-9]/g, '');
  }

  function luhn(n) {
    var sum = 0, alt = false;
    for (var i = n.length - 1; i >= 0; i--) {
      var d = n.charCodeAt(i) - 48;
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function check(v) {
    if (/^\d{15}$/.test(v)) return luhn(v) ? null : 'رقم IMEI غير صحيح (فشل اختبار رقم التحقق). راجع الأرقام.';
    if (/^[A-Z0-9]{8,24}$/.test(v)) return null;
    return 'أدخل رقماً تسلسلياً (8 إلى 24 حرفاً وأرقاماً) أو IMEI من 15 رقماً.';
  }

  function serialHint(len) {
    if (len === 12) return 'صيغة تقليدية من 12 خانة شائعة في iPhone وiPad وMac.';
    if (len === 11) return 'صيغة أقدم من 11 خانة لدى بعض الأجهزة.';
    if (len === 10) return 'صيغة عشوائية من 10 خانات تستخدمها Apple في بعض المنتجات الأحدث.';
    return 'طول غير معتاد، تأكد أنك نسخت الرقم كاملاً.';
  }

  // تحليل حقيقي للرقم داخل المتصفح (لا أسماء طرازات مخترعة ولا حالة ضمان)
  function resultHtml(v) {
    var next =
      '<ul class="next">' +
      '<li>قارن الرقم بالمعروض في الإعدادات ← عام ← حول، وبالمطبوع على العبوة أو الجهاز.</li>' +
      '<li>افتح صفحة Apple الرسمية لمعرفة الطراز وحالة الضمان والتغطية.</li>' +
      '<li>عند شراء جهاز مستعمل اطلب من البائع إثبات الشراء.</li>' +
      '</ul>';
    var btn = '<button class="apple" type="button" data-apple>افتح فحص Apple الرسمي وانسخ الرقم ←</button>';
    if (/^\d{15}$/.test(v)) {
      return '<div class="rhead">رقم IMEI صحيح (اجتاز اختبار رقم التحقق)</div>' +
        '<dl class="rows">' +
        '<div><dt>رمز النوع TAC (أول 8 أرقام)</dt><dd>' + v.slice(0, 8) + '</dd></div>' +
        '<div><dt>الرقم المتسلسل (6 أرقام)</dt><dd>' + v.slice(8, 14) + '</dd></div>' +
        '<div><dt>رقم التحقق</dt><dd>' + v.slice(14) + '</dd></div>' +
        '</dl>' +
        '<p class="rnote">رمز النوع يحدد الشركة المصنّعة وطراز الجهاز، لكن هذه الأداة لا تحوّله إلى اسم طراز. اسم الطراز وحالة الضمان تظهران في صفحة Apple الرسمية.</p>' +
        next + btn;
    }
    return '<div class="rhead">الرقم التسلسلي بصيغة سليمة (' + v.length + ' خانة)</div>' +
      '<dl class="rows"><div><dt>الرقم</dt><dd>' + v + '</dd></div></dl>' +
      '<p class="rnote">' + serialHint(v.length) + ' سلامة الصيغة لا تعني أن الرقم مسجّل لدى Apple، فهذا تؤكده صفحة Apple الرسمية فقط.</p>' +
      next + btn;
  }

  function copy(v) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(v).then(function () { return true; }, function () { return false; });
      }
    } catch (e) {}
    return Promise.resolve(false);
  }

  function wire(root) {
    var form = root.querySelector('form');
    var input = root.querySelector('input');
    var msg = root.querySelector('.msg');
    var res = root.querySelector('.res');

    function show(text, kind) {
      msg.textContent = text || '';
      msg.className = 'msg' + (kind ? ' ' + kind : '');
      input.classList.toggle('bad', kind === 'err');
    }
    function reset() { res.innerHTML = ''; show(''); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = extract(input.value), bad = check(v);
      if (bad) { res.innerHTML = ''; show(bad, 'err'); input.focus(); return; }
      input.value = v;
      show('');
      res.innerHTML = resultHtml(v);
      var go = res.querySelector('[data-apple]');
      go.addEventListener('click', function () {
        var copying = copy(v); // داخل نفس الضغطة كي يسمح بها المتصفح
        var w = window.open(APPLE_URL, '_blank', 'noopener,noreferrer');
        copying.then(function (ok) {
          show(ok ? 'تم نسخ الرقم. الصقه في خانة الرقم التسلسلي بصفحة Apple.' : 'انسخ الرقم يدوياً ثم الصقه في صفحة Apple.', 'ok');
        });
        if (!w) window.location.href = APPLE_URL;
      });
    });

    input.addEventListener('input', reset);
    input.addEventListener('paste', function () {
      setTimeout(function () { var v = extract(input.value); if (v) input.value = v; }, 0);
    });
    root.querySelector('[data-clear]').addEventListener('click', function () {
      input.value = ''; reset(); input.focus();
    });
  }

  function mount(host) {
    if (host.__appleChecker) return;
    host.__appleChecker = true;
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.innerHTML = '<style>' + CSS + '</style>' + HTML;
    wire(root);
  }

  function init() {
    var hosts = document.querySelectorAll('#apple-checker, [data-apple-checker]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // مواقع كثيرة تضيف محتوى الصفحة بعد تحميل السكربت: نراقب ظهور الحاوية ونركّب الأداة فيها
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; init(); }, 50);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
