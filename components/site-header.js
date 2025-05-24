/* /components/site-header.js  –  minimal site header */
customElements.define('site-header', class extends HTMLElement {
  connectedCallback() {
    const sticky = this.hasAttribute('sticky') ? ' sticky' : '';
    this.innerHTML = `
      <header class="site-header${sticky}">
        <a href="/" class="logo-wrapper">
          <img src="/assets/logo-zh.webp" alt="朱结之聲" class="logo-zh">
          <img src="/assets/logo-en.webp" alt="Lost Communications" class="logo-en">
        </a>
      </header>`;
  }
});
