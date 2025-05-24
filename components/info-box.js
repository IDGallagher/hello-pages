customElements.define('info-box', class extends HTMLElement {
  connectedCallback() {
    this.classList.add('page-info-panel');
    const hideOnClick = (e) => {
      if (!this.contains(e.target)) {
        this.style.display = 'none';
      }
    };
    document.addEventListener('click', hideOnClick);
    this._cleanup = () => document.removeEventListener('click', hideOnClick);
  }
  disconnectedCallback() {
    if (this._cleanup) this._cleanup();
  }
});
