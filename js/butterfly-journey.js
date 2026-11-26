/**
 * BUTTERCUP — Photorealistic 3D Butterfly Metamorphosis (About Us Page)
 * Four ascending stages on a pure white studio canvas (#ffffff):
 *   1. Bottom-left:  Monarch Caterpillar (plump banded body, legs & curved black filaments)
 *   2. Lower-mid:    Sculpted Jade & 24K-Gold Chrysalis hanging from a natural twig
 *   3. Center-right: Newly emerged Butterfly in 3/4 profile unfolding its wings
 *   4. Top-right:    Full-grown Monarch Butterfly soaring wide & large
 * Built with Three.js r128, anatomical canvas textures + bump/metalness maps,
 * soft studio lighting, silky gallery shadows, scroll reveal & mouse 3D parallax.
 */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var section = document.getElementById('butterflyJourney');
  var stageWrap = document.getElementById('bfjStageWrap');
  var canvas = document.getElementById('bfjCanvas');
  if (!section || !stageWrap || !canvas) return;

  var pills = Array.prototype.slice.call(section.querySelectorAll('.bfj-stage-pill'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Math & Utility Helpers                                              */
  /* ------------------------------------------------------------------ */
  var clamp = THREE.MathUtils.clamp;
  function clamp01(v) { return clamp(v, 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { var f = 1 - t; return 1 - f * f * f; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutBack(t) { var c1 = 1.12, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function stageT(p, a, b) { return clamp01((p - a) / (b - a)); }

  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function mkCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return {
      x: u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      y: u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
    };
  }
  function addScaleGrain(g, w, h, alpha, seed, count) {
    var r = rng(seed);
    for (var i = 0; i < count; i++) {
      var x = r() * w, y = r() * h;
      g.fillStyle = r() > 0.45 ? 'rgba(255,244,220,' + alpha + ')' : 'rgba(25,8,0,' + alpha + ')';
      g.fillRect(x, y, 2.2, 1.4);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Renderer, Scene, Camera, Balanced Gallery Lighting                  */
  /* ------------------------------------------------------------------ */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0xffffff, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var maxAniso = renderer.capabilities.getMaxAnisotropy();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  var CAM_Z = 21;
  camera.position.set(0, 0, CAM_Z);

  /* Balanced neutral studio PMREM (gives crisp glossy reflections without washing out color) */
  (function buildStudioEnv() {
    var envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(24, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0xd8d8de, side: THREE.BackSide })
    ));
    function softbox(w, h, x, y, z, col) {
      var m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      envScene.add(m);
    }
    softbox(11, 7, -8, 10, 9, new THREE.Color(3.4, 3.3, 3.1));
    softbox(7, 10, 11, 3, 7, new THREE.Color(2.0, 2.2, 2.4));
    softbox(14, 4, 0, -9, 6, new THREE.Color(1.4, 1.35, 1.3));
    softbox(9, 9, 0, 5, -11, new THREE.Color(1.8, 1.9, 2.1));
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(envScene, 0.04).texture;
    pm.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xddd6ca, 0.56));

  var keyLight = new THREE.DirectionalLight(0xfff8ee, 1.28);
  keyLight.position.set(-4.2, 7.2, 11.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -9; keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 6; keyLight.shadow.camera.bottom = -6;
  keyLight.shadow.camera.near = 1; keyLight.shadow.camera.far = 35;
  keyLight.shadow.radius = 12;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xeef3ff, 0.42);
  fillLight.position.set(7.5, -2, 6);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0xffeed6, 0.52);
  rimLight.position.set(4, 6, -7);
  scene.add(rimLight);

  /* Silky, subtle studio shadow catcher plane */
  var shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 22),
    new THREE.ShadowMaterial({ opacity: 0.075 })
  );
  shadowPlane.position.z = -1.25;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  /* ------------------------------------------------------------------ */
  /* High-Detail Procedural Canvas Textures + Bump & Metalness Maps      */
  /* ------------------------------------------------------------------ */
  function makeTex(c, isSRGB) {
    var t = new THREE.CanvasTexture(c);
    if (isSRGB !== false) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = Math.min(8, maxAniso);
    t.needsUpdate = true;
    return t;
  }

  var WS = 1024;
  var FORE_ROOT = [38, 795];
  var HIND_ROOT = [38, 245];

  function foreOutline(g) {
    g.beginPath();
    g.moveTo(38, 795);
    g.bezierCurveTo(190, 415, 510, 105, 895, 76);
    g.bezierCurveTo(965, 70, 1002, 128, 988, 218);
    g.bezierCurveTo(975, 410, 910, 625, 770, 738);
    g.bezierCurveTo(620, 838, 320, 855, 38, 795);
    g.closePath();
  }

  function hindOutline(g) {
    g.beginPath();
    g.moveTo(38, 245);
    g.bezierCurveTo(215, 118, 520, 95, 755, 178);
    g.bezierCurveTo(955, 255, 1005, 505, 892, 712);
    g.bezierCurveTo(780, 882, 515, 955, 258, 822);
    g.bezierCurveTo(118, 732, 48, 495, 38, 245);
    g.closePath();
  }

  /* Deep, velvety photorealistic Monarch wing texture + raised-vein bump map */
  function createWingTextures(kind) {
    var isFore = kind === 'fore';
    var path = isFore ? foreOutline : hindOutline;
    var root = isFore ? FORE_ROOT : HIND_ROOT;

    var c = mkCanvas(WS, WS), g = c.getContext('2d');
    var cb = mkCanvas(WS, WS), gb = cb.getContext('2d');
    gb.fillStyle = '#484848';
    gb.fillRect(0, 0, WS, WS);

    g.save();
    path(g);
    g.clip();

    /* Saturated authentic Monarch Danaus plexippus burnt-orange to glowing amber */
    var grad = g.createRadialGradient(root[0] + 60, root[1] - (isFore ? 40 : -30), 15, root[0] + 140, root[1], 990);
    grad.addColorStop(0.00, '#852000');
    grad.addColorStop(0.22, '#c83e02');
    grad.addColorStop(0.55, '#e86106');
    grad.addColorStop(0.84, '#f57f10');
    grad.addColorStop(1.00, '#e87812');
    g.fillStyle = grad;
    g.fillRect(0, 0, WS, WS);

    /* Subtle warm backlit glow in wing membrane center */
    var glow = g.createRadialGradient(460, isFore ? 500 : 510, 25, 460, isFore ? 500 : 510, 410);
    glow.addColorStop(0, 'rgba(255, 188, 60, 0.42)');
    glow.addColorStop(0.6, 'rgba(245, 130, 20, 0.12)');
    glow.addColorStop(1, 'rgba(200, 70, 0, 0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, WS, WS);

    function drawVeins(ctx, strokeStyle, widthMult) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeStyle;

      if (isFore) {
        ctx.lineWidth = 11 * widthMult;
        ctx.beginPath();
        ctx.moveTo(55, 770);
        ctx.quadraticCurveTo(260, 520, 565, 365);
        ctx.quadraticCurveTo(540, 465, 485, 565);
        ctx.quadraticCurveTo(270, 665, 55, 770);
        ctx.stroke();

        var branches = [
          [[190, 590], [340, 310], [490, 145]],
          [[340, 470], [520, 250], [690, 118]],
          [[465, 410], [665, 240], [860, 145]],
          [[565, 365], [760, 295], [965, 265]],
          [[545, 415], [755, 415], [955, 425]],
          [[518, 480], [725, 525], [910, 580]],
          [[485, 565], [680, 645], [825, 710]],
          [[360, 625], [535, 725], [670, 795]],
          [[200, 710], [360, 780], [490, 825]],
          [[60, 785], [220, 815], [345, 825]]
        ];
        branches.forEach(function (b, idx) {
          ctx.lineWidth = (idx < 2 || idx > 7 ? 11 : 8.2) * widthMult;
          ctx.beginPath();
          ctx.moveTo(b[0][0], b[0][1]);
          ctx.quadraticCurveTo(b[1][0], b[1][1], b[2][0], b[2][1]);
          ctx.stroke();
        });
      } else {
        ctx.lineWidth = 10 * widthMult;
        ctx.beginPath();
        ctx.moveTo(55, 260);
        ctx.quadraticCurveTo(285, 240, 505, 355);
        ctx.quadraticCurveTo(455, 455, 375, 510);
        ctx.quadraticCurveTo(215, 420, 55, 260);
        ctx.stroke();

        var hBranches = [
          [[180, 240], [350, 155], [540, 130]],
          [[315, 270], [520, 215], [735, 190]],
          [[430, 315], [665, 300], [890, 310]],
          [[505, 355], [735, 420], [955, 490]],
          [[475, 415], [695, 540], [895, 675]],
          [[425, 470], [610, 650], [760, 825]],
          [[375, 510], [495, 705], [585, 895]],
          [[265, 445], [345, 665], [395, 865]],
          [[160, 370], [190, 585], [225, 785]]
        ];
        hBranches.forEach(function (b, idx) {
          ctx.lineWidth = (idx === 0 || idx === 8 ? 10 : 7.8) * widthMult;
          ctx.beginPath();
          ctx.moveTo(b[0][0], b[0][1]);
          ctx.quadraticCurveTo(b[1][0], b[1][1], b[2][0], b[2][1]);
          ctx.stroke();
        });
      }
    }

    drawVeins(g, 'rgba(72, 16, 0, 0.42)', 2.1);
    drawVeins(g, 'rgba(14, 9, 6, 0.98)', 1.0);
    drawVeins(gb, '#e2e2e2', 1.25);

    /* Velvety dark shading near wing root */
    var rootShade = g.createRadialGradient(root[0], root[1], 8, root[0], root[1], 255);
    rootShade.addColorStop(0, 'rgba(12, 7, 4, 0.95)');
    rootShade.addColorStop(0.55, 'rgba(42, 12, 2, 0.40)');
    rootShade.addColorStop(1, 'rgba(42, 12, 2, 0)');
    g.fillStyle = rootShade;
    g.fillRect(0, 0, WS, WS);

    /* Pitch-black velvety scalloped border */
    g.strokeStyle = 'rgba(11, 8, 6, 1)';
    g.lineWidth = 118;
    g.lineJoin = 'round';
    path(g); g.stroke();
    g.strokeStyle = 'rgba(11, 8, 6, 0.40)';
    g.lineWidth = 158;
    path(g); g.stroke();

    if (isFore) {
      var apex = g.createRadialGradient(910, 155, 12, 900, 175, 320);
      apex.addColorStop(0, 'rgba(11, 8, 6, 0.99)');
      apex.addColorStop(0.70, 'rgba(11, 8, 6, 0.92)');
      apex.addColorStop(1, 'rgba(11, 8, 6, 0)');
      g.fillStyle = apex;
      g.fillRect(0, 0, WS, WS);

      [
        [830, 245, 24, 15, '#f6a73e'],
        [876, 330, 21, 14, '#f29828'],
        [790, 190, 19, 12, '#f9c26b'],
        [902, 405, 18, 12, '#f29828'],
        [755, 295, 17, 11, '#f6a73e'],
        [846, 138, 16, 10, '#fff2d4'],
        [898, 210, 14, 9, '#fff2d4']
      ].forEach(function (s) {
        g.fillStyle = s[4];
        g.beginPath();
        g.ellipse(s[0], s[1], s[2], s[3], -0.48, 0, Math.PI * 2);
        g.fill();
      });
    } else {
      g.fillStyle = 'rgba(11, 8, 6, 0.96)';
      g.beginPath();
      g.ellipse(545, 625, 26, 17, 0.65, 0, Math.PI * 2);
      g.fill();
    }

    var curves = isFore
      ? [[[988, 218], [975, 410], [910, 625], [770, 738]], [[770, 738], [620, 838], [320, 855], [38, 795]]]
      : [[[755, 178], [955, 255], [1005, 505], [892, 712]], [[892, 712], [780, 882], [515, 955], [258, 822]]];
    var cx = 500, cy = isFore ? 485 : 515;
    curves.forEach(function (cv, ci) {
      var n = ci === 0 ? 12 : 13;
      for (var i = 1; i < n; i++) {
        var t = i / n;
        var pt = bez(cv[0], cv[1], cv[2], cv[3], t);
        var dx = cx - pt.x, dy = cy - pt.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var ox = pt.x + (dx / d) * 30, oy = pt.y + (dy / d) * 30;
        g.fillStyle = 'rgba(255, 252, 245, 0.96)';
        g.beginPath(); g.arc(ox, oy, 8.5 + Math.sin(t * Math.PI) * 3.5, 0, Math.PI * 2); g.fill();
        var ix = pt.x + (dx / d) * 62, iy = pt.y + (dy / d) * 62;
        g.fillStyle = 'rgba(255, 246, 224, 0.92)';
        g.beginPath(); g.arc(ix, iy, 6.5 + Math.sin(t * Math.PI) * 2.5, 0, Math.PI * 2); g.fill();
      }
    });

    addScaleGrain(g, WS, WS, 0.055, isFore ? 19 : 37, 70000);
    g.restore();

    g.save();
    g.strokeStyle = 'rgba(255,250,240,0.35)';
    g.lineWidth = 2.2;
    path(g); g.stroke();
    g.restore();

    return { map: makeTex(c, true), bump: makeTex(cb, false) };
  }

  /* Monarch Caterpillar authentic velvety yellow/ivory/black bands */
  function createCaterpillarTex() {
    var W = 64, H = 512;
    var c = mkCanvas(W, H), g = c.getContext('2d');
    var stops = [
      [0.00, '#100d0a'], [0.11, '#100d0a'],
      [0.14, '#eab808'], [0.31, '#f4c714'],
      [0.34, '#100d0a'], [0.43, '#100d0a'],
      [0.46, '#f4f0e2'], [0.55, '#f4f0e2'],
      [0.58, '#100d0a'], [0.67, '#100d0a'],
      [0.70, '#eab808'], [0.87, '#f4c714'],
      [0.90, '#100d0a'], [1.00, '#100d0a']
    ];
    var grad = g.createLinearGradient(0, 0, 0, H);
    stops.forEach(function (s) { grad.addColorStop(s[0], s[1]); });
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    addScaleGrain(g, W, H, 0.045, 101, 4500);
    return makeTex(c, true);
  }

  /* Rich Jade-Emerald Monarch Chrysalis with UPPER-SHOULDER Black & 24K Gold Crown
     Note: CanvasTexture has flipY=true, and LatheGeometry UV.v=0 is at the TOP (y=0)
     and UV.v=1 is at the BOTTOM (y=-1.56). With flipY=true, canvas y=H maps to TOP (v=0)
     and canvas y=0 maps to BOTTOM (v=1). So upper-third shoulder is at y ≈ 0.68 * H! */
  function createChrysalisTextures() {
    var W = 512, H = 1024;
    var c = mkCanvas(W, H), g = c.getContext('2d');
    var cm = mkCanvas(W, H), gm = cm.getContext('2d');
    gm.fillStyle = '#080808'; gm.fillRect(0, 0, W, H);

    /* Vertical jade-emerald gradient (y=H is top near silk pad, y=0 is bottom tip) */
    var grad = g.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0.00, '#1d6e3a');
    grad.addColorStop(0.22, '#2d8f4f');
    grad.addColorStop(0.45, '#46b062');
    grad.addColorStop(0.75, '#59be6c');
    grad.addColorStop(1.00, '#338c4e');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);

    /* Subtle dark-emerald translucent wing outline inside lower half (y = 120..620) */
    var innerWing = g.createRadialGradient(W * 0.5, H * 0.36, 16, W * 0.5, H * 0.36, 210);
    innerWing.addColorStop(0, 'rgba(210, 95, 14, 0.34)');
    innerWing.addColorStop(0.55, 'rgba(130, 82, 16, 0.16)');
    innerWing.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = innerWing; g.fillRect(0, 0, W, H);

    /* Folded wing seams & subtle abdominal rings */
    g.strokeStyle = 'rgba(16, 68, 34, 0.42)';
    g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(75, 680); g.bezierCurveTo(155, 510, 120, 310, 185, 120); g.stroke();
    g.beginPath(); g.moveTo(435, 680); g.bezierCurveTo(355, 510, 390, 310, 325, 120); g.stroke();
    g.strokeStyle = 'rgba(20, 76, 38, 0.25)'; g.lineWidth = 2;
    for (var i = 0; i < 6; i++) {
      var yy = 735 + i * 38;
      g.beginPath(); g.moveTo(0, yy); g.quadraticCurveTo(W / 2, yy - 12, W, yy); g.stroke();
    }

    /* Iconic Monarch UPPER-SHOULDER Jet-Black & 24K Metallic Gold Crown Ring (y = 675) */
    var ry = 675;
    g.fillStyle = '#0e0b08';
    g.fillRect(0, ry - 12, W, 16);
    g.fillRect(0, ry + 26, W, 8);
    for (var j = 0; j < 20; j++) {
      var x = (j + 0.5) * (W / 20);
      var rg = g.createRadialGradient(x - 2, ry + 7, 1, x, ry + 9, 10);
      rg.addColorStop(0, '#fff9c8');
      rg.addColorStop(0.45, '#f2c12e');
      rg.addColorStop(1, '#8c5a08');
      g.fillStyle = rg;
      g.beginPath(); g.arc(x, ry + 9, 8.8, 0, Math.PI * 2); g.fill();
      gm.fillStyle = '#ffffff';
      gm.beginPath(); gm.arc(x, ry + 9, 9.5, 0, Math.PI * 2); gm.fill();
    }

    /* Authentic metallic gold twin-spots along lower body (y = 160..540) */
    var goldSpots = [
      [110, 480], [256, 480], [402, 480],
      [150, 340], [362, 340],
      [190, 210], [322, 210],
      [256, 145]
    ];
    goldSpots.forEach(function (pt) {
      var rg2 = g.createRadialGradient(pt[0] - 1.5, pt[1] - 1.5, 1, pt[0], pt[1], 7.5);
      rg2.addColorStop(0, '#fff8c4');
      rg2.addColorStop(0.5, '#f0be2c');
      rg2.addColorStop(1, '#94620a');
      g.fillStyle = rg2;
      g.beginPath(); g.arc(pt[0], pt[1], 6.5, 0, Math.PI * 2); g.fill();
      gm.fillStyle = '#ffffff';
      gm.beginPath(); gm.arc(pt[0], pt[1], 7.5, 0, Math.PI * 2); gm.fill();
    });

    addScaleGrain(g, W, H, 0.035, 31, 30000);
    return { map: makeTex(c, true), metal: makeTex(cm, false) };
  }

  function createBarkTex() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#5c3f28'; g.fillRect(0, 0, 256, 256);
    var r = rng(14);
    for (var i = 0; i < 180; i++) {
      var x = r() * 256, w = 1 + r() * 3.5;
      g.fillStyle = r() > 0.5 ? 'rgba(26,14,6,0.38)' : 'rgba(155,118,78,0.3)';
      g.fillRect(x, 0, w, 256);
    }
    addScaleGrain(g, 256, 256, 0.09, 7, 4500);
    var t = makeTex(c, true);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 4);
    return t;
  }

  function createBodyDotTex() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#120e0b'; g.fillRect(0, 0, 256, 256);
    var r = rng(5);
    g.fillStyle = 'rgba(248,244,234,0.95)';
    for (var i = 0; i < 30; i++) {
      g.beginPath(); g.arc(r() * 256, r() * 256, 2.5 + r() * 3.2, 0, Math.PI * 2); g.fill();
    }
    addScaleGrain(g, 256, 256, 0.08, 6, 3000);
    var t = makeTex(c, true);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }

  var foreTex = createWingTextures('fore');
  var hindTex = createWingTextures('hind');
  var chrysTex = createChrysalisTextures();
  var catTex = createCaterpillarTex();
  var barkTex = createBarkTex();
  var bodyDotTex = createBodyDotTex();

  /* ------------------------------------------------------------------ */
  /* Physically-Based Materials                                          */
  /* ------------------------------------------------------------------ */
  var M = {
    wingFore: new THREE.MeshPhysicalMaterial({
      map: foreTex.map,
      bumpMap: foreTex.bump,
      bumpScale: 0.014,
      emissiveMap: foreTex.map,
      emissive: new THREE.Color(0xd85a08),
      emissiveIntensity: 0.06,
      roughness: 0.64,
      metalness: 0.02,
      clearcoat: 0.1,
      clearcoatRoughness: 0.55,
      side: THREE.DoubleSide,
      alphaTest: 0.48,
      envMapIntensity: 0.36
    }),
    wingHind: new THREE.MeshPhysicalMaterial({
      map: hindTex.map,
      bumpMap: hindTex.bump,
      bumpScale: 0.014,
      emissiveMap: hindTex.map,
      emissive: new THREE.Color(0xd85a08),
      emissiveIntensity: 0.06,
      roughness: 0.64,
      metalness: 0.02,
      clearcoat: 0.1,
      clearcoatRoughness: 0.55,
      side: THREE.DoubleSide,
      alphaTest: 0.48,
      envMapIntensity: 0.36
    }),
    body: new THREE.MeshStandardMaterial({
      map: bodyDotTex, color: 0xffffff, roughness: 0.85, metalness: 0.02, envMapIntensity: 0.35
    }),
    eye: new THREE.MeshPhysicalMaterial({
      color: 0x050403, roughness: 0.08, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.5
    }),
    black: new THREE.MeshStandardMaterial({ color: 0x0e0a08, roughness: 0.52, envMapIntensity: 0.45 }),
    cat: new THREE.MeshPhysicalMaterial({
      map: catTex, roughness: 0.48, metalness: 0.0, clearcoat: 0.32, clearcoatRoughness: 0.38, envMapIntensity: 0.48
    }),
    chrys: new THREE.MeshPhysicalMaterial({
      map: chrysTex.map,
      metalnessMap: chrysTex.metal,
      roughness: 0.24,
      metalness: 0.72,
      clearcoat: 0.72,
      clearcoatRoughness: 0.16,
      envMapIntensity: 0.58,
      emissive: new THREE.Color(0x1f6b36),
      emissiveIntensity: 0.04
    }),
    bark: new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.94, envMapIntensity: 0.25 }),
    silk: new THREE.MeshStandardMaterial({ color: 0x16110d, roughness: 0.62 })
  };

  /* ------------------------------------------------------------------ */
  /* Wing + Butterfly Geometry Builders                                  */
  /* ------------------------------------------------------------------ */
  var WING_SPAN_UNIT = 1.22;
  var SEG = 22;

  function createWingGeometry(root) {
    var g = new THREE.PlaneGeometry(1, 1, SEG, SEG);
    var pos = g.attributes.position, uv = g.attributes.uv;
    var rU = root[0] / WS, rV = 1 - root[1] / WS;
    for (var i = 0; i < pos.count; i++) {
      pos.setXYZ(i, (uv.getX(i) - rU) * WING_SPAN_UNIT, (uv.getY(i) - rV) * WING_SPAN_UNIT, 0);
    }
    g.userData.base = Float32Array.from(pos.array);
    g.userData.reach = 0.96 * WING_SPAN_UNIT;
    return g;
  }

  function shadowDepth(map) {
    return new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking, map: map, alphaTest: 0.48, side: THREE.DoubleSide
    });
  }

  function makeWingMesh(isFore) {
    var geo = createWingGeometry(isFore ? FORE_ROOT : HIND_ROOT);
    var m = new THREE.Mesh(geo, isFore ? M.wingFore : M.wingHind);
    m.castShadow = true;
    m.customDepthMaterial = shadowDepth(isFore ? foreTex.map : hindTex.map);
    m.position.z = isFore ? 0.014 : 0;
    m.position.y = isFore ? 0.065 : -0.025;
    return m;
  }

  function deformWing(mesh, lag, camberBoost) {
    var geo = mesh.geometry, base = geo.userData.base, reach = geo.userData.reach;
    var pos = geo.attributes.position, arr = pos.array;
    for (var i = 0; i < pos.count; i++) {
      var bx = base[i * 3], by = base[i * 3 + 1];
      var xn = clamp01(bx / reach);
      var z = -(0.065 + camberBoost) * xn * xn * WING_SPAN_UNIT
        + lag * Math.pow(xn, 1.55) * 0.55
        + 0.016 * Math.sin(by * 4.2) * xn;
      arr[i * 3 + 2] = z;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function buildButterfly() {
    var root = new THREE.Group();
    var body = new THREE.Group();
    root.add(body);

    var thorax = new THREE.Mesh(new THREE.SphereGeometry(0.105, 28, 20), M.body);
    thorax.scale.set(0.98, 1.58, 0.94);
    thorax.position.y = 0.1;
    thorax.castShadow = true;
    body.add(thorax);

    var head = new THREE.Mesh(new THREE.SphereGeometry(0.072, 24, 18), M.body);
    head.position.set(0, 0.285, 0.012);
    head.castShadow = true;
    body.add(head);

    [-1, 1].forEach(function (s) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 18, 14), M.eye);
      eye.position.set(s * 0.048, 0.295, 0.032);
      body.add(eye);
    });

    var prof = [];
    for (var i = 0; i <= 26; i++) {
      var t = i / 26;
      var r = 0.078 * Math.pow(Math.sin(Math.min(1, 0.14 + t * 0.94) * Math.PI * 0.62), 0.9) * (1 - 0.80 * Math.pow(t, 1.55));
      prof.push(new THREE.Vector2(Math.max(0.004, r), -t * 0.82));
    }
    var abdomen = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), M.body);
    abdomen.castShadow = true;
    body.add(abdomen);

    [-1, 1].forEach(function (s) {
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.02, 0.32, 0.02),
        new THREE.Vector3(s * 0.075, 0.54, 0.06),
        new THREE.Vector3(s * 0.16, 0.76, 0.07),
        new THREE.Vector3(s * 0.24, 0.93, 0.04)
      ]);
      var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.006, 6, false), M.black);
      tube.castShadow = true;
      body.add(tube);
      var club = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), M.black);
      club.scale.set(1, 1.75, 1);
      club.position.copy(curve.getPoint(1));
      club.rotation.z = s * 0.45;
      body.add(club);
    });

    for (var l = 0; l < 3; l++) {
      [-1, 1].forEach(function (s) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.0038, 0.14, 6), M.black);
        leg.position.set(s * 0.055, 0.16 - l * 0.045, 0.078);
        leg.rotation.set(0.6, 0, s * 0.72);
        body.add(leg);
      });
    }

    var wingR = new THREE.Group(), wingL = new THREE.Group();
    wingR.position.set(0.045, 0.105, 0);
    wingL.position.set(-0.045, 0.105, 0);
    wingL.scale.x = -1;
    var foreR = makeWingMesh(true), hindR = makeWingMesh(false);
    var foreL = makeWingMesh(true), hindL = makeWingMesh(false);
    wingR.add(foreR, hindR);
    wingL.add(foreL, hindL);
    root.add(wingR, wingL);

    root.userData.wings = { R: wingR, L: wingL, meshes: [foreR, hindR, foreL, hindL] };
    root.userData.body = body;
    return root;
  }

  function poseButterfly(b, theta, wingScale, lag, camberBoost) {
    var w = b.userData.wings;
    w.R.rotation.y = -theta;
    w.L.rotation.y = theta;
    w.R.scale.set(wingScale, wingScale, wingScale);
    w.L.scale.set(-wingScale, wingScale, wingScale);
    for (var i = 0; i < w.meshes.length; i++) {
      deformWing(w.meshes[i], lag, camberBoost || 0);
    }
  }

  /* ------------------------------------------------------------------ */
  /* STAGE 1 — Cohesive Plump Monarch Caterpillar + Filaments + Prolegs  */
  /* ------------------------------------------------------------------ */
  function buildStage1Caterpillar() {
    var grp = new THREE.Group();
    var cat = new THREE.Group();
    var segGeo = new THREE.SphereGeometry(1, 32, 24);
    segGeo.rotateZ(Math.PI / 2);

    var radii = [0.22, 0.24, 0.255, 0.268, 0.274, 0.274, 0.268, 0.258, 0.242, 0.218, 0.185];
    var segWraps = [];
    for (var s = 0; s < radii.length; s++) {
      /* Unscaled wrapper group so legs & filaments keep true proportions! */
      var wrap = new THREE.Group();
      var m = new THREE.Mesh(segGeo, M.cat);
      m.scale.set(radii[s] * 0.94, radii[s], radii[s]);
      m.castShadow = true;
      wrap.add(m);

      /* Rear fleshy prolegs (unscaled!) */
      if (s >= 5 && s <= 9) {
        [-1, 1].forEach(function (zz) {
          var pl = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.038, 0.15, 10), M.black);
          pl.position.set(0, -radii[s] * 0.92, zz * 0.10);
          pl.castShadow = true;
          wrap.add(pl);
        });
      }
      /* Front thoracic true legs */
      if (s >= 1 && s <= 3) {
        [-1, 1].forEach(function (zz) {
          var lg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012, 0.13, 6), M.black);
          lg.position.set(0.04, -radii[s] * 0.88, zz * 0.11);
          lg.rotation.z = 0.25;
          wrap.add(lg);
        });
      }

      cat.add(wrap);
      segWraps.push(wrap);
    }

    /* Distinct Head Capsule */
    var headWrap = new THREE.Group();
    var headMesh = new THREE.Mesh(segGeo, M.cat);
    headMesh.scale.set(0.18, 0.20, 0.20);
    headMesh.castShadow = true;
    headWrap.add(headMesh);
    [-1, 1].forEach(function (zz) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 10), M.eye);
      eye.position.set(0.12, 0.04, zz * 0.12);
      headWrap.add(eye);
    });
    cat.add(headWrap);

    /* Signature Curved Black Fleshy Filaments (unscaled, sweeping gracefully!) */
    function addFilaments(parentWrap, rBody, dir, h) {
      [-1, 1].forEach(function (zz) {
        var curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, rBody * 0.82, zz * 0.08),
          new THREE.Vector3(dir * 0.14, rBody * 0.82 + h * 0.55, zz * 0.15),
          new THREE.Vector3(dir * 0.34, rBody * 0.82 + h, zz * 0.20)
        ]);
        var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.018, 8, false), M.black);
        tube.castShadow = true;
        parentWrap.add(tube);
      });
    }
    addFilaments(segWraps[1], radii[1], 1, 0.52);   /* Front pair */
    addFilaments(segWraps[9], radii[9], -1, 0.36);  /* Rear pair */

    cat.position.x = 0.18;
    grp.add(cat);
    grp.userData = { cat: cat, segs: segWraps, head: headWrap, radii: radii };
    return grp;
  }

  function updateStage1(g, t, crawl) {
    var segs = g.userData.segs, radii = g.userData.radii, head = g.userData.head;
    /* Tightly overlapped segments so the body reads as one plump continuous caterpillar */
    var x = 0.86;
    var prevY = 0;
    for (var i = 0; i < segs.length; i++) {
      var ph = t * 2.1 - i * 0.55;
      var arch = Math.max(0, Math.sin(ph)) * crawl;
      var step = radii[i] * (0.78 - 0.14 * arch);
      if (i > 0) x -= step;
      var y = radii[i] * 0.90 + arch * 0.085;
      segs[i].position.set(x, y, 0);
      segs[i].rotation.z = (y - prevY) * 0.8 * (i === 0 ? 0 : 1);
      prevY = y;
    }
    var h = segs[0].position;
    head.position.set(h.x + 0.18, h.y - 0.025 + Math.sin(t * 2.1 + 0.5) * 0.016 * crawl, 0);
    head.rotation.z = -0.14 + Math.sin(t * 1.4) * 0.06 * crawl;
  }

  /* ------------------------------------------------------------------ */
  /* STAGE 2 — Sculpted Jade & 24K-Gold Chrysalis hanging from twig      */
  /* ------------------------------------------------------------------ */
  /* Authentic Monarch chrysalis silhouette: narrow cremaster neck -> crisp
     angled upper-third shoulder ridge (gold crown sits here!) -> sleek
     gently faceted tapering body -> smooth rounded base */
  var CHRYS_PTS = [
    [0.026, 0.00],
    [0.055, -0.09],
    [0.145, -0.20],
    [0.265, -0.34],
    [0.365, -0.49], /* Shoulder ridge where black & 24K gold crown wraps */
    [0.345, -0.56],
    [0.340, -0.78],
    [0.312, -1.04],
    [0.258, -1.26],
    [0.182, -1.42],
    [0.095, -1.52],
    [0.000, -1.56]
  ];
  function chrysalisProfile() {
    var spline = new THREE.SplineCurve(CHRYS_PTS.map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
    return spline.getPoints(76).map(function (p) { return new THREE.Vector2(Math.max(0, p.x), p.y); });
  }

  function buildStage2Chrysalis() {
    var grp = new THREE.Group();

    var len = 1.95;
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-len / 2, -0.02, 0),
      new THREE.Vector3(-len * 0.2, 0.025, 0.015),
      new THREE.Vector3(len * 0.2, -0.005, -0.015),
      new THREE.Vector3(len / 2, 0.03, 0)
    ]);
    var twig = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.052, 12, false), M.bark);
    twig.castShadow = true;
    grp.add(twig);

    var shoot = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.022, 0.26, 8), M.bark);
    shoot.position.set(len * 0.34, 0.13, 0);
    shoot.rotation.z = -0.58;
    shoot.castShadow = true;
    grp.add(shoot);

    var sway = new THREE.Group();
    sway.position.set(0, -0.02, 0);
    grp.add(sway);

    var pad = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), M.silk);
    pad.scale.set(1.5, 0.7, 1);
    sway.add(pad);

    var stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.15, 8), M.silk);
    stalk.position.y = -0.075;
    sway.add(stalk);

    var chrys = new THREE.Mesh(new THREE.LatheGeometry(chrysalisProfile(), 60), M.chrys);
    chrys.position.y = -0.11;
    chrys.castShadow = true;
    chrys.scale.set(1.0, 1.0, 0.92);
    sway.add(chrys);

    grp.userData = { sway: sway, chrys: chrys };
    return grp;
  }

  function buildStage3Emerging() {
    var grp = new THREE.Group();
    var bf = buildButterfly();
    grp.add(bf);
    grp.userData = { bf: bf };
    return grp;
  }

  function buildStage4Butterfly() {
    var grp = new THREE.Group();
    var bf = buildButterfly();
    grp.add(bf);
    grp.userData = { bf: bf };
    return grp;
  }

  /* ------------------------------------------------------------------ */
  /* Assemble Scene & Exact Ascending Diagonal Positions                 */
  /* ------------------------------------------------------------------ */
  var stage1 = buildStage1Caterpillar();
  var stage2 = buildStage2Chrysalis();
  var stage3 = buildStage3Emerging();
  var stage4 = buildStage4Butterfly();
  [stage1, stage2, stage3, stage4].forEach(function (s) { scene.add(s); });

  var layoutCfg = {
    s1: new THREE.Vector3(), s2: new THREE.Vector3(), s3: new THREE.Vector3(), s4: new THREE.Vector3(),
    k1: 1, k2: 1, k3: 1, k4: 1
  };

  function updateLayout() {
    var w = stageWrap.clientWidth || window.innerWidth;
    var h = stageWrap.clientHeight || 560;
    var aspect = w / Math.max(1, h);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);

    var halfW = aspect >= 1.15 ? 5.15 : (aspect >= 0.8 ? 3.65 : 2.50);
    var halfH = Math.max(halfW / aspect, 2.75);
    camera.aspect = aspect;
    camera.fov = 2 * Math.atan(halfH / CAM_Z) * 180 / Math.PI;
    camera.updateProjectionMatrix();

    if (aspect >= 1.15) {
      /* Exact ascending left-to-right arc with generous top/bottom headroom */
      layoutCfg.s1.set(-3.55, -1.70, 0.00); layoutCfg.k1 = 0.88;
      layoutCfg.s2.set(-1.35, -0.18, 0.00); layoutCfg.k2 = 0.98;
      layoutCfg.s3.set(0.82, -0.66, 0.20);  layoutCfg.k3 = 1.06;
      layoutCfg.s4.set(2.78, 0.42, 0.45);   layoutCfg.k4 = 1.38;
    } else if (aspect >= 0.8) {
      layoutCfg.s1.set(-2.25, -1.55, 0.00); layoutCfg.k1 = 0.70;
      layoutCfg.s2.set(-0.82, -0.10, 0.00); layoutCfg.k2 = 0.78;
      layoutCfg.s3.set(0.72, -0.48, 0.20);  layoutCfg.k3 = 0.86;
      layoutCfg.s4.set(1.88, 0.95, 0.40);   layoutCfg.k4 = 1.18;
    } else {
      /* Mobile portrait: generous margins so caterpillar & wings never touch edges */
      layoutCfg.s1.set(-0.78, -2.35, 0.00); layoutCfg.k1 = 0.62;
      layoutCfg.s2.set(0.88, -0.78, 0.00);  layoutCfg.k2 = 0.72;
      layoutCfg.s3.set(-0.78, 0.16, 0.15);  layoutCfg.k3 = 0.78;
      layoutCfg.s4.set(0.62, 1.56, 0.40);   layoutCfg.k4 = 1.00;
    }

    keyLight.shadow.camera.left = -halfW * 1.9;
    keyLight.shadow.camera.right = halfW * 1.9;
    keyLight.shadow.camera.top = halfH * 1.9;
    keyLight.shadow.camera.bottom = -halfH * 1.9;
    keyLight.shadow.camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------------ */
  /* Scroll Reveal + Hover Highlight + Smooth Mouse 3D Parallax          */
  /* ------------------------------------------------------------------ */
  var reveal = 0, revealTarget = 0;
  var hoverStage = -1;
  var pointerX = 0, pointerY = 0, smoothPX = 0, smoothPY = 0;

  stageWrap.addEventListener('pointermove', function (e) {
    var r = stageWrap.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
    pointerY = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
  }, { passive: true });
  stageWrap.addEventListener('pointerleave', function () {
    pointerX = 0; pointerY = 0;
  }, { passive: true });

  pills.forEach(function (pill, idx) {
    pill.addEventListener('mouseenter', function () { hoverStage = idx; });
    pill.addEventListener('mouseleave', function () { hoverStage = -1; });
    pill.addEventListener('click', function () {
      hoverStage = hoverStage === idx ? -1 : idx;
      revealTarget = 1;
    });
  });

  function readScrollProgress() {
    if (typeof window.__bfjForceP === 'number') return window.__bfjForceP;
    if (reduceMotion) return 1;
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var p = (vh * 0.92 - r.top) / (vh * 0.78);
    return clamp01(p);
  }

  var clock = new THREE.Clock();

  function renderFrame() {
    var t = clock.getElapsedTime();
    var sp = readScrollProgress();
    if (sp > revealTarget) revealTarget = sp;
    if (typeof window.__bfjForceP === 'number') {
      reveal = window.__bfjForceP;
    } else {
      reveal += (revealTarget - reveal) * (reduceMotion ? 1 : 0.08);
    }
    var p = reveal;

    smoothPX += (pointerX - smoothPX) * 0.06;
    smoothPY += (pointerY - smoothPY) * 0.06;
    camera.position.x = smoothPX * 0.85;
    camera.position.y = -smoothPY * 0.55;
    camera.lookAt(0, 0, 0);

    var a1 = stageT(p, 0.00, 0.30);
    var a2 = stageT(p, 0.18, 0.50);
    var a3 = stageT(p, 0.38, 0.72);
    var a4 = stageT(p, 0.56, 0.95);
    var acts = [a1, a2, a3, a4];

    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('is-active', acts[i] > 0.35);
    }

    var motion = reduceMotion ? 0 : 1;

    /* ---- STAGE 1: Monarch Caterpillar ---- */
    var o1 = easeOutCubic(a1);
    var h1 = hoverStage === 0 ? 1.12 : 1.0;
    stage1.visible = o1 > 0.01;
    stage1.position.copy(layoutCfg.s1);
    stage1.position.y += (1 - o1) * -0.45;
    stage1.scale.setScalar(Math.max(0.001, layoutCfg.k1 * lerp(0.55, 1, easeOutBack(a1)) * h1));
    stage1.rotation.set(0.18 + smoothPY * 0.08, -0.14 + smoothPX * 0.14, 0.02);
    updateStage1(stage1, t, motion);

    /* ---- STAGE 2: Jade & Gold Chrysalis ---- */
    var o2 = easeOutCubic(a2);
    var h2 = hoverStage === 1 ? 1.12 : 1.0;
    stage2.visible = o2 > 0.01;
    stage2.position.copy(layoutCfg.s2);
    stage2.position.y += (1 - o2) * 0.55;
    stage2.scale.setScalar(Math.max(0.001, layoutCfg.k2 * lerp(0.55, 1, easeOutBack(a2)) * h2));
    stage2.rotation.set(smoothPY * 0.06, Math.sin(t * 0.45) * 0.22 * motion + smoothPX * 0.18, 0);
    stage2.userData.sway.rotation.z = Math.sin(t * 1.05) * 0.04 * motion;
    stage2.userData.sway.rotation.x = Math.sin(t * 0.75 + 1.1) * 0.025 * motion;
    stage2.userData.chrys.scale.set(
      lerp(0.65, 1, o2),
      lerp(0.45, 1, o2),
      lerp(0.65, 0.92, o2)
    );

    /* ---- STAGE 3: Emerging Butterfly in 3/4 side-profile ---- */
    var o3 = easeOutCubic(a3);
    var h3 = hoverStage === 2 ? 1.12 : 1.0;
    stage3.visible = o3 > 0.01;
    var bf3 = stage3.userData.bf;
    stage3.position.copy(layoutCfg.s3);
    stage3.position.y += (1 - o3) * -0.5 + Math.sin(t * 1.45 + 0.8) * 0.055 * motion;
    stage3.scale.setScalar(Math.max(0.001, layoutCfg.k3 * lerp(0.52, 1, easeOutBack(a3)) * h3));
    bf3.rotation.set(
      -0.30 + smoothPY * 0.10,
      -0.60 + Math.sin(t * 0.6) * 0.09 * motion + smoothPX * 0.16,
      -0.48 + Math.sin(t * 0.9) * 0.04 * motion
    );
    var flap3 = Math.sin(t * 2.15 + 0.5) * motion;
    var theta3 = lerp(1.36, 0.84, easeInOut(a3)) + flap3 * 0.24;
    var lag3 = Math.cos(t * 2.15 + 0.5) * 0.22 * motion;
    poseButterfly(bf3, theta3, lerp(0.72, 0.95, o3), lag3, 0.025);

    /* ---- STAGE 4: Full-Grown Majestic Butterfly soaring top-right ---- */
    var o4 = easeOutCubic(a4);
    var h4 = hoverStage === 3 ? 1.10 : 1.0;
    stage4.visible = o4 > 0.01;
    var bf4 = stage4.userData.bf;
    var flapSpeed = 3.0;
    var flap4 = Math.sin(t * flapSpeed) * motion;
    var lag4 = Math.cos(t * flapSpeed) * 0.44 * motion;
    stage4.position.copy(layoutCfg.s4);
    stage4.position.y += (1 - o4) * -0.6 + Math.sin(t * 1.15) * 0.09 * motion + flap4 * 0.055;
    stage4.position.x += Math.sin(t * 0.65) * 0.10 * motion;
    stage4.scale.setScalar(Math.max(0.001, layoutCfg.k4 * lerp(0.48, 1, easeOutBack(a4)) * h4));
    bf4.rotation.set(
      -0.46 + Math.sin(t * 0.8) * 0.045 * motion + smoothPY * 0.12,
      0.22 + Math.sin(t * 0.55) * 0.12 * motion + smoothPX * 0.20,
      -0.42 + Math.sin(t * 0.7) * 0.04 * motion
    );
    var theta4 = lerp(1.15, 0.28, easeInOut(a4)) + flap4 * 0.52;
    poseButterfly(bf4, theta4, 1.0, lag4, 0.01);

    renderer.render(scene, camera);
  }

  var running = false, raf = 0, onScreen = false;
  function tick() {
    if (!running) return;
    renderFrame();
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running) return;
    running = true;
    clock.start();
    tick();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function checkVis() {
    var r = section.getBoundingClientRect();
    var vis = r.bottom > -160 && r.top < window.innerHeight + 160 && !document.hidden;
    if (vis && !onScreen) { onScreen = true; start(); }
    else if (!vis && onScreen) { onScreen = false; stop(); }
  }

  updateLayout();
  window.addEventListener('resize', function () { updateLayout(); if (!running) renderFrame(); });
  window.addEventListener('scroll', checkVis, { passive: true });
  document.addEventListener('visibilitychange', checkVis);
  checkVis();
  renderFrame();
  section.classList.add('is-ready');
  window.__bfj = { renderFrame: renderFrame, updateLayout: updateLayout, scene: scene, camera: camera, renderer: renderer };
})();
