/* Lenis is initialized by web 2/js/main.js as window.lenis */



(function () {
  "use strict";
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var path = document.getElementById('boldCurvePath');
  var el = document.querySelector('.om-bold-curve');
  if (!path || !el) return;

  var VBH = 160;

  var state = { v: -140 };

  function render() {
    path.setAttribute('d', 'M0,0 Q500,' + state.v + ' 1000,0 L1000,' + VBH + ' L0,' + VBH + ' Z');
  }
  render();

  gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
    onUpdate: render
  })
    .to(state, { v: 0, duration: 0.55, ease: 'none' })
    .to(state, { v: 22, duration: 0.17, ease: 'none' })
    .to(state, { v: -12, duration: 0.16, ease: 'none' })
    .to(state, { v: 0, duration: 0.12, ease: 'none' });
})();



(function () {
  "use strict";

  var COLORS = ['#B481F8', '#96B7D8', '#BB9B1B'];
  var i = 0;
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest || !e.target.closest('#gravityHome')) return;
    i = (i + 1) % COLORS.length;
    document.documentElement.style.setProperty('--accent', COLORS[i]);
  });
})();



(function () {
  "use strict";

  var sanft = !(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.addEventListener('click', function (e) {
    if (e.button) return;
    var a = e.target.closest && e.target.closest('#gravityHome a[href="#"]');
    if (!a) return;

    e.preventDefault();
    if (window.lenis && window.lenis.scrollTo) {
      window.lenis.scrollTo(0, sanft ? { duration: 1.6 } : { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: sanft ? 'smooth' : 'auto' });
    }
  });
})();



(function () {
  "use strict";
  var text = document.getElementById('brandText');
  var dot = document.getElementById('brandDot');
  if (!text || !dot) return;

  var I_INDEX = 4;
  var LAST_INDEX = text.textContent.length - 1;
  var BASELINE = 28;
  var FONT_SIZE = 22;

  var SIZE_FACTOR = 1;
  var midX = 0, midY = 0, radius = 0;

  function measureOrbit() {
    var iBox = text.getExtentOfChar(I_INDEX);
    var yBox = text.getExtentOfChar(LAST_INDEX);

    var iDotX = iBox.x + iBox.width / 2;
    var iDotY = BASELINE - FONT_SIZE * 0.62;
    var periodX = yBox.x + yBox.width + 3;
    var periodY = BASELINE - FONT_SIZE * 0.08;

    midX = (iDotX + periodX) / 2;
    midY = (iDotY + periodY) / 2;
    radius = Math.hypot(periodX - iDotX, periodY - iDotY) / 2 * SIZE_FACTOR;
  }

  measureOrbit();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureOrbit);
  }
  window.addEventListener('resize', measureOrbit);

  var ORBIT_PERIOD_SEC = 3.4;
  function frame(now) {
    var theta = ((now / 1000) / ORBIT_PERIOD_SEC) * 2 * Math.PI;
    dot.setAttribute('cx', midX + radius * Math.cos(theta));
    dot.setAttribute('cy', midY + radius * Math.sin(theta));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();



(function () {
  "use strict";

  var bg = document.getElementById('bg');
  if (!bg) return;
  var gezeigt = false;

  var kopfzeilen = [document.getElementById('brand'), document.getElementById('lockup'),
  document.getElementById('claim'), document.getElementById('nav')];

  function zeigen() {
    if (gezeigt) return;
    gezeigt = true;

    requestAnimationFrame(function () {
      bg.classList.add('is-loaded');
      kopfzeilen.forEach(function (el) { if (el) el.classList.add('is-da'); });

      window.dispatchEvent(new Event('om:kopf-da'));
    });
  }
  var img = new Image();
  img.onload = function () {

    if (img.decode) { img.decode().then(zeigen, zeigen); } else { zeigen(); }
  };
  img.onerror = zeigen;
  img.src = 'images/gravity/portrait.jpg?v=p4';
  if (img.complete && img.naturalWidth) { img.onload(); }

  setTimeout(zeigen, 2000);
})();



(function () {
  "use strict";

  var toggle = document.getElementById('modeToggle');
  var bg = document.getElementById('bg');
  if (!toggle || !bg) return;

  var FG_DARK = '#FFFFFF';
  var FG_LIGHT = '#2B2B2B';
  var PHOTO_DARK = 'images/gravity/portrait.jpg?v=p4';
  var PHOTO_LIGHT = 'images/gravity/portrait.jpg?v=p4';

  var OVERLAY_DARK = ['rgba(16,16,16,0.72)', 'rgba(16,16,16,0.38)', 'rgba(16,16,16,0.12)'];
  var OVERLAY_LIGHT = ['rgba(16,16,16,0.16)', 'rgba(16,16,16,0.08)', 'rgba(16,16,16,0.02)'];

  var isLight = false;
  function applyMode() {
    document.documentElement.style.setProperty('--fg', isLight ? FG_LIGHT : FG_DARK);
    var photo = isLight ? PHOTO_LIGHT : PHOTO_DARK;

    bg.style.setProperty('--photo', "url('" + photo + "')");
    if (window.__tiefeFoto) window.__tiefeFoto(photo);
    var ov = isLight ? OVERLAY_LIGHT : OVERLAY_DARK;
    document.documentElement.style.setProperty('--overlay-1', ov[0]);
    document.documentElement.style.setProperty('--overlay-2', ov[1]);
    document.documentElement.style.setProperty('--overlay-3', ov[2]);
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    isLight = !isLight;
    applyMode();
  });
})();



(function () {
  "use strict";
  var strich = document.querySelector('.mf-strike');
  var unter = document.querySelector('.om-bold-underline');
  var scroller = document.getElementById('boldScroll');
  if ((!strich && !unter) || !scroller) return;

  var STRICH_AB = 0.008;
  var UNTER_AB = 0.038;

  function pruefen() {
    var rect = scroller.getBoundingClientRect();
    var reserve = rect.height - window.innerHeight;
    var p = reserve > 0 ? Math.max(0, Math.min(1, -rect.top / reserve)) : 0;
    if (strich) strich.classList.toggle('is-struck', p >= STRICH_AB);
    if (unter) unter.classList.toggle('is-struck', p >= UNTER_AB);
  }
  window.addEventListener('scroll', pruefen, { passive: true });
  window.addEventListener('resize', pruefen);
  pruefen();
})();



(function () {
  "use strict";

  var feld = document.getElementById('mfRing');
  if (!feld) return;
  var bahn = feld.querySelector('.mf-ring-bahn');
  var punkt = feld.querySelector('.mf-punkt');
  if (!bahn || !punkt) return;
  if (window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var NAHE = 260;
  var KRAFT = 0.95;
  var MAX = 80;

  var HIN = 0.055;
  var ZURUECK = 0.018;

  var zeigerX = 0, zeigerY = 0, dabei = false, laeuft = false;
  var x = 0, y = 0;

  function winkel() {
    var m = getComputedStyle(bahn).transform;
    if (!m || m === 'none') return 0;
    var t = m.slice(m.indexOf('(') + 1, -1).split(',');
    return Math.atan2(parseFloat(t[1]) || 0, parseFloat(t[0]) || 1);
  }

  function ziel() {
    var el = document.querySelector('.om-cursor-punkt');
    if (el) {
      var r = el.getBoundingClientRect();
      if (r.width) return [r.left + r.width / 2, r.top + r.height / 2];
    }
    return [zeigerX, zeigerY];
  }

  function bild() {
    var w = winkel(), cos = Math.cos(w), sin = Math.sin(w);
    var r = punkt.getBoundingClientRect();
    var ruheX = r.left + r.width / 2 - (x * cos - y * sin);
    var ruheY = r.top + r.height / 2 - (x * sin + y * cos);

    var zielX = 0, zielY = 0;
    if (dabei && r.width > 0) {
      var z = ziel();
      var dx = z[0] - ruheX, dy = z[1] - ruheY;
      var d = Math.hypot(dx, dy);
      if (d > 0.5 && d < NAHE) {

        var weg = Math.min(d * KRAFT * (1 - d / NAHE), MAX);
        var sx = dx / d * weg, sy = dy / d * weg;
        zielX = sx * cos + sy * sin;
        zielY = -sx * sin + sy * cos;
      }
    }

    var traege = (zielX || zielY) ? HIN : ZURUECK;
    x += (zielX - x) * traege;
    y += (zielY - y) * traege;

    var stark = Math.min(1, Math.hypot(x, y) / (KRAFT * NAHE / 4));
    punkt.style.transform =
      'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' +
      (1 + stark * 0.12).toFixed(3) + ')';

    if (dabei || Math.hypot(x, y) > 0.3) {
      requestAnimationFrame(bild);
    } else {
      x = 0; y = 0; punkt.style.transform = '';
      laeuft = false;
    }
  }

  function wecken() {
    if (laeuft) return;
    laeuft = true;
    requestAnimationFrame(bild);
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    zeigerX = e.clientX; zeigerY = e.clientY;
    dabei = true;
    wecken();
  }, { passive: true });
  window.addEventListener('pointerleave', function () { dabei = false; }, { passive: true });
  window.addEventListener('blur', function () { dabei = false; });
})();



(function () {
  "use strict";

  var bio = document.querySelector('.om-bio');
  var ABSTAND = 48;
  var MINDEST = 150;
  var HOECHST = 0.34;

  var letzteSignatur = null, timer = 0, versuche = 0;

  function kanten() {

    var namen = window.innerWidth <= 640
      ? ['brand'] : ['brand', 'mass', 'small', 'ring'];
    var teile = namen.map(function (id) {
      var el = document.getElementById(id);
      return el ? el.getBoundingClientRect() : null;
    }).filter(function (r) { return r && (r.width || r.height); });
    return teile.length === namen.length ? teile : null;
  }

  function gedockt() {
    var wortmarke = document.getElementById('brand');
    return !!wortmarke && getComputedStyle(wortmarke).position === 'fixed';
  }

  function versuchen() {
    var teile = kanten();
    if (!teile) return false;
    var signatur = teile.map(function (r) { return Math.round(r.bottom); }).join('|');
    if (signatur !== letzteSignatur) {
      letzteSignatur = signatur;
      return false;
    }
    var unten = Math.max.apply(null, teile.map(function (r) { return r.bottom; }));
    if (unten <= 0) return false;
    var wert = Math.max(MINDEST, Math.min(window.innerHeight * HOECHST, unten + ABSTAND));

    if (bio && window.innerWidth > 720) {
      bio.style.setProperty('--bio-top', Math.round(wert) + 'px');
    }

    document.documentElement.style.setProperty('--logo-unten', Math.round(wert) + 'px');

    window.dispatchEvent(new Event('om:bio-top'));
    return true;
  }

  function starten() {
    if (timer) clearInterval(timer);
    letzteSignatur = null; versuche = 0;
    timer = setInterval(function () {

      if (!gedockt()) { letzteSignatur = null; return; }
      versuche++;
      if (versuchen() || versuche > 150) { clearInterval(timer); timer = 0; }
    }, 400);
  }

  starten();
  window.addEventListener('resize', starten);
})();



(function () {
  "use strict";

  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TRAEGHEIT = 8;
  var RUHE_MS = 420;
  var punkt = document.createElement('div');
  punkt.className = 'om-cursor';
  punkt.setAttribute('aria-hidden', 'true');
  punkt.innerHTML = '<span class="om-cursor-punkt"></span>' +
    '<span class="om-cursor-pfeil">' +
    '<svg class="zeichen-rechts" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.4" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 5 L16 12 L9 19"></path></svg>' +
    '<svg class="zeichen-links" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.4" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M15 5 L8 12 L15 19"></path></svg>' +

    '<svg class="zeichen-hoch" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.4" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 15 L12 8 L19 15"></path></svg>' +
    '</span>' +
    '<span class="om-cursor-text">click to gravitize</span>';
  document.body.appendChild(punkt);

  var zielX = 0, zielY = 0, x = 0, y = 0;
  var kennt = false, laeuft = false, zuletzt = 0;
  var ruheTimer = 0;

  var navLeiste = document.getElementById('nav');
  var elKontakt = navLeiste && navLeiste.querySelector('a');
  var FANG = 130;
  var LOESE = 210;
  var HALTEN = 320;
  var gefangen = false, loeseTimer = 0;

  function navSichtbar() {
    if (document.documentElement.classList.contains('in-web2-zone') ||
      document.documentElement.classList.contains('in-web2-full')) return false;
    return !!navLeiste && parseFloat(getComputedStyle(navLeiste).opacity) > 0.5;
  }

  function abstandZu(r, px, py) {
    var dx = Math.max(r.left - px, 0, px - r.right);
    var dy = Math.max(r.top - py, 0, py - r.bottom);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function imFangbereich(px, py) {
    if (!elKontakt || !navSichtbar()) return false;
    return abstandZu(elKontakt.getBoundingClientRect(), px, py) <= FANG;
  }
  function fangPruefen() {
    if (!elKontakt || !navSichtbar()) {
      if (gefangen) {
        gefangen = false;
        punkt.classList.remove('is-gefangen');
        if (elKontakt) elKontakt.classList.remove('is-nah');
        document.body.classList.remove('is-kontakt-nah');
      }
      return;
    }
    var d = abstandZu(elKontakt.getBoundingClientRect(), zielX, zielY);
    if (d <= FANG) {
      clearTimeout(loeseTimer); loeseTimer = 0;
      gefangen = true;
    } else if (gefangen && d > LOESE && !loeseTimer) {
      loeseTimer = setTimeout(function () {
        loeseTimer = 0; gefangen = false;
        punkt.classList.remove('is-gefangen');
        anstossen();
      }, HALTEN);
    }
    punkt.classList.toggle('is-gefangen', gefangen);

    elKontakt.classList.toggle('is-nah', d <= FANG);
    document.body.classList.toggle('is-kontakt-nah', d <= FANG);
  }

  function zielHolen() {
    if (!gefangen || !elKontakt) return [zielX, zielY];
    var r = elKontakt.getBoundingClientRect();
    return [r.left + r.width / 2, r.bottom + 16];
  }

  var elHinweis = document.getElementById('hint');
  function hinweisFaellig() {
    return !!elHinweis && parseFloat(elHinweis.style.opacity) > 0;
  }

  function farbePruefen() {
    punkt.classList.toggle('is-auf-farbe',
      !!(window.omAufFarbe && window.omAufFarbe(x, y)));
  }

  function textZeigen(an) {
    punkt.classList.toggle('is-ruhe', !!an && hinweisFaellig());
  }

  function ruhePlanen() {
    clearTimeout(ruheTimer);
    ruheTimer = setTimeout(function () {

      if (laeuft) { ruhePlanen(); return; }
      punkt.classList.toggle('is-links', zielX > window.innerWidth - 210);
      textZeigen(true);
    }, RUHE_MS);
  }

  window.addEventListener('scroll', function () {

    farbePruefen();
    if (punkt.classList.contains('is-ruhe') && !hinweisFaellig()) {
      punkt.classList.remove('is-ruhe');
    }
  }, { passive: true });
  var abX = 0, abY = 0;
  window.addEventListener('pointerdown', function (e) {
    abX = e.clientX; abY = e.clientY;
    punkt.classList.remove('is-ruhe');
    ruhePlanen();
  }, { passive: true });

  window.addEventListener('click', function (e) {
    if (e.button) return;
    if (e.target && e.target.closest && e.target.closest('#web2Rest')) return;
    if (!imFangbereich(e.clientX, e.clientY)) return;

    if (Math.abs(e.clientX - abX) > 8 || Math.abs(e.clientY - abY) > 8) return;

    if (e.target.closest && e.target.closest('a')) return;
    e.preventDefault();
    e.stopPropagation();
    elKontakt.click();
  }, true);

  window.addEventListener('om:kopf-da', function () { if (kennt) ruhePlanen(); });

  function schritt(jetzt) {
    var dt = zuletzt ? Math.min(0.05, (jetzt - zuletzt) / 1000) : 1 / 60;
    zuletzt = jetzt;
    var k = Math.min(1, dt * TRAEGHEIT);
    var z = zielHolen();
    var dx = z[0] - x, dy = z[1] - y;
    x += dx * k; y += dy * k;
    punkt.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';

    farbePruefen();
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
      requestAnimationFrame(schritt);
    } else {
      laeuft = false; zuletzt = 0;
    }
  }

  function anstossen() {
    if (laeuft) return;
    laeuft = true; zuletzt = 0;
    requestAnimationFrame(schritt);
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    zielX = e.clientX; zielY = e.clientY;
    if (!kennt) {

      kennt = true; x = zielX; y = zielY;
      punkt.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      punkt.classList.add('is-da');
    }
    punkt.classList.remove('is-ruhe');
    fangPruefen();

    if (gefangen) { clearTimeout(ruheTimer); } else { ruhePlanen(); }
    anstossen();
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    punkt.classList.remove('is-da', 'is-ruhe');
    clearTimeout(ruheTimer);
  });
  document.addEventListener('pointerenter', function () { if (kennt) punkt.classList.add('is-da'); });
})();



(function () {
  "use strict";

  var punkt = document.getElementById('titleDot');
  var gast = document.getElementById('guestOrb');
  var titel = document.querySelector('.om-section-title');
  var konst = document.getElementById('constellation');
  if (!punkt || !gast || !titel || !konst) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (window.innerWidth <= 640) return;

  var flug = document.createElement('div');
  flug.className = 'om-flydot';
  flug.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flug);

  var FLUGDAUER = 750;
  var zustand = 'text';
  var startZeit = 0, vonX = 0, vonY = 0, groesse = 10, rafId = 0;

  function mitte(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: Math.max(r.width, r.height) };
  }
  function setzen(x, y) {
    flug.style.transform = 'translate3d(' + (x - groesse / 2).toFixed(1) + 'px,' +
      (y - groesse / 2).toFixed(1) + 'px,0)';
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function schritt(now) {
    var t = Math.min(1, (now - startZeit) / FLUGDAUER);
    var e = easeOut(t);

    var ziel = zustand === 'hin' ? mitte(gast) : mitte(punkt);
    setzen(vonX + (ziel.x - vonX) * e, vonY + (ziel.y - vonY) * e);
    if (t < 1) { rafId = requestAnimationFrame(schritt); return; }
    rafId = 0;
    if (zustand === 'hin') {
      zustand = 'orbit';
      gast.classList.add('is-in');
      flug.classList.remove('is-fliegend');
    } else {
      zustand = 'text';
      punkt.classList.remove('is-weg');
      flug.classList.remove('is-fliegend');
    }
  }

  function starten(richtung) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    var start = richtung === 'hin' ? mitte(punkt) : mitte(gast);
    var zielGroesse = mitte(gast).d;
    groesse = zielGroesse > 0 ? zielGroesse : 10;
    flug.style.width = flug.style.height = groesse.toFixed(1) + 'px';
    vonX = start.x; vonY = start.y;
    setzen(vonX, vonY);
    flug.classList.add('is-fliegend');
    if (richtung === 'hin') { punkt.classList.add('is-weg'); }
    else { gast.classList.remove('is-in'); }
    zustand = richtung;
    startZeit = performance.now();
    rafId = requestAnimationFrame(schritt);
  }

  function pruefen() {

    var sichtbar = parseFloat(konst.style.opacity || '0') > 0.5;
    var r = titel.getBoundingClientRect();
    var m = (r.top + r.bottom) / 2 / window.innerHeight;

    if (zustand === 'text' && sichtbar && m < 0.62) { starten('hin'); }
    else if (zustand === 'orbit' && (!sichtbar || m > 0.72)) { starten('zurueck'); }
  }
  window.addEventListener('scroll', pruefen, { passive: true });
  window.addEventListener('resize', pruefen);
  pruefen();
})();



