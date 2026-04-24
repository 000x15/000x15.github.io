/* ========================================
   RENDERER.JS — Fetch + Render Markdown via marked.js
   ======================================== */

const Renderer = (() => {
  // Configure marked.js
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
  });

  // Custom renderer to handle internal links
  const customRenderer = new marked.Renderer();

  // Convert relative markdown links to hash links
  customRenderer.link = function(href, title, text) {
    // Handle the newer marked.js API where href might be an object
    if (typeof href === 'object') {
      text = href.text || '';
      title = href.title || null;
      href = href.href || '';
    }

    // Convert relative links like "writeups/machine-name" to "#writeups/machine-name"
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      href = '#' + href;
    }
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr}>${text}</a>`;
  };

  marked.use({ renderer: customRenderer });

  const contentEl = document.getElementById('page-content');

  async function renderMarkdown(mdPath) {
    try {
      const res = await fetch(mdPath);

      if (!res.ok) {
        contentEl.innerHTML = renderError(res.status);
        return;
      }

      const text = await res.text();
      contentEl.innerHTML = marked.parse(text);

      // Run syntax highlighting on code blocks
      if (typeof hljs !== 'undefined') {
        contentEl.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }

      // Scroll to top on new page render
      window.scrollTo({ top: 0, behavior: 'instant' });

    } catch (err) {
      console.error('Render error:', err);
      contentEl.innerHTML = renderError('NETWORK');
    }
  }

  function renderError(code) {
    return `
      <h1 style="font-family: var(--font-heading); font-size: 4rem; color: var(--red-ember);">
        ${code === 404 ? '404' : 'ERR'}
      </h1>
      <p style="color: var(--text-secondary);">
        ${code === 404
          ? 'Target not found. The path leads nowhere.'
          : 'Connection severed. Could not reach the target.'}
      </p>
      <p><a href="#about">← Return to base</a></p>
    `;
  }

  function showLoading() {
    contentEl.innerHTML = `
      <div class="loading-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
  }

  return { renderMarkdown, showLoading };
})();
