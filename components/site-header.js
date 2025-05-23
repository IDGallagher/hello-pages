/* /components/site-header.js  –  minimal site header */
customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const brand = 'IGProjects';
    const sticky = this.hasAttribute('sticky') ? ' sticky' : '';
    this.innerHTML = `
      <header class="site-header${sticky}"><h1><a href="/" class="site-header-link">${brand}</a></h1></header>`;
  }
});
