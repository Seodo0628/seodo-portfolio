// ===== UNSEEN STUDIO CLONE =====
// Main JavaScript functionality

(function() {
  'use strict';
  
  // DOM Elements
  const loader = document.querySelector('.js-loader');
  const enterBtn = document.querySelector('.js-enter-btn');
  const menuToggle = document.querySelector('.js-menu-toggle');
  const menu = document.querySelector('.js-menu');
  const menuItems = document.querySelectorAll('.js-menu-item');
  const cursor = document.querySelector('.js-cursor');
  const canvas = document.getElementById('webgl-canvas');
  
  const progressEl = document.querySelector('.js-loader-progress');
  const progressInnerEl = document.querySelector('.js-loader-progress-inner');
  const loaderBox = document.querySelector('.js-loader-box');
  const loaderInner = document.querySelector('.js-loader__inner');
  const eyesEl = document.querySelector('.js-eyes');
  
  // ===== SIMULATE LOADER PROGRESS (direct DOM manipulation) =====
  // This bypasses the need for the WordPress event system entirely
  function simulateLoaderProgress() {
    let percent = 0;
    const targetPercent = 100;
    const duration = 3000; // 3 seconds to load
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      percent = Math.min(targetPercent, Math.round((elapsed / duration) * targetPercent));
      
      // Update progress bar directly
      if (progressInnerEl) {
        // The progress inner translateY should be -(100 - percent)
        progressInnerEl.style.transform = `translateY(${-100 + percent}%)`;
      }
      
      if (percent < targetPercent) {
        requestAnimationFrame(animate);
      } else {
        // Loader complete - hide it
        hideLoader();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  function hideLoader() {
    // Animate loader out
    const tl = {
      set: (el, props) => {
        Object.assign(el.style, props);
      }
    };
    
    // Simple approach: fade out loader
    loader.style.transition = 'all 0.8s ease';
    loader.style.opacity = '0';
    loader.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 800);
  }
  
  // Start loader simulation
  simulateLoaderProgress();
  
  // ===== STATE =====
  let isEntered = false;
  let isMenuOpen = false;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  
  // ===== WEBGL PARTICLE BACKGROUND =====
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (gl) {
    initWebGL();
  }
  
  function initWebGL() {
    const vertexShaderSource = `
      attribute vec2 aPosition;
      attribute float aSize;
      attribute float aAlpha;
      uniform vec2 uResolution;
      uniform float uTime;
      varying float vAlpha;
      
      void main() {
        vec2 position = aPosition * 0.5 + 0.5;
        position.y = 1.0 - position.y;
        gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
        gl_PointSize = aSize * (uResolution.y / 800.0);
        vAlpha = aAlpha;
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      varying float vAlpha;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        float alpha = vAlpha * (1.0 - dist * 2.0);
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }
    `;
    
    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }
    
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    // Create particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 2);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 2] = Math.random() * 2 - 1;
      positions[i * 2 + 1] = Math.random() * 2 - 1;
      sizes[i] = Math.random() * 3 + 1;
      alphas[i] = Math.random() * 0.5 + 0.1;
    }
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    
    const alphaBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
    
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aSize = gl.getAttribLocation(program, 'aSize');
    const aAlpha = gl.getAttribLocation(program, 'aAlpha');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(aSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(aAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);
    
    // Animation
    let time = 0;
    function render() {
      time += 0.01;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      
      gl.drawArrays(gl.POINTS, 0, particleCount);
      
      requestAnimationFrame(render);
    }
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    render();
  }
  
  // ===== CUSTOM CURSOR =====
  function updateCursor() {
    // Smooth follow
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(updateCursor);
  }
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Hover effect on interactive elements
  const hoverElements = document.querySelectorAll('a, button, .project-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
  
  // ===== ENTER BUTTON =====
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      isEntered = true;
      
      // Animate loader out
      loader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      loader.style.opacity = '0';
      loader.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 800);
    });
  }
  
  // ===== MOBILE MENU =====
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      menu.classList.toggle('is-open', isMenuOpen);
      
      // Change hamburger to X
      const circles = menuToggle.querySelectorAll('circle');
      if (isMenuOpen) {
        circles[0].setAttribute('cx', '7');
        circles[1].setAttribute('cx', '7');
        circles[0].setAttribute('cy', '2.5');
        circles[1].setAttribute('cy', '2.5');
      } else {
        circles[0].setAttribute('cx', '2.4');
        circles[1].setAttribute('cx', '11.6');
        circles[0].setAttribute('cy', '2.4');
        circles[1].setAttribute('cy', '2.4');
      }
    });
    
    // Close menu on link click
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        isMenuOpen = false;
        menu.classList.remove('is-open');
        const circles = menuToggle.querySelectorAll('circle');
        circles[0].setAttribute('cx', '2.4');
        circles[1].setAttribute('cx', '11.6');
      });
    });
  }
  
  // ===== START CURSOR ANIMATION =====
  updateCursor();
  
  // ===== SCROLL EFFECTS =====
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.pageYOffset;
    
    // Parallax for particles
    if (gl) {
      // Can add parallax offset here
    }
  });
  
  // ===== TEXT REVEAL ANIMATION =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.project-card, .hero-title, .section-title').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });
  
})();
