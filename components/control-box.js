customElements.define('control-box', class extends HTMLElement {
  connectedCallback() {
    this.id = this.getAttribute('id') || 'controls-panel';
    this.classList.add('controls-bar');

    // Create a wrapper for the actual controls
    const controlsWrapper = document.createElement('div');
    controlsWrapper.classList.add('actual-controls-group'); // Class for styling

    // Move all existing children (the controls) into the wrapper
    // Note: childNodes is a live collection, so iterate carefully or convert to array
    Array.from(this.childNodes).forEach(child => {
      // Only move element nodes, skip the title if it was already prepended (though logic order is now different)
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'H2') {
        controlsWrapper.appendChild(child);
      }
    });

    // Add the wrapper with controls to the component
    this.appendChild(controlsWrapper);

    // Create and prepend the title
    const titleElement = document.createElement('h2');
    titleElement.textContent = 'Controls';
    // titleElement.style.display = 'block'; // May no longer be strictly necessary with flex parent
    this.prepend(titleElement);
  }
});
