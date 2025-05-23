// Converts the original tweet-length Processing sketch to GLSL
precision highp float;
uniform float u_time;
uniform float u_pointSize;
attribute float instanceId;
varying float v_alpha;

void main() {
  float i = instanceId;
  float x = mod(i, 100.0);
  float y = floor(i / 350.0);

  float k = x / 4.0 - 12.5;
  float e = y / 9.0;
  float o = length(vec2(k, e)) / 9.0;
  float t = u_time;

  float q = 99.0
          + 3.0 * (tan(y * 0.5) * 0.5 + cos(y)) / k
          + k * (3.0 + cos(y) / 3.0 + sin(e + o * 4.0 - t * 2.0));

  float c = o * 0.25 + e * 0.25 - t * 0.125;

  vec3 pos;
  pos.x = (q * cos(c) * cos(c * 0.5 - e / 3.0 + t * 0.125)) * 0.006;
  pos.y = (q * sin(c)) * 0.006;
  pos.z = 0.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = u_pointSize / gl_Position.w;

  v_alpha = smoothstep(1.2, 0.0, length(pos.xy));
} 