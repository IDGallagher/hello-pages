uniform sampler2D u_simulationTexture;
varying vec2 vUv;

void main() {
  // Sample the simulation state (Red channel)
  float state = texture2D(u_simulationTexture, vUv).r;

  // If state > 0.5 (alive), color white, else black.
  // (0.0 for dead, 1.0 for alive after normalization from 0-255)
  float color = state > 0.5 ? 1.0 : 0.0;
  
  gl_FragColor = vec4(color, color, color, 1.0);
} 