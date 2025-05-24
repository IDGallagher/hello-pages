/* /components/site-footer.js  –  simple site footer */
customElements.define("site-footer", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>Created with pure vibes. Mistakes might not be my own. Experimenting with a new way of doing things without any frameworks now that AI can do the heavy lifting. Source code available on <a href="https://github.com/lostcommunications/lostcommunications.github.io">GitHub</a>.</footer>`;
  }
});
