precision highp float;

uniform float u_time;
uniform float u_pointSize;

attribute float instanceId;
varying float v_alpha;

const float SCALE = 0.004;

void main() {
  float i = instanceId;
  float x = mod(i, 200.0);   // 0‥199
  float y = i / 500.0;       // 0‥80 in 0.002 steps

  float k = x / 8.0 - 12.5;
  float e = cos(k) + sin(y / 3.0) + cos(k * 0.5);
  float d = abs(e);
  float t = u_time;

  float q = x / 4.0 + 90.0 + d * k * (0.5 + cos(d * 4.0 - t * 2.0 + y / 12.0));
  float c = y * e / 198.0 - t * 0.125 + d * 0.2;   // d/5

  vec3 pos;
  pos.x = 0.7 * q * cos(c);
  pos.y = 0.7 * (q + 70.0) * sin(c);
  pos.z = 0.0;

  pos.xy *= SCALE;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = u_pointSize;              // constant screen-space size
  v_alpha      = smoothstep(1.2, 0.0, length(pos.xy));
} 