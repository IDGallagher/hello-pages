// Display shader for Shadertoy slGGzD
uniform sampler2D u_simulationTexture;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  float scale = ceil(max(resolution.x, resolution.y) / 1024.0);
  vec2 uv = vUv / scale;
  gl_FragColor = texture2D(u_simulationTexture, uv) + 0.5;
}
