/* /components/site-header.js  –  minimal site header */
customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const brand = this.getAttribute('brand') ?? 'My Site';
    const sticky = this.hasAttribute('sticky') ? ' sticky' : '';
    this.innerHTML = `
      <header class="site-header${sticky}"><h1>${brand}</h1></header>`;
  }
});
