/* /post-init.js  –  setup for post pages */
(async () => {
  const slug = location.pathname.replace(/\/$/, '').split('/').pop();
  const posts = await fetch('/posts.json').then(r => r.json()).catch(() => []);
  window.POST_META = posts.find(p => p.slug === slug) || {};
  if (window.POST_META.title) {
    document.title = window.POST_META.title;
  }
  // auto-load components by tag name
  const tags = Array.from(new Set(Array.from(document.querySelectorAll('*'))
    .map(el => el.tagName.toLowerCase())));
  for (const tag of tags) {
    if (tag.includes('-')) {
      try { await import(`/components/${tag}.js`); } catch (e) {}
    }
  }
})();
