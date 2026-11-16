/**
 * BUTTERCUP STUDIO - VISUAL CMS & LIVE PAGE EDITOR
 * Complete inline editing for Texts, Fonts, Images, and Case Study Locks
 * Password: branding@gmail.com
 */

(function () {
  "use strict";

  const PASSWORD_SECRET = "branding@gmail.com";
  const STORAGE_KEY = "buttercup_site_customizations";
  const SESSION_AUTH_KEY = "buttercup_editor_active";

  // Data state
  let customizations = {
    texts: {},         // { selector/id: { html, style: { fontSize, fontWeight, fontStyle, fontFamily, color, textTransform } } }
    images: {},        // { selector/id: newSrc }
    lockedProjects: {} // { projectId: true/false }
  };

  let isEditorMode = false;
  let activeEditableEl = null;

  // Load customizations from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      customizations = Object.assign(customizations, JSON.parse(saved));
    }
  } catch (e) {
    console.warn("[Editor] Could not load saved customizations:", e);
  }

  // =========================================================================
  // 1. BOOTSTRAP: APPLY SAVED CUSTOMIZATIONS ON PAGE LOAD (FOR ALL VISITORS)
  // =========================================================================
  function applySavedCustomizations() {
    // 1. Apply Texts & Font Styles
    if (customizations.texts) {
      Object.entries(customizations.texts).forEach(([key, val]) => {
        try {
          const el = document.querySelector(key);
          if (el) {
            if (val.html !== undefined) el.innerHTML = val.html;
            if (val.style) {
              Object.entries(val.style).forEach(([prop, sVal]) => {
                if (sVal) el.style[prop] = sVal;
              });
            }
          }
        } catch (e) {}
      });
    }

    // 2. Apply Images
    if (customizations.images) {
      Object.entries(customizations.images).forEach(([key, newSrc]) => {
        try {
          const img = document.querySelector(key);
          if (img && (img.tagName === "IMG" || img.tagName === "IMAGE")) {
            img.src = newSrc;
            if (img.srcset) img.removeAttribute("srcset");
          }
        } catch (e) {}
      });
    }

    // 3. Apply Case Study Locks
    applyCaseStudyLocks();
  }

  function applyCaseStudyLocks() {
    const cards = document.querySelectorAll(".tl-single-scroll-card");
    cards.forEach((card, index) => {
      let pId = card.getAttribute("data-project-id");
      if (!pId) {
        // Derive ID from title
        const titleEl = card.querySelector("h3");
        pId = titleEl ? titleEl.textContent.trim().toLowerCase().replace(/\s+/g, "-") : `project-${index + 1}`;
        card.setAttribute("data-project-id", pId);
      }

      const isLocked = !!customizations.lockedProjects[pId];
      card.setAttribute("data-locked", isLocked ? "true" : "false");

      // Update in-card lock badge if editor is active
      const badge = card.querySelector(".btr-card-lock-badge");
      if (badge) {
        if (isLocked) {
          badge.className = "btr-card-lock-badge is-locked";
          badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <span>Locked (Coming Soon)</span>`;
        } else {
          badge.className = "btr-card-lock-badge is-unlocked";
          badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg> <span>Unlocked</span>`;
        }
      }
    });
  }

  // Check if a project is locked
  window.isCaseStudyLocked = function (link, title) {
    if (!link) return false;
    const card = link.closest(".tl-single-scroll-card");
    if (card) {
      const pId = card.getAttribute("data-project-id");
      if (pId && customizations.lockedProjects[pId] !== undefined) {
        return !!customizations.lockedProjects[pId];
      }
      return card.getAttribute("data-locked") === "true";
    }

    // Check by title or link href
    if (title) {
      const cleanTitle = title.trim().toLowerCase().replace(/\s+/g, "-");
      if (customizations.lockedProjects[cleanTitle] !== undefined) {
        return !!customizations.lockedProjects[cleanTitle];
      }
    }
    return false;
  };

  // =========================================================================
  // 2. INJECT DOM UI (MODALS, TOOLBAR, FORMAT BAR, TOAST)
  // =========================================================================
  function injectEditorUI() {
    // A. Password Auth Modal
    if (!document.getElementById("btrPasswordModal")) {
      const authModal = document.createElement("div");
      authModal.id = "btrPasswordModal";
      authModal.className = "btr-modal-backdrop";
      authModal.innerHTML = `
        <div class="btr-auth-card">
          <button class="btr-modal-close-x" id="btrAuthCloseBtn" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="btr-auth-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 class="btr-auth-title">Visual Editor Access</h3>
          <p class="btr-auth-desc">Enter administrator password to edit texts, fonts, images, and case study locks.</p>
          <div class="btr-auth-input-wrap">
            <input type="password" id="btrPasswordInput" class="btr-auth-input" placeholder="Enter password (branding@gmail.com)" autocomplete="current-password" />
            <button type="button" class="btr-auth-toggle-pwd" id="btrTogglePwdBtn" aria-label="Toggle password visibility">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
          <div class="btr-auth-error" id="btrAuthError">Incorrect password. Please try again.</div>
          <div class="btr-auth-actions">
            <button type="button" class="btr-btn btr-btn-secondary" id="btrAuthCancelBtn">Cancel</button>
            <button type="button" class="btr-btn btr-btn-primary" id="btrAuthSubmitBtn">
              <span>Unlock Editor</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(authModal);
    }

    // B. Top Floating Admin Toolbar
    if (!document.getElementById("buttercupEditorBar")) {
      const topBar = document.createElement("div");
      topBar.id = "buttercupEditorBar";
      topBar.innerHTML = `
        <div class="btr-bar-brand">
          <span class="btr-pulse-live"></span>
          <span>Editor Mode</span>
        </div>
        <div class="btr-bar-sep"></div>
        <div class="btr-bar-controls">
          <button type="button" class="btr-bar-btn" id="btrBtnManageLocks" title="Lock or Unlock Case Studies">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Lock Studies</span>
          </button>
          <button type="button" class="btr-bar-btn" id="btrBtnTogglePreview" title="Preview website as visitor">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span id="btrPreviewBtnText">Preview</span>
          </button>
          <button type="button" class="btr-bar-btn btr-bar-btn-save" id="btrBtnSavePublish" title="Save and update website permanently">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save &amp; Update Website</span>
          </button>
          <div class="btr-bar-sep"></div>
          <button type="button" class="btr-bar-btn btr-bar-btn-exit" id="btrBtnExitEditor" title="Exit Editor">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>Exit</span>
          </button>
        </div>
      `;
      document.body.appendChild(topBar);
    }

    // C. Floating Text & Font Formatting Bar
    if (!document.getElementById("btrTextFormatBar")) {
      const fmtBar = document.createElement("div");
      fmtBar.id = "btrTextFormatBar";
      fmtBar.innerHTML = `
        <button type="button" class="btr-fmt-btn" id="btrFmtBold" title="Bold"><b>B</b></button>
        <button type="button" class="btr-fmt-btn" id="btrFmtItalic" title="Italic"><i>I</i></button>
        <button type="button" class="btr-fmt-btn" id="btrFmtUnderline" title="Underline"><u>U</u></button>
        <select class="btr-fmt-select" id="btrFmtFontFamily" title="Font Family">
          <option value="">Default Font</option>
          <option value="'Syne', sans-serif">Syne (Display)</option>
          <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
          <option value="'Cinzel', serif">Cinzel (Luxury Serif)</option>
          <option value="'Playfair Display', serif">Playfair (Editorial)</option>
          <option value="'Courier New', monospace">Monospace</option>
          <option value="-apple-system, sans-serif">Apple System</option>
        </select>
        <select class="btr-fmt-select" id="btrFmtWeight" title="Font Weight">
          <option value="">Weight</option>
          <option value="300">Light (300)</option>
          <option value="400">Regular (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semibold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="800">Extra Bold (800)</option>
        </select>
        <select class="btr-fmt-select" id="btrFmtCase" title="Text Case">
          <option value="">Case</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="capitalize">Capitalize</option>
          <option value="lowercase">lowercase</option>
          <option value="none">Normal</option>
        </select>
        <button type="button" class="btr-fmt-btn" id="btrFmtSizeMinus" title="Smaller font">A-</button>
        <button type="button" class="btr-fmt-btn" id="btrFmtSizePlus" title="Larger font">A+</button>
        <input type="color" class="btr-fmt-color" id="btrFmtColor" value="#ffffff" title="Text Color" />
      `;
      document.body.appendChild(fmtBar);
    }

    // D. Image Replacer Modal
    if (!document.getElementById("btrImageModal")) {
      const imgModal = document.createElement("div");
      imgModal.id = "btrImageModal";
      imgModal.className = "btr-modal-backdrop";
      imgModal.innerHTML = `
        <div class="btr-auth-card" style="max-width: 480px;">
          <button class="btr-modal-close-x" id="btrImgCloseBtn" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h3 class="btr-auth-title">Replace Image</h3>
          <p class="btr-auth-desc">Upload a new photo from your device or paste a web image URL.</p>
          <div style="margin-bottom: 16px; text-align: left;">
            <label style="display:block; font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:6px;">Upload from Computer:</label>
            <input type="file" id="btrImgFileInput" accept="image/*" class="btr-auth-input" style="padding: 8px 12px;" />
          </div>
          <div style="margin-bottom: 16px; text-align: left;">
            <label style="display:block; font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:6px;">Or Paste Image URL:</label>
            <input type="text" id="btrImgUrlInput" class="btr-auth-input" placeholder="https://example.com/image.jpg" />
          </div>
          <div id="btrImgPreviewWrap" style="max-height: 180px; overflow:hidden; border-radius:10px; margin-bottom:18px; border:1px solid rgba(255,255,255,0.15); display:none; background:#000;">
            <img id="btrImgPreview" src="" alt="Preview" style="width:100%; height:180px; object-fit:cover;" />
          </div>
          <div class="btr-auth-actions">
            <button type="button" class="btr-btn btr-btn-secondary" id="btrImgCancelBtn">Cancel</button>
            <button type="button" class="btr-btn btr-btn-primary" id="btrImgApplyBtn">Apply Image</button>
          </div>
        </div>
      `;
      document.body.appendChild(imgModal);
    }

    // E. Case Studies Lock Manager Modal
    if (!document.getElementById("btrCaseStudiesModal")) {
      const csModal = document.createElement("div");
      csModal.id = "btrCaseStudiesModal";
      csModal.className = "btr-modal-backdrop";
      csModal.innerHTML = `
        <div class="btr-auth-card" style="max-width: 520px;">
          <button class="btr-modal-close-x" id="btrCsCloseBtn" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h3 class="btr-auth-title">Case Studies Lock Manager</h3>
          <p class="btr-auth-desc">Toggle lock for each case study. Locked items will display the Coming Soon popup when clicked by visitors.</p>
          <div class="btr-cs-manager-list" id="btrCsList"></div>
          <div class="btr-auth-actions" style="margin-top: 20px;">
            <button type="button" class="btr-btn btr-btn-primary" id="btrCsDoneBtn">Done</button>
          </div>
        </div>
      `;
      document.body.appendChild(csModal);
    }

    // F. Toast Notification
    if (!document.getElementById("btrToast")) {
      const toast = document.createElement("div");
      toast.id = "btrToast";
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span id="btrToastMsg">Changes saved successfully!</span>
      `;
      document.body.appendChild(toast);
    }
  }

  function showToast(msg) {
    const toast = document.getElementById("btrToast");
    const toastMsg = document.getElementById("btrToastMsg");
    if (toast && toastMsg) {
      toastMsg.textContent = msg || "Saved successfully!";
      toast.classList.add("is-visible");
      setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 3500);
    }
  }

  // =========================================================================
  // 3. PASSWORD AUTH LOGIC
  // =========================================================================
  function initPasswordAuth() {
    const pwdBtn = document.getElementById("rwlPasswordBtn");
    const modal = document.getElementById("btrPasswordModal");
    const input = document.getElementById("btrPasswordInput");
    const errorEl = document.getElementById("btrAuthError");
    const submitBtn = document.getElementById("btrAuthSubmitBtn");
    const cancelBtn = document.getElementById("btrAuthCancelBtn");
    const closeBtn = document.getElementById("btrAuthCloseBtn");
    const toggleBtn = document.getElementById("btrTogglePwdBtn");
    const authCard = modal ? modal.querySelector(".btr-auth-card") : null;

    if (!modal) return;

    function openAuthModal() {
      modal.classList.add("is-active");
      if (errorEl) errorEl.classList.remove("is-visible");
      if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 150);
      }
    }

    function closeAuthModal() {
      modal.classList.remove("is-active");
    }

    function verifyPassword() {
      const entered = (input ? input.value : "").trim();
      if (entered === PASSWORD_SECRET) {
        sessionStorage.setItem(SESSION_AUTH_KEY, "true");
        closeAuthModal();
        activateEditorMode();
        showToast("✨ Welcome to Buttercup Studio Editor Mode!");
      } else {
        if (errorEl) errorEl.classList.add("is-visible");
        if (authCard) {
          authCard.classList.remove("shake");
          void authCard.offsetWidth; // trigger reflow
          authCard.classList.add("shake");
        }
        if (input) input.select();
      }
    }

    if (pwdBtn) pwdBtn.addEventListener("click", openAuthModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeAuthModal);
    if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);
    if (submitBtn) submitBtn.addEventListener("click", verifyPassword);

    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") verifyPassword();
        if (e.key === "Escape") closeAuthModal();
      });
    }

    if (toggleBtn && input) {
      toggleBtn.addEventListener("click", () => {
        const isPwd = input.type === "password";
        input.type = isPwd ? "text" : "password";
      });
    }

    // Close on outer backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }

  // =========================================================================
  // 4. ACTIVATE / DEACTIVATE EDITOR MODE
  // =========================================================================
  function activateEditorMode() {
    isEditorMode = true;
    document.body.classList.add("btr-editor-mode");

    const bar = document.getElementById("buttercupEditorBar");
    if (bar) bar.classList.add("is-visible");

    setupEditableText();
    setupEditableImages();
    setupCaseStudyCards();
  }

  function deactivateEditorMode() {
    isEditorMode = false;
    document.body.classList.remove("btr-editor-mode");
    sessionStorage.removeItem(SESSION_AUTH_KEY);

    const bar = document.getElementById("buttercupEditorBar");
    if (bar) bar.classList.remove("is-visible");

    const fmtBar = document.getElementById("btrTextFormatBar");
    if (fmtBar) fmtBar.classList.remove("is-visible");

    // Remove contenteditable
    document.querySelectorAll('[data-btr-editable="true"]').forEach((el) => {
      el.removeAttribute("contenteditable");
    });
  }

  // =========================================================================
  // 5. TEXT EDITING & FONT STYLING ENGINE
  // =========================================================================
  function getUniqueSelector(el) {
    if (el.id) return `#${el.id}`;
    
    // Check specific class combos
    const path = [];
    let current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      } else {
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-of-type(${index})`;
          }
        }
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(" > ");
  }

  function setupEditableText() {
    const candidates = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, .text-3x_base, .text-2x_base, .text-x_base, .text-medium, .heading-x_large, .tl-section-headline-one span, .scroll-card-content h3, .scroll-card-meta, .scroll-card-cta, .rwl-link, .rwl-col-title, .rwl-mono-line, .rwl-quote-btn span, .rwl-marquee-text, .service-content a, .tool-text_wrapper div"
    );

    candidates.forEach((el) => {
      // Don't make editor controls editable
      if (el.closest("#buttercupEditorBar, #btrPasswordModal, #btrTextFormatBar, #btrImageModal, #btrCaseStudiesModal, #btrToast")) {
        return;
      }

      el.setAttribute("data-btr-editable", "true");

      el.addEventListener("click", function (e) {
        if (!isEditorMode) return;
        // If clicking a link, prevent navigation so user can edit the link text
        if (el.tagName === "A" || el.closest("a")) {
          e.preventDefault();
        }

        activeEditableEl = el;
        el.setAttribute("contenteditable", "true");
        el.focus();
        showFormatBar(el);
      });

      el.addEventListener("blur", function () {
        if (!isEditorMode) return;
        saveElementText(el);
      });

      el.addEventListener("input", function () {
        if (!isEditorMode) return;
        saveElementText(el);
      });
    });
  }

  function saveElementText(el) {
    const sel = getUniqueSelector(el);
    if (!customizations.texts[sel]) {
      customizations.texts[sel] = {};
    }
    customizations.texts[sel].html = el.innerHTML;
    customizations.texts[sel].style = {
      fontSize: el.style.fontSize || "",
      fontWeight: el.style.fontWeight || "",
      fontStyle: el.style.fontStyle || "",
      fontFamily: el.style.fontFamily || "",
      color: el.style.color || "",
      textTransform: el.style.textTransform || ""
    };
  }

  function showFormatBar(el) {
    const fmtBar = document.getElementById("btrTextFormatBar");
    if (!fmtBar) return;

    const rect = el.getBoundingClientRect();
    const top = Math.max(10, rect.top - 46);
    const left = Math.min(window.innerWidth - 360, Math.max(10, rect.left));

    fmtBar.style.top = `${top}px`;
    fmtBar.style.left = `${left}px`;
    fmtBar.classList.add("is-visible");

    // Sync current values
    const comp = window.getComputedStyle(el);
    const fontSelect = document.getElementById("btrFmtFontFamily");
    const weightSelect = document.getElementById("btrFmtWeight");
    const caseSelect = document.getElementById("btrFmtCase");
    const colorInput = document.getElementById("btrFmtColor");

    if (fontSelect) fontSelect.value = el.style.fontFamily || "";
    if (weightSelect) weightSelect.value = el.style.fontWeight || "";
    if (caseSelect) caseSelect.value = el.style.textTransform || "";
    if (colorInput && comp.color) {
      colorInput.value = rgbToHex(comp.color) || "#ffffff";
    }
  }

  function rgbToHex(rgb) {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return "#ffffff";
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  function initFormatBarEvents() {
    const fmtBar = document.getElementById("btrTextFormatBar");
    if (!fmtBar) return;

    function applyStyle(prop, val) {
      if (!activeEditableEl) return;
      activeEditableEl.style[prop] = val;
      saveElementText(activeEditableEl);
    }

    document.getElementById("btrFmtBold")?.addEventListener("click", () => {
      if (!activeEditableEl) return;
      const cur = activeEditableEl.style.fontWeight;
      applyStyle("fontWeight", cur === "700" || cur === "bold" ? "normal" : "700");
    });

    document.getElementById("btrFmtItalic")?.addEventListener("click", () => {
      if (!activeEditableEl) return;
      const cur = activeEditableEl.style.fontStyle;
      applyStyle("fontStyle", cur === "italic" ? "normal" : "italic");
    });

    document.getElementById("btrFmtUnderline")?.addEventListener("click", () => {
      if (!activeEditableEl) return;
      const cur = activeEditableEl.style.textDecoration;
      applyStyle("textDecoration", cur.includes("underline") ? "none" : "underline");
    });

    document.getElementById("btrFmtFontFamily")?.addEventListener("change", (e) => {
      applyStyle("fontFamily", e.target.value);
    });

    document.getElementById("btrFmtWeight")?.addEventListener("change", (e) => {
      applyStyle("fontWeight", e.target.value);
    });

    document.getElementById("btrFmtCase")?.addEventListener("change", (e) => {
      applyStyle("textTransform", e.target.value);
    });

    document.getElementById("btrFmtColor")?.addEventListener("input", (e) => {
      applyStyle("color", e.target.value);
    });

    document.getElementById("btrFmtSizePlus")?.addEventListener("click", () => {
      if (!activeEditableEl) return;
      const cur = parseFloat(window.getComputedStyle(activeEditableEl).fontSize) || 16;
      applyStyle("fontSize", `${Math.round(cur + 2)}px`);
    });

    document.getElementById("btrFmtSizeMinus")?.addEventListener("click", () => {
      if (!activeEditableEl) return;
      const cur = parseFloat(window.getComputedStyle(activeEditableEl).fontSize) || 16;
      applyStyle("fontSize", `${Math.max(10, Math.round(cur - 2))}px`);
    });

    // Hide format bar when clicking outside editable element and toolbar
    document.addEventListener("click", (e) => {
      if (!isEditorMode) return;
      if (
        activeEditableEl &&
        !activeEditableEl.contains(e.target) &&
        !fmtBar.contains(e.target) &&
        !e.target.closest("#buttercupEditorBar")
      ) {
        fmtBar.classList.remove("is-visible");
      }
    });
  }

  // =========================================================================
  // 6. IMAGE REPLACEMENT ENGINE
  // =========================================================================
  let targetImgEl = null;

  function setupEditableImages() {
    const images = document.querySelectorAll(
      ".scroll-card-img img, .service-img, .thumbnail, .testimonial-person_image, .rwl-brand-logo-img, img[src]"
    );

    images.forEach((img) => {
      if (img.closest("#buttercupEditorBar, #btrPasswordModal, #btrImageModal, #btrCaseStudiesModal")) {
        return;
      }

      const parent = img.parentElement;
      if (!parent.classList.contains("btr-img-wrap")) {
        parent.classList.add("btr-img-wrap");

        // Attach edit badge
        const badge = document.createElement("button");
        badge.type = "button";
        badge.className = "btr-img-edit-badge";
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Change Image</span>
        `;
        badge.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          openImageModal(img);
        });
        parent.appendChild(badge);
      }
    });
  }

  function openImageModal(img) {
    targetImgEl = img;
    const modal = document.getElementById("btrImageModal");
    const previewWrap = document.getElementById("btrImgPreviewWrap");
    const previewImg = document.getElementById("btrImgPreview");
    const urlInput = document.getElementById("btrImgUrlInput");
    const fileInput = document.getElementById("btrImgFileInput");

    if (!modal) return;
    if (urlInput) urlInput.value = img.src || "";
    if (fileInput) fileInput.value = "";
    if (previewImg) previewImg.src = img.src || "";
    if (previewWrap) previewWrap.style.display = "block";

    modal.classList.add("is-active");
  }

  function initImageModalEvents() {
    const modal = document.getElementById("btrImageModal");
    const closeBtn = document.getElementById("btrImgCloseBtn");
    const cancelBtn = document.getElementById("btrImgCancelBtn");
    const applyBtn = document.getElementById("btrImgApplyBtn");
    const fileInput = document.getElementById("btrImgFileInput");
    const urlInput = document.getElementById("btrImgUrlInput");
    const previewWrap = document.getElementById("btrImgPreviewWrap");
    const previewImg = document.getElementById("btrImgPreview");

    function closeModal() {
      if (modal) modal.classList.remove("is-active");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target.result;
            if (previewImg) previewImg.src = dataUrl;
            if (previewWrap) previewWrap.style.display = "block";
            if (urlInput) urlInput.value = dataUrl;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener("input", (e) => {
        if (previewImg) previewImg.src = e.target.value.trim();
        if (previewWrap) previewWrap.style.display = "block";
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        if (!targetImgEl) return;
        const newSrc = (urlInput ? urlInput.value : "").trim();
        if (newSrc) {
          targetImgEl.src = newSrc;
          if (targetImgEl.srcset) targetImgEl.removeAttribute("srcset");

          const sel = getUniqueSelector(targetImgEl);
          customizations.images[sel] = newSrc;
          showToast("📷 Image updated successfully!");
        }
        closeModal();
      });
    }
  }

  // =========================================================================
  // 7. CASE STUDY LOCK / UNLOCK ENGINE
  // =========================================================================
  function setupCaseStudyCards() {
    const cards = document.querySelectorAll(".tl-single-scroll-card");

    cards.forEach((card, index) => {
      let pId = card.getAttribute("data-project-id");
      if (!pId) {
        const titleEl = card.querySelector("h3");
        pId = titleEl ? titleEl.textContent.trim().toLowerCase().replace(/\s+/g, "-") : `project-${index + 1}`;
        card.setAttribute("data-project-id", pId);
      }

      let badge = card.querySelector(".btr-card-lock-badge");
      if (!badge) {
        badge = document.createElement("button");
        badge.type = "button";
        badge.className = "btr-card-lock-badge";
        badge.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleProjectLock(pId);
        });
        card.appendChild(badge);
      }
    });

    applyCaseStudyLocks();
  }

  function toggleProjectLock(pId) {
    const current = !!customizations.lockedProjects[pId];
    customizations.lockedProjects[pId] = !current;
    applyCaseStudyLocks();

    const title = pId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (!current) {
      showToast(`🔒 "${title}" is now Locked (shows Coming Soon modal)`);
    } else {
      showToast(`🔓 "${title}" is now Unlocked (opens project page)`);
    }
  }

  function openCaseStudiesModal() {
    const modal = document.getElementById("btrCaseStudiesModal");
    const listEl = document.getElementById("btrCsList");
    if (!modal || !listEl) return;

    listEl.innerHTML = "";
    const cards = document.querySelectorAll(".tl-single-scroll-card");

    cards.forEach((card) => {
      const pId = card.getAttribute("data-project-id");
      const title = card.querySelector("h3")?.textContent.trim() || pId;
      const meta = card.querySelector(".scroll-card-meta")?.textContent.trim() || "Case Study";
      const isLocked = !!customizations.lockedProjects[pId];

      const item = document.createElement("div");
      item.className = "btr-cs-item";
      item.innerHTML = `
        <div class="btr-cs-info">
          <h4>${title}</h4>
          <p>${meta}</p>
        </div>
        <label class="btr-switch" title="Toggle Lock">
          <input type="checkbox" data-pid="${pId}" ${isLocked ? "checked" : ""} />
          <span class="btr-slider"></span>
        </label>
      `;

      item.querySelector("input").addEventListener("change", (e) => {
        customizations.lockedProjects[pId] = e.target.checked;
        applyCaseStudyLocks();
      });

      listEl.appendChild(item);
    });

    modal.classList.add("is-active");
  }

  function initCaseStudiesModalEvents() {
    const modal = document.getElementById("btrCaseStudiesModal");
    const closeBtn = document.getElementById("btrCsCloseBtn");
    const doneBtn = document.getElementById("btrCsDoneBtn");

    function closeModal() {
      if (modal) modal.classList.remove("is-active");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (doneBtn) doneBtn.addEventListener("click", closeModal);
  }

  // =========================================================================
  // 8. SAVE & UPDATE ACTUAL WEBSITE BACKEND SYNC
  // =========================================================================
  async function saveAndPublishChanges() {
    // 1. Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));

    // 2. Prepare payload for local server backend API (/api/save-content)
    const payload = {
      customizations: customizations,
      timestamp: new Date().toISOString()
    };

    let backendSaved = false;
    try {
      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        backendSaved = true;
      }
    } catch (e) {
      // Backend server might not be running or sandboxed
    }

    if (backendSaved) {
      showToast("💾 Changes saved to disk & website updated permanently!");
    } else {
      showToast("💾 Changes saved successfully in browser & live preview!");
    }
  }

  // =========================================================================
  // 9. TOP TOOLBAR EVENTS
  // =========================================================================
  function initTopBarEvents() {
    const saveBtn = document.getElementById("btrBtnSavePublish");
    const exitBtn = document.getElementById("btrBtnExitEditor");
    const previewBtn = document.getElementById("btrBtnTogglePreview");
    const manageLocksBtn = document.getElementById("btrBtnManageLocks");
    const previewText = document.getElementById("btrPreviewBtnText");

    let isPreviewing = false;

    if (saveBtn) saveBtn.addEventListener("click", saveAndPublishChanges);
    if (exitBtn) exitBtn.addEventListener("click", deactivateEditorMode);

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        isPreviewing = !isPreviewing;
        if (isPreviewing) {
          document.body.classList.remove("btr-editor-mode");
          previewBtn.classList.add("is-active");
          if (previewText) previewText.textContent = "Exit Preview";
          showToast("👁 Preview Mode Active: Viewing site as a visitor");
        } else {
          document.body.classList.add("btr-editor-mode");
          previewBtn.classList.remove("is-active");
          if (previewText) previewText.textContent = "Preview";
        }
      });
    }

    if (manageLocksBtn) {
      manageLocksBtn.addEventListener("click", openCaseStudiesModal);
    }
  }

  // =========================================================================
  // 10. INITIALIZATION
  // =========================================================================
  function init() {
    injectEditorUI();
    initPasswordAuth();
    initFormatBarEvents();
    initImageModalEvents();
    initCaseStudiesModalEvents();
    initTopBarEvents();

    applySavedCustomizations();

    // Check if user was already authenticated in this session
    if (sessionStorage.getItem(SESSION_AUTH_KEY) === "true") {
      activateEditorMode();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

