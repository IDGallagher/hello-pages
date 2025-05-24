customElements.define('control-box', class extends HTMLElement {
  connectedCallback() {
    this.id = this.getAttribute('id') || 'controls-panel';
    this.classList.add('controls-bar');
  }
});
