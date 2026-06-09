// Navigate to page
function goTo(url) {
  window.location.href = url;
}

// Hover tooltips
const tooltips = {
  'tree-research':  '🌳 My Research',
  'bee-shiny':      '🐝 Interactive Data Explorer',
  'notebook-cv':    '📋 Curriculum Vitae',
  'sign-contact':   '✉️ Get in Touch'
};

const items = document.querySelectorAll('.scene-item');
items.forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.filter = 'brightness(1.08) drop-shadow(0 6px 12px rgba(0,0,0,0.18))';
  });
  el.addEventListener('mouseleave', () => {
    el.style.filter = '';
  });
  // Keyboard support
  el.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') el.click();
  });
});
