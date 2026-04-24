/* ========================================
   ROUTER.JS — Hash-based SPA Router
   ======================================== */

const Router = (() => {
  const routes = {
    'about':    'content/about.md',
    'writeups': 'content/writeups/index.md',
    'blogs':    'content/blogs/index.md',
    'certs':    'content/certs/index.md',
  };

  const defaultRoute = 'about';
  let currentRoute = null;
  let isFirstLoad = true;

  function getRouteInfo(hash) {
    const clean = hash.replace('#', '').replace(/^\//, '');
    if (!clean) return { key: defaultRoute, path: routes[defaultRoute] };

    // Check exact route match first
    if (routes[clean]) {
      return { key: clean, path: routes[clean] };
    }

    // Deep link: e.g. "writeups/htb-machine-name"
    const parts = clean.split('/');
    const section = parts[0];
    if (routes[section] && parts.length > 1) {
      const slug = parts.slice(1).join('/');
      return { key: section, path: `content/${section}/${slug}.md` };
    }

    return { key: defaultRoute, path: routes[defaultRoute] };
  }

  function updateActiveNav(routeKey) {
    // Desktop nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.route === routeKey);
    });
    // Mobile nav
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.classList.toggle('active', link.dataset.route === routeKey);
    });
  }

  async function navigate() {
    const { key, path } = getRouteInfo(window.location.hash);

    // Don't re-navigate to the same route
    if (currentRoute === window.location.hash && !isFirstLoad) return;
    currentRoute = window.location.hash;

    updateActiveNav(key);
    closeMobileMenu();

    if (isFirstLoad) {
      // First load: no transition, just render and reveal
      await Renderer.renderMarkdown(path);
      Transitions.initialReveal();
      isFirstLoad = false;
    } else {
      // Subsequent navigations: full katana wipe transition
      await Transitions.transition(async () => {
        await Renderer.renderMarkdown(path);
      });
    }

    // Update page title
    document.title = `${key.charAt(0).toUpperCase() + key.slice(1)} — 0x15`;
  }

  // --- Mobile Menu ---
  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // --- Initialize ---
  function init() {
    // Set default hash if none
    if (!window.location.hash) {
      window.location.hash = '#about';
    }

    initMobileMenu();

    window.addEventListener('hashchange', navigate);
    navigate(); // Initial load
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { navigate };
})();
