/*!
 * Apple Coverage Checker widget (أداة فحص ضمان Apple)
 * أداة مستقلة غير تابعة أو معتمدة من Apple Inc.
 * لا ترسل الرقم لأي خادم: تنسخه وتفتح موقع Apple الرسمي فقط.
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
    'small{display:block;margin-top:14px;color:var(--muted);font-size:12px}'
  ].join('\n');

  var HTML = [
    '<div class="box" dir="rtl">',
    '  <h3>فحص ضمان جهاز Apple</h3>',
    '  <p>أدخل الرقم التسلسلي أو IMEI، ثم أكمل الفحص من موقع Apple الرسمي.</p>',
    '  <form novalidate>',
    '    <label>الرقم التسلسلي أو IMEI',
    '      <input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="مثال: F2LXXXXXXXXX">',
    '    </label>',
    '    <div class="msg" role="status" aria-live="polite"></div>',
    '    <div class="btns">',
    '      <button class="go" type="submit">متابعة إلى فحص Apple الرسمي ←</button>',
    '      <button class="sec" type="button" data-clear>مسح</button>',
    '    </div>',
    '  </form>',
    '  <small>أداة مستقلة غير تابعة أو معتمدة من Apple Inc. لا نعرض حالة الضمان، والنتيجة الحقيقية تظهر في موقع Apple.</small>',
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
    if (/^\d{15}$/.test(v)) return luhn(v) ? null : 'رقم IMEI غير صحيح، راجع الأرقام.';
    if (/^[A-Z0-9]{8,24}$/.test(v)) return null;
    return 'أدخل رقماً تسلسلياً (8 إلى 24 حرفاً وأرقاماً) أو IMEI من 15 رقماً.';
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

    function show(text, kind) {
      msg.textContent = text || '';
      msg.className = 'msg' + (kind ? ' ' + kind : '');
      input.classList.toggle('bad', kind === 'err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = extract(input.value), bad = check(v);
      if (bad) { show(bad, 'err'); input.focus(); return; }
      input.value = v;
      var copying = copy(v); // داخل نفس الضغطة كي يسمح بها المتصفح
      var w = window.open(APPLE_URL, '_blank', 'noopener,noreferrer');
      copying.then(function (ok) {
        show(ok ? 'تم نسخ الرقم. الصقه في خانة الرقم التسلسلي بصفحة Apple.' : 'انسخ الرقم يدوياً ثم الصقه في صفحة Apple.', 'ok');
      });
      if (!w) window.location.href = APPLE_URL;
    });

    input.addEventListener('input', function () { show(''); });
    input.addEventListener('paste', function () {
      setTimeout(function () { var v = extract(input.value); if (v) input.value = v; }, 0);
    });
    root.querySelector('[data-clear]').addEventListener('click', function () {
      input.value = ''; show(''); input.focus();
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
})();
