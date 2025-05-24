import * as THREE from 'three';

export async function initRotatingSphere({ scene, controls }) {
  const geometry = new THREE.SphereGeometry(1, 128, 128);
  const fragmentShader = await fetch('./sphere.glsl').then(r => r.text());

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
    uniforms: { time: { value: 0 } }
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  if (controls) {
    controls.enableRotate       = false;
    controls.mouseButtons.LEFT  = THREE.MOUSE.PAN;
    controls.screenSpacePanning = true;
    controls.minDistance        = 1.0;
    controls.maxDistance        = 20.0;
  }

  return () => {
    material.uniforms.time.value += 0.01;
  };
}
