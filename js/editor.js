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
    links: {},         // { selector/id: newHref }
    lockedProjects: {} // { projectId: true/false }
  };

  let isEditorMode = false;
  let activeEditableEl = null;

  // Undo Stack History
  let undoStack = [];
  const MAX_UNDO = 50;

  function pushUndoSnapshot(actionName = "Edit") {
    try {
      const snapshot = {
        action: actionName,
        customizations: JSON.parse(JSON.stringify(customizations)),
        time: Date.now()
      };
      undoStack.push(snapshot);
      if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
      }
      updateUndoButtonState();
    } catch (e) {
      console.warn("[Editor] Undo snapshot error:", e);
    }
  }

  function updateUndoButtonState() {
    const btn = document.getElementById("btrBtnUndo");
    if (!btn) return;
    if (undoStack.length > 0) {
      btn.removeAttribute("disabled");
      btn.classList.remove("is-disabled");
      btn.title = `Undo last change (${undoStack.length} in history) [Ctrl+Z / Cmd+Z]`;
    } else {
      btn.setAttribute("disabled", "true");
      btn.classList.add("is-disabled");
      btn.title = "Nothing to undo [Ctrl+Z / Cmd+Z]";
    }
  }

  function performUndo() {
    if (!undoStack.length) {
      showToast("ℹ️ Nothing to undo");
      return;
    }
    const prevSnapshot = undoStack.pop();
    if (!prevSnapshot || !prevSnapshot.customizations) return;

    customizations = JSON.parse(JSON.stringify(prevSnapshot.customizations));
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));
    } catch(e) {}

    applySavedCustomizations();

    if (activeEditableEl) {
      showFormatBar(activeEditableEl);
    }

    updateUndoButtonState();
    showToast(`↩ Undone: ${prevSnapshot.action || "Last change"}`);
  }

  // Reset All Customizations back to clean website code
  async function resetAllCustomizations() {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to reset all customizations?\n\nThis will remove all custom texts, fonts, images, and project locks, restoring the original website code."
    );
    if (!confirmed) return;

    customizations = {
      texts: {},
      images: {},
      lockedProjects: {}
    };
    undoStack = [];

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    // Send reset signal to backend server (PHP, Netlify, or local Python)
    const candidateUrls = getCandidateApiUrls("reset-content");
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { method: "POST" });
        if (res.ok) break;
      } catch (_) {}
    }

    showToast("🔄 Reset complete! Restoring original website...");
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }

  // Helper: Get candidate API endpoints for PHP/Hostinger, Python, and Netlify environments
  function getCandidateApiUrls(action = "save-content") {
    const urls = [];
    const p = window.location.pathname || "";
    let relPrefix = "";
    if (p.includes('/pages/services/') || p.includes('/pages/industries/')) {
      relPrefix = "../../../";
    } else if (p.includes('/pages/') || p.includes('/blogs/') || p.includes('/projects/')) {
      relPrefix = "../../";
    }

    // 1. PHP endpoints on live Apache/Hostinger/cPanel server
    urls.push(`${relPrefix}api/${action}.php`);
    urls.push(`/api/${action}.php`);
    urls.push(`/web%202/api/${action}.php`);
    urls.push(`/web 2/api/${action}.php`);

    // 2. Clean rewrite paths & local Python server
    urls.push(`${relPrefix}api/${action}`);
    urls.push(`/api/${action}`);
    urls.push(`/web%202/api/${action}`);
    urls.push(`/web 2/api/${action}`);

    // 3. Netlify serverless functions
    urls.push(`/.netlify/functions/${action}`);
    urls.push(`${relPrefix}.netlify/functions/${action}`);

    return Array.from(new Set(urls));
  }

  // Load customizations asynchronously from server and localStorage
  async function loadInitialCustomizations() {
    initImageKeys();

    let serverLoaded = false;
    // 1. Try fetching dynamically from live API first (bypasses CDN cache completely!)
    const candidateUrls = getCandidateApiUrls("save-content");
    for (const url of candidateUrls) {
      try {
        const res = await fetch(`${url}?t=${Date.now()}`);
        if (res.ok) {
          const remote = await res.json();
          if (remote && typeof remote === "object") {
            if (remote.texts) Object.assign(customizations.texts, remote.texts);
            if (remote.images) Object.assign(customizations.images, remote.images);
            if (remote.links) Object.assign(customizations.links, remote.links);
            if (remote.lockedProjects) Object.assign(customizations.lockedProjects, remote.lockedProjects);
            serverLoaded = true;
            // Sync local storage to match live server truth
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));
            } catch (_) {}
            break;
          }
        }
      } catch (_) {}
    }

    // 2. If API was not reachable, fallback to data/site-customizations.json
    if (!serverLoaded) {
      try {
        let jsonPath = "data/site-customizations.json";
        const p = window.location.pathname || "";
        if (p.includes('/pages/services/') || p.includes('/pages/industries/')) {
          jsonPath = "../../../data/site-customizations.json";
        } else if (p.includes('/pages/') || p.includes('/blogs/') || p.includes('/projects/')) {
          jsonPath = "../../data/site-customizations.json";
        }
        
        const res = await fetch(`${jsonPath}?t=${Date.now()}`);
        if (res.ok) {
          const remote = await res.json();
          if (remote && typeof remote === "object") {
            if (remote.texts) Object.assign(customizations.texts, remote.texts);
            if (remote.images) Object.assign(customizations.images, remote.images);
            if (remote.links) Object.assign(customizations.links, remote.links);
            if (remote.lockedProjects) Object.assign(customizations.lockedProjects, remote.lockedProjects);
            serverLoaded = true;
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to localStorage ONLY if completely offline
    if (!serverLoaded) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const local = JSON.parse(saved);
          if (local && typeof local === "object") {
            if (local.texts) Object.assign(customizations.texts, local.texts);
            if (local.images) Object.assign(customizations.images, local.images);
            if (local.links) Object.assign(customizations.links, local.links);
            if (local.lockedProjects) Object.assign(customizations.lockedProjects, local.lockedProjects);
          }
        }
      } catch (e) {}
    }

    // 4. Apply to DOM
    applySavedCustomizations();
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
          // Look up by data-btr-img-key first (stable across editor/visitor DOM), then fallback to querySelector
          let img = document.querySelector(`[data-btr-img-key="${key}"]`);
          if (!img) {
            try {
              img = document.querySelector(key);
            } catch (_) {}
          }
          if (img && (img.tagName === "IMG" || img.tagName === "IMAGE")) {
            img.src = newSrc;
            if (img.srcset) img.removeAttribute("srcset");
          }
        } catch (e) {}
      });
    }

    // 3. Apply Links
    if (customizations.links) {
      Object.entries(customizations.links).forEach(([key, newHref]) => {
        try {
          const el = document.querySelector(key);
          if (el) {
            const a = el.tagName === "A" ? el : el.closest("a");
            if (a) a.setAttribute("href", newHref);
          }
        } catch (e) {}
      });
    }

    // 4. Apply Case Study Locks
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
    if (title && title.trim().toLowerCase().includes('grabz')) return false;
    const href = (typeof link === 'string') ? link : (link.getAttribute ? (link.getAttribute('href') || '') : '');
    if (href && (href.includes('eon-studio.html') || href.includes('grabz'))) return false;

    const card = link.closest ? link.closest(".tl-single-scroll-card") : null;
    if (card) {
      const pId = card.getAttribute("data-project-id");
      if (pId === 'grabz') return false;
      if (pId && customizations.lockedProjects[pId] !== undefined) {
        return !!customizations.lockedProjects[pId];
      }
      return card.getAttribute("data-locked") === "true";
    }

    // Check by title or link href
    if (title) {
      const cleanTitle = title.trim().toLowerCase().replace(/\s+/g, "-");
      if (cleanTitle.includes('grabz')) return false;
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
            <input type="password" id="btrPasswordInput" class="btr-auth-input" placeholder="Enter password" autocomplete="current-password" />
            <button type="button" class="btr-auth-toggle-pwd" id="btrTogglePwdBtn" aria-label="Toggle password visibility">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
          <div class="btr-auth-error" id="btrAuthError">Please enter a password to proceed.</div>
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
          <button type="button" class="btr-bar-btn is-disabled" id="btrBtnUndo" disabled title="Undo last change [Ctrl+Z / Cmd+Z]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <span>Undo</span>
          </button>
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
          <button type="button" class="btr-bar-btn btr-bar-btn-reset" id="btrBtnResetAll" title="Reset all changes to original code">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            <span>Reset All</span>
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

    // G. Floating Link Action Pill
    if (!document.getElementById("btrLinkActionPill")) {
      const pill = document.createElement("div");
      pill.id = "btrLinkActionPill";
      pill.className = "btr-link-action-pill";
      pill.innerHTML = `
        <div class="btr-link-pill-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          <span class="btr-link-pill-url" id="btrLinkPillUrl">#</span>
        </div>
        <div class="btr-link-pill-btns">
          <button type="button" class="btr-link-pill-btn" id="btrLinkPillChangeBtn" title="Change where this link points">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>Edit URL</span>
          </button>
          <a href="#" target="_blank" class="btr-link-pill-btn btr-link-pill-open" id="btrLinkPillOpenBtn" title="Open this page in new tab">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span>Open Page ↗</span>
          </a>
          <button type="button" class="btr-link-pill-close" id="btrLinkPillCloseBtn" title="Dismiss">×</button>
        </div>
      `;
      document.body.appendChild(pill);
    }
  }

  // Helper: check if element is part of editor UI
  function isEditorElement(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(
      "#buttercupEditorBar, #btrPasswordModal, #btrTextFormatBar, #btrImageModal, #btrCaseStudiesModal, #btrToast, #btrLinkActionPill, .btr-img-edit-badge, .btr-card-lock-badge"
    );
  }

  // Floating Link Action Pill logic
  let currentActionLinkEl = null;

  function showLinkActionPill(linkEl, href) {
    currentActionLinkEl = linkEl;
    const pill = document.getElementById("btrLinkActionPill");
    const urlEl = document.getElementById("btrLinkPillUrl");
    const openBtn = document.getElementById("btrLinkPillOpenBtn");
    if (!pill || !urlEl || !openBtn) return;

    const targetA = linkEl.tagName === "A" ? linkEl : (linkEl.querySelector("a") || linkEl.closest("a"));
    const rawHref = href || (targetA ? targetA.getAttribute("href") : "") || linkEl.getAttribute("data-link") || "#";
    
    urlEl.textContent = rawHref;
    urlEl.title = rawHref;
    openBtn.href = rawHref;

    const rect = linkEl.getBoundingClientRect();
    const pillTop = rect.bottom + 8 < window.innerHeight - 50 ? rect.bottom + 8 : Math.max(10, rect.top - 46);
    const pillLeft = Math.min(window.innerWidth - 320, Math.max(10, rect.left));

    pill.style.top = `${pillTop}px`;
    pill.style.left = `${pillLeft}px`;
    pill.classList.add("is-visible");
  }

  function hideLinkActionPill() {
    const pill = document.getElementById("btrLinkActionPill");
    if (pill) pill.classList.remove("is-visible");
    currentActionLinkEl = null;
  }

  function initLinkActionPillEvents() {
    const changeBtn = document.getElementById("btrLinkPillChangeBtn");
    const closeBtn = document.getElementById("btrLinkPillCloseBtn");

    if (closeBtn) closeBtn.addEventListener("click", hideLinkActionPill);

    if (changeBtn) {
      changeBtn.addEventListener("click", () => {
        if (!currentActionLinkEl) return;
        const targetA = currentActionLinkEl.tagName === "A" ? currentActionLinkEl : (currentActionLinkEl.querySelector("a") || currentActionLinkEl.closest("a"));
        if (!targetA) return;

        const curHref = targetA.getAttribute("href") || "";
        const newHref = window.prompt("Enter new link URL:", curHref);
        if (newHref !== null && newHref.trim() !== "") {
          pushUndoSnapshot("Change link URL");
          targetA.setAttribute("href", newHref.trim());
          const sel = getUniqueSelector(targetA);
          if (!customizations.links) customizations.links = {};
          customizations.links[sel] = newHref.trim();
          showToast("🔗 Link destination updated!");
          showLinkActionPill(currentActionLinkEl, newHref.trim());
        }
      });
    }

    // Hide pill when clicking outside
    document.addEventListener("click", (e) => {
      if (!isEditorMode) return;
      const pill = document.getElementById("btrLinkActionPill");
      if (pill && pill.classList.contains("is-visible")) {
        if (!pill.contains(e.target) && (!currentActionLinkEl || !currentActionLinkEl.contains(e.target))) {
          hideLinkActionPill();
        }
      }
    });
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
      if (!entered) {
        if (errorEl) {
          errorEl.textContent = "Please enter a password to proceed.";
          errorEl.classList.add("is-visible");
        }
        if (authCard) {
          authCard.classList.remove("shake");
          void authCard.offsetWidth; // trigger reflow
          authCard.classList.add("shake");
        }
        if (input) input.focus();
        return;
      }

      // Strict Administrator verification: only valid secret unlocks editor
      if (entered !== PASSWORD_SECRET) {
        if (errorEl) {
          errorEl.textContent = "Incorrect password. Access denied.";
          errorEl.classList.add("is-visible");
        }
        if (authCard) {
          authCard.classList.remove("shake");
          void authCard.offsetWidth; // trigger reflow
          authCard.classList.add("shake");
        }
        if (input) {
          input.value = "";
          input.focus();
        }
        return;
      }

      sessionStorage.setItem(SESSION_AUTH_KEY, "true");
      closeAuthModal();
      activateEditorMode();
      showToast("✨ Welcome to Buttercup Studio Editor Mode!");
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

    hideLinkActionPill();

    // Remove contenteditable
    document.querySelectorAll('[data-btr-editable="true"]').forEach((el) => {
      el.removeAttribute("contenteditable");
    });
  }

  // =========================================================================
  // 5. TEXT EDITING & FONT STYLING ENGINE (COMPREHENSIVE COVERAGE)
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
    // 1. Broad selector covering all text semantic and presentational tags
    const textSelectors = [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "span", "a", "button", "label", "li",
      "blockquote", "cite", "figcaption", "strong", "em", "b", "i", "small", "mark",
      ".text-3x_base", ".text-2x_base", ".text-x_base", ".text-medium", ".heading-x_large",
      ".tl-section-headline-one span", ".scroll-card-content h3", ".scroll-card-meta",
      ".scroll-card-cta", ".rwl-link", ".rwl-col-title", ".rwl-mono-line",
      ".rwl-quote-btn span", ".rwl-marquee-text", ".service-content a", ".tool-text_wrapper div",
      "[data-brand-word]", ".brand-word", ".manifesto-word", ".manifesto-line",
      ".review-quote", ".author-name", ".author-role", ".blog-title", ".case-study-title"
    ].join(", ");

    const candidates = Array.from(document.querySelectorAll(textSelectors));

    // 2. Also collect any div, section, footer, nav, header with direct text
    document.querySelectorAll("div, section, header, footer, nav").forEach((box) => {
      if (isEditorElement(box)) return;
      for (let i = 0; i < box.childNodes.length; i++) {
        const n = box.childNodes[i];
        if (n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0) {
          candidates.push(box);
          break;
        }
      }
    });

    const uniqueCandidates = Array.from(new Set(candidates));

    uniqueCandidates.forEach((el) => {
      if (isEditorElement(el)) return;
      const tag = el.tagName.toLowerCase();
      if (["script", "style", "canvas", "svg", "path", "video", "audio", "iframe", "input", "textarea", "select"].includes(tag)) {
        return;
      }

      el.setAttribute("data-btr-editable", "true");

      el.addEventListener("click", function (e) {
        if (!isEditorMode) return;
        // Stop propagation so clicking a specific inner span or word edits that exact element
        e.stopPropagation();

        activeEditableEl = el;
        el.setAttribute("contenteditable", "true");
        el.focus();
        showFormatBar(el);

        // If clicking a link or inside a link, show the link action pill
        const link = el.tagName === "A" ? el : el.closest("a");
        if (link) {
          const href = link.getAttribute("href");
          if (href && href !== "#" && !href.startsWith("javascript:")) {
            showLinkActionPill(link, href);
          }
        }
      });

      el.addEventListener("focus", function () {
        if (!isEditorMode) return;
        pushUndoSnapshot("Edit text (" + el.tagName.toLowerCase() + ")");
      });

      el.addEventListener("blur", function () {
        if (!isEditorMode) return;
        saveElementText(el);
        triggerAutoSaveDebounced(300);
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
      pushUndoSnapshot(`Change font ${prop}`);
      activeEditableEl.style[prop] = val;
      saveElementText(activeEditableEl);
      triggerAutoSaveDebounced(600);
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
  // 6. IMAGE REPLACEMENT ENGINE (AUTO-COMPRESS, STABLE KEYS & AUTO-SAVE)
  // =========================================================================
  let targetImgEl = null;

  // Generate deterministic, stable key for every image that matches across visitor & editor DOM
  function getImageKey(img, index = 0) {
    if (!img) return `img-${index}`;
    if (img.getAttribute && img.getAttribute("data-btr-img-key")) {
      return img.getAttribute("data-btr-img-key");
    }

    if (img.id) {
      return `id-${img.id}`;
    }

    const card = img.closest ? img.closest(".tl-single-scroll-card") : null;
    if (card) {
      const pId = card.getAttribute("data-project-id") || card.querySelector("h3")?.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (pId) return `cs-${pId}`;
    }

    const alt = (img.getAttribute ? (img.getAttribute("alt") || "") : "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (alt && alt.length > 2 && alt !== "image" && alt !== "img" && alt !== "photo") {
      return `alt-${alt}`;
    }

    const svc = img.closest ? img.closest(".service-elements") : null;
    if (svc) {
      const svcClass = Array.from(svc.classList).find((c) => c.startsWith("_")) || "svc";
      return `svc-${svcClass}`;
    }

    const src = img.getAttribute ? (img.getAttribute("src") || "") : "";
    if (src && !src.startsWith("data:")) {
      const cleanSrc = src.split("?")[0].split("/").pop().replace(/[^a-z0-9-_]/gi, "-");
      if (cleanSrc && cleanSrc.length > 2) {
        return `src-${cleanSrc}`;
      }
    }

    return `img-${index}`;
  }

  function initImageKeys() {
    const images = document.querySelectorAll("img, image");
    images.forEach((img, idx) => {
      if (isEditorElement(img)) return;
      if (!img.getAttribute("data-btr-img-key")) {
        const key = getImageKey(img, idx);
        img.setAttribute("data-btr-img-key", key);
      }
    });
  }

  // Client-side canvas compression: resizes raw camera/phone photos to max 1280px / ~100KB JPEG
  // Prevents localStorage quota crash (QuotaExceededError) and enables instant network syncing
  function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("No file provided"));
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let mime = "image/jpeg";
        if (file.type === "image/png") {
          mime = "image/png";
          try {
            const testWebp = canvas.toDataURL("image/webp", quality);
            if (testWebp && testWebp.startsWith("data:image/webp")) {
              mime = "image/webp";
            }
          } catch (_) {}
        }

        try {
          const compressedDataUrl = canvas.toDataURL(mime, quality);
          resolve(compressedDataUrl);
        } catch (e) {
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        }
      };

      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function setupEditableImages() {
    initImageKeys();

    const images = document.querySelectorAll(
      "img, image, .scroll-card-img img, .service-img, .thumbnail, .testimonial-person_image, .rwl-brand-logo-img, img[src]"
    );

    images.forEach((img) => {
      if (isEditorElement(img)) return;

      const parent = img.parentElement;
      if (!parent || parent.classList.contains("btr-img-wrap")) return;

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
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            showToast("⏳ Optimizing image for web...");
            const dataUrl = await compressImageFile(file);
            if (previewImg) previewImg.src = dataUrl;
            if (previewWrap) previewWrap.style.display = "block";
            if (urlInput) urlInput.value = dataUrl;
            showToast("✨ Image ready!");
          } catch (err) {
            console.error("Image load error:", err);
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
              const dataUrl = loadEvt.target.result;
              if (previewImg) previewImg.src = dataUrl;
              if (previewWrap) previewWrap.style.display = "block";
              if (urlInput) urlInput.value = dataUrl;
            };
            reader.readAsDataURL(file);
          }
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
      applyBtn.addEventListener("click", async () => {
        if (!targetImgEl) return;
        const newSrc = (urlInput ? urlInput.value : "").trim();
        if (newSrc) {
          pushUndoSnapshot("Replace image");
          targetImgEl.src = newSrc;
          if (targetImgEl.srcset) targetImgEl.removeAttribute("srcset");

          const key = targetImgEl.getAttribute("data-btr-img-key") || getImageKey(targetImgEl, 0);
          targetImgEl.setAttribute("data-btr-img-key", key);
          customizations.images[key] = newSrc;

          showToast("📷 Image replaced! Auto-saving to live website...");
          closeModal();

          // Auto-save immediately to disk / localStorage so it persists permanently!
          await saveAndPublishChanges();
        } else {
          closeModal();
        }
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
    pushUndoSnapshot("Toggle case study lock");
    const current = !!customizations.lockedProjects[pId];
    customizations.lockedProjects[pId] = !current;
    applyCaseStudyLocks();
    triggerAutoSaveDebounced(300);

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
        pushUndoSnapshot("Toggle case study lock");
        customizations.lockedProjects[pId] = e.target.checked;
        applyCaseStudyLocks();
        triggerAutoSaveDebounced(300);
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
  let autoSaveTimer = null;
  function triggerAutoSaveDebounced(delay = 1200) {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveAndPublishChanges();
    }, delay);
  }

  async function saveAndPublishChanges() {
    // 1. Save to localStorage safely (catch quota exceptions)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));
    } catch (e) {
      console.warn("[Editor] localStorage quota or privacy error, saving via server backend API:", e);
    }

    // 2. Prepare payload for backend API
    const payload = {
      customizations: customizations,
      timestamp: new Date().toISOString()
    };

    let backendSaved = false;
    let savedTarget = "";
    const candidateUrls = getCandidateApiUrls("save-content");

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            backendSaved = true;
            savedTarget = url;
            break;
          }
        }
      } catch (err) {
        // try next endpoint
      }
    }

    if (backendSaved) {
      showToast("💾 Saved to live website server! Changes are visible to everyone.");
    } else {
      showToast("💾 Saved to browser! (Server backend not reached on this URL)");
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
    const undoBtn = document.getElementById("btrBtnUndo");
    const resetBtn = document.getElementById("btrBtnResetAll");
    const previewText = document.getElementById("btrPreviewBtnText");

    let isPreviewing = false;

    if (undoBtn) undoBtn.addEventListener("click", performUndo);
    if (resetBtn) resetBtn.addEventListener("click", resetAllCustomizations);
    if (saveBtn) saveBtn.addEventListener("click", saveAndPublishChanges);
    if (exitBtn) exitBtn.addEventListener("click", deactivateEditorMode);

    // Global keyboard shortcut: Ctrl+Z or Cmd+Z for Undo in editor mode
    window.addEventListener("keydown", (e) => {
      if (!isEditorMode) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
          return;
        }
        e.preventDefault();
        performUndo();
      }
    });

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

    // Universal Capturing Click Interception in Editor Mode:
    // Stops ANY link, card, or button from navigating away in editor mode,
    // allowing inline editing + displaying the "Open Page ↗" pill!
    document.addEventListener(
      "click",
      function (e) {
        if (!isEditorMode) return;
        if (isEditorElement(e.target)) return;

        const link = e.target.closest("a, [data-link], .tl-single-scroll-card");
        if (link && !isEditorElement(link)) {
          const href = link.getAttribute("href") || (link.querySelector("a")?.getAttribute("href")) || "";
          if (href && href !== "#" && !href.startsWith("javascript:")) {
            e.preventDefault();
            e.stopPropagation();
            showLinkActionPill(link, href);
          }
        }
      },
      true
    );
  }

  // =========================================================================
  // 10. INITIALIZATION
  // =========================================================================
  function init() {
    initImageKeys();
    injectEditorUI();
    initPasswordAuth();
    initFormatBarEvents();
    initImageModalEvents();
    initCaseStudiesModalEvents();
    initTopBarEvents();
    initLinkActionPillEvents();

    loadInitialCustomizations();

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

