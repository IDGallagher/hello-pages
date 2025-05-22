/* /components/site-footer.js  –  simple site footer */
customElements.define("site-footer", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>&copy; 2023 IGProjects. Demo content only.</footer>`;
  }
});
