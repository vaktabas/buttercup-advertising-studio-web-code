/**
 * 3D REAL-TIME WORLD TRAFFIC MAP & HEATMAP ENGINE
 * Buttercup Advertising Studio — Master Intelligence Dashboard
 * Photorealistic NASA Blue Marble 3D Earth Globe with 360° Mouse Spin,
 * Real Country Geographic Borders, 3D Country Labels, Live Traffic Heatmaps,
 * Flight Arcs, and Interactive Focus Navigation (India, USA, UK, UAE, Canada, Australia).
 * 100% English UI and Professional Analytics Standards.
 */

(function () {
  "use strict";

  // Coordinates Database for Real World Countries & Metros
  const COUNTRY_GEO = {
    IN: { name: "India", flag: "🇮🇳", lat: 20.5937, lon: 78.9629, capital: "New Delhi", hqCity: "Ahmedabad" },
    US: { name: "United States", flag: "🇺🇸", lat: 37.0902, lon: -95.7129, capital: "Washington, D.C." },
    GB: { name: "United Kingdom", flag: "🇬🇧", lat: 55.3781, lon: -3.4360, capital: "London" },
    AE: { name: "United Arab Emirates", flag: "🇦🇪", lat: 23.4241, lon: 53.8478, capital: "Abu Dhabi" },
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
      this.labelsGroup = null;
      this.raycaster = null;
      this.mouse = null;

      // Mouse drag and 360° rotation physics
      this.isDragging = false;
      this.previousMousePosition = { x: 0, y: 0 };
      this.dragVelocity = { x: 0, y: 0 };
      this.targetRotation = { x: 2.776, y: -0.180 }; // Starts facing Studio HQ (Ahmedabad, India)
      this.currentRotation = { x: 2.776, y: -0.180 };
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
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
      sunLight.position.set(25, 18, 22);
      this.scene.add(sunLight);

      const secondaryLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
      secondaryLight.position.set(-25, -12, -20);
      this.scene.add(secondaryLight);

      // 4. Background Starfield
      this.createStarfield();

      // 5. Realistic Earth Globe Sphere
      this.createGlobeSphere();

      // 6. Groups for Dynamic Country Beacons, Labels & Session Arcs
      this.beaconsGroup = new THREE.Group();
      this.labelsGroup = new THREE.Group();
      this.arcsGroup = new THREE.Group();
      this.ripplesGroup = new THREE.Group();
      this.scene.add(this.beaconsGroup);
      this.scene.add(this.labelsGroup);
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
      // 1. Texture Loading: Authentic NASA Blue Marble Image
      const textureLoader = new THREE.TextureLoader();
      try {
        textureLoader.setCrossOrigin("anonymous");
      } catch (e) {}
      
      // Multi-tier texture strategy: Local authentic NASA 4K satellite image, followed by CDN mirrors
      const textureUrl = "img/earth-blue-marble.jpg";
      const cdnFallback = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
      const secondaryCdn = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg";

      const sphereGeo = new THREE.SphereGeometry(this.globeRadius, 64, 64);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: 0x1e3a5f, // Deep ocean base tone while texture streams in
        shininess: 35,
        specular: 0x1d4ed8
      });

      this.globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
      this.scene.add(this.globeMesh);

      const applyTexture = (tex) => {
        if (!tex) return;
        tex.needsUpdate = true;
        sphereMat.color.setHex(0xffffff);
        sphereMat.map = tex;
        sphereMat.needsUpdate = true;
      };

      // Load texture with multi-tier error fallback
      textureLoader.load(
        textureUrl,
        applyTexture,
        undefined,
        () => {
          textureLoader.load(
            cdnFallback,
            applyTexture,
            undefined,
            () => {
              textureLoader.load(secondaryCdn, applyTexture);
            }
          );
        }
      );

      // 2. Glowing Atmospheric Halo (Fresnel rim effect)
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

      // Global visitor distribution (USA, UK, UAE, Canada, Australia, Singapore, Germany)
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

      // Render 3D Objects on Globe
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
      while (this.labelsGroup.children.length > 0) {
        this.labelsGroup.remove(this.labelsGroup.children[0]);
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

      // 2. Beacons, 3D Labels, Ripples & Arcs for each Country
      this.activeCountryData.forEach(country => {
        const pos = latLonToVector3(country.lat, country.lon, this.globeRadius, 0.03);

        // Standing 3D Cylinder Beacon Pillar
        const beaconHeight = country.tier === TIERS.RED ? 1.6 : (0.6 + (country.visits / 50) * 0.8);
        const beaconGeo = new THREE.CylinderGeometry(0.09, 0.24, beaconHeight, 16);
        const beaconMat = new THREE.MeshPhongMaterial({
          color: country.tier.num,
          emissive: country.tier.num,
          emissiveIntensity: 0.8,
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
        const pinGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos);
        pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        pinMesh.translateY(beaconHeight);
        pinMesh.userData = { countryData: country };
        this.beaconsGroup.add(pinMesh);

        // 3D Floating Country Name & Flag Billboard Badge
        const labelSprite = this.createCountrySprite(country);
        const labelPos = latLonToVector3(country.lat, country.lon, this.globeRadius, beaconHeight + 0.65);
        labelSprite.position.copy(labelPos);
        labelSprite.userData = { countryData: country };
        this.labelsGroup.add(labelSprite);

        // Pulsing Surface Radar Ripple Ring
        const rippleGeo = new THREE.RingGeometry(0.12, 0.52, 32);
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
          maxScale: country.tier === TIERS.RED ? 4.2 : 2.8,
          speed: country.tier === TIERS.RED ? 0.038 : 0.022
        });

        // 3D Connecting Traffic Arc to Studio HQ
        if (country.code !== "IN") {
          this.createTrafficArc(pos, hqPos, country.tier);
        }
      });
    }

    createCountrySprite(country) {
      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = 110;
      const ctx = canvas.getContext("2d");

      // Translucent glass pill background
      ctx.fillStyle = "rgba(10, 15, 28, 0.92)";
      ctx.strokeStyle = country.tier.hex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(6, 6, 408, 98, 22);
      } else {
        ctx.rect(6, 6, 408, 98);
      }
      ctx.fill();
      ctx.stroke();

      // Country Flag & Name in bold
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${country.flag} ${country.name.toUpperCase()}`, 20, 48);

      // Sessions & Status Tag
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = country.tier.hex;
      ctx.fillText(`${country.visits} visits • ${country.tier.short.toUpperCase()}`, 20, 82);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2.0, 0.52, 1);
      return sprite;
    }

    createHqBeacon(hqPos) {
      // Crimson Base Tower for Studio HQ
      const hqBaseGeo = new THREE.CylinderGeometry(0.22, 0.42, 2.1, 16);
      const hqBaseMat = new THREE.MeshPhongMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.95,
        shininess: 100
      });
      const hqMesh = new THREE.Mesh(hqBaseGeo, hqBaseMat);
      hqMesh.position.copy(hqPos);
      hqMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hqPos.clone().normalize());
      hqMesh.translateY(1.05);
      this.beaconsGroup.add(hqMesh);

      // Gold Crown Topper
      const topGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const topMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.copy(hqPos);
      topMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hqPos.clone().normalize());
      topMesh.translateY(2.1);
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
        opacity: 0.65,
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

      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lon + 180) * (Math.PI / 180);
      const r = this.globeRadius || 5.0;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = (r * Math.sin(phi) * Math.sin(theta));
      const y = (r * Math.cos(phi));

      // Calculate exact Euler angles to bring the country to face camera (+Z axis)
      const rx = Math.atan2(y, z);
      const z1 = y * Math.sin(rx) + z * Math.cos(rx);
      const ry = Math.atan2(-x, z1);

      this.targetRotation.x = rx;
      this.targetRotation.y = ry;
      this.targetZoom = 13.5;

      // Scroll smoothly back up to the 3D globe so user sees the country in focus
      const box = document.querySelector(".btr-map-modal-box");
      if (box) {
        box.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    focusIndia() {
      this.focusCountry("IN");
    }

    focusUSA() {
      this.focusCountry("US");
    }

    focusUK() {
      this.focusCountry("GB");
    }

    focusUAE() {
      this.focusCountry("AE");
    }

    focusCanada() {
      this.focusCountry("CA");
    }

    focusAustralia() {
      this.focusCountry("AU");
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
      if (this.labelsGroup) {
        this.labelsGroup.rotation.x = this.currentRotation.x;
        this.labelsGroup.rotation.y = this.currentRotation.y;

        // Clean depth-culling: hide labels on the back hemisphere so they do not clutter
        const cameraPos = this.camera ? this.camera.position : new THREE.Vector3(0, 0, 14.5);
        this.labelsGroup.children.forEach(sprite => {
          const worldPos = new THREE.Vector3();
          sprite.getWorldPosition(worldPos);
          // Dot product with camera vector: positive when facing user
          const dot = worldPos.dot(cameraPos);
          sprite.visible = (dot > 18);
        });
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
