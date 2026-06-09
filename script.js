// ── Navigation ──────────────────────────────────────────────
function goTo(url) {
  window.location.href = url;
}

// ── Load SVG illustration and wire up interactions ───────────
const interactions = {
  'tree-research': { url: 'research.html',                              label: '🌳 Research' },
  'tree-cv':       { url: 'cv.html',                                    label: '📋 CV' },
  'tree-contact':  { url: 'contact.html',                               label: '✉️ Contact' },
  'bee-right':     { url: 'https://susanmfrye.shinyapps.io/shiny_app/', label: '🐝 Data Explorer' },
  'bee-left':      { url: 'https://susanmfrye.shinyapps.io/shiny_app/', label: '🐝 Data Explorer' },
  'bee-center':    { url: 'https://susanmfrye.shinyapps.io/shiny_app/', label: '🐝 Data Explorer' },
};

const tooltip  = document.getElementById('tooltip');
const container = document.getElementById('scene-container');

fetch('website_illustration.svg')
  .then(r => r.text())
  .then(svgText => {
    container.innerHTML = svgText;
    const svg = container.querySelector('svg');
    if (svg) {
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width  = '100%';
      svg.style.height = 'auto';
    }
    wireInteractions();
  })
  .catch(err => console.error('Could not load illustration:', err));

function wireInteractions() {
  Object.entries(interactions).forEach(([id, config]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add('clickable');
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', config.label);

    // Click
    el.addEventListener('click', () => goTo(config.url));

    // Keyboard
    el.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') goTo(config.url);
    });

    // Tooltip on hover
    el.addEventListener('mouseenter', e => {
      tooltip.textContent = config.label;
      tooltip.classList.remove('hidden');
      positionTooltip(e);
    });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  });
}

function positionTooltip(e) {
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left + 14;
  const y = e.clientY - rect.top  - 36;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}