(function () {
  "use strict";

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var BREMSWEG = 70;

  var teile = [].slice.call(document.querySelectorAll(
    '.om-section, .om-bio-label, .om-bio-key, .om-bio-text'));
  if (!teile.length) return;

  var daten = [], geplant = false;

  function dokTop(el) {
    var y = 0;
    for (var n = el; n; n = n.offsetParent) { y += n.offsetTop; }
    return y;
  }

  function messen() {
    daten = [];
    for (var i = 0; i < teile.length; i++) {
      var el = teile[i];
      var stil = getComputedStyle(el);
      if (stil.position !== 'sticky') { el.style.transform = ''; continue; }
      daten.push({ el: el, dok: dokTop(el), halt: parseFloat(stil.top) || 0, zuletzt: null, frei: false });
    }
  }

  function rechnen() {
    var y = window.pageYOffset;
    for (var i = 0; i < daten.length; i++) {
      var d = daten[i];
      var abstand = (d.dok - y) - d.halt;
      var q = abstand / BREMSWEG;
      var zusatz;
      if (q > 30) { zusatz = 0; }
      else if (q < -30) { zusatz = 0; }
      else {
        var weich = BREMSWEG * Math.log(1 + Math.exp(q));
        zusatz = weich - (abstand > 0 ? abstand : 0);
      }
      var wert = zusatz > 0.1 ? 'translateY(' + zusatz.toFixed(1) + 'px)' : '';
      if (wert !== d.zuletzt) {

        if (!d.frei) { d.frei = true; d.el.style.transitionProperty = 'opacity, color'; }
        d.zuletzt = wert;
        d.el.style.transform = wert;
      }
    }
  }

  function anstossen() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { geplant = false; rechnen(); });
  }

  messen();
  rechnen();
  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', function () { messen(); rechnen(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { messen(); rechnen(); });
  }

  window.__testAnhalten = function (an) {
    if (an) { messen(); rechnen(); return; }
    for (var i = 0; i < daten.length; i++) {
      daten[i].el.style.transform = '';
      daten[i].zuletzt = '';
    }
    daten = [];
  };
})();



(function () {
  "use strict";

  var slots = [].slice.call(document.querySelectorAll('.om-bio-slot'));
  if (!slots.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var FENSTER = 14;

  var einspaltig = false;

  function zerlegen(el) {
    var liste = [];
    (function lauf(knoten) {
      var kinder = [].slice.call(knoten.childNodes);
      for (var n = 0; n < kinder.length; n++) {
        var k = kinder[n];
        if (k.nodeType === 3) {
          var roh = k.nodeValue;
          var frag = document.createDocumentFragment();
          for (var i = 0; i < roh.length; i++) {
            var c = roh.charAt(i);
            if (c === ' ' || c === '\u00A0' || c === '\n' || c === '\t') {
              frag.appendChild(document.createTextNode(c));
              continue;
            }
            var sp = document.createElement('span');
            sp.className = 'z';
            sp.textContent = c;
            frag.appendChild(sp);
            liste.push(sp);
          }
          knoten.replaceChild(frag, k);
        } else if (k.nodeType === 1) {
          lauf(k);
        }
      }
    })(el);
    return liste;
  }

  var posten = slots.map(function (slot) {
    var text = slot.querySelector('.om-bio-text');
    var z = text ? zerlegen(text) : [];

    var unter = text ? text.querySelector('.om-unterstrich') : null;
    var abIndex = -1;
    if (unter) {
      var erstes = unter.querySelector('span.z');
      abIndex = erstes ? z.indexOf(erstes) : -1;
      if (abIndex < 0) unter = null;
    }
    return {
      slot: slot, text: text, z: z, unter: unter, unterAb: abIndex,
      gezogen: false, klebe: 0, hoehe: 0, lo: 0, hi: -1
    };
  }).filter(function (p) { return p.z.length; });
  if (!posten.length) return;

  function strichSetzen(p, an) {
    if (!p.unter || p.gezogen === an) return;
    p.gezogen = an;
    p.unter.classList.toggle('is-gezogen', an);
  }

  function dokTop(el) {
    var y = 0;
    for (var n = el; n; n = n.offsetParent) { y += n.offsetTop; }
    return y;
  }

  function klebeElement(text) {
    if (getComputedStyle(text).position === 'sticky') return text;
    var el = text.parentNode;
    if (el && getComputedStyle(el).position === 'sticky') return el;
    return null;
  }
  function messen() {
    einspaltig = !klebeElement(posten[0].text);
    posten.forEach(function (p) {
      var ke = klebeElement(p.text) || p.text;
      p.klebe = parseFloat(getComputedStyle(ke).top) || 0;

      p.hoehe = ke.getBoundingClientRect().height;
      p.dok = dokTop(p.slot);
      p.schacht = p.slot.offsetHeight;
    });
  }

  function fenster(p, lo, hi) {
    lo = lo < 0 ? 0 : lo;
    hi = hi > p.z.length - 1 ? p.z.length - 1 : hi;
    if (lo > hi) { lo = 0; hi = -1; }
    if (lo === p.lo && hi === p.hi) return;
    var i;
    for (i = p.lo; i <= p.hi; i++) {
      if (i < lo || i > hi) p.z[i].classList.remove('is-hot');
    }
    for (i = lo; i <= hi; i++) {
      if (i < p.lo || i > p.hi) p.z[i].classList.add('is-hot');
    }
    p.lo = lo; p.hi = hi;
  }

  function rechnen() {
    var y = window.pageYOffset;
    for (var k = 0; k < posten.length; k++) {
      var p = posten[k];
      var oben = p.dok - y;
      if (einspaltig) {

        fenster(p, 0, -1);
        strichSetzen(p, oben < window.innerHeight * 0.55);
        continue;
      }
      var weg = p.schacht - p.hoehe;
      var t = weg > 0 ? (p.klebe - oben) / weg : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;

      var front = Math.floor(t * (p.z.length + 2 * FENSTER)) - FENSTER;
      fenster(p, front - FENSTER + 1, front);

      strichSetzen(p, front >= p.unterAb);
    }
  }

  var geplant = false;
  function anstossen() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { geplant = false; rechnen(); });
  }

  messen();
  rechnen();
  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', function () { messen(); rechnen(); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { messen(); rechnen(); }); }

  var welleAn = true;
  window.__testWelle = function (an) {
    welleAn = an;
    if (an) { rechnen(); return; }
    for (var i = 0; i < posten.length; i++) { fenster(posten[i], 0, -1); }
  };
  var rechnenRoh = rechnen;
  rechnen = function () { if (welleAn) rechnenRoh(); };
})();



(function () {
  "use strict";

  var keys = [].slice.call(document.querySelectorAll('.om-bio-key'));
  if (!keys.length || !('IntersectionObserver' in window)) return;
  var drin = keys.map(function () { return false; });

  function aktualisieren() {
    var aktiv = -1;
    for (var i = 0; i < keys.length; i++) { if (drin[i]) aktiv = i; }
    for (var j = 0; j < keys.length; j++) {
      keys[j].classList.toggle('is-current', j === aktiv);
    }
  }

  function melden(entries) {
    entries.forEach(function (e) {
      drin[keys.indexOf(e.target)] = e.isIntersecting;
    });
    aktualisieren();
  }

  var beobachter = [];
  function bauen() {
    beobachter.forEach(function (o) { o.disconnect(); });
    beobachter = [];
    var vh = window.innerHeight;
    keys.forEach(function (k) {

      var park = parseFloat(getComputedStyle(k).top);
      if (isNaN(park)) {
        park = parseFloat(getComputedStyle(k.parentNode).top) || 0;
      }

      var LUFT = 6;
      var linie = Math.min(vh * 0.9, park + LUFT);
      var unten = Math.max(0, Math.round(vh - linie));
      var o = new IntersectionObserver(melden, {
        rootMargin: '0px 0px -' + unten + 'px 0px', threshold: 0
      });
      o.observe(k);
      beobachter.push(o);
    });
  }
  bauen();
  window.addEventListener('resize', bauen);

  window.addEventListener('om:bio-top', bauen);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(bauen); }
})();



(function () {
  "use strict";

  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  function zeige(el) {
    el.classList.add('is-in');
    ioZeitpunkt.unobserve(el);
    ioSicher.unobserve(el);
  }
  var ioZeitpunkt = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) zeige(e.target); });
  }, { threshold: 0, rootMargin: '0px 0px -28% 0px' });
  var ioSicher = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) zeige(e.target); });
  }, { threshold: 0.85 });
  els.forEach(function (el) { ioZeitpunkt.observe(el); ioSicher.observe(el); });
})();



(function () {
  "use strict";

  if (window.innerWidth > 720) return;
  var halter = [].slice.call(document.querySelectorAll('.om-bio-halt'));
  var schaechte = [];
  halter.forEach(function (halt) {
    if (halt.classList.contains('om-bio-halt--label')) return;
    var schacht = halt.nextElementSibling;
    if (!schacht || !schacht.classList.contains('om-bio-slot')) return;
    var block = document.createElement('div');
    block.className = 'om-bio-block';
    while (schacht.firstChild) block.appendChild(schacht.firstChild);
    block.insertBefore(halt.firstElementChild, block.firstChild);
    halt.remove();
    schacht.appendChild(block);
    schaechte.push(schacht);
  });

  var label = document.querySelector('.om-bio-halt--label');
  if (label && schaechte.length) {
    var auftakt = document.createElement('div');
    auftakt.className = 'om-bio-auftakt';
    label.parentNode.insertBefore(auftakt, label);

    var schleier = document.createElement('div');
    schleier.className = 'om-bio-schleier';
    schleier.setAttribute('aria-hidden', 'true');
    auftakt.appendChild(schleier);
    auftakt.appendChild(label);
    schaechte.forEach(function (s) { auftakt.appendChild(s); });
  }
})();



(function () {
  "use strict";

  var cn = document.getElementById('constellation');
  if (!cn) return;
  cn.classList.add('is-paused');

  var panel = document.querySelector('.om-section-wrap');
  if (!panel || !('IntersectionObserver' in window)) {
    cn.classList.remove('is-paused');
    return;
  }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { cn.classList.toggle('is-paused', !e.isIntersecting); });
  }, { rootMargin: '20% 0px' }).observe(panel);
})();



(function () {
  "use strict";

  var cn = document.getElementById('constellation');
  if (!cn) return;
  var svg = cn.querySelector('svg');
  var feld = cn.querySelector('.cn-plexus');
  if (!svg || !feld) return;
  if (window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var spaeter = [];

  var knoten = [];
  [].forEach.call(svg.children, function (el) {
    if (!el.classList || !el.classList.contains('cn-track')) return;
    var ikon = el.querySelector('.cn-icon');
    if (ikon && ikon.parentNode) knoten.push({ el: ikon.parentNode });
  });
  if (knoten.length < 2) return;

  var gast = document.getElementById('guestOrb');
  if (gast) {
    knoten.push({
      el: gast,
      ox: +gast.getAttribute('cx') || 0,
      oy: +gast.getAttribute('cy') || 0,
      gilt: function () { return gast.classList.contains('is-in'); }
    });
  }

  var mitte = document.querySelector('.om-mitte');
  var mitteHuelle = document.querySelector('.om-mitte-huelle');
  if (mitte) {
    knoten.push({
      el: mitte, schirm: true, gilt: function () {

        return !mitteHuelle ||
          parseFloat(getComputedStyle(mitteHuelle).opacity) > 0.5;
      }
    });
  }

  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    var zeiger = {
      el: null, schirm: true, gilt: function () {

        return !!zeiger.huelle && zeiger.huelle.classList.contains('is-da');
      }
    };
    knoten.push(zeiger);
    spaeter.push(function () {
      zeiger.el = document.querySelector('.om-cursor-punkt');
      zeiger.huelle = zeiger.el && zeiger.el.parentNode;
    });
  }

  var flug = {
    el: null, schirm: true, gilt: function () {
      return !!flug.el && flug.el.classList.contains('is-fliegend');
    }
  };
  knoten.push(flug);
  spaeter.push(function () { flug.el = document.querySelector('.om-flydot'); });

  var N = knoten.length;

  var WEITE = 320;
  var STAERKSTE = 0.5;

  var linien = [];
  for (var i = 0, paare = N * (N - 1) / 2; i < paare; i++) {
    var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('opacity', '0');
    feld.appendChild(l);
    linien.push({ el: l, deckung: 0 });
  }

  var x = new Array(N), y = new Array(N);

  function messen() {
    var grund = feld.getCTM();
    if (!grund) return false;
    var zurueck = grund.inverse();

    var schirm;
    for (var i = 0; i < N; i++) {
      var k = knoten[i];

      x[i] = NaN;
      if (k.gilt && !k.gilt()) continue;
      if (k.schirm) {
        if (schirm === undefined) schirm = feld.getScreenCTM();
        if (!schirm) continue;
        var r = k.el.getBoundingClientRect();
        if (!r.width && !r.height) continue;

        var px = r.left + r.width / 2 - schirm.e;
        var py = r.top + r.height / 2 - schirm.f;
        var det = schirm.a * schirm.d - schirm.b * schirm.c;
        if (!det) continue;
        x[i] = (schirm.d * px - schirm.c * py) / det;
        y[i] = (schirm.a * py - schirm.b * px) / det;
      } else {

        var m = k.el.getCTM();
        if (!m) continue;
        var p = zurueck.multiply(m);

        var ox = k.ox || 0, oy = k.oy || 0;
        x[i] = p.a * ox + p.c * oy + p.e;
        y[i] = p.b * ox + p.d * oy + p.f;
      }
    }
    return true;
  }

  function stellen(s, ax, ay, bx, by, deckung) {
    var el = s.el;
    el.setAttribute('x1', ax.toFixed(1)); el.setAttribute('y1', ay.toFixed(1));
    el.setAttribute('x2', bx.toFixed(1)); el.setAttribute('y2', by.toFixed(1));
    if (deckung !== s.deckung) { el.setAttribute('opacity', deckung); s.deckung = deckung; }
  }
  function loeschen(von) {
    for (var i = von; i < linien.length; i++) {
      if (linien[i].deckung !== 0) {
        linien[i].el.setAttribute('opacity', '0');
        linien[i].deckung = 0;
      }
    }
  }

  function zeichnen() {
    var n = 0, grenze = WEITE * WEITE;
    for (var a = 0; a < N; a++) {
      if (x[a] !== x[a]) continue;
      for (var b = a + 1; b < N; b++) {
        if (x[b] !== x[b]) continue;
        var dx = x[b] - x[a], dy = y[b] - y[a];
        var d2 = dx * dx + dy * dy;

        if (d2 < 16 || d2 >= grenze) continue;

        var t = 1 - Math.sqrt(d2) / WEITE;
        stellen(linien[n++], x[a], y[a], x[b], y[b],
          +(t * Math.sqrt(t) * STAERKSTE).toFixed(3));
      }
    }
    loeschen(n);
  }

  var TAKT = (window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches) ? 2 : 1;
  var laeuft = false, takt = 0;
  function bild() {
    if (!laeuft) return;
    if ((takt++ % TAKT) === 0 && messen()) zeichnen();
    requestAnimationFrame(bild);
  }

  function pruefen() {
    var soll = !cn.classList.contains('is-paused');
    if (soll === laeuft) return;
    laeuft = soll;
    if (laeuft) requestAnimationFrame(bild);
    else loeschen(0);
  }
  if (window.MutationObserver) {
    new MutationObserver(pruefen).observe(cn, { attributes: true, attributeFilter: ['class'] });
  }

  window.setTimeout(function () {
    for (var i = 0; i < spaeter.length; i++) spaeter[i]();
  }, 0);
  pruefen();
})();



