/* /components/site-header.js - simple site header element */
customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const brand = this.getAttribute('brand') || 'My Site';
    const sticky = this.hasAttribute('sticky');
    this.innerHTML = `
      <header${sticky ? ' style="position:sticky;top:0"' : ''}>
        <div class="logo">${brand}</div>
      </header>`;
  }
});
