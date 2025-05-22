/* /post-init.js  –  load metadata for the current post and define post-hero */
(async () => {
  const slug = location.pathname.split('/').filter(Boolean)[1];
  const posts = await fetch('/posts.json').then(r => r.json()).catch(() => []);
  const meta = posts.find(p => p.slug === slug);
  if (meta) {
    window.POST_META = meta;
    document.title = meta.title;
  }
  await import('/components/post-hero.js');
})();
