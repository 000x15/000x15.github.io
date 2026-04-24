/* ========================================
   TRANSITIONS.JS — Page Transition Controller
   ======================================== */

const Transitions = (() => {
  const overlay = document.getElementById('transition-overlay');
  let isTransitioning = false;

  function sweepIn() {
    return new Promise((resolve) => {
      isTransitioning = true;
      overlay.classList.remove('sweep-out');
      // Reset transform-origin for sweep-in
      overlay.style.transformOrigin = 'left center';
      overlay.classList.add('sweep-in');
      overlay.addEventListener('animationend', function handler() {
        overlay.removeEventListener('animationend', handler);
        resolve();
      });
    });
  }

  function sweepOut() {
    return new Promise((resolve) => {
      overlay.classList.remove('sweep-in');
      // Change transform-origin for sweep-out reveal
      overlay.style.transformOrigin = 'right center';
      overlay.classList.add('sweep-out');
      overlay.addEventListener('animationend', function handler() {
        overlay.removeEventListener('animationend', handler);
        overlay.classList.remove('sweep-out');
        overlay.style.transformOrigin = '';
        isTransitioning = false;
        resolve();
      });
    });
  }

  function fadeOutContent() {
    const content = document.getElementById('page-content');
    content.classList.add('fade-out');
    content.classList.remove('animate-in');
  }

  function animateInContent() {
    const content = document.getElementById('page-content');
    content.classList.remove('fade-out');
    content.classList.add('animate-in');
  }

  async function transition(renderCallback) {
    if (isTransitioning) return;

    fadeOutContent();

    // Small delay for fade-out to register, then sweep in
    await new Promise(r => setTimeout(r, 80));
    await sweepIn();

    // Render new content while overlay covers the page
    await renderCallback();

    // Small pause at full coverage
    await new Promise(r => setTimeout(r, 60));

    // Sweep out and animate new content in
    animateInContent();
    await sweepOut();
  }

  // For initial page load — no sweep, just fade in
  function initialReveal() {
    const content = document.getElementById('page-content');
    content.classList.add('animate-in');
  }

  return { transition, initialReveal, isTransitioning: () => isTransitioning };
})();
