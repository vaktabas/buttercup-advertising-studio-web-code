/**
 * Buttercup Advertising Studio — Rocket Web Labs Style Footer Interactive Script
 * - GPU WebGL Shader renderer for floating 3D rotating sculpture with alpha matte
 * - Performance lifecycle (IntersectionObserver stops rendering when out of viewport)
 * - Smooth scroll-to-top button
 */
(function initRwlFooter() {
  'use strict';

  function setupSculpture() {
    var canvas = document.getElementById('rwlSculptureCanvas');
    var video = document.getElementById('rwlSculptureVideo');
    if (!canvas || !video) return;

    var gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
    });
    if (!gl) return;

    var vsSource = [
      'attribute vec2 position;',
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = position * 0.5 + 0.5;',
      '  gl_Position = vec4(position, 0.0, 1.0);',
      '}'
    ].join('\n');

    var fsSource = [
      'precision mediump float;',
      'varying vec2 vUv;',
      'uniform sampler2D uTexture;',
      'void main() {',
      '  // In WebGL flipped texture (UNPACK_FLIP_Y_WEBGL = true):',
      '  // Top half (y in [0.5, 1.0]) is RGB color',
      '  // Bottom half (y in [0.0, 0.5]) is Alpha matte',
      '  vec2 colorUv = vec2(vUv.x, vUv.y * 0.5 + 0.5);',
      '  vec2 alphaUv = vec2(vUv.x, vUv.y * 0.5);',
      '  vec4 col = texture2D(uTexture, colorUv);',
      '  float alpha = texture2D(uTexture, alphaUv).r;',
      '  gl_FragColor = vec4(col.rgb, alpha);',
      '}'
    ].join('\n');

    function createShader(glCtx, type, src) {
      var s = glCtx.createShader(type);
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    var posAttr = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var isVisible = false;
    var footerEl = document.querySelector('.rwl-footer') || canvas.parentElement;

    if ('IntersectionObserver' in window && footerEl) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            video.play().catch(function() {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.02 });
      observer.observe(footerEl);
    } else {
      isVisible = true;
      video.play().catch(function() {});
    }

    function renderLoop() {
      if (isVisible && video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }

  function setupScrollTop() {
    var btn = document.getElementById('rwlScrollTopBtn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupSculpture();
      setupScrollTop();
    });
  } else {
    setupSculpture();
    setupScrollTop();
  }
})();

