import * as THREE from 'three';

export function initRotatingSphere() {
  const canvas   = document.getElementById('sphere-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.z = 3;

  // Zoom and Drag variables
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0
  };
  const MIN_ZOOM_Z = 1.5; // Min camera z position (closest zoom)
  const MAX_ZOOM_Z = 10;  // Max camera z position (farthest zoom)

  const geometry = new THREE.SphereGeometry(1, 128, 128);

  fetch('./sphere.glsl')
    .then(r => r.text())
    .then(fragmentShader => {
      const material = new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
          varying vec3 vNormal;
          varying vec2 vUv;
          void main(){
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
        fragmentShader,
        uniforms:{ time:{ value:0 } }
      });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      function resize(){
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if(canvas.width!==w || canvas.height!==h){
          renderer.setSize(w, h, false);
          camera.aspect = w/h;
          camera.updateProjectionMatrix();
        }
      }

      // Event Listeners
      canvas.addEventListener('wheel', onMouseWheel, { passive: false });
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mouseleave', onMouseUp); // Stop dragging if mouse leaves canvas

      function onMouseWheel(event) {
        event.preventDefault();
        // Adjust camera.position.z for zooming
        camera.position.z -= event.deltaY * 0.01;
        // Clamp the zoom level
        camera.position.z = Math.max(MIN_ZOOM_Z, Math.min(camera.position.z, MAX_ZOOM_Z));
        camera.updateProjectionMatrix();
      }

      function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
      }

      function onMouseMove(event) {
        if (!isDragging) return;

        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        // Pan the camera instead of rotating the sphere
        const dist = camera.position.distanceTo(sphere.position); // sphere.position is (0,0,0)
        const fovInRadians = THREE.MathUtils.degToRad(camera.fov);
        
        // Calculate visible height and width at the distance of the sphere
        const visibleHeightAtDist = 2 * dist * Math.tan(fovInRadians / 2);
        const visibleWidthAtDist = visibleHeightAtDist * camera.aspect;

        // Convert pixel delta to world delta
        const panX = (deltaMove.x / canvas.clientWidth) * visibleWidthAtDist;
        const panY = (deltaMove.y / canvas.clientHeight) * visibleHeightAtDist;

        // Move camera along its local axes
        // Mouse X right (deltaMove.x > 0) -> panX > 0. 
        // To make scene move right, camera moves left.
        camera.translateX(-panX); 
        // Mouse Y down (deltaMove.y > 0) -> panY > 0.
        // To make scene move down, camera moves up.
        camera.translateY(panY);

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
      }

      function onMouseUp(event) {
        isDragging = false;
      }

      function animate(){
        requestAnimationFrame(animate);
        resize();
        material.uniforms.time.value += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    });
} 