(function () {
  "use strict";

  var AUFL_HELL = 0.83;
  var AUFL_DUNKEL = 0.005;
  var auflWert = {};
  var auflWartet = {};

  function auflKanal(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function auflKontrast(a, b) {
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function auflMessen(quelle, fertig) {
    if (auflWert.hasOwnProperty(quelle)) { fertig(auflWert[quelle]); return; }
    if (auflWartet[quelle]) { auflWartet[quelle].push(fertig); return; }
    auflWartet[quelle] = [fertig];
    var melden = function (dunkel) {
      auflWert[quelle] = dunkel;
      var liste = auflWartet[quelle];
      delete auflWartet[quelle];
      for (var i = 0; i < liste.length; i++) liste[i](dunkel);
    };
    var bild = new Image();

    bild.decoding = 'async';
    bild.onerror = function () { melden(false); };
    bild.onload = function () {
      try {
        var bx = Math.max(1, Math.round(bild.naturalWidth * 0.16));
        var by = Math.max(1, Math.round(bild.naturalHeight * 0.15));
        var flaeche = document.createElement('canvas');

        flaeche.width = 24; flaeche.height = 8;
        var stift = flaeche.getContext('2d', { willReadFrequently: false });
        stift.drawImage(bild,
          Math.round(bild.naturalWidth * 0.02),
          Math.round(bild.naturalHeight * 0.84),
          bx, by, 0, 0, 24, 8);
        var d = stift.getImageData(0, 0, 24, 8).data;
        var summe = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
          summe += 0.2126 * auflKanal(d[i]) +
            0.7152 * auflKanal(d[i + 1]) +
            0.0722 * auflKanal(d[i + 2]);
          n++;
        }
        var L = n ? summe / n : 0;
        melden(auflKontrast(AUFL_DUNKEL, L) > auflKontrast(AUFL_HELL, L) * 1.1);
      } catch (fehler) {

        melden(false);
      }
    };
    bild.src = quelle;
  }

  function auflTon(el, quelle) {
    if (!el) return;
    if (!quelle) { el.classList.remove('is-aufl-dunkel'); return; }
    el.omAuflQuelle = quelle;
    auflMessen(quelle, function (dunkel) {
      if (el.omAuflQuelle !== quelle) return;
      el.classList.toggle('is-aufl-dunkel', dunkel);
    });
  }

  var FALLBACK_PROJEKTE = [
  {
    "projekt": "Grabz — FMCG Gourmet Snack Brand Identity & Packaging",
    "rolle": "Buttercup Advertising Studio",
    "award": "FMCG Brand Strategy & Packaging Design",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/grabz.html",
    "bilder": [
      {
        "datei": "images/gravity/work-01.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true,
        "ki": true
      },
      {
        "datei": "images/gravity/work-06.jpg",
        "w": 1200,
        "h": 900
      }
    ]
  },
  {
    "projekt": "Beatitude — Luxury Saree & Handcrafted Brand Architecture",
    "rolle": "Buttercup Advertising Studio",
    "award": "Luxury Fashion Identity & E-Commerce Direction",
    "fotocredit": null,
    "heureka": false,
    "groesse": 2.6,
    "link": "projects/beatitude.html",
    "bilder": [
      {
        "datei": "images/gravity/work-02.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true,
        "ki": true
      }
    ]
  },
  {
    "projekt": "Coin Dhan — Next-Gen FinTech Trading Ecosystem & UI/UX",
    "rolle": "Buttercup Advertising Studio",
    "award": "FinTech Brand Identity & Mobile App UX",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/coin-dhan.html",
    "bilder": [
      {
        "datei": "images/gravity/work-03.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-10.jpg",
        "w": 1024,
        "h": 1024
      }
    ]
  },
  {
    "projekt": "Vilasa Ambrosia — Ultra-Luxury Villa Architecture & Real Estate Branding",
    "rolle": "Buttercup Advertising Studio",
    "award": "Real Estate Monograph & Spatial Identity",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/studio-verra.html",
    "bilder": [
      {
        "datei": "images/gravity/work-04.jpg",
        "w": 1376,
        "h": 768,
        "orbit": true
      }
    ]
  },
  {
    "projekt": "Polka Tots — Organic Baby Care & Mindful Family Lifestyle",
    "rolle": "Buttercup Advertising Studio",
    "award": "Sustainable D2C Packaging & Brand Architecture",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/polka-tots.html",
    "bilder": [
      {
        "datei": "images/gravity/work-05.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-01.jpg",
        "w": 1200,
        "h": 900
      }
    ]
  },
  {
    "projekt": "Tastycrafts — Artisanal Baking Essentials & Confectionery Packaging",
    "rolle": "Buttercup Advertising Studio",
    "award": "Artisanal Food Packaging & Retail Merchandising",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/atlas-bloom.html",
    "bilder": [
      {
        "datei": "images/gravity/work-06.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-01.jpg",
        "w": 1200,
        "h": 900
      }
    ]
  },
  {
    "projekt": "Senal Diamonds — Haute Joaillerie & Solitaire Brand Identity",
    "rolle": "Buttercup Advertising Studio",
    "award": "Haute Joaillerie Identity & Luxury Packaging",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/senal-diamonds.html",
    "bilder": [
      {
        "datei": "images/gravity/work-07.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true
      }
    ]
  },
  {
    "projekt": "Parishram — Bespoke Corporate Executive Gifting & Luxury Hampers",
    "rolle": "Buttercup Advertising Studio",
    "award": "B2B Luxury Gifting & Box Architecture",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/cinder-ash.html",
    "bilder": [
      {
        "datei": "images/gravity/work-08.jpg",
        "w": 1200,
        "h": 900,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-07.jpg",
        "w": 1200,
        "h": 900
      }
    ]
  },
  {
    "projekt": "YMCA International — Sports, Recreation & Resort Brand Identity",
    "rolle": "Buttercup Advertising Studio",
    "award": "Hospitality Brand Narrative & Wayfinding Design",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/kindred-haus.html",
    "bilder": [
      {
        "datei": "images/gravity/work-09.jpg",
        "w": 1024,
        "h": 1024,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-04.jpg",
        "w": 1376,
        "h": 768
      }
    ]
  },
  {
    "projekt": "Aegis Medical — Advanced Biotech & Healthcare Visual Ecosystem",
    "rolle": "Buttercup Advertising Studio",
    "award": "Healthcare Innovation & Medical Technology Identity",
    "fotocredit": null,
    "heureka": false,
    "groesse": 1.28,
    "link": "projects/velvet-orbit.html",
    "bilder": [
      {
        "datei": "images/gravity/work-10.jpg",
        "w": 1024,
        "h": 1024,
        "orbit": true
      },
      {
        "datei": "images/gravity/work-03.jpg",
        "w": 1200,
        "h": 900
      }
    ]
  }
];

  function projekteHolen(dann) {
    if (location.protocol === 'file:') {
      var lokal = projektePruefen(FALLBACK_PROJEKTE);
      if (lokal.length) dann(lokal);
      return;
    }
    fetch('images/gravity/projekte.json?v=12', { cache: 'no-cache' })
      .then(function (a) {
        if (!a.ok) throw new Error('HTTP ' + a.status);
        return a.json();
      })
      .then(function (liste) {
        var geprueft = projektePruefen(liste);
        if (geprueft.length) dann(geprueft);
        else dann(projektePruefen(FALLBACK_PROJEKTE));
      })
      .catch(function () {
        var ersatz = projektePruefen(FALLBACK_PROJEKTE);
        if (ersatz.length) dann(ersatz);
      });
  }

  function projektePruefen(liste) {
    if (!Array.isArray(liste)) {
      console.error('projekte.json muss eine Liste sein.');
      return [];
    }
    var karten = [];
    liste.forEach(function (p, i) {
      var wo = 'projekte.json, Eintrag ' + (i + 1);
      var fehlt = [];
      if (!p || typeof p !== 'object') { fehlt.push('Datensatz'); p = {}; }
      if (!text(p.projekt)) fehlt.push('projekt');
      if (!text(p.rolle)) fehlt.push('rolle');
      var bilder = Array.isArray(p.bilder) && p.bilder.length ? p.bilder : [p];
      if (!text(bilder[0] && bilder[0].datei)) fehlt.push('datei');
      if (fehlt.length) {
        console.warn(wo + ' (' + (text(p.projekt) || 'ohne Namen') + '): ' +
          fehlt.join(', ') + ' fehlt - Projekt wird nicht gezeigt.');
        return;
      }

      var satz = [];
      bilder.forEach(function (b, k) {
        if (!b || typeof b !== 'object' || !text(b.datei)) {
          console.warn(wo + ', Bild ' + (k + 1) + ': datei fehlt - uebersprungen.');
          return;
        }
        if (!(b.w > 0) || !(b.h > 0)) {
          console.warn(wo + ', Bild ' + (k + 1) + ' (' + b.datei +
            '): w/h fehlen - ohne die echten Bildmasse erscheint ' +
            'die Karte quadratisch.');
        }
        satz.push({
          src: text(b.datei),
          w: b.w > 0 ? b.w : 2048,
          h: b.h > 0 ? b.h : 2048,

          ki: (b.ki === undefined ? p.ki === true : b.ki === true),

          loop: text(b.loop),
          video: text(b.video),

          bu: text(b.bu),

          ton: b.ton !== false,
          orbit: b.orbit === true
        });
      });
      if (!satz.length) return;

      var imOrbit = satz.filter(function (b) { return b.orbit; });
      if (!imOrbit.length) imOrbit = [satz[0]];

      imOrbit.forEach(function (b) {
        karten.push({
          src: b.src, w: b.w, h: b.h, ki: b.ki, loop: b.loop, video: b.video,
          ton: b.ton,
          projekt: text(p.projekt),
          rolle: text(p.rolle),
          award: text(p.award),
          fotocredit: text(p.fotocredit),

          groesse: (typeof p.groesse === 'number' && p.groesse > 0) ? p.groesse : 1,

          heureka: p.heureka !== false,

          link: text(p.link),

          platzhalter: p.platzhalter === true,

          satz: satz,
          satzAb: satz.indexOf(b)
        });
      });
    });
    return karten;
  }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }

  function maskieren(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var NAMEN = /(Buttercup|Sneha Vakta Shah|BAS|Ahmedabad)/g;
  function namenSetzen(s) {
    return maskieren(s).replace(NAMEN, '<span class="om-marke">$1</span>');
  }
  function buBauen(p) {
    var h = '<b>' + namenSetzen(p.projekt) + '</b>' +
      '<span class="om-bu-zeile">' + namenSetzen(p.rolle) + '</span>';
    if (p.award) h += '<span class="om-bu-zeile">' + namenSetzen(p.award) + '</span>';
    if (p.fotocredit) h += '<span class="om-bu-credit">' + namenSetzen(p.fotocredit) + '</span>';
    return h;
  }

  function altText(p) { return p.projekt + '. ' + p.rolle; }

  projekteHolen(starten);

  function starten(IMAGES) {
    var layerBack = document.getElementById('orbitBack');
    var layerFront = document.getElementById('orbitFront');
    var worldBack = document.getElementById('orbitWorldBack');
    var worldFront = document.getElementById('orbitWorldFront');
    var scrollWrap = document.getElementById('boldScroll');
    var maskSection = document.getElementById('boldSection');
    if (!layerBack || !layerFront || !worldBack || !worldFront || !scrollWrap) return;

    function maskeOffen() {
      var mm = /circle\(([\d.]+)px/.exec(
        maskSection ? maskSection.style.clipPath : '');
      return !!mm && parseFloat(mm[1]) <= 0.5;
    }

    function nachlaufAnhalten() {
      if (window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches) return;
      if (window.lenis && window.lenis.isScrolling === 'smooth') return;
      if (window.lenis && window.lenis.scrollTo) {
        window.lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      }
      window.scrollTo(0, window.scrollY);
    }

    var Z_KREIS = 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2' +
      'C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z';
    var Z_LAUTSPRECHER = 'M9.63432 4.36561L6.46863 7.5313C6.29568 7.70425 6.2092 7.79073 6.10828 7.85257' +
      'C6.01881 7.9074 5.92127 7.9478 5.81923 7.9723C5.70414 7.99993 5.58185 7.99993 5.33726 7.99993' +
      'H3.6C3.03995 7.99993 2.75992 7.99993 2.54601 8.10892C2.35785 8.20479 2.20487 8.35777 2.10899 8.54594' +
      'C2 8.75985 2 9.03987 2 9.59993V14.3999C2 14.96 2 15.24 2.10899 15.4539' +
      'C2.20487 15.6421 2.35785 15.7951 2.54601 15.8909C2.75992 15.9999 3.03995 15.9999 3.6 15.9999' +
      'H5.33726C5.58185 15.9999 5.70414 15.9999 5.81923 16.0276C5.92127 16.0521 6.01881 16.0925 6.10828 16.1473' +
      'C6.2092 16.2091 6.29568 16.2956 6.46863 16.4686L9.63431 19.6342C10.0627 20.0626 10.2769 20.2768 10.4608 20.2913' +
      'C10.6203 20.3038 10.7763 20.2392 10.8802 20.1175C11 19.9773 11 19.6744 11 19.0686V4.9313' +
      'C11 4.32548 11 4.02257 10.8802 3.88231C10.7763 3.76061 10.6203 3.69602 10.4608 3.70858' +
      'C10.2769 3.72305 10.0627 3.93724 9.63432 4.36561Z';

    var kugelFilmeLaufen = false;
    var DIA_STAND = 4200;
    var DIA_BLENDE = 800;

    function bildkarteBauen(bild, i, was) {
      was = was || {};
      var figur = null;
      if (was.figurKlasse) {
        figur = document.createElement('figure');
        figur.className = was.figurKlasse;
      }
      var rahmen = document.createElement('div');
      rahmen.className = (was.rahmenKlasse || 'om-bild-rahmen') +
        (bild.ki ? ' is-ki' : '') +
        (bild.heureka ? ' is-heureka' : '') +
        (bild.platzhalter ? ' is-platzhalter' : '') +
        (bild.satz && bild.satz.length > 1 ? ' hat-dia' : '');
      var img = document.createElement('img');
      img.src = bild.src;

      img.alt = altText(bild);
      img.draggable = false;
      img.loading = (was.frueh && i < was.frueh) ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (was.masse) { img.width = bild.w; img.height = bild.h; }
      rahmen.appendChild(img);

      if (bild.heureka) auflTon(rahmen, bild.src);

      var schatten = null;
      if (was.schatten) {
        schatten = document.createElement('div');
        schatten.className = 'orbit-shade';
        rahmen.appendChild(schatten);
      }

      var filme = was.ohneFilm ? null : filmeBauen(rahmen, bild, was.filmSammler);

      var film = filme ? (filme.eigen || filme.erster) : null;
      var leiste = was.ohneLeiste ? null : tastenBauen(rahmen, film, bild.link);

      if (figur) figur.appendChild(rahmen);
      var bu = null;
      if (was.bu) {
        bu = document.createElement('figcaption');
        bu.className = 'om-bu';
        bu.innerHTML = buBauen(bild);
        (figur || rahmen).appendChild(bu);
      }
      return {
        figur: figur, rahmen: rahmen, img: img, schatten: schatten,
        film: film, filme: filme,
        leiste: leiste, bu: bu, daten: bild
      };
    }

    var filmLoops = [];
    function filmElement(quelle, schleife, sofort) {
      var v = document.createElement('video');
      v.src = quelle;

      v.loop = true;
      v.muted = schleife; v.defaultMuted = schleife;
      v.controls = false;
      v.setAttribute('playsinline', '');
      v.setAttribute('disablepictureinpicture', '');
      if (schleife) v.setAttribute('muted', '');

      v.preload = (schleife && sofort) ? 'auto' : (schleife ? 'metadata' : 'none');
      return v;
    }

    function svgHuelle(inhalt) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
        ' aria-hidden="true">' + inhalt + '</svg>';
    }

    function zeichenAbspielen() {
      return svgHuelle(
        '<g class="g-play"><path d="' + Z_KREIS + '"/>' +
        '<path d="M9.5 8.96533C9.5 8.48805 9.5 8.24941 9.59974 8.11618C9.68666 8.00007 9.81971 7.92744 9.96438 7.9171' +
        'C10.1304 7.90525 10.3311 8.03429 10.7326 8.29239L15.4532 11.3271C15.8016 11.551 15.9758 11.663 16.0359 11.8054' +
        'C16.0885 11.9298 16.0885 12.0702 16.0359 12.1946C15.9758 12.337 15.8016 12.449 15.4532 12.6729' +
        'L10.7326 15.7076C10.3311 15.9657 10.1304 16.0948 9.96438 16.0829C9.81971 16.0726 9.68666 15.9999 9.59974 15.8838' +
        'C9.5 15.7506 9.5 15.512 9.5 15.0347V8.96533Z"/></g>' +
        '<g class="g-pause"><path d="M9.5 15V9M14.5 15V9M22 12C22 17.5228 17.5228 22 12 22' +
        'C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"/></g>');
    }

    function zeichenTon() {
      return svgHuelle(
        '<g class="g-laut">' +
        '<path d="M19.7479 4.99993C21.1652 6.97016 22 9.38756 22 11.9999' +
        'C22 14.6123 21.1652 17.0297 19.7479 18.9999M15.7453 7.99993' +
        'C16.5362 9.13376 17 10.5127 17 11.9999C17 13.4872 16.5362 14.8661 15.7453 15.9999' +
        'M' + Z_LAUTSPRECHER.slice(1) + '"/></g>' +
        '<g class="g-stumm"><path d="M22 8.99993L16 14.9999M16 8.99993L22 14.9999' +
        'M' + Z_LAUTSPRECHER.slice(1) + '"/></g>');
    }

    function zeichenLink() {
      return svgHuelle('<path d="M21 9L21 3M21 3H15M21 3L13 11M10 5H7.8' +
        'C6.11984 5 5.27976 5 4.63803 5.32698C4.07354 5.6146 3.6146 6.07354 3.32698 6.63803' +
        'C3 7.27976 3 8.11984 3 9.8V16.2C3 17.8802 3 18.7202 3.32698 19.362' +
        'C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21' +
        'H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362' +
        'C19 18.7202 19 17.8802 19 16.2V14"/>');
    }

    function tastenBauen(hinein, satz, link) {
      if (!satz && !link) return null;
      var leiste = document.createElement('div');
      leiste.className = 'om-film-tasten';
      function taste(klasse, zeichen, tun) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'om-film-taste ' + klasse;
        b.innerHTML = zeichen;
        b.addEventListener('click', function (e) {

          e.stopPropagation();
          tun();
        });
        leiste.appendChild(b);
        return b;
      }
      if (satz) {
        satz.leiste = leiste;
        satz.tasteLauf = taste('om-film-taste--film is-pause', zeichenAbspielen(),
          function () { filmLaufTaste(satz); });

        if (satz.ton) {
          satz.tasteTon = taste('om-film-taste--film is-stumm', zeichenTon(),
            function () { filmTon(satz); });
        }
      }
      if (link) {

        var a = document.createElement('a');
        a.className = 'om-film-taste om-film-taste--link';
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', 'Projekt online ansehen');
        a.innerHTML = zeichenLink();
        a.addEventListener('click', function (e) { e.stopPropagation(); });
        leiste.appendChild(a);
      }
      if (hinein) hinein.appendChild(leiste);
      return leiste;
    }

    function filmKasten(rahmen, quelle, sichtbar, sammler) {
      var kasten = document.createElement('div');
      kasten.className = 'orbit-film';

      if (sichtbar) kasten.classList.add('is-dia');
      var loop = filmElement(quelle.loop, true, sichtbar);
      loop.className = 'film-loop';
      var voll = filmElement(quelle.video || quelle.loop, false);
      voll.className = 'film-voll';
      kasten.appendChild(loop);
      kasten.appendChild(voll);
      rahmen.appendChild(kasten);

      if (sammler && sichtbar) sammler.push(loop);
      var satz = {
        kasten: kasten, loop: loop, voll: voll, an: false,
        ton: quelle.ton !== false
      };

      ['play', 'pause'].forEach(function (art) {
        voll.addEventListener(art, function () { filmTastenZeichnen(satz); });
        loop.addEventListener(art, function () { filmTastenZeichnen(satz); });
      });
      return satz;
    }

    function filmeBauen(rahmen, bild, sammler) {
      if (!bild) return null;
      var satz = bild.satz && bild.satz.length ? bild.satz : (bild.loop ? [bild] : null);
      if (!satz) return null;
      var proIndex = {}, eigen = null, erster = null;
      for (var i = 0; i < satz.length; i++) {
        var q = satz[i];
        if (!q.loop) continue;

        var istEigener = !!bild.loop && q.loop === bild.loop;
        var s = filmKasten(rahmen, q, istEigener, sammler);
        proIndex[i] = s;
        if (!erster) erster = s;
        if (istEigener && !eigen) eigen = s;
      }
      if (!erster) return null;
      return { eigen: eigen, erster: erster, proIndex: proIndex };
    }

    function filmSpur(satz) { return satz.gross ? satz.voll : satz.loop; }

    function filmLaufTaste(satz) {
      var v = filmSpur(satz);
      if (v.paused) {
        var p = v.play(); if (p && p['catch']) p['catch'](function () { });
        diaFortsetzen();
      } else {
        v.pause();
        diaAnhalten();
      }
      filmTastenZeichnen(satz);
    }

    function filmTon(satz) {

      satz.an = !satz.an;
      satz.voll.muted = !satz.an;
      if (satz.an) {
        satz.voll.volume = 1;
        var p = satz.voll.play();
        if (p && p['catch']) p['catch'](function () { satz.voll.muted = true; });
      }

      if (satz.an) diaAnhalten(); else diaFortsetzen();
      filmTastenZeichnen(satz);
    }

    function filmTastenZeichnen(satz) {

      if (!satz || !satz.tasteLauf) return;
      var laeuft = !filmSpur(satz).paused;
      satz.tasteLauf.classList.toggle('is-pause', laeuft);
      satz.tasteLauf.classList.toggle('is-play', !laeuft);
      satz.tasteLauf.setAttribute('aria-label', laeuft ? 'Film anhalten' : 'Film abspielen');
      if (satz.tasteTon) {
        satz.tasteTon.classList.toggle('is-laut', satz.an);
        satz.tasteTon.classList.toggle('is-stumm', !satz.an);
        satz.tasteTon.setAttribute('aria-label', satz.an ? 'Ton ausschalten' : 'Ton einschalten');
      }
    }

    function filmSatzLauf(satz, an, gleich) {
      if (!satz) return;
      an = !!an;

      if (satz.leiste) satz.leiste.classList.toggle('is-film', an);
      satz.gross = an;

      if (!an) {

        satz.an = false;

        satz.voll.pause(); satz.voll.muted = true;

        var zuruecksetzen = function () {

          if (satz.gross) return;
          satz.kasten.classList.remove('is-voll');
          try { satz.voll.currentTime = 0; } catch (err) { }
          filmLauf(satz.loop, false);
          filmTastenZeichnen(satz);
        };
        if (gleich === false) window.setTimeout(zuruecksetzen, DIA_BLENDE);
        else zuruecksetzen();
        return;
      }

      var v = satz.voll;
      v.loop = true;
      v.muted = !satz.an;
      var uebernehmen = function () {
        if (!satz.gross) return;
        satz.kasten.classList.add('is-voll');
        filmLauf(satz.loop, false);
        filmTastenZeichnen(satz);
      };
      if (v.readyState >= 3) {
        filmLauf(v, true);
        uebernehmen();
      } else {
        filmLauf(satz.loop, true);
        var einmal = function () {
          v.removeEventListener('canplay', einmal);
          if (!satz.gross) return;
          filmLauf(v, true);
          uebernehmen();
        };
        v.addEventListener('canplay', einmal);
        filmLauf(v, true);
      }
      filmTastenZeichnen(satz);
    }

    function filmDarf() {
      return !window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function diaAnlegen(behaelter, daten, satz, ab, filme, auflage, bu) {
      if (!behaelter || !daten || !satz || satz.length < 2) return null;

      var lagen = document.createElement('div');
      lagen.className = 'dia-lagen';
      var unten = document.createElement('img');
      unten.className = 'dia-a';
      unten.alt = ''; unten.draggable = false;
      unten.src = daten.src;
      var oben = document.createElement('img');
      oben.className = 'dia-b';
      oben.alt = '';
      oben.draggable = false;
      lagen.appendChild(unten);
      lagen.appendChild(oben);
      behaelter.appendChild(lagen);

      var uhr = diaUhrLegen(bu, null);
      return {
        behaelter: behaelter, kasten: lagen, unten: unten, oben: oben, satz: satz,

        filme: filme || null,

        filmAn: (filme && filme.proIndex[ab || 0]) || null,
        i: ab || 0, uhr: null, laeuft: false, gen: 0,
        linie: uhr, auflage: auflage || null,

        obenAuf: false,

        eigenKi: behaelter.classList.contains('is-ki'),

        eigenQuelle: (satz && satz[ab || 0] && satz[ab || 0].src) || null
      };
    }

    function diaUhrLegen(bu, eigene) {
      if (!bu) return null;
      var uhr = bu.querySelector('.dia-uhr');
      if (uhr) return uhr;
      uhr = eigene;
      if (!uhr) {
        uhr = document.createElement('div');
        uhr.className = 'dia-uhr';
        uhr.setAttribute('aria-hidden', 'true');
        uhr.appendChild(document.createElement('i'));
      }
      var text = bu.querySelector('.om-bu');
      bu.insertBefore(uhr, text || bu.firstChild);
      return uhr;
    }

    function diaWeiter(z) {
      if (!z || !z.laeuft) return;

      var lauf = z.gen;
      var gilt = function () { return z.laeuft && z.gen === lauf; };
      var naechster = (z.i + 1) % z.satz.length;
      var bild = z.satz[naechster];

      var derFilm = z.filme ? z.filme.proIndex[naechster] : null;
      if (bild.loop && derFilm) {
        z.i = naechster;
        z.zu = null;
        punkteSetzen(z);
        z.behaelter.classList.toggle('is-ki', !!bild.ki);
        if (z.auflage) z.auflage.classList.toggle('is-ki', !!bild.ki);

        auflTon(z.behaelter, bild.src);
        if (z.auflage) auflTon(z.auflage, bild.src);
        var kb = z.behaelter.getBoundingClientRect();
        var passt = Math.abs((bild.w / bild.h) - (kb.width / kb.height)) > 0.06;

        if (z.filmAn && z.filmAn !== derFilm) {
          z.filmAn.kasten.classList.remove('is-dia');
          filmSatzLauf(z.filmAn, false, false);
        }
        z.filmAn = derFilm;
        derFilm.loop.classList.toggle('dia-passend', passt);
        derFilm.voll.classList.toggle('dia-passend', passt);
        derFilm.kasten.classList.add('is-dia');
        filmSatzLauf(derFilm, true);

        var vollFilm = derFilm.voll;
        vollFilm.loop = false;

        var stellen = function () {
          if (!gilt()) return;
          var d = (vollFilm.duration > 0 && isFinite(vollFilm.duration))
            ? vollFilm.duration * 1000
            : DIA_STAND + DIA_BLENDE;
          diaLinie(z, d);
          if (z.uhr) window.clearTimeout(z.uhr);
          z.uhr = window.setTimeout(function () { diaWeiter(z); }, d);
        };
        vollFilm.addEventListener('playing', stellen, { once: true });

        stellen();
        return;
      }

      var vomFilm = z.filmAn;
      if (vomFilm) z.filmAn = null;

      var ziel = vomFilm ? (z.obenAuf ? z.oben : z.unten)
        : (z.obenAuf ? z.unten : z.oben);
      var kasten = z.behaelter.getBoundingClientRect();
      var eigen = bild.w / bild.h, kastenV = kasten.width / kasten.height;

      ziel.classList.toggle('dia-passend', Math.abs(eigen - kastenV) > 0.06);
      ziel.src = bild.src;

      z.zu = naechster;

      var zeigen = function () {
        if (!gilt()) return;

        diaFahrt(ziel, !(z.i % 2), DIA_STAND + DIA_BLENDE);
        if (vomFilm) {

          vomFilm.kasten.classList.remove('is-dia');
          filmSatzLauf(vomFilm, false, false);
        } else {

          z.obenAuf = !z.obenAuf;
          z.oben.classList.toggle('is-da', z.obenAuf);
        }

        z.behaelter.classList.toggle('is-ki', !!bild.ki);
        if (z.auflage) z.auflage.classList.toggle('is-ki', !!bild.ki);

        auflTon(z.behaelter, bild.src);
        if (z.auflage) auflTon(z.auflage, bild.src);
        z.i = naechster;
        z.zu = null;
        punkteSetzen(z);
        diaLinie(z, DIA_STAND);
        z.uhr = window.setTimeout(function () { diaWeiter(z); }, DIA_STAND);
      };
      if (ziel.decode) ziel.decode().then(zeigen, zeigen);
      else if (ziel.complete) zeigen();
      else ziel.onload = zeigen;
    }

    function diaLinie(z, dauer) {
      if (!z || !z.linie) return;
      var b = z.linie.firstChild;
      b.style.transition = 'none';
      b.style.width = '0%';
      void b.offsetWidth;
      b.style.transition = 'width ' + Math.round(dauer) + 'ms linear';
      b.style.width = '100%';
    }

    var diaAktiv = null;

    function diaAnhalten() {
      var z = diaAktiv;
      if (!z || !z.uhr) return;
      window.clearTimeout(z.uhr); z.uhr = null;
      if (z.linie) {
        var b = z.linie.firstChild;
        var w = b.getBoundingClientRect().width;
        b.style.transition = 'none';
        b.style.width = Math.round(w) + 'px';
      }
    }

    function diaFortsetzen() {
      var z = diaAktiv;
      if (!z || !z.laeuft || z.uhr) return;
      diaLinie(z, DIA_STAND);
      z.uhr = window.setTimeout(function () { diaWeiter(z); }, DIA_STAND);
    }

    function diaFahrt(el, rein, dauer) {
      if (!el) return;
      if (el._fahrt) { try { el._fahrt.cancel(); } catch (err) { } el._fahrt = null; }
      if (!el.animate || !filmDarf()) return;
      var von = rein ? 1 : 1.06, bis = rein ? 1.06 : 1;
      el._fahrt = el.animate(
        [{ transform: 'scale(' + von + ')' }, { transform: 'scale(' + bis + ')' }],
        { duration: dauer, easing: 'linear', fill: 'forwards' });
    }
    function diaAn(z) {
      if (!z || z.laeuft) return;
      if (!filmDarf()) return;
      z.laeuft = true;
      z.gen++;
      z.zu = null;
      diaAktiv = z;
      punkteSetzen(z);
      if (z.linie) z.linie.classList.add('is-lauf');

      var start = z.satz[z.i];
      if (start && start.loop && z.filme && z.filme.proIndex[z.i]) {
        z.i = (z.i - 1 + z.satz.length) % z.satz.length;
        diaWeiter(z);
        return;
      }

      diaFahrt(z.obenAuf ? z.oben : z.unten, !(z.i % 2), DIA_STAND + DIA_BLENDE);

      diaLinie(z, DIA_STAND);
      if (z.uhr) window.clearTimeout(z.uhr);
      z.uhr = window.setTimeout(function () { diaWeiter(z); }, DIA_STAND);
    }
    function diaAus(z) {
      if (!z || !z.laeuft) return;
      z.laeuft = false;
      z.gen++;
      if (diaAktiv === z) diaAktiv = null;
      if (z.uhr) { window.clearTimeout(z.uhr); z.uhr = null; }

      z.oben.classList.remove('is-da');
      z.kasten.classList.remove('is-da');
      z.obenAuf = false;
      z.behaelter.classList.toggle('is-ki', z.eigenKi);
      if (z.auflage) z.auflage.classList.toggle('is-ki', z.eigenKi);

      auflTon(z.behaelter, z.eigenQuelle);
      if (z.auflage) auflTon(z.auflage, z.eigenQuelle);
      if (z.linie) {
        z.linie.classList.remove('is-lauf');
        z.linie.firstChild.style.transition = 'none';
        z.linie.firstChild.style.width = '0%';
      }
      if (z.filmAn) {
        z.filmAn.kasten.classList.remove('is-dia');
        filmSatzLauf(z.filmAn, false);
        z.filmAn = null;
      }

      if (z.filme && z.filme.eigen) {
        z.filme.eigen.kasten.classList.add('is-dia');
        z.filmAn = z.filme.eigen;

        if (kugelFilmeLaufen) filmLauf(z.filme.eigen.loop, true);
      }
    }

    function diaStarten(traeger, behaelter, filme, auflage, bu) {
      var d = traeger && traeger.daten;
      if (!d || !d.satz || d.satz.length < 2 || !behaelter) return;
      if (!traeger.dia) {
        traeger.dia = diaAnlegen(behaelter, d, d.satz, d.satzAb, filme, auflage, bu);
      } else if (traeger.dia.behaelter !== behaelter) {

        diaUmziehen(traeger.dia, behaelter);
      }
      if (!traeger.dia) return;
      if (bu) traeger.dia.linie = diaUhrLegen(bu, traeger.dia.linie);
      traeger.dia.kasten.classList.add('is-da');
      diaAn(traeger.dia);
    }

    function punkteSetzen(z) {
      if (!z || !z.behaelter) return;
      var feld = z.behaelter.querySelector('.dia-punkte');
      if (!feld) return;
      var k = feld.children;
      for (var i = 0; i < k.length; i++) {
        k[i].classList.toggle('is-da', i === z.i);
      }
    }
    function diaVonHand(traeger, richtung) {
      var z = traeger && traeger.dia;
      if (!z || !z.laeuft || !z.satz || z.satz.length < 2) return false;

      if (richtung > 0 && typeof z.zu === 'number') return true;
      if (z.uhr) { window.clearTimeout(z.uhr); z.uhr = null; }
      z.gen++;
      z.zu = null;

      var n = z.satz.length;
      if (richtung < 0) z.i = (z.i - 2 + 2 * n) % n;
      diaWeiter(z);
      return true;
    }

    function diaUmziehen(z, behaelter) {
      if (!z || !behaelter || z.behaelter === behaelter) return;
      behaelter.appendChild(z.kasten);
      z.behaelter = behaelter;
      z.eigenKi = behaelter.classList.contains('is-ki') || z.eigenKi;
    }

    function diaBeenden(traeger) {
      if (!traeger || !traeger.dia) return;

      if (traeger.dia.unten.getAttribute('src') !== traeger.daten.src) {
        traeger.dia.unten.src = traeger.daten.src;
        traeger.dia.unten.classList.remove('dia-passend');
      }
      [traeger.dia.unten, traeger.dia.oben].forEach(function (el) {
        if (el._fahrt) { try { el._fahrt.cancel(); } catch (err) { } el._fahrt = null; }
      });
      diaAus(traeger.dia);
      traeger.dia.i = traeger.daten.satzAb || 0;
    }

    function filmLauf(v, an) {
      if (!v) return;
      if (an && filmDarf() && !document.hidden) {
        var p = v.play(); if (p && p['catch']) p['catch'](function () { });
      } else if (!v.paused) v.pause();
    }

    if (window.innerWidth <= 640) {
      var streifen = document.getElementById('streifen');
      if (streifen) {
        var bahn = document.createElement('div');
        bahn.className = 'om-streifen-bahn';
        var streifenFilme = [];
        var streifenPosten = [];
        IMAGES.forEach(function (bild, i) {

          var k = bildkarteBauen(bild, i, {
            figurKlasse: 'om-streifen-karte',
            bu: true, masse: true, frueh: 2
          });
          if (k.film) streifenFilme.push({
            v: k.film, karte: k.figur,
            eigeneDia: !!(bild.satz && bild.satz.length > 1)
          });

          streifenPosten.push({
            karte: k.figur, rahmen: k.rahmen, daten: bild,
            film: k.film, filme: k.filme,
            leiste: k.leiste, bu: k.bu
          });
          bahn.appendChild(k.figur);
        });

        streifenPosten.forEach(function (p) {
          if (p.daten && p.daten.satz && p.daten.satz.length > 1) {
            diaUhrLegen(p.karte, null);

            var feld = document.createElement('div');
            feld.className = 'dia-punkte';
            feld.setAttribute('aria-hidden', 'true');
            for (var n = 0; n < p.daten.satz.length; n++) {
              feld.appendChild(document.createElement('i'));
            }
            p.rahmen.appendChild(feld);
          }
        });

        streifen.appendChild(bahn);

        if (streifenFilme.length || streifenPosten.length) {
          var streifenImBild = true;
          var streifenPruefen = function () {
            var sr = streifen.getBoundingClientRect();
            var mitte = sr.left + sr.width / 2;
            var aufDerKarte = function (karte) {
              var kr = karte.getBoundingClientRect();
              return streifenImBild && mitte >= kr.left && mitte <= kr.right;
            };
            streifenFilme.forEach(function (s) {
              if (s.eigeneDia) return;
              filmSatzLauf(s.v, aufDerKarte(s.karte));
            });

            streifenPosten.forEach(function (p) {
              var mittig = aufDerKarte(p.karte);
              if (p.leiste) p.leiste.classList.toggle('is-da', mittig);

              var mehrere = !!(p.daten && p.daten.satz && p.daten.satz.length > 1);
              p.rahmen.classList.toggle('is-wischbar', mittig && mehrere);
              if (mittig) diaStarten(p, p.rahmen, p.filme, null, p.karte); else diaBeenden(p);
            });
          };

          streifen.addEventListener('scroll', streifenPruefen, { passive: true });

          if (window.IntersectionObserver) {
            new IntersectionObserver(function (e) {
              streifenImBild = e[0].isIntersecting;
              streifenPruefen();
            }, { threshold: 0 }).observe(streifen);
          }
          document.addEventListener('visibilitychange', streifenPruefen);
          window.addEventListener('resize', streifenPruefen);
          streifenPruefen();
        }

        var pfeile = document.createElement('div');
        pfeile.className = 'om-streifen-pfeile';
        var PFAD = { zurueck: 'M15 4 L7 12 L15 20', vor: 'M9 4 L17 12 L9 20' };
        function pfeilBauen(richtung, beschriftung) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', beschriftung);
          b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
            ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
            ' aria-hidden="true"><path d="' +
            (richtung < 0 ? PFAD.zurueck : PFAD.vor) + '"></path></svg>';

          var getippt = 0;
          b.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse') return;
            getippt = e.timeStamp;
            blaettern(richtung);
          });
          b.addEventListener('click', function (e) {

            e.stopPropagation();

            if (getippt && e.timeStamp - getippt < 1000) return;
            blaettern(richtung);
          });
          return b;
        }
        var zurueck = pfeilBauen(-1, 'Vorheriges Bild');
        var vor = pfeilBauen(1, 'Naechstes Bild');
        pfeile.appendChild(zurueck);
        pfeile.appendChild(vor);
        streifen.parentNode.insertBefore(pfeile, streifen.nextSibling);

        pfeileLegen();

        function zielFuer(richtung) {
          var bilder = bahn.children;
          if (!bilder.length) return null;
          var jetzt = streifen.scrollLeft;
          var mitte = jetzt + streifen.clientWidth / 2;
          var ziel = null;
          for (var i = 0; i < bilder.length; i++) {
            var m = bilder[i].offsetLeft + bilder[i].offsetWidth / 2;
            if (richtung > 0) { if (m > mitte + 8) { ziel = m; break; } }
            else if (m < mitte - 8) { ziel = m; }
          }
          if (ziel === null) return null;
          var weit = Math.max(0, streifen.scrollWidth - streifen.clientWidth);
          var links = Math.max(0, Math.min(weit, ziel - streifen.clientWidth / 2));
          return Math.abs(links - jetzt) < 2 ? null : links;
        }

        var fahrt = null;
        var FAHRT_MS = 420;
        function fahren(ziel) {
          if (fahrt) { window.cancelAnimationFrame(fahrt); fahrt = null; }

          if (window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            streifen.scrollLeft = ziel;
            return;
          }
          var von = streifen.scrollLeft, weg = ziel - von, t0 = 0;
          streifen.style.scrollSnapType = 'none';
          var schritt = function (t) {
            if (!t0) t0 = t;
            var a = Math.min(1, (t - t0) / FAHRT_MS);

            var e = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
            streifen.scrollLeft = von + weg * e;
            if (a < 1) {
              fahrt = window.requestAnimationFrame(schritt);
            } else {
              fahrt = null;
              streifen.style.scrollSnapType = '';
              pfeileStellen();
            }
          };
          fahrt = window.requestAnimationFrame(schritt);
        }

        function blaettern(richtung) {
          var links = zielFuer(richtung);
          if (links === null) return;
          fahren(links);
        }

        function pfeileStellen() {
          var zl = zielFuer(-1), zr = zielFuer(1);
          zurueck.classList.toggle('is-leer', zl === null);
          vor.classList.toggle('is-leer', zr === null);

          zurueck.setAttribute('aria-disabled', zl === null ? 'true' : 'false');
          vor.setAttribute('aria-disabled', zr === null ? 'true' : 'false');
        }
        streifen.addEventListener('scroll', pfeileStellen, { passive: true });
        pfeileStellen();

        if (window.ResizeObserver) {
          new ResizeObserver(function () { pfeileLegen(); pfeileStellen(); }).observe(bahn);
        } else {

          window.addEventListener('load', function () { pfeileLegen(); pfeileStellen(); });
        }

        function pfeileLegen() {
          if (!pfeile || !streifenPosten.length) return;
          var y = 0;
          for (var i = 0; i < streifenPosten.length; i++) {
            var q = streifenPosten[i];
            var kh = q.karte.getBoundingClientRect().height;
            if (kh <= 0) continue;
            var bu = q.bu ? q.bu.getBoundingClientRect().height : 0;

            var d = kh / 2 + 14 + bu + 23 + 8;
            if (d > y) y = d;
          }
          if (!y) return;

          var hoehe = window.innerHeight;

          if (y > hoehe / 2 - 32) { y = 0; }
          var neu = Math.round(hoehe / 2 + y) + 'px';
          if (pfeile.style.getPropertyValue('--strf-pfeil-top') === neu) return;

          pfeile.style.transition = 'none';
          pfeile.style.setProperty('--strf-pfeil-top', neu);
          void pfeile.offsetWidth;
          pfeile.style.transition = '';
        }
        window.addEventListener('resize', function () { pfeileLegen(); pfeileStellen(); });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () { pfeileLegen(); pfeileStellen(); });
        }

        var WISCH_ENTSCHEID = 8;
        var WISCH_WEG = 26;
        var wischVon = null, wischPosten = null, wischErledigt = false;
        var wischHoch = 0;
        streifen.addEventListener('pointerdown', function (e) {
          wischVon = null; wischPosten = null; wischErledigt = false;
          wischHoch = 0;
          var rahmen = e.target && e.target.closest &&
            e.target.closest('.om-bild-rahmen.is-wischbar');
          if (!rahmen) return;
          for (var i = 0; i < streifenPosten.length; i++) {
            if (streifenPosten[i].rahmen === rahmen) { wischPosten = streifenPosten[i]; break; }
          }
          if (!wischPosten) return;
          wischVon = { x: e.clientX, y: e.clientY };
        }, { passive: true });
        streifen.addEventListener('pointermove', function (e) {
          if (!wischVon || wischErledigt) return;
          var dx = e.clientX - wischVon.x, dy = e.clientY - wischVon.y;

          if (!wischHoch) {
            if (Math.abs(dx) < WISCH_ENTSCHEID && Math.abs(dy) < WISCH_ENTSCHEID) return;
            wischHoch = Math.abs(dy) > Math.abs(dx) ? 1 : -1;
          }
          if (wischHoch < 0) return;
          if (Math.abs(dy) < WISCH_WEG) return;

          wischErledigt = true;
          diaVonHand(wischPosten, dy < 0 ? 1 : -1);
        }, { passive: true });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (name) {
          streifen.addEventListener(name, function () {
            wischVon = null; wischPosten = null;
          }, { passive: true });
        });

        function pfeileSetzen(an) {
          var warDa = pfeile.classList.contains('is-da');
          pfeile.classList.toggle('is-da', an);

          if (an && !warDa) nachlaufAnhalten();

          pfeile.style.visibility = an ? 'visible' : 'hidden';

          if (an) pfeileStellen();
        }
        var zeigen = function () {
          var rect = scrollWrap.getBoundingClientRect();
          var vis = (rect.top <= 0 && rect.bottom > -200) ? 'visible' : 'hidden';
          if (streifen.style.visibility !== vis) streifen.style.visibility = vis;

          var pfeileAn = vis === 'visible' &&
            maskeOffen() &&
            rect.bottom > pfeile.getBoundingClientRect().top + 60;

          pfeileSetzen(pfeileAn);
        };
        window.addEventListener('scroll', zeigen, { passive: true });
        window.addEventListener('resize', zeigen);
        zeigen();
      }
      layerBack.remove();
      layerFront.remove();
      return;
    }

    var CARD_REF_PX = 2048;

    var CARD_BASE_PX = 300 * (window.innerHeight > window.innerWidth ? 0.72 : 1);
    var CARD_COUNT = IMAGES.length;

    var SPHERE_TARGET_R = 420, PERSPECTIVE = 1850;
    function updateSpokeSizing() {

      SPHERE_TARGET_R = Math.max(380, Math.min(780, window.innerWidth * 0.42));

      PERSPECTIVE = SPHERE_TARGET_R * 3.0;
      var stages = document.querySelectorAll('#orbitBack .orbit-stage, #orbitFront .orbit-stage');
      for (var s = 0; s < stages.length; s++) { stages[s].style.perspective = PERSPECTIVE + 'px'; }
    }
    updateSpokeSizing();
    window.addEventListener('resize', updateSpokeSizing);
    var SPHERE_R = SPHERE_TARGET_R;

    var cards = [];
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < CARD_COUNT; i++) {
      var y0n = 1 - (i / (CARD_COUNT - 1)) * 2;
      var radAtY = Math.sqrt(Math.max(0, 1 - y0n * y0n));
      var theta = goldenAngle * i;
      var dirX = Math.cos(theta) * radAtY;
      var dirY = y0n;
      var dirZ = Math.sin(theta) * radAtY;

      var daten = IMAGES[i % IMAGES.length];

      var hinten = bildkarteBauen(daten, i, {
        rahmenKlasse: 'orbit-card',
        schatten: true, ohneLeiste: true, filmSammler: filmLoops
      });
      var vorne = bildkarteBauen(daten, i, {
        rahmenKlasse: 'orbit-card',
        schatten: true, ohneLeiste: true, ohneFilm: true
      });
      var elBack = hinten.rahmen, elFront = vorne.rahmen;
      var shadeBack = hinten.schatten, shadeFront = vorne.schatten;
      var filmSatz = hinten.film;
      var filmeDerKarte = hinten.filme;
      var film = filmSatz ? filmSatz.kasten : null;
      var filmVoll = filmSatz ? filmSatz.voll : null;

      var src = IMAGES[i % IMAGES.length];
      var geoMean = Math.sqrt(src.w * src.h);
      var shown = CARD_BASE_PX * (geoMean / CARD_REF_PX) * (src.groesse || 1);
      var w = shown * Math.sqrt(src.w / src.h);
      var h = shown * Math.sqrt(src.h / src.w);
      [elBack, elFront].forEach(function (el) {
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.marginLeft = (-w / 2) + 'px';
        el.style.marginTop = (-h / 2) + 'px';
      });

      worldBack.appendChild(elBack);

      cards.push({
        dirX: dirX, dirY: dirY, dirZ: dirZ, elBack: elBack, elFront: elFront,
        shadeBack: shadeBack, shadeFront: shadeFront, daten: daten,

        lastBlur: -1, lastZ: -1, hoverAmt: 0,
        film: film, filmVoll: filmVoll, filmSatz: filmSatz,

        filme: filmeDerKarte,
        inFront: false, w: w, h: h, z2: 0
      });
    }

    var filmLaeuft = false, filmSichtbar = true;
    var filmSchmal = window.matchMedia ? matchMedia('(max-width: 640px)') : null;
    function filmeSchalten(an) {

      an = !!an && filmDarf() && !document.hidden && !galerieAn &&
        !(filmSchmal && filmSchmal.matches);
      if (an === filmLaeuft) return;
      filmLaeuft = an;
      kugelFilmeLaufen = an;
      filmLoops.forEach(function (v) {
        if (an) { var p = v.play(); if (p && p['catch']) p['catch'](function () { }); }
        else v.pause();
      });

      if (orbitTon && orbitTon.an) {
        if (an) { var q = orbitTon.voll.play(); if (q && q['catch']) q['catch'](function () { }); }
        else orbitTon.voll.pause();
      }
    }
    if (filmLoops.length) {
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (eintraege) {
          filmSichtbar = eintraege[0].isIntersecting;
          filmeSchalten(filmSichtbar);
        }, { threshold: 0 }).observe(layerBack);
      }
      filmeSchalten(true);
      document.addEventListener('visibilitychange', function () {
        filmeSchalten(filmSichtbar);
      });
    }

    var scharfKarte = null;
    function scharfStellen(c) {
      if (!c || c === scharfKarte) return;
      scharfWeg();
      var lang = Math.max(c.w, c.h);
      var ziel = Math.min(window.innerWidth, window.innerHeight) * FOCUS_FILL;
      var k = Math.max(1, Math.min(3, ziel / lang));
      if (k <= 1.02) return;
      c.ss = k;
      scharfKarte = c;
      [c.elBack, c.elFront].forEach(function (el) {
        el.style.width = (c.w * k) + 'px';
        el.style.height = (c.h * k) + 'px';
        el.style.marginLeft = (-c.w * k / 2) + 'px';
        el.style.marginTop = (-c.h * k / 2) + 'px';
        el.style.borderRadius = (6 * k).toFixed(1) + 'px';
        el.style.boxShadow = '0 ' + (14 * k).toFixed(0) + 'px ' + (40 * k).toFixed(0) +
          'px rgba(0,0,0,.45)';
      });
    }
    function scharfWeg() {
      var c = scharfKarte;
      if (!c) return;
      scharfKarte = null;
      c.ss = 1;
      [c.elBack, c.elFront].forEach(function (el) {
        el.style.width = c.w + 'px';
        el.style.height = c.h + 'px';
        el.style.marginLeft = (-c.w / 2) + 'px';
        el.style.marginTop = (-c.h / 2) + 'px';
        el.style.borderRadius = '';
        el.style.boxShadow = '';
      });
    }

    function diaKarteAn(c) {
      if (!c) return;
      var el = c.inFront ? c.elFront : c.elBack;
      diaStarten(c, el, c.filme, karteAufl, karteBu);

      if (c.dia && c.dia.linie && karteBu) {

        var breite = parseFloat(karteBu.style.width);
        if (breite > 0) {
          c.dia.linie.style.marginLeft = '-' + Math.round(breite * 0.03) + 'px';
          c.dia.linie.style.width = Math.round(breite) + 'px';
        }
      }
    }
    var karteBu = document.getElementById('karteBu');
    var karteAufl = document.getElementById('karteAufl');
    var filmTasten = document.getElementById('filmTasten');

    var orbitTon = null;
    var buKarte = null;
    var buGelegt = false;

    var buSkala = 1;
    function buSetzen(c) {
      if (!karteBu || !c || !c.daten) return;
      karteBu.innerHTML = buBauen(c.daten);
    }

    function buLegen(c) {
      if (!karteBu || !c) return;
      var el = c.inFront ? c.elFront : c.elBack;
      if (!el || !el.parentNode) return;
      var r = el.getBoundingClientRect();

      buSkala = c.w > 0 ? r.width / c.w : 1;
      var sx = magX * MAG_PULL_PX * buSkala, sy = magY * MAG_PULL_PX * buSkala;
      karteBu.style.width = Math.round(r.width) + 'px';

      karteBu.style.paddingLeft = Math.round(r.width * 0.03) + 'px';
      karteBu.style.left = Math.round(r.left - sx) + 'px';
      karteBu.style.top = Math.round(r.bottom - sy + 18) + 'px';

      if (karteAufl) {
        karteAufl.style.left = Math.round(r.left - sx) + 'px';
        karteAufl.style.top = Math.round(r.top - sy) + 'px';
        karteAufl.style.width = Math.round(r.width) + 'px';
        karteAufl.style.height = Math.round(r.height) + 'px';
        karteAufl.classList.toggle('is-ki', !!(c.daten && c.daten.ki));
        karteAufl.classList.toggle('is-heureka', !!(c.daten && c.daten.heureka));

        if (c.daten && c.daten.heureka) auflTon(karteAufl, c.daten.src);
      }

      if (filmTasten && c.film) {
        var luft = Math.max(12, Math.round(r.width * 0.03));

        filmTasten.style.left = Math.round(r.right - sx) - luft - 88 + 'px';

        filmTasten.style.top = Math.round(r.top - sy) + luft + 10 + 'px';
      }
    }

    window.addEventListener('resize', function () { buGelegt = false; });

    var focused = null;
    var lastFocused = null;
    var focusAmt = 0;
    var FOCUS_SPEED = 1.7;
    var FOCUS_FILL = 0.62;
    var FOCUS_DIM = 0.45;
    var spinDamp = 1;
    var SPIN_EASE = 2.4;

    var MAG_PULL_PX = 14;
    var MAG_EASE = 6;

    var HOVER_SCALE = 0.12;
    var HOVER_EASE = 9;
    var hoverCard = null;
    var pointerInside = false;
    var pointerX = -1, pointerY = -1;
    var magX = 0, magY = 0;
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function cardAt(px, py) {
      var best = null;
      for (var k = 0; k < cards.length; k++) {
        var c = cards[k];
        var el = c.inFront ? c.elFront : c.elBack;
        if (!el.parentNode) continue;
        var r = el.getBoundingClientRect();
        if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
          if (!best || c.z2 > best.z2) best = c;
        }
      }
      return best;
    }

    var dragRotY = 0, dragRotX = 12;
    var dragging = false, lastPX = 0, lastPY = 0;
    var velY = 0, velX = 0;
    var FRICTION = 0.94;
    var VEL_STOP = 0.02;
    var AUTO_SPEED = 4;

    var autoDirY = 1, autoDirX = 0;

    var AUTO_TILT_RATE = 0.25;

    var downX = 0, downY = 0, movedPx = 0;
    var CLICK_SLOP = 6;

    layerFront.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      downX = e.clientX; downY = e.clientY; movedPx = 0;

      dragging = (focused === null);
      lastPX = e.clientX; lastPY = e.clientY;
      velY = 0; velX = 0;
      if (dragging) { layerFront.classList.add('is-dragging'); }
      layerFront.setPointerCapture(e.pointerId);
    });
    layerFront.addEventListener('pointermove', function (e) {

      pointerX = e.clientX; pointerY = e.clientY; pointerInside = true;
      movedPx = Math.max(movedPx, Math.hypot(e.clientX - downX, e.clientY - downY));
      if (!dragging) return;
      var dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      lastPX = e.clientX; lastPY = e.clientY;
      velY = dx * 0.25;
      velX = -dy * 0.2;
      dragRotY += velY;
      dragRotX += velX;
    });

    layerFront.addEventListener('pointerenter', function () { pointerInside = true; });
    layerFront.addEventListener('pointerleave', function () { pointerInside = false; });

    var clickConsumed = false;

    function orbitTonAn(c) {
      orbitTon = (c && c.filmSatz) ? c.filmSatz : null;
      if (!filmTasten) return;
      filmTasten.innerHTML = '';

      var leiste = tastenBauen(filmTasten, orbitTon, c && c.daten && c.daten.link);
      if (leiste) leiste.classList.add('is-da');
      if (orbitTon) filmSatzLauf(orbitTon, c.film.classList.contains('is-dia'));
    }
    function orbitTonAus() {
      if (orbitTon) { filmSatzLauf(orbitTon, false); orbitTon.leiste = null; }
      orbitTon = null;
      if (filmTasten) filmTasten.innerHTML = '';
    }

    var MANIFEST_DECKT_AB = 200;
    function ueberManifest(x, y) {
      var el = document.querySelector('.om-bold');
      if (!el) return false;
      var r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) return false;
      var cs = getComputedStyle(el);
      var m = /circle\(([\d.]+)px/.exec(cs.clipPath || cs.webkitClipPath || '');
      if (!m) return false;
      var radius = parseFloat(m[1]);
      if (!(radius > MANIFEST_DECKT_AB)) return false;
      return Math.hypot(x - (r.left + r.width / 2),
        y - (r.top + r.height / 2)) <= radius;
    }

    layerFront.addEventListener('pointerup', function (e) {
      if (movedPx > CLICK_SLOP) return;

      if (focused) { orbitTonAus(); focused = null; clickConsumed = true; return; }
      var hit = cardAt(e.clientX, e.clientY);

      if ((!hit || !hit.inFront) && ueberManifest(e.clientX, e.clientY)) return;
      var aufKnopf = aufSchalter(e.clientX, e.clientY);

      if (aufKnopf && (!hit || !hit.inFront)) {
        if (!nurReihe) galerieSchalten(!galerieAn);
        clickConsumed = true;
        return;
      }
      if (hit) {
        focused = hit; lastFocused = hit; velY = 0; velX = 0; clickConsumed = true;

        if (hit.daten.loop && hit.filmSatz && hit.filmSatz.ton) {
          orbitTon = hit.filmSatz;
          filmTon(hit.filmSatz);
        }
      }
    });

    layerFront.addEventListener('click', function (e) {
      if (clickConsumed) { clickConsumed = false; e.stopPropagation(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && focused) { focused = null; }
    });

    function endDrag() {
      dragging = false;
      layerFront.classList.remove('is-dragging');
      var m = Math.hypot(velY, velX);
      if (m > 0.0001) { autoDirY = velY / m; autoDirX = velX / m; }
    }
    layerFront.addEventListener('pointerup', endDrag);
    layerFront.addEventListener('pointercancel', endDrag);
    layerFront.addEventListener('pointerleave', endDrag);

    var galerie = document.getElementById('galerie');
    var schalter = document.getElementById('galerieSchalter');
    var galerieAn = false;
    var gPosten = [];
    var gIndex = 0;
    var gPfeilZurueck = null, gPfeilVor = null;
    var G_LUECKE = 26;
    var G_GROSS = 0.62;
    var G_KLEIN = 0.20;

    function galerieBauen() {
      IMAGES.forEach(function (bild, i) {

        var k = bildkarteBauen(bild, i, {
          figurKlasse: 'om-galerie-bild',
          bu: true, schatten: true, frueh: 3
        });
        galerie.appendChild(k.figur);
        gPosten.push({
          figur: k.figur, rahmen: k.rahmen, schatten: k.schatten,
          film: k.film, filme: k.filme, daten: bild,
          leiste: k.leiste, bu: k.bu,
          w: bild.w, h: bild.h, gb: 0, gh: 0
        });
      });

      var PFAD = { zurueck: 'M15 4 L7 12 L15 20', vor: 'M9 4 L17 12 L9 20' };
      [-1, 1].forEach(function (richtung) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'om-galerie-pfeil';
        b.setAttribute('aria-label', richtung < 0 ? 'Vorheriges Bild' : 'Naechstes Bild');
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
          ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
          ' aria-hidden="true"><path d="' +
          (richtung < 0 ? PFAD.zurueck : PFAD.vor) + '"></path></svg>';
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          galerieZu(gIndex + richtung);
        });
        galerie.appendChild(b);
        if (richtung < 0) gPfeilZurueck = b; else gPfeilVor = b;
      });
      galerieMasse();
    }

    function galerieMasse() {
      var kurz = Math.min(window.innerWidth, window.innerHeight);
      gPosten.forEach(function (p) {
        var f = kurz * G_GROSS / Math.max(p.w, p.h);
        p.gb = p.w * f; p.gh = p.h * f;
        p.rahmen.style.width = Math.round(p.gb) + 'px';
        p.rahmen.style.height = Math.round(p.gh) + 'px';
      });
    }

    var G_FAKTOR = G_KLEIN / G_GROSS;

    function galerieLegen() {
      if (!gPosten.length) return;

      var br = gPosten.map(function (p, i) {
        return p.gb * (i === gIndex ? 1 : G_FAKTOR);
      });
      var x = [];
      x[gIndex] = 0;
      for (var i = gIndex + 1; i < br.length; i++) {
        x[i] = x[i - 1] + br[i - 1] / 2 + G_LUECKE + br[i] / 2;
      }
      for (var j = gIndex - 1; j >= 0; j--) {
        x[j] = x[j + 1] - br[j + 1] / 2 - G_LUECKE - br[j] / 2;
      }
      gPosten.forEach(function (p, k) {

        if (p.rahmen.style.filter !== 'none') { p.rahmen.style.filter = 'none'; }
        if (p.schatten.style.opacity !== '0') { p.schatten.style.opacity = '0'; }
        if (p.rahmen.style.boxShadow) { p.rahmen.style.boxShadow = ''; }
        if (p.rahmen.style.borderRadius) { p.rahmen.style.borderRadius = ''; }
        p.rahmen.classList.remove('is-orbitmass');

        p.figur.style.zIndex = gPosten.length - Math.abs(k - gIndex);
        var s = (k === gIndex ? 1 : G_FAKTOR);

        p.figur.style.transform =
          'translate(-50%,-50%) translateX(' + (x[k] + zug).toFixed(1) + 'px)' +
          ' scale(' + s.toFixed(4) + ')';
        p.figur.classList.toggle('is-mitte', k === gIndex);

        var inDerMitte = galerieAn && k === gIndex;
        if (p.leiste) p.leiste.classList.toggle('is-da', inDerMitte);

        var eigeneDia = p.daten && p.daten.satz && p.daten.satz.length > 1;
        if (p.film && !eigeneDia) filmSatzLauf(p.film, inDerMitte);
        if (inDerMitte) diaStarten(p, p.rahmen, p.filme, null, p.figur); else diaBeenden(p);
      });
      if (gPfeilZurueck) {

        var mp = gPosten[gIndex];
        var halbB = (mp ? mp.gb : 0) / 2, halbH = (mp ? mp.gh : 0) / 2;
        var raus = Math.min(halbB + 40, window.innerWidth / 2 - 32);
        gPfeilZurueck.style.transform =
          'translate(-50%,-50%) translate(' + (-raus).toFixed(0) + 'px,' + halbH.toFixed(0) + 'px)';
        gPfeilVor.style.transform =
          'translate(-50%,-50%) translate(' + raus.toFixed(0) + 'px,' + halbH.toFixed(0) + 'px)';
        gPfeilZurueck.disabled = gIndex === 0;
        gPfeilVor.disabled = gIndex === gPosten.length - 1;
      }
    }

    function galerieZu(i) {
      var neu = Math.max(0, Math.min(gPosten.length - 1, i));
      if (neu === gIndex) return;
      gIndex = neu;
      galerieLegen();
    }

    var zug = 0, ziehtVon = null, gezogen = 0;
    var ZUG_DAEMPFUNG = 0.45;
    var ZUG_SCHWELLE = 45;

    var HOCH_BAND = 0.3;

    function hochBandGilt() {
      return !window.matchMedia || window.matchMedia('(pointer: fine)').matches;
    }
    var blaetterSeite = 0;
    function blaetternMelden(px, py) {
      var seite = 0;
      if (galerieAn && gPosten.length) {
        var p = gPosten[gIndex];
        var r = p.rahmen.getBoundingClientRect();
        if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
          var mehrere = !!(p.daten && p.daten.satz && p.daten.satz.length > 1);
          if (mehrere && hochBandGilt() && py < r.top + r.height * HOCH_BAND) {
            seite = 2;
          } else {
            seite = px < r.left + r.width / 2 ? -1 : 1;

            if ((seite < 0 && gIndex === 0) ||
              (seite > 0 && gIndex === gPosten.length - 1)) seite = 0;
          }
        }
      }
      if (seite === blaetterSeite) return;
      blaetterSeite = seite;
      document.body.classList.toggle('is-blaettern', seite !== 0);
      document.body.classList.toggle('is-blaettern-links', seite === -1);
      document.body.classList.toggle('is-blaettern-hoch', seite === 2);
    }
    function blaetternAus() {
      blaetterSeite = 0;
      document.body.classList.remove('is-blaettern', 'is-blaettern-links',
        'is-blaettern-hoch');
    }

    function figurAn(px, py) {
      for (var i = 0; i < gPosten.length; i++) {
        var r = gPosten[i].rahmen.getBoundingClientRect();
        if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) return i;
      }
      return -1;
    }
    if (galerie) {
      var isTouchDrag = false;
      var startX = 0, startY = 0;
      var isHoriz = false;

      galerie.addEventListener('pointerdown', function (e) {
        if (!galerieAn) return;

        if (e.target.closest &&
          e.target.closest('.om-galerie-pfeil, .om-film-tasten')) return;

        startX = e.clientX;
        startY = e.clientY;
        isHoriz = false;
        isTouchDrag = (e.pointerType === 'touch');

        ziehtVon = e.clientX; gezogen = 0;

        if (!isTouchDrag) {
          galerie.classList.add('is-zug');
          try { galerie.setPointerCapture(e.pointerId); } catch (fehler) { }
        }
      });
      galerie.addEventListener('pointermove', function (e) {
        if (ziehtVon === null) { blaetternMelden(e.clientX, e.clientY); return; }

        if (isTouchDrag && !isHoriz) {
          var dx = Math.abs(e.clientX - startX);
          var dy = Math.abs(e.clientY - startY);
          if (dy > dx && dy > 8) {
            ziehtVon = null;
            return;
          }
          if (dx > dy && dx > 8) {
            isHoriz = true;
            galerie.classList.add('is-zug');
            try { galerie.setPointerCapture(e.pointerId); } catch (fehler) { }
          } else {
            return;
          }
        }

        gezogen = e.clientX - ziehtVon;
        zug = gezogen * ZUG_DAEMPFUNG;
        galerieLegen();
      });
      galerie.addEventListener('pointerleave', function () { blaetternAus(); });
      ['pointerup', 'pointercancel'].forEach(function (name) {
        galerie.addEventListener(name, function (e) {
          if (ziehtVon === null) return;
          var weg = gezogen;
          ziehtVon = null; zug = 0; gezogen = 0;
          galerie.classList.remove('is-zug');
          if (Math.abs(weg) > ZUG_SCHWELLE) {

            gIndex = Math.max(0, Math.min(gPosten.length - 1,
              gIndex + (weg < 0 ? 1 : -1)));
          } else if (Math.abs(weg) <= 6 && name === 'pointerup') {

            var t = figurAn(e.clientX, e.clientY);
            if (t === gIndex) {

              var p = gPosten[gIndex];
              var r = p.rahmen.getBoundingClientRect();
              var mehrere = !!(p.daten && p.daten.satz && p.daten.satz.length > 1);
              if (mehrere && hochBandGilt() && e.clientY < r.top + r.height * HOCH_BAND) {

                diaVonHand(p, 1);
                galerieLegen();
                return;
              }
              var schritt = e.clientX < r.left + r.width / 2 ? -1 : 1;
              gIndex = Math.max(0, Math.min(gPosten.length - 1, gIndex + schritt));
            } else if (t >= 0) {
              gIndex = t;
            }
          }
          galerieLegen();
        });
      });
    }

    var radStand = 0, radSperre = false;
    if (galerie) {
      galerie.addEventListener('wheel', function (e) {
        if (!galerieAn) return;

        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
          if (!nurReihe) galerieSchalten(false);
          return;
        }
        e.preventDefault();

        e.stopPropagation();
        if (radSperre) return;
        radStand += e.deltaX;
        if (Math.abs(radStand) < 48) return;
        galerieZu(gIndex + (radStand > 0 ? 1 : -1));
        radStand = 0;
        radSperre = true;
        setTimeout(function () { radSperre = false; }, 420);
      }, { passive: false });
    }

    var galerieSeit = 0, galerieY = 0;
    window.addEventListener('scroll', function () {
      if (!galerieAn) return;

      if (nurReihe) return;
      if (performance.now() - galerieSeit < 700) { galerieY = window.scrollY; return; }
      if (Math.abs(window.scrollY - galerieY) < 6) return;
      galerieSchalten(false);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (!galerieAn) return;
      if (e.key === 'ArrowRight') { galerieZu(gIndex + 1); }
      else if (e.key === 'ArrowLeft') { galerieZu(gIndex - 1); }
    });

    function kartenUmrisse() {
      return cards.map(function (c) {
        var el = c.inFront ? c.elFront : c.elBack;
        if (!el || !el.parentNode) return null;
        var r = el.getBoundingClientRect();

        return {
          left: r.left, top: r.top, width: r.width, height: r.height,

          css: el.offsetWidth,

          z: (c.inFront ? 1000 : 0) + (parseInt(el.style.zIndex, 10) || 0),
          filter: el.style.filter || 'none',
          schatten: (c.inFront ? c.shadeFront : c.shadeBack).style.opacity || '0'
        };
      });
    }

    function galerieAufKarten(sofort, umrisse) {
      var r = umrisse || kartenUmrisse();
      gPosten.forEach(function (p, i) {
        var k = r[i];
        if (!k || !k.width) return;
        if (sofort) p.figur.classList.add('ohne-flug');

        p.rahmen.style.filter = k.filter;
        p.schatten.style.opacity = k.schatten;

        var vf = (p.gb > 0 && k.css > 0) ? p.gb / k.css : 1;
        p.rahmen.style.boxShadow = '0 ' + (14 * vf).toFixed(1) + 'px ' +
          (40 * vf).toFixed(1) + 'px rgba(0,0,0,.45)';
        p.rahmen.style.borderRadius = (6 * vf).toFixed(1) + 'px';
        p.rahmen.classList.add('is-orbitmass');
        p.figur.style.zIndex = k.z;

        var s = p.gb > 0 ? k.width / p.gb : 1;
        p.figur.style.transform = 'translate(-50%,-50%) translate(' +
          Math.round(k.left + k.width / 2 - window.innerWidth / 2) + 'px,' +
          Math.round(k.top + k.height / 2 - window.innerHeight / 2) + 'px)' +
          ' scale(' + s.toFixed(4) + ')';
      });
      if (sofort) {

        void galerie.offsetWidth;
        gPosten.forEach(function (p) { p.figur.classList.remove('ohne-flug'); });
      }
    }

    function naechstesZurMitte(umrisse) {
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var beste = gIndex, weite = Infinity;
      umrisse.forEach(function (k, i) {
        if (!k || !k.width || i >= gPosten.length) return;
        var d = Math.hypot(k.left + k.width / 2 - mx, k.top + k.height / 2 - my);
        if (d < weite) { weite = d; beste = i; }
      });
      return beste;
    }

    var flug = false, flugUhr = 0;
    var FLUG_MS = 600;
    function flugStarten() {
      flug = true;
      clearTimeout(flugUhr);
      flugUhr = setTimeout(function () { flug = false; checkActive(); }, FLUG_MS);
      checkActive();
    }

    function galerieSchalten(an) {
      galerieAn = an;

      scharfWeg();
      if (schalter) {
        schalter.setAttribute('aria-pressed', an ? 'true' : 'false');
        schalter.setAttribute('aria-label',
          an ? 'Zur Orbit-Ansicht wechseln' : 'Zur Reihenansicht wechseln');
      }
      if (an) {
        if (!gPosten.length) galerieBauen();
        galerieSeit = performance.now();
        galerieY = window.scrollY;
        focused = null;
        var umrisse = kartenUmrisse();
        gIndex = naechstesZurMitte(umrisse);
        galerieAufKarten(true, umrisse);
        flugStarten();
        document.body.classList.add('is-galerie');

        filmeSchalten(filmSichtbar);

        requestAnimationFrame(function () {
          requestAnimationFrame(function () { if (galerieAn) galerieLegen(); });
        });
      } else {

        flugStarten();
        blaetternAus();
        document.body.classList.remove('is-galerie');
        filmeSchalten(filmSichtbar);
        gPosten.forEach(function (p) {
          p.figur.classList.remove('is-mitte');
          if (p.film) filmSatzLauf(p.film, false);
          if (p.leiste) p.leiste.classList.remove('is-da');
          diaBeenden(p);
        });
        galerieAufKarten(false);
      }
    }

    function aufSchalter(px, py) {
      if (!schalter || !document.body.classList.contains('is-orbit-bereit')) return false;
      if (getComputedStyle(schalter).display === 'none') return false;
      var r = schalter.getBoundingClientRect();
      return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
    }
    if (schalter) {

      schalter.addEventListener('click', function (e) {
        e.stopPropagation();
        galerieSchalten(!galerieAn);
      });
      layerFront.addEventListener('pointermove', function (e) {
        var drauf = aufSchalter(e.clientX, e.clientY);
        layerFront.classList.toggle('is-schalter', drauf);

        schalter.classList.toggle('is-drauf', drauf);
      });
      layerFront.addEventListener('pointerleave', function () {
        layerFront.classList.remove('is-schalter');
        schalter.classList.remove('is-drauf');
      });
    }
    window.addEventListener('resize', function () {
      if (!gPosten.length) return;
      galerieMasse();
      if (galerieAn) galerieLegen();
    });

    var active = false;
    var WARM_UP = 80;
    var reiheSteht = false;

    var nurReihe = window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    function checkActive() {
      var rect = scrollWrap.getBoundingClientRect();
      var computing = rect.bottom > -200 && rect.top < WARM_UP;
      var visible = rect.top <= 0 && rect.bottom > -200;
      if (computing !== active) {
        active = computing;
      }

      var vis = (visible && !galerieAn && !flug) ? 'visible' : 'hidden';
      if (layerBack.style.visibility !== vis) {
        layerBack.style.visibility = vis;
        layerFront.style.visibility = vis;
      }
      if (galerie) {
        var gv = (visible && (galerieAn || flug)) ? 'visible' : 'hidden';
        if (galerie.style.visibility !== gv) galerie.style.visibility = gv;

        var steht = nurReihe && galerieAn && visible && maskeOffen();
        if (steht && !reiheSteht) nachlaufAnhalten();
        reiheSteht = steht;

        if (nurReihe) {
          var raus = window.innerHeight - rect.bottom;
          var t = raus > 0 ? 'translateY(' + (-Math.round(raus)) + 'px)' : '';
          if (galerie.style.transform !== t) galerie.style.transform = t;
        }
      }
    }
    window.addEventListener('scroll', checkActive, { passive: true });
    window.addEventListener('resize', checkActive);
    checkActive();

    if (nurReihe) galerieSchalten(true);

    var DEG2RAD = Math.PI / 180;

    var ENTRY_SCALE = 2.3;
    var DEPTH_BRIGHTNESS_MIN = 0.26;
    var DEPTH_BLUR_MAX = 8;
    function easeOutCubic(t) { var f = 1 - t; return 1 - f * f * f; }

    var MASK_DONE_AT_ORBIT = 0.439;
    var COLLAPSE_START_ORBIT = 0.767;
    function rawScrollProgress() {
      var rect = scrollWrap.getBoundingClientRect();
      var reserve = rect.height - window.innerHeight;
      return reserve > 0 ? Math.max(0, Math.min(1, -rect.top / reserve)) : (rect.top <= 0 ? 1 : 0);
    }
    function maskProgress() {
      return Math.max(0, Math.min(1, rawScrollProgress() / MASK_DONE_AT_ORBIT));
    }

    var COLLAPSE_BUMP_END_ORBIT = 0.20;
    var COLLAPSE_BUMP_ORBIT = 0.18;
    var COLLAPSE_SUCK_END_ORBIT = 0.74;
    var CARD_SHRINK_START = 0.22;
    function collapseFactors() {
      var col = Math.max(0, Math.min(1, (rawScrollProgress() - COLLAPSE_START_ORBIT) / (1 - COLLAPSE_START_ORBIT)));
      if (col <= 0) return { sphere: 1, card: 1, col: 0 };
      var sphere;
      if (col < COLLAPSE_BUMP_END_ORBIT) {

        sphere = 1 + COLLAPSE_BUMP_ORBIT * Math.sin((col / COLLAPSE_BUMP_END_ORBIT) * Math.PI / 2);
      } else {

        var u = Math.min(1, (col - COLLAPSE_BUMP_END_ORBIT) / (COLLAPSE_SUCK_END_ORBIT - COLLAPSE_BUMP_END_ORBIT));
        sphere = (1 + COLLAPSE_BUMP_ORBIT) * Math.pow(1 - u, 3);
      }
      var cu = Math.max(0, Math.min(1, (col - CARD_SHRINK_START) / (COLLAPSE_SUCK_END_ORBIT - CARD_SHRINK_START)));
      return { sphere: Math.max(0, sphere), card: Math.pow(1 - cu, 1.8), col: col };
    }

    var lastFrameT = null;
    function frame(now) {
      var dt = lastFrameT === null ? 1 / 60 : Math.min(0.05, (now - lastFrameT) / 1000);
      lastFrameT = now;

      if (active) {
        var eased = easeOutCubic(maskProgress());
        var collapse = collapseFactors();
        SPHERE_R = SPHERE_TARGET_R * (ENTRY_SCALE - (ENTRY_SCALE - 1) * eased) * collapse.sphere;

        if (collapse.col > CARD_SHRINK_START && focused) { focused = null; }

        focusAmt = Math.max(0, Math.min(1, focusAmt + (focused ? 1 : -1) * dt * FOCUS_SPEED));

        if (orbitTon && !focused) orbitTonAus();
        if (focused !== buKarte) {
          buKarte = focused; buGelegt = false;
          if (focused) buSetzen(focused);
        }
        if (focused && !buGelegt && focusAmt > 0.985) {
          buLegen(focused);
          buGelegt = true;

          focused.elBack.classList.add('is-scharf', 'is-ohne-aufl');
          focused.elFront.classList.add('is-scharf', 'is-ohne-aufl');
          scharfStellen(focused);
          orbitTonAn(focused);

          diaKarteAn(focused);
          if (karteAufl) {
            karteAufl.classList.add('is-da');

            requestAnimationFrame(function () {
              if (karteAufl.classList.contains('is-da')) karteAufl.classList.add('is-klein');
            });
          }
        }

        if (!focused && lastFocused && focusAmt < 0.999) {
          lastFocused.elBack.classList.remove('is-scharf', 'is-ohne-aufl');
          lastFocused.elFront.classList.remove('is-scharf', 'is-ohne-aufl');
          scharfWeg();
          if (karteAufl) karteAufl.classList.remove('is-da', 'is-klein');
          if (filmTasten) filmTasten.innerHTML = '';
          diaBeenden(lastFocused);
        }
        if (karteBu) karteBu.classList.toggle('is-da', !!focused && buGelegt);

        var spinTarget = (focused !== null || focusAmt > 0.02 ||
          galerieAn || flug) ? 0 : 1;
        spinDamp += (spinTarget - spinDamp) * Math.min(1, dt * SPIN_EASE);

        if (dragging) {

        } else if (Math.abs(velY) > VEL_STOP || Math.abs(velX) > VEL_STOP) {

          dragRotY += velY * spinDamp;
          dragRotX += velX * spinDamp;

          var frictionStep = Math.pow(FRICTION, dt * 60);
          velY *= frictionStep; velX *= frictionStep;
        } else {

          velY = 0; velX = 0;

          dragRotY += dt * AUTO_SPEED * autoDirY * spinDamp;
          dragRotX += dt * AUTO_SPEED * autoDirX * AUTO_TILT_RATE * spinDamp;
        }
        var worldRotY = dragRotY;
        var worldRotX = dragRotX;
        var worldTransform = 'rotateX(' + worldRotX + 'deg) rotateY(' + worldRotY + 'deg)';
        worldBack.style.transform = worldTransform;
        worldFront.style.transform = worldTransform;

        var ry = worldRotY * DEG2RAD, rx = worldRotX * DEG2RAD;
        var cosY = Math.cos(ry), sinY = Math.sin(ry);
        var cosX = Math.cos(rx), sinX = Math.sin(rx);
        var billboard = 'rotateY(' + (-worldRotY) + 'deg) rotateX(' + (-worldRotX) + 'deg)';

        var fe = easeInOutCubic(focusAmt);

        hoverCard = (pointerInside && !dragging && !focused && focusAmt < 0.01)
          ? cardAt(pointerX, pointerY) : null;

        if (hoverCard && !hoverCard.inFront &&
          ueberManifest(pointerX, pointerY)) hoverCard = null;
        layerFront.classList.toggle('is-hover', !!hoverCard);

        var mm = /circle\(([\d.]+)px/.exec(maskSection ? maskSection.style.clipPath : '');
        var maskR = mm ? parseFloat(mm[1]) : Infinity;

        var frontErlaubt = maskR < Math.min(window.innerWidth, window.innerHeight) / 2;

        var magCard = focused || (focusAmt > 0 ? lastFocused : null);
        var magTX = 0, magTY = 0;
        if (magCard && pointerX >= 0) {
          var mr = (magCard.inFront ? magCard.elFront : magCard.elBack).getBoundingClientRect();
          if (mr.width > 0) {
            magTX = Math.max(-1, Math.min(1, (pointerX - (mr.left + mr.width / 2)) / (mr.width / 2)));
            magTY = Math.max(-1, Math.min(1, (pointerY - (mr.top + mr.height / 2)) / (mr.height / 2)));
          }
        }
        var magStep = Math.min(1, dt * MAG_EASE);
        magX += (magTX - magX) * magStep;
        magY += (magTY - magY) * magStep;

        var hoverStep = Math.min(1, dt * HOVER_EASE);

        for (var j = 0; j < cards.length; j++) {
          var c = cards[j];

          c.hoverAmt += ((c === hoverCard ? 1 : 0) - c.hoverAmt) * hoverStep;

          var x0 = c.dirX * SPHERE_R, y0 = c.dirY * SPHERE_R, z0 = c.dirZ * SPHERE_R;

          if (c === focused || (focusAmt > 0 && c === lastFocused)) {
            var longSide = Math.max(c.w, c.h);
            var wantPx = Math.min(window.innerWidth, window.innerHeight) * FOCUS_FILL;
            var wantScale = Math.max(1.15, Math.min(4, wantPx / longSide));
            var fz = PERSPECTIVE * (1 - 1 / wantScale);
            var ty = fz * sinX;
            var tz1 = fz * cosX;
            var tx = -tz1 * sinY;
            var tz = tz1 * cosY;
            x0 += (tx - x0) * fe;
            y0 += (ty - y0) * fe;
            z0 += (tz - z0) * fe;
          }

          var x1 = x0 * cosY + z0 * sinY;
          var z1 = -x0 * sinY + z0 * cosY;
          var y1 = y0;
          var y2 = y1 * cosX - z1 * sinX;
          var z2 = y1 * sinX + z1 * cosX;
          c.z2 = z2;

          var pull = '';
          if (c === magCard && fe > 0) {
            pull = ' translate(' + (magX * MAG_PULL_PX * fe).toFixed(1) + 'px,' +
              (magY * MAG_PULL_PX * fe).toFixed(1) + 'px)';

            if (c === focused) {
              var sogX = (magX * MAG_PULL_PX * fe * buSkala).toFixed(1);
              var sogY = (magY * MAG_PULL_PX * fe * buSkala).toFixed(1);
              var sog = 'translate(' + sogX + 'px,' + sogY + 'px)';
              if (karteBu) karteBu.style.transform = sog;
              if (karteAufl) karteAufl.style.transform = sog;
              if (filmTasten) filmTasten.style.transform = sog;
            }
          }

          var sc = (1 + c.hoverAmt * HOVER_SCALE) * (collapse.card < 1 ? collapse.card : 1);

          if (c.ss > 1) sc = sc / c.ss;
          var transform = 'translate3d(' + x0 + 'px,' + y0 + 'px,' + z0 + 'px) ' + billboard + pull +
            (Math.abs(sc - 1) > 0.0005 ? ' scale(' + sc.toFixed(4) + ')' : '');
          c.elBack.style.transform = transform;
          c.elFront.style.transform = transform;

          var depthNorm = Math.max(0, Math.min(1, (z2 + SPHERE_R) / (2 * SPHERE_R)));
          var brightness = DEPTH_BRIGHTNESS_MIN + (1 - DEPTH_BRIGHTNESS_MIN) * depthNorm;

          var isFocusCard = (c === focused) || (focusAmt > 0 && c === lastFocused);
          if (!isFocusCard && fe > 0) { brightness *= (1 - FOCUS_DIM * fe); }
          c.shadeBack.style.opacity = c.shadeFront.style.opacity = (1 - brightness).toFixed(3);

          var tiefe = 1 - depthNorm;
          var blurRaw = tiefe * tiefe * DEPTH_BLUR_MAX;
          var blurStep = blurRaw < 0.3 ? 0 : Math.round(blurRaw * 2) / 2;
          if (blurStep !== c.lastBlur) {
            c.lastBlur = blurStep;
            var f = blurStep === 0 ? '' : 'blur(' + blurStep + 'px)';
            c.elBack.style.filter = f;
            c.elFront.style.filter = f;
          }

          var zi = isFocusCard && fe > 0 ? 5000 : Math.round(depthNorm * 100);
          if (zi !== c.lastZ) {
            c.lastZ = zi;
            c.elBack.style.zIndex = zi;
            c.elFront.style.zIndex = zi;
          }

          var shouldBeFront = (z2 > 0 && frontErlaubt) || isFocusCard;

          var pf = PERSPECTIVE / (PERSPECTIVE - z2);
          var halbe = 0.5 * Math.hypot(c.w, c.h) * pf * sc;
          var freiVomKreis = Math.hypot(x1 * pf, y2 * pf) - halbe > maskR;

          if (shouldBeFront !== c.inFront &&
            (freiVomKreis || isFocusCard || c.lastBlur > 2)) {
            c.inFront = shouldBeFront;
            if (shouldBeFront) {
              c.elBack.remove();
              worldFront.appendChild(c.elFront);
            } else {
              c.elFront.remove();
              worldBack.appendChild(c.elBack);
            }

            var jetzt = shouldBeFront ? c.elFront : c.elBack;
            if (c.filme) {
              for (var fk in c.filme.proIndex) {
                jetzt.appendChild(c.filme.proIndex[fk].kasten);
              }
            } else if (c.film) {
              jetzt.appendChild(c.film);
            }

            if (c.dia) diaUmziehen(c.dia, jetzt);
          }
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();




(function () {
  "use strict";

  window.__tiefeStatus = function () { return 'nicht gestartet'; };
  function status(t) { window.__tiefeStatus = function () { return t; }; }

  var STAERKE = 0.008;

  var SPANNE = 0.68;

  var ANKER = 0.12;
  var TRAEGHEIT = 3.2;
  var ZOOM = 1.28;
  var MAX_PIXEL = 4.2e6;

  if (!window.matchMedia('(pointer: fine)').matches) { status('keine Maus'); return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { status('Bewegung reduziert'); return; }

  var leinwand = document.getElementById('bgTiefe');
  var elBg = document.getElementById('bg');
  if (!leinwand || !elBg) { status('Element fehlt'); return; }

  var gl = null;
  try {
    gl = leinwand.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, powerPreference: 'low-power',

      preserveDrawingBuffer: true
    });
  } catch (e) { gl = null; }
  if (!gl) { status('kein WebGL'); return; }

  var VS = 'attribute vec2 aPos; varying vec2 vUv;' +
    'void main(){ vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);' +
    ' gl_Position = vec4(aPos, 0.0, 1.0); }';

  var FS = 'precision highp float;' +
    'uniform sampler2D uFoto; uniform sampler2D uTiefe;' +
    'uniform vec2 uSkala; uniform vec2 uOffset; uniform vec2 uSchub;' +
    'uniform float uAnker; uniform float uSpanne;' +
    'varying vec2 vUv;' +
    'void main(){' +
    'vec2 uv = vUv * uSkala + uOffset;' +

    'if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0){ gl_FragColor = vec4(0.0); return; }' +
    'float d = texture2D(uTiefe, uv).r;' +

    'float t = 1.0 - exp(-max(0.0, d - uAnker) / uSpanne);' +
    'vec2 p = uv + uSchub * t;' +
    'gl_FragColor = texture2D(uFoto, clamp(p, 0.0, 1.0));' +
    '}';

  function baue(typ, quelle) {
    var sh = gl.createShader(typ);
    gl.shaderSource(sh, quelle);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  }
  var vs = baue(gl.VERTEX_SHADER, VS), fs = baue(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { status('Shader defekt'); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { status('Shader defekt'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uFoto = gl.getUniformLocation(prog, 'uFoto');
  var uTiefe = gl.getUniformLocation(prog, 'uTiefe');
  var uSkala = gl.getUniformLocation(prog, 'uSkala');
  var uOffset = gl.getUniformLocation(prog, 'uOffset');
  var uSchub = gl.getUniformLocation(prog, 'uSchub');
  var uAnker = gl.getUniformLocation(prog, 'uAnker');
  var uSpanne = gl.getUniformLocation(prog, 'uSpanne');
  gl.uniform1i(uFoto, 0);
  gl.uniform1i(uTiefe, 1);
  gl.uniform1f(uAnker, ANKER);
  gl.uniform1f(uSpanne, SPANNE);
  gl.clearColor(0, 0, 0, 0);

  function textur(bild, einheit) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + einheit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bild);
    return t;
  }

  var texFoto = null, texTiefe = null, bereit = false, an = true;
  var zielX = 0, zielY = 0, mx = 0, my = 0, kennt = false;
  var laeuft = false, zuletzt = 0, nochMal = false;
  var bgOben = 0, bgH = 0, bgW = 0;
  var letzt = [NaN, NaN, NaN, NaN, NaN, NaN];

  function messen() {
    var y = 0;
    for (var n = elBg; n; n = n.offsetParent) { y += n.offsetTop; }
    bgOben = y; bgH = elBg.offsetHeight; bgW = elBg.clientWidth;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = bgW, h = window.innerHeight;
    var px = w * h * dpr * dpr;
    if (px > MAX_PIXEL) dpr *= Math.sqrt(MAX_PIXEL / px);
    var bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
    if (leinwand.width !== bw || leinwand.height !== bh) {
      leinwand.width = bw; leinwand.height = bh;
      gl.viewport(0, 0, bw, bh);
      letzt[0] = NaN;
    }
  }

  function zeichnen() {
    if (!bereit) return;
    var vh = window.innerHeight;

    var bildW = Math.max(bgW * ZOOM, bgH), bildH = bildW;

    var fx = window.innerHeight > bgW ? 0.38 : 1;
    var bildX = (bgW - bildW) * fx;
    var bildY = window.__fotoY || 0;

    var klebe = window.pageYOffset - bgOben;
    if (klebe < 0) klebe = 0;
    var maxKlebe = bgH - vh;
    if (klebe > maxKlebe) klebe = maxKlebe < 0 ? 0 : maxKlebe;

    var sx = bgW / bildW, sy = vh / bildH;
    var ox = -bildX / bildW, oy = (klebe - bildY) / bildH;
    var hx = an ? -mx * STAERKE : 0, hy = an ? -my * STAERKE : 0;

    if (sx === letzt[0] && sy === letzt[1] && ox === letzt[2] &&
      oy === letzt[3] && hx === letzt[4] && hy === letzt[5]) return;
    letzt[0] = sx; letzt[1] = sy; letzt[2] = ox;
    letzt[3] = oy; letzt[4] = hx; letzt[5] = hy;

    gl.uniform2f(uSkala, sx, sy);
    gl.uniform2f(uOffset, ox, oy);
    gl.uniform2f(uSchub, hx, hy);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function schritt(jetzt) {
    var dt = zuletzt ? Math.min(0.05, (jetzt - zuletzt) / 1000) : 1 / 60;
    zuletzt = jetzt;
    var k = Math.min(1, dt * TRAEGHEIT);
    var dx = zielX - mx, dy = zielY - my;
    mx += dx * k; my += dy * k;
    zeichnen();
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001 || nochMal) {
      nochMal = false;
      requestAnimationFrame(schritt);
    } else {
      laeuft = false; zuletzt = 0;
    }
  }
  function anstossen() {
    nochMal = true;
    if (laeuft) return;
    laeuft = true; zuletzt = 0;
    requestAnimationFrame(schritt);
  }

  function laden(quelle, dann) {
    var bild = new Image();
    bild.onload = function () { dann(bild); };
    bild.onerror = function () { dann(null); };
    bild.src = quelle;
  }

  laden('images/gravity/tiefenkarte.png?v=tk4', function (karte) {
    if (!karte) { status('tiefenkarte.png fehlt'); return; }
    laden('images/gravity/portrait.jpg?v=p4', function (foto) {
      if (!foto) { status('portrait.jpg fehlt'); return; }

      try {
        texTiefe = textur(karte, 1);
        texFoto = textur(foto, 0);
      } catch (e) {
        status('Bild gesperrt - Seite laeuft vermutlich unter file://');
        return;
      }
      bereit = true;
      messen();
      zeichnen();

      if (!etwasDrauf()) {
        status('Zeichnung bleibt leer - Ebene nicht uebernommen');
        return;
      }

      function gemalt() {
        var punkt = new Uint8Array(4);
        var stellen = [[0.75, 0.5], [0.6, 0.35], [0.85, 0.7]];
        try {
          for (var i = 0; i < stellen.length; i++) {
            gl.readPixels(Math.floor(leinwand.width * stellen[i][0]),
              Math.floor(leinwand.height * stellen[i][1]),
              1, 1, gl.RGBA, gl.UNSIGNED_BYTE, punkt);
            if (punkt[3] > 0) return true;
          }
        } catch (e) { }
        return false;
      }

      function uebernehmen() {
        if (!elBg.classList.contains('is-loaded')) {
          setTimeout(uebernehmen, 60);
          return;
        }

        letzt[0] = NaN;
        anstossen();
        requestAnimationFrame(function () {
          letzt[0] = NaN;
          anstossen();
          requestAnimationFrame(function () {
            if (gemalt()) {
              elBg.classList.add('is-tiefe');
              status('aktiv');
            } else {

              status('Leinwand blieb leer - CSS-Foto bleibt');
            }
          });
        });
      }
      uebernehmen();
    });
  });

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    zielX = (e.clientX / window.innerWidth - 0.5) * 2;
    zielY = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!kennt) { kennt = true; mx = zielX; my = zielY; }
    anstossen();
  }, { passive: true });

  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', function () { messen(); anstossen(); });
  window.__tiefeNeu = anstossen;

  window.__tiefeFoto = function (quelle) {
    laden(quelle, function (bild) {
      if (!bild || !bereit) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texFoto);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bild);
      anstossen();
    });
  };

  function etwasDrauf() {
    var px = new Uint8Array(4);
    var punkte = [[0.5, 0.5], [0.5, 0.8], [0.35, 0.6], [0.65, 0.6]];
    for (var i = 0; i < punkte.length; i++) {
      try {
        gl.readPixels(Math.round(leinwand.width * punkte[i][0]),
          Math.round(leinwand.height * punkte[i][1]),
          1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      } catch (e) { return false; }
      if (px[3] > 0) return true;
    }
    return false;
  }

  leinwand.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    bereit = false;
    elBg.classList.remove('is-tiefe');
    status('Zeichenkontext verloren - zurueck auf das CSS-Foto');
  });

  window.__tiefeStaerke = function (v) { STAERKE = v; letzt[0] = NaN; anstossen(); };
  window.__tiefeSpanne = function (v) {
    SPANNE = v; gl.uniform1f(uSpanne, SPANNE); letzt[0] = NaN; anstossen();
  };

  window.__tiefeWerte = function () { return { staerke: STAERKE, spanne: SPANNE }; };

  window.__testTiefe = function (ein) {
    an = ein;
    if (!bereit) return;
    elBg.classList.toggle('is-tiefe', ein);
    letzt[0] = NaN;
    anstossen();
  };

  window.__tiefeCheck = function () {
    var px = new Uint8Array(4);
    var r = leinwand.getBoundingClientRect();
    try {
      gl.readPixels(leinwand.width >> 1, leinwand.height >> 1, 1, 1,
        gl.RGBA, gl.UNSIGNED_BYTE, px);
    } catch (e) { }
    return {
      status: window.__tiefeStatus(),
      klasse: elBg.className,
      puffer: [leinwand.width, leinwand.height],
      css: [Math.round(r.width), Math.round(r.height)],
      deckkraft: getComputedStyle(leinwand).opacity,
      mitte: [px[0], px[1], px[2], px[3]],
      fehler: gl.getError(),
      verloren: gl.isContextLost()
    };
  };
})();



