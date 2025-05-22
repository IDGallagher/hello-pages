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
      <section class="post-hero">
        <img class="cover" src="${cover}" alt="">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ""}
        ${date ? `<time>${date}</time>` : ""}
      </section>`;
  }
});
