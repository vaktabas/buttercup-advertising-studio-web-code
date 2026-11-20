# 📑 Buttercup Advertising Studio — Complete Page-Wise Directory Map

> **Active Website Root:** `web 2/`  
> Sabhi active production files `web 2/` ke andar hain. Purani/unused files `_archive_old_initial_files/` me safely preserved hain.

---

## 🧭 Quick Jump Table (Page-Wise Directory)

| # | Page Name | HTML File | Associated CSS | Associated JS |
|---|---|---|---|---|
| **01** | **Home Page** | [`index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/index.html) | `site.css`, `extra.css`, `gravity-home.css`, `hero.css`, `footer.css` | `gravity-hero.js`, `gravity-app.js`, `main.js`, `rocket-footer.js` |
| **02** | **About Page** | [`pages/about/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/about/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **03** | **Contact Page** | [`pages/contact/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/contact/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js` *(FormSubmit handler)*, `rocket-footer.js` |
| **04** | **Case Studies (Archive)** | [`pages/case-studies/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/case-studies/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **05** | **Work (Filterable)** | [`pages/work/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/work/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **06** | **Work (Classic Grid)** | [`pages/work-classic/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/work-classic/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **07** | **Brand Strategy Service** | [`pages/services/brand-strategy/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/brand-strategy/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js` *(Inquiry Form)*, `rocket-footer.js` |
| **08** | **Visual Identity Service** | [`pages/services/visual-identity/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/visual-identity/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js` *(Inquiry Form)*, `rocket-footer.js` |
| **09** | **Marketing Communication** | [`pages/services/marketing-communication/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/marketing-communication/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js` *(Inquiry Form)*, `rocket-footer.js` |
| **10** | **Product-Base Industry** | [`pages/industries/product-base/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/industries/product-base/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **11** | **Service-Base Industry** | [`pages/industries/service-base/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/industries/service-base/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **12** | **Blogs Listing** | [`pages/blogs/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/blogs/index.html) | `site.css`, `extra.css`, `footer.css` | `main.js`, `rocket-footer.js` |
| **13** | **404 Error Page** | [`pages/404/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/404/index.html) | `site.css`, `extra.css` | `main.js` |
| **14** | **401 Protected Page** | [`pages/401/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/401/index.html) | `site.css`, `extra.css` | `main.js` |

---

## 🎨 Page-Wise Details & Key Components

### 1. Home Page (`web 2/index.html`)
* **HTML File:** [`web 2/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/index.html)
* **What it does:** Main landing page of Buttercup Advertising Studio.
* **Key Sections:**
  - **Interactive Hero (BAS Gravity Physics):** Controlled by [`js/gravity-hero.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/gravity-hero.js). Realtime draggable & orbiting BAS monogram physics.
  - **Gravity Scroll Interactions:** Controlled by [`js/gravity-app.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/gravity-app.js) and [`css/gravity-home.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/gravity-home.css).
  - **Featured Case Studies Slider:** Horizontal scroll with Grabz, Parishram, Vilasa Ambrosia, Tastycrafts.
  - **Chakra / Wheel of Services:** 8 pillars (Research, Consumer Psychology, Brand Strategy, Brand Positioning, Brand Architecture, Naming & Storytelling, Visual Identity, Packaging & Retail).
  - **Testimonial / Review Marquee:** High-converting client review cards.
  - **Rocket Style 3D Sculpture Footer:** GPU WebGL canvas with rotating 3D sculpture and moving ambient light.

---

### 2. About Page (`web 2/pages/about/index.html`)
* **HTML File:** [`web 2/pages/about/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/about/index.html)
* **What it does:** Studio philosophy, Founder & Creative Director **Sneha Vakta Shah**, journey, and human-intelligence approach.

---

### 3. Contact Page (`web 2/pages/contact/index.html`)
* **HTML File:** [`web 2/pages/contact/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/contact/index.html)
* **Form Destination:** Sends directly to **`info@buttercup.in`** via FormSubmit AJAX with automatic native fallback.
* **Form Fields:** First Name, Last Name, Email, Phone Number, Project Details.
* **JS Handler:** Lines 936-1035 in [`js/main.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/main.js).

---

### 4. Case Studies & Individual Project Pages
* **Overview / Archive:** [`pages/case-studies/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/case-studies/index.html) and [`pages/work/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/work/index.html)
* **All Project Case Studies Directory (`web 2/projects/`):**
  - **Grabz (FMCG 2022 - Unlocked):** [`projects/eon-studio.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/eon-studio.html) & [`projects/grabz.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/grabz.html) *(Images at `images/case-studies/grabz/`)*
  - **Parishram (Gifting 2024):** [`projects/cinder-ash.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/cinder-ash.html)
  - **Vilasa Ambrosia (Luxury 2023):** [`projects/studio-verra.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/studio-verra.html)
  - **Tastycrafts (Culinary 2023):** [`projects/atlas-bloom.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/atlas-bloom.html)
  - **Youra:** [`projects/form-theory.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/form-theory.html)
  - **Kindred Haus:** [`projects/kindred-haus.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/kindred-haus.html)
  - **Titano LED:** [`projects/titano-led.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/titano-led.html)
  - **Vijay Trivedi Group:** [`projects/vijay-trivedi-group.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/projects/vijay-trivedi-group.html)
  - *(All 39 project templates live in `web 2/projects/`)*

---

### 5. Services Pages (`web 2/pages/services/`)
* **Brand Strategy:** [`pages/services/brand-strategy/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/brand-strategy/index.html)
* **Visual Identity:** [`pages/services/visual-identity/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/visual-identity/index.html)
* **Marketing Communication:** [`pages/services/marketing-communication/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/services/marketing-communication/index.html)
*(Har service page ke bottom par built-in inquiry form hai jo direct `info@buttercup.in` ko message bhejta hai).*

---

### 6. Industries Pages (`web 2/pages/industries/`)
* **Product-Base:** [`pages/industries/product-base/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/industries/product-base/index.html)
* **Service-Base:** [`pages/industries/service-base/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/industries/service-base/index.html)

---

### 7. Blogs (`web 2/blogs/` & `web 2/pages/blogs/`)
* **Blog Archive Index:** [`pages/blogs/index.html`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/pages/blogs/index.html)
* **20 Detailed Articles:** Located in [`web 2/blogs/`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/blogs/) (FMCG brand strategy, luxury color theory, Gen Z authenticity, typography, corporate architecture, etc.).

---

## ⚙️ Global Features & Shared Modules

| Feature | CSS File | JS File | Assets Folder |
|---|---|---|---|
| **Right Floating Dock Nav** | [`css/extra.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/extra.css) | Embedded in HTML / `main.js` | [`images/dock-icons/`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/images/dock-icons/) |
| **L.I.S.A. 3D AI Assistant** | [`css/ai-assistant.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/ai-assistant.css) | [`js/ai-assistant.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/ai-assistant.js) | Three.js WebGL canvas |
| **Rocket 3D Footer Sculpture** | [`css/footer.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/footer.css) | [`js/rocket-footer.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/rocket-footer.js) | [`videos/rocket-object-1080p.mp4`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/videos/rocket-object-1080p.mp4) |
| **Otsuka Preloader** | [`css/otsuka-loader.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/otsuka-loader.css) | [`js/otsuka-loader.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/otsuka-loader.js) | Minimal circle SVG |
| **Custom Purple Cursor** | [`css/extra.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/extra.css) | [`js/main.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/main.js) | Dynamic DOM elements |
| **Visual CMS / Editor Mode** | [`css/editor.css`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/css/editor.css) | [`js/editor.js`](file:///Users/nishitbaleja/Desktop/website%20home%20page/web%202/js/editor.js) | Password lock triggered from footer |

---

## 📁 Clean Folder Structure

```
website home page/
├── _archive_old_initial_files/     # Safe archive of old Nov 2 template & scratch
├── backup/web 2/                   # 100% synchronized mirror backup
└── web 2/                          # ACTIVE PRODUCTION WEBSITE
    ├── PAGE_MAP.md                 # This file (Complete page-wise clickable index)
    ├── index.html                  # Home page
    ├── css/                        # All styling sheets
    ├── js/                         # Interactive scripts
    ├── pages/                      # About, Contact, Services, Industries, Work
    ├── projects/                   # 39 Case studies (Grabz, Parishram, etc.)
    ├── blogs/                      # 20 Strategic branding blogs
    ├── images/                     # Photos, vectors, dock icons
    ├── videos/                     # 3D sculpture video & lighting loops
    └── fonts/                      # Nohemi, PP Supply Mono, Figtree
```

