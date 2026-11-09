/* ── Shared atmosphere & interaction effects ─────────────────
   pollen particle field · scroll reveals · 3D card tilt ·
   header state · split-text headline · click pollen burst    */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Header scrolled state ── */
  const header = document.querySelector('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Split-text headline (words rise with stagger) ── */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const nodes = Array.from(el.childNodes);
    el.textContent = '';
    let i = 0;
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = word;
          inner.style.setProperty('--d', (0.08 * i++) + 's');
          w.appendChild(inner);
          el.appendChild(w);
          el.appendChild(document.createTextNode(' '));
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        inner.style.setProperty('--d', (0.08 * i++) + 's');
        inner.appendChild(node.cloneNode(true));
        w.appendChild(inner);
        el.appendChild(w);
        el.appendChild(document.createTextNode(' '));
      }
    });
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* ── 3D tilt on cards ── */
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      if (!card.querySelector('.glare')) {
        const g = document.createElement('div');
        g.className = 'glare';
        card.appendChild(g);
      }
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const rx = (0.5 - py) * 7;
          const ry = (px - 0.5) * 9;
          card.style.transform =
            'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Pollen / firefly particle field ── */
  const canvas = document.getElementById('pollen');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, particles;
    let mouseX = 0.5, mouseY = 0.5;
    const COLORS = [
      [245, 184, 65],   // honey
      [255, 217, 118],  // light honey
      [127, 216, 195],  // teal
      [243, 236, 218],  // cream
    ];

    function resize() {
      W = canvas.width = Math.floor(innerWidth * DPR);
      H = canvas.height = Math.floor(innerHeight * DPR);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }

    function makeParticles() {
      const count = Math.min(90, Math.floor(innerWidth / 16));
      particles = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75; // depth: far → near
        return {
          x: Math.random(),
          y: Math.random(),
          z,
          r: (0.8 + Math.random() * 1.8) * z,
          vx: (Math.random() - 0.5) * 0.00012,
          vy: -(0.00004 + Math.random() * 0.00012),
          tw: Math.random() * Math.PI * 2,
          tws: 0.004 + Math.random() * 0.012,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
      });
    }

    resize();
    makeParticles();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / innerWidth;
      mouseY = e.clientY / innerHeight;
    }, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) tick();
    });

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const parX = (mouseX - 0.5), parY = (mouseY - 0.5);
      for (const p of particles) {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        p.tw += p.tws;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const px = (p.x - parX * 0.035 * p.z) * W;
        const py = (p.y - parY * 0.035 * p.z) * H;
        const alpha = (0.25 + 0.45 * (0.5 + Math.sin(p.tw) / 2)) * p.z;
        const [r, g, b] = p.c;

        // soft glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.r * DPR * 6);
        grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.9) + ')');
        grad.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.25) + ')');
        grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.r * DPR * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Click pollen burst ── */
  if (!reduceMotion) {
    const BURST_COLORS = ['#f5b841', '#ffd976', '#7fd8c3', '#f3ecda'];
    document.addEventListener('click', (e) => {
      const n = 8;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'pollen-burst';
        const angle = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const dist = 26 + Math.random() * 34;
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.background = BURST_COLORS[i % BURST_COLORS.length];
        s.style.boxShadow = '0 0 8px ' + BURST_COLORS[i % BURST_COLORS.length];
        s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        s.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        document.body.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
      }
    });
  }
})();
