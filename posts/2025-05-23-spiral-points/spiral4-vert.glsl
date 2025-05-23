precision highp float;

uniform float u_time;
uniform float u_pointSize;

attribute float instanceId;
varying float v_alpha;

/* bring raw tweet-space (≈65–330, 93–308) into a neat ±1 NDC cube */
const vec2  CENTER = vec2(197.0, 200.0);
const float SCALE  = 0.0075;

void main() {
  float i = instanceId;
  float x = mod(i, 200.0);
  float y = floor(i / 200.0);

  float k = x / 8.0 - 12.0;
  float e = y / 8.0 - 12.0;
  float o = 2.0 - length(vec2(k, e)) / 3.0;
  float d = -5.0 * abs(sin(k * 0.5) * cos(e * 0.8));
  float t = u_time;

  /* tweet-length maths */
  float px = (x - d * k * 4.0 + d * k * sin(d + t)) * 0.7 + k * o * 2.0 + 130.0;
  float py = (y - d * y / 5.0 + d * e * cos(d + t + o) * sin(t + d)) * 0.7 + e * o + 70.0;

  /* centre and scale into world-space */
  vec2 posXY = (vec2(px, py) - CENTER) * SCALE;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(posXY, 0.0, 1.0);
  gl_PointSize = u_pointSize;
  v_alpha      = smoothstep(1.2, 0.0, length(posXY));
} 