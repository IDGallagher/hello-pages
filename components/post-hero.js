/* /components/post-hero.js  –  self-configuring hero banner */
customElements.define("post-hero", class extends HTMLElement {
  connectedCallback() {
    const m = window.POST_META;
    if (!m) return;                               // safety guard

    /* attributes override metadata if present */
    const cover = this.getAttribute("cover") ?? m.cover;
    const title = this.getAttribute("title") ?? m.title;
    const subtitle = this.getAttribute("subtitle") ?? m.subtitle ?? "";
    const date = this.getAttribute("date") ?? m.date;

    this.innerHTML = `
      <section class="post-hero"
               style="background-image:url('${cover}'); padding:4rem 1rem; color:black; background-size:cover; background-position:center;">
        <h1 style="margin:0 0 .5rem; font-size:2.5rem;">${title}</h1>
        ${subtitle ? `<p style="margin:0 0 .5rem; font-size:1.25rem;">${subtitle}</p>` : ""}
        ${date ? `<time style="opacity:.8;">${date}</time>` : ""}
      </section>`;
  }
});