(function () {
  "use strict";

  var kasten = document.getElementById('sektKasten');
  var konst = document.getElementById('constellation');

  if (kasten && window.innerWidth <= 640) {
    var innen = document.querySelector('.om-section-inner');
    if (innen) innen.appendChild(kasten);

    var wrap = document.querySelector('.om-section-wrap');
    var schwanz = document.querySelector('.om-section-tail');
    if (wrap && konst && schwanz) wrap.insertBefore(konst, schwanz);
  }

  if (kasten && konst) {

    var RINGE = [130, 195, 285, 355, 425, 480, 540];

    var RINGE_HOCH = RINGE.concat([240]);
    var setzen = function () {
      var kr = konst.getBoundingClientRect();
      if (!kr.height) return;
      var einheit = kr.height / 640;
      var mitteX = kr.left + kr.width / 2;

      var d = Math.max(54, Math.min(78, window.innerHeight * 0.06));
      kasten.style.setProperty('--kreis-d', d.toFixed(1) + 'px');

      var kb = {
        left: kasten.offsetLeft,
        top: kasten.offsetTop,
        width: kasten.offsetWidth,
        height: kasten.offsetHeight
      };

      var hoch = window.matchMedia('(orientation: portrait)').matches;
      var ist = hoch ? kb.top + d / 2 - (kr.top + kr.height / 2)
        : kb.left + d / 2 - mitteX;
      var ziel = (hoch ? RINGE_HOCH : RINGE).map(function (r) { return r * einheit; })
        .reduce(function (a, b) {
          return Math.abs(b - ist) < Math.abs(a - ist) ? b : a;
        });
      kasten.style.setProperty('--kreis-r', ziel.toFixed(1) + 'px');

      kasten.style.setProperty('--kasten-l', kb.left.toFixed(1) + 'px');
      kasten.style.setProperty('--kasten-b', kb.width.toFixed(1) + 'px');
      kasten.style.setProperty('--kasten-h', kb.height.toFixed(1) + 'px');
      kasten.style.setProperty('--kasten-mitte',
        (kb.top + kb.height / 2).toFixed(1) + 'px');

      document.documentElement.style.setProperty(
        '--kasten-h', kb.height.toFixed(1) + 'px');
    };

    function nachmessen() {
      requestAnimationFrame(function () {
        setzen();
        requestAnimationFrame(setzen);
      });
    }
    setzen();
    window.addEventListener('resize', nachmessen);

    if (window.ResizeObserver) {
      var wacht = new ResizeObserver(nachmessen);
      wacht.observe(kasten);
      wacht.observe(konst);
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setzen); }
  }

  var sekt = document.querySelector('.om-section');
  var kastenEl = document.getElementById('sektKasten');
  if (sekt && kastenEl) {
    var gebaut = false;

    function bauAnimation() {
      return kastenEl.getAnimations({ subtree: true }).filter(function (a) {
        return a.animationName === 'om-kasten-bau';
      })[0];
    }

    var pruefen = function () {

      var soll;
      if (window.innerWidth <= 640) {

        soll = kastenEl.getBoundingClientRect().top <= window.innerHeight;
      } else {
        var vorlauf = window.matchMedia('(orientation: portrait)').matches ? 2 : 80;
        soll = sekt.getBoundingClientRect().top <= vorlauf;
      }
      if (soll === gebaut) return;
      gebaut = soll;

      if (soll) {

        setzen();
        kastenEl.classList.add('is-gebaut');
        kastenEl.classList.add('is-text');

        requestAnimationFrame(function () {
          var a = bauAnimation();
          if (a) { a.playbackRate = 1; a.play(); }
        });
        return;
      }

      kastenEl.classList.remove('is-text');
      var b = bauAnimation();
      if (!b) { kastenEl.classList.remove('is-gebaut'); return; }
      b.playbackRate = -2.4;
      b.play();
      b.onfinish = function () {
        if (!gebaut) kastenEl.classList.remove('is-gebaut');
      };
    };
    pruefen();
    window.addEventListener('scroll', pruefen, { passive: true });
    window.addEventListener('resize', pruefen);
  }

  (function () {
    var block = document.querySelector('.om-bio-bilder');
    if (!block) return;
    var geplant = false;
    function messen() {
      var r = block.getBoundingClientRect();
      block.style.setProperty('--bild-weg',
        (window.innerHeight / 2 - (r.top + r.height / 2)).toFixed(1) + 'px');
    }
    function anstossen() {
      if (geplant) return;
      geplant = true;
      requestAnimationFrame(function () { geplant = false; messen(); });
    }
    messen();
    window.addEventListener('scroll', anstossen, { passive: true });
    window.addEventListener('resize', anstossen);
  })();

  (function () {

    function weite(el) {
      try {
        var b = el.getBBox();
        return Math.max(Math.abs(b.x), Math.abs(b.x + b.width),
          Math.abs(b.y), Math.abs(b.y + b.height));
      } catch (fehler) { return 0; }
    }

    var stufen = [];
    var nr = 0;
    function merken(el) {
      el.classList.add('cn-sog');
      stufen.push({ el: el, s: nr++, weite: weite(el) });
    }
    [].forEach.call(
      document.querySelectorAll('#constellation > svg > .cn-ring'), merken);
    nr = 0;
    [].forEach.call(
      document.querySelectorAll('#constellation > svg > .cn-track'), merken);

    var aussen = document.querySelector('.cn-cases-ebene');
    if (aussen) {
      aussen.classList.add('cn-sog');
      stufen.push({ el: aussen, s: 2, weite: weite(aussen) });
    }

    var RAMPE = 0.5;
    var TEMPO_MAX = 14;
    var groesste = 0, hoechste = 0;
    stufen.forEach(function (st) {
      if (st.weite > groesste) groesste = st.weite;
      if (st.s > hoechste) hoechste = st.s;
    });
    stufen.forEach(function (st) {
      st.el.style.setProperty('--s', st.s);

      st.el.style.setProperty('--rs', hoechste - st.s);
      if (groesste > 0 && st.weite > 0) {
        var tempo = 1 / (RAMPE * (st.weite / groesste));
        st.el.style.setProperty('--tempo', Math.min(tempo, TEMPO_MAX).toFixed(3));
      }
    });

    var mitte = document.querySelector('.om-mitte');
    if (mitte) {
      mitte.classList.add('cn-sog');
      mitte.style.setProperty('--s', 0);
      mitte.style.setProperty('--rs', 0);
      mitte.style.setProperty('--tempo', (1 / RAMPE).toFixed(3));
    }
  })();

  (function () {
    var huelle = document.getElementById('mitteHuelle');
    var bahnen = document.getElementById('constellation');
    if (!huelle || !bahnen) return;
    function legen() {
      if (window.innerWidth > 640) {

        huelle.style.left = ''; huelle.style.top = '';
        huelle.style.width = ''; huelle.style.height = '';
        return;
      }
      var b = bahnen.getBoundingClientRect();

      var eltern = huelle.offsetParent;
      var e = eltern ? eltern.getBoundingClientRect() : { left: 0, top: 0 };
      huelle.style.left = (b.left - e.left) + 'px';
      huelle.style.top = (b.top - e.top) + 'px';
      huelle.style.width = b.width + 'px';
      huelle.style.height = b.height + 'px';
    }
    legen();
    window.addEventListener('resize', legen);

    window.addEventListener('load', legen);

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(legen);
  })();

  var text = document.querySelector('.cn-cases');
  var pfad = document.getElementById('cnCasesBahn');
  if (!text || !pfad) return;

  function bogenEnde(radius) {
    var n = text.getNumberOfChars();
    if (!n) return 0;
    var p = text.getEndPositionOfChar(n - 1);
    var w = Math.atan2(p.x, -p.y);
    if (w < 0) w += 2 * Math.PI;
    return w * radius;
  }

  var leinwand = null;
  function buchstabenLaenge() {
    if (!leinwand) {
      var c = document.createElement('canvas');
      leinwand = c.getContext && c.getContext('2d');
      if (!leinwand) return 0;
    }
    var st = getComputedStyle(text);
    leinwand.font = st.fontStyle + ' ' + st.fontWeight + ' ' +
      st.fontSize + ' ' + st.fontFamily;

    var roh = text.textContent.replace(/\s+/g, ' ').trim();
    var lauf = parseFloat(st.letterSpacing) || 0;
    return leinwand.measureText(roh).width + lauf * roh.length;
  }

  function ausmessen() {
    var spans = [].slice.call(text.querySelectorAll('tspan'));
    if (!spans.length) return;
    var umfang = pfad.getTotalLength();
    var radius = umfang / (2 * Math.PI);

    var buchstaben = buchstabenLaenge();
    if (!(buchstaben > 0)) {

      spans.forEach(function (t) { t.setAttribute('dx', 0); });
      buchstaben = bogenEnde(radius);
    }

    var teile = spans.length + 1;
    var luecke = (umfang - buchstaben) / teile;
    if (luecke < 0) luecke = 0;
    spans.forEach(function (t) { t.setAttribute('dx', luecke.toFixed(2)); });

    for (var i = 0; i < 2; i++) {
      var fehler = bogenEnde(radius) - (umfang - luecke);
      if (Math.abs(fehler) > umfang * 0.12) break;
      if (Math.abs(fehler) < 0.5) break;
      luecke -= fehler / teile;
      if (luecke < 0) luecke = 0;
      spans.forEach(function (t) { t.setAttribute('dx', luecke.toFixed(2)); });
    }
    updateSpokes();
  }

  function updateSpokes() {
    var spokesGroup = document.getElementById('cnSpokes');
    var trianglesGroup = document.getElementById('cnTriangles');
    if (!spokesGroup) return;

    var dotSpans = [].slice.call(text.querySelectorAll('tspan')).filter(function (t) {
      return t.textContent.trim() === '·';
    });
    if (dotSpans.length !== 8) return;

    var R = 255;
    var lines = [].slice.call(spokesGroup.querySelectorAll('line'));
    while (lines.length < 8) {
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      spokesGroup.appendChild(l);
      lines.push(l);
    }
    while (lines.length > 8) {
      var extra = lines.pop();
      extra.remove();
    }

    var triPaths = trianglesGroup ? [].slice.call(trianglesGroup.querySelectorAll('path')) : [];
    if (trianglesGroup) {
      var groupMap = ['cn-tri-g1', 'cn-tri-g1', 'cn-tri-g2', 'cn-tri-g2', 'cn-tri-g3', 'cn-tri-g3', 'cn-tri-g4', 'cn-tri-g4'];
      while (triPaths.length < 8) {
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var k = triPaths.length;
        p.className.baseVal = 'cn-tri cn-tri-' + k + ' ' + groupMap[k];
        trianglesGroup.appendChild(p);
        triPaths.push(p);
      }
      while (triPaths.length > 8) {
        var extraP = triPaths.pop();
        extraP.remove();
      }
    }

    var allSpans = [].slice.call(text.querySelectorAll('tspan'));
    var pts = [];

    dotSpans.forEach(function (dotSpan, idx) {
      lines[idx].removeAttribute('class');

      var pt = null;
      try {
        if (typeof dotSpan.getStartPositionOfChar === 'function') {
          pt = dotSpan.getStartPositionOfChar(0);
        }
      } catch (e) { }

      if (!pt || (pt.x === 0 && pt.y === 0)) {
        try {
          var charIdx = text.firstChild && text.firstChild.nodeType === 3 ? text.firstChild.length : 0;
          for (var s = 0; s < allSpans.length; s++) {
            if (allSpans[s] === dotSpan) break;
            charIdx += allSpans[s].textContent.length;
          }
          if (typeof text.getStartPositionOfChar === 'function') {
            pt = text.getStartPositionOfChar(charIdx);
          }
        } catch (e) { }
      }

      var rx, ry;
      if (pt && !isNaN(pt.x) && !isNaN(pt.y) && (pt.x !== 0 || pt.y !== 0)) {
        var angle = Math.atan2(pt.y, pt.x);
        rx = R * Math.cos(angle);
        ry = R * Math.sin(angle);
        lines[idx].setAttribute('x1', '0');
        lines[idx].setAttribute('y1', '0');
        lines[idx].setAttribute('x2', rx.toFixed(2));
        lines[idx].setAttribute('y2', ry.toFixed(2));
      } else {
        rx = parseFloat(lines[idx].getAttribute('x2')) || 0;
        ry = parseFloat(lines[idx].getAttribute('y2')) || 0;
      }
      pts[idx] = { x: rx, y: ry };
    });

    if (triPaths.length === 8 && pts.length === 8) {
      for (var k = 0; k < 8; k++) {
        var startIdx = (k + 7) % 8;
        var endIdx = k;
        var pStart = pts[startIdx];
        var pEnd = pts[endIdx];
        if (pStart && pEnd && (pStart.x !== 0 || pStart.y !== 0) && (pEnd.x !== 0 || pEnd.y !== 0)) {
          var d = 'M 0 0 L ' + pStart.x.toFixed(2) + ' ' + pStart.y.toFixed(2) +
                  ' A ' + R + ' ' + R + ' 0 0 1 ' + pEnd.x.toFixed(2) + ' ' + pEnd.y.toFixed(2) + ' Z';
          triPaths[k].setAttribute('d', d);
        }
      }
    }
  }

  ausmessen();
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(ausmessen); }

  window.addEventListener('load', ausmessen);
  if (window.IntersectionObserver) {
    var bahnen = document.getElementById('constellation');
    if (bahnen) {
      var wache = new IntersectionObserver(function (eintraege) {
        if (!eintraege.some(function (e) { return e.isIntersecting; })) return;
        wache.disconnect();
        ausmessen();

        window.setTimeout(ausmessen, 700);
      }, { threshold: 0 });
      wache.observe(bahnen);
    }
  }
  window.__casesMessen = ausmessen;
  window.__casesInfo = function () {
    var umfang = pfad.getTotalLength(), radius = umfang / (2 * Math.PI);
    var n = text.getNumberOfChars();
    return {
      zeichen: n, umfang: Math.round(umfang),
      endeBei: Math.round(bogenEnde(radius)),
      luecke: text.querySelector('tspan').getAttribute('dx'),
      letztesZeichen: text.textContent.trim().slice(-1)
    };
  };
})();



