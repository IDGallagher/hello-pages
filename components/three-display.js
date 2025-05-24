customElements.define('three-display', class extends HTMLElement {
  async connectedCallback() {
    const canvasId = this.getAttribute('canvas-id') || '';
    const manual = this.hasAttribute('manual');
    const canvas = document.createElement('canvas');
    if (canvasId) canvas.id = canvasId;
    canvas.classList.add('full-viewport-canvas');
    this.appendChild(canvas);

    if (manual) return;

    const THREE = await import('three');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camType = this.getAttribute('camera');
    let camera;
    if (camType === 'orthographic') {
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    } else {
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.z = parseFloat(this.getAttribute('z')) || 3;
    }

    let controls = null;
    if (!this.hasAttribute('no-controls')) {
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = true;
      if (this.hasAttribute('no-rotate')) controls.enableRotate = false;
    }

    let updateFn = null;
    const modulePath = this.getAttribute('module');
    if (modulePath) {
      const modUrl = new URL(modulePath, this.ownerDocument.baseURI).href;
      const mod = await import(modUrl);
      const initName = this.getAttribute('init') || 'default';
      const initFn = mod[initName];
      if (typeof initFn === 'function') {
        updateFn = initFn({ scene, camera, renderer, canvas, controls }) || null;
      }
    }

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      resize();
      if (controls) controls.update();
      if (updateFn) updateFn();
      renderer.render(scene, camera);
    };
    animate();
  }
});
