/* /components/site-header.js  –  simple site header */
customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const brand = this.getAttribute('brand') ?? 'My Blog';
    const sticky = this.hasAttribute('sticky');
    this.innerHTML = `
      <header class="site-header${sticky ? ' sticky' : ''}">
        <a class="brand" href="/">${brand}</a>
      </header>`;
  }
});
