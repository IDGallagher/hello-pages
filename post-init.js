/* ---------- Shared <head> injection ---------- */
const SHARED_HEAD_HTML = /* html */`
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Favicon links -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/favicon/web-app-manifest-192x192.png">
  <link rel="apple-touch-icon" href="/assets/favicon/web-app-manifest-192x192.png">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">

  <!-- Fonts & global stylesheet -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/global.css">
`;

/** Inject the shared markup once per page. */
function injectSharedHead () {
  if (document.head.querySelector('meta[name="shared-head-marker"]')) return; // already injected
  const marker = document.createElement('meta');
  marker.name = 'shared-head-marker';
  marker.content = 'true';
  document.head.prepend(marker);

  const tpl = document.createElement('template');
  tpl.innerHTML = SHARED_HEAD_HTML.trim();
  document.head.prepend(tpl.content);
}

// Run immediately so the import-map is in place before any dynamic imports.
injectSharedHead();
/* ---------- end Shared <head> injection ---------- */


/* /post-init.js  –  fetch metadata and auto-import components */
const slug = window.location.pathname.replace(/\/$/, '').split('/').pop();

(async () => {
  const posts = await fetch('/posts.json').then(r => r.json());
  window.POST_META = Array.isArray(posts) ? posts.find(p => p.slug === slug) : null;
  /* --- dynamic <title> for post pages --- */
  if (window.POST_META && window.POST_META.title) {
    // Replace or create a <title> so the tab shows the post's real title.
    document.title = window.POST_META.title;
  }

  // Import custom elements found in the page
  const tags = Array.from(document.querySelectorAll('*'))
    .map(el => el.tagName.toLowerCase())
    .filter(t => t.includes('-'));
  for (const tag of new Set(tags)) {
    import(`/components/${tag}.js`).catch(() => {/* ignore missing */});
  }
})();
