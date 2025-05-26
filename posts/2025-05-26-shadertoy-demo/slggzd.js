import * as THREE from 'three';
import { initSimulationEngine } from '../2025-05-22-game-of-life/gpgpu-simulation-engine.js';

function initData(width, height) {
  const size = width * height * 4;
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  tex.needsUpdate = true;
  return tex;
}

const config = {
  canvasId: 'slggzd-canvas',
  initialComputeShaderPath: './slggzd.glsl',
  initialDataFunction: initData,
  initialDisplayShaderPath: './display.glsl',
  simulationGridWidth: 1024,
  simulationGridHeight: 1024,
};

customElements.whenDefined('three-display').then(() => {
  requestAnimationFrame(() => initSimulationEngine(config));
});
