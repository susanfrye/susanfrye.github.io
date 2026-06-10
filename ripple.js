// ── Click ripple effect ─────────────────────────────────────
// Creates a small soft circle of color that expands and fades
// out from each click, in a pastel color. Skipped entirely for
// users who prefer reduced motion.
(function () {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  const colors = ['#c8e6c9', '#fff9c4', '#ffe0b2', '#f8bbd0', '#e1bee7', '#b3e5fc'];

  document.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
})();
