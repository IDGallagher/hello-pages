import * as THREE from 'three';

export async function initRotatingSphere({ scene }) {
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

  return () => {
    material.uniforms.time.value += 0.01;
  };
}
