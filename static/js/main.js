// Gryfix Experience – drobné vanilla JS: hlavička, menu, odhalení, programy (záložky), test pozornosti, výběr okruhů, formulář.
document.documentElement.classList.add('js');

(function () {
  var klid = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- hlavička ----------
  var hl = document.querySelector('[data-hlavicka]');
  function hlavicka() { hl.classList.toggle('je-dole', window.scrollY > 40); }
  if (hl) { hlavicka(); window.addEventListener('scroll', hlavicka, { passive: true }); }

  // ---------- burger ----------
  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function zavri() { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('je-otevrene'); hl.classList.remove('je-otevrene'); }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(o));
      menu.classList.toggle('je-otevrene', o); hl.classList.toggle('je-otevrene', o);
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) zavri(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zavri(); });
  }

  // ---------- odhalení ----------
  var odhal = document.querySelectorAll('.odhal');
  if ('IntersectionObserver' in window && !klid) {
    var io = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('je-videt'); io.unobserve(z.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    odhal.forEach(function (el) { io.observe(el); });
  } else {
    odhal.forEach(function (el) { el.classList.add('je-videt'); });
  }

  // ---------- programy ----------
  var taby = Array.prototype.slice.call(document.querySelectorAll('.tab[data-program]'));
  function vyberProgram(id, fokus) {
    taby.forEach(function (t) {
      var ano = t.getAttribute('data-program') === id;
      t.setAttribute('aria-selected', String(ano));
      t.tabIndex = ano ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (!p) return;
      p.hidden = !ano;
      p.classList.remove('je-zivy');
      if (ano && !klid) { void p.offsetWidth; p.classList.add('je-zivy'); }
      if (ano && fokus) t.focus();
    });
  }
  taby.forEach(function (t, i) {
    t.addEventListener('click', function () { vyberProgram(t.getAttribute('data-program')); });
    t.addEventListener('keydown', function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === 'Home') k = -i; if (e.key === 'End') k = taby.length - 1 - i;
      if (k === undefined) return;
      e.preventDefault();
      vyberProgram(taby[(i + k + taby.length) % taby.length].getAttribute('data-program'), true);
    });
  });
  document.querySelectorAll('[data-vyber-program]').forEach(function (a) {
    a.addEventListener('click', function () { vyberProgram(a.getAttribute('data-vyber-program')); });
  });

  // ---------- formulář: předvyplnění ----------
  var form = document.querySelector('form.formular');
  function nastavProgram(hodnota) {
    if (!form) return;
    form.querySelectorAll('input[name="program"]').forEach(function (r) { r.checked = r.value === hodnota; });
  }
  document.querySelectorAll('[data-poptat]').forEach(function (a) {
    a.addEventListener('click', function () { nastavProgram(a.getAttribute('data-poptat')); });
  });

  // ---------- test pozornosti ----------
  var test = document.querySelector('[data-test]');
  if (test) {
    var sekundy = parseInt(test.getAttribute('data-sekundy'), 10) || 8;
    var faze = test.querySelectorAll('[data-test-faze]');
    var krok = test.querySelector('[data-test-krok]');
    var otazky = test.querySelectorAll('.test__otazka');
    var body = 0, casovac = null;
    test.style.setProperty('--sekundy', sekundy + 's');
    test.setAttribute('data-stav', 'start');

    function ukaz(nazev) {
      faze.forEach(function (f) { f.hidden = f.getAttribute('data-test-faze') !== nazev; });
    }
    function otazka(i) {
      if (i >= otazky.length) return vysledek();
      test.setAttribute('data-stav', 'otazky');
      krok.textContent = 'Otázka ' + (i + 1) + ' ze ' + otazky.length;
      ukaz('q' + i);
      var prvni = otazky[i].querySelector('button'); if (prvni) prvni.focus({ preventScroll: true });
    }
    function vysledek() {
      test.setAttribute('data-stav', 'vysledek');
      krok.textContent = 'Hotovo';
      test.querySelector('[data-test-skore]').textContent = body;
      var zprava = body === otazky.length
        ? 'Výborně. Situační pozornost máte v pořádku. V terénu, pod tlakem a v týmu je to ale jiná zkouška.'
        : body === 0
          ? 'Za osm sekund toho mozek moc neuloží, pokud ho to nikdo nenaučí. Přesně tohle se dá trénovat.'
          : 'Něco vám uteklo. Pod stresem si člověk všimne ještě méně. Situační pozornost se dá trénovat.';
      test.querySelector('[data-test-zprava]').textContent = zprava;
      ukaz('vysledek');
      var li = document.querySelector('[data-schopnost="situační pozornost"]');
      if (li) li.classList.add('je-overeno');
      test.querySelector('[data-test-znovu]').focus({ preventScroll: true });
    }
    function start() {
      body = 0;
      clearTimeout(casovac);
      faze.forEach(function (f) { f.hidden = true; });
      test.setAttribute('data-stav', 'pozoruj');
      krok.textContent = 'Dívejte se pozorně';
      casovac = setTimeout(function () { otazka(0); }, sekundy * 1000);
    }
    test.querySelector('[data-test-spustit]').addEventListener('click', start);
    test.querySelector('[data-test-znovu]').addEventListener('click', start);
    otazky.forEach(function (o, i) {
      o.querySelectorAll('[data-odpoved]').forEach(function (b) {
        b.addEventListener('click', function () { if (b.getAttribute('data-odpoved') === '1') body++; otazka(i + 1); });
      });
    });
  }

  // ---------- vlastní program: okruhy ----------
  var okruhy = document.querySelectorAll('[data-okruh]');
  var pocet = document.querySelector('[data-souhrn-pocet]');
  var slovo = document.querySelector('[data-souhrn-slovo]');
  var prenest = document.querySelector('[data-prenest]');
  function vybrane() { return Array.prototype.filter.call(okruhy, function (c) { return c.checked; }).map(function (c) { return c.value; }); }
  function tvar(n) { return n === 1 ? 'okruh vybrán' : (n >= 2 && n <= 4) ? 'okruhy vybrány' : 'okruhů vybráno'; }
  function souhrn() {
    var n = vybrane().length;
    if (pocet) pocet.textContent = n;
    if (slovo) slovo.textContent = tvar(n);
    if (prenest) prenest.setAttribute('aria-disabled', n ? 'false' : 'true');
  }
  okruhy.forEach(function (c) { c.addEventListener('change', souhrn); });
  souhrn();
  if (prenest && form) {
    prenest.addEventListener('click', function (e) {
      var v = vybrane();
      if (!v.length) { e.preventDefault(); return; }
      var box = form.querySelector('[data-form-okruhy]');
      form.querySelector('[data-form-okruhy-text]').textContent = v.join(', ');
      form.querySelector('[data-form-okruhy-pole]').value = v.join(', ');
      box.hidden = false;
      nastavProgram('Vlastní program');
    });
  }
})();

// Formulář: demo režim neodesílá nic, ostrý režim posílá na endpoint ze site.json (data-endpoint).
(function () {
  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('data-endpoint');
      var demo = f.getAttribute('data-demo') === '1';
      if (f.querySelector('.past input').value) { e.preventDefault(); return; }   // robot
      if (demo || !endpoint) {
        e.preventDefault();
        stav.textContent = 'Ukázka formuláře: nic se neodesílá. Po spuštění webu bude zpráva doručena na e-mail firmy.';
        return;
      }
      e.preventDefault();
      stav.textContent = 'Odesílám…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Děkujeme, zpráva byla odeslána.'; })
        .catch(function () { stav.textContent = 'Odeslání se nepodařilo. Napište nám prosím e-mailem.'; });
    });
  });
})();