(function () {
  "use strict";

  var lockup = document.getElementById('lockup');
  if (!lockup) return;

  var z = [];
  (function lauf(knoten) {
    var kinder = [].slice.call(knoten.childNodes);
    for (var n = 0; n < kinder.length; n++) {
      var k = kinder[n];
      if (k.nodeType === 3) {
        var roh = k.nodeValue;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < roh.length; i++) {
          var c = roh.charAt(i);
          if (c === ' ' || c === '\u00A0' || c === '\n' || c === '\t') {
            frag.appendChild(document.createTextNode(c));
            continue;
          }
          var sp = document.createElement('span');
          sp.className = 'om-lz';
          sp.textContent = c;
          frag.appendChild(sp);
          z.push(sp);
        }
        knoten.replaceChild(frag, k);
      } else if (k.nodeType === 1) {
        lauf(k);
      }
    }
  })(lockup);
  if (!z.length) return;

  var FENSTER = 9;
  var ANTEIL = 0.7;
  var werte = new Array(z.length);

  function weich(t) { return t * t * (3 - 2 * t); }

  function rechnen() {

    var strecke = Math.min(window.innerWidth, window.innerHeight) * ANTEIL;
    var p = strecke > 0 ? window.pageYOffset / strecke : 1;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    var n = z.length;
    var spanne = FENSTER / (n + FENSTER);
    for (var i = 0; i < n; i++) {

      var a = (p - (n - 1 - i) / (n + FENSTER)) / spanne;
      a = a < 0 ? 0 : a > 1 ? 1 : a;

      var o = Math.round((1 - weich(a)) * 50) / 50;
      if (werte[i] === o) continue;
      werte[i] = o;
      z[i].style.opacity = o;
    }
  }

  var offen = false;
  function anstossen() {
    if (offen) return;
    offen = true;
    requestAnimationFrame(function () { offen = false; rechnen(); });
  }

  rechnen();
  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', anstossen);
})();



