/**
 * Buttercup Advertising Studio - Interactive Scripts
 * Handles Lenis smooth scrolling and the scroll / load GSAP animations,
 * mirroring the timelines of the original site 1-to-1 (hero, about, services,
 * selected work, archive, news, marquee) + cursor follower, tabs, video lightbox.
 */

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================================
  // 1. LENIS SMOOTH SCROLL (Desktop only — Mobile uses native 120Hz touch scroll)
  // =========================================================================
  let lenis = null;
  const isMobileOrTouch = (window.innerWidth <= 991) ||
    ('ontouchstart' in window && window.innerWidth <= 1024) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);

  if (typeof Lenis !== "undefined" && !isMobileOrTouch) {
    try {
      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 0.7,
        gestureOrientation: "vertical",
        normalizeWheel: false,
        smoothTouch: false,
      });
      window.lenis = lenis;

      // If GSAP is present, it will drive Lenis via gsap.ticker below; otherwise fallback to RAF
      if (typeof gsap === "undefined") {
        function raf(time) {
          if (lenis) lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      // Data attributes for Lenis control (pure vanilla JS, no jQuery)
      document.querySelectorAll("[data-lenis-start]").forEach(el => {
        el.addEventListener("click", () => lenis && lenis.start());
      });
      document.querySelectorAll("[data-lenis-stop]").forEach(el => {
        el.addEventListener("click", () => lenis && lenis.stop());
      });
      document.querySelectorAll("[data-lenis-toggle]").forEach(el => {
        el.addEventListener("click", () => {
          el.classList.toggle("stop-scroll");
          if (el.classList.contains("stop-scroll")) {
            lenis && lenis.stop();
          } else {
            lenis && lenis.start();
          }
        });
      });
    } catch (e) {
      console.warn("Lenis initialization error:", e);
    }
  } else {
    // Graceful mobile stub for window.lenis so modal open/close calls never fail
    window.lenis = {
      start: () => { },
      stop: () => { },
      scrollTo: (target, opt) => {
        const top = typeof target === 'number' ? target : 0;
        window.scrollTo({ top: top, behavior: opt && opt.immediate ? 'auto' : 'smooth' });
      }
    };
  }

  // =========================================================================
  // 2. GSAP & SCROLLTRIGGER INITIALIZATION
  // =========================================================================
  if (typeof gsap !== "undefined") {
    try {
      const pluginsToRegister = [];
      if (typeof ScrollTrigger !== "undefined") pluginsToRegister.push(ScrollTrigger);
      if (typeof SplitText !== "undefined") pluginsToRegister.push(SplitText);

      if (pluginsToRegister.length > 0) {
        gsap.registerPlugin(...pluginsToRegister);
      }

      // Sync Lenis with GSAP ScrollTrigger if desktop Lenis is active
      if (lenis && typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(500, 33);
      } else if (typeof ScrollTrigger !== "undefined") {
        gsap.ticker.lagSmoothing(500, 33);
      }
    } catch (e) {
      console.warn("GSAP plugin registration error:", e);
    }

    const hasST = typeof ScrollTrigger !== "undefined";
    const hasSplit = typeof SplitText !== "undefined";
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const setupAnimations = () => {

      // -----------------------------------------------------------------
      // A. PAGE LOAD: instantaneous display (no 2-second blank void / loader delay)
      // -----------------------------------------------------------------
      const heroHeading = $(".hero-content .heading-x_large");
      const heroLogo = $(".hero-video-wrp .icon-embed-custom");
      const heroVideo = $(".hero-video");
      const navbar = $(".navbar");

      if (navbar) gsap.set(navbar, { opacity: 1, yPercent: 0 });
      if (heroHeading) gsap.set(heroHeading, { opacity: 1, y: 0 });
      if (heroLogo) gsap.set(heroLogo, { opacity: 1 });
      if (heroVideo) gsap.set(heroVideo, { opacity: 1, scale: 1, yPercent: 0 });

      if (!hasST) return;

      // -----------------------------------------------------------------
      // B. HERO: video follows the scroll and grows into the next section
      // -----------------------------------------------------------------
      const heroSection = $(".section.is-hero");
      if (heroSection && heroVideo) {
        const mm = gsap.matchMedia();
        // Desktop (>= 992px): original video travel into next section
        mm.add("(min-width: 992px)", () => {
          gsap.timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: "clamp(25% 35%)",
              end: "clamp(60% top)",
              scrub: 0.8
            }
          }).fromTo(heroVideo,
            { width: "55%", y: "0vh" },
            { width: "110%", y: "110vh", ease: "none", duration: 0.5 }, 0);
        });

        // Tablet (768px - 991px): video moves down into the white space above 'Delivered More'
        mm.add("(min-width: 768px) and (max-width: 991px)", () => {
          gsap.timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 0.8
            }
          }).fromTo(heroVideo,
            { width: "65%", y: "0vh" },
            { width: "88%", y: "40vh", ease: "none", duration: 0.5 }, 0);
        });

        // Mobile (<= 767px): video travels smoothly from BAS down into the white blank space right above 'Delivered More'
        mm.add("(max-width: 767px)", () => {
          gsap.timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 0.8
            }
          }).fromTo(heroVideo,
            { width: "68%", y: "0vh" },
            { width: "90%", y: "34vh", ease: "none", duration: 0.5 }, 0);
        });
      }

      // -----------------------------------------------------------------
      // C. ABOUT: first statement fades out, second one reveals word by word
      //    Triggers cleanly as soon as the first line finishes and photos 3 & 4 arrive
      // -----------------------------------------------------------------
      const aboutSection = $(".section.is-about-section");
      const aboutH1 = $(".heading-x_large.is-about");
      const aboutH2 = $(".heading-x_large.is-about-2nd");
      if (aboutSection && aboutH1 && aboutH2) {
        gsap.set(aboutH2, {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          opacity: 1
        });
        let words = [aboutH2];
        if (hasSplit) {
          const splitAbout2 = new SplitText(aboutH2, {
            type: "words",
            wordsClass: "gsap_split_word"
          });
          words = splitAbout2.words;
        }

        // Set initial hidden state of 2nd heading words
        gsap.set(words, { opacity: 0, y: "25%" });

        // Smooth triggered timeline that plays/reverses without slow scrub delay
        const aboutTl = gsap.timeline({
          scrollTrigger: {
            trigger: aboutSection,
            start: "clamp(top -80%)",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
          }
        });

        aboutTl
          .to(aboutH1, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0)
          .to(words, {
            opacity: 1,
            y: "0%",
            duration: 0.35,
            stagger: { each: 0.05 },
            ease: "power2.out"
          }, 0.12);
      }

      // -----------------------------------------------------------------
      // D. SERVICES: heading line reveal (cards are pure CSS sticky stack)
      // -----------------------------------------------------------------
      const serviceHeading = $(".service-header-sticky .heading-x_large");
      if (serviceHeading) {
        let serviceTargets = [serviceHeading];
        let splitService = null;
        if (hasSplit) {
          splitService = new SplitText(serviceHeading, { type: "words", wordsClass: "gsap_split_word" });
          serviceTargets = splitService.words;
        }
        gsap.fromTo(serviceTargets,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.05,
            scrollTrigger: { trigger: serviceHeading, start: "top 85%", toggleActions: "play none none none" },
            onComplete: () => { if (splitService) splitService.revert(); }
          });
      }

      // -----------------------------------------------------------------
      // E. SELECTED WORK: sticky list, every image opens (left -> right) then
      //    collapses to the right while the next one opens.
      // -----------------------------------------------------------------
      const worksWrapper = $(".works-wrapper");
      const workImgs = $$(".work-img", worksWrapper || document);
      if (worksWrapper && workImgs.length) {
        const worksTl = gsap.timeline({
          scrollTrigger: {
            trigger: worksWrapper,
            start: "clamp(top 120%)",
            end: "clamp(bottom 5%)",
            scrub: 0.8
          }
        });
        worksTl.fromTo(workImgs,
          { width: "0%" },
          { width: "100%", ease: "none", duration: 0.5, stagger: { each: 0.6 } }, 0);
        worksTl.fromTo(workImgs,
          { width: "100%", x: "0vw" },
          { width: "0%", x: "100vw", ease: "none", duration: 0.5, stagger: { each: 0.6 }, immediateRender: false }, 0.61);
        worksTl.to(worksWrapper, { y: "-3rem", ease: "none", duration: 0.25 }, 1.75);
        worksTl.to(worksWrapper, { y: "-5.3rem", ease: "none", duration: 0.25 }, 2.4);
        worksTl.to(worksWrapper, { y: "-7.7rem", ease: "none", duration: 0.25 }, 3.05);
        worksTl.to(worksWrapper, { y: "-10rem", ease: "none", duration: 0.25 }, 3.7);
      }

      // -----------------------------------------------------------------
      // F. ARCHIVE: images grow from 0 to full size, labels slide in
      // -----------------------------------------------------------------
      const archiveSection = $(".section.overflow-hidden");
      if (archiveSection) {
        const archiveTl = gsap.timeline({
          scrollTrigger: {
            trigger: archiveSection,
            start: "clamp(top 50%)",
            end: "clamp(bottom 60%)",
            scrub: 0.8
          }
        });
        archiveTl.fromTo($$(".archive-img", archiveSection),
          { width: "0%", height: "0%" },
          { width: "100%", height: "100%", ease: "none", duration: 0.5, stagger: { amount: 2 } }, 0);
        archiveTl.fromTo($$(".archive-elem-content", archiveSection),
          { opacity: 0, x: "20%" },
          { opacity: 1, x: "0%", ease: "none", duration: 0.5, stagger: { amount: 2.5 } }, 0);
      }

      // -----------------------------------------------------------------
      // G. LATEST NEWS: header + cards rise in
      // -----------------------------------------------------------------
      const blogHeader = $(".blog-header");
      const blogSection = blogHeader && blogHeader.closest(".section");
      if (blogSection) {
        const blogTl = gsap.timeline({
          scrollTrigger: {
            trigger: blogSection,
            start: "clamp(top 50%)",
            end: "clamp(bottom bottom)",
            scrub: 1
          }
        });
        blogTl.fromTo(blogHeader,
          { opacity: 0, y: "100%" },
          { opacity: 1, y: "0%", ease: "power1.out", duration: 0.5 }, 0);
        blogTl.fromTo($$(".cards", blogSection),
          { opacity: 0, y: "50%" },
          { opacity: 1, y: "0%", ease: "power1.out", duration: 0.5, stagger: { amount: 0.5, from: "start" } }, 0.06);
      }

      // -----------------------------------------------------------------
      // H. MARQUEE: endless horizontal loop
      // -----------------------------------------------------------------
      const marqueeTracks = $$(".marquee-track");
      if (marqueeTracks.length) {
        gsap.to(marqueeTracks, { x: "-100%", duration: 36, repeat: -1, ease: "none" });
      }

      // -----------------------------------------------------------------
      // I. 3D STACKING SCROLL CARDS (71Three style)
      // -----------------------------------------------------------------
      const cardWrap = $(".tl-scroll-card-animation");
      const scrollCards = $$(".tl-single-scroll-card");
      const cardHeadline = $(".tl-scroll-card-animation .tl-section-headline-one");
      const totalScrollCards = scrollCards.length;

      if (cardWrap && totalScrollCards > 0 && hasST) {
        ScrollTrigger.matchMedia({
          // Desktop screens: 3D stacking scroll animation with pin
          "(min-width: 769px)": function () {
            scrollCards.forEach((card, index) => {
              gsap.set(card, {
                transformPerspective: 1000,
                x: 0,
                y: 1000,
                z: 750,
                rotateX: 90,
                scale: 1,
                zIndex: index + 1
              });
            });

            const cardDuration = 1.5;
            const cardStagger = 2;
            const enterPhaseEndTime = (totalScrollCards - 1) * cardStagger + cardDuration;
            const holdDuration = 0.5;
            const totalTimelineDuration = enterPhaseEndTime + holdDuration;
            const scrollDistanceVh = Math.round((totalScrollCards - 1) * 44 + 40);

            const masterTL = gsap.timeline({
              scrollTrigger: {
                trigger: cardWrap,
                start: "top top",
                end: `+=${scrollDistanceVh}%`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
              }
            });

            if (cardHeadline) {
              masterTL.to(cardHeadline, {
                scale: 0.75,
                duration: enterPhaseEndTime,
                ease: "none"
              }, 0);
            }

            scrollCards.forEach((card, index) => {
              const cardStartTime = index * cardStagger;

              masterTL.to(card, {
                x: 0,
                y: 0,
                z: 0,
                rotateX: 0,
                scale: 1,
                duration: cardDuration,
                ease: "power2.out"
              }, cardStartTime);

              if (index > 0) {
                for (let i = 0; i < index; i++) {
                  masterTL.to(scrollCards[i], {
                    y: -35 * (index - i),
                    duration: cardDuration,
                    ease: "power2.out"
                  }, cardStartTime);
                }
              }
            });

            masterTL.to({}, { duration: holdDuration }, enterPhaseEndTime);
          },

          // Mobile screens: clean, responsive horizontal swipe without scroll-jacking, zero glitch, zero blank space
          "(max-width: 768px)": function () {
            scrollCards.forEach((card) => {
              gsap.set(card, { clearProps: "all" });
            });
            if (cardHeadline) {
              gsap.set(cardHeadline, { clearProps: "all" });
            }
          }
        });
      }
    };

    const start = () => {
      try {
        setupAnimations();
      } catch (e) {
        console.warn("Animation setup error:", e);
      }
      if (typeof ScrollTrigger !== "undefined") {
        // Heights change once images / fonts have loaded
        window.addEventListener("load", () => ScrollTrigger.refresh());
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }
      }
    };

    start();
  }

  // =========================================================================
  // 3. INTERACTIVE MOUSE CURSOR FOLLOWER
  // =========================================================================
  const cursorWrp = document.querySelector(".project-cursor-wrp");
  const cursorFollower = document.querySelector(".view-project-follow-cursor");

  if (cursorWrp && cursorFollower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isTracking = false;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      if (isTracking) {
        currentX += (mouseX - currentX) * 0.18;
        currentY += (mouseY - currentY) * 0.18;
        cursorFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateCursor);
      }
    }

    // Show cursor when hovering over interactive project elements
    const hoverTargets = document.querySelectorAll(".works-wrapper, .project-clw_wrapper, .cards.is-projects, .work-elem");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        isTracking = true;
        cursorWrp.classList.add("is-visible");
        requestAnimationFrame(updateCursor);
      });
      el.addEventListener("mouseleave", () => {
        isTracking = false;
        cursorWrp.classList.remove("is-visible");
      });
    });
  }

  // =========================================================================
  // 4. SELECTED WORK TABS (LIST vs GRID VIEW)
  // =========================================================================
  const allTabMenus = document.querySelectorAll(".tabs, .w-tabs, .grid-list-tabs");
  if (allTabMenus.length > 0) {
    allTabMenus.forEach((tabContainer) => {
      const containerLinks = tabContainer.querySelectorAll("[data-w-tab].w-tab-link, [data-w-tab].grid-list-view, [data-w-tab].project-tabs");
      const containerPanes = tabContainer.querySelectorAll(".w-tab-content .w-tab-pane");

      containerLinks.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const tabName = btn.getAttribute("data-w-tab");

          containerLinks.forEach(b => {
            b.classList.remove("w--current");
            const act = b.querySelector(".active-tab");
            if (act) act.remove();
          });
          btn.classList.add("w--current");

          // For work.html project-tabs active indicator
          if (btn.classList.contains("project-tabs")) {
            const actDiv = document.createElement("div");
            actDiv.className = "active-tab";
            btn.appendChild(actDiv);
          }

          containerPanes.forEach(pane => {
            if (pane.getAttribute("data-w-tab") === tabName) {
              pane.classList.add("w--tab-active");
              pane.style.display = "block";
            } else {
              pane.classList.remove("w--tab-active");
              pane.style.display = "none";
            }
          });

          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }
        });
      });
    });
  }

  // =========================================================================
  // 4B. PROJECT CATEGORY ROUTING FALLBACK
  // =========================================================================
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.includes("work")) {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = (urlParams.get("category") || "").toLowerCase();
    const isInsidePagesWork = currentPath.includes("/pages/work");
    if (cat === "product") {
      window.location.replace(isInsidePagesWork ? "../industries/product-base/index.html" : "pages/industries/product-base/index.html");
    } else if (cat === "service") {
      window.location.replace(isInsidePagesWork ? "../industries/service-base/index.html" : "pages/industries/service-base/index.html");
    }
  }

  // =========================================================================
  // 5. VIDEO LIGHTBOX MODAL
  // =========================================================================
  const playButtons = document.querySelectorAll(".play-button, [data-lightbox-url]");
  if (playButtons.length > 0) {
    let modal = document.querySelector(".custom-lightbox-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "custom-lightbox-modal";
      modal.innerHTML = `
        <div class="custom-lightbox-inner">
          <button class="custom-lightbox-close" aria-label="Close video">&times;</button>
          <iframe src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector(".custom-lightbox-close");
      const iframe = modal.querySelector("iframe");

      const closeModal = () => {
        modal.classList.remove("is-open");
        iframe.src = "";
        if (lenis) lenis.start();
      };

      closeBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
      });
    }

    playButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        let rawUrl = btn.getAttribute("data-lightbox-url") || "https://www.youtube.com/watch?v=REaC0cMpcJs";
        // Convert YouTube watch URL to embed URL
        let videoId = "";
        if (rawUrl.includes("v=")) {
          videoId = rawUrl.split("v=")[1].split("&")[0].split("?")[0];
        } else if (rawUrl.includes("youtu.be/")) {
          videoId = rawUrl.split("youtu.be/")[1].split("?")[0];
        }
        const embedUrl = videoId
          ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
          : rawUrl;

        const iframe = modal.querySelector("iframe");
        iframe.src = embedUrl;
        modal.classList.add("is-open");
        if (lenis) lenis.stop();
      });
    });
  }

  // =========================================================================
  // 6. MOBILE NAVIGATION PLUS (+) BUTTON & FULL-SCREEN CONTROLLER
  // =========================================================================
  function initMobileNav() {
    const menuButtons = document.querySelectorAll(".menu-button");
    const navMenuWrapper = document.querySelector(".nav-menu-wrapper, .w-nav-menu");
    if (!menuButtons.length || !navMenuWrapper) return;

    // Clean up any lingering backdrops
    document.querySelectorAll(".mobile-nav-backdrop").forEach(b => b.remove());

    function toggleMenu(forceClose = false) {
      const currentlyOpen = navMenuWrapper.classList.contains("is-mobile-open") || navMenuWrapper.classList.contains("w--open");
      const shouldOpen = forceClose ? false : !currentlyOpen;

      navMenuWrapper.classList.toggle("is-mobile-open", shouldOpen);
      navMenuWrapper.classList.toggle("w--open", shouldOpen);
      document.body.classList.toggle("mobile-menu-active", shouldOpen);

      // Lock body scroll when mobile menu is open, restore when closed
      if (shouldOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      menuButtons.forEach(btn => {
        btn.classList.toggle("w--open", shouldOpen);
      });
    }

    menuButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });
    });

    // Close when clicking normal page links (excluding dropdown triggers)
    navMenuWrapper.querySelectorAll("a:not(.nav-dropdown-trigger)").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 991) {
          toggleMenu(true);
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleMenu(true);
      }
    });

    // Close on window resize if larger than 991px
    window.addEventListener("resize", () => {
      if (window.innerWidth > 991) {
        toggleMenu(true);
      }
    });
  }

  initMobileNav();

  // =========================================================================
  // 7. INDUSTRY & SERVICES DROPDOWN MEGA POPUPS
  // =========================================================================
  function setupDropdownWrapper(wrapper) {
    window.setupDropdownWrapper = setupDropdownWrapper;
    if (wrapper.__dropdownInitialized) return;
    wrapper.__dropdownInitialized = true;

    let timer = null;
    let subTimer = null;
    const video = wrapper.querySelector(".industry-video");
    const mainPopup = wrapper.querySelector(".industry-dropdown-popup");
    const subpopup = wrapper.querySelector(".industry-subpopup");
    const catCards = wrapper.querySelectorAll(".industry-cat-card");
    const panels = wrapper.querySelectorAll(".subpopup-panel");

    function showSubpanel(catType) {
      if (!subpopup) return;
      clearTimeout(subTimer);

      panels.forEach(p => {
        const matches = p.id === `subpopup-${catType}` || p.getAttribute("data-panel") === catType;
        p.style.display = matches ? "block" : "none";
      });

      if (mainPopup) {
        mainPopup.classList.remove("show-product-subpopup", "show-service-subpopup");
        if (catType === "product") mainPopup.classList.add("show-product-subpopup");
        if (catType === "service") mainPopup.classList.add("show-service-subpopup");
      }

      subpopup.classList.add("is-visible");
      subpopup.setAttribute("data-active-cat", catType);
    }

    function hideSubpopup() {
      if (!subpopup) return;
      subTimer = setTimeout(() => {
        subpopup.classList.remove("is-visible");
        subpopup.removeAttribute("data-active-cat");
        if (mainPopup) mainPopup.classList.remove("show-product-subpopup", "show-service-subpopup");
        catCards.forEach(c => c.classList.remove("is-active"));
      }, 240);
    }

    catCards.forEach(card => {
      const catType = card.getAttribute("data-category") ||
        (card.innerText.includes("Product") ? "product" :
          card.innerText.includes("Strategy") ? "brand-strategy" :
            card.innerText.includes("Visual") ? "visual-identity" :
              card.innerText.includes("Marketing") ? "marketing-comm" : "service");

      const handleEnter = () => {
        clearTimeout(subTimer);
        catCards.forEach(c => c.classList.remove("is-active"));
        card.classList.add("is-active");
        showSubpanel(catType);
      };

      card.addEventListener("mouseenter", handleEnter);
      card.addEventListener("mouseover", handleEnter);

      card.addEventListener("mouseleave", (e) => {
        const toElem = e.relatedTarget;
        if (subpopup && subpopup.contains(toElem)) return;
        hideSubpopup();
      });

      // Explicit click handler ensures navigation always occurs immediately
      card.addEventListener("click", (e) => {
        const href = card.getAttribute("href");
        if (href && href !== "#") {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = href;
        }
      });
    });

    if (subpopup) {
      // Also ensure subpopup links and CTA reliably navigate
      subpopup.querySelectorAll(".subpopup-link, .subpopup-cta").forEach(link => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href");
          if (href && href !== "#") {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = href;
          }
        });
      });

      const keepVisible = () => {
        clearTimeout(subTimer);
        subpopup.classList.add("is-visible");
        const activeCat = subpopup.getAttribute("data-active-cat");
        if (activeCat) {
          catCards.forEach(c => {
            const cat = c.getAttribute("data-category");
            c.classList.toggle("is-active", cat === activeCat);
          });
        }
      };

      subpopup.addEventListener("mouseenter", keepVisible);
      subpopup.addEventListener("mouseover", keepVisible);
      subpopup.addEventListener("mouseleave", (e) => {
        const toElem = e.relatedTarget;
        let isMovingToCard = false;
        catCards.forEach(c => {
          if (c.contains(toElem)) isMovingToCard = true;
        });
        if (!isMovingToCard) {
          hideSubpopup();
        }
      });
    }

    wrapper.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      wrapper.classList.add("is-open");
      if (video && video.paused) {
        video.play().catch(() => { });
      }
    });

    wrapper.addEventListener("mouseleave", () => {
      timer = setTimeout(() => {
        wrapper.classList.remove("is-open");
        if (subpopup) {
          subpopup.classList.remove("is-visible");
          subpopup.removeAttribute("data-active-cat");
        }
        if (mainPopup) mainPopup.classList.remove("show-product-subpopup", "show-service-subpopup");
        catCards.forEach(c => c.classList.remove("is-active"));
      }, 200);
    });

    const trigger = wrapper.querySelector(".nav-dropdown-trigger");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasOpen = wrapper.classList.contains("is-open");
        document.querySelectorAll(".nav-dropdown-wrapper").forEach(other => {
          if (other !== wrapper) {
            other.classList.remove("is-open", "is-mobile-open");
          }
        });
        wrapper.classList.toggle("is-open", !wasOpen);
        if (window.innerWidth <= 991) {
          wrapper.classList.toggle("is-mobile-open", !wasOpen);
        }
        if (video && video.paused) {
          video.play().catch(() => { });
        }
      });
    }
  }

  const dropdownWrappers = document.querySelectorAll(".nav-dropdown-wrapper");
  dropdownWrappers.forEach(setupDropdownWrapper);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown-wrapper")) {
      document.querySelectorAll(".nav-dropdown-wrapper").forEach(w => w.classList.remove("is-open", "is-mobile-open"));
    }
  });

  // =========================================================================
  // NAVBAR SQUIGGLY UNDERLINE: Hidden by default, animated on hover
  // =========================================================================
  const allNavbarLinks = document.querySelectorAll(".navbar .nav-links, .nav-dropdown-wrapper");
  allNavbarLinks.forEach((linkItem) => {
    const underline = linkItem.querySelector(".underline-overflow");
    if (!underline) return;

    // Explicitly hide initially
    underline.style.setProperty("width", "0%", "important");
    underline.style.setProperty("max-width", "0%", "important");
    underline.style.setProperty("opacity", "0", "important");
    underline.style.setProperty("visibility", "hidden", "important");
    underline.style.setProperty("pointer-events", "none", "important");
    underline.style.setProperty(
      "transition",
      "width 0.35s cubic-bezier(0.25, 1, 0.5, 1), max-width 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease, visibility 0.25s ease",
      "important"
    );

    const showUnderline = () => {
      underline.style.setProperty("visibility", "visible", "important");
      underline.style.setProperty("width", "100%", "important");
      underline.style.setProperty("max-width", "100%", "important");
      underline.style.setProperty("opacity", "1", "important");
    };

    const hideUnderline = () => {
      underline.style.setProperty("width", "0%", "important");
      underline.style.setProperty("max-width", "0%", "important");
      underline.style.setProperty("opacity", "0", "important");
      setTimeout(() => {
        if (!linkItem.matches(":hover")) {
          underline.style.setProperty("visibility", "hidden", "important");
        }
      }, 350);
    };

    linkItem.addEventListener("mouseenter", showUnderline);
    linkItem.addEventListener("mouseleave", hideUnderline);
  });

  // =========================================================================
  // GLOBAL CUSTOM ROUND CURSOR ("GOL GOL CURSOR")
  // =========================================================================
  function initGlobalCustomCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    let cursorDot = document.querySelector(".custom-cursor-dot");
    let cursorRing = document.querySelector(".custom-cursor-ring");

    if (!cursorDot) {
      cursorDot = document.createElement("div");
      cursorDot.className = "custom-cursor-dot";
      document.body.appendChild(cursorDot);
    }
    if (!cursorRing) {
      cursorRing = document.createElement("div");
      cursorRing.className = "custom-cursor-ring";
      document.body.appendChild(cursorRing);
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;
    let rafId = null;

    function wakeCursor() {
      if (!rafId && isVisible) {
        rafId = requestAnimationFrame(renderCursor);
      }
    }

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.classList.add("is-active");
        cursorRing.classList.add("is-active");
      }
      wakeCursor();
    }, { passive: true });

    window.addEventListener("mousedown", () => {
      cursorRing.classList.add("is-clicking");
      wakeCursor();
    }, { passive: true });

    window.addEventListener("mouseup", () => {
      cursorRing.classList.remove("is-clicking");
      wakeCursor();
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      isVisible = false;
      cursorDot.classList.remove("is-active");
      cursorRing.classList.remove("is-active");
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, { passive: true });

    document.addEventListener("mouseenter", () => {
      isVisible = true;
      cursorDot.classList.add("is-active");
      cursorRing.classList.add("is-active");
      wakeCursor();
    }, { passive: true });

    // Single unified 120fps hardware-accelerated RAF render loop with smart idle sleep
    function renderCursor() {
      if (!isVisible) {
        rafId = null;
        return;
      }

      // Dot follows 1:1 instantaneously with zero lag
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      // Ring follows with responsive luxury spring lerp (0.35 = buttery smooth, no dragging)
      ringX += (mouseX - ringX) * 0.35;
      ringY += (mouseY - ringY) * 0.35;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      // If ring is settled on mouse position, rest until next mousemove
      const dx = Math.abs(mouseX - ringX);
      const dy = Math.abs(mouseY - ringY);
      if (dx < 0.25 && dy < 0.25) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(renderCursor);
    }

    // High-performance cached hover detection
    const interactiveSel = "a, button, input, textarea, select, [role='button'], .nav-links, .cards, .submit-btn, .menu-button, .custom-lightbox-close, .cs-close-btn, .cs-btn, .btr-ai-orb-button, .em-ai-chip, .mubien-pill-badge, .mubien-pill-text-link, .mubien-menu-btn, .mubien-card, .mubien-reel-card, .mubien-drawer-brand-btn, .mubien-drawer-close-btn, .mubien-contact-slider, .mubien-contact-knob";
    let lastTarget = null;

    document.addEventListener("mouseover", (e) => {
      if (e.target === lastTarget) return;
      lastTarget = e.target;
      const targetIsInteractive = !!(e.target && e.target.closest && e.target.closest(interactiveSel));
      if (targetIsInteractive !== isHovering) {
        isHovering = targetIsInteractive;
        cursorRing.classList.toggle("is-hovering", isHovering);
        cursorDot.classList.toggle("is-hovering", isHovering);
      }
      const isOverDockOrPopup = !!(e.target && e.target.closest && e.target.closest('.apple-dock, .industry-dropdown-popup, .industry-subpopup, .services-popup'));
      if (isOverDockOrPopup) {
        cursorDot.style.display = 'none';
        cursorRing.style.display = 'none';
      } else {
        cursorDot.style.display = '';
        cursorRing.style.display = '';
      }
    }, { passive: true });
  }

  initGlobalCustomCursor();

  // =========================================================================
  // 1. AUTOMATIC SILENT VISITOR TELEMETRY & CITY DETECTION
  // Captures IP, City, Region, Device, Referrer, Page into /data/visitors-log.csv
  // =========================================================================
  async function initVisitorTracking() {
    if (window.__btrTrackingInitialized) return;
    window.__btrTrackingInitialized = true;

    let detectedCity = 'Detecting...';
    let detectedCountry = 'India';

    try {
      // Fast IP Geolocation lookup
      const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data && data.cityName) {
          detectedCity = data.cityName + (data.regionName ? ', ' + data.regionName : '');
          detectedCountry = data.countryName || 'India';
          window.__btrDetectedCity = detectedCity;
          window.__btrDetectedCountry = detectedCountry;
        }
      }
    } catch (e) {
      try {
        const fbRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData && fbData.city) {
            detectedCity = fbData.city + (fbData.region ? ', ' + fbData.region : '');
            detectedCountry = fbData.country_name || 'India';
            window.__btrDetectedCity = detectedCity;
            window.__btrDetectedCountry = detectedCountry;
          }
        }
      } catch (err) {}
    }

    function detectBrowserName() {
      const ua = navigator.userAgent || '';
      if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Edg')) return 'Edge';
      return 'Browser';
    }

    function detectOSName() {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      if (/Android/.test(ua)) return 'Android';
      if (/Macintosh|Mac OS X/.test(ua)) return 'macOS';
      if (/Windows/.test(ua)) return 'Windows';
      if (/Linux/.test(ua)) return 'Linux';
      return 'Unknown OS';
    }

    try {
      const apiUrl = (window.location.origin && !window.location.origin.startsWith('file://'))
        ? window.location.origin + '/api/track-visitor.php'
        : 'api/track-visitor.php';

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'visit',
          city: detectedCity,
          country: detectedCountry,
          page: window.location.pathname + window.location.search,
          referrer: document.referrer || 'Direct / Bookmark',
          screen: window.innerWidth + 'x' + window.innerHeight,
          browser: detectBrowserName(),
          os: detectOSName(),
          language: navigator.language || 'en',
          timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''
        }),
        keepalive: true
      }).catch(() => {});
    } catch (err) {}
  }

  // =========================================================================
  // 2. BROWSER LOCATION PERMISSION PROMPT ("Personalize for your city")
  // =========================================================================
  function initLocationPermissionPrompt() {
    if (localStorage.getItem('btr_loc_dismissed') === '1') return;
    if (document.getElementById('btrLocPrompt')) return;

    const locCard = document.createElement('div');
    locCard.id = 'btrLocPrompt';
    locCard.className = 'btr-loc-prompt';
    locCard.innerHTML = `
      <div class="btr-loc-prompt-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="btr-loc-prompt-content">
        <span class="btr-loc-prompt-title">Personalize for your city?</span>
        <span class="btr-loc-prompt-subtitle">Enable location to view studio projects & availability near you.</span>
      </div>
      <div class="btr-loc-prompt-actions">
        <button class="btr-loc-btn-allow" id="btrLocAllowBtn">Allow</button>
        <button class="btr-loc-btn-close" id="btrLocCloseBtn" aria-label="Dismiss">&times;</button>
      </div>
    `;
    document.body.appendChild(locCard);

    // Show after 4.5 seconds
    setTimeout(() => {
      locCard.classList.add('is-active');
    }, 4500);

    const allowBtn = document.getElementById('btrLocAllowBtn');
    const closeBtn = document.getElementById('btrLocCloseBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        locCard.classList.remove('is-active');
        localStorage.setItem('btr_loc_dismissed', '1');
        setTimeout(() => locCard.remove(), 400);
      });
    }

    if (allowBtn) {
      allowBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          locCard.classList.remove('is-active');
          return;
        }

        allowBtn.textContent = 'Detecting...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const locStr = `GPS [${lat.toFixed(4)}, ${lon.toFixed(4)}] • ${window.__btrDetectedCity || 'India'}`;
            window.__btrDetectedCity = locStr;

            const apiUrl = (window.location.origin && !window.location.origin.startsWith('file://'))
              ? window.location.origin + '/api/track-visitor.php'
              : 'api/track-visitor.php';

            fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'visit',
                city: locStr,
                country: window.__btrDetectedCountry || 'India',
                page: window.location.pathname,
                referrer: 'Browser Geolocation Granted',
                screen: window.innerWidth + 'x' + window.innerHeight
              }),
              keepalive: true
            }).catch(() => {});

            allowBtn.textContent = '✓ Saved';
            localStorage.setItem('btr_loc_dismissed', '1');
            setTimeout(() => {
              locCard.classList.remove('is-active');
              setTimeout(() => locCard.remove(), 400);
            }, 1800);
          },
          (err) => {
            locCard.classList.remove('is-active');
            localStorage.setItem('btr_loc_dismissed', '1');
            setTimeout(() => locCard.remove(), 400);
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }
  }

  // =========================================================================
  // 3. DYNAMIC 12-SECOND CENTER SQUARE WHATSAPP & LEAD CAPTURE MODAL
  // Screen ke beech-o-beech bada square luxury popup with instant contact capture
  // =========================================================================
  function initCenterSquareWhatsAppModal() {
    // Remove any legacy elements
    const oldStatic = document.getElementById('btrFloatingWa');
    if (oldStatic) oldStatic.remove();
    const oldToast = document.getElementById('btrWaToast');
    if (oldToast) oldToast.remove();

    if (document.getElementById('btrWaModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'btrWaModalOverlay';
    overlay.className = 'btr-wa-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="btr-wa-square-modal" role="dialog" aria-modal="true" aria-label="Chat on WhatsApp with Buttercup Studio">
        <button class="btr-wa-square-close" id="btrWaSquareClose" aria-label="Close dialog" title="Close">&times;</button>

        <div class="btr-wa-square-icon-wrap">
          <span class="btr-wa-square-pulse" aria-hidden="true"></span>
          <div class="btr-wa-square-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.18-.544-1.897-.788-3.123-2.73-3.218-2.855-.095-.125-.774-1.03-.774-1.963 0-.933.489-1.39.664-1.58.175-.19.382-.238.51-.238.127 0 .254.002.366.007.118.005.277-.045.433.329.162.389.553 1.348.602 1.446.049.098.082.213.017.342-.066.129-.098.21-.195.326-.098.116-.205.259-.293.348-.098.098-.201.206-.086.403.115.197.51 0.841 1.092 1.36 0.75 0.668 1.382.875 1.579.973.197.098.312.082.427-.049.115-.131.492-.574.623-.771.131-.197.262-.164.443-.098.18.066 1.148.541 1.345.64.197.098.328.147.377.23.049.082.049.475-.095.88z"/>
            </svg>
          </div>
        </div>

        <div class="btr-wa-square-tag">
          <span class="btr-wa-live-dot" aria-hidden="true"></span>
          <span>Buttercup Creative Studio</span>
        </div>

        <h3 class="btr-wa-square-title">Chat on WhatsApp</h3>

        <p class="btr-wa-square-desc">
          Have a brand, design or campaign project? Enter your details to connect directly:
        </p>

        <form class="btr-wa-form" id="btrWaForm" onsubmit="return false;">
          <div class="btr-wa-inputs">
            <input type="text" id="btrLeadName" class="btr-wa-input" placeholder="Your Name (e.g. Rahul)" autocomplete="name">
            <input type="tel" id="btrLeadPhone" class="btr-wa-input" placeholder="WhatsApp / Phone Number" autocomplete="tel">
          </div>

          <button type="button" class="btr-wa-square-btn" id="btrWaSquareCta">
            <span id="btrWaBtnText">Connect on WhatsApp</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <a href="https://wa.me/919925034404?text=Hi%20Buttercup%20Studio%2C%20I%20saw%20your%20work%20on%20buttercup.in%20and%20I%20want%20to%20discuss%20a%20project!"
           target="_blank" rel="noopener noreferrer" class="btr-wa-skip-link" id="btrWaSkipLink">
          Or skip and open WhatsApp directly &rarr;
        </a>

        <div class="btr-wa-square-footer">
          <span>⚡ Fast Reply &bull; Typically within 2 mins</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let isHovered = false;
    let isInputFocused = false;
    let autoHideTimer = null;

    const nameInput = document.getElementById('btrLeadName');
    const phoneInput = document.getElementById('btrLeadPhone');
    const btnCta = document.getElementById('btrWaSquareCta');
    const btnText = document.getElementById('btrWaBtnText');
    const skipLink = document.getElementById('btrWaSkipLink');

    if (nameInput) {
      nameInput.addEventListener('focus', () => { isInputFocused = true; if (autoHideTimer) clearTimeout(autoHideTimer); });
      nameInput.addEventListener('blur', () => { isInputFocused = false; });
    }
    if (phoneInput) {
      phoneInput.addEventListener('focus', () => { isInputFocused = true; if (autoHideTimer) clearTimeout(autoHideTimer); });
      phoneInput.addEventListener('blur', () => { isInputFocused = false; });
    }

    function isFooterInView() {
      const footers = document.querySelectorAll('footer.rwl-footer, footer.section.is-footer, footer#contact, #contact.is-footer, footer:not(.om-fuss)');
      const footer = footers.length > 0 ? footers[footers.length - 1] : document.querySelector('footer');
      if (!footer) return false;
      const rect = footer.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < vh - 20;
    }

    function showModal() {
      if (isFooterInView()) return;
      overlay.classList.add('is-active');
      overlay.setAttribute('aria-hidden', 'false');

      if (autoHideTimer) clearTimeout(autoHideTimer);
      // Auto-hide after 9 seconds if user doesn't hover or interact
      autoHideTimer = setTimeout(() => {
        if (!isHovered && !isInputFocused) {
          hideModal();
        }
      }, 9000);
    }

    function hideModal() {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
    }

    // Lead Capture & Instant WhatsApp Redirect
    if (btnCta) {
      btnCta.addEventListener('click', () => {
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const phoneVal = phoneInput ? phoneInput.value.trim() : '';

        if (nameVal || phoneVal) {
          if (btnText) btnText.textContent = 'Connecting...';

          const apiUrl = (window.location.origin && !window.location.origin.startsWith('file://'))
            ? window.location.origin + '/api/track-visitor.php'
            : 'api/track-visitor.php';

          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'lead',
              name: nameVal,
              phone: phoneVal,
              city: window.__btrDetectedCity || 'India',
              page: window.location.pathname,
              notes: 'Captured via 12s WhatsApp Center Modal'
            }),
            keepalive: true
          }).catch(() => {});
        }

        let waMsg = 'Hi Buttercup Studio, I saw your work on buttercup.in and I want to discuss a project!';
        if (nameVal) {
          waMsg = `Hi Buttercup Studio! My name is ${nameVal}${phoneVal ? ' (' + phoneVal + ')' : ''}. I saw your work on buttercup.in and I want to discuss a project!`;
        }

        const waUrl = `https://wa.me/919925034404?text=${encodeURIComponent(waMsg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        hideModal();
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (btnText) btnText.textContent = 'Connect on WhatsApp';
      });
    }

    if (skipLink) {
      skipLink.addEventListener('click', () => {
        hideModal();
      });
    }

    // Keep visible while hovering over the square card
    const modalBox = overlay.querySelector('.btr-wa-square-modal');
    if (modalBox) {
      modalBox.addEventListener('mouseenter', () => {
        isHovered = true;
        if (autoHideTimer) clearTimeout(autoHideTimer);
      });
      modalBox.addEventListener('mouseleave', () => {
        isHovered = false;
        if (overlay.classList.contains('is-active') && !isInputFocused) {
          autoHideTimer = setTimeout(() => {
            hideModal();
          }, 4000);
        }
      });
    }

    // Close on backdrop click (outside modal)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideModal();
      }
    });

    // Close on 'x' button
    const closeBtn = document.getElementById('btrWaSquareClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideModal();
      });
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
        hideModal();
      }
    });

    // Hide if scrolling into footer
    function checkFooter() {
      if (isFooterInView() && overlay.classList.contains('is-active')) {
        hideModal();
      }
    }
    window.addEventListener('scroll', checkFooter, { passive: true });

    // Every 12 seconds: pop up in the center of the screen
    setInterval(() => {
      if (!overlay.classList.contains('is-active') && !isFooterInView()) {
        showModal();
      }
    }, 12000);

    // Initial popup after 12 seconds
    setTimeout(() => {
      if (!isFooterInView()) {
        showModal();
      }
    }, 12000);
  }

  // =========================================================================
  // 4. HOME PAGE LOGIN MODAL (Password: branding@gmail.com -> admin/leads.html)
  // =========================================================================
  function initHomeLoginModal() {
    const loginLink = document.getElementById('homeLoginBtn');
    if (!loginLink) return;

    let modalOverlay = document.getElementById('btrHomeLoginOverlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'btrHomeLoginOverlay';
      modalOverlay.className = 'btr-login-modal-overlay';
      modalOverlay.setAttribute('aria-hidden', 'true');
      modalOverlay.innerHTML = `
        <div class="btr-login-modal" role="dialog" aria-modal="true" aria-label="Studio Master Portal Login">
          <button class="btr-login-close" id="btrHomeLoginClose" aria-label="Close dialog">&times;</button>
          
          <div class="btr-login-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <div class="btr-login-badge">
            <span class="btr-login-dot"></span>
            <span>BUTTERCUP STUDIO MASTER ACCESS</span>
          </div>

          <h3 class="btr-login-title">Portal Login</h3>
          <p class="btr-login-desc">Enter the studio master password to access live visitor analytics and inbound leads:</p>

          <form class="btr-login-form" id="btrHomeLoginForm" onsubmit="return false;">
            <div class="btr-login-input-wrap">
              <input type="password" id="btrHomeLoginPassword" class="btr-login-input" placeholder="Enter Master Password" autocomplete="current-password">
              <button type="button" class="btr-login-toggle-pw" id="btrHomeLoginTogglePw" aria-label="Toggle password visibility">👁️</button>
            </div>
            <div class="btr-login-error" id="btrHomeLoginError">⚠️ Incorrect password. Access denied.</div>
            <button type="submit" class="btr-login-btn" id="btrHomeLoginSubmitBtn">
              <span id="btrHomeLoginBtnText">Unlock Dashboard &rarr;</span>
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    const pwInput = document.getElementById('btrHomeLoginPassword');
    const togglePw = document.getElementById('btrHomeLoginTogglePw');
    const errorMsg = document.getElementById('btrHomeLoginError');
    const form = document.getElementById('btrHomeLoginForm');
    const closeBtn = document.getElementById('btrHomeLoginClose');
    const btnText = document.getElementById('btrHomeLoginBtnText');

    function openModal() {
      const stored = sessionStorage.getItem('btr_admin_auth') || localStorage.getItem('btr_admin_auth');
      if (stored === 'branding@gmail.com') {
        window.location.href = 'admin/leads.html';
        return;
      }
      modalOverlay.classList.add('is-active');
      modalOverlay.setAttribute('aria-hidden', 'false');
      if (errorMsg) errorMsg.style.display = 'none';
      if (pwInput) {
        pwInput.value = '';
        setTimeout(() => pwInput.focus(), 150);
      }
    }

    function closeModal() {
      modalOverlay.classList.remove('is-active');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }

    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-active')) {
        closeModal();
      }
    });

    if (togglePw && pwInput) {
      togglePw.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = (pwInput ? pwInput.value : '').trim();
        if (entered === 'branding@gmail.com') {
          sessionStorage.setItem('btr_admin_auth', 'branding@gmail.com');
          localStorage.setItem('btr_admin_auth', 'branding@gmail.com');
          if (errorMsg) errorMsg.style.display = 'none';
          if (btnText) btnText.textContent = '✓ Access Granted! Opening...';
          setTimeout(() => {
            window.location.href = 'admin/leads.html';
          }, 350);
        } else {
          if (errorMsg) errorMsg.style.display = 'block';
          if (pwInput) {
            pwInput.value = '';
            pwInput.focus();
          }
          const box = modalOverlay.querySelector('.btr-login-modal');
          if (box) {
            box.style.animation = 'none';
            box.offsetHeight;
            box.style.animation = 'btr-login-shake 0.4s ease';
          }
        }
      });
    }
  }

  // Initialize Visitor Tracking, Location Permission, WhatsApp Modal, and Home Login
  initVisitorTracking();
  initLocationPermissionPrompt();
  initCenterSquareWhatsAppModal();
  initHomeLoginModal();

  // =========================================================================
  // 13. CONTACT FORM SUBMISSION (Web3Forms -> info@buttercup.in)
  // =========================================================================
  function setupContactForm() {
    const form = document.getElementById("email-form");
    if (!form) return;

    const successCard = document.getElementById("contact-form-success");
    const errorCard = document.getElementById("contact-form-error");
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    const nextInput = document.getElementById("_next_url");

    // Dynamic _next redirect URL for native submit fallback (works on any domain/link)
    if (nextInput) {
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        nextInput.value = cleanUrl + "?submitted=true";
      } catch (e) { }
    }

    // Check if user returned from native redirect (?submitted=true)
    if (window.location.search.includes("submitted=true")) {
      form.style.setProperty("display", "none", "important");
      form.classList.add("is-submitted");
      form.classList.add("is-hidden");
      if (successCard) {
        successCard.style.display = "block";
      }
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) { }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const originalBtnValue = submitBtn ? (submitBtn.value || submitBtn.textContent) : "Send Message";
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === "INPUT") {
          submitBtn.value = "Sending...";
        } else {
          submitBtn.textContent = "Sending...";
        }
      }

      if (errorCard) errorCard.style.display = "none";

      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach((value, key) => {
        if (key === "_honey") return;
        dataObj[key] = value;
      });

      // Ensure reply-to is set to customer email for easy one-click replies
      if (dataObj["Email"] || dataObj["email"]) {
        dataObj["_replyto"] = dataObj["Email"] || dataObj["email"];
      }
      dataObj["_subject"] = dataObj["_subject"] || "New Project Inquiry - Buttercup Advertising Studio";
      dataObj["_template"] = dataObj["_template"] || "table";
      dataObj["_captcha"] = "false";

      // 15-second timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Add Web3Forms access key & recipient info
      // Primary & Secondary Dual-Submission (Parallel) -> info@buttercup.in
      const PRIMARY_KEY = "ba5be8bf-4ec9-4044-83fa-e29e82e12a4d";
      const SECONDARY_KEY = "a34185cd-5cda-4094-8c3d-93484874796e"; // info@buttercup.in
      dataObj["access_key"] = PRIMARY_KEY;
      // Note: ccemail is Web3Forms Pro only — using dual-submission instead
      dataObj["subject"] = dataObj["_subject"] || "New Project Inquiry - Buttercup Advertising Studio";
      dataObj["from_name"] = "Buttercup Advertising Studio Website";

      try {
        const fetchPromises = [
          fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(dataObj),
            signal: controller.signal
          })
        ];

        // If secondary key for info@buttercup.in is configured, dispatch parallel copy
        if (SECONDARY_KEY && SECONDARY_KEY.trim() !== "") {
          const secondaryData = Object.assign({}, dataObj, { access_key: SECONDARY_KEY.trim() });
          fetchPromises.push(
            fetch("https://api.web3forms.com/submit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(secondaryData),
              signal: controller.signal
            })
          );
        }

        // Mirror lead to local server leads database (leads.csv & leads.json)
        try {
          const localTrackUrl = (window.location.origin && !window.location.origin.startsWith('file://'))
            ? window.location.origin + '/api/track-visitor.php'
            : 'api/track-visitor.php';
          fetch(localTrackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'lead',
              name: dataObj['Name'] || dataObj['name'] || '',
              phone: dataObj['Phone'] || dataObj['phone'] || dataObj['contact'] || '',
              email: dataObj['Email'] || dataObj['email'] || '',
              notes: dataObj['Message'] || dataObj['message'] || 'Website Contact Form Submission',
              city: window.__btrDetectedCity || 'Website Contact Form',
              page: window.location.pathname
            }),
            keepalive: true
          }).catch(() => {});
        } catch (e) {}

        const responses = await Promise.allSettled(fetchPromises);
        clearTimeout(timeoutId);

        const primaryRes = responses[0];
        if (primaryRes.status === "fulfilled" && primaryRes.value.ok) {
          const result = await primaryRes.value.json().catch(() => ({}));
          if (result.success === true) {
            form.style.setProperty("display", "none", "important");
            form.classList.add("is-submitted");
            form.classList.add("is-hidden");
            if (submitBtn) {
              submitBtn.disabled = true;
              if (submitBtn.tagName === "INPUT") {
                submitBtn.value = "Message Sent ✓";
              } else {
                submitBtn.textContent = "Message Sent ✓";
              }
            }
            if (successCard) {
              successCard.style.display = "block";
              successCard.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          } else {
            throw new Error(result.message || "Failed to submit form");
          }
        } else {
          throw new Error("Failed to submit form");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Form submission error:", err.message);

        // Always restore button state on any error
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === "INPUT") {
            submitBtn.value = originalBtnValue;
          } else {
            submitBtn.textContent = originalBtnValue;
          }
        }

        // If aborted (timeout), show friendly error
        if (err.name === "AbortError") {
          if (errorCard) {
            errorCard.style.display = "block";
            errorCard.querySelector("p") && (errorCard.querySelector("p").innerHTML = "Request timed out. Please check your internet connection and try again, or email us at <a href=\"mailto:info@buttercup.in\">info@buttercup.in</a>");
            errorCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // Try native form submit as last-resort fallback
        try {
          form.submit();
        } catch (submitErr) {
          if (errorCard) {
            errorCard.style.display = "block";
            errorCard.querySelector("p") && (errorCard.querySelector("p").innerHTML = "Something went wrong while sending your message. Please try again or reach out directly at <a href=\"mailto:info@buttercup.in\">info@buttercup.in</a>.");
            errorCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    });
  }

  setupContactForm();

  // =========================================================================
  // 10. LIVE NUMBER COUNTERS (Viewport & Scroll-Triggered Animation)
  // =========================================================================
  function initLiveCounters() {
    const counterElements = document.querySelectorAll(
      ".pillar-metric-val, .stats-number, [data-counter]"
    );
    if (!counterElements.length) return;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function parseMetric(el) {
      const explicitTarget = el.getAttribute("data-target") || el.getAttribute("data-count");
      const explicitSuffix = el.getAttribute("data-suffix");
      const explicitPrefix = el.getAttribute("data-prefix");
      const explicitDecimals = el.getAttribute("data-decimals");
      const explicitPad = el.getAttribute("data-pad");

      const text = el.textContent.trim();
      // Match optional prefix, number (integer or decimal), optional suffix
      const match = text.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);

      let prefix = explicitPrefix !== null ? explicitPrefix : (match ? match[1] : "");
      let rawNum = explicitTarget !== null ? explicitTarget : (match ? match[2] : "");
      let suffix = explicitSuffix !== null ? explicitSuffix : (match ? match[3] : "");

      if (!rawNum) return null;

      const isFloat = rawNum.includes(".");
      const decimals = explicitDecimals !== null
        ? parseInt(explicitDecimals, 10)
        : (isFloat ? rawNum.split(".")[1].length : 0);
      const target = parseFloat(rawNum);
      const isZeroPadded = explicitPad !== null
        ? parseInt(explicitPad, 10)
        : (!isFloat && rawNum.length > 1 && rawNum.startsWith("0") ? rawNum.length : 0);

      return {
        prefix,
        target,
        suffix,
        decimals,
        pad: isZeroPadded,
        originalText: text
      };
    }

    function formatNumber(val, config) {
      let numStr;
      if (config.decimals > 0) {
        numStr = val.toFixed(config.decimals);
      } else {
        numStr = Math.floor(val).toString();
        if (config.pad > 0) {
          while (numStr.length < config.pad) {
            numStr = "0" + numStr;
          }
        }
      }
      return config.prefix + numStr + config.suffix;
    }

    function animateCounter(el, delay = 0) {
      if (el.dataset.counterStarted === "true") return;
      el.dataset.counterStarted = "true";

      const config = parseMetric(el);
      if (!config || isNaN(config.target)) return;

      // Start display at 0
      el.textContent = formatNumber(0, config);
      el.classList.add("is-counting");

      setTimeout(() => {
        const duration = 1800; // 1.8 seconds smooth count
        let startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentVal = easeOutQuart(progress) * config.target;

          el.textContent = formatNumber(currentVal, config);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = formatNumber(config.target, config);
            el.classList.remove("is-counting");
            el.classList.add("counter-done");
          }
        }

        requestAnimationFrame(step);
      }, delay);
    }

    // Use IntersectionObserver to start counting as soon as scrolled into view
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const targets = container.querySelectorAll(".pillar-metric-val, .stats-number, [data-counter]");
          if (targets.length) {
            targets.forEach((el, index) => {
              animateCounter(el, index * 100);
            });
          } else {
            animateCounter(container, 0);
          }
          obs.unobserve(container);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    // Observe parent containers if they exist (for synchronized strip animations), else individual items
    const strips = document.querySelectorAll(".pillar-metrics-strip, #stats-grid");
    if (strips.length) {
      strips.forEach(strip => observer.observe(strip));
    }

    counterElements.forEach(el => {
      if (!el.closest(".pillar-metrics-strip") && !el.closest("#stats-grid")) {
        observer.observe(el);
      }
    });

    // Also trigger immediately if already visible in viewport on initial load
    setTimeout(() => {
      counterElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          animateCounter(el, idx * 80);
        }
      });
    }, 250);
  }

  initLiveCounters();

  // =========================================================================
  // 11. FAQ ACCORDION INTERACTION (Click + to open/close answers)
  // =========================================================================
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-accordion-item");
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const btn = item.querySelector(".faq-question-btn");
      if (!btn) return;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains("is-open");

        // Close other open FAQ items in the same container for clean UX
        const parent = item.closest(".faq-wrapper") || item.parentElement;
        if (parent) {
          parent.querySelectorAll(".faq-accordion-item.is-open").forEach(other => {
            if (other !== item) other.classList.remove("is-open");
          });
        }

        // Toggle current item
        item.classList.toggle("is-open", !isOpen);
      });
    });
  }

  initFaqAccordion();

  // =========================================================================
  // 12. CASE STUDY "COMING SOON" MODAL & CLICK INTERCEPTOR
  // =========================================================================
  function initCaseStudyComingSoon() {
    const pPath = window.location.pathname;
    let contactUrl = "pages/contact/index.html";
    if (pPath.includes("/projects/") || pPath.includes("/blogs/") || pPath.includes("/utilities/")) {
      contactUrl = "../pages/contact/index.html";
    } else if (pPath.includes("/pages/services/") || pPath.includes("/pages/industries/")) {
      contactUrl = "../../contact/index.html";
    } else if (pPath.includes("/pages/")) {
      contactUrl = "../contact/index.html";
    }

    // 1. Update project hover cursor text dynamically
    const projectCursorInner = document.querySelectorAll(".view-project-cursor");
    projectCursorInner.forEach((cur) => {
      cur.innerHTML = "<div>view<br/>case</div>";
    });

    document.addEventListener("mouseover", (e) => {
      const pLink = e.target && e.target.closest && e.target.closest('a[href*="projects/"], a.cards.is-projects, a.cards, a.work-elem, .project-grid a, .project-clw_wrapper a, .tl-single-scroll-card');
      if (pLink) {
        const href = (pLink.getAttribute ? pLink.getAttribute('href') : '') || '';
        const pId = pLink.getAttribute ? pLink.getAttribute('data-project-id') : '';
        const text = (pLink.textContent || '').toLowerCase();
        const isGrabz = href.includes('eon-studio.html') || href.includes('grabz') || pId === 'grabz' || text.includes('grabz');
        const cursors = document.querySelectorAll(".view-project-cursor");
        cursors.forEach((cur) => {
          cur.innerHTML = isGrabz ? "<div>view<br/>case</div>" : "<div>coming<br/>soon</div>";
        });
      }
    }, { passive: true });

    // 2. Inject Modal Dialog into DOM if not present
    let modal = document.getElementById("csComingSoonModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "csComingSoonModal";
      modal.className = "cs-modal-backdrop";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML = `
        <div class="cs-modal-container">
          <div class="cs-modal-card">
            <div class="cs-glow-orb cs-glow-1"></div>
            <div class="cs-glow-orb cs-glow-2"></div>
            <button class="cs-close-btn" id="csModalCloseBtn" aria-label="Close modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="cs-badge">
              <span class="cs-badge-dot"></span>
              <span class="cs-badge-text">Case Study In Progress</span>
            </div>
            <h2 class="cs-title">Coming Soon</h2>
            <div class="cs-project-heading">
              <span class="cs-project-name" id="csProjectName">Brand Showcase</span>
              <span class="cs-project-tag" id="csProjectCategory">Case Study</span>
            </div>
            <p class="cs-desc" id="csProjectDesc">
              We are currently curating the complete strategic breakdown, packaging architecture, visual identity deliverables, and commercial ROI metrics for this brand. The comprehensive case study will be published shortly.
            </p>
            <div class="cs-status-box">
              <div class="cs-status-header">
                <span class="cs-status-label">Editorial &amp; Creative Archival</span>
                <span class="cs-status-pct">Final Polish · 92%</span>
              </div>
              <div class="cs-status-track">
                <div class="cs-status-fill"></div>
              </div>
            </div>
            <div class="cs-actions">
              <button class="cs-btn cs-btn-secondary" id="csModalSecondaryBtn">
                Explore Other Work
              </button>
              <a href="${contactUrl}" class="cs-btn cs-btn-primary" id="csModalPrimaryBtn">
                <span>Discuss Your Project</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const projectNameEl = modal.querySelector("#csProjectName");
    const projectCatEl = modal.querySelector("#csProjectCategory");
    const projectDescEl = modal.querySelector("#csProjectDesc");
    const closeBtn = modal.querySelector("#csModalCloseBtn");
    const secondaryBtn = modal.querySelector("#csModalSecondaryBtn");
    const modalContainer = modal.querySelector(".cs-modal-card");

    function openModal(projectName, category) {
      if (projectNameEl) projectNameEl.textContent = projectName || "Brand Showcase";
      if (projectCatEl) {
        if (category) {
          projectCatEl.textContent = category;
          projectCatEl.style.display = "inline-block";
        } else {
          projectCatEl.style.display = "none";
        }
      }
      if (projectDescEl) {
        projectDescEl.textContent = `We are currently curating the complete strategic breakdown, visual identity deliverables, packaging architecture, and ROI results for ${projectName || "this project"}. Check back soon for the full showcase.`;
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("cs-modal-active");
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cs-modal-active");
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (secondaryBtn) {
      secondaryBtn.addEventListener("click", () => {
        if (window.location.pathname.includes("/projects/")) {
          window.location.href = "../pages/case-studies/index.html";
        } else {
          closeModal();
        }
      });
    }

    // Close on backdrop click outside the card
    modal.addEventListener("click", (e) => {
      if (!modalContainer.contains(e.target)) {
        closeModal();
      }
    });

    // Close on Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // 3. Helper to detect and extract project info from a clicked element
    function getProjectInfo(target) {
      const link = target.closest('a[href*="projects/"], a.cards.is-projects, a.cards, a.work-elem, .project-grid a, .project-clw_wrapper a, [data-case-study], .fw-card, .grid-card-item');
      if (!link) return null;

      let title = "";
      let category = "";

      // Try finding title in standard typography classes
      const titleEl = link.querySelector(
        ".text-3x_base, .text-2x_base, .works-elements .text-x_base.is-snug:first-child, .project-name_wrapper > div:first-child, .project-title, h1, h2, h3, h4"
      );
      if (titleEl && titleEl.textContent.trim()) {
        title = titleEl.textContent.trim();
      } else {
        const img = link.querySelector("img[alt]");
        if (img && img.alt && !img.alt.includes("Project images") && !img.alt.includes("Project Cms Image") && !img.alt.includes("thumbnail")) {
          title = img.alt.trim();
        }
      }

      // Try finding industry/category
      const catEl = link.querySelector(".project-industry_text, .works-elements .text-x_base:nth-child(4), .text-x_base.is-snug:nth-child(4)");
      if (catEl && catEl.textContent.trim()) {
        category = catEl.textContent.trim();
      }

      // Fallback title from href if not found
      if (!title) {
        const href = link.getAttribute("href") || "";
        const match = href.match(/projects\/([^.]+)\.html/);
        if (match) {
          title = match[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        }
      }

      return {
        link,
        title: title || "Case Study",
        category: category || "",
      };
    }

    // Expose openModal and closeModal globally
    window.openComingSoonModal = openModal;
    window.closeComingSoonModal = closeModal;

    // 4. Delegated Click Interceptor across the whole document
    document.addEventListener("click", (e) => {
      // Don't intercept clicks inside editor toolbar, badges or modals
      if (e.target.closest('#buttercupEditorBar, .btr-card-lock-badge, .btr-img-edit-badge, #btrPasswordModal, #btrTextFormatBar, #btrImageModal, #btrCaseStudiesModal')) {
        return;
      }

      const info = getProjectInfo(e.target);
      if (info && info.link) {
        // Grabz is always unlocked
        const href = (info.link.getAttribute ? info.link.getAttribute('href') : '') || '';
        const titleLower = (info.title || '').toLowerCase();
        const isGrabz = titleLower.includes('grabz') || href.includes('eon-studio.html') || href.includes('grabz');
        if (isGrabz) {
          return; // Allow native navigation to Grabz case study
        }

        // Check if project is locked
        const isLocked = window.isCaseStudyLocked ? window.isCaseStudyLocked(info.link, info.title) : false;
        if (isLocked) {
          e.preventDefault();
          e.stopPropagation();
          openModal(info.title, info.category);
        }
      }
    }, true);

    // 5. If user directly visits a /projects/*.html page, inject a top banner (skip for unlocked Grabz)
    const isInsideProjectsFolder = window.location.pathname.includes('/projects/');
    if (isInsideProjectsFolder) {
      const isGrabz = window.location.pathname.includes('eon-studio.html') || window.location.pathname.includes('grabz');
      if (!isGrabz) {
        const existingBanner = document.querySelector(".project-cs-status-banner");
        if (!existingBanner) {
          const banner = document.createElement("div");
          banner.className = "project-cs-status-banner";
          const pageHeading = (document.querySelector("h1")?.textContent || "This Case Study").trim();
          const pageCat = (document.querySelector(".project-header p, .project-detail-row p")?.textContent || "Case Study").trim();
          banner.innerHTML = `
            <span class="cs-banner-badge">Coming Soon</span>
            <span>We are actively curating and mastering the strategic assets for <strong>${pageHeading}</strong>. Full case study will be published soon.</span>
            <a href="../pages/case-studies/index.html">← Explore All Work</a>
          `;
          document.body.prepend(banner);
        }
      }
    }
  }

  initCaseStudyComingSoon();

  // =========================================================================
  // APPLE-STYLE FLOATING RIGHT NAVIGATION DOCK (Auto-injected for resilience)
  // =========================================================================
  function initAppleDock() {
    // Bottom floating pill nav is STRICTLY for the Home Page only
    const loc = (window.location.pathname || '').toLowerCase();
    const isInnerPage = loc.includes('/pages/') || loc.includes('/projects/') || loc.includes('/blogs/') || loc.includes('/case-studies/') || loc.includes('/utilities/');

    if (isInnerPage) {
      // Clean up if somehow present on inner pages
      const existingPill = document.querySelector('.mubien-pill-bar, .mubien-drawer, .mubien-backdrop');
      if (existingPill) {
        document.querySelectorAll('.mubien-pill-bar, .mubien-drawer, .mubien-backdrop').forEach(el => el.remove());
      }
      return;
    }

    // Auto-load mubien-nav.js on Home Page if not already present
    if (!document.querySelector('script[src*="mubien-nav.js"]')) {
      const script = document.createElement('script');
      script.src = 'js/mubien-nav.js';
      script.defer = true;
      document.body.appendChild(script);
    }
    return;

    const dockHTML = `
      <a href="#gravityHome" class="apple-dock-item" data-action="scroll-top" aria-label="Home">
        <img class="apple-dock-icon" src="images/dock/home.png" alt="Home" />
        <span class="apple-dock-label">Home</span>
      </a>
      <a href="pages/case-studies/index.html" class="apple-dock-item" aria-label="Case Studies">
        <img class="apple-dock-icon" src="images/dock/cases.png" alt="Case Studies" />
        <span class="apple-dock-label">Case Studies</span>
      </a>
      <a href="pages/blogs/index.html" class="apple-dock-item" aria-label="Blogs">
        <img class="apple-dock-icon" src="images/dock/blogs.png" alt="Blogs" />
        <span class="apple-dock-label">Blogs</span>
      </a>
      <a href="pages/about/index.html" class="apple-dock-item" aria-label="About">
        <img class="apple-dock-icon" src="images/dock/about.png" alt="About" />
        <span class="apple-dock-label">About</span>
      </a>

      <div class="apple-dock-wrapper nav-dropdown-wrapper">
        <a href="#services" class="apple-dock-item nav-dropdown-trigger" data-action="scroll-services" aria-label="Services">
          <img class="apple-dock-icon" src="images/dock/services.png" alt="Services" />
          <span class="apple-dock-label">Services</span>
        </a>
        <div class="industry-dropdown-popup services-popup dock-popup">
          <div class="industry-popup-inner">
            <div class="industry-popup-left">
              <div>
                <div class="industry-popup-header">
                  <span class="industry-popup-tag">EXPLORE SERVICES</span>
                </div>
                <a href="pages/services/brand-strategy/index.html" class="industry-cat-card" data-category="brand-strategy">
                  <div class="industry-cat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                    </svg>
                  </div>
                  <div class="industry-cat-content">
                    <div class="industry-cat-title">
                      <span>Brand Strategy</span>
                      <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <div class="industry-cat-desc">Architecture, Positioning, Voice, Naming, Story, Slogan &amp; Rebranding</div>
                  </div>
                </a>
                <div class="industry-popup-divider"></div>
                <a href="pages/services/visual-identity/index.html" class="industry-cat-card" data-category="visual-identity">
                  <div class="industry-cat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <div class="industry-cat-content">
                    <div class="industry-cat-title">
                      <span>Visual Identity Design</span>
                      <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <div class="industry-cat-desc">Logo, Guidelines, Packaging, Brochures, Publications, Decks &amp; Events</div>
                  </div>
                </a>
                <div class="industry-popup-divider"></div>
                <a href="pages/services/marketing-communication/index.html" class="industry-cat-card" data-category="marketing-comm">
                  <div class="industry-cat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  </div>
                  <div class="industry-cat-content">
                    <div class="industry-cat-title">
                      <span>Marketing Communication &amp; Campaigns</span>
                      <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <div class="industry-cat-desc">Content Strategy, Copy &amp; Design, Print &amp; Outdoor, Digital Ads &amp; Shoots</div>
                  </div>
                </a>
              </div>
              <div class="industry-popup-stats">
                <div class="industry-stat-pill"><strong>3</strong> Core Pillars</div>
                <div class="industry-stat-pill"><strong>20+</strong> Capabilities</div>
              </div>
            </div>
            <div class="industry-popup-right">
              <div class="industry-video-card">
                <video class="industry-video" src="rings.mp4" autoplay loop muted playsinline preload="auto"></video>
                <div class="industry-video-overlay">
                  <div class="video-live-badge"><span class="live-dot"></span> STUDIO REEL</div>
                  <div class="video-caption-text">Human Intelligence Driven Brand Creation</div>
                </div>
              </div>
            </div>
          </div>
          <div class="industry-subpopup services-subpopup" id="services-subpopup">
            <div class="subpopup-panel" id="subpopup-brand-strategy" data-panel="brand-strategy">
              <div class="subpopup-header">
                <div class="subpopup-badge">01 BRAND STRATEGY</div>
                <div class="subpopup-title">Core Capabilities</div>
              </div>
              <div class="subpopup-divider"></div>
              <ul class="subpopup-list">
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#brand-architecture" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Architecture</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#positioning" class="subpopup-link"><span class="subpopup-dot"></span><span>Positioning</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#personality-voice" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Personality &amp; Voice</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#naming" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Naming</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#brand-story" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Story</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#slogan-taglines" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Slogan &amp; Taglines</span></a></li>
                <li class="subpopup-item"><a href="pages/services/brand-strategy/index.html#repositioning-rebranding" class="subpopup-link"><span class="subpopup-dot"></span><span>Repositioning &amp; Rebranding</span></a></li>
              </ul>
              <div class="subpopup-footer">
                <span>7 Strategic Capabilities</span>
                <a href="pages/services/brand-strategy/index.html" class="subpopup-cta">Explore Page →</a>
              </div>
            </div>
            <div class="subpopup-panel" id="subpopup-visual-identity" data-panel="visual-identity">
              <div class="subpopup-header">
                <div class="subpopup-badge">02 VISUAL IDENTITY</div>
                <div class="subpopup-title">Design Deliverables</div>
              </div>
              <div class="subpopup-divider"></div>
              <ul class="subpopup-list">
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#logo-design" class="subpopup-link"><span class="subpopup-dot"></span><span>Logo Design</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#brand-guidelines" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Guidelines</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#packaging-design" class="subpopup-link"><span class="subpopup-dot"></span><span>Packaging Design</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#brochures-catalogues" class="subpopup-link"><span class="subpopup-dot"></span><span>Brochure &amp; Catalogue Design</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#corporate-magazines" class="subpopup-link"><span class="subpopup-dot"></span><span>Corporate Magazine &amp; Publication</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#pitch-decks" class="subpopup-link"><span class="subpopup-dot"></span><span>Presentations &amp; Pitch Decks</span></a></li>
                <li class="subpopup-item"><a href="pages/services/visual-identity/index.html#exhibition-events" class="subpopup-link"><span class="subpopup-dot"></span><span>Trade Exhibition &amp; Event Design</span></a></li>
              </ul>
              <div class="subpopup-footer">
                <span>7 Design Deliverables</span>
                <a href="pages/services/visual-identity/index.html" class="subpopup-cta">Explore Page →</a>
              </div>
            </div>
            <div class="subpopup-panel" id="subpopup-marketing-comm" data-panel="marketing-comm">
              <div class="subpopup-header">
                <div class="subpopup-badge">03 MARKETING CAMPAIGNS</div>
                <div class="subpopup-title">Communication &amp; Media</div>
              </div>
              <div class="subpopup-divider"></div>
              <ul class="subpopup-list">
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#content-strategy" class="subpopup-link"><span class="subpopup-dot"></span><span>Content Strategy</span></a></li>
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#copy-design" class="subpopup-link"><span class="subpopup-dot"></span><span>Concept, Copy &amp; Design</span></a></li>
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#print-outdoor" class="subpopup-link"><span class="subpopup-dot"></span><span>Print, Outdoor &amp; BTL Creatives</span></a></li>
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#digital-social" class="subpopup-link"><span class="subpopup-dot"></span><span>Digital &amp; Social Media Creatives</span></a></li>
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#paid-campaigns" class="subpopup-link"><span class="subpopup-dot"></span><span>Paid Campaigns</span></a></li>
                <li class="subpopup-item"><a href="pages/services/marketing-communication/index.html#brand-shoots" class="subpopup-link"><span class="subpopup-dot"></span><span>Brand Photography &amp; Shoots</span></a></li>
              </ul>
              <div class="subpopup-footer">
                <span>6 Campaign Services</span>
                <a href="pages/services/marketing-communication/index.html" class="subpopup-cta">Explore Page →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="apple-dock-wrapper nav-dropdown-wrapper">
        <a href="pages/industries/product-base/index.html" class="apple-dock-item nav-dropdown-trigger" aria-label="Industries">
          <img class="apple-dock-icon" src="images/dock/industries.png" alt="Industries" />
          <span class="apple-dock-label">Industries</span>
        </a>
        <div class="industry-dropdown-popup dock-popup">
          <div class="industry-popup-inner">
            <div class="industry-popup-left">
              <div>
                <div class="industry-popup-header">
                  <span class="industry-popup-tag">EXPLORE INDUSTRIES</span>
                </div>
                <a href="pages/industries/product-base/index.html" class="industry-cat-card" data-category="product">
                  <div class="industry-cat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <div class="industry-cat-content">
                    <div class="industry-cat-title">
                      <span>Product Base</span>
                      <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <div class="industry-cat-desc">Food &amp; Beverages, Apparels, Cosmetics, Pharmaceuticals, FMCG &amp; 50+ categories</div>
                  </div>
                </a>
                <div class="industry-popup-divider"></div>
                <a href="pages/industries/service-base/index.html" class="industry-cat-card" data-category="service">
                  <div class="industry-cat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <div class="industry-cat-content">
                    <div class="industry-cat-title">
                      <span>Service Base</span>
                      <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <div class="industry-cat-desc">IT, Real Estate, Hospitality, Finance, Consulting, Infrastructure &amp; 30+ sectors</div>
                  </div>
                </a>
              </div>
              <div class="industry-popup-stats">
                <div class="industry-stat-pill"><strong>50+</strong> Product Categories</div>
                <div class="industry-stat-pill"><strong>30+</strong> Service Sectors</div>
              </div>
            </div>
            <div class="industry-popup-right">
              <div class="industry-video-card">
                <video class="industry-video" src="rings.mp4" autoplay loop muted playsinline preload="auto"></video>
                <div class="industry-video-overlay">
                  <div class="video-live-badge"><span class="live-dot"></span> SHOWCASE REEL</div>
                  <div class="video-caption-text">Original Brand Identities Across Industries</div>
                </div>
              </div>
            </div>
          </div>
          <div class="industry-subpopup" id="industry-subpopup">
            <div class="subpopup-panel" id="subpopup-product" data-panel="product">
              <div class="subpopup-header">
                <div class="subpopup-badge">PRODUCT BASE</div>
                <div class="subpopup-title">Industries &amp; Categories</div>
              </div>
              <div class="subpopup-divider"></div>
              <ul class="subpopup-list">
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Food and Beverages</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Apparels</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Cosmetics</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Lifestyle &amp; Wellness Products</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Textiles</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Jewellery</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Industrial Lubricants</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Pharmaceuticals</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Medical Devices</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/product-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Electrical Appliances</span></a></li>
              </ul>
              <div class="subpopup-footer">
                <span>50+ Products Categories</span>
                <a href="pages/industries/product-base/index.html" class="subpopup-cta">Explore →</a>
              </div>
            </div>
            <div class="subpopup-panel" id="subpopup-service" data-panel="service">
              <div class="subpopup-header">
                <div class="subpopup-badge">SERVICE BASE</div>
                <div class="subpopup-title">Industries &amp; Sectors</div>
              </div>
              <div class="subpopup-divider"></div>
              <ul class="subpopup-list">
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Management Consulting</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Information Technology (IT)</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Industrial Manufacturing &amp; Automation</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Finance and Insurance</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Real Estate &amp; Infrastructure</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Hospitality &amp; Restaurants</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Healthcare &amp; Hospitals</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Education &amp; Social Organizations</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Tourism, Wellness &amp; Beauty</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Retail &amp; Lifestyle Clubs</span></a></li>
                <li class="subpopup-item"><a href="pages/industries/service-base/index.html" class="subpopup-link"><span class="subpopup-dot"></span><span>Green Energy &amp; Agriculture</span></a></li>
              </ul>
              <div class="subpopup-footer">
                <span>30+ Services Sectors</span>
                <a href="pages/industries/service-base/index.html" class="subpopup-cta">Explore →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#ai-assistant" class="apple-dock-item is-ai" data-action="open-ai" aria-label="AI Assistant">
        <img class="apple-dock-icon" src="images/dock/ai.png" alt="AI Assistant" />
        <span class="apple-dock-label">AI Assistant</span>
      </a>

      <div class="apple-dock-divider" aria-hidden="true"></div>
      <a href="pages/contact/index.html" class="apple-dock-item is-call" aria-label="GET A QUOTE">
        <img class="apple-dock-icon" src="images/dock/call.png" alt="GET A QUOTE" />
        <span class="apple-dock-label">GET A QUOTE</span>
      </a>
    `;

    let dock = document.querySelector('.apple-dock');
    if (!dock) {
      dock = document.createElement('nav');
      dock.className = 'apple-dock';
      dock.setAttribute('aria-label', 'Quick Navigation');
      dock.innerHTML = dockHTML;
      document.body.appendChild(dock);
    } else if (!dock.querySelector('.dock-popup')) {
      dock.innerHTML = dockHTML;
    }

    dock.querySelectorAll('.nav-dropdown-wrapper').forEach(setupDropdownWrapper);

    dock.querySelectorAll('.apple-dock-item[data-action]').forEach(item => {
      item.addEventListener('click', e => {
        const action = item.getAttribute('data-action');
        if (action === 'scroll-top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'scroll-services') {
          const s = document.getElementById('services');
          if (s) {
            e.preventDefault();
            s.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (action === 'open-ai') {
          e.preventDefault();
          if (typeof window.openButtercupAi === 'function') {
            window.openButtercupAi();
          }
        }
      });
    });
  }

  initAppleDock();

  // =========================================================================
  // BUTTERCUP PAGE LOADER BOOTSTRAP (Blogs, About Us, Services, Industry)
  // =========================================================================
  if (!window.__btrLoaderInitialized) {
    const scripts = document.querySelectorAll('script[src*="main.js"]');
    const mainSrc = scripts.length > 0 ? scripts[scripts.length - 1].getAttribute('src') : 'js/main.js';
    const loaderSrc = mainSrc.replace(/main\.js(\?.*)?$/, 'loader.js');
    const s = document.createElement('script');
    s.src = loaderSrc;
    s.async = false;
    document.body.appendChild(s);
  }

  // =========================================================================
  // INTERACTIVE WEBGL FLUID CURSOR ANIMATION (Tequila.ae style)
  // =========================================================================
  if (!window.__btrFluidInitialized) {
    window.__btrFluidInitialized = true;
    const scripts = document.querySelectorAll('script[src*="main.js"]');
    const mainSrc = scripts.length > 0 ? scripts[scripts.length - 1].getAttribute('src') : 'js/main.js';
    const fluidSrc = mainSrc.replace(/main\.js(\?.*)?$/, 'fluidbg.js?v=1');
    const s = document.createElement('script');
    s.src = fluidSrc;
    s.defer = true;
    document.body.appendChild(s);
  }

});
