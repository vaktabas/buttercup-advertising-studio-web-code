/**
 * Otsuka-Air.jp Signature Preloader Animation System
 * Features:
 * - Exact visual structure, textures, and typography progress
 * - Volumetric Glowing Green-White Energy Light Burst (WebGL shader with Canvas 2D fallback)
 * - Floating spark particles matching Otsuka Air particleLight
 * - Super-bloom expansion burst on reveal as in Otsuka-Air
 */

(function () {
  'use strict';

  function initOtsukaLoader() {
    const loader = document.getElementById('otsukaLoader');
    if (!loader) return;

    // Lock scrolling on entry
    document.body.classList.add('loading-locked');

    const logoWhite = loader.querySelector('.logo-white');
    const logoGray = loader.querySelector('.logo-gray');
    const logoOtsuka = loader.querySelector('.logo-otsuka');
    const introImgsContainer = loader.querySelector('.intro-imgs');
    const imgWraps = Array.from(loader.querySelectorAll('.intro-imgs .img-wrap'));
    const canvas = document.getElementById('loaderGlowCanvas');

    if (!imgWraps.length || !logoWhite) return;

    // =========================================================================
    // 1. VOLUMETRIC GREEN-WHITE ENERGY LIGHT BURST (WebGL + Canvas 2D Engine)
    // =========================================================================
    let glowController = null;

    if (canvas) {
      glowController = (function setupGlow(c) {
        let gl = null;
        try {
          gl = c.getContext('webgl', { alpha: true, antialias: true }) ||
               c.getContext('experimental-webgl', { alpha: true, antialias: true });
        } catch (e) {
          gl = null;
        }

        let isRunning = true;
        let progress = 0;
        let burst = 0;
        let startTime = performance.now();

        // Particles
        const particleCount = 38;
        const particles = [];
        function initParticles(w, h) {
          particles.length = 0;
          for (let i = 0; i < particleCount; i++) {
            particles.push({
              x: (Math.random() - 0.5) * w * 0.6 + w * 0.5,
              y: (Math.random() - 0.5) * h * 0.6 + h * 0.5,
              vx: (Math.random() - 0.5) * 0.35,
              vy: (Math.random() - 0.5) * 0.35 - 0.15,
              size: Math.random() * 2.8 + 1.2,
              baseOpacity: Math.random() * 0.55 + 0.3,
              blinkSpeed: Math.random() * 2.5 + 1.5,
              phase: Math.random() * Math.PI * 2,
              color: Math.random() > 0.4 ? '#ffffff' : '#00A852'
            });
          }
        }

        function resizeCanvas() {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = window.innerWidth;
          const h = window.innerHeight;
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
          c.style.width = w + 'px';
          c.style.height = h + 'px';
          if (gl) {
            gl.viewport(0, 0, c.width, c.height);
          }
          initParticles(w, h);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Shader setup if WebGL available
        let program = null;
        let uResLoc, uTimeLoc, uProgLoc, uBurstLoc;

        if (gl) {
          const vsSource = `
            attribute vec2 aPosition;
            varying vec2 vUv;
            void main() {
              vUv = (aPosition + 1.0) * 0.5;
              gl_Position = vec4(aPosition, 0.0, 1.0);
            }
          `;

          const fsSource = `
            precision highp float;
            varying vec2 vUv;
            uniform vec2 uResolution;
            uniform float uTime;
            uniform float uProgress;
            uniform float uBurst;

            void main() {
              vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
              
              // Organic center drift
              vec2 centerDrift = vec2(sin(uTime * 0.65) * 0.015, cos(uTime * 0.75) * 0.015);
              p -= centerDrift;
              
              float dist = length(p);
              float angle = atan(p.y, p.x);
              
              // Growth with loading progress and burst
              float burstExp = 1.0 + uBurst * 3.4;
              float baseR = (0.23 + uProgress * 0.14) * burstExp;
              
              // 4 Organic diagonal lobes (top-left, top-right, bottom-left, bottom-right)
              float lobeRot = uTime * 0.32;
              float lobe1 = sin(angle * 4.0 - 0.785 + lobeRot) * 0.058;
              float lobe2 = cos(angle * 3.0 + uTime * 0.45) * 0.038;
              float lobe3 = sin(angle * 6.0 - uTime * 0.7) * 0.024;
              float organicR = baseR + lobe1 + lobe2 + lobe3;
              
              // Volumetric diagonal light rays shooting outward
              float ray1 = pow(max(0.0, cos(angle * 4.0 - 0.785 + sin(uTime * 0.5) * 0.2)), 5.0) * exp(-dist * 2.2);
              float ray2 = pow(max(0.0, cos(angle * 3.0 + 1.1 + cos(uTime * 0.4) * 0.2)), 4.0) * exp(-dist * 2.6);
              float ray3 = pow(max(0.0, cos(angle * 8.0 - uTime * 0.6)), 6.0) * exp(-dist * 3.4);
              float rays = (ray1 * 0.75 + ray2 * 0.5 + ray3 * 0.35) * (1.0 + uBurst * 2.0);
              
              // Radial falloff layers
              float dNorm = dist / organicR;
              
              // Blazing pure white core
              float coreSharp = smoothstep(0.72, 0.0, dNorm);
              float coreBloom = exp(-pow(dist / (baseR * 0.68), 2.0));
              float whiteIntensity = clamp(coreSharp * 1.35 + coreBloom * 0.95, 0.0, 1.0);
              
              // Emerald green corona (#00E066 / #00FF88)
              float emeraldCorona = exp(-pow(dist / (baseR * 1.35), 1.9));
              
              // Deep volumetric green halo (#00A852)
              float greenHalo = exp(-pow(dist / (baseR * 2.4), 1.5));
              
              // Outer space glow
              float outerGlow = exp(-pow(dist / (baseR * 4.0), 1.2));
              
              vec3 colDeepGreen = vec3(0.0, 0.658, 0.322); // #00A852
              vec3 colNeonGreen = vec3(0.05, 0.98, 0.48); // #0dfa7a
              vec3 colWhite = vec3(1.0, 1.0, 1.0);
              
              // Composite light layers
              vec3 col = vec3(0.0);
              col += colDeepGreen * (outerGlow * 0.35 + greenHalo * 0.55 + rays * 0.65);
              col += colNeonGreen * (emeraldCorona * 0.95 + rays * 0.35);
              col = mix(col, colWhite, whiteIntensity);
              
              // Outro burst flash: white bloom expansion
              if (uBurst > 0.0) {
                col = mix(col, colWhite, clamp(uBurst * 0.85, 0.0, 1.0));
              }
              
              float fadeIn = clamp(uProgress * 4.0, 0.0, 1.0);
              float alpha = clamp(whiteIntensity + emeraldCorona * 0.9 + greenHalo * 0.6 + outerGlow * 0.3 + rays * 0.5, 0.0, 1.0) * fadeIn;
              
              gl_FragColor = vec4(col * alpha, alpha);
            }
          `;

          function createShader(type, src) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              console.warn(gl.getShaderInfoLog(shader));
              return null;
            }
            return shader;
          }

          const vs = createShader(gl.VERTEX_SHADER, vsSource);
          const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
          if (vs && fs) {
            program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);

            const posBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              -1, -1,
               1, -1,
              -1,  1,
              -1,  1,
               1, -1,
               1,  1
            ]), gl.STATIC_DRAW);

            const aPosLoc = gl.getAttribLocation(program, 'aPosition');
            gl.enableVertexAttribArray(aPosLoc);
            gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

            uResLoc = gl.getUniformLocation(program, 'uResolution');
            uTimeLoc = gl.getUniformLocation(program, 'uTime');
            uProgLoc = gl.getUniformLocation(program, 'uProgress');
            uBurstLoc = gl.getUniformLocation(program, 'uBurst');
          }
        }

        // Render Loop
        function render(now) {
          if (!isRunning) return;
          const t = (now - startTime) / 1000;

          if (gl && program) {
            gl.useProgram(program);
            gl.uniform2f(uResLoc, c.width, c.height);
            gl.uniform1f(uTimeLoc, t);
            gl.uniform1f(uProgLoc, progress);
            gl.uniform1f(uBurstLoc, burst);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          } else {
            // 2D Canvas Fallback
            const ctx = c.getContext('2d');
            if (ctx) {
              const w = window.innerWidth;
              const h = window.innerHeight;
              ctx.clearRect(0, 0, c.width, c.height);
              ctx.save();
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              ctx.scale(dpr, dpr);

              const cx = w * 0.5 + Math.sin(t * 0.7) * 8;
              const cy = h * 0.5 + Math.cos(t * 0.8) * 8;
              const burstScale = 1.0 + burst * 2.8;
              const baseR = (Math.min(w, h) * (0.2 + progress * 0.12)) * burstScale;

              ctx.globalCompositeOperation = 'lighter';

              // Deep green outer aura
              const gOuter = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.6);
              gOuter.addColorStop(0, 'rgba(0, 168, 82, 0.45)');
              gOuter.addColorStop(0.5, 'rgba(0, 168, 82, 0.18)');
              gOuter.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = gOuter;
              ctx.beginPath();
              ctx.arc(cx, cy, baseR * 2.6, 0, Math.PI * 2);
              ctx.fill();

              // Emerald green corona
              const gCorona = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.3);
              gCorona.addColorStop(0, 'rgba(13, 250, 122, 0.8)');
              gCorona.addColorStop(0.7, 'rgba(0, 168, 82, 0.35)');
              gCorona.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = gCorona;
              ctx.beginPath();
              ctx.arc(cx, cy, baseR * 1.3, 0, Math.PI * 2);
              ctx.fill();

              // Blazing pure white core
              const gWhite = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.7);
              gWhite.addColorStop(0, 'rgba(255, 255, 255, 1)');
              gWhite.addColorStop(0.65, 'rgba(255, 255, 255, 0.95)');
              gWhite.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = gWhite;
              ctx.beginPath();
              ctx.arc(cx, cy, baseR * 0.7, 0, Math.PI * 2);
              ctx.fill();

              // Floating spark particles
              particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < 0) p.y = h;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                const op = p.baseOpacity * (0.6 + 0.4 * Math.sin(t * p.blinkSpeed + p.phase));
                ctx.fillStyle = p.color === '#ffffff' ? `rgba(255,255,255,${op})` : `rgba(0,168,82,${op})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
              });

              ctx.restore();
            }
          }

          requestAnimationFrame(render);
        }

        requestAnimationFrame(render);

        return {
          setProgress(p) { progress = p; },
          setBurst(b) { burst = b; },
          destroy() {
            isRunning = false;
            window.removeEventListener('resize', resizeCanvas);
          }
        };
      })(canvas);
    }

    // =========================================================================
    // 2. SCATTER 5 TEXTURE IMAGES WITHOUT OVERLAP
    // =========================================================================
    function placeImagesNoOverlap(elements) {
      const placed = [];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const padding = 20;
      const minDistance = vw <= 768 ? 130 : 210;

      elements.forEach(el => {
        const halfW = el.offsetWidth / 2 || (Math.min(vw, vh) * 0.48) / 2;
        const halfH = el.offsetHeight / 2 || (Math.min(vw, vh) * 0.48) / 2;
        const minX = halfW + padding;
        const maxX = vw - halfW - padding;
        const minY = halfH + padding + (vh > 700 ? 50 : 25);
        const maxY = vh - halfH - padding - (vh * 0.22);

        let x = vw / 2;
        let y = vh / 2;
        let attempts = 0;
        const maxAttempts = 120;

        if (maxX > minX && maxY > minY) {
          do {
            x = Math.random() * (maxX - minX) + minX;
            y = Math.random() * (maxY - minY) + minY;
            attempts++;
          } while (
            placed.some(p => Math.hypot(p.x - x, p.y - y) < minDistance) &&
            attempts < maxAttempts
          );
        }

        placed.push({ x, y });
        el.style.left = Math.round(x) + 'px';
        el.style.top = Math.round(y) + 'px';
        el.style.transform = 'translate(-50%, -50%)';
      });
    }

    placeImagesNoOverlap(imgWraps);

    // Initial state: hidden with clip-path
    if (window.gsap) {
      gsap.set(imgWraps, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
    }

    let isDone = false;

    // =========================================================================
    // 3. PLAY SEQUENTIAL IMAGE REVEAL IN SYNC WITH PROGRESS
    // =========================================================================
    const revealed = [false, false, false, false, false];
    function triggerImage(index) {
      if (revealed[index] || !imgWraps[index]) return;
      revealed[index] = true;
      const el = imgWraps[index];
      el.classList.add('is-on');
      if (window.gsap) {
        gsap.to(el, {
          clipPath: 'inset(0 0 0 0)',
          duration: 0.42,
          ease: 'power2.out'
        });
      } else {
        el.style.clipPath = 'inset(0 0 0 0)';
      }
    }

    // =========================================================================
    // 4. PROGRESS TIMELINE (0 to 1 over 2.4 seconds)
    // =========================================================================
    const progressObj = { p: 0 };
    let progressTween = null;

    if (window.gsap) {
      progressTween = gsap.to(progressObj, {
        p: 1,
        duration: 2.4,
        ease: 'power1.inOut',
        onUpdate: function () {
          const p = progressObj.p;
          logoWhite.style.opacity = p;
          loader.style.setProperty('--p', p);
          if (glowController) glowController.setProgress(p);

          if (p >= 0.05) triggerImage(0);
          if (p >= 0.25) triggerImage(1);
          if (p >= 0.48) triggerImage(2);
          if (p >= 0.68) triggerImage(3);
          if (p >= 0.88) triggerImage(4);
        },
        onComplete: function () {
          completeLoader();
        }
      });
    } else {
      let start = performance.now();
      function raf(now) {
        let elapsed = (now - start) / 2400;
        let p = Math.min(1, elapsed);
        logoWhite.style.opacity = p;
        if (glowController) glowController.setProgress(p);
        if (p >= 0.05) triggerImage(0);
        if (p >= 0.25) triggerImage(1);
        if (p >= 0.48) triggerImage(2);
        if (p >= 0.68) triggerImage(3);
        if (p >= 0.88) triggerImage(4);
        if (p < 1) requestAnimationFrame(raf);
        else completeLoader();
      }
      requestAnimationFrame(raf);
    }

    // =========================================================================
    // 5. OUTRO & SUPER-BLOOM EXPANSION BURST REVEAL
    // =========================================================================
    function completeLoader() {
      if (isDone) return;
      isDone = true;

      for (let i = 0; i < 5; i++) triggerImage(i);
      logoWhite.style.opacity = '1';
      if (glowController) glowController.setProgress(1);

      setTimeout(function () {
        if (window.gsap) {
          const tl = gsap.timeline({
            onComplete: function () {
              document.body.classList.remove('loading-locked');
              if (glowController) glowController.destroy();
              loader.remove();
              window.dispatchEvent(new CustomEvent('otsuka:loaderDone'));
            }
          });

          // 1. Super-bloom expansion burst (The radiant green-white flash)
          const burstObj = { b: 0 };
          tl.to(burstObj, {
            b: 1,
            duration: 0.55,
            ease: 'power2.inOut',
            onUpdate: function () {
              if (glowController) glowController.setBurst(burstObj.b);
            }
          }, 0);

          // 2. Images wipe upward
          tl.to(imgWraps, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.5,
            ease: 'power4.inOut',
            stagger: 0.08
          }, 0);

          // 3. Logo letters scale down slightly and fade out
          const paths = logoWhite.querySelectorAll('path');
          if (logoGray) logoGray.style.display = 'none';
          tl.to(paths, {
            opacity: 0,
            scale: 0.95,
            duration: 0.45,
            ease: 'power3.easeInOut',
            transformOrigin: 'center center',
            stagger: 0.04
          }, 0.15);

          // 4. Corner logo fade
          if (logoOtsuka) {
            tl.to(logoOtsuka, { opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0.1);
          }

          // 5. Main curtain wipes up revealing website
          tl.to(loader, {
            clipPath: 'inset(100% 0 0 0)',
            duration: 0.75,
            ease: 'power4.inOut'
          }, 0.45);
        } else {
          loader.style.transition = 'opacity 0.6s ease';
          loader.style.opacity = '0';
          setTimeout(function () {
            document.body.classList.remove('loading-locked');
            if (glowController) glowController.destroy();
            loader.remove();
          }, 600);
        }
      }, 350);
    }

    // Skip on click anywhere
    if (introImgsContainer) {
      introImgsContainer.addEventListener('click', function () {
        if (!isDone && progressTween) {
          progressTween.progress(0.96);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOtsukaLoader);
  } else {
    initOtsukaLoader();
  }
})();