(function () {
  "use strict";

  var fuss = document.getElementById('fuss');
  var kontakt = document.getElementById('kontakt');
  var web2Rest = document.getElementById('web2Rest');
  var wurzel = document.documentElement;
  if (!fuss && !web2Rest) return;

  var OBEN = 24;
  var mausY = -1;

  function pruefen() {
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    var oben = y <= OBEN;
    var ende = false;
    var fussShift = 0;

    if (kontakt) {
      var kr = kontakt.getBoundingClientRect();
      ende = !oben && kr.top <= vh * 0.38 && kr.bottom > 0;
      if (ende && kr.bottom < vh) {
        fussShift = kr.bottom - vh;
      }
    } else if (!web2Rest) {
      ende = y + vh >= document.documentElement.scrollHeight - 4;
    }

    if (fuss) {
      fuss.classList.toggle('is-da', oben || ende);
      fuss.classList.toggle('is-ende', ende && !oben);
      fuss.style.transform = fussShift < 0
        ? 'translate3d(0,' + fussShift.toFixed(1) + 'px,0)'
        : 'translate3d(0,0,0)';
    }

    if (web2Rest) {
      var wr = web2Rest.getBoundingClientRect();
      var full = wr.top <= 0;
      var orb = wr.top <= vh * 0.35;
      var inZone = full || (wr.top < vh && (mausY >= 0 ? mausY >= wr.top : wr.top <= vh * 0.5));
      wurzel.classList.toggle('in-web2-full', full);
      wurzel.classList.toggle('in-web2-orb', orb);
      wurzel.classList.toggle('in-web2-zone', inZone);
    }
  }

  var geplant = false;
  function anstossen() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { geplant = false; pruefen(); });
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mausY = e.clientY;
    if (web2Rest) {
      var wr = web2Rest.getBoundingClientRect();
      if (wr.top > 0 && wr.top < window.innerHeight) {
        wurzel.classList.toggle('in-web2-zone', mausY >= wr.top);
      }
    }
  }, { passive: true });

  pruefen();
  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', anstossen);

  function refreshTriggers() {
    pruefen();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshTriggers);
  }
  window.addEventListener('load', function () {
    refreshTriggers();
    setTimeout(refreshTriggers, 400);
  });
})();



