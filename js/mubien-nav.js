/**
 * MUBIEN.COM STYLE DYNAMIC PILL NAVBAR & iOS WIDGET DRAWER
 * Buttercup Advertising Studio (BAS)
 */
(function () {
  'use strict';

  // Helper to resolve links relative to the site root
  function resolvePath(target) {
    if (target.startsWith('http') || target.startsWith('#') || target.startsWith('mailto:') || target.startsWith('tel:')) {
      return target;
    }
    const loc = window.location.pathname;
    let prefix = '';
    if (loc.includes('/pages/services/') || loc.includes('/pages/industries/')) {
      prefix = '../../../';
    } else if (loc.includes('/pages/')) {
      prefix = '../../';
    } else if (loc.includes('/projects/')) {
      prefix = '../';
    }
    return prefix + target;
  }

  // Inject CSS link if not already present
  if (!document.querySelector('link[href*="mubien-nav.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = resolvePath('css/mubien-nav.css');
    document.head.appendChild(link);
  }

  // Build and inject HTML
  function initMubienNav() {
    if (document.querySelector('.mubien-pill-bar')) return;

    // 1. Backdrop Overlay
    const backdrop = document.createElement('div');
    backdrop.className = 'mubien-backdrop';
    document.body.appendChild(backdrop);

    // 2. iOS Control Center Widget Drawer
    const drawer = document.createElement('div');
    drawer.className = 'mubien-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Main Navigation');
    drawer.setAttribute('data-lenis-prevent', 'true');
    drawer.innerHTML = `
      <div class="mubien-drawer-handle" aria-hidden="true"></div>

      <!-- Top Widgets Grid -->
      <div class="mubien-widget-grid">
        <!-- Card 1: Case Studies (Work) -->
        <a href="${resolvePath('pages/case-studies/index.html')}" class="mubien-card">
          <div class="mubien-card-top-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <div>
            <h3 class="mubien-card-title">Case Studies</h3>
            <p class="mubien-card-subtitle">Selected Work (9 Projects)</p>
          </div>
        </a>

        <!-- Card 2: Studio / About Us -->
        <a href="${resolvePath('pages/about/index.html')}" class="mubien-card">
          <div class="mubien-card-top-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h3 class="mubien-card-title">Studio</h3>
            <p class="mubien-card-subtitle">About Buttercup</p>
          </div>
        </a>

        <!-- Card 3: Agency Reel (Full Width) -->
        <div class="mubien-card is-full-width mubien-reel-card" id="mubienPlayReelBtn">
          <img src="${resolvePath('images/695e462c6800fa6b436a7470_Women-Collaborating-1.avif')}" alt="Agency Reel" class="mubien-reel-video-thumb">
          <div class="mubien-reel-overlay">
            <div class="mubien-reel-label">Play Reel • 2026</div>
            <div class="mubien-reel-play-btn" aria-label="Play Reel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        </div>

        <!-- Card 4: Slide To Contact Us (Real Interactive Draggable Slider) -->
        <div class="mubien-contact-slider" id="mubienContactSlider" role="slider" aria-label="Slide to contact us" tabindex="0">
          <div class="mubien-contact-track-fill" id="mubienSliderFill"></div>
          <div class="mubien-contact-knob" id="mubienSliderKnob">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <span class="mubien-contact-text" id="mubienSliderText">Slide to contact us →</span>
        </div>

        <!-- Card 5: Services -->
        <a href="${resolvePath('pages/services/brand-strategy/index.html')}" class="mubien-card">
          <div class="mubien-card-top-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div>
            <h3 class="mubien-card-title">Services</h3>
            <p class="mubien-card-subtitle">Strategy & Identity</p>
          </div>
        </a>

        <!-- Card 6: Industries -->
        <a href="${resolvePath('pages/industries/product-base/index.html')}" class="mubien-card">
          <div class="mubien-card-top-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div>
            <h3 class="mubien-card-title">Industries</h3>
            <p class="mubien-card-subtitle">Product & Service</p>
          </div>
        </a>

        <!-- Card 7: AI Assistant -->
        <div class="mubien-card" id="mubienAiCard">
          <div class="mubien-card-top-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          </div>
          <div>
            <h3 class="mubien-card-title">Buttercup AI</h3>
            <p class="mubien-card-subtitle">Ask anything ✦</p>
          </div>
        </div>

        <!-- Card 8: Live Clock Widget (India Time) -->
        <div class="mubien-card mubien-clock-card">
          <div class="mubien-clock-dial">
            <div class="mubien-clock-dot"></div>
            <div class="mubien-clock-hand-hour" id="mubienHourHand"></div>
            <div class="mubien-clock-hand-minute" id="mubienMinuteHand"></div>
          </div>
          <p class="mubien-clock-location">India (IST)</p>
          <p class="mubien-clock-digital" id="mubienClockDigital">--:--</p>
        </div>

        <!-- Card 9: Blogs & Insights -->
        <a href="${resolvePath('pages/blogs/index.html')}" class="mubien-card is-full-width">
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <div>
              <h3 class="mubien-card-title">Blogs & Insights</h3>
              <p class="mubien-card-subtitle">Design, branding & creative journals</p>
            </div>
            <div style="font-size:18px; color:#121212; font-weight:bold;">→</div>
          </div>
        </a>
      </div>

      <!-- Drawer Bottom Footer Bar (Single View - No Swipe Confusion) -->
      <div class="mubien-drawer-footer">
        <a href="${resolvePath('index.html')}" class="mubien-drawer-brand-btn" aria-label="Home">BAS</a>
        <div style="font-size: 11px; font-weight: 600; color: #8e8e93; letter-spacing: 0.04em; text-transform: uppercase;">Buttercup Studio</div>
        <button class="mubien-drawer-close-btn" id="mubienDrawerCloseBtn" aria-label="Close menu">✕</button>
      </div>
    `;
    document.body.appendChild(drawer);

    // 3. Floating Bottom Capsule Pill Bar
    const pillBar = document.createElement('nav');
    pillBar.className = 'mubien-pill-bar';
    pillBar.setAttribute('aria-label', 'Floating Project Navigation');
    pillBar.innerHTML = `
      <div class="mubien-pill-badge" id="mubienPillBadge" title="Buttercup Studio">
        <span class="badge-text" id="mubienBadgeText">BAS</span>
      </div>
      <a href="${resolvePath('pages/case-studies/index.html')}" class="mubien-pill-text-link" id="mubienPillLink">
        <span class="mubien-pill-text" id="mubienPillText">Explore Selected Work</span>
      </a>
      <button class="mubien-menu-btn" id="mubienMenuBtn" aria-label="Toggle menu" aria-expanded="false">
        <span class="menu-bar"></span>
        <span class="menu-bar"></span>
      </button>
    `;
    document.body.appendChild(pillBar);

    // Elements
    const menuBtn = pillBar.querySelector('#mubienMenuBtn');
    const closeBtn = drawer.querySelector('#mubienDrawerCloseBtn');
    const pillBadge = pillBar.querySelector('#mubienPillBadge');
    const pillText = pillBar.querySelector('#mubienPillText');
    const pillLink = pillBar.querySelector('#mubienPillLink');
    const badgeText = pillBar.querySelector('#mubienBadgeText');
    const aiCard = drawer.querySelector('#mubienAiCard');
    const playReelBtn = drawer.querySelector('#mubienPlayReelBtn');

    // Menu Open/Close Logic
    let isOpen = false;

    function openMenu() {
      isOpen = true;
      pillBar.classList.add('is-open');
      drawer.classList.add('is-open');
      backdrop.classList.add('is-visible');
      document.documentElement.classList.add('mubien-modal-open');
      document.body.classList.add('mubien-modal-open');
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      menuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      isOpen = false;
      pillBar.classList.remove('is-open');
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      document.documentElement.classList.remove('mubien-modal-open');
      document.body.classList.remove('mubien-modal-open');
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      if (isOpen) closeMenu();
      else openMenu();
    }

    // Direct, buttery-smooth wheel scrolling for drawer (bypasses Lenis & stops background page scroll)
    drawer.addEventListener('wheel', e => {
      e.stopPropagation();
      drawer.scrollTop += e.deltaY;
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    drawer.addEventListener('touchmove', e => {
      e.stopPropagation();
    }, { passive: true });

    backdrop.addEventListener('wheel', e => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    backdrop.addEventListener('touchmove', e => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleMenu();
    });

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    // Close menu when navigating through links
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setTimeout(closeMenu, 150);
      });
    });

    // AI Assistant card trigger
    if (aiCard) {
      aiCard.addEventListener('click', e => {
        e.preventDefault();
        closeMenu();
        if (typeof window.openButtercupAi === 'function') {
          window.openButtercupAi();
        } else {
          const aiBtn = document.getElementById('openAiAssistantBtn') || document.querySelector('[data-action="open-ai"]');
          if (aiBtn) aiBtn.click();
        }
      });
    }

    // Play Reel trigger
    if (playReelBtn) {
      playReelBtn.addEventListener('click', () => {
        closeMenu();
        const videoBtn = document.querySelector('.play-button, .w-lightbox');
        if (videoBtn) {
          videoBtn.click();
        } else {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      });
    }

    // 3. Interactive "Slide to contact us" Draggable Slider
    const contactSlider = drawer.querySelector('#mubienContactSlider');
    const sliderKnob = drawer.querySelector('#mubienSliderKnob');
    const sliderFill = drawer.querySelector('#mubienSliderFill');
    const sliderText = drawer.querySelector('#mubienSliderText');

    if (contactSlider && sliderKnob) {
      let isDragging = false;
      let startX = 0;
      let maxSlide = 0;
      let isUnlocked = false;

      function calcMaxSlide() {
        return Math.max(0, contactSlider.clientWidth - sliderKnob.clientWidth - 8);
      }

      function onStart(clientX) {
        if (isUnlocked) return;
        isDragging = true;
        maxSlide = calcMaxSlide();
        startX = clientX;
        contactSlider.classList.add('is-dragging');
        sliderKnob.style.transition = 'none';
        if (sliderFill) sliderFill.style.transition = 'none';
      }

      function onMove(clientX) {
        if (!isDragging || isUnlocked) return;
        const deltaX = clientX - startX;
        const clampedX = Math.max(0, Math.min(deltaX, maxSlide));
        const progress = maxSlide > 0 ? clampedX / maxSlide : 0;

        sliderKnob.style.transform = `translateX(${clampedX}px)`;
        if (sliderFill) sliderFill.style.width = `${clampedX + 50}px`;
        if (sliderText) sliderText.style.opacity = `${Math.max(0, 1 - (progress * 1.6))}`;

        if (progress >= 0.78) {
          triggerUnlock();
        }
      }

      function onEnd() {
        if (!isDragging || isUnlocked) return;
        isDragging = false;
        contactSlider.classList.remove('is-dragging');

        // Smooth spring snap back to start
        sliderKnob.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        sliderKnob.style.transform = 'translateX(0px)';
        if (sliderFill) {
          sliderFill.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          sliderFill.style.width = '0px';
        }
        if (sliderText) {
          sliderText.style.transition = 'opacity 0.25s ease';
          sliderText.style.opacity = '1';
        }
      }

      function triggerUnlock() {
        if (isUnlocked) return;
        isUnlocked = true;
        isDragging = false;
        contactSlider.classList.add('is-unlocked');

        sliderKnob.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        sliderKnob.style.transform = `translateX(${maxSlide}px)`;
        if (sliderFill) {
          sliderFill.style.transition = 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          sliderFill.style.width = '100%';
        }
        if (sliderText) {
          sliderText.textContent = 'Opening Contact...';
          sliderText.style.opacity = '1';
        }

        setTimeout(() => {
          closeMenu();
          window.location.href = resolvePath('pages/contact/index.html');
        }, 280);
      }

      // Mouse drag listeners
      sliderKnob.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        onStart(e.clientX);
      });

      contactSlider.addEventListener('mousedown', e => {
        if (e.target !== sliderKnob && !sliderKnob.contains(e.target)) {
          e.preventDefault();
          onStart(e.clientX);
        }
      });

      window.addEventListener('mousemove', e => {
        if (isDragging) {
          e.preventDefault();
          onMove(e.clientX);
        }
      }, { passive: false });

      window.addEventListener('mouseup', () => {
        if (isDragging) onEnd();
      });

      // Touch drag listeners (mobile & tablet)
      sliderKnob.addEventListener('touchstart', e => {
        e.stopPropagation();
        if (e.touches && e.touches[0]) onStart(e.touches[0].clientX);
      }, { passive: true });

      contactSlider.addEventListener('touchstart', e => {
        if (e.touches && e.touches[0]) onStart(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchmove', e => {
        if (isDragging && e.touches && e.touches[0]) onMove(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchend', () => {
        if (isDragging) onEnd();
      });

      // Tap / Click right half to unlock
      contactSlider.addEventListener('click', e => {
        if (isUnlocked) return;
        const rect = contactSlider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width * 0.45) {
          maxSlide = calcMaxSlide();
          triggerUnlock();
        }
      });
    }

    // 4. Clock Widget Live Update (IST / India Time)
    function updateClock() {
      const now = new Date();
      // IST is UTC+5:30
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));

      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();

      // Hand angles
      const hourDeg = (hours % 12) * 30 + minutes * 0.5;
      const minDeg = minutes * 6 + seconds * 0.1;

      const hourHand = document.getElementById('mubienHourHand');
      const minHand = document.getElementById('mubienMinuteHand');
      const digital = document.getElementById('mubienClockDigital');

      if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
      if (minHand) minHand.style.transform = `rotate(${minDeg}deg)`;

      if (digital) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        digital.textContent = `${displayHours}:${displayMinutes} ${ampm}`;
      }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // 5. Dynamic Scroll Spy (Changes Pill Content Like Mubien.com)
    const caseCards = document.querySelectorAll('.tl-single-scroll-card');
    const servicesSection = document.getElementById('services');
    const reviewSection = document.querySelector('.review-section');
    const contactSection = document.querySelector('.rwl-footer, #contact');

    // Project metadata mapping
    const projectMap = {
      'grabz': { name: 'Grabz', img: 'images/case-studies/grabz/01.jpeg?v=2', url: 'projects/eon-studio.html' },
      'parishram': { name: 'Parishram', img: 'images/695e499a92e98299e150ee22_Woman-with-Mug-1-.avif?v=85', url: 'projects/cinder-ash.html' },
      'vilasa-ambrosia': { name: 'Vilasa Ambrosia', img: 'images/6961242d2c0ccd5e3eed4dfa_Profile-with-Stylish-Cap-1.avif?v=85', url: 'projects/studio-verra.html' },
      'tastycrafts': { name: 'Tastycrafts', img: 'images/696ebcc5e2d94872a67dd519_Stylish-Red-Sunglasses.avif?v=85', url: 'projects/atlas-bloom.html' },
      'youra': { name: 'Youra', img: 'images/695e49e91636af5755512ee2_Close-up-of-Handbag-and-Hand-1-.avif?v=85', url: 'projects/form-theory.html' },
      'ymca': { name: 'YMCA', img: 'images/695e4a0f4c389489ae730c54_Rhinestone-Hair-Art-1-.avif?v=85', url: 'projects/kindred-haus.html' },
      'vardhman': { name: 'Vardhman', img: 'images/695e4a26a5c9556e865cabb6_Portrait-with-Red-Background-1-.avif?v=85', url: 'projects/noir-supply-co.html' },
      'aegis': { name: 'Aegis', img: 'images/695e4a3687ebcd95e93aeff9_Green-Butterfly-Close-Up-1-.avif?v=85', url: 'projects/velvet-orbit.html' }
    };

    let currentMode = 'default';

    function setPillState(badgeHTML, textString, linkHref) {
      if (pillBadge) pillBadge.innerHTML = badgeHTML;
      if (pillText) pillText.textContent = textString;
      if (pillLink) pillLink.setAttribute('href', resolvePath(linkHref));
    }

    function handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportCenter = scrollY + (window.innerHeight * 0.45);

      // Check if inside Case Study Cards
      let activeCard = null;
      caseCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardTop = rect.top + scrollY;
        const cardBottom = cardTop + rect.height;
        if (viewportCenter >= cardTop && viewportCenter <= cardBottom) {
          activeCard = card;
        }
      });

      if (activeCard) {
        const projectId = activeCard.getAttribute('data-project-id');
        const proj = projectMap[projectId];
        if (proj && currentMode !== projectId) {
          currentMode = projectId;
          const badgeHTML = `<img src="${resolvePath(proj.img)}" alt="${proj.name}">`;
          setPillState(badgeHTML, `${proj.name} · View Case Study`, proj.url);
        }
        return;
      }

      // Check Services Section
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + rect.height;
        if (viewportCenter >= top && viewportCenter <= bottom) {
          if (currentMode !== 'services') {
            currentMode = 'services';
            setPillState('<span class="badge-text">SRV</span>', 'Original Brand Services', 'pages/services/brand-strategy/index.html');
          }
          return;
        }
      }

      // Check Review Section
      if (reviewSection) {
        const rect = reviewSection.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + rect.height;
        if (viewportCenter >= top && viewportCenter <= bottom) {
          if (currentMode !== 'reviews') {
            currentMode = 'reviews';
            setPillState('<span class="badge-text" style="color:#f59e0b">★</span>', 'Client Endorsements & Reviews', 'index.html#reviews');
          }
          return;
        }
      }

      // Check Contact / Footer Section
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        const top = rect.top + scrollY;
        if (viewportCenter >= top) {
          if (currentMode !== 'contact') {
            currentMode = 'contact';
            setPillState('<span class="badge-text">✎</span>', 'Start A Project · Let’s Talk', 'pages/contact/index.html');
          }
          return;
        }
      }

      // Default State (Hero / Top of page)
      if (currentMode !== 'default') {
        currentMode = 'default';
        setPillState('<span class="badge-text">BAS</span>', 'Explore Selected Work', 'pages/case-studies/index.html');
      }
    }

    // High-performance RAF throttle to eliminate forced layout reflows on mobile
    let isNavScrollTicking = false;
    function handleScrollThrottled() {
      if (!isNavScrollTicking) {
        requestAnimationFrame(() => {
          handleScroll();
          isNavScrollTicking = false;
        });
        isNavScrollTicking = true;
      }
    }

    window.addEventListener('scroll', handleScrollThrottled, { passive: true });
    // Trigger on load
    handleScroll();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMubienNav);
  } else {
    initMubienNav();
  }
})();

