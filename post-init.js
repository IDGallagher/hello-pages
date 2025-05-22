/* /post-init.js  –  fetch metadata and auto-import components */
const slug = window.location.pathname.replace(/\/$/, '').split('/').pop();

(async () => {
  const posts = await fetch('/posts.json').then(r => r.json());
  window.POST_META = Array.isArray(posts) ? posts.find(p => p.slug === slug) : null;

  // Import custom elements found in the page
  const tags = Array.from(document.querySelectorAll('*'))
    .map(el => el.tagName.toLowerCase())
    .filter(t => t.includes('-'));
  for (const tag of new Set(tags)) {
    import(`/components/${tag}.js`).catch(() => {/* ignore missing */});
  }
})();
