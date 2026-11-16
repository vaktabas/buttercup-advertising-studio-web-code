if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

(function () {
  "use strict";

  var SC = 0.86;
  var CX = 960, CY = 536;
  var MARK_SCALE = 0.7;

  // BAS shapes (see #shapeMaskA/B/S in index.html). Source artwork is 445px
  // tall; BAS.png composes them as B | A | S with A in the middle.
  var SHAPE_H = 240;
  var SHAPE_K = SHAPE_H / 445;
  var aHalfW = 485 * SHAPE_K / 2, aHalfH = SHAPE_H / 2;   // A — triangle (centre)
  var bHalf = 445 * SHAPE_K / 2;                         // B — squircle (orbits)
  var sHalf = 446 * SHAPE_K / 2;                         // S — circle (orbits)

  var massR = aHalfH;
  var smallR = bHalf;
  var ringOut = sHalf;

  // Rest offsets measured from BAS.png (centres relative to the A).
  var smallDX = -212 * SHAPE_K, smallDY = 0.5 * SHAPE_K;
  var ringDX = 241.5 * SHAPE_K, ringDY = 0;

  var smallD = Math.hypot(smallDX, smallDY);
  var smallA = Math.atan2(smallDY, smallDX);
  var ringD = Math.hypot(ringDX, ringDY);
  var ringA = Math.atan2(ringDY, ringDX);

  var smallHome = { x: CX + smallD * Math.cos(smallA), y: CY + smallD * Math.sin(smallA) };
  var ringHome = { x: CX + ringD * Math.cos(ringA), y: CY + ringD * Math.sin(ringA) };

  var stage = document.getElementById('stage');
  var scene = document.getElementById('scene');
  var elSvg = document.getElementById('svg');
  var elMass = document.getElementById('mass');
  var elSmall = document.getElementById('small');
  var elRing = document.getElementById('ring');
  var elGuideSmall = document.getElementById('guide-small');
  var elGuideRing = document.getElementById('guide-ring');
  var elFocusSmall = document.getElementById('focus-small');
  var elFocusRing = document.getElementById('focus-ring');
  var elCoordSmall = document.getElementById('coord-small');
  var elCoordRing = document.getElementById('coord-ring');
  var elCoordSmallXY = document.getElementById('coord-small-xy');
  var elCoordSmallA = document.getElementById('coord-small-a');
  var elCoordRingXY = document.getElementById('coord-ring-xy');
  var elCoordRingA = document.getElementById('coord-ring-a');
  var elAttractor = document.getElementById('attractor');
  var elNav = document.getElementById('nav');
  var elBrand = document.getElementById('brand');
  var elLockup = document.getElementById('lockup');
  var elClaim = document.getElementById('claim');
  var elHint = document.getElementById('hint');
  var elBg = document.getElementById('bg');

  elSmall.style.opacity = 1;
  elRing.style.opacity = 1;

  function placeShape(el, x, y) {
    attr(el, 'transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
  }

  function ueberdeckung() {
    if (window.innerHeight <= window.innerWidth) return 1.12;

    return window.innerWidth <= 640 ? 2.3 : 1.45;
  }
  var scale = 1, offX = 0, offY = 0;
  var docked = false;

  function svgRestTransform() {
    return 'translate(' + offX + 'px,' + offY + 'px) scale(' + scale + ') ' +
      'translate(' + CX + 'px,' + CY + 'px) scale(' + MARK_SCALE + ') translate(' + (-CX) + 'px,' + (-CY) + 'px)';
  }

  function svgRestParts() {
    return {
      scale: scale * MARK_SCALE,
      tx: offX + scale * CX * (1 - MARK_SCALE),
      ty: offY + scale * CY * (1 - MARK_SCALE)
    };
  }

  function layout() {
    var rect = stage.getBoundingClientRect();
    var containScale = Math.min(rect.width / 1920, rect.height / 1080);
    var coverScale = Math.max(rect.width / 1920, rect.height / 1080);
    scale = Math.min(coverScale, containScale * ueberdeckung());
    offX = (rect.width - 1920 * scale) / 2;

    var OPTISCH_HOCH = 0.045;
    offY = rect.height * (0.5 - OPTISCH_HOCH) - CY * scale;
    scene.style.transform = 'translate(' + offX + 'px,' + offY + 'px) scale(' + scale + ')';
    if (!docked) {
      elSvg.style.transform = svgRestTransform();
    } else if (!transitioning) {
      elSvg.style.transform = transformStr(dockedSvgParts());
    }

    if (elLockup) {
      if (rect.height > rect.width) {
        var randPx = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue('--rand')) || 56;
        var lx = CX + ((randPx - offX) / scale - CX) / MARK_SCALE;
        elLockup.style.left = lx.toFixed(1) + 'px';

        if (elClaim) elClaim.style.left = rect.width <= 640 ? lx.toFixed(1) + 'px' : '';
      } else {
        elLockup.style.left = '';
        if (elClaim) elClaim.style.left = '';
      }
    }
  }

  var sanftTimer = 0;
  function sanftSetzen() {
    var t = 'transform .45s cubic-bezier(0.22,1,0.36,1)';
    scene.style.transition = t;
    if (!docked && !transitioning) elSvg.style.transition = t;
    clearTimeout(sanftTimer);
    sanftTimer = setTimeout(function () {
      scene.style.transition = '';
      if (!docked && !transitioning) elSvg.style.transition = '';
    }, 700);
  }

  function neuRechnen() {
    sanftSetzen();
    layout();
    requestAnimationFrame(function () {
      layout();
      requestAnimationFrame(layout);
    });
  }
  window.addEventListener('resize', neuRechnen);

  if (window.ResizeObserver) { new ResizeObserver(neuRechnen).observe(stage); }

  var letzteMasse = '';
  setInterval(function () {
    var r = stage.getBoundingClientRect();
    var jetzt = Math.round(r.width) + 'x' + Math.round(r.height);
    if (jetzt === letzteMasse) return;
    letzteMasse = jetzt;
    neuRechnen();
  }, 250);
  layout();

  var PARALLAX_FACTOR = 0.25;
  function updateParallax() {

    var slack = Math.max(0, elBg.clientWidth * 1.28 - elBg.clientHeight);
    var offset = Math.min(slack, window.scrollY * PARALLAX_FACTOR);

    elBg.style.setProperty('--photo-y', (-offset) + 'px');

    window.__fotoY = -offset;
    if (window.__tiefeNeu) window.__tiefeNeu();
  }
  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var boldScroll = document.getElementById('boldScroll');
  var boldSection = document.getElementById('boldSection');

  var mfEl = document.querySelector('.om-manifesto');

  var mfSchmal = window.matchMedia ? matchMedia('(max-width: 640px)') : null;
  if (mfEl) {
    var nr = 0;
    [].forEach.call(mfEl.querySelectorAll('.mf-line > span'), function (wort) {

      if (wort.classList.contains('mf-anhang')) return;
      var innen = document.createElement('span');
      innen.className = 'mf-hoch';
      while (wort.firstChild) innen.appendChild(wort.firstChild);
      wort.appendChild(innen);
      wort.classList.add('mf-maske');
      innen.style.transitionDelay = (nr++ * 0.075).toFixed(3) + 's';
    });
  }

  var einladung = document.querySelector('.om-bio-einladung');
  if (einladung) {
    var worte = (einladung.textContent || '').trim().split(/\s+/);
    einladung.textContent = '';
    worte.forEach(function (wort, i) {
      var maske = document.createElement('span');
      maske.className = 'mf-maske';
      var innen = document.createElement('span');
      innen.className = 'mf-hoch';
      innen.textContent = wort;
      innen.style.transitionDelay = (i * 0.06).toFixed(3) + 's';
      maske.appendChild(innen);
      einladung.appendChild(maske);
      if (i < worte.length - 1) einladung.appendChild(document.createTextNode(' '));
    });
  }

  var mfRows = [document.querySelector('.mf-label')]
    .concat(Array.prototype.slice.call(document.querySelectorAll('.om-manifesto > .mf-line')));
  var mfRowCenter = (mfRows.length - 1) / 2;

  var mfRowOffsets = mfRows.map(function () { return 0; });
  function remeasureRows() {
    var prevTransforms = mfRows.map(function (row) { return row ? row.style.transform : null; });
    mfRows.forEach(function (row) { if (row) row.style.transform = 'none'; });
    var rects = mfRows.map(function (row) { return row ? row.getBoundingClientRect() : null; });
    var minTop = Infinity, maxBottom = -Infinity;
    rects.forEach(function (r) { if (r) { minTop = Math.min(minTop, r.top); maxBottom = Math.max(maxBottom, r.bottom); } });
    var centerY = (minTop + maxBottom) / 2;
    mfRowOffsets = rects.map(function (r) { return r ? ((r.top + r.bottom) / 2 - centerY) : 0; });
    mfRows.forEach(function (row, i) { if (row) row.style.transform = prevTransforms[i] || ''; });
  }
  remeasureRows();
  window.addEventListener('resize', remeasureRows);
  var orbitHint = document.getElementById('orbitHint');

  var elBrandMark = document.getElementById('brand');
  var elMassMark = document.getElementById('mass');
  var elCurve = document.querySelector('.om-bold-curve');
  var mitteHuelle = document.getElementById('mitteHuelle');
  var kastenText = document.getElementById('sektKasten');

  var aufFarbe = null;
  window.omAufFarbe = function (x, y) { return aufFarbe ? aufFarbe(x, y) : false; };

  var OHNE_KUGEL = window.innerWidth <= 640 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var MASK_MIN_R = OHNE_KUGEL ? 0 : 78;

  var MASK_START_AT = 0.152;
  var MASK_DONE_AT = 0.524;
  var COLLAPSE_START = 0.767;

  var COLLAPSE_BUMP_END = 0.20;
  var COLLAPSE_BUMP = 0.18;
  var COLLAPSE_SUCK_END = 0.74;

  var FLASH_START = 0.52;
  var FLASH_PEAK = 0.72;
  var FLASH_GROW = 0.55;

  var EXPLODE_START = 0.80;

  var EXPLODE_OVERSHOOT = 1.7;

  var KEIN_KOLLAPS = OHNE_KUGEL;
  if (KEIN_KOLLAPS) {
    MASK_START_AT = 50 / 248;
    MASK_DONE_AT = 173 / 248;
  }
  function collapseAmount(rawProgress) {
    if (KEIN_KOLLAPS) return 0;
    return clamp01((rawProgress - COLLAPSE_START) / (1 - COLLAPSE_START));
  }

  var accentCache = { raw: null, rgb: [31, 106, 255] };
  function accentRGB() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if (raw !== accentCache.raw) {
      accentCache.raw = raw;
      var hex = raw.replace('#', '');
      if (hex.length === 3) { hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; }
      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        accentCache.rgb = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      }
    }
    return accentCache.rgb;
  }

  var fgCache = { raw: null, rgb: [255, 255, 255] };
  function fgRGB() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
    if (raw !== fgCache.raw) {
      fgCache.raw = raw;
      var hex = raw.replace('#', '');
      if (hex.length === 3) { hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; }
      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        fgCache.rgb = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      }
    }
    return fgCache.rgb;
  }

  var TEXT_GROW_START = 0.15;
  var HINT_FADE_START = 0.9;
  var TEXT_GROW_MAX = 11;
  var TEXT_BULGE_DEG = 24;

  var TEXT_FINAL_FADE_START = 0.94;
  var constellation = document.getElementById('constellation');
  var bioEl = document.getElementById('bio');
  var web2El = document.getElementById('web2Rest');

  var CONSTELLATION_IN = 0.88;
  var TEXT_BLUR_MAX = 10;

  var RING_WEG = -0.24;

  var RING_SCHWUND = 0.5;

  var RING_VERZUG = 0.10;

  var RING_KLEIN = 0.62;
  function updateBoldMask() {
    if (!boldScroll || !boldSection) return;
    var rect = boldScroll.getBoundingClientRect();
    var vh = window.innerHeight;
    var reserve = rect.height - vh;
    var rawProgress = reserve > 0 ? clamp01(-rect.top / reserve) : (rect.top <= 0 ? 1 : 0);

    var progress = clamp01((rawProgress - MASK_START_AT) / (MASK_DONE_AT - MASK_START_AT));

    var ringStrecke = vh + MASK_START_AT * Math.max(0, reserve);
    var ringT = ringStrecke > 0 ? clamp01((vh - rect.top) / ringStrecke) : 1;
    var ringE = 1 - Math.pow(1 - ringT, 3);
    boldSection.style.setProperty(
      '--ring-y', ((1 - ringE) * RING_WEG * vh).toFixed(1) + 'px');

    var ringU = clamp01(1 - progress / RING_SCHWUND);
    var punktU = clamp01(1 - Math.max(0, progress - RING_VERZUG) / RING_SCHWUND);

    var wachsen = RING_KLEIN + (1 - RING_KLEIN) * ringE;
    boldSection.style.setProperty('--ring-s', (Math.pow(ringU, 1.3) * wachsen).toFixed(4));
    boldSection.style.setProperty('--punkt-s', (Math.pow(punktU, 1.3) * wachsen).toFixed(4));

    var maxR = Math.hypot(window.innerWidth, vh) / 2 * 1.05;
    var r = maxR + (MASK_MIN_R - maxR) * progress;

    var col = collapseAmount(rawProgress);
    if (col > 0) {
      if (col < FLASH_PEAK) {

        var up = clamp01((col - FLASH_START) / (FLASH_PEAK - FLASH_START));
        r = MASK_MIN_R * (1 + FLASH_GROW * Math.sin(up * Math.PI / 2));
      } else if (col < EXPLODE_START) {

        var down = clamp01((col - FLASH_PEAK) / (EXPLODE_START - FLASH_PEAK));
        r = MASK_MIN_R * (1 + FLASH_GROW) * Math.pow(1 - down, 2.6);
      } else {

        var out = clamp01((col - EXPLODE_START) / (1 - EXPLODE_START));
        r = maxR * EXPLODE_OVERSHOOT * (1 - Math.pow(1 - out, 3));
      }

      var white = clamp01((col - FLASH_START) / (FLASH_PEAK - FLASH_START));
      var rgb = accentRGB();
      var rr = rgb[0] + (255 - rgb[0]) * white;
      var gg = rgb[1] + (255 - rgb[1]) * white;
      var bb = rgb[2] + (255 - rgb[2]) * white;

      if (col > FLASH_PEAK) {
        var toFg = clamp01((col - FLASH_PEAK) / (EXPLODE_START - FLASH_PEAK));
        var fg = fgRGB();
        rr += (fg[0] - rr) * toFg; gg += (fg[1] - gg) * toFg; bb += (fg[2] - bb) * toFg;
      }
      boldSection.style.backgroundColor =
        'rgb(' + Math.round(rr) + ',' + Math.round(gg) + ',' + Math.round(bb) + ')';
      boldSection.classList.add('is-collapsing');
    } else if (boldSection.classList.contains('is-collapsing')) {

      boldSection.style.backgroundColor = '';
      boldSection.classList.remove('is-collapsing');
    }

    var clip = 'circle(' + Math.max(0, r) + 'px at 50% 50%)';
    boldSection.style.clipPath = clip;
    boldSection.style.webkitClipPath = clip;

    var secRect = boldSection.getBoundingClientRect();
    var curveRect = elCurve ? elCurve.getBoundingClientRect() : null;

    function punktAufFarbe(cx, cy) {

      if (curveRect &&
        cx > curveRect.left && cx < curveRect.right &&
        cy > curveRect.top && cy < curveRect.bottom) return true;

      if (cy > secRect.top && cy < secRect.bottom) {
        var d = Math.hypot(cx - (secRect.left + secRect.width / 2),
          cy - (secRect.top + secRect.height / 2));
        if (d < r) return true;
      }
      return false;
    }
    aufFarbe = punktAufFarbe;
    function overAccent(rc) {
      if (!rc || (!rc.width && !rc.height)) return false;

      return punktAufFarbe((rc.left + rc.right) / 2, (rc.top + rc.bottom) / 2);
    }

    var lightSec = document.querySelector('.om-section-bg');
    var lightRect = lightSec ? lightSec.getBoundingClientRect() : null;

    var kontaktSec = document.querySelector('.om-kontakt-grund');
    var kontaktRect = kontaktSec ? kontaktSec.getBoundingClientRect() : null;
    var dunkelSec = document.getElementById('bio');
    var dunkelRect = dunkelSec ? dunkelSec.getBoundingClientRect() : null;
    var web2Rect = web2El ? web2El.getBoundingClientRect() : null;

    var footerSec = document.querySelector('.section.is-footer.fy-footer') ||
      document.querySelector('.fy-footer') ||
      document.getElementById('fuss') ||
      document.getElementById('contact');
    var footerRect = footerSec ? footerSec.getBoundingClientRect() : null;

    var woelbSec = document.querySelector('.om-kontakt-woelbung');
    var woelbRect = woelbSec ? woelbSec.getBoundingClientRect() : null;
    if (woelbRect && !woelbRect.height) woelbRect = null;
    function overLight(rc) {
      var lx = 113, ly = 55;
      if (rc && (rc.width || rc.height)) {
        lx = (rc.left + rc.right) / 2;
        ly = (rc.top + rc.bottom) / 2;
      }

      if (footerRect && ly >= footerRect.top && ly <= footerRect.bottom) return false;
      if (dunkelRect && ly > dunkelRect.top && ly < dunkelRect.bottom) return false;
      if (woelbRect && ly > woelbRect.top && ly < woelbRect.bottom) return false;
      if (lightRect && ly > lightRect.top && ly < lightRect.bottom) return true;
      if (kontaktRect && ly > kontaktRect.top && ly < kontaktRect.bottom) return true;
      if (web2Rect && ly > web2Rect.top && ly < web2Rect.bottom) return true;

      if (col > FLASH_START && ly > secRect.top && ly < secRect.bottom) {
        var dd = Math.hypot(lx - (secRect.left + secRect.width / 2),
          ly - (secRect.top + secRect.height / 2));
        if (dd < r) return true;
      }
      return false;
    }

    var root = document.documentElement;
    var isBrandLight = overLight(elBrandMark ? elBrandMark.getBoundingClientRect() : null);
    var isMassLight = overLight(elMassMark ? elMassMark.getBoundingClientRect() : null);
    root.classList.toggle('brand-on-light', isBrandLight);
    root.classList.toggle('mass-on-light', isMassLight);
    root.classList.toggle('brand-on-dark', !isBrandLight);
    root.classList.toggle('brand-on-accent',
      overAccent(elBrandMark ? elBrandMark.getBoundingClientRect() : null));
    root.classList.toggle('mass-on-accent',
      overAccent(elMassMark ? elMassMark.getBoundingClientRect() : null));

    var navRect = elNav ? elNav.getBoundingClientRect() : null;
    root.classList.toggle('nav-on-light', overLight(navRect));
    root.classList.toggle('nav-on-accent', overAccent(navRect));

    updateHeaderShift();

    var growT = clamp01((progress - TEXT_GROW_START) / (1 - TEXT_GROW_START));
    var eased = growT * growT * growT;
    var scaleVal = (1 + eased * TEXT_GROW_MAX).toFixed(3);
    var finalFadeT = clamp01((progress - TEXT_FINAL_FADE_START) / (1 - TEXT_FINAL_FADE_START));
    var textOpacity = 1 - finalFadeT;

    var textBlur = (eased * TEXT_BLUR_MAX).toFixed(2);
    for (var i = 0; i < mfRows.length; i++) {
      var row = mfRows[i];
      if (!row) continue;
      var d = (i - mfRowCenter) / mfRowCenter;
      var tilt = (d * TEXT_BULGE_DEG * eased).toFixed(2);

      var spread = (mfRowOffsets[i] * (parseFloat(scaleVal) - 1)).toFixed(1);
      row.style.transform = 'translateY(' + spread + 'px) scale(' + scaleVal + ') rotateX(' + tilt + 'deg)';
      row.style.opacity = textOpacity;
      row.style.filter = textBlur > 0.05 ? 'blur(' + textBlur + 'px)' : 'none';
    }

    var mfAusloeser = (mfSchmal && mfSchmal.matches) ? 1.25 : 0.6;
    if (mfEl && rect.top < vh * mfAusloeser) mfEl.classList.add('is-auf');

    if (orbitHint) {

      var hintIn = clamp01((progress - HINT_FADE_START) / (1 - HINT_FADE_START));

      var hintOut = 1 - clamp01((col - 0.18) / 0.12);
      orbitHint.style.opacity = hintIn * hintOut;

      document.body.classList.toggle('is-orbit-bereit', hintIn * hintOut > 0.5);
    }

    var grundEl = document.querySelector('.om-section-bg');
    if (grundEl) {

      grundEl.style.opacity = KEIN_KOLLAPS ? '1'
        : clamp01((col - EXPLODE_START) / (1 - EXPLODE_START)).toFixed(3);
    }

    if (constellation) {

      var grund = document.querySelector('.om-section-bg');
      var ein;
      if (KEIN_KOLLAPS) {

        ein = clamp01(-rect.bottom / (vh * 0.35));
      } else {
        ein = clamp01((col - CONSTELLATION_IN) / (1 - CONSTELLATION_IN));
      }
      var aus = 1;
      if (!bioEl && web2El) {
        var wrTop = web2El.getBoundingClientRect().top;
        aus = clamp01((wrTop - vh * 0.62) / (vh * 0.30));
        var rausStart = KEIN_KOLLAPS ? 1.05 : 1.22;
        var rausEnd = KEIN_KOLLAPS ? 0.55 : 0.65;
        document.documentElement.style.setProperty('--raus',
          clamp01((vh * rausStart - wrTop) / (vh * (rausStart - rausEnd))).toFixed(3));
        var chrome = clamp01((wrTop - vh * 0.28) / (vh * 0.38));
        document.documentElement.style.setProperty('--gh-chrome', chrome.toFixed(3));
      } else {
        if (grund) {
          var gr = grund.getBoundingClientRect();

          if (gr.bottom < vh * 0.8) { aus = clamp01(gr.bottom / (vh * 0.8)); }
        }
        if (bioEl) {
          var bo = bioEl.getBoundingClientRect().top;

          var sogAb = KEIN_KOLLAPS ? 0.78 : 0.92;
          document.documentElement.style.setProperty('--raus',
            clamp01((vh * sogAb - bo) / (vh * (sogAb - 0.42))).toFixed(3));
        }
      }

      if (KEIN_KOLLAPS) {
        document.documentElement.style.setProperty('--rein',
          clamp01(-rect.bottom / (vh * 0.8)).toFixed(3));
      }
      var sicht = (ein * aus).toFixed(3);
      constellation.style.opacity = sicht;

      if (kastenText) kastenText.style.setProperty('--kreis-sicht', sicht);
      if (mitteHuelle) {
        mitteHuelle.style.opacity = sicht;

        mitteHuelle.style.visibility = (ein * aus) > 0.05 ? 'visible' : 'hidden';
      }
    }
  }
  window.addEventListener('scroll', updateBoldMask, { passive: true });
  window.addEventListener('resize', updateBoldMask);
  updateBoldMask();

  var BASE_OMEGA = 2 * Math.PI / 1.3;
  var RAMP_SEC = 0.5;
  var RADIAL_POW = 1.25;
  var DECAY_POW = 2.2;
  var SPEED_FLOOR = 0.15;

  var MIN_LOOPS = 1.0;

  var TAU_SHAPE = 0.35;
  var MAX_SHAPE_RATE = 700;

  var TAU_ANGLE = 0.5;
  var E_HOME_ENGAGE = 0.25;
  var HOME_ENGAGE_ANGLE = 2.0;

  var SPRING_K = 180, SPRING_D = 20;

  var GATE_TIME = 0.25;

  var EPS_ANGLE_TIGHT = 0.04, EPS_VEL = 0.08;
  var EPS_SHAPE = 8;
  var WAKE_THRESH = 0.05;

  function attr(el, name, wert) {
    var t = el.__zw || (el.__zw = {});
    if (t[name] === wert) return;
    t[name] = wert;
    el.setAttribute(name, wert);
  }
  function text(el, wert) {
    if (el.__zt === wert) return;
    el.__zt = wert;
    el.textContent = wert;
  }

  function zeichneBahn(sat, elGuide, elFocus, elCoord, elXY, elA) {
    var g = sat.guide;
    if (!g) {
      attr(elGuide, 'opacity', 0);
      attr(elFocus, 'opacity', 0);
      attr(elCoord, 'opacity', 0);
      return;
    }
    var cx = g.cx.toFixed(1), cy = g.cy.toFixed(1);
    var op = g.opacity.toFixed(3);
    attr(elGuide, 'cx', cx); attr(elGuide, 'cy', cy);
    attr(elGuide, 'rx', g.rx.toFixed(1)); attr(elGuide, 'ry', g.ry.toFixed(1));
    attr(elGuide, 'transform', 'rotate(' + g.rot.toFixed(2) + ' ' + cx + ' ' + cy + ')');
    attr(elGuide, 'opacity', op);
    attr(elFocus, 'cx', g.focusX.toFixed(1)); attr(elFocus, 'cy', g.focusY.toFixed(1));
    attr(elFocus, 'opacity', op);
    var lx = (g.focusX + 10).toFixed(1);
    attr(elXY, 'x', lx); attr(elXY, 'y', (g.focusY + 5).toFixed(1));
    text(elXY, Math.round(g.focusX) + ', ' + Math.round(g.focusY));
    attr(elA, 'x', lx); attr(elA, 'y', (g.focusY + 24).toFixed(1));
    text(elA, 'a ' + sat.accel.toFixed(1));
    attr(elCoord, 'opacity', op);
  }

  var MAX_SCHRITT = 1 / 180;

  function weichBegrenzt(schritt, deckel) {
    if (!(deckel > 0)) return schritt;
    return deckel * Math.tanh(schritt / deckel);
  }

  // The BAS shapes overlap at rest, so the closest approach is the rest
  // distance itself — satellites swing out on their orbit, never into the A.
  var CORE_MIN_D_SMALL = smallD;
  var CORE_MIN_D_RING = ringD;

  function makeSat(homeR, homeA, dirSign, apoOffset, reachMax, coreMinD) {
    return {
      homeR: homeR, homeA: homeA, dirSign: dirSign, apoOffset: apoOffset,
      reachMax: reachMax, coreMinD: coreMinD,
      theta: homeA, thetaVel: 0, curApo: homeR, curPeri: homeR, curApoAng: homeA,
      resting: true, loopsAccum: 0, activeTime: 0, gateElapsed: 0, accel: 0,
      x: CX + homeR * Math.cos(homeA), y: CY + homeR * Math.sin(homeA),
      guide: null
    };
  }

  var small = makeSat(smallD, smallA, 1, 0, 900, CORE_MIN_D_SMALL);
  var ring = makeSat(ringD, ringA, 1, 0.5, 900, CORE_MIN_D_RING);

  function normAngle(a) { a = a % (2 * Math.PI); if (a > Math.PI) a -= 2 * Math.PI; if (a < -Math.PI) a += 2 * Math.PI; return a; }

  function stepSat(sat, dt, env, dirToMouse, reachToMouse, otherX, otherY) {

    var wasResting = sat.resting;
    if (sat.resting && env < WAKE_THRESH) return;
    if (wasResting) { sat.loopsAccum = 0; sat.activeTime = 0; sat.gateElapsed = 0; }
    sat.resting = false;
    sat.activeTime += dt;

    var targetPeri = sat.homeR - env * Math.max(0, sat.homeR - sat.coreMinD);
    var targetSepMag = env * Math.min(reachToMouse, sat.reachMax);
    var targetApo = targetPeri + targetSepMag;

    var zielKlick = dirToMouse + sat.apoOffset;
    var mischung = clamp01(env / (WAKE_THRESH * 4));
    var targetApoAng = sat.theta + normAngle(zielKlick - sat.theta) * mischung;

    var kShape = 1 - Math.exp(-dt / TAU_SHAPE);
    var maxShapeStep = MAX_SHAPE_RATE * dt;
    sat.curApo += weichBegrenzt((targetApo - sat.curApo) * kShape, maxShapeStep);
    sat.curPeri += weichBegrenzt((targetPeri - sat.curPeri) * kShape, maxShapeStep);

    var kAngle = 1 - Math.exp(-dt / TAU_ANGLE);
    sat.curApoAng += normAngle(targetApoAng - sat.curApoAng) * kAngle;

    var A = (sat.curApo + sat.curPeri) / 2;
    var e = (sat.curApo - sat.curPeri) / (sat.curApo + sat.curPeri);
    var r = A * (1 - e * e) / (1 - e * Math.cos(sat.theta - sat.curApoAng));

    var rampT = clamp01(sat.activeTime / RAMP_SEC);
    var rampIn = rampT * rampT * (3 - 2 * rampT);
    var loopsProgress = clamp01(sat.loopsAccum / MIN_LOOPS);
    var decelEnvelope = 1 - (1 - SPEED_FLOOR) * Math.pow(loopsProgress, DECAY_POW);
    var radialTerm = Math.pow(sat.homeR / r, RADIAL_POW);
    var keplerSpeed = sat.dirSign * BASE_OMEGA * rampIn * decelEnvelope * radialTerm;

    var signedErr = normAngle(sat.theta - sat.homeA);

    if (sat.loopsAccum >= MIN_LOOPS) { sat.gateElapsed += dt; } else { sat.gateElapsed = 0; }
    var loopGate = clamp01(sat.gateElapsed / GATE_TIME);
    var homingWeight = clamp01(1 - e / E_HOME_ENGAGE) * clamp01(1 - Math.abs(signedErr) / HOME_ENGAGE_ANGLE) * loopGate;

    var kinematicPull = (keplerSpeed - sat.thetaVel) * 40;
    var springPull = -SPRING_K * signedErr - SPRING_D * sat.thetaVel;
    var accel = kinematicPull * (1 - homingWeight) + springPull * homingWeight;
    sat.accel = accel;
    sat.thetaVel += accel * dt;
    sat.theta += sat.thetaVel * dt;
    sat.loopsAccum += Math.abs(sat.thetaVel) * dt / (2 * Math.PI);

    var rNow = A * (1 - e * e) / (1 - e * Math.cos(sat.theta - sat.curApoAng));
    var idealX = CX + rNow * Math.cos(sat.theta), idealY = CY + rNow * Math.sin(sat.theta);

    sat.x = idealX; sat.y = idealY;

    sat.guide = (e > 0.01) ? {
      cx: CX + A * e * Math.cos(sat.curApoAng), cy: CY + A * e * Math.sin(sat.curApoAng),
      rx: A, ry: A * Math.sqrt(Math.max(0, 1 - e * e)),
      rot: (sat.curApoAng * 180) / Math.PI, opacity: Math.min(0.9, e * 2.2),
      focusX: CX + (sat.curApo - sat.curPeri) * Math.cos(sat.curApoAng),
      focusY: CY + (sat.curApo - sat.curPeri) * Math.sin(sat.curApoAng)
    } : null;

    var crossed = (sat.prevErr !== undefined && ((sat.prevErr < 0 && signedErr >= 0) || (sat.prevErr > 0 && signedErr <= 0)));
    sat.prevErr = signedErr;
    if (
      homingWeight > 0.6 &&
      (Math.abs(signedErr) < 0.18 || crossed) &&
      Math.abs(sat.curApo - sat.homeR) < 25 &&
      env < WAKE_THRESH
    ) {
      sat.resting = true;
      sat.thetaVel = 0;
      sat.guide = null;
      sat.theta = sat.homeA;
      sat.curApo = sat.homeR;
      sat.curPeri = sat.homeR;
      sat.x = CX + sat.homeR * Math.cos(sat.homeA);
      sat.y = CY + sat.homeR * Math.sin(sat.homeA);
    }
  }

  function resolveCoreDistance(sat) {
    if (sat.resting) return;
    var dx = sat.x - CX, dy = sat.y - CY, d = Math.hypot(dx, dy);
    if (d > 0 && d < sat.coreMinD) {
      var k = sat.coreMinD / d;
      sat.x = CX + dx * k; sat.y = CY + dy * k;
    }
  }

  var attractor = { x: CX, y: CY };
  var clickT0 = null;
  var ENV_HOLD_SEC = 0.9;
  var ENV_RELEASE_SEC = 1.8;

  function onStageClick(clientX, clientY) {
    var rect = stage.getBoundingClientRect();
    var rawX = (clientX - rect.left - offX) / scale;
    var rawY = (clientY - rect.top - offY) / scale;
    attractor.x = CX + (rawX - CX) / MARK_SCALE;
    attractor.y = CY + (rawY - CY) / MARK_SCALE;
    clickT0 = performance.now();

    small.loopsAccum = 0;
    ring.loopsAccum = 0;

    hintDismissed = true;
    updateHint();
    elAttractor.setAttribute('cx', attractor.x); elAttractor.setAttribute('cy', attractor.y);
  }
  stage.addEventListener('click', function (e) { onStageClick(e.clientX, e.clientY); });

  function currentEnv(now) {
    if (clickT0 === null) return 0;
    var t = (now - clickT0) / 1000;
    if (t <= ENV_HOLD_SEC) return 1;
    var u = (t - ENV_HOLD_SEC) / ENV_RELEASE_SEC;
    if (u >= 1) return 0;
    return 1 - u * u * (3 - 2 * u);
  }

  var DOCK_THRESHOLD = 24;
  var UNDOCK_THRESHOLD = 8;
  var SPINUP_SEC = 0.85;
  var FLIGHT_SEC = 1.8;
  var DOCK_GAP = 24;
  var DOCK_MARGIN = 1;

  function brandDockLinks() {
    return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--rand')) || 56;
  }

  function brandDockOben() {
    return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--brand-oben')) || 41;
  }

  function nurWortmarke() { return window.innerWidth <= 640; }
  var FLIGHT_EASE = 'cubic-bezier(0.45, 0, 0.15, 1)';
  var transitioning = false;
  var hintDismissed = false;
  var hintBereit = false;
  window.addEventListener('om:kopf-da', function () {
    hintBereit = true;
    updateHint();
  });

  var currentAnim = null;

  var logoLeft = Math.min(CX - aHalfW, smallHome.x - smallR, ringHome.x - ringOut);
  var logoRight = Math.max(CX + aHalfW, smallHome.x + smallR, ringHome.x + ringOut);
  var logoTop = Math.min(CY - massR, smallHome.y - smallR, ringHome.y - ringOut);
  var logoBottom = Math.max(CY + massR, smallHome.y + smallR, ringHome.y + ringOut);
  var logoW = logoRight - logoLeft;
  var logoH = logoBottom - logoTop;

  var dockScrollY = 0;

  function transformStr(p) { return 'translate(' + p.tx + 'px,' + p.ty + 'px) scale(' + p.scale + ')'; }

  function dockedSvgParts() {

    if (nurWortmarke()) {
      var ruhe = svgRestParts();
      return {
        scale: ruhe.scale,

        tx: -ruhe.scale * (logoRight + logoW * 1.5),
        ty: ruhe.ty + dockScrollY
      };
    }
    var targetH = 26;
    var targetScale = targetH / logoH;
    var dockLeft = brandDockLinks();
    var dockTop = brandDockOben();
    return {
      scale: targetScale,
      tx: dockLeft - targetScale * logoLeft,
      ty: dockTop - targetScale * logoTop + dockScrollY
    };
  }

  function dockLogo() {
    if (docked || transitioning) return;
    transitioning = true;
    docked = true;

    document.documentElement.classList.add('logo-gedockt');

    dockScrollY = window.scrollY;
    currentAnim = null;
    elSvg.getAnimations().forEach(function (a) { a.cancel(); });
    elSvg.style.transition = 'none';
    elSvg.style.position = 'fixed';
    elSvg.style.left = '0';
    elSvg.style.top = (-dockScrollY) + 'px';
    elSvg.style.transform = svgRestTransform();

    updateHint();

    if (small.resting) { small.resting = false; small.loopsAccum = 0; small.activeTime = 0; }
    if (ring.resting) { ring.resting = false; ring.loopsAccum = 0; ring.activeTime = 0; }
    clickT0 = null;

    setTimeout(function () {

      attractor.x = CX - 420;
      attractor.y = CY - 320;
      clickT0 = performance.now();

      var restParts = svgRestParts();
      var dockParts = dockedSvgParts();
      var midParts = {
        scale: restParts.scale + (dockParts.scale - restParts.scale) * 0.2,
        tx: restParts.tx + (dockParts.tx - restParts.tx) * 0.8,
        ty: restParts.ty + (dockParts.ty - restParts.ty) * 0.8
      };

      elSvg.style.transition = 'none';
      var anim = elSvg.animate([
        { transform: transformStr(restParts), offset: 0 },
        { transform: transformStr(midParts), offset: 0.6 },
        { transform: transformStr(dockParts), offset: 1 }
      ], { duration: FLIGHT_SEC * 1000, easing: FLIGHT_EASE, fill: 'forwards' });

      currentAnim = anim;
      var fertig = function () {
        if (currentAnim !== anim) return;
        currentAnim = null;
        elSvg.style.transform = transformStr(dockParts);

        anim.cancel();
        transitioning = false;
        updateHint();
        checkScrollState();
      };
      anim.onfinish = fertig;
      anim.oncancel = fertig;
    }, SPINUP_SEC * 1000);
  }

  function undockLogo() {
    if (!docked || transitioning) return;
    transitioning = true;
    docked = false;
    document.documentElement.classList.remove('logo-gedockt');

    dockScrollY = window.scrollY;
    elSvg.style.top = (-dockScrollY) + 'px';

    attractor.x = CX + 320;
    attractor.y = CY + 220;
    clickT0 = performance.now();
    small.loopsAccum = 0;
    ring.loopsAccum = 0;

    currentAnim = null;
    elSvg.getAnimations().forEach(function (a) { a.cancel(); });
    var startParts = dockedSvgParts();
    var restParts2 = svgRestParts();
    var midParts2 = {
      scale: startParts.scale + (restParts2.scale - startParts.scale) * 0.75,
      tx: startParts.tx + (restParts2.tx - startParts.tx) * 0.3,
      ty: startParts.ty + (restParts2.ty - startParts.ty) * 0.3
    };

    elSvg.style.transition = 'none';
    var anim2 = elSvg.animate([
      { transform: transformStr(startParts), offset: 0 },
      { transform: transformStr(midParts2), offset: 0.4 },
      { transform: transformStr(restParts2), offset: 1 }
    ], { duration: FLIGHT_SEC * 1000, easing: FLIGHT_EASE, fill: 'forwards' });

    currentAnim = anim2;
    var fertig2 = function () {
      if (currentAnim !== anim2) return;
      currentAnim = null;

      elSvg.style.transform = svgRestTransform();

      anim2.cancel();
      elSvg.style.position = 'absolute';
      elSvg.style.left = '0';
      elSvg.style.top = '0';

      transitioning = false;
      updateHint();
      checkScrollState();
    };
    anim2.onfinish = fertig2;
    anim2.oncancel = fertig2;
  }

  function updateHint() {

    if (!hintBereit) return;
    elHint.style.transition = 'opacity .6s ease';
    elHint.style.opacity = (docked || transitioning || hintDismissed) ? 0 : 0.55;
  }

  function updateHeaderShift(){
    if (!web2El) return;
    var wr = web2El.getBoundingClientRect();
    var H_START = 180;
    var shift = wr.top < H_START ? Math.max(-260, Math.round(wr.top - H_START)) : 0;
    document.documentElement.style.setProperty('--header-shift', shift + 'px');
    document.documentElement.classList.toggle('header-scrolled-away', shift <= -220);
  }

  function checkScrollState() {
    var y = window.scrollY;

    if (transitioning && !docked) { elSvg.style.top = (-y) + 'px'; }

    if (!docked && !transitioning && y > DOCK_THRESHOLD) { dockLogo(); }
    else if (docked && !transitioning && y < UNDOCK_THRESHOLD) { undockLogo(); }

    updateHeaderShift();
  }
  window.addEventListener('scroll', checkScrollState, { passive: true });

  function setupIntro(sat, thetaOffset, apoStart, periStart) {
    sat.resting = false;
    sat.theta = sat.homeA - sat.dirSign * thetaOffset;
    sat.curApo = apoStart;
    sat.curPeri = periStart;
    sat.curApoAng = sat.theta;
  }
  setupIntro(small, 3.2, 520, 200);
  setupIntro(ring, 3.8, 600, 240);

  var revealed = false;
  var lastFrame = performance.now();

  function frame(now) {
    var dt = Math.min(0.033, (now - lastFrame) / 1000);
    lastFrame = now;

    var env = currentEnv(now);

    var dirToMouse = Math.atan2(attractor.y - CY, attractor.x - CX);
    var reachToMouse = Math.hypot(attractor.x - CX, attractor.y - CY);

    var rest = dt;
    while (rest > 1e-6) {
      var h = rest > MAX_SCHRITT ? MAX_SCHRITT : rest;
      stepSat(small, h, env, dirToMouse, reachToMouse, ring.x, ring.y);
      stepSat(ring, h, env, dirToMouse, reachToMouse, small.x, small.y);
      resolveCoreDistance(small);
      resolveCoreDistance(ring);
      rest -= h;
    }

    if (!revealed && small.resting && ring.resting) {
      revealed = true;

      updateHint();
    }

    var dxSum = (small.x - smallHome.x) + (ring.x - ringHome.x);
    var dySum = (small.y - smallHome.y) + (ring.y - ringHome.y);
    var recoilX = Math.max(-16, Math.min(16, -dxSum * 0.045));
    var recoilY = Math.max(-16, Math.min(16, -dySum * 0.045));
    if (small.resting && ring.resting) {
      recoilX = 0;
      recoilY = 0;
    }
    placeShape(elMass, CX + recoilX, CY + recoilY);
    placeShape(elSmall, small.x, small.y);
    placeShape(elRing, ring.x, ring.y);
    elSvg.classList.toggle('is-bas-rest', small.resting && ring.resting);

    zeichneBahn(small, elGuideSmall, elFocusSmall, elCoordSmall, elCoordSmallXY, elCoordSmallA);
    zeichneBahn(ring, elGuideRing, elFocusRing, elCoordRing, elCoordRingXY, elCoordRingA);

    elAttractor.setAttribute('opacity', Math.min(0.9, env * 1.8));

    requestAnimationFrame(frame);
  }

  placeShape(elMass, CX, CY);
  stepSat(small, 0.016, 0, 0, 0, ring.x, ring.y);
  stepSat(ring, 0.016, 0, 0, 0, small.x, small.y);
  resolveCoreDistance(small); resolveCoreDistance(ring);
  placeShape(elSmall, small.x, small.y);
  placeShape(elRing, ring.x, ring.y);
  requestAnimationFrame(frame);

  var elBrandLink = document.querySelector('.om-brand-heim');
  if (elBrandLink) {
    elBrandLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (elSvg) {
    elSvg.addEventListener('click', function (e) {
      if (docked) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
})();
