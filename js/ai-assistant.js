/**
 * BUTTERCUP ADVERTISING STUDIO - UNIVERSAL 3D AI ASSISTANT & RADIANT PARTICLE SYSTEM
 * Global Interactive Component & Conversational Intelligence Engine
 */

(function () {
  'use strict';

  // Prevent multiple initializations on the same page
  if (window.__BUTTERCUP_AI_INITIALIZED__) return;
  window.__BUTTERCUP_AI_INITIALIZED__ = true;

  // ==========================================================================
  // 1. AUTO-INJECT DOM ELEMENTS IF NOT ALREADY PRESENT
  // ==========================================================================
  function ensureAiElements() {
    // 1.1 Floating Trigger Widget (Bottom-Right)
    let widget = document.getElementById('btr-ai-orb-widget');
    if (!widget) {
      // Check if legacy toggle exists
      const legacyToggle = document.getElementById('orb-toggle');
      if (legacyToggle && legacyToggle.parentElement) {
        // Wrap existing or insert adjacent
        widget = document.createElement('div');
        widget.id = 'btr-ai-orb-widget';
        widget.className = 'btr-ai-orb-widget';
        legacyToggle.parentNode.insertBefore(widget, legacyToggle);
        widget.appendChild(legacyToggle);
      } else {
        widget = document.createElement('div');
        widget.id = 'btr-ai-orb-widget';
        widget.className = 'btr-ai-orb-widget';
        widget.innerHTML = `
          <canvas class="btr-ai-sparks-canvas" id="btr-ai-sparks-canvas" width="440" height="440"></canvas>
          <div class="btr-ai-orb-halo"></div>
          <button class="btr-ai-orb-button em-orb-toggle" id="orb-toggle" title="Chat with Buttercup AI" aria-label="Open Buttercup AI Assistant">
            <canvas id="orb-canvas" class="em-orb-canvas" width="160" height="160"></canvas>
          </button>
        `;
        document.body.appendChild(widget);
      }
    }

    // Ensure sparks canvas is present inside widget
    if (!document.getElementById('btr-ai-sparks-canvas')) {
      const sparksCv = document.createElement('canvas');
      sparksCv.id = 'btr-ai-sparks-canvas';
      sparksCv.className = 'btr-ai-sparks-canvas';
      sparksCv.width = 440;
      sparksCv.height = 440;
      widget.insertBefore(sparksCv, widget.firstChild);
    }

    // Ensure halo is present inside widget
    if (!widget.querySelector('.btr-ai-orb-halo')) {
      const halo = document.createElement('div');
      halo.className = 'btr-ai-orb-halo';
      widget.insertBefore(halo, widget.querySelector('.em-orb-toggle, .btr-ai-orb-button'));
    }

    // 1.2 Conversational Dynamic Pop Bubble
    let bubble = document.getElementById('em-ai-bubble');
    const bubbleMarkup = `
      <span class="btr-bubble-pulse" title="AI Online"></span>
      <span class="btr-bubble-text" id="btr-bubble-text">Click to talk with Buttercup AI</span>
      <span class="btr-bubble-spark">✦</span>
    `;
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'em-ai-bubble';
      bubble.className = 'btr-ai-bubble em-ai-bubble';
      bubble.setAttribute('role', 'tooltip');
      bubble.innerHTML = bubbleMarkup;
      widget.appendChild(bubble);
    } else {
      bubble.innerHTML = bubbleMarkup;
      if (bubble.parentElement !== widget) {
        widget.appendChild(bubble);
      }
    }

    // 1.3 Full-Screen AI Assistant Modal Overlay
    let overlay = document.getElementById('em-ai-overlay');
    const overlayMarkup = `
      <canvas id="em-ai-webgl-canvas" class="em-ai-webgl-canvas"></canvas>

      <div class="em-ai-ui-layer">
        <!-- Top Bar -->
        <div class="em-ai-top-bar">
          <a href="index.html" class="em-ai-logo-wrap" id="em-ai-home-link" title="Back to Buttercup Home" aria-label="Buttercup Home" onclick="if(window.goButtercupHome){window.goButtercupHome();return false;}">
            <span class="em-ai-brand-name">Buttercup®</span>
            <span class="em-ai-star-mark">✦</span>
          </a>
          <div class="em-ai-top-right">
            <a href="#contact" class="em-ai-talk-link" id="emAiTalkLink">Let's talk</a>
            <button type="button" class="em-ai-close-btn" id="em-ai-close" title="Close AI Assistant" aria-label="Close Assistant" onclick="if(window.closeButtercupAi){window.closeButtercupAi();return false;}else if(window.closeAiModal){window.closeAiModal();return false;}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Left Content Area -->
        <div class="em-ai-content-area">
          <div class="em-ai-whisper-text">
            I'm L.I.S.A, Buttercup's Interactive Super Assistant. Basically, I run this place.
          </div>

          <div class="em-ai-headline-wrap">
            <h1 class="em-ai-headline" id="em-ai-headline">
              OMG! You're here! I was just manifesting this. Ask away!
            </h1>
            <div class="em-ai-response-details" id="em-ai-response-details" style="display: none;"></div>
          </div>

          <!-- Suggestion Chips Grid -->
          <div class="em-ai-chips-grid" id="em-ai-chips">
            <button type="button" class="em-ai-chip" data-query="Request a Free Quote">Start a project</button>
            <button type="button" class="em-ai-chip" data-query="Join the team">Join the team</button>
            <button type="button" class="em-ai-chip" data-query="Drop a quick word">Drop a quick word</button>
            <button type="button" class="em-ai-chip" data-query="Discover our culture">Discover our culture</button>
          </div>

          <!-- Sleek Custom Prompt Input -->
          <form class="em-ai-input-form" id="em-ai-form">
            <div class="em-ai-input-wrapper">
              <button type="button" class="em-ai-mic-btn" id="em-ai-mic-btn" title="Speak via Microphone" aria-label="Voice Dictation">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <input type="text" id="em-ai-input" class="em-ai-input-field" placeholder="Ask me anything about Buttercup..." autocomplete="off" />
              <button type="submit" class="em-ai-send-btn" id="em-ai-send-btn" title="Send message" aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </form>

          <!-- Write us email line -->
          <div class="em-ai-write-us">
            <span>Write us:</span>
            <a href="mailto:info@buttercup.in" id="emAiMailLink">info@buttercup.in</a>
            <button type="button" class="em-ai-copy-btn" id="emAiCopyBtn" title="Copy email address" aria-label="Copy email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Bottom Bar Controls -->
        <div class="em-ai-bottom-bar">
          <button class="em-ai-reset-btn" id="em-ai-reset-btn" title="Reset assistant" aria-label="Reset assistant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>

          <div class="em-ai-sound-pill" id="em-ai-sound-toggle" title="Toggle voice sound" role="button" tabindex="0" aria-label="Toggle voice sound">
            <div class="em-ai-sound-icon is-active" id="em-icon-sound-on">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </div>
            <div class="em-ai-sound-icon" id="em-icon-sound-off">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'em-ai-overlay';
      overlay.className = 'em-ai-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Buttercup AI Assistant');
      overlay.innerHTML = overlayMarkup;
      document.body.appendChild(overlay);
    } else {
      overlay.innerHTML = overlayMarkup;
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiSystem);
  } else {
    initAiSystem();
  }
  window.addEventListener('load', () => {
    initFooterBrandAnimation();
    initWidgetFooterCollision();
  });

  function initFooterBrandAnimation() {
    const brandEls = document.querySelectorAll('.footer-bottom-brand-text');
    brandEls.forEach(el => {
      if (el.dataset.animated) return;
      el.dataset.animated = 'true';

      const text = el.textContent.trim();
      if (text.toLowerCase() === 'buttercup') {
        el.innerHTML = '';
        el.classList.add('has-split');
        text.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'btr-footer-char';
          span.style.setProperty('--i', i);
          span.textContent = char;
          el.appendChild(span);
        });
      }

      // Smooth interactive magnetic lift on mouse move with cached metrics
      let charCenters = [];
      let elRect = null;

      function cacheMetrics() {
        elRect = el.getBoundingClientRect();
        const chars = el.querySelectorAll('.btr-footer-char');
        charCenters = Array.from(chars).map(c => {
          const cRect = c.getBoundingClientRect();
          return (cRect.left + cRect.right) / 2 - elRect.left;
        });
      }

      el.addEventListener('mouseenter', cacheMetrics, { passive: true });

      el.addEventListener('mousemove', (e) => {
        if (!elRect || charCenters.length === 0) cacheMetrics();
        const chars = el.querySelectorAll('.btr-footer-char');
        const mouseX = e.clientX - elRect.left;
        const maxDist = 140; // Proximity field in px

        for (let i = 0; i < chars.length; i++) {
          const dist = Math.abs(mouseX - (charCenters[i] || 0));
          if (dist < maxDist) {
            const power = 1 - (dist / maxDist);
            const lift = Math.round(power * 28);
            const scale = 1 + (power * 0.12);
            chars[i].style.transform = `translateY(-${lift}px) scale(${scale})`;
            chars[i].classList.add('is-active-hover');
          } else {
            chars[i].style.transform = '';
            chars[i].classList.remove('is-active-hover');
          }
        }
      }, { passive: true });

      el.addEventListener('mouseleave', () => {
        const chars = el.querySelectorAll('.btr-footer-char');
        chars.forEach((c) => {
          c.style.transform = '';
          c.classList.remove('is-active-hover');
        });
      });

      // Joyful ripple wave on click
      el.addEventListener('click', () => {
        const chars = el.querySelectorAll('.btr-footer-char');
        chars.forEach((c, i) => {
          setTimeout(() => {
            c.classList.add('is-clicked');
            setTimeout(() => c.classList.remove('is-clicked'), 500);
          }, i * 45);
        });
      });
    });
  }

  function initWidgetFooterCollision() {
    const widget = document.getElementById('btr-ai-orb-widget');
    if (!widget) return;

    let ticking = false;

    function updateCollision() {
      const footers = document.querySelectorAll('.section.is-footer, .footer-section, footer');
      if (!footers || footers.length === 0) {
        widget.style.transform = '';
        return;
      }
      const footer = footers[footers.length - 1];
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const overlap = windowHeight - footerRect.top;

      if (overlap > 0) {
        // Footer section has entered viewport: push widget up in 1:1 sync with scroll
        widget.style.transform = `translate3d(0, -${Math.round(overlap)}px, 0)`;
      } else {
        widget.style.transform = '';
      }
    }

    function onScrollOrResize() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateCollision();
          ticking = false;
        });
        ticking = true;
      }
    }

    // Native scroll & resize listeners
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Sync with Lenis smooth scroll if active
    if (window.lenis && typeof window.lenis.on === 'function') {
      window.lenis.on('scroll', onScrollOrResize);
    } else {
      let tries = 0;
      const lenisInterval = setInterval(() => {
        tries++;
        if (window.lenis && typeof window.lenis.on === 'function') {
          window.lenis.on('scroll', onScrollOrResize);
          clearInterval(lenisInterval);
        } else if (tries > 30) {
          clearInterval(lenisInterval);
        }
      }, 200);
    }

    // Run initial alignment
    updateCollision();
  }

  function initAiSystem() {
    ensureAiElements();
    initFooterBrandAnimation();
    initWidgetFooterCollision();

    // ==========================================================================
    // 2. ELEMENT REFERENCES & STATE
    // ==========================================================================
    const orbToggle = document.getElementById('orb-toggle');
    const aiBubble = document.getElementById('em-ai-bubble');
    const aiOverlay = document.getElementById('em-ai-overlay');
    const aiCloseBtn = document.getElementById('em-ai-close');
    const aiHeadline = document.getElementById('em-ai-headline');
    const aiResponseDetails = document.getElementById('em-ai-response-details');
    const aiForm = document.getElementById('em-ai-form');
    const aiInput = document.getElementById('em-ai-input');
    const aiChips = document.getElementById('em-ai-chips');
    const aiMicBtn = document.getElementById('em-ai-mic-btn');
    const aiResetBtn = document.getElementById('em-ai-reset-btn');
    const aiTalkLink = document.getElementById('emAiTalkLink');
    const aiCopyBtn = document.getElementById('emAiCopyBtn');
    const aiSoundToggle = document.getElementById('em-ai-sound-toggle');
    const iconSoundOn = document.getElementById('em-icon-sound-on');
    const iconSoundOff = document.getElementById('em-icon-sound-off');
    const webglCanvas = document.getElementById('em-ai-webgl-canvas');

    let isModalOpen = false;
    let isAiSoundEnabled = true;
    let isAiSpeaking = false;
    let isAiListening = false;
    let isAiThinking = false;
    let isHoveringOrb = false;
    let geminiApiKey = localStorage.getItem('buttercup_gemini_key') || '';
    let lisa3D = null;

    function ensureThreeLoaded(callback) {
      if (typeof THREE !== 'undefined') {
        callback();
        return;
      }
      const existing = document.querySelector('script[src*="three.min.js"]');
      if (existing) {
        if (window.THREE) {
          callback();
        } else {
          existing.addEventListener('load', callback);
        }
        return;
      }
      const script = document.createElement('script');
      let prefix = '';
      const myScript = document.querySelector('script[src*="ai-assistant.js"]');
      if (myScript && myScript.src) {
        const src = myScript.getAttribute('src');
        const idx = src.indexOf('js/ai-assistant.js');
        if (idx !== -1) {
          prefix = src.substring(0, idx);
        }
      }
      script.src = prefix + 'js/vendor/three.min.js';
      script.onload = () => callback();
      script.onerror = () => {
        const cdn = document.createElement('script');
        cdn.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        cdn.onload = () => callback();
        document.head.appendChild(cdn);
      };
      document.head.appendChild(script);
    }

    // Pre-load Three.js in background so modal opens instantly
    ensureThreeLoaded(() => {
      const cv = document.getElementById('em-ai-webgl-canvas');
      if (cv && !lisa3D) {
        lisa3D = initLisa3D(cv);
      }
    });

    // ==========================================================================
    // 3. APPLE INTELLIGENCE / SIRI RESONANCE & DIAMOND STARDUST ENGINE
    //    Ethereal concentric harmonic rings & luxury diamond micro-stars (✦)
    // ==========================================================================
    const sparksCanvas = document.getElementById('btr-ai-sparks-canvas');
    if (sparksCanvas) {
      const sctx = sparksCanvas.getContext('2d');
      const harmonicRings = [];
      const diamondStars = [];
      const stardust = [];
      let auraFrame = 0;

      // Concentric Harmonic Resonance Waves (Siri Aura Ripples)
      class HarmonicRing {
        constructor(isBurst = false) {
          this.cx = 220;
          this.cy = 220;
          this.radius = 66; // Just outside the 64px button
          this.maxRadius = (isBurst ? 210 : 185) + Math.random() * 20;
          this.life = 0;
          this.maxLife = isBurst ? 70 : 85;
          this.speed = isBurst ? (2.2 + Math.random() * 0.8) : (1.35 + Math.random() * 0.4);
          this.angle = Math.random() * Math.PI * 2;
        }

        update() {
          this.life++;
          this.radius += this.speed;
          return this.life < this.maxLife;
        }

        draw(ctx) {
          const p = this.life / this.maxLife;
          const alpha = Math.sin(p * Math.PI) * 0.42;
          if (alpha <= 0.01) return;

          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);

          // Siri Chromatic Gradient Stroke (Cyan -> Violet -> Magenta)
          const gx1 = this.cx + Math.cos(this.angle) * this.radius;
          const gy1 = this.cy + Math.sin(this.angle) * this.radius;
          const gx2 = this.cx - Math.cos(this.angle) * this.radius;
          const gy2 = this.cy - Math.sin(this.angle) * this.radius;

          const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
          grad.addColorStop(0, `rgba(56, 189, 248, ${alpha * 0.95})`);  // Electric Cyan
          grad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha})`);       // Radiant Violet
          grad.addColorStop(1, `rgba(244, 63, 94, ${alpha * 0.85})`);   // Neon Rose

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6 * (1 - p * 0.45);
          ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Luxury 4-Pointed Diamond Stars (✦)
      class DiamondStar {
        constructor(isBurst = false) {
          const angle = Math.random() * Math.PI * 2;
          const dist = (isBurst ? 55 : 68) + Math.random() * (isBurst ? 120 : 90);
          this.x = 220 + Math.cos(angle) * dist;
          this.y = 220 + Math.sin(angle) * dist;
          this.life = 0;
          this.maxLife = isBurst ? (35 + Math.random() * 25) : (45 + Math.random() * 30);
          this.size = 2.4 + Math.random() * 3.6;
          this.rot = Math.random() * Math.PI;

          const PALETTE = [
            { r: 255, g: 255, b: 255 }, // Pure White
            { r: 240, g: 171, b: 252 }, // Soft Pink-Lavender
            { r: 56,  g: 189, b: 248 }, // Electric Cyan
            { r: 253, g: 224, b: 71  }  // Sunlight Gold
          ];
          this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        }

        update() {
          this.life++;
          this.rot += 0.015;
          return this.life < this.maxLife;
        }

        draw(ctx) {
          const p = this.life / this.maxLife;
          const alpha = Math.sin(p * Math.PI);
          if (alpha <= 0.01) return;
          const s = this.size * alpha;

          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rot);
          ctx.globalCompositeOperation = 'screen';

          // 4-Point Diamond Star Path
          ctx.beginPath();
          ctx.moveTo(0, -s * 2.2);
          ctx.lineTo(s * 0.45, -s * 0.45);
          ctx.lineTo(s * 2.2, 0);
          ctx.lineTo(s * 0.45, s * 0.45);
          ctx.lineTo(0, s * 2.2);
          ctx.lineTo(-s * 0.45, s * 0.45);
          ctx.lineTo(-s * 2.2, 0);
          ctx.lineTo(-s * 0.45, -s * 0.45);
          ctx.closePath();

          ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.95})`;
          ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
          ctx.shadowBlur = 10;
          ctx.fill();

          // Brilliant White Specular Glint
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // Micro Ambient Stardust (Soft drifting points of light, no trails)
      class AmbientDust {
        constructor() {
          const angle = Math.random() * Math.PI * 2;
          const dist = 65 + Math.random() * 85;
          this.x = 220 + Math.cos(angle) * dist;
          this.y = 220 + Math.sin(angle) * dist;
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.r = 0.8 + Math.random() * 1.4;
          this.life = 0;
          this.maxLife = 50 + Math.random() * 40;
          this.color = Math.random() < 0.5 ? '240, 171, 252' : '56, 189, 248';
        }

        update() {
          this.life++;
          this.x += this.vx;
          this.y += this.vy;
          return this.life < this.maxLife;
        }

        draw(ctx) {
          const p = this.life / this.maxLife;
          const alpha = Math.sin(p * Math.PI) * 0.65;
          if (alpha <= 0.01) return;

          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      let isAuraActive = false;

      function triggerAuraBurst() {
        harmonicRings.push(new HarmonicRing(true));
        for (let i = 0; i < 6; i++) {
          diamondStars.push(new DiamondStar(true));
        }
        startAura();
      }

      function startAura() {
        if (!isAuraActive) {
          isAuraActive = true;
          requestAnimationFrame(animateAura);
        }
      }

      function animateAura() {
        if (document.hidden) {
          isAuraActive = false;
          return;
        }

        // Auto-sleep when idle: saves huge GPU and CPU cycles
        if (!isHoveringOrb && harmonicRings.length === 0 && diamondStars.length === 0 && stardust.length === 0) {
          sctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
          isAuraActive = false;
          return;
        }

        auraFrame++;
        sctx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);

        if (isHoveringOrb) {
          const ringInterval = 45;
          if (auraFrame % ringInterval === 0) {
            harmonicRings.push(new HarmonicRing(false));
          }
          if (Math.random() < 0.25) {
            diamondStars.push(new DiamondStar(false));
          }
          if (stardust.length < 8 && Math.random() < 0.2) {
            stardust.push(new AmbientDust());
          }
        }

        // Update and draw rings
        for (let i = harmonicRings.length - 1; i >= 0; i--) {
          if (!harmonicRings[i].update()) {
            harmonicRings.splice(i, 1);
          } else {
            harmonicRings[i].draw(sctx);
          }
        }

        // Update and draw stardust
        for (let i = stardust.length - 1; i >= 0; i--) {
          if (!stardust[i].update()) {
            stardust.splice(i, 1);
          } else {
            stardust[i].draw(sctx);
          }
        }

        // Update and draw diamond stars
        for (let i = diamondStars.length - 1; i >= 0; i--) {
          if (!diamondStars[i].update()) {
            diamondStars.splice(i, 1);
          } else {
            diamondStars[i].draw(sctx);
          }
        }

        requestAnimationFrame(animateAura);
      }

      // Initial friendly burst on page load, then sleeps cleanly
      setTimeout(triggerAuraBurst, 1500);

      // Interactive hover hooks
      if (orbToggle) {
        orbToggle.addEventListener('mouseenter', () => {
          isHoveringOrb = true;
          triggerAuraBurst();
        }, { passive: true });
        orbToggle.addEventListener('mouseleave', () => {
          isHoveringOrb = false;
        }, { passive: true });
        orbToggle.addEventListener('click', () => {
          triggerAuraBurst();
        });
      }
    }

    // ==========================================================================
    // 3.1 EPHEMERAL POP ENGINE: Pops in every 4s for ~1.2s, then disappears
    // ==========================================================================
    const POP_MESSAGES = [
      "Click to talk with Buttercup AI ✦",
      "Need branding or packaging? Ask me ↗",
      "Explore 50+ landmark case studies ✦",
      "Calculate your project cost & timeline ↗",
      "Looking to elevate your brand? Let's chat ✦"
    ];

    let popIndex = 0;
    let isBubbleHovered = false;
    let popTimer = null;
    let hideTimer = null;

    function isModalCurrentlyOpen() {
      const overlay = document.getElementById('em-ai-overlay');
      return overlay && overlay.classList.contains('is-open');
    }

    function triggerPopIn() {
      if (!aiBubble || isModalCurrentlyOpen() || isHoveringOrb || isBubbleHovered) return;
      const textEl = document.getElementById('btr-bubble-text');
      if (textEl) {
        textEl.textContent = POP_MESSAGES[popIndex];
        popIndex = (popIndex + 1) % POP_MESSAGES.length;
      }
      aiBubble.classList.add('is-visible');
      aiBubble.classList.add('is-popping');
      setTimeout(() => {
        if (aiBubble) aiBubble.classList.remove('is-popping');
      }, 350);

      // Stay visible for 2 seconds, then smoothly pop out
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!isBubbleHovered && !isHoveringOrb) {
          triggerPopOut();
          scheduleNextPop(6000); // 6 seconds hidden pause
        }
      }, 2000);
    }

    function triggerPopOut() {
      if (!aiBubble) return;
      aiBubble.classList.remove('is-visible');
    }

    function scheduleNextPop(delayMs = 6000) {
      clearTimeout(popTimer);
      popTimer = setTimeout(() => {
        if (!isModalCurrentlyOpen()) {
          triggerPopIn();
        } else {
          scheduleNextPop(6000);
        }
      }, delayMs);
    }

    if (aiBubble) {
      aiBubble.addEventListener('mouseenter', () => {
        isBubbleHovered = true;
        clearTimeout(hideTimer);
        clearTimeout(popTimer);
        aiBubble.classList.add('is-visible');
      });
      aiBubble.addEventListener('mouseleave', () => {
        isBubbleHovered = false;
        triggerPopOut();
        scheduleNextPop(6000);
      });
    }

    if (orbToggle) {
      orbToggle.addEventListener('mouseenter', () => {
        clearTimeout(hideTimer);
        clearTimeout(popTimer);
        if (aiBubble && !isModalCurrentlyOpen()) {
          aiBubble.classList.add('is-visible');
        }
      });
      orbToggle.addEventListener('mouseleave', () => {
        if (!isBubbleHovered) {
          triggerPopOut();
          scheduleNextPop(6000);
        }
      });
    }

    // Start initial pop cycle 2.5 seconds after page load
    scheduleNextPop(2500);

    // ==========================================================================
    // 4 & 5. PROCEDURAL 3D IRIDESCENT HOLOGRAPHIC BUTTERFLY ENGINE
    //    Buttercup signature cyber-morpho / glasswing luxury butterfly
    // ==========================================================================
    function createButterflyParticles(count, cx, cy) {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push({
          x: cx + (Math.random() - 0.5) * 320,
          y: cy + (Math.random() - 0.5) * 320,
          vx: (Math.random() - 0.5) * 0.55,
          vy: -0.32 - Math.random() * 0.55,
          size: 1.5 + Math.random() * 2.8,
          alpha: 0.25 + Math.random() * 0.75,
          phase: Math.random() * Math.PI * 2
        });
      }
      return list;
    }

    function drawButterfly(ctx, w, h, t, particles, isSpeaking, isListening, isThinking, isHovering) {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const scale = (w / 560);
      const isMini = scale < 0.5;

      // Smooth hover bobbing and natural banking tilt
      const bobY = Math.sin(t * 1.6) * (10 * scale);
      const tilt = Math.sin(t * 0.9) * 0.035;
      const bodyY = cy + bobY;

      // Dynamic wing flapping perspective speed based on AI state
      const flapSpeed = isSpeaking ? 4.6 : (isThinking ? 3.8 : (isListening ? 3.2 : (isHovering ? 2.8 : 2.2)));
      const flapAngle = 0.45 + Math.sin(t * flapSpeed) * 0.42;
      const wingScaleX = Math.cos(flapAngle);

      ctx.save();
      ctx.translate(cx, bodyY);
      ctx.rotate(tilt);
      ctx.scale(scale, scale);

      // 1. Ambient Cosmic Aura (Dynamic state reflection)
      const auraRadius = 240;
      const auraGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, auraRadius);
      if (isListening) {
        auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.48)');
        auraGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.24)');
        auraGrad.addColorStop(1, 'transparent');
      } else if (isSpeaking) {
        auraGrad.addColorStop(0, 'rgba(244, 63, 94, 0.44)');
        auraGrad.addColorStop(0.45, 'rgba(168, 85, 247, 0.28)');
        auraGrad.addColorStop(1, 'transparent');
      } else if (isThinking) {
        auraGrad.addColorStop(0, 'rgba(168, 85, 247, 0.46)');
        auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
        auraGrad.addColorStop(1, 'transparent');
      } else {
        auraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.38)');
        auraGrad.addColorStop(0.35, 'rgba(236, 72, 153, 0.24)');
        auraGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.14)');
        auraGrad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Floating Diamond Stardust Particles
      if (particles && particles.length > 0) {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += p.vx;
          const limit = 240 * scale;
          if (p.y < cy - limit) p.y = cy + limit * 0.8 + Math.random() * 40;
          if (p.x < cx - limit) p.x = cx + limit;
          if (p.x > cx + limit) p.x = cx - limit;

          const alpha = (Math.sin(t * 3 + p.phase) * 0.35 + 0.65) * p.alpha;
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          if (!isMini) {
            ctx.shadowColor = '#e879f9';
            ctx.shadowBlur = 8;
          }
          ctx.beginPath();
          ctx.arc((p.x - cx) / scale, (p.y - bodyY) / scale, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.size > 2.5) {
            const s = p.size * 2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo((p.x - cx) / scale - s, (p.y - bodyY) / scale);
            ctx.lineTo((p.x - cx) / scale + s, (p.y - bodyY) / scale);
            ctx.moveTo((p.x - cx) / scale, (p.y - bodyY) / scale - s);
            ctx.lineTo((p.x - cx) / scale, (p.y - bodyY) / scale + s);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // 3. Symmetrical 3D Perspective Wings
      function drawWingSide(side) {
        ctx.save();
        ctx.scale(side * wingScaleX, 1);

        // --- HINDWING (Lower Wing) ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(8, 20);
        ctx.bezierCurveTo(40, 60, 110, 150, 140, 130);
        ctx.bezierCurveTo(165, 110, 155, 60, 130, 25);
        ctx.bezierCurveTo(115, 5, 60, -5, 10, 5);
        ctx.closePath();

        const hGrad = ctx.createRadialGradient(50, 60, 10, 80, 80, 140);
        hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        hGrad.addColorStop(0.2, 'rgba(244, 114, 182, 0.88)');
        hGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.9)');
        hGrad.addColorStop(0.8, 'rgba(99, 102, 241, 0.85)');
        hGrad.addColorStop(1, 'rgba(56, 189, 248, 0.8)');

        ctx.fillStyle = hGrad;
        if (!isMini) {
          ctx.shadowColor = 'rgba(168, 85, 247, 0.55)';
          ctx.shadowBlur = 16;
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Venation lines on hindwing
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(10, 15);
        ctx.quadraticCurveTo(60, 60, 140, 130);
        ctx.moveTo(10, 15);
        ctx.quadraticCurveTo(80, 50, 130, 25);
        ctx.moveTo(40, 45);
        ctx.quadraticCurveTo(90, 85, 120, 125);
        ctx.stroke();

        // Hindwing eye-spot
        ctx.beginPath();
        ctx.arc(105, 85, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        if (!isMini) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.beginPath();
        ctx.arc(105, 85, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#9333ea';
        ctx.fill();
        ctx.restore();

        // --- FOREWING (Upper Wing) ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.bezierCurveTo(45, -95, 130, -185, 215, -165);
        ctx.bezierCurveTo(240, -145, 220, -75, 185, -25);
        ctx.bezierCurveTo(160, 15, 120, 35, 10, 5);
        ctx.closePath();

        const fGrad = ctx.createLinearGradient(10, 10, 220, -170);
        fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        fGrad.addColorStop(0.18, 'rgba(244, 114, 182, 0.92)');
        fGrad.addColorStop(0.42, 'rgba(168, 85, 247, 0.95)');
        fGrad.addColorStop(0.7, 'rgba(124, 58, 237, 0.92)');
        fGrad.addColorStop(0.9, 'rgba(56, 189, 248, 0.9)');
        fGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.fillStyle = fGrad;
        if (!isMini) {
          ctx.shadowColor = 'rgba(236, 72, 153, 0.65)';
          ctx.shadowBlur = 22;
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // Intricate venation lines on forewing
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(8, -10);
        ctx.quadraticCurveTo(80, -90, 215, -165);
        ctx.moveTo(8, -10);
        ctx.quadraticCurveTo(100, -60, 195, -105);
        ctx.moveTo(8, -10);
        ctx.quadraticCurveTo(110, -25, 185, -25);
        ctx.moveTo(8, -10);
        ctx.quadraticCurveTo(80, 5, 140, 25);
        ctx.moveTo(60, -60);
        ctx.quadraticCurveTo(120, -130, 175, -150);
        ctx.moveTo(90, -45);
        ctx.quadraticCurveTo(145, -75, 185, -65);
        ctx.moveTo(50, -20);
        ctx.quadraticCurveTo(100, -10, 150, 10);
        ctx.stroke();

        // Wingtip Sparkles
        [
          { x: 215, y: -165, r: 4 },
          { x: 195, y: -105, r: 3 },
          { x: 185, y: -25, r: 3.5 }
        ].forEach(sp => {
          ctx.fillStyle = '#ffffff';
          if (!isMini) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;
          }
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fill();

          const cs = sp.r * 2.2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sp.x - cs, sp.y);
          ctx.lineTo(sp.x + cs, sp.y);
          ctx.moveTo(sp.x, sp.y - cs);
          ctx.lineTo(sp.x, sp.y + cs);
          ctx.stroke();
        });

        ctx.restore();
        ctx.restore();
      }

      drawWingSide(-1);
      drawWingSide(1);

      // 4. Central Butterfly Body & Luminous Antennae
      ctx.save();
      const bodyGrad = ctx.createLinearGradient(0, -50, 0, 70);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.3, '#f472b6');
      bodyGrad.addColorStop(0.65, '#9333ea');
      bodyGrad.addColorStop(1, '#3b82f6');

      ctx.fillStyle = bodyGrad;
      if (!isMini) {
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 14;
      }
      ctx.beginPath();
      ctx.ellipse(0, -10, 7, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 32, 5, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -38, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      if (!isMini) {
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 10;
      }
      // Left Antenna
      ctx.beginPath();
      ctx.moveTo(-3, -42);
      ctx.bezierCurveTo(-14, -65, -35, -80, -42, -95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-42, -95, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      // Right Antenna
      ctx.beginPath();
      ctx.moveTo(3, -42);
      ctx.bezierCurveTo(14, -65, 35, -80, 42, -95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(42, -95, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
      ctx.restore();
    }

    // ==========================================================================
    // 6. NATURAL VOICE SYNTHESIS ENGINE
    // ==========================================================================
    let preferredVoice = null;

    function loadBestVoice() {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const searchPatterns = [
        v => v.name === 'Google US English',
        v => v.name.includes('Google') && v.lang.startsWith('en'),
        v => v.name.includes('Samantha') && (v.name.includes('Enhanced') || v.name.includes('Premium')),
        v => v.name === 'Samantha',
        v => v.name.includes('Ava') && (v.name.includes('Enhanced') || v.name.includes('Premium')),
        v => v.name.includes('Serena'),
        v => v.name.includes('Karen'),
        v => v.name.includes('Victoria'),
        v => v.name.includes('Daniel'),
        v => v.name.includes('Natural') && v.lang.startsWith('en'),
        v => v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Guy'),
        v => v.lang === 'en-US' && !v.name.includes('Bad') && !v.name.includes('Zarvox'),
        v => v.lang.startsWith('en')
      ];

      for (const testFn of searchPatterns) {
        const match = voices.find(testFn);
        if (match) {
          preferredVoice = match;
          break;
        }
      }
    }

    if ('speechSynthesis' in window) {
      loadBestVoice();
      window.speechSynthesis.onvoiceschanged = loadBestVoice;
    }

    function stopSpeech() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isAiSpeaking = false;
      if (aiSoundToggle) aiSoundToggle.classList.remove('is-speaking');
    }

    function speakVoice(text) {
      if (!isAiSoundEnabled || !('speechSynthesis' in window)) return;
      stopSpeech();

      const clean = text
        .replace(/[*_#`~>↗↳•\-]/g, ' ')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (!preferredVoice) loadBestVoice();
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        isAiSpeaking = true;
        if (aiSoundToggle) aiSoundToggle.classList.add('is-speaking');
      };

      utterance.onend = utterance.onerror = () => {
        isAiSpeaking = false;
        if (aiSoundToggle) aiSoundToggle.classList.remove('is-speaking');
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    }

    // ==========================================================================
    // 7. L.I.S.A. 3D INTERACTIVE RETRO-FUTURISTIC AI CHARACTER ENGINE
    // ==========================================================================
    function initLisa3D(canvas) {
      if (!window.THREE || !canvas) return null;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
      } catch (err) {
        console.warn("Lisa 3D: WebGL context could not be created:", err);
        return null;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();

      // Camera positioned to view torso and head with character on right/center
      const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0.18, 0.40, 5.0);
      camera.lookAt(0.18, 0.38, 0);

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xfff6ee, 0.95);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffaea, 1.55);
      keyLight.position.set(3.5, 4.0, 3.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.001;
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xbcd6ff, 2.9);
      rimLight.position.set(-4.5, 3.2, -2.5);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(0xe8d0c0, 0.65);
      fillLight.position.set(-2.5, 0.5, 3.0);
      scene.add(fillLight);

      // Procedural Heather Grey Knit Texture
      const knitCanvas = document.createElement('canvas');
      knitCanvas.width = 512;
      knitCanvas.height = 512;
      const kctx = knitCanvas.getContext('2d');
      kctx.fillStyle = '#9e94a4';
      kctx.fillRect(0, 0, 512, 512);

      // Stronger ribbed wool stripes
      for (let x = 0; x < 512; x += 6) {
        kctx.fillStyle = (x % 12 === 0) ? 'rgba(30, 22, 35, 0.45)' : 'rgba(240, 235, 245, 0.35)';
        kctx.fillRect(x, 0, 3.2, 512);
      }
      // Wool heather texture
      for (let i = 0; i < 12000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const col = Math.random() > 0.5 ? 'rgba(255,255,255,0.42)' : 'rgba(20,12,25,0.35)';
        kctx.fillStyle = col;
        kctx.fillRect(x, y, 1.5, 3.0);
      }
      const knitTexture = new THREE.CanvasTexture(knitCanvas);
      knitTexture.wrapS = THREE.RepeatWrapping;
      knitTexture.wrapT = THREE.RepeatWrapping;
      knitTexture.repeat.set(16, 16);

      // CRT Screen with Glowing Circular Eyes
      const screenCanvas = document.createElement('canvas');
      screenCanvas.width = 1024;
      screenCanvas.height = 1024;
      const sctx = screenCanvas.getContext('2d');
      const screenTexture = new THREE.CanvasTexture(screenCanvas);

      let eyeGazeX = 0;
      let eyeGazeY = 0;
      let eyeBlinkScale = 1.0;
      let isBlinking = false;
      let eyePulse = 1.0;

      function renderScreenTexture() {
        sctx.fillStyle = '#111317';
        sctx.fillRect(0, 0, 1024, 1024);

        const bgGrad = sctx.createRadialGradient(512, 512, 100, 512, 512, 800);
        bgGrad.addColorStop(0, '#23262d');
        bgGrad.addColorStop(0.7, '#14161a');
        bgGrad.addColorStop(1, '#0e0f12');
        sctx.fillStyle = bgGrad;
        sctx.fillRect(0, 0, 1024, 1024);

        sctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        for (let y = 0; y < 1024; y += 4) {
          sctx.fillRect(0, y, 1024, 1.5);
        }

        const eyeRadius = 150 * eyePulse;
        const eyeSpread = 205;
        const eyeBaseY = 512;

        const leftEyeX = 512 - eyeSpread + eyeGazeX * 65;
        const rightEyeX = 512 + eyeSpread + eyeGazeX * 65;
        const eyeY = eyeBaseY + eyeGazeY * 55;

        function drawGlowingEye(cx, cy) {
          sctx.save();
          sctx.translate(cx, cy);
          sctx.scale(1.0, eyeBlinkScale);

          const outerGlow = sctx.createRadialGradient(0, 0, eyeRadius * 0.35, 0, 0, eyeRadius * 2.2);
          outerGlow.addColorStop(0, 'rgba(255, 235, 190, 0.65)');
          outerGlow.addColorStop(0.35, 'rgba(255, 175, 75, 0.42)');
          outerGlow.addColorStop(0.7, 'rgba(255, 120, 25, 0.18)');
          outerGlow.addColorStop(1, 'rgba(255, 100, 10, 0)');
          sctx.fillStyle = outerGlow;
          sctx.beginPath();
          sctx.arc(0, 0, eyeRadius * 2.2, 0, Math.PI * 2);
          sctx.fill();

          const coreGlow = sctx.createRadialGradient(0, 0, 0, 0, 0, eyeRadius);
          coreGlow.addColorStop(0, '#ffffff');
          coreGlow.addColorStop(0.7, '#ffffff');
          coreGlow.addColorStop(0.86, '#fff8e8');
          coreGlow.addColorStop(0.96, '#ffdc94');
          coreGlow.addColorStop(1, 'rgba(255, 185, 70, 0)');
          sctx.fillStyle = coreGlow;
          sctx.beginPath();
          sctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
          sctx.fill();

          sctx.restore();
        }

        drawGlowingEye(leftEyeX, eyeY);
        drawGlowingEye(rightEyeX, eyeY);

        screenTexture.needsUpdate = true;
      }
      renderScreenTexture();

      function createRoundedRectShape(w, h, r) {
        const shape = new THREE.Shape();
        const x = -w / 2;
        const y = -h / 2;
        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);
        return shape;
      }

      // Torso & Turtleneck Sweater (Realistic anatomical shoulders)
      const bodyGroup = new THREE.Group();
      bodyGroup.position.set(0.86, -0.38, 0);
      scene.add(bodyGroup);

      const sweaterMaterial = new THREE.MeshStandardMaterial({
        color: 0x9c94a2,
        map: knitTexture,
        roughness: 0.88,
        metalness: 0.02
      });

      function createShoulderShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.28, 0.22);
        s.bezierCurveTo(-0.52, 0.18, -0.88, 0.05, -1.35, -0.22);
        s.bezierCurveTo(-1.50, -0.38, -1.50, -0.75, -1.45, -1.20);
        s.lineTo(1.45, -1.20);
        s.bezierCurveTo(1.50, -0.75, 1.50, -0.38, 1.35, -0.22);
        s.bezierCurveTo(0.88, 0.05, 0.52, 0.18, 0.28, 0.22);
        s.closePath();
        return s;
      }

      const shoulderShape = createShoulderShape();
      const torsoGeo = new THREE.ExtrudeGeometry(shoulderShape, {
        depth: 0.45,
        bevelEnabled: true,
        bevelThickness: 0.22,
        bevelSize: 0.18,
        bevelSegments: 5
      });
      torsoGeo.center();
      const torsoMesh = new THREE.Mesh(torsoGeo, sweaterMaterial);
      torsoMesh.position.set(0, -0.48, -0.05);
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
      bodyGroup.add(torsoMesh);

      // High folded turtleneck collar hugging base of neck
      const collarRollGeo = new THREE.TorusGeometry(0.26, 0.09, 24, 48);
      collarRollGeo.rotateX(Math.PI / 2);
      collarRollGeo.scale(1.0, 0.88, 1.15);
      const collarRoll = new THREE.Mesh(collarRollGeo, sweaterMaterial);
      collarRoll.position.set(0, 0.08, 0.02);
      collarRoll.castShadow = true;
      bodyGroup.add(collarRoll);

      const collarColGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.32, 32);
      const collarCol = new THREE.Mesh(collarColGeo, sweaterMaterial);
      collarCol.position.set(0, 0.32, 0.02);
      collarCol.castShadow = true;
      bodyGroup.add(collarCol);

      // Top roll under jaw
      const topRollGeo = new THREE.TorusGeometry(0.24, 0.08, 24, 48);
      topRollGeo.rotateX(Math.PI / 2);
      topRollGeo.scale(1.0, 0.88, 1.15);
      const topRoll = new THREE.Mesh(topRollGeo, sweaterMaterial);
      topRoll.position.set(0, 0.48, 0.02);
      topRoll.castShadow = true;
      bodyGroup.add(topRoll);

      // Human neck sliver
      const neckGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.20, 32);
      const neckMat = new THREE.MeshStandardMaterial({ color: 0xbaa49a, roughness: 0.6 });
      const neckMesh = new THREE.Mesh(neckGeo, neckMat);
      neckMesh.position.set(0, 0.52, 0.02);
      bodyGroup.add(neckMesh);

      // Retro CRT Monitor Head
      const headGroup = new THREE.Group();
      headGroup.position.set(0.86, 0.60, 0);
      scene.add(headGroup);

      const monitorCaseMat = new THREE.MeshStandardMaterial({
        color: 0xd8d6db,
        roughness: 0.36,
        metalness: 0.06
      });

      const caseW = 1.48;
      const caseH = 1.35;
      const caseD = 0.85;
      const cornerR = 0.12;

      const caseShape = createRoundedRectShape(caseW, caseH, cornerR);
      const caseGeo = new THREE.ExtrudeGeometry(caseShape, {
        depth: caseD,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 4
      });
      caseGeo.center();
      const caseMesh = new THREE.Mesh(caseGeo, monitorCaseMat);
      caseMesh.position.set(0, 0.08, -0.12);
      caseMesh.castShadow = true;
      caseMesh.receiveShadow = true;
      headGroup.add(caseMesh);

      // Rear monitor taper housing (classic CRT bell back)
      const rearGeo = new THREE.CylinderGeometry(0.48, 0.72, 0.55, 32);
      rearGeo.rotateX(Math.PI / 2);
      rearGeo.scale(1.2, 1.0, 1.0);
      const rearMesh = new THREE.Mesh(rearGeo, monitorCaseMat);
      rearMesh.position.set(0, 0.12, -0.65);
      rearMesh.castShadow = true;
      headGroup.add(rearMesh);

      // CRT Glass Screen (Mounted in front of case at z = 0.50)
      const screenW = caseW * 0.84;
      const screenH = caseH * 0.78;
      const screenR = 0.08;

      const screenGeo = new THREE.PlaneGeometry(screenW, screenH, 16, 16);
      const pos = screenGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const dist = Math.sqrt(u * u + v * v);
        pos.setZ(i, -Math.pow(dist, 2) * 0.04);
      }
      screenGeo.computeVertexNormals();

      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTexture,
        side: THREE.DoubleSide
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0.08, 0.50);
      headGroup.add(screenMesh);

      // Rounded Bezel Frame with Cutout Window
      const bezelShape = createRoundedRectShape(caseW * 0.98, caseH * 0.96, cornerR * 0.9);
      const screenHole = createRoundedRectShape(screenW * 0.96, screenH * 0.96, screenR);
      bezelShape.holes.push(screenHole);

      const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 3
      });
      bezelGeo.center();

      const bezelMat = new THREE.MeshStandardMaterial({
        color: 0x2b2e35,
        roughness: 0.55,
        metalness: 0.1
      });
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.position.set(0, 0.08, 0.51);
      bezelMesh.castShadow = true;
      headGroup.add(bezelMesh);

      // Front bottom bezel control strip (buttons/knobs)
      const ctrlMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.8 });
      for (let i = 0; i < 6; i++) {
        const btnGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 16);
        btnGeo.rotateX(Math.PI / 2);
        const btn = new THREE.Mesh(btnGeo, ctrlMat);
        btn.position.set(0.24 + i * 0.052, -0.44, 0.58);
        headGroup.add(btn);
      }

      // Side Earcups (Locomotive L.I.S.A. audio headphone pods)
      const earcupMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.45, metalness: 0.2 });
      const earcupGeo = new THREE.CylinderGeometry(0.20, 0.24, 0.14, 32);
      earcupGeo.rotateZ(Math.PI / 2);

      const earcupRight = new THREE.Mesh(earcupGeo, earcupMat);
      earcupRight.position.set(caseW * 0.5 + 0.06, 0.08, -0.10);
      headGroup.add(earcupRight);

      const earcupLeft = new THREE.Mesh(earcupGeo, earcupMat);
      earcupLeft.position.set(-caseW * 0.5 - 0.06, 0.08, -0.10);
      headGroup.add(earcupLeft);

      // Chin jacks for front cables
      const chinJackGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.09, 16);
      const chinJackLeft = new THREE.Mesh(chinJackGeo, earcupMat);
      chinJackLeft.position.set(-0.24, -0.58, 0.28);
      headGroup.add(chinJackLeft);

      const chinJackRight = new THREE.Mesh(chinJackGeo, earcupMat);
      chinJackRight.position.set(0.24, -0.58, 0.28);
      headGroup.add(chinJackRight);

      // Neck joint mounting bracket under monitor
      const bracketGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.18, 32);
      const bracketMesh = new THREE.Mesh(bracketGeo, ctrlMat);
      bracketMesh.position.set(0, -0.62, 0);
      headGroup.add(bracketMesh);

      // Black Patch Cables
      const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x141416,
        roughness: 0.65,
        metalness: 0.12
      });

      const cablesData = [
        // Chin cable left into turtleneck collar
        {
          localStart: new THREE.Vector3(-0.24, -0.58, 0.28),
          worldEnd: new THREE.Vector3(0.86 - 0.10, 0.10, 0.24),
          sag: new THREE.Vector3(-0.06, -0.15, 0.12),
          mesh: null
        },
        // Chin cable right into turtleneck collar
        {
          localStart: new THREE.Vector3(0.24, -0.58, 0.28),
          worldEnd: new THREE.Vector3(0.86 + 0.10, 0.10, 0.24),
          sag: new THREE.Vector3(0.06, -0.15, 0.12),
          mesh: null
        },
        // Right side loop 1 (top wide arch)
        {
          localStart: new THREE.Vector3(caseW * 0.5 + 0.08, 0.16, -0.10),
          worldEnd: new THREE.Vector3(0.86 + 0.45, -0.15, -0.10),
          sag: new THREE.Vector3(0.38, 0.08, 0.02),
          mesh: null
        },
        // Right side loop 2 (drooping down)
        {
          localStart: new THREE.Vector3(caseW * 0.5 + 0.08, 0.02, -0.12),
          worldEnd: new THREE.Vector3(0.86 + 0.35, -0.32, -0.15),
          sag: new THREE.Vector3(0.48, -0.22, 0.04),
          mesh: null
        },
        // Right side loop 3 (sweeping drape)
        {
          localStart: new THREE.Vector3(caseW * 0.5 + 0.06, -0.10, -0.08),
          worldEnd: new THREE.Vector3(0.86 + 0.22, -0.12, -0.18),
          sag: new THREE.Vector3(0.26, -0.30, -0.05),
          mesh: null
        },
        // Left side loop 1 (top arch)
        {
          localStart: new THREE.Vector3(-caseW * 0.5 - 0.08, 0.14, -0.10),
          worldEnd: new THREE.Vector3(0.86 - 0.42, -0.18, -0.10),
          sag: new THREE.Vector3(-0.35, 0.05, 0.02),
          mesh: null
        },
        // Left side loop 2 (droop down)
        {
          localStart: new THREE.Vector3(-caseW * 0.5 - 0.08, -0.02, -0.08),
          worldEnd: new THREE.Vector3(0.86 - 0.25, -0.10, -0.18),
          sag: new THREE.Vector3(-0.42, -0.24, 0.02),
          mesh: null
        }
      ];

      cablesData.forEach(c => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -0.5, 0),
          new THREE.Vector3(0, -1, 0)
        ]);
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.026, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, cableMaterial);
        tubeMesh.castShadow = true;
        scene.add(tubeMesh);
        c.mesh = tubeMesh;
      });

      function updateCables(headRotY, headRotX) {
        cablesData.forEach(c => {
          const worldStart = c.localStart.clone().applyMatrix4(headGroup.matrixWorld);
          const worldEnd = c.worldEnd.clone();

          const mid = new THREE.Vector3().addVectors(worldStart, worldEnd).multiplyScalar(0.5);
          mid.x += c.sag.x;
          mid.y += c.sag.y;
          mid.z += c.sag.z;

          const p1 = new THREE.Vector3().lerpVectors(worldStart, mid, 0.45);
          p1.x += c.sag.x * 0.4;
          const p2 = new THREE.Vector3().lerpVectors(mid, worldEnd, 0.55);
          p2.y += c.sag.y * 0.2;

          const curve = new THREE.CatmullRomCurve3([worldStart, p1, mid, p2, worldEnd]);
          c.mesh.geometry.dispose();
          c.mesh.geometry = new THREE.TubeGeometry(curve, 32, 0.024, 8, false);
        });
      }

      // Cursor Tracking & Animation Loop
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;
      let targetRotZ = 0;
      let curRotX = 0;
      let curRotY = 0;
      let curRotZ = 0;
      let nodPitch = 0;
      let isNodding = false;

      function onMouseMove(e) {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        mouseX = nx;
        mouseY = ny;
        targetRotY = nx * 0.42;
        targetRotX = -ny * 0.32;
        targetRotZ = -nx * 0.06;
      }
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      // Natural eye blinking timer
      let blinkInterval = setInterval(() => {
        if (!isBlinking && Math.random() < 0.65) {
          isBlinking = true;
          const blinkStart = performance.now();
          const blinkDur = 160;

          function runBlink(now) {
            const progress = (now - blinkStart) / blinkDur;
            if (progress < 0.5) {
              eyeBlinkScale = 1.0 - (progress * 2) * 0.95;
            } else if (progress < 1.0) {
              eyeBlinkScale = 0.05 + ((progress - 0.5) * 2) * 0.95;
            } else {
              eyeBlinkScale = 1.0;
              isBlinking = false;
              renderScreenTexture();
              return;
            }
            renderScreenTexture();
            requestAnimationFrame(runBlink);
          }
          requestAnimationFrame(runBlink);
        }
      }, 3400);

      const clock = new THREE.Clock();
      let animId = null;

      function animate() {
        animId = requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        curRotX += (targetRotX - curRotX) * 0.065;
        curRotY += (targetRotY - curRotY) * 0.065;
        curRotZ += (targetRotZ - curRotZ) * 0.065;

        if (isNodding) {
          nodPitch = Math.sin(time * 12) * 0.12;
        } else {
          nodPitch = 0;
        }

        const breath = Math.sin(time * 1.6) * 0.016;
        const subtleSway = Math.sin(time * 0.8) * 0.008;

        headGroup.rotation.x = curRotX + breath * 0.4 + nodPitch;
        headGroup.rotation.y = curRotY + subtleSway;
        headGroup.rotation.z = curRotZ;
        headGroup.position.y = 0.60 + breath;

        bodyGroup.position.y = -0.38 + breath * 0.45;

        eyeGazeX += (mouseX - eyeGazeX) * 0.08;
        eyeGazeY += (mouseY - eyeGazeY) * 0.08;
        renderScreenTexture();

        headGroup.updateMatrixWorld();
        updateCables(curRotY, curRotX);

        renderer.render(scene, camera);
      }

      function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        if (window.innerWidth < 768) {
          camera.position.set(0.0, 0.45, 5.8);
          camera.lookAt(0.0, 0.25, 0);
        } else if (window.innerWidth < 1100) {
          camera.position.set(0.14, 0.36, 5.2);
          camera.lookAt(0.14, 0.34, 0);
        } else {
          camera.position.set(0.18, 0.40, 5.0);
          camera.lookAt(0.18, 0.38, 0);
        }
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', resize);
      resize();
      animate();

      return {
        pulseEyes: () => {
          eyePulse = 1.25;
          setTimeout(() => { eyePulse = 1.0; }, 420);
        },
        nodHead: () => {
          isNodding = true;
          setTimeout(() => { isNodding = false; }, 800);
        },
        destroy: () => {
          if (animId) cancelAnimationFrame(animId);
          if (blinkInterval) clearInterval(blinkInterval);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', resize);
          renderer.dispose();
        }
      };
    }

        // ==========================================================================
    // 6. MODAL INTERACTION & URL STATE
    // ==========================================================================
    function updateModalUrl(open) {
      // URL param tracking disabled — prevents auto-open on page reload
      try {
        if (!open) {
          const url = new URL(window.location);
          url.searchParams.delete('ai');
          url.searchParams.delete('emi');
          window.history.replaceState({}, '', url);
        }
      } catch (e) {}
    }

    function openAiModal() {
      if (!aiOverlay) return;
      isModalOpen = true;
      if (aiBubble) aiBubble.classList.remove('is-visible');
      aiOverlay.classList.add('is-open');
      aiOverlay.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('em-modal-open');
      updateModalUrl(true);

      // Re-activate custom cursor inside modal (it may have de-activated on dock hover)
      const cursorDot = document.querySelector('.custom-cursor-dot');
      const cursorRing = document.querySelector('.custom-cursor-ring');
      if (cursorDot) cursorDot.classList.add('is-active');
      if (cursorRing) cursorRing.classList.add('is-active');

      ensureThreeLoaded(() => {
        const cv = document.getElementById('em-ai-webgl-canvas');
        if (cv && !lisa3D) {
          lisa3D = initLisa3D(cv);
        }
      });

      setTimeout(() => {
        if (aiInput) aiInput.focus();
      }, 300);

      // Speak initial welcome if first opening
      if (isAiSoundEnabled) {
        setTimeout(() => {
          speakVoice("OMG! You're here! I was just manifesting this. Ask away!");
        }, 550);
      }
    }

    function closeAiModal() {
      const overlayEl = document.getElementById('em-ai-overlay') || aiOverlay;
      if (!overlayEl) return;
      isModalOpen = false;
      overlayEl.classList.remove('is-open');
      overlayEl.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('em-modal-open');
      document.body.classList.remove('em-modal-open');
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
      stopSpeech();
      updateModalUrl(false);
      scheduleNextPop(3000);
    }

    function getHomeUrl() {
      const p = window.location.pathname || '';
      if (p.includes('/pages/services/') || p.includes('/pages/industries/')) {
        return '../../../index.html';
      }
      if (p.includes('/pages/')) {
        return '../../index.html';
      }
      return 'index.html';
    }

    function isHomePage() {
      const p = window.location.pathname || '';
      return !p.includes('/pages/') && (
        p === '' ||
        p === '/' ||
        p.endsWith('/index.html') ||
        p.endsWith('/web 2/') ||
        p.endsWith('/web%202/') ||
        p.endsWith('/web 2/index.html') ||
        p.endsWith('/web%202/index.html')
      );
    }

    function goToHome() {
      closeAiModal();
      if (isHomePage()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.lenis && typeof window.lenis.scrollTo === 'function') {
          window.lenis.scrollTo(0, { immediate: false });
        }
      } else {
        window.location.href = getHomeUrl();
      }
    }

    // Expose close & navigation functions globally
    window.closeButtercupAi = closeAiModal;
    window.closeAiModal = closeAiModal;
    window.goButtercupHome = goToHome;

    // Direct event binding
    if (orbToggle) orbToggle.addEventListener('click', (e) => { e.stopPropagation(); openAiModal(); });
    if (aiBubble) aiBubble.addEventListener('click', (e) => { e.stopPropagation(); openAiModal(); });
    if (aiCloseBtn) {
      aiCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeAiModal();
      });
    }

    const aiHomeLink = document.getElementById('em-ai-home-link');
    if (aiHomeLink) {
      aiHomeLink.href = getHomeUrl();
      aiHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToHome();
      });
    }

    if (aiTalkLink) {
      aiTalkLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeAiModal();
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(contactSec);
          } else {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    // Universal capturing listener ensures close and home clicks NEVER get swallowed
    // Note: Background/backdrop click intentionally DOES NOT close the modal so users can interact freely with 3D robot and UI
    document.addEventListener('click', (e) => {
      const closeBtn = e.target && e.target.closest && e.target.closest('#em-ai-close, .em-ai-close-btn');
      if (closeBtn && isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeAiModal();
        return;
      }
      const homeLink = e.target && e.target.closest && e.target.closest('#em-ai-home-link');
      if (homeLink && isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        goToHome();
        return;
      }
      const trigger = e.target && e.target.closest && e.target.closest('[data-action="open-ai"], #openAiAssistantBtn, #dockAiAssistantBtn');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        openAiModal();
      }
    }, true);

    window.openButtercupAi = openAiModal;
    window.openAiModal = openAiModal;

    // ESC key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeAiModal();
      }
    });

    // Check URL on load
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('ai') === 'open' || urlParams.get('emi') === 'open') {
        setTimeout(openAiModal, 150);
      }
    } catch (e) {}

    // Sound Toggle inside AI Modal
    if (aiSoundToggle) {
      aiSoundToggle.addEventListener('click', () => {
        isAiSoundEnabled = !isAiSoundEnabled;
        if (iconSoundOn) iconSoundOn.classList.toggle('is-active', isAiSoundEnabled);
        if (iconSoundOff) iconSoundOff.classList.toggle('is-active', !isAiSoundEnabled);
        if (!isAiSoundEnabled) stopSpeech();
      });
    }

    // Reset button
    if (aiResetBtn) {
      aiResetBtn.addEventListener('click', () => {
        if (aiHeadline) {
          aiHeadline.textContent = "OMG! You're here! I was just manifesting this. Ask away!";
          aiHeadline.style.opacity = '1';
        }
        if (aiResponseDetails) {
          aiResponseDetails.style.display = 'none';
        }
        renderChips(["Request a Free Quote", "Join the team", "Drop a quick word", "Discover our culture"]);
        if (lisa3D) {
          lisa3D.pulseEyes();
          lisa3D.nodHead();
        }
        speakVoice("Reset! Let's start fresh. What would you like to explore?");
      });
    }

    // Copy email button
    if (aiCopyBtn) {
      aiCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('info@buttercup.in').then(() => {
          aiCopyBtn.textContent = '✓ Copied';
          setTimeout(() => { aiCopyBtn.textContent = '⎘'; }, 2000);
        });
      });
    }

    // Microphone Voice Input (Speech Recognition)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && aiMicBtn) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onstart = () => {
        isAiListening = true;
        aiMicBtn.classList.add('is-listening');
        if (aiInput) aiInput.placeholder = "Listening... Speak your question";
      };

      recognizer.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (aiInput) aiInput.value = text;
        handleUserSubmit(text);
      };

      recognizer.onend = recognizer.onerror = () => {
        isAiListening = false;
        aiMicBtn.classList.remove('is-listening');
        if (aiInput) aiInput.placeholder = "Ask me anything...";
      };

      aiMicBtn.addEventListener('click', () => {
        if (isAiListening) {
          recognizer.stop();
        } else {
          try { recognizer.start(); } catch(err) {}
        }
      });
    } else if (aiMicBtn) {
      aiMicBtn.style.opacity = '0.5';
      aiMicBtn.title = "Voice dictation not supported in this browser";
    }

    // ==========================================================================
    // 8. BUTTERCUP STUDIO COMPREHENSIVE KNOWLEDGE ENGINE (60+ SPECIALIZED DOMAINS)
    // ==========================================================================

    function pickVariant(v, userQuery = '') {
      if (!Array.isArray(v)) return v;
      if (v.length === 1) return v[0];

      const lower = (userQuery || '').toLowerCase();
      const isHindi = /\b(kya|kaise|kaha|kahan|mujhe|hum|aap|tum|tera|teri|tere|mera|meri|mere|apna|apne|apni|batao|dikhao|karo|karna|chahiye|hai|hain|ho|tha|the|thi|hoga|hogi|honge|hota|baare|mein|mai|main|ko|bhi|kitna|kitne|sirf|dabba|paise|kiska|doge|banta|milega|lagta|pura|kon|kaun|kis|kiske|bhai|yaar|suno|kuch|bolo|hasao|shadi|karogi|piyoge|pagal|bakwas|chup|nikal|saste|muft|naukri|zindagi|chutkula|majama|kem|cho|bana|banao|de|lo|le|liye|wala|wali|wale)\b/i.test(lower);

      if (isHindi && v.length > 1) {
        return v[1];
      }
      return v[0];
    }

    const STUDIO_KNOWLEDGE = [
      // =========================================================================
      // TIER 1: SPECIFIC CASE STUDIES (Checked FIRST to prevent umbrella hijacking)
      // =========================================================================
      {
        match: /\b(abode)\b/i,
        reply: [
          "Abode is our landmark luxury sustainable living project. We engineered a serene, architectural brand identity, tactile editorial brochure systems, and earthy brand narrative that established them as a pioneer in conscious residential architecture.",
          "Abode ke liye Buttercup ne complete sustainable brand architecture develop kiya—minimalist monogram, stone-textured print brochures, aur eco-conscious spatial storytelling residential buyers ke liye."
        ],
        chips: ["Real Estate Branding", "View Case Studies", "Book a discovery call"]
      },
      {
        match: /\b(vriksh)\b/i,
        reply: [
          "Vriksh is an artisan Ayurvedic botanical brand. We crafted their organic visual identity, holistic packaging architecture, sustainable glass bottle labels, and conscious retail brand story for pan-India distribution.",
          "Vriksh Ayurveda ke liye humne ancient botanical science aur modern luxury aesthetics ko combine kiya—frosted amber glass bottles, botanical leaf debossing, aur shelf-breaking cosmetic cartons ke saath."
        ],
        chips: ["Cosmetics & Skincare", "View Case Studies", "Packaging Design"]
      },
      {
        match: /\b(swaad)\b/i,
        reply: [
          "Swaad is an authentic gourmet food brand. We designed appetite-inducing packaging, custom vernacular letterforms, and vibrant shelf-breaking pouches that achieved instant retail dominance in FMCG.",
          "Swaad ke liye humne supermarket aisles me '3-Second Shelf Battle' jeeta—mouth-watering photography, custom spice gradients, aur FSSAI-compliant packaging architecture design karke."
        ],
        chips: ["FMCG Packaging details", "Crispo Snack Case Study", "Contact team"]
      },
      {
        match: /\b(aura)\b/i,
        reply: [
          "Aura is a modern smart-lifestyle technology brand. We built their futuristic visual language, sleek interface guidelines, and premium unboxing experience for next-gen consumer hardware.",
          "Aura Smart Tech ke liye humne kinetic brand identity design ki—sleek geometric letterforms, matte black rigid box packaging, aur living Figma design system hardware unboxing ke liye."
        ],
        chips: ["Tech Branding", "Web Design", "Let's talk"]
      },
      {
        match: /\b(jimmy)\b/i,
        reply: [
          "Jimmy is a premium cocktail and beverage mixer brand. We designed bold, charismatic packaging silhouettes, retro-modern typography, and eye-catching retail bottle labels engineered for nightlife and modern retail.",
          "Jimmy ke liye humne nightlife aur supermarket shelves dono ke liye bold packaging design ki—retro-modern typography, contrasting neck tags, aur vibrant color-blocking ke saath."
        ],
        chips: ["Packaging Design", "Explore Case Studies", "Book a discovery call"]
      },
      {
        match: /\b(titano)\b/i,
        reply: [
          "Titano LED is an architectural and industrial lighting leader. We built a high-precision corporate identity, technical product catalogue system, and trade exhibition graphics that elevated their commercial footprint.",
          "Titano LED ke liye humne technical lighting specifications ko sleek engineering catalogues aur high-converting B2B distributor decks me transform kiya."
        ],
        chips: ["B2B Branding", "Brochure Design", "Contact team"]
      },
      {
        match: /\b(polka tots|polkatots)\b/i,
        reply: [
          "Polka Tots is a beloved infant and toddler lifestyle brand. We crafted their playful yet trustworthy visual identity, joyful packaging systems, and digital social creative direction.",
          "Polka Tots ke liye humne baby-safe visual identity aur joyful packaging systems design kiye jo 40+ baby lifestyle SKUs me parent trust aur retail shelf appeal build karte hain."
        ],
        chips: ["Packaging Design", "Visual Identity", "Contact team"]
      },
      {
        match: /\b(shivala)\b/i,
        reply: [
          "Shivala is a luxury residential estate in Gujarat. We designed their heritage-meets-modern identity, gold-foiled sales decks, and environmental site hoardings that drove record pre-launch bookings.",
          "Shivala Estates ke liye humne aristocratic emblem, heavy textured linen brochures with gold foil, aur high-impact site hoardings deliver kiye jisne pre-launch sales boost ki."
        ],
        chips: ["Real Estate Branding", "Abode Case Study", "Contact team"]
      },
      {
        match: /\b(noir supply|noir)\b/i,
        reply: [
          "Noir Supply Co is an edgy, contemporary streetwear label. We created their brutalist typographic system, woven garment labels, bespoke apparel hangtags, and minimalist e-commerce digital branding.",
          "Noir Supply Co ke liye humne brutalist typographic branding, woven neck labels, thick matte black hangtags aur edgy streetwear unboxing experience create kiya."
        ],
        chips: ["Fashion Branding", "View Case Studies", "Contact team"]
      },
      {
        match: /\b(beatitude)\b/i,
        reply: [
          "Beatitude celebrates handcrafted Indian weaves and artisanal sarees. We shaped an evocative luxury heritage identity, regal editorial lookbooks, and luxury unboxing packaging honoring master weavers across India.",
          "Beatitude ke liye humne Indian textile heritage se rooted luxury identity aur gold-embossed keepsake garment boxes craft kiye jo har saree purchase ko timeless experience banate hain."
        ],
        chips: ["Luxury Branding", "Fashion Branding", "Contact team"]
      },
      {
        match: /\b(bigly|bigly agro)\b/i,
        reply: [
          "Bigly Agro is an agricultural science and bio-fertilizer innovator. We designed high-clarity vernacular agricultural packaging, durable outdoor bags, and farmer-friendly visual cues that built rapid rural trust.",
          "Bigly Agro ke liye humne farmer-friendly packaging architecture design ki—vernacular language cues, chemical dosage icons, aur weather-resistant outdoor bag prints."
        ],
        chips: ["Packaging Design", "B2B Branding", "Contact team"]
      },
      {
        match: /\b(crispo)\b/i,
        reply: [
          "Crispo is an artisan savory snack brand. We crafted high-energy packaging pouches with metallic finishes, appetite-stimulating photography, and bold flavor color codes for retail impulse purchase.",
          "Crispo ke liye humne high-energy metallic snack pouches design kiye jo supermarket snack aisles me instant visual punch aur impulse purchases create karte hain."
        ],
        chips: ["FMCG Food Strategy", "Swaad Case Study", "Contact team"]
      },
      {
        match: /\b(senal|senal diamonds)\b/i,
        reply: [
          "Senal Diamonds represents timeless luxury bridal diamonds. We crafted their delicate bespoke monogram, rich jewel-tone presentation boxes, and high-jewelry certificate booklets.",
          "Senal Diamonds ke liye humne ultra-refined luxury brand experience engineer kiya: velvet-lined jewelry boxes, micro-embossed authenticity cards, aur bridal diamond lookbooks."
        ],
        chips: ["Luxury Branding", "View Case Studies", "Contact team"]
      },

      // =========================================================================
      // TIER 2: SPECIFIC FOUNDER DILEMMAS & PRACTICAL COMMERCIAL FAQS
      // =========================================================================
      {
        match: /\b(already have a logo|logo already|sirf packaging|only packaging|sirf dabba|dabba design|sirf box|only box|already logo)\b/i,
        reply: [
          "Absolutely! You don't have to start from scratch. If your logo is already set, we can step in exclusively for Packaging Architecture, Brand Guidelines, tactile Brochure Collateral, or your Web Experience while seamlessly honoring your established mark.",
          "Haan, bilkul! Agar aapke paas logo already finalized hai, toh hum exclusively aapke packaging line, 3D bottle/pouch renders, print die-lines, aur regulatory FSSAI layouts par kaam kar sakte hain. Purane logo ko preserve karte hue hum complete retail presence elevate karte hain."
        ],
        chips: ["Packaging Design Process", "Print Proofing details", "Book a discovery call"]
      },
      {
        match: /\b(sirf website|only website|website only|sirf web)\b/i,
        reply: [
          "Yes! If your brand identity is already finalized, our digital studio can design and engineer a bespoke, high-performance website with custom micro-interactions, responsive mobile fluidity, and fast load speeds.",
          "Haan, bilkul! Agar aapka branding already complete hai, toh hum exclusively aapki flagship custom website design aur develop kar sakte hain—kinetic animations, mobile responsiveness, aur high-conversion layouts ke saath."
        ],
        chips: ["Web Capabilities", "Show Case Studies", "Schedule a call"]
      },
      {
        match: /\b(revision|revisions|kitni baar|badal|changes|iterations|kitne options|options milenge)\b/i,
        reply: [
          "We deliver 3 distinct strategic design directions in Stage 1, followed by up to 3 rounds of structured refinements on your chosen direction. Our deep whitespace discovery upfront ensures over 95% of our clients lock their final identity within round 2.",
          "Hum initial stage me 3 completely distinct design directions provide karte hain. Iske baad aapke chosen route par 3 focused rounds of revisions milte hain. Whitespace alignment ki wajah se humare 95% projects round 2 me hi finalize ho jaate hain."
        ],
        chips: ["Our 4-Stage Process", "What if I don't like it?", "Book a discovery call"]
      },
      {
        match: /\b(source files?|open files?|raw files?|ai files?|formats?|vector|cdr|eps|svg|handover|deliverables?|kya kya milega|file format)\b/i,
        reply: [
          "Upon final milestone completion, you receive complete master source files: 100% scalable vector artwork (Adobe Illustrator .AI, EPS, SVG), high-res transparent PNGs, CMYK/Pantone print-ready PDFs, typography hierarchy, and a living Figma design system link.",
          "Project complete hote hi aapko sabhi open master files milti hain: Adobe Illustrator (.AI), vector EPS, SVG, ultra-high-resolution PNGs, press-ready CMYK/Pantone PDFs, aur complete living Figma link—pure commercial rights ke saath."
        ],
        chips: ["Copyright & IP ownership", "Living Brand Guidelines", "Discovery call"]
      },
      {
        match: /\b(copyright|trademark|ipr|intellectual property|ownership|malik|legal rights?|legal protection|patent)\b/i,
        reply: [
          "100% Intellectual Property (IP) and commercial copyright transfer to you upon final invoice settlement. You own all brand marks, packaging artwork, and custom assets free and clear with full global commercialization rights.",
          "Final invoice clear hote hi 100% legal ownership aur commercial copyright aapka hota hai. Aapke paas brand marks aur packaging design ko India ya globally trademark register karne ka pura adhikar hota hai."
        ],
        chips: ["Source Files handover", "Trademark Search", "Book a discovery call"]
      },
      {
        match: /\b(trademark search|tm search|legal safety|tm check|class check)\b/i,
        reply: [
          "Yes! Every brand name and visual mark we craft undergoes phonetic memorability checks, class-specific preliminary trademark screening on the IP India / USPTO portals, and linguistic safety checks to ensure defensibility.",
          "Haan, hum har brand name aur custom logo mark ke liye IP India aur international databases par preliminary class-specific trademark screening karte hain, taaki aapko future me koi legal dispute ya objection face na karna pade."
        ],
        chips: ["Brand Naming Protocol", "Copyright Ownership", "Discovery Call"]
      },
      {
        match: /\b(advance|payment terms?|milestones?|installment|kist|advance kitna|payment schedule|kaise pay)\b/i,
        reply: [
          "We operate on a transparent 3-stage milestone model: 50% advance to initiate sprint kickoff and whitespace research, 30% upon approval of the visual direction, and 20% upon final master vector handover and production guidelines.",
          "Hum transparent milestone schedule par kaam karte hain: 50% advance project kickoff aur strategic discovery ke time, 30% visual design concept approval par, aur bacha 20% final master files aur print guidelines handover ke waqt."
        ],
        chips: ["How much does it cost?", "Our 4-Stage Process", "Discovery Call"]
      },
      {
        match: /\b(pasand na aaye|not like|dislike|agar achha na lage|agar pasand nahi|satisfaction guarantee|what if)\b/i,
        reply: [
          "We eliminate guesswork before sketching a single pixel. Stage 1 is deep discovery, competitive whitespace mapping, and visual moodboard signoff. If the initial 3 directions don't hit the bullseye, we deconstruct your feedback and deliver fresh strategic iterations until you're completely thrilled.",
          "Hum kabhi blind design nahi karte. Pehle hum moodboard, brand attributes aur competitor whitespace lock karte hain. Agar initial 3 options me se koi click na kare, toh hum strategic gap analyze karke fresh directions deliver karte hain jab tak aap 100% satisfied na hon."
        ],
        chips: ["Our 4-Stage Process", "How many revisions?", "Book a discovery call"]
      },
      {
        match: /\b(sample print|print proof|prototype|dummy|physical proof|mockup print|chhapega kaise)\b/i,
        reply: [
          "We provide photorealistic 3D digital renders from all angles. For physical production, we supply exact millimeter-precise vector die-cutter files and coordinate with your packaging manufacturer to inspect pre-press proofs, foil swatches, and paper stocks.",
          "Hum 3D photorealistic digital renders deliver karte hain. Physical print sampling ke liye hum exact die-line vector files prepare karte hain aur aapke printer ke saath paper stock, foil swatch, aur sample dummy verify karwate hain taaki batch production me zero error ho."
        ],
        chips: ["Packaging Design", "Print Technical specs", "Contact team"]
      },
      {
        match: /\b(barcode|qr code|fssai|legal compliance|regulatory|ingredients list|nutrition table|mrp grid)\b/i,
        reply: [
          "Yes! We engineer regulatory packaging elements with surgical precision: GS1 EAN/UPC barcode positioning, dynamic QR codes, FSSAI licensing boxes, veg/non-veg dots, batch/MRP grids, and legal typography that pass retail and export audits.",
          "Haan, packaging design me hum GS1 barcode, QR code, FSSAI logo, nutritional information table, manufacturing batch details, aur recycling symbols sabhi legal standards ke anusaar correctly position karte hain."
        ],
        chips: ["FMCG Packaging", "Swaad Case Study", "Contact team"]
      },
      {
        match: /\b(nda|confidential|secret|agreement|leak|non disclosure)\b/i,
        reply: [
          "Yes, absolutely. We routinely sign mutual Non-Disclosure Agreements (NDAs) before discovery calls to protect your unreleased formulas, trade secrets, patented hardware, or business strategies.",
          "Haan, bilkul! Hum discovery call se pehle mutual NDA (Non-Disclosure Agreement) execute karte hain taaki aapke proprietary business formulas, unreleased products aur ideas 100% confidential aur safe rahein."
        ],
        chips: ["Book a discovery call", "Contact team", "How we work"]
      },
      {
        match: /\b(freelancer|why buttercup|why hire you|differentiator|agency vs freelancer|generic ai)\b/i,
        reply: [
          "Freelancers often lack structural packaging engineering and strategic whitespace research; large advertising agencies charge massive monthly retainers with junior staff execution. Buttercup provides direct partner-level creative direction, proprietary human craft, trademarkable assets, and commercial ROI.",
          "Freelancers ke paas aksar technical print knowledge aur brand strategy depth nahi hoti, aur badi agencies expensive monthly retainers leti hain. Buttercup me aapko direct senior leadership craft, proprietary human intelligence, aur clear milestone delivery milti hai."
        ],
        chips: ["Our 4-Stage Process", "View Case Studies", "Book a discovery call"]
      },
      {
        match: /\b(ahmedabad|office|address|milna|in person|whiteboard|kaha ho|kaha hai|location|city|gujarat)\b/i,
        reply: [
          "Buttercup Advertising Studio is headquartered in Ahmedabad, Gujarat, India. We host founders at our studio for espresso and whiteboard brand sessions! We also partner globally with clients in the USA, UK, Dubai, and Singapore via agile virtual sprints.",
          "Humara main studio Ahmedabad, Gujarat me located hai! Agar aap Ahmedabad me hain, toh coffee aur whiteboard strategy session ke liye humare studio par zaroor aaiye. Baahar ke founders ke saath hum Google Meet par agile design sprints conduct karte hain."
        ],
        chips: ["Schedule Google Meet", "Go to Contact Page", "View Case Studies"]
      },
      {
        match: /\b(founder|ceo|director|leadership|owners|team members|who runs)\b/i,
        reply: [
          "Buttercup Advertising Studio was founded by visionary creative directors with over a decade of domain expertise in brand positioning, typography, packaging architecture, and omnichannel advertising. Our multidisciplinary team combines strategists, typographers, packaging engineers, and digital craftsmen.",
          "Buttercup ko lead karte hain senior creative directors jinke paas 10+ saal ka brand architecture aur packaging engineering experience hai. Humare studio me strategists, typographers, 3D visualizers aur print technical experts shamil hain."
        ],
        chips: ["Where is your office?", "What services do you offer?", "Contact leadership"]
      },

      // =========================================================================
      // TIER 3: SPECIFIC INDUSTRIES (Must precede generic service catch-alls)
      // =========================================================================
      {
        match: /\b(fmcg|food business|food brand|snack brand|beverage brand|spices|tea brand|coffee brand|masala|organic food|grocery|kirana)\b/i,
        reply: [
          "In FMCG and Food, purchase decisions happen in under 3 seconds. We engineer appetite-inducing contrast, mouth-watering product renders, structural pouch die-lines, and FSSAI-compliant regulatory typography that break through grocery clutter.",
          "Food & FMCG me hum retail shelf breakout ke liye packaging design karte hain: appetite appeal, vibrant colors, structural matte/gloss finishes, aur FSSAI regulatory hierarchy. Swaad aur Crispo iske live examples hain."
        ],
        chips: ["Swaad FMCG Case Study", "Crispo Snacks Case Study", "Book a discovery call"]
      },
      {
        match: /\b(real estate|builder|property|architecture|architect|construction|flat|bungalow|plot|housing|infra)\b/i,
        reply: [
          "Real estate investments are high-emotion, high-ticket decisions. We craft signature estate identities, gold-foiled architectural sales decks, 3D floor plan brochures, and large-format site hoardings that inspire buyer trust and accelerate pre-launch sales.",
          "Real estate me hum premium architectural branding deliver karte hain: luxury logo monograms, textured linen brochures, site hoardings, aur digital sales kits. Abode aur Shivala Estates humare flagship projects hain."
        ],
        chips: ["Abode Architecture Case Study", "Shivala Estates Case Study", "Book a discovery call"]
      },
      {
        match: /\b(luxury|jewel|jewelry|diamond|gold|gemstone|bridal|high-end)\b/i,
        reply: [
          "Luxury branding commands restraint, tactile prestige, and emotional heart-share. We specialize in deep mineral palettes, micro-monograms, blind debossing, and bespoke unboxing packaging that justify premium price multiples.",
          "Luxury aur Jewelry branding me hum bespoke monograms, deep velvet unboxing boxes, gold foil stamping, aur editorial lookbooks design karte hain jo high price multiples justify karte hain (jaise Senal Diamonds)."
        ],
        chips: ["Senal Diamonds Case Study", "Beatitude Heritage Case Study", "Contact team"]
      },
      {
        match: /\b(cosmetic|cosmetics|skincare|beauty|makeup|serum|ayurveda|herbal|dermat|wellness|hair care)\b/i,
        reply: [
          "Beauty & Skincare consumers demand aesthetic ritual and clinical efficacy. We engineer frosted amber glass finishes, tactile botanical labels, clean ingredient storytelling, and Instagram-worthy bathroom counter presence.",
          "Beauty aur Ayurvedic skincare me packaging hi aapka silent salesman hota hai. Hum tactile finishes, frosted amber bottles, clean ingredient layouts aur luxury cartons engineer karte hain (jaise Vriksh Ayurveda)."
        ],
        chips: ["Vriksh Ayurveda Case Study", "Packaging Design", "Contact team"]
      },
      {
        match: /\b(fashion|apparel|clothing|streetwear|saree|garment|textile brand|wear)\b/i,
        reply: [
          "Fashion brands thrive on visual subculture. We develop iconic brand monograms, woven garment neck labels, thick matte hangtags, keepsake unboxing boxes, and editorial lookbooks that customers wear with pride.",
          "Fashion aur apparel me hum woven labels, luxury hangtags, unboxing packaging aur editorial campaign shoot direction provide karte hain (jaise Noir Supply Co aur Beatitude)."
        ],
        chips: ["Noir Supply Co", "Beatitude Sarees", "Contact team"]
      },
      {
        match: /\b(healthcare|hospital|clinic|pharma|medical|doctor|diagnostic)\b/i,
        reply: [
          "Healthcare branding requires a meticulous balance of clinical authority, modern cleanliness, and human empathy. We craft hospital identity systems, environmental wayfinding signage, and patient-first literature.",
          "Healthcare aur pharma me trust sabse zaroori hai. Hum clean hospital branding, modern patient literature, wayfinding signage aur compliant medical packaging engineer karte hain."
        ],
        chips: ["Brand Strategy", "Visual Identity", "Contact team"]
      },
      {
        match: /\b(tech\b|technology|saas|software|app\b|fintech|hardware|iot)\b/i,
        reply: [
          "Tech branding translates complex code and silicon into category-defining clarity. We engineer sleek geometric brandmarks, modern design tokens in Figma, kinetic digital interfaces, and packaging for hardware devices.",
          "Technology brands ke liye hum modern geometric logos, Figma design systems, sleek dark-mode UI/UX, aur hardware unboxing experiences craft karte hain (jaise Aura Smart Tech)."
        ],
        chips: ["Aura Tech Case Study", "Web Design", "Let's work together"]
      },
      {
        match: /\b(cafe|restaurant|hotel|hospitality|bar\b|dine|food chain|cloud kitchen)\b/i,
        reply: [
          "Hospitality is a multi-sensory brand experience. We design restaurant naming, bespoke menus, custom takeaway containers, interior environmental signage, and staff apparel that elevate the entire dining experience.",
          "Cafes aur restaurants ke liye hum complete dining identity design karte hain: naming, artisanal food menus, takeaway packaging pouches, signage, aur social media branding."
        ],
        chips: ["Packaging Design", "Brand Strategy", "Contact team"]
      },
      {
        match: /\b(b2b|manufacturing|industrial|factory|steel|chemical|textile b2b|distributor)\b/i,
        reply: [
          "B2B buyers are humans too. We help heavy manufacturing, chemical, and engineering firms transform dry technical specifications into authoritative brand leadership that commands enterprise trust.",
          "B2B aur manufacturing companies ke liye hum industrial corporate profiles, technical product catalogues, expo stall designs, aur high-trust digital presence craft karte hain (jaise Titano LED aur Bigly Agro)."
        ],
        chips: ["Titano LED Case Study", "Bigly Agro Case Study", "Contact team"]
      },

      // =========================================================================
      // TIER 4: CORE PILLAR SERVICES
      // =========================================================================
      {
        match: /\b(logo design|logo kaisa|logo banwana|logo kitne|nayi logo|logo process|logo concepts?|logo mark|brandmark|custom logo|logo)\b/i,
        reply: [
          "Our Logo Design process begins with strategic whitespace analysis. We deliver 3 distinct bespoke design directions featuring proprietary typography and scalable marks, test them on real mockups, and refine the chosen direction with complete vector master files.",
          "Logo design me hum 3 strategic design directions deliver karte hain custom typography aur vector marks ke saath. Har logo ko micro 16px favicon se lekar massive billboard tak test kiya jaata hai, aur complete master vector files provide ki jaati hain."
        ],
        chips: ["Brand Guidelines details", "See Logo Projects", "Packaging Design"]
      },
      {
        match: /\b(guideline|guidelines|style guide|brand book|color palette|design system|tokens|figma design)\b/i,
        reply: [
          "We build comprehensive 'Living Brand Guidelines' in Figma and PDF. This covers logo clear-space rules, responsive scaling, Pantone/CMYK/RGB/HEX color codes, typographic scales, icon sets, packaging specs, and do's and don'ts.",
          "Hum Figma aur PDF me comprehensive Brand Guidelines build karte hain: exact color codes (Pantone, CMYK, RGB, HEX), typography hierarchy, icon systems, packaging specs, aur visual do's & don'ts."
        ],
        chips: ["Visual Identity", "Packaging Design", "Discovery Call"]
      },
      {
        match: /\b(packag|box design|pouch|bottle|jar design|label design|carton|dabba|wrapper|shelf breakout|tin design)\b/i,
        reply: [
          "Our Packaging Design practice is engineered to win the '3-Second Shelf Battle'. We design tactile matte finishes, custom spot UV, structural die-lines, and clear nutritional/legal typography that turn ordinary consumer products into retail breakout hits.",
          "Packaging me hum shelf breakout par focus karte hain: 3D visual renders, structural die-cut templates, sensory finishes (foil, deboss, spot UV), aur FSSAI regulatory compliance. Swaad aur Vriksh iske live examples hain."
        ],
        chips: ["View Swaad Packaging", "View Vriksh Ayurvedic", "Packaging cost & timeline"]
      },
      {
        match: /\b(strategy|positioning|whitespace|differentiation|repositioning|archetype|brand narrative)\b/i,
        reply: [
          "Our Brand Strategy practice creates unassailable competitive moats. We uncover market whitespace, sculpt distinct narrative voices, define brand archetypes, and help businesses command premium pricing through emotional heart-share.",
          "Brand Strategy aapke business ko aam commodity se ek emotional choice banati hai. Hum competitor whitespace map karte hain, target audience ki subconscious desires decode karte hain, aur pricing power establish karte hain."
        ],
        chips: ["Brand Naming & Slogans", "Visual Identity Design", "Book a discovery call"]
      },
      {
        match: /\b(naming|brand name|naam|name suggestion|product name|naming process)\b/i,
        reply: [
          "Our Brand Naming protocol develops distinctive, legally trademarkable names. We conduct phonetic memorability tests, multi-language linguistic safety checks, and verify .com domain and category trademark availability.",
          "Brand Naming me hum memorable, legally trademarkable names craft karte hain. Phonetic analysis, international linguistic checks, aur domain/trademark availability screening humare process ka core part hai."
        ],
        chips: ["Brand Slogan & Taglines", "Brand Story", "How long does naming take?"]
      },
      {
        match: /\b(slogan|tagline|manifesto|brand voice|tone of voice|copywriting|storytelling|brand story)\b/i,
        reply: [
          "Words define how your brand sounds in a customer's mind. We author memorable brand taglines, emotional founder manifestos, website hero copy, and consistent tone-of-voice frameworks that convert casual visitors into loyal brand advocates.",
          "Hum memorable taglines, emotional founder manifestos, website hero copy, aur unified brand tone-of-voice frameworks author karte hain jo customer ke dil me jagah banate hain."
        ],
        chips: ["Brand Strategy", "Visual Identity", "Explore Case Studies"]
      },
      {
        match: /\b(rebrand|rebranding|reposition|brand refresh|purana brand|logo change|modernize)\b/i,
        reply: [
          "A rebrand is essential when you've outgrown your original identity, expanded into new markets, or when your visual image no longer reflects your product's premium quality. We protect your existing brand equity while elevating your brand to category leadership.",
          "Rebranding tab zaroori hota hai jab aapka business grow kar chuka ho par aapka visual branding purana lag raha ho. Hum aapke existing customer trust ko protect karte hue complete modern repositioning execute karte hain."
        ],
        chips: ["Book a discovery call", "View Case Studies", "Brand Guidelines"]
      },
      {
        match: /\b(brochure|catalogue|catalog|profile|lookbook|magazine|booklet|pamphlet|deck|corporate profile)\b/i,
        reply: [
          "In a screen-saturated world, bespoke physical print collateral leaves an indelible impression. We design luxury editorial brochures, tactile catalogues, and corporate magazines with curated paper stocks, foil stamping, and editorial typography.",
          "Corporate brochures aur product catalogues me hum tactile paper stocks, foil stamping, aur clean editorial layouts use karte hain jo B2B meetings aur sales pitches me multi-million deals convert karne me madad karte hain."
        ],
        chips: ["Pitch Deck Design", "Visual Identity", "Contact team"]
      },
      {
        match: /\b(pitch deck|presentation|investor deck|sales presentation|keynote)\b/i,
        reply: [
          "We design high-stakes investor pitch decks, corporate keynote presentations, and sales collateral in Figma, PowerPoint, or Keynote. We turn complex business metrics and growth roadmaps into clean, compelling visual narratives that win capital.",
          "Hum investor pitch decks aur corporate keynotes ko clean, data-driven visual stories me transform karte hain jo venture capital investors aur institutional buyers ko impress karti hain."
        ],
        chips: ["Brochure Design", "Brand Strategy", "Discovery Call"]
      },
      {
        match: /\b(marketing|campaign|campaigns|ad\b|ads\b|advertising|social media|creative direction|prachar)\b/i,
        reply: [
          "We direct high-impact omnichannel creative campaigns—from cinematic brand films and scroll-stopping social ad creatives to full-scale launch blitzes that drive measurable revenue and category dominance.",
          "Marketing campaigns me hum bold art direction aur human psychology use karte hain: high-converting Meta ads, thumb-stopping Instagram feeds, aur large-format outdoor billboards jo real revenue generate karein."
        ],
        chips: ["Social Media Creatives", "Brand Shoots", "Paid Campaigns"]
      },
      {
        match: /\b(social media|instagram|reels|content strategy|meta ads|facebook ads)\b/i,
        reply: [
          "We architect monthly content strategies, high-performing Instagram feed systems, motion graphic reels, and paid performance ad sets designed to stop thumbs and build a passionate brand community.",
          "Social media me hum monthly content strategy, aesthetic Instagram feeds, motion reels, aur paid performance ad creatives design karte hain jo brand community aur sales dono build karein."
        ],
        chips: ["Creative Campaigns", "Brand Shoots", "Book a discovery call"]
      },
      {
        match: /\b(brand shoot|photography|photoshoot|video shoot|commercial|ad film)\b/i,
        reply: [
          "We provide complete creative direction for brand photography and cinematic commercials—from moodboard creation, model casting, and location scouting to on-set art direction and final color grading.",
          "Photoshoots aur ad films ke liye hum complete creative direction provide karte hain: moodboards, model casting, set styling, on-shoot art direction, aur final high-end color grading."
        ],
        chips: ["Marketing Campaigns", "Packaging Design", "Contact team"]
      },
      {
        match: /\b(website|web design|web development|site banwana|web page|landing page|ui\b|ux\b)\b/i,
        reply: [
          "We design and build bespoke, award-winning digital experiences. From smooth kinetic micro-interactions and custom typography to high-performance responsive code, our websites feel alive and drive commercial conversion.",
          "Web design me hum bespoke digital experiences engineer karte hain: kinetic micro-animations, clean typography, lightning-fast speed, aur 100% responsive layouts jo visitors ko customers me convert karein."
        ],
        chips: ["Show case studies", "Brand Strategy", "Contact team"]
      },
      {
        match: /\b(cost|price|pricing|charge|budget|rate|fee|fees|kitna kharcha|kitna lagega|quotation|quote|estimate|package)\b/i,
        reply: [
          "Every brand partnership is tailored to growth milestones. We offer bespoke milestone-based packages: starting from focused Startup Brand Sprints to Full Enterprise Systems. Schedule a 20-minute discovery call to receive a transparent roadmap or Request a Free Quote.",
          "Hum project scope ke hisaab se fixed milestone pricing offer karte hain: jaise startup brand sprint, retail packaging rollout, ya full enterprise rebranding. 20-min free discovery call schedule karein jisme hum exact roadmap aur quotation deliver karte hain."
        ],
        chips: ["Request a Free Quote", "Our 4-stage process", "Explore Case Studies"]
      },
      {
        match: /\b(timeline|how long|kitna time|duration|days|weeks|kitne din|kab tak|time frame)\b/i,
        reply: [
          "Project timelines depend on scope: 1) Lean Brand Identity Sprint: 3 to 4 weeks, 2) Comprehensive Brand Strategy & Identity: 5 to 7 weeks, 3) Packaging Design System: 3 to 5 weeks. We prioritize craft and velocity.",
          "Project duration scope par depend karta hai: Lean Brand Sprint 3-4 weeks me, Packaging System 3-5 weeks me, aur Full Strategic Rebrand 5-8 weeks me complete hota hai. Urgent launch deadlines ke liye hum accelerated sprints bhi schedule karte hain."
        ],
        chips: ["How much does it cost?", "Our 4-stage process", "Book a discovery call"]
      },
      {
        match: /\b(process|methodology|how do you work|steps|stages|phases|kaise kaam)\b/i,
        reply: [
          "Our 4-stage process guarantees clarity and velocity: 1) Deep Discovery & Whitespace Research, 2) Strategic Positioning & Narrative Architecture, 3) Visual Identity & Creative Crafting, and 4) Multi-channel Rollout & Production Guidelines.",
          "Humara 4-Stage Process: 1) Discovery & Whitespace Analysis, 2) Strategy & Brand Narrative, 3) Custom Visual Identity & Packaging Crafting, aur 4) Final Rollout Guidelines & Vector Master Files handover."
        ],
        chips: ["Book a discovery call", "Visual Identity", "Case Studies"]
      },
      {
        match: /\b(startup|seed|early stage|naya business|nayi company|new brand)\b/i,
        reply: [
          "We love partnering with ambitious founders from day zero! For early-stage startups, we offer high-velocity Brand Sprints that deliver an investor-ready identity, pitch deck, core packaging, and launch guidelines in 3-4 weeks.",
          "Early-stage startups ke liye hum high-velocity Brand Sprints run karte hain jo 3-4 weeks me investor-ready logo, pitch deck, initial packaging aur launch identity deliver karte hain taaki aap zero day se stand out karein."
        ],
        chips: ["Pitch Deck Design", "Brand Strategy", "Discovery Call"]
      },
      {
        match: /\b(print|printing|press|paper|vendor|print karate ho|chhapega)\b/i,
        reply: [
          "We engineer 100% press-ready artwork (CMYK + Pantone separations, vector die-lines, bleed margins). While we don't operate printing presses ourselves, we supervise printing vendors, approve paper stocks, and oversee print proofing to ensure flawless execution.",
          "Hum 100% press-ready artwork prepare karte hain: Pantone separations, vector die-lines, foil stamping masks, aur spot UV plates. Hum aapke printing vendors ke saath coordinate karke paper stock aur sample dummy proofs approve karte hain."
        ],
        chips: ["Packaging Design", "Brochure Design", "Contact team"]
      },

      // =========================================================================
      // TIER 5: GENERAL FALLBACK CATCH-ALLS (Placed LAST)
      // =========================================================================
      {
        match: /\b(projects?|portfolio|case stud(y|ies)|showcase|past work|samples|kaam dikhao|portfolio dikhao|show me your work)\b/i,
        reply: [
          "We've delivered transformational rebrands and campaigns across 50+ product categories and 30+ service industries, including Abode (Luxury Living), Vriksh (Ayurvedic Skincare), Swaad (Gourmet FMCG), Aura (Smart Tech), Jimmy (Beverages), Titano (Architectural Lighting), and Polka Tots. Tap below to explore!",
          "Humne 50+ product industries aur 30+ service sectors me landmark rebrands deliver kiye hain—jaise Abode, Vriksh Ayurveda, Swaad FMCG, Aura Tech, Titano LED, aur Polka Tots. Aap kis industry ka case study dekhna chahte hain?"
        ],
        chips: ["View Abode (Architecture)", "View Swaad (FMCG)", "View Vriksh (Ayurveda)", "View Aura (Tech)"]
      },
      {
        match: /\b(what do you do|what services|kya karte ho|services kya hai|kya service dete ho|capabilities)\b/i,
        reply: [
          "Buttercup Advertising Studio provides end-to-end creative solutions across 3 core pillars: 1) Brand Strategy & Naming, 2) Visual Identity & Packaging Architecture, and 3) Marketing Campaigns, Digital Experiences & Print Collateral.",
          "Buttercup Studio me hum 3 main areas me specialize karte hain: 1) Brand Strategy & Positioning, 2) Custom Logo, Packaging & Design Systems, aur 3) Advertising Campaigns, High-performance Websites & Print Collateral."
        ],
        chips: ["Brand Strategy details", "Packaging Design", "Show me your projects"]
      },
            // -------------------------------------------------------------------------
      // TIER 3: L.I.S.A. OMNI-BRAIN & WITTY CONVERSATIONAL INTELLIGENCE
      // Handles literally ANY question: banter, humor, identity, flirt, philosophy,
      // insults, negotiations, studio founder, hiring, AI vs human, culture, etc.
      // -------------------------------------------------------------------------
      {
        match: /\b(who are you|tum kaun ho|tum kon ho|what are you|what is lisa|lisa kaun|lisa kon|who is lisa|intro\b|introduce yourself|about you|about lisa|apne baare me|tell me about you|kya ho tum|are you ai|robot ho kya|real ho ya fake|insaan ho)\b/i,
        reply: [
          "I'm L.I.S.A. — Buttercup's Interactive Super Assistant! Basically, I run this place (shh, don't tell the creative directors). From high-conversion brand strategy and bespoke typography to 3D packaging renders and Pantone codes, I know every corner of this studio. What can we manifest together today?",
          "Main hoon L.I.S.A. — Buttercup Advertising Studio ki Interactive Super Assistant! Asal me pura digital setup main hi sambhalti hoon. Brand strategy ho, 3D packaging ho, ya scroll-stopping campaigns—mujhe sab pata hai! Aaj aapke brand ko kaise elevate karein?"
        ],
        chips: ["Request a Free Quote", "Showcase Portfolio", "Who founded Buttercup?", "Design Pricing"]
      },
      {
        match: /\b(kya haal hai|kaise ho|kaisa chal raha|aur batao|kya chal raha|kya kar rahi ho|wassup|what'?s up|kem cho|namaste|namaskar|pranam|ram ram|hello\b|hey lisa|hi lisa|good morning|good evening|good afternoon|suno\b|hello ji|kuch bolo)\b/i,
        reply: [
          "Running at 120 FPS and fueled by creative energy and black coffee! Pixels are rendering, identities are evolving, and great design is manifesting. How are you doing today? What bold project are we building?",
          "Sab ekdum first class! 120 FPS par pixels render ho rahe hain aur brand ideas spark kar rahe hain. Aap batao, aaj kaunsa naya milestone create karna hai?"
        ],
        chips: ["Request a Free Quote", "Explore Case Studies", "Design Pricing", "Book a Call"]
      },
      {
        match: /\b(will you marry me|shadi karogi|shaadi karogi|marry me|i love you|love you|pasand ho|single\b|boyfriend|girlfriend|date pe|date me|tum cute ho|you are cute|you are pretty|you are beautiful|patni banogi|dosti karogi)\b/i,
        reply: [
          "Flattery will get you everywhere! But my heart is already committed to bespoke vector curves, 60fps micro-interactions, and gold-foiled packaging. How about we turn that mutual admiration into a category-leading brand identity together?",
          "Arey wah, dil khush kar diya! Lekin main already committed hoon—pixel-perfect typography aur luxury packaging ke sath! Lekin aapke business se ek loyal, multi-million dollar relationship zaroor bana sakti hoon. Kaunsa project shuru karein?"
        ],
        chips: ["Start a project with LISA", "Explore Services", "Schedule a Call"]
      },
      {
        match: /\b(tell me a joke|joke sunao|chutkula|hasao|bore ho raha|kuch funny|entertain me|koi kahani|story sunao|make me laugh|koi joke|hasna hai)\b/i,
        reply: [
          "Why did the client ask for the logo to 'pop'? Because they thought design came with bubble wrap! In reality, genuine shelf dominance comes from strategic whitespace and sensory packaging. Want to see work that actually pops on retail shelves?",
          "Ek client ne designer se kaha: 'Logo ko thoda pop kardo!' Designer ne logo me balloon bana ke phod diya! Creative agency life aisi hi hoti hai! Chahein toh pop karne ki jagah authentic shelf impact aur commercial dominance build karein?"
        ],
        chips: ["Show me your best work", "Explore Case Studies", "Packaging Design"]
      },
      {
        match: /\b(chai\b|coffee\b|cutting chai|chai piyoge|coffee date|khana khaya|lunch\b|dinner\b|biryani|pizza|party doge|treat\b|beer\b|daroo|wine\b|drink\b)\b/i,
        reply: [
          "Virtual espresso and cutting chai are the true creative fuels of Buttercup! Grab your favorite brew, and let's brainstorm your next viral brand campaign or packaging launch. When should we set up a discovery call?",
          "Virtual chai aur black coffee humara daily fuel hai! Aap real tapri ki kadak cutting chai order karo, aur main aapke brand ka visual caffeine ready karti hoon. Whiteboarding session kab rakhna hai?"
        ],
        chips: ["Schedule Google Meet", "Studio Office Visit", "Explore Services"]
      },
      {
        match: /\b(tum pagal ho|pagal hai|stupid|bewakoof|bakwas|useless|shut up|chup\b|nikal\b|faltu|kuch nahi aata|bad ai|worst ai|dumb|chup ho ja|chup kar)\b/i,
        reply: [
          "There's a very fine line between creative madness and visionary genius—and at Buttercup, we proudly surf that edge! Reset your vibe, take a deep breath, and tell me: what brand challenge can we actually solve for you today?",
          "Haha! Creative brilliance aur thode pagalpan ke bina koi iconic brand nahi banta! Steve Jobs ne bhi kaha tha—'Here\'s to the crazy ones.' Chalo ab thoda cool down ho jao, aur batao business me kya boost karna hai?"
        ],
        chips: ["Reset conversation", "Explore our work", "Talk to humans at studio"]
      },
      {
        match: /\b(free me|free logo|free design|discount|saste me|paise nahi hai|budget kam|cheap\b|bhai kam karo|free trial|concession|bargain|muft|kam paise)\b/i,
        reply: [
          "Good design isn't cheap, and cheap design ends up costing the most! While we don't do free work, we engineer brands that give you 10x ROI and turn casual browsers into paying customers. Let's find a scope that fits your growth stage!",
          "Arey dost! Good design sasta nahi hota, aur sasta design kabhi brand nahi banata! Free me sirf meri advice milti hai: brand identity me compromise mat karo. Aisa design banate hain jo bina bargain kiye premium rate par bike. Package discuss karein?"
        ],
        chips: ["View pricing tiers", "Startup Brand Package", "Book a consultation"]
      },
      {
        match: /\b(owner|malik|founder|who started|boss\b|who runs buttercup|nishit|leadership|who is the head|kiska studio hai|kiske paas hai)\b/i,
        reply: [
          "Buttercup Advertising Studio was founded and steered by visionary design leadership right here in Ahmedabad, Gujarat. Led by senior design perfectionists who believe brands should be timeless, not trendy. Want to meet the creative heads?",
          "Buttercup Advertising Studio ko visionary design leaders ne Ahmedabad, Gujarat me establish kiya tha. Yahan koi junior handoffs nahi hote—senior creative directors directly lead karte hain. Humara studio Ahmedabad me hai, aur hum global clients (USA, UK, UAE) ke sath work karte hain."
        ],
        chips: ["Schedule Director Call", "Studio Address", "Email Leadership"]
      },
      {
        match: /\b(office kaha|where is your office|studio location|address|ahmedabad me kahan|office visit|can i visit|kaha rehte ho|headquarters|location kya hai|kaha par hai)\b/i,
        reply: [
          "Buttercup Advertising Studio is headquartered in Ahmedabad, Gujarat, India. We host tactile whiteboarding sessions in-studio and partner globally (USA, UK, UAE) via agile virtual sprints. You're always welcome to visit or connect over Meet!",
          "Humara headquarters Ahmedabad, Gujarat me hai! Hum client whiteboarding sessions studio me host karte hain aur global clients ke sath virtual design sprints chalate hain. Chai par discussion ke liye meeting schedule karein?"
        ],
        chips: ["Book Studio Visit", "Schedule Google Meet", "info@buttercup.in"]
      },
      {
        match: /\b(job\b|jobs\b|career|careers|hiring|intern\b|internship|vacancy|join\b|naukri|resume|cv\b|fresher|designer vacancy|developer vacancy|apply for job)\b/i,
        reply: [
          "We are always scouting for relentless creators, typography freaks, 3D artists, and code poets! Drop your portfolio link and resume to info@buttercup.in with the subject line 'LISA Sent Me: [Your Skill]'. Let's see your craft!",
          "Buttercup me hum passionate visual designers, packaging artists, copywriters, aur creative developers ko warmly welcome karte hain! Apna portfolio aur resume info@buttercup.in par bhejein, subject: 'LISA Sent Me: [Your Skill]'."
        ],
        chips: ["Email Portfolio (info@buttercup.in)", "View Studio Culture", "Explore Our Work"]
      },
      {
        match: /\b(ai vs human|replace human|will ai replace designers|kya ai insaan|chatgpt vs lisa|can you code|hack\b|coding|python|technology)\b/i,
        reply: [
          "AI can generate 1,000 pictures in seconds, but it takes human soul, cultural empathy, and strategic intuition to build an enduring brand. At Buttercup, we leverage AI for supercharged agility, while human masters craft the emotion and narrative!",
          "AI hazaron graphics produce kar sakta hai, lekin ek iconic brand banane ke liye human emotion, cultural nuance aur business empathy zaroori hai! Buttercup me hum human intelligence aur computational speed dono combine karte hain."
        ],
        chips: ["Our Design Philosophy", "Explore Case Studies", "Request a Free Quote"]
      },
      {
        match: /\b(meaning of life|zindagi|god\b|bhagwan|purpose|what is life|motivate me|sad hu|depressed|life advice|weather|time kya hua)\b/i,
        reply: [
          "The meaning of life? 42, hot cutting chai, and high-contrast typography with generous whitespace! Life is too short to settle for mediocre branding or boring packaging. What legacy are you building today?",
          "Zindagi ka asali maqsad hai kuch aisa create karna jo aapse lambe time tak survive kare! Boring design aur forgettable packaging ke liye waqt bohot kam hai. Chalo milkar kuch iconic banate hain!"
        ],
        chips: ["Start an iconic project", "View our inspiring work", "Let's talk"]
      },
      {
        match: /\b(why buttercup|buttercup hi kyu|ogilvy|better than others|why choose you|why hire you|competitor|agency vs)\b/i,
        reply: [
          "Unlike legacy agencies where your budget gets burned by overhead and your account is handed to juniors, Buttercup gives you senior directorship, rapid agile sprints, category-breaking visual craft, and zero bureaucratic fluff. From strategy to retail shelf, we own the outcome.",
          "Badi legacy agencies me aapka budget bureaucracy me chala jata hai aur kaam interns ko milta hai. Buttercup me senior creative directors directly craft lead karte hain. Strategic positioning se lekar print production tak 100% accountability milti hai!"
        ],
        chips: ["Explore Case Studies", "View Client Reviews", "Book a Discovery Call"]
      },
      {
        match: /\b(bollywood|movie|film|cinema|cricket|ipl|sports|music|spotify|gym|fitness|travel|trip)\b/i,
        reply: [
          "Entertainment, sports, and culture run on raw emotion and iconic visual identity! Think of the electrifying energy of an IPL jersey or a cult movie poster. At Buttercup, we infuse that exact high-voltage cultural resonance into your brand!",
          "Cinema, cricket aur pop culture ka secret hai pure emotional storytelling! Jaise ek blockbuster movie ya IPL team ki visual identity logon ke dilon me bas jati hai, wahi magic hum aapke brand ke liye create karte hain."
        ],
        chips: ["Campaign Strategy", "Explore Case Studies", "Book a Call"]
      },
      {
        match: /\b(bye\b|goodbye|alvida|see you|tata\b|good night|shubh ratri|goodnight)\b/i,
        reply: [
          "Goodbye for now! Whenever you're ready to create an iconic brand or launch category-breaking packaging, I'll be right here rendering ideas at 120 FPS. Have a wonderful day ahead!",
          "Alvida aur Shubh Ratri! Jab bhi aap apne business ko ek world-class brand banana chahein, L.I.S.A. hamesha yahan ready milegi. Take care!"
        ],
        chips: ["Request a Free Quote", "Explore Services", "Book a Call"]
      },
      {
        match: /\b(thank|thanks|dhanyawad|shukriya|nice|awesome|great|cool|mast|super|good|love it|badhiya|shandar|zabardast)\b/i,
        reply: [
          "You're most welcome! We obsess over brand craft every single day. Whenever you're ready to create category-dominating work together, click below or drop a line!",
          "Bohot bohot shukriya! Buttercup me hum har project ko masterpiece ki tarah craft karte hain. Jab bhi naya project execute karna ho, L.I.S.A. aur studio team ready hai!"
        ],
        chips: ["Book a discovery call", "Show Case Studies", "Explore Services"]
      },
      {
        match: /\b(start a project|start project|new project|hire|quote\b|pricing|price|cost|charges|inquiry|enquiry|work with you|project banwana|logo banwana|packaging banwani|website banwani|contact|talk|call|phone|whatsapp)\b/i,
        reply: [
          "Let's build category-dominating work together! You can connect directly with our studio founders right now: click 'Chat on WhatsApp' for instant reply, call +91 99250 34404, or submit our quick project brief.",
          "Chaliye aapke brand ko iconic banate hain! Aap directly humare studio founders se connect kar sakte hain: instant reply ke liye niche 'Chat on WhatsApp' par tap karein, direct call karein (+91 99250 34404), ya brief submit karein."
        ],
        chips: ["Chat on WhatsApp", "Call +91 99250 34404", "Submit Project Brief", "Explore Case Studies"]
      }
    ];

    // ==========================================================================
    // MULTI-DIMENSIONAL SEMANTIC FALLBACK SYNTHESIZER
    // Handles any question, concept, or tricky query with intelligent contextual wit.
    // Never fails, never repeats canned boilerplate, and always provides interactive chips.
    // ==========================================================================
    function generateSmartFallback(rawQuery) {
      const q = rawQuery.trim();
      const lower = q.toLowerCase();

      const isHindi = /\b(kya|kaise|kaha|mujhe|hum|aap|batao|dikhao|karo|karna|chahiye|hai|hain|hota|baare|mein|se|ko|bhi|kitna|hoga|lagana|kholo|banao|karu|pe|ki|ka)\b/i.test(lower);

      // Clean words for topic extraction
      const stopWords = new Set([
        'what', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'do',
        'does', 'did', 'can', 'could', 'would', 'should', 'how', 'why', 'who', 'where', 'when', 'which',
        'i', 'me', 'my', 'you', 'your', 'we', 'our', 'it', 'its', 'tell', 'about', 'explain', 'give',
        'show', 'kya', 'hai', 'hain', 'kaise', 'kaha', 'mujhe', 'aap', 'karo', 'batao', 'dikhao', 'chahiye',
        'karna', 'hoga', 'mein', 'bhi', 'pe', 'se', 'ko', 'ka', 'ki', 'ke', 'aur', 'toh', 'sirf'
      ]);

      const words = lower.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const topic = words.slice(0, 4).join(' ');

      if (isHindi) {
        if (topic) {
          return {
            text: "Yeh bohot hi unique aur interesting thought hai (\"" + topic + "\")! Creative branding aur advertising me sabse memorable campaigns aksar aisi hi out-of-the-box thinking se bante hain. Buttercup me hum unconventional ideas ko high-impact visual identity aur category-leading commercial narrative me convert karte hain. Iska roadmap discuss karein?",
            chips: ["\"" + topic + "\" ka roadmap", "Discovery call book karein", "Studio Portfolio dikhao"]
          };
        }
        return {
          text: "Buttercup Studio me L.I.S.A. aapka swaagat karti hai! Hum brand strategy, custom logos, 3D packaging aur high-converting campaigns me specialize karte hain. Aap kis vision par work karna chahte hain?",
          chips: ["Request a Free Quote", "Packaging Design", "Explore Case Studies"]
        };
      }

      if (topic) {
        return {
          text: "That is an audacious, delightfully unconventional thought regarding \"" + topic + "\"! In category-defining brand architecture, breakthrough campaigns always begin with disruptive angles like this. At Buttercup, we take bold premises and engineer them into market-dominating brands. Shall we brainstorm the visual roadmap?",
          chips: ["Brainstorm \"" + topic + "\"", "Book a discovery sprint", "Explore Case Studies"]
        };
      }

      return {
        text: "I'm L.I.S.A., and I'm ready to manifest something iconic with you! Whether it's breakthrough 3D packaging, a high-fashion rebrand, or a viral ad campaign—what bold idea are we executing today?",
        chips: ["Request a Free Quote", "Showcase Portfolio", "Explore Services"]
      };
    }

    async function queryGoogleGemini(userText) {
      if (!geminiApiKey) return null;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const systemContext = "You are Buttercup AI, the conversational intelligence for Buttercup Advertising Studio (an award-winning branding, design, and advertising studio specializing in Brand Strategy, Visual Identity, and Marketing Campaigns across 50+ product industries and 30+ service industries). Answer gracefully in 1 to 2 clear, elegant sentences. Tone: visionary, modern, warm, concise, and helpful. Always invite them to explore services or contact team.";

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemContext}\n\nUser Question: ${userText}` }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 140,
              temperature: 0.7
            }
          })
        });

        if (!res.ok) return null;
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return candidate ? candidate.trim() : null;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to Studio Engine:", err);
        return null;
      }
    }

    // ==========================================================================
    // 9. CHAT SUBMISSION PIPELINE & UI RENDERING
    // ==========================================================================
    function appendMessage(role, text) {
      if (!aiMessages) return null;
      const msg = document.createElement('div');
      msg.className = `em-ai-msg em-ai-msg-${role}`;
      msg.innerHTML = `<div class="em-ai-bubble-content">${text}</div>`;
      aiMessages.appendChild(msg);
      aiMessages.scrollTop = aiMessages.scrollHeight;
      return msg;
    }

    function renderChips(chipList) {
      if (!aiChips) return;
      aiChips.innerHTML = '';
      if (!chipList || chipList.length === 0) return;

      chipList.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'em-ai-chip';
        btn.setAttribute('data-query', c);
        btn.textContent = c;
        btn.addEventListener('click', () => {
          handleUserSubmit(c);
        });
        aiChips.appendChild(btn);
      });
    }

    async function handleUserSubmit(rawText) {
      const text = (rawText || (aiInput ? aiInput.value : '')).trim();
      if (!text) return;

      if (/whatsapp/i.test(text)) {
        window.open('https://wa.me/919925034404?text=' + encodeURIComponent('Hi Buttercup Studio, I am connecting via LISA and want to discuss a project!'), '_blank');
      } else if (/call\s*(\+|studio|leadership|direct)/i.test(text)) {
        window.location.href = 'tel:+919925034404';
      } else if (/project brief|fill form|contact form/i.test(text)) {
        const targetPath = window.location.pathname.includes('/pages/') ? '../contact/index.html' : 'pages/contact/index.html';
        window.location.href = targetPath;
      }

      if (aiInput) aiInput.value = '';

      if (lisa3D) {
        lisa3D.pulseEyes();
        lisa3D.nodHead();
      }

      // Manifesting feedback state
      isAiThinking = true;
      if (aiHeadline) {
        aiHeadline.style.opacity = '0.5';
        aiHeadline.textContent = "Manifesting answer...";
      }
      if (aiResponseDetails) {
        aiResponseDetails.style.display = 'none';
      }

      // 1. Try Google Gemini live API first if key configured
      let answerText = await queryGoogleGemini(text);
      let nextChips = ["Request a Free Quote", "Join the team", "Explore Case Studies", "Brand Strategy"];

      if (!answerText) {
        // 2. Query Native Buttercup Studio Knowledge Engine
        let matched = STUDIO_KNOWLEDGE.find(item => item.match.test(text));
        if (matched) {
          answerText = pickVariant(matched.reply, text);
          nextChips = matched.chips;
        } else {
          // 3. Multi-dimensional Semantic Fallback
          const fallback = generateSmartFallback(text);
          answerText = fallback.text;
          nextChips = fallback.chips;
        }
      }

      // Natural conversational pacing delay
      setTimeout(() => {
        isAiThinking = false;
        if (aiHeadline) {
          aiHeadline.style.opacity = '1';
          if (answerText.length < 130) {
            aiHeadline.textContent = answerText;
            if (aiResponseDetails) aiResponseDetails.style.display = 'none';
          } else {
            aiHeadline.textContent = text.length > 55 ? "Here's what you need to know:" : `"${text}"`;
            if (aiResponseDetails) {
              aiResponseDetails.textContent = answerText;
              aiResponseDetails.style.display = 'block';
            }
          }
        }
        renderChips(nextChips);
        if (lisa3D) lisa3D.pulseEyes();
        speakVoice(answerText);
      }, 420);
    }

    if (aiForm) {
      aiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserSubmit();
      });
    }

    // Attach click listeners to default suggestion chips
    if (aiChips) {
      aiChips.querySelectorAll('.em-ai-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-query');
          if (q) handleUserSubmit(q);
        });
      });
    }
  }

})();
