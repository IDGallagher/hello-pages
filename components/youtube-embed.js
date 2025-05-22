/* /components/youtube-embed.js  –  lightweight YouTube iframe wrapper
   Usage examples:
     <youtube-embed video="dQw4w9WgXcQ"></youtube-embed>
     <youtube-embed video="dQw4w9WgXcQ" start="45" title="My demo"></youtube-embed>
*/

customElements.define("youtube-embed", class extends HTMLElement {
  connectedCallback() {
    const id    = this.getAttribute("video");   // REQUIRED
    if (!id) { console.warn("<youtube-embed> missing video attribute"); return; }

    const start = this.getAttribute("start") ?? 0;
    const title = this.getAttribute("title") ?? "YouTube video";

    this.innerHTML = `
      <iframe class="youtube-frame"
        src="https://www.youtube.com/embed/${encodeURIComponent(id)}?start=${start}"
        title="${title}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>`;
  }
});