(function () {
  "use strict";

  var wrap = document.getElementById('kontakt');
  var kugel = document.querySelector('.om-kontakt-kugel');
  var buehne = document.querySelector('.om-kontakt-buehne');
  var bio = document.getElementById('bio');
  var licht = document.querySelector('.om-bio-licht');
  if (!wrap || !kugel || !buehne || !bio || !licht) return;

  var VORLAUF = 0.1;
  var HALT = 0.5;

  var K_START = 0.55;
  var K_SCHEITEL = 0.28;
  var G_SCHEITEL = 0.62;
  var K_KLEIN = 0.02;
  var K_GROSS = 0.125;

  function bahn(g) {
    if (g <= G_SCHEITEL) {
      var a = g / G_SCHEITEL;
      return K_START - (K_START + K_SCHEITEL) * (1 - Math.pow(1 - a, 2));
    }
    var b = (g - G_SCHEITEL) / (1 - G_SCHEITEL);
    return -K_SCHEITEL * (1 - (b < 0.5 ? 2 * b * b
      : 1 - Math.pow(-2 * b + 2, 2) / 2));
  }
  function klemmen(x) { return Math.max(0, Math.min(1, x)); }

  var FLUG_MS = 1500;
  var flugAb = 0;
  var flugRaf = 0;
  var flugSanft = !(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function kugelSetzen(g) {
    var vh = window.innerHeight;

    var y = bahn(g) * vh;

    var rad = (K_KLEIN + (K_GROSS - K_KLEIN) * Math.pow(g, 1.6)) * vh;
    kugel.style.setProperty('--kugel2-y', y.toFixed(1) + 'px');
    kugel.style.setProperty('--kugel2-r', rad.toFixed(1) + 'px');

    kugel.classList.toggle('is-vorn', g >= G_SCHEITEL);
    kugel.classList.toggle('is-cta', g > 0.86);

    buehne.classList.toggle('is-ende', g > 0.86);
  }

  function flugSchritt(jetzt) {
    flugRaf = 0;
    if (!flugAb) return;
    var g = klemmen((jetzt - flugAb) / FLUG_MS);
    kugelSetzen(g);
    if (g < 1) flugRaf = requestAnimationFrame(flugSchritt);
  }
  function flugStarten() {
    if (flugAb) return;

    if (!flugSanft) { flugAb = 1; kugelSetzen(1); return; }
    flugAb = (window.performance && performance.now) ? performance.now() : Date.now();
    flugRaf = requestAnimationFrame(flugSchritt);
  }

  function flugZurueck() {
    if (!flugAb) return;
    if (flugRaf) { cancelAnimationFrame(flugRaf); flugRaf = 0; }
    flugAb = 0;
    kugelSetzen(0);
  }

  var OHNE_HALT = window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;

  function pruefen() {
    var vh = window.innerHeight;
    var r = wrap.getBoundingClientRect();
    var wurzel = document.documentElement;

    var t = klemmen((vh * (1 + VORLAUF) - r.top) / (vh * (1 + VORLAUF - HALT)));

    var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    wurzel.style.setProperty('--kontakt-f', e.toFixed(4));

    var b = window.innerWidth;
    var tief = e * b * 0.134;
    if (tief < 0.5) {

      wurzel.style.setProperty('--kugel-k', '0px');
      wurzel.style.setProperty('--kugel-r', '1px');
    } else {
      wurzel.style.setProperty('--kugel-k', tief.toFixed(1) + 'px');
      wurzel.style.setProperty('--kugel-r',
        ((b * b / 4 + tief * tief) / (2 * tief)).toFixed(1) + 'px');
    }

    var weg = r.height - vh * HALT;
    var halt = Math.max(0, Math.min(weg, vh * HALT - r.top));
    if (OHNE_HALT) {

      buehne.style.setProperty('--halt', '0px');

    } else {
      bio.style.transform = 'translate3d(0,' + halt.toFixed(1) + 'px,0)';
      licht.style.transform = 'translate3d(0,' + (-halt).toFixed(1) + 'px,0)';
      buehne.style.setProperty('--halt', halt.toFixed(1) + 'px');
    }

    if (e > 0.999) flugStarten();
    else if (e < 0.99) flugZurueck();
  }

  var geplant = false;
  function anstossen() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { geplant = false; pruefen(); });
  }

  pruefen();
  window.addEventListener('scroll', OHNE_HALT ? pruefen : anstossen,
    { passive: true });
  window.addEventListener('resize', anstossen);
})();



