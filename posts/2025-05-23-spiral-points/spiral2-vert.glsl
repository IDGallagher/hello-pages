precision highp float;

uniform float u_time;
uniform float u_pointSize;

attribute float instanceId;
varying float v_alpha;

/* scale chosen so the pattern fits nicely in ±1 world-space */
const float SCALE = 0.004;

void main(){
  float i = instanceId;
  float x = mod(i, 200.0);
  float y = floor(i / 200.0);

  /* -------- maths from the new tweet -------- */
  float k = x / 8.0 - 12.5;
  float e = cos(k) + sin(y / 24.0) + cos(k * 0.5);
  float d = abs(e);
  float t = u_time;

  float q = x / 4.0 + 90.0 + d * k * (1.0 + cos(d * 4.0 - t * 2.0 + y / 72.0));
  float c = y * e / 594.0 - t * 0.125 + d / 6.0;

  vec3 pos;
  pos.x = q * cos(c);
  pos.y = (q * 0.5 + 99.0 * cos(c * 0.5)) * sin(c) + e * 6.0;
  pos.z = 0.0;

  pos.xy *= SCALE;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
  gl_PointSize = u_pointSize;

  v_alpha = smoothstep(1.2, 0.0, length(pos.xy));
} 