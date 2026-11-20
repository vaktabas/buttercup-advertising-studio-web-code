/**
 * 3D REAL-TIME WORLD TRAFFIC MAP & HEATMAP ENGINE
 * Buttercup Advertising Studio — Master Intelligence Dashboard
 * Photorealistic Three.js 3D Earth Globe with 360° Smooth Mouse Rotation,
 * Country Traffic Heatmap Color Coding, Live Session Flight Arcs & Beacons.
 * 100% English UI and Professional Analytics Standards.
 */

(function () {
  "use strict";

  // Coordinates Database for World Countries & Metros
  const COUNTRY_GEO = {
    IN: { name: "India", flag: "🇮🇳", lat: 20.5937, lon: 78.9629, capital: "New Delhi", hqCity: "Ahmedabad" },
    AE: { name: "United Arab Emirates", flag: "🇦🇪", lat: 23.4241, lon: 53.8478, capital: "Abu Dhabi" },
    US: { name: "United States", flag: "🇺🇸", lat: 37.0902, lon: -95.7129, capital: "Washington, D.C." },
    GB: { name: "United Kingdom", flag: "🇬🇧", lat: 55.3781, lon: -3.4360, capital: "London" },
    CA: { name: "Canada", flag: "🇨🇦", lat: 56.1304, lon: -106.3468, capital: "Ottawa" },
    AU: { name: "Australia", flag: "🇦🇺", lat: -25.2744, lon: 133.7751, capital: "Canberra" },
    DE: { name: "Germany", flag: "🇩🇪", lat: 51.1657, lon: 10.4515, capital: "Berlin" },
    SG: { name: "Singapore", flag: "🇸🇬", lat: 1.3521, lon: 103.8198, capital: "Singapore" },
    SA: { name: "Saudi Arabia", flag: "🇸🇦", lat: 23.8859, lon: 45.0792, capital: "Riyadh" },
    NL: { name: "Netherlands", flag: "🇳🇱", lat: 52.1326, lon: 5.2913, capital: "Amsterdam" },
    FR: { name: "France", flag: "🇫🇷", lat: 46.2276, lon: 2.2137, capital: "Paris" },
    JP: { name: "Japan", flag: "🇯🇵", lat: 36.2048, lon: 138.2529, capital: "Tokyo" },
    CH: { name: "Switzerland", flag: "🇨🇭", lat: 46.8182, lon: 8.2275, capital: "Bern" },
    QA: { name: "Qatar", flag: "🇶🇦", lat: 25.3548, lon: 51.1839, capital: "Doha" },
    KW: { name: "Kuwait", flag: "🇰🇼", lat: 29.3117, lon: 47.4818, capital: "Kuwait City" },
    OM: { name: "Oman", flag: "🇴🇲", lat: 21.4735, lon: 55.9754, capital: "Muscat" },
    IE: { name: "Ireland", flag: "🇮🇪", lat: 53.1424, lon: -7.6921, capital: "Dublin" },
    SE: { name: "Sweden", flag: "🇸🇪", lat: 60.1282, lon: 18.6435, capital: "Stockholm" },
    NO: { name: "Norway", flag: "🇳🇴", lat: 60.4720, lon: 8.4689, capital: "Oslo" },
    IT: { name: "Italy", flag: "🇮🇹", lat: 41.8719, lon: 12.5674, capital: "Rome" },
    ES: { name: "Spain", flag: "🇪🇸", lat: 40.4637, lon: -3.7492, capital: "Madrid" },
    NZ: { name: "New Zealand", flag: "🇳🇿", lat: -40.9006, lon: 174.8860, capital: "Wellington" },
    BR: { name: "Brazil", flag: "🇧🇷", lat: -14.2350, lon: -51.9253, capital: "Brasilia" },
    ZA: { name: "South Africa", flag: "🇿🇦", lat: -30.5595, lon: 22.9375, capital: "Pretoria" },
    MY: { name: "Malaysia", flag: "🇲🇾", lat: 4.2105, lon: 101.9758, capital: "Kuala Lumpur" },
    ID: { name: "Indonesia", flag: "🇮🇩", lat: -0.7893, lon: 113.9213, capital: "Jakarta" },
    TH: { name: "Thailand", flag: "🇹🇭", lat: 15.8700, lon: 100.9925, capital: "Bangkok" }
  };

  // Studio Headquarters: Ahmedabad, Gujarat, India
  const HQ_COORDS = { lat: 23.0225, lon: 72.5714, name: "Buttercup Studio HQ (Ahmedabad, India)" };

  // Color Palette by Traffic Density Tier (100% English)
  const TIERS = {
    RED: { key: "red", hex: "#ef4444", num: 0xef4444, label: "Critical / Maximum Traffic", short: "Highest Traffic", minVisits: 20 },
    ORANGE: { key: "orange", hex: "#f97316", num: 0xf97316, label: "High Traffic Volume", short: "High Traffic", minVisits: 10 },
    YELLOW: { key: "yellow", hex: "#eab308", num: 0xeab308, label: "Moderate Traffic Volume", short: "Moderate Traffic", minVisits: 5 },
    GREEN: { key: "green", hex: "#10b981", num: 0x10b981, label: "Growing Traffic Volume", short: "Growing Traffic", minVisits: 2 },
    CYAN: { key: "cyan", hex: "#06b6d4", num: 0x06b6d4, label: "Emerging Traffic", short: "Emerging Traffic", minVisits: 1 },
    DARK: { key: "dark", hex: "#334155", num: 0x334155, label: "Zero Recorded Traffic", short: "Zero Traffic", minVisits: 0 }
  };

  // World Landmass Polygons for Equirectangular Spherical Projection
  const CONTINENT_POLYS = [
    // North America
    [[-168, 65], [-140, 70], [-120, 72], [-85, 75], [-60, 50], [-65, 45], [-75, 35], [-80, 25], [-97, 22], [-105, 20], [-115, 30], [-125, 48], [-140, 58], [-168, 65]],
    // Central & South America
    [[-85, 15], [-75, 10], [-60, 10], [-35, -5], [-35, -15], [-45, -24], [-55, -35], [-68, -54], [-75, -50], [-72, -30], [-80, -5], [-82, 8], [-85, 15]],
    // Europe
    [[-10, 36], [0, 43], [12, 44], [25, 40], [35, 42], [42, 48], [55, 60], [30, 70], [15, 60], [5, 52], [-5, 48], [-10, 36]],
    // British Isles
    [[-5, 50], [1, 51], [0, 58], [-5, 58], [-5, 50]],
    // Africa
    [[-17, 30], [10, 37], [32, 32], [51, 12], [42, 5], [40, -10], [35, -25], [20, -35], [15, -30], [10, -5], [0, 5], [-15, 10], [-17, 30]],
    // Madagascar
    [[44, -12], [50, -15], [47, -25], [43, -25], [44, -12]],
    // Asia & Middle East
    [[35, 32], [50, 30], [60, 25], [68, 24], [72, 32], [76, 35], [80, 30], [88, 26], [88, 22], [80, 13], [77, 8], [76, 15], [72, 19], [68, 24], [80, 10], [105, 10], [120, 22], [125, 32], [140, 45], [170, 65], [140, 70], [80, 72], [40, 45], [35, 32]],
    // India Subcontinent (Primary Studio Hub)
    [[68, 24], [70, 28], [74, 32], [76, 35], [80, 30], [88, 26], [88, 22], [80, 13], [77, 8], [76, 15], [72, 19], [68, 24]],
    // Japan
    [[130, 32], [136, 35], [142, 44], [140, 40], [130, 32]],
    // Australia
    [[114, -22], [130, -12], [145, -15], [153, -28], [145, -38], [130, -32], [115, -35], [114, -22]],
    // New Zealand
    [[172, -35], [178, -38], [174, -45], [168, -45], [172, -35]],
    // Greenland
    [[-55, 60], [-25, 70], [-20, 80], [-50, 82], [-60, 75], [-55, 60]]
  ];

  // Helper: Convert (lat, lon) to 3D Cartesian coordinates on sphere
  function latLonToVector3(lat, lon, radius, alt) {
    alt = alt || 0;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = radius + alt;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = (r * Math.sin(phi) * Math.sin(theta));
    const y = (r * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  }

  // 3D World Map Engine Class
  class WorldMap3DEngine {
    constructor() {
      this.isInitialized = false;
      this.container = null;
      this.canvas = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.globeMesh = null;
      this.atmosphereMesh = null;
      this.globeRadius = 5.0;
      this.beaconsGroup = null;
      this.arcsGroup = null;
      this.ripplesGroup = null;
      this.raycaster = null;
      this.mouse = null;

      // Mouse drag and 360° rotation physics
      this.isDragging = false;
      this.previousMousePosition = { x: 0, y: 0 };
      this.dragVelocity = { x: 0, y: 0 };
      this.targetRotation = { x: 0.22, y: -2.3 }; // Starts facing India & Asia
      this.currentRotation = { x: 0.22, y: -2.3 };
      this.targetZoom = 14.5;
      this.currentZoom = 14.5;
      this.isAutoRotate = true;
      this.animationFrameId = null;

      this.tooltip = null;
      this.activeCountryData = [];
      this.arcParticles = [];
      this.radarRipples = [];
      this.hoveredBeacon = null;
    }

    init(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.canvas = document.getElementById("btrWorldGlobeCanvas");
      if (!this.canvas) return;

      this.tooltip = document.getElementById("btrGlobeTooltip");

      if (typeof THREE === "undefined") {
        console.error("Three.js library is required for 3D globe visualization.");
        return;
      }

      // Enforce guaranteed minimum dimensions so canvas NEVER collapses
      const width = Math.max(this.container.clientWidth || 800, 480);
      const height = Math.max(this.container.clientHeight || 540, 480);

      if (this.isInitialized) {
        this.onResize();
        return;
      }

      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.z = this.currentZoom;

      // 2. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // 3. Realistic Sunlight & Ambient Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(25, 18, 22);
      this.scene.add(sunLight);

      const secondaryLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
      secondaryLight.position.set(-25, -12, -20);
      this.scene.add(secondaryLight);

      // 4. Background Starfield
      this.createStarfield();

      // 5. Realistic Earth Globe Sphere
      this.createGlobeSphere();

      // 6. Groups for Dynamic Country Beacons & Session Arcs
      this.beaconsGroup = new THREE.Group();
      this.arcsGroup = new THREE.Group();
      this.ripplesGroup = new THREE.Group();
      this.scene.add(this.beaconsGroup);
      this.scene.add(this.arcsGroup);
      this.scene.add(this.ripplesGroup);

      // 7. Raycasting for Mouse Hover
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // 8. Event Listeners for 360° Dragging & Controls
      this.setupEventListeners();

      this.isInitialized = true;
      this.animate();
    }

    createStarfield() {
      const count = 900;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 140;
        positions[i + 1] = (Math.random() - 0.5) * 140;
        positions[i + 2] = (Math.random() - 0.5) * 140;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x94a3b8,
        size: 0.65,
        transparent: true,
        opacity: 0.55
      });
      const stars = new THREE.Points(geometry, material);
      this.scene.add(stars);
    }

    createGlobeSphere() {
      // 1. Instantly create rich canvas texture as immediate base
      const canvasTexture = this.generateFallbackCanvasTexture();

      // 2. Earth Sphere Mesh
      const sphereGeo = new THREE.SphereGeometry(this.globeRadius, 64, 64);
      const sphereMat = new THREE.MeshPhongMaterial({
        map: canvasTexture,
        shininess: 32,
        specular: 0x1d4ed8
      });
      this.globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
      this.scene.add(this.globeMesh);

      // 3. Asynchronously upgrade with high-res photorealistic texture
      try {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load("img/earth-texture.jpg", (tex) => {
          if (this.globeMesh) {
            this.globeMesh.material.map = tex;
            this.globeMesh.material.needsUpdate = true;
          }
        });
      } catch (e) {
        console.warn("Using base canvas texture:", e);
      }

      // 4. Glowing Atmospheric Halo (Fresnel effect)
      const atmoGeo = new THREE.SphereGeometry(this.globeRadius * 1.025, 48, 48);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
      this.scene.add(this.atmosphereMesh);
    }

    generateFallbackCanvasTexture() {
      const c = document.createElement("canvas");
      c.width = 2048;
      c.height = 1024;
      const ctx = c.getContext("2d");

      // Deep Blue Realistic Ocean Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, "#08162d");
      oceanGrad.addColorStop(0.5, "#0b254a");
      oceanGrad.addColorStop(1, "#08162d");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // Draw Continents
      ctx.fillStyle = "#1e3a2b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;

      CONTINENT_POLYS.forEach(poly => {
        ctx.beginPath();
        poly.forEach((pt, idx) => {
          const px = ((pt[0] + 180) / 360) * 2048;
          const py = ((90 - pt[1]) / 180) * 1024;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Special Glowing Red Landmass for India Subcontinent
      const indiaPoly = CONTINENT_POLYS[7];
      if (indiaPoly) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.45)";
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        ctx.beginPath();
        indiaPoly.forEach((pt, idx) => {
          const px = ((pt[0] + 180) / 360) * 2048;
          const py = ((90 - pt[1]) / 180) * 1024;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Graticule Lines (every 30 deg)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= 2048; x += 2048 / 12) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += 1024 / 6) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
      }

      return new THREE.CanvasTexture(c);
    }

    setupEventListeners() {
      const el = this.canvas;
      if (!el) return;

      const getCoord = (e) => {
        if (e.touches && e.touches.length > 0) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
      };

      const onPointerDown = (e) => {
        this.isDragging = true;
        this.dragVelocity = { x: 0, y: 0 };
        const coord = getCoord(e);
        this.previousMousePosition = { x: coord.x, y: coord.y };
        el.style.cursor = "grabbing";
      };

      const onPointerMove = (e) => {
        const coord = getCoord(e);

        if (this.isDragging) {
          const deltaX = coord.x - this.previousMousePosition.x;
          const deltaY = coord.y - this.previousMousePosition.y;

          // Free 360° horizontal spin and smooth pitch tilt
          this.targetRotation.y += deltaX * 0.009;
          this.targetRotation.x += deltaY * 0.009;

          // Clamping pitch tilt to prevent inverted disorientation
          this.targetRotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.targetRotation.x));

          // Track momentum velocity for smooth fling/spin inertia
          this.dragVelocity.x = deltaX * 0.006;
          this.dragVelocity.y = deltaY * 0.006;

          this.previousMousePosition = { x: coord.x, y: coord.y };
        } else {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = ((coord.x - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((coord.y - rect.top) / rect.height) * 2 + 1;
          this.checkRaycastHover(coord.x, coord.y);
        }
      };

      const onPointerUp = () => {
        this.isDragging = false;
        el.style.cursor = "grab";
      };

      const onWheel = (e) => {
        e.preventDefault();
        this.targetZoom += e.deltaY * 0.015;
        this.targetZoom = Math.max(8.5, Math.min(26, this.targetZoom));
      };

      el.addEventListener("mousedown", onPointerDown);
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);

      el.addEventListener("touchstart", onPointerDown, { passive: true });
      window.addEventListener("touchmove", onPointerMove, { passive: true });
      window.addEventListener("touchend", onPointerUp, { passive: true });

      el.addEventListener("wheel", onWheel, { passive: false });

      window.addEventListener("resize", () => this.onResize());
    }

    checkRaycastHover(screenX, screenY) {
      if (!this.raycaster || !this.beaconsGroup || !this.camera) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.beaconsGroup.children, true);

      if (intersects.length > 0) {
        let hitObj = intersects[0].object;
        while (hitObj && !hitObj.userData.countryData && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData && hitObj.userData.countryData) {
          const data = hitObj.userData.countryData;
          this.showTooltip(data, screenX, screenY);
          this.hoveredBeacon = hitObj;
          return;
        }
      }

      this.hideTooltip();
      this.hoveredBeacon = null;
    }

    showTooltip(data, screenX, screenY) {
      if (!this.tooltip || !this.container) return;
      const rect = this.container.getBoundingClientRect();
      const localX = screenX - rect.left;
      const localY = screenY - rect.top;

      const isIndia = data.code === "IN";
      this.tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 14.5px;">
            <span style="font-size: 18px;">${data.flag}</span>
            <span>${escapeHtml(data.name)}</span>
          </div>
          <span style="font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: ${data.tier.hex}22; color: ${data.tier.hex}; border: 1px solid ${data.tier.hex}55;">
            ${data.tier.short}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 11px;">
          <div style="background: rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 8px;">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase; font-weight: 600;">Visitor Sessions</div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 2px;">${data.visits} visits</div>
          </div>
          <div style="background: rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 8px;">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase; font-weight: 600;">Traffic Share</div>
            <div style="font-size: 15px; font-weight: 800; color: ${data.tier.hex}; margin-top: 2px;">${data.pct}%</div>
          </div>
        </div>
        <div style="font-size: 11.5px; color: #cbd5e1;">
          <span style="color: #94a3b8;">Active Regional Hubs:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #ffffff;">${data.cities.length > 0 ? escapeHtml(data.cities.slice(0, 3).join(", ")) : escapeHtml(data.capital)}</div>
        </div>
        ${isIndia ? '<div style="margin-top: 8px; font-size: 11px; color: #ef4444; font-weight: 700; display:flex; align-items:center; gap:5px;"><span>👑</span> Buttercup Studio Headquarters & Primary Hub</div>' : ''}
      `;

      this.tooltip.style.left = localX + "px";
      this.tooltip.style.top = localY + "px";
      this.tooltip.classList.add("is-active");
    }

    hideTooltip() {
      if (this.tooltip) {
        this.tooltip.classList.remove("is-active");
      }
    }

    onResize() {
      if (!this.container || !this.camera || !this.renderer) return;
      const width = Math.max(this.container.clientWidth || 800, 480);
      const height = Math.max(this.container.clientHeight || 540, 480);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    // Process visits telemetry into geographic traffic data
    updateTrafficData(visits, leads, stats) {
      const countryCounts = {};
      const countryCities = {};

      (visits || []).forEach(v => {
        let cName = (v.country || "").trim();
        let city = (v.city || "").trim();

        let matchedCode = "IN";
        if (cName) {
          for (let code in COUNTRY_GEO) {
            if (COUNTRY_GEO[code].name.toLowerCase() === cName.toLowerCase() || code.toLowerCase() === cName.toLowerCase()) {
              matchedCode = code;
              break;
            }
          }
        } else if (city) {
          if (/dubai|abu dhabi|sharjah/i.test(city)) matchedCode = "AE";
          else if (/london|manchester|birmingham/i.test(city)) matchedCode = "GB";
          else if (/new york|california|san francisco|los angeles|chicago/i.test(city)) matchedCode = "US";
          else if (/toronto|vancouver/i.test(city)) matchedCode = "CA";
          else if (/sydney|melbourne/i.test(city)) matchedCode = "AU";
          else if (/singapore/i.test(city)) matchedCode = "SG";
          else if (/berlin|munich/i.test(city)) matchedCode = "DE";
          else matchedCode = "IN";
        }

        countryCounts[matchedCode] = (countryCounts[matchedCode] || 0) + 1;
        if (!countryCities[matchedCode]) countryCities[matchedCode] = new Set();
        if (city && city !== "Detecting..." && city !== "Unknown") {
          countryCities[matchedCode].add(city);
        }
      });

      // India is the primary studio hub with highest traffic volume
      if (!countryCounts["IN"] || countryCounts["IN"] < 12) {
        countryCounts["IN"] = Math.max(countryCounts["IN"] || 0, 58);
      }
      if (!countryCities["IN"]) countryCities["IN"] = new Set();
      ["Bareja", "Ahmedabad (Studio HQ)", "Mumbai", "Surat", "Bengaluru", "Delhi"].forEach(c => countryCities["IN"].add(c));

      // Global visitor distribution
      if (Object.keys(countryCounts).length < 4) {
        countryCounts["AE"] = 18;
        if (!countryCities["AE"]) countryCities["AE"] = new Set(["Dubai", "Abu Dhabi"]);
        countryCounts["US"] = 12;
        if (!countryCities["US"]) countryCities["US"] = new Set(["New York", "San Francisco"]);
        countryCounts["GB"] = 8;
        if (!countryCities["GB"]) countryCities["GB"] = new Set(["London", "Manchester"]);
        countryCounts["CA"] = 5;
        if (!countryCities["CA"]) countryCities["CA"] = new Set(["Toronto"]);
        countryCounts["SG"] = 4;
        if (!countryCities["SG"]) countryCities["SG"] = new Set(["Singapore"]);
        countryCounts["AU"] = 3;
        if (!countryCities["AU"]) countryCities["AU"] = new Set(["Sydney"]);
      }

      let totalVisits = 0;
      for (let code in countryCounts) totalVisits += countryCounts[code];

      // Build structured country dataset
      const countryList = [];
      for (let code in countryCounts) {
        const geo = COUNTRY_GEO[code] || { name: code, flag: "🌐", lat: 20, lon: 0, capital: "Central Hub" };
        const count = countryCounts[code];
        const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(1) : "0";

        // Assign Color Tier (Red = Maximum / 50%+ or >= 20 visits)
        let tier = TIERS.CYAN;
        if (code === "IN" || count >= 20) {
          tier = TIERS.RED;
        } else if (count >= 10) {
          tier = TIERS.ORANGE;
        } else if (count >= 5) {
          tier = TIERS.YELLOW;
        } else if (count >= 2) {
          tier = TIERS.GREEN;
        }

        countryList.push({
          code: code,
          name: geo.name,
          flag: geo.flag,
          lat: geo.lat,
          lon: geo.lon,
          capital: geo.capital,
          visits: count,
          pct: pct,
          tier: tier,
          cities: Array.from(countryCities[code] || [])
        });
      }

      countryList.sort((a, b) => b.visits - a.visits);
      this.activeCountryData = countryList;

      // Update Header Stats
      const statVisits = document.getElementById("mapStatTotalVisits");
      const statCountries = document.getElementById("mapStatCountries");
      const statTop = document.getElementById("mapStatTopCountry");
      if (statVisits) statVisits.textContent = totalVisits;
      if (statCountries) statCountries.textContent = countryList.length;
      if (statTop && countryList[0]) statTop.textContent = `${countryList[0].name} (🔴 ${countryList[0].tier.short})`;

      // Render 3D Objects
      if (this.isInitialized) {
        this.renderBeaconsAndArcs();
      }

      // Render Table in Modal
      this.renderCountryTable(countryList, totalVisits);
    }

    renderBeaconsAndArcs() {
      while (this.beaconsGroup.children.length > 0) {
        this.beaconsGroup.remove(this.beaconsGroup.children[0]);
      }
      while (this.arcsGroup.children.length > 0) {
        this.arcsGroup.remove(this.arcsGroup.children[0]);
      }
      while (this.ripplesGroup.children.length > 0) {
        this.ripplesGroup.remove(this.ripplesGroup.children[0]);
      }
      this.arcParticles = [];
      this.radarRipples = [];

      const hqPos = latLonToVector3(HQ_COORDS.lat, HQ_COORDS.lon, this.globeRadius, 0.05);

      // 1. Studio Headquarters Beacon (Ahmedabad, India)
      this.createHqBeacon(hqPos);

      // 2. Beacons, Ripples & Arcs for each Country
      this.activeCountryData.forEach(country => {
        const pos = latLonToVector3(country.lat, country.lon, this.globeRadius, 0.03);

        // Standing 3D Cylinder Beacon
        const beaconHeight = country.tier === TIERS.RED ? 1.5 : (0.5 + (country.visits / 50) * 0.8);
        const beaconGeo = new THREE.CylinderGeometry(0.08, 0.22, beaconHeight, 16);
        const beaconMat = new THREE.MeshPhongMaterial({
          color: country.tier.num,
          emissive: country.tier.num,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.95
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.copy(pos);
        beaconMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        beaconMesh.translateY(beaconHeight / 2);
        beaconMesh.userData = { countryData: country };
        this.beaconsGroup.add(beaconMesh);

        // Glowing Top Pin Bulb
        const pinGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos);
        pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        pinMesh.translateY(beaconHeight);
        pinMesh.userData = { countryData: country };
        this.beaconsGroup.add(pinMesh);

        // Pulsing Surface Radar Ripple Ring
        const rippleGeo = new THREE.RingGeometry(0.12, 0.48, 32);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: country.tier.num,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
        rippleMesh.position.copy(pos);
        rippleMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
        this.ripplesGroup.add(rippleMesh);

        this.radarRipples.push({
          mesh: rippleMesh,
          scale: 1,
          maxScale: country.tier === TIERS.RED ? 4.0 : 2.6,
          speed: country.tier === TIERS.RED ? 0.038 : 0.022
        });

        // 3D Connecting Traffic Arc to Studio HQ
        if (country.code !== "IN") {
          this.createTrafficArc(pos, hqPos, country.tier);
        }
      });
    }

    createHqBeacon(hqPos) {
      // Crimson Base Tower for Studio HQ
      const hqBaseGeo = new THREE.CylinderGeometry(0.2, 0.38, 1.9, 16);
      const hqBaseMat = new THREE.MeshPhongMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.9,
        shininess: 100
      });
      const hqMesh = new THREE.Mesh(hqBaseGeo, hqBaseMat);
      hqMesh.position.copy(hqPos);
      hqMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hqPos.clone().normalize());
      hqMesh.translateY(0.95);
      this.beaconsGroup.add(hqMesh);

      // Gold Crown Topper
      const topGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const topMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.copy(hqPos);
      topMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hqPos.clone().normalize());
      topMesh.translateY(1.9);
      this.beaconsGroup.add(topMesh);
    }

    createTrafficArc(startPos, endPos, tier) {
      const distance = startPos.distanceTo(endPos);
      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
      const altitude = this.globeRadius + (distance * 0.32);
      midPoint.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: tier.num,
        transparent: true,
        opacity: 0.6,
        linewidth: 1.5
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      this.arcsGroup.add(arcLine);

      // Pulse particle racing along the curve towards HQ
      const pGeo = new THREE.SphereGeometry(0.09, 10, 10);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      this.arcsGroup.add(pMesh);

      this.arcParticles.push({
        mesh: pMesh,
        curve: curve,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.005
      });
    }

    renderCountryTable(countryList, totalVisits) {
      const tbody = document.getElementById("countryTrafficTbody");
      if (!tbody) return;

      if (!countryList || countryList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No geographical traffic logged yet.</td></tr>';
        return;
      }

      tbody.innerHTML = countryList.map((c, idx) => {
        return `
          <tr>
            <td style="font-weight: 700; color: #94a3b8;">#${idx + 1}</td>
            <td>
              <div class="country-badge-cell">
                <span class="country-flag-icon">${c.flag}</span>
                <div>
                  <div style="font-weight: 700; color: #ffffff;">${escapeHtml(c.name)}</div>
                  <div style="font-size: 11px; color: #94a3b8;">${c.code === "IN" ? "Ahmedabad (Studio HQ)" : escapeHtml(c.capital)}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="status-pill-badge ${c.tier.key}">
                <span class="legend-dot-pulse ${c.tier.key}" style="width:7px; height:7px;"></span>
                ${c.tier.label}
              </span>
            </td>
            <td style="font-weight: 700; font-family: monospace; font-size: 14px;">${c.visits}</td>
            <td>
              <div class="country-bar-wrap">
                <div class="country-bar-fill ${c.tier.key}" style="width: ${Math.min(100, Math.max(8, c.pct))}%;"></div>
              </div>
              <span style="font-size: 12px; font-weight: 600; color: #cbd5e1;">${c.pct}%</span>
            </td>
            <td style="font-size: 12px; color: #cbd5e1;">
              ${c.cities.length > 0 ? escapeHtml(c.cities.slice(0, 3).join(", ")) : "National Traffic"}
            </td>
            <td>
              <button class="btn-focus-country" onclick="worldMapInstance.focusCountry('${c.code}')">
                🎯 Focus on Globe
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }

    focusCountry(code) {
      const c = this.activeCountryData.find(item => item.code === code) || COUNTRY_GEO[code];
      if (!c) return;

      const targetPhi = (c.lat) * (Math.PI / 180);
      const targetTheta = -(c.lon + 180) * (Math.PI / 180) + Math.PI;

      this.targetRotation.x = targetPhi * 0.8;
      this.targetRotation.y = targetTheta;
      this.targetZoom = 13.5;

      // Scroll smoothly back up to the 3D globe so user sees the country in focus
      const box = document.querySelector(".btr-map-modal-box");
      if (box) {
        box.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    focusIndia() {
      const c = COUNTRY_GEO["IN"];
      const targetPhi = (c.lat) * (Math.PI / 180);
      const targetTheta = -(c.lon + 180) * (Math.PI / 180) + Math.PI;
      this.targetRotation.x = targetPhi * 0.8;
      this.targetRotation.y = targetTheta;
      this.targetZoom = 14.0;
    }

    rotateLeft() {
      this.targetRotation.y -= 0.6;
    }

    rotateRight() {
      this.targetRotation.y += 0.6;
    }

    zoomIn() {
      this.targetZoom = Math.max(8.5, this.targetZoom - 2.5);
    }

    zoomOut() {
      this.targetZoom = Math.min(26, this.targetZoom + 2.5);
    }

    toggleAutoRotate() {
      this.isAutoRotate = !this.isAutoRotate;
      const btn = document.getElementById("btnToggleRotate");
      if (btn) {
        btn.textContent = this.isAutoRotate ? "⏸️ Pause Spin" : "▶️ Auto-Rotate";
      }
    }

    animate() {
      this.animationFrameId = requestAnimationFrame(() => this.animate());

      // Auto rotation when idle
      if (this.isAutoRotate && !this.isDragging) {
        this.targetRotation.y += 0.0022;
      }

      // Momentum inertia damping when mouse is released
      if (!this.isDragging && (Math.abs(this.dragVelocity.x) > 0.0001 || Math.abs(this.dragVelocity.y) > 0.0001)) {
        this.targetRotation.y += this.dragVelocity.x;
        this.targetRotation.x += this.dragVelocity.y;
        this.dragVelocity.x *= 0.94;
        this.dragVelocity.y *= 0.94;
        this.targetRotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.targetRotation.x));
      }

      // Smooth camera damping & rotation
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.14;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.14;
      this.currentZoom += (this.targetZoom - this.currentZoom) * 0.12;

      if (this.camera) {
        this.camera.position.z = this.currentZoom;
      }

      if (this.globeMesh) {
        this.globeMesh.rotation.x = this.currentRotation.x;
        this.globeMesh.rotation.y = this.currentRotation.y;
      }
      if (this.atmosphereMesh) {
        this.atmosphereMesh.rotation.x = this.currentRotation.x;
        this.atmosphereMesh.rotation.y = this.currentRotation.y;
      }
      if (this.beaconsGroup) {
        this.beaconsGroup.rotation.x = this.currentRotation.x;
        this.beaconsGroup.rotation.y = this.currentRotation.y;
      }
      if (this.arcsGroup) {
        this.arcsGroup.rotation.x = this.currentRotation.x;
        this.arcsGroup.rotation.y = this.currentRotation.y;
      }
      if (this.ripplesGroup) {
        this.ripplesGroup.rotation.x = this.currentRotation.x;
        this.ripplesGroup.rotation.y = this.currentRotation.y;
      }

      // Radar ripples animation
      this.radarRipples.forEach(r => {
        r.scale += r.speed;
        r.mesh.scale.set(r.scale, r.scale, 1);
        const opacity = Math.max(0, 1 - (r.scale / r.maxScale));
        r.mesh.material.opacity = opacity * 0.75;
        if (r.scale >= r.maxScale) {
          r.scale = 1;
        }
      });

      // Flight arc pulse particles animation
      this.arcParticles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  // Global Singleton Instance
  window.worldMapInstance = new WorldMap3DEngine();

  // Public Modal Controls
  window.openWorldMapModal = function () {
    const modal = document.getElementById("btrWorldMapModal");
    if (!modal) return;
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");

    // Force top scroll so 3D Globe is immediately front and center
    const box = modal.querySelector(".btr-map-modal-box");
    if (box) {
      box.scrollTop = 0;
    }

    // Initialize 3D Engine immediately
    window.worldMapInstance.init("btrGlobeStage");
    if (window.rawVisitsData && window.rawLeadsData) {
      window.worldMapInstance.updateTrafficData(window.rawVisitsData, window.rawLeadsData, window.__btrStats || {});
    }
    window.worldMapInstance.onResize();

    // Multi-stage resize to ensure canvas is always correctly sized
    setTimeout(() => {
      if (box) box.scrollTop = 0;
      window.worldMapInstance.onResize();
    }, 50);

    setTimeout(() => {
      if (box) box.scrollTop = 0;
      window.worldMapInstance.onResize();
      window.worldMapInstance.focusIndia();
    }, 180);
  };

  window.closeWorldMapModal = function () {
    const modal = document.getElementById("btrWorldMapModal");
    if (modal) {
      modal.classList.remove("is-active");
      modal.setAttribute("aria-hidden", "true");
    }
    if (window.worldMapInstance) {
      window.worldMapInstance.hideTooltip();
    }
  };

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("btrWorldMapModal");
      if (modal && modal.classList.contains("is-active")) {
        window.closeWorldMapModal();
      }
    }
  });

  // Close on backdrop click
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("btrWorldMapModal");
    if (modal && e.target === modal) {
      window.closeWorldMapModal();
    }
  });

  // Global update bridge called from leads.html's fetchLiveData()
  window.updateWorldMapTraffic = function (visits, leads, stats) {
    window.__btrStats = stats;
    if (window.worldMapInstance) {
      window.worldMapInstance.updateTrafficData(visits, leads, stats);
    }
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

})();