(function () {
  "use strict";

  var anteil = 0, stellenGerade = false, timer = 0;
  var letzteBreite = window.innerWidth, letzteHoehe = window.innerHeight;

  var LEISTE = 160;

  function weg() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  function merken() {
    if (stellenGerade) return;
    var w = weg();
    anteil = w > 0 ? window.scrollY / w : 0;
  }
  function stellen() {
    stellenGerade = true;
    var ziel = Math.round(anteil * weg());

    if (window.lenis && window.lenis.scrollTo) {
      window.lenis.scrollTo(ziel, { immediate: true });
    } else {
      window.scrollTo(0, ziel);
    }

    requestAnimationFrame(function () { stellenGerade = false; });
  }

  merken();
  window.addEventListener('scroll', merken, { passive: true });
  window.addEventListener('resize', function () {
    var breiterAnders = window.innerWidth !== letzteBreite;
    var hoeherAnders = Math.abs(window.innerHeight - letzteHoehe) > LEISTE;
    letzteBreite = window.innerWidth;
    letzteHoehe = window.innerHeight;
    if (!breiterAnders && !hoeherAnders) return;
    clearTimeout(timer);
    timer = setTimeout(stellen, 140);
  });
})();




(function () {
  "use strict";

  var band = document.getElementById('awwwards');
  if (!band) return;
  var SCHWELLE = 40;
  function pruefen() {
    band.classList.toggle('is-weg', window.scrollY > SCHWELLE);
  }
  window.addEventListener('scroll', pruefen, { passive: true });
  pruefen();
})();
