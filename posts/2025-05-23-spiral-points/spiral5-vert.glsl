precision highp float;

uniform float u_time;
uniform float u_pointSize;

attribute float instanceId;
varying float v_alpha;

const float SCALE = 0.006;

void main() {
  float i = instanceId;
  float x = mod(i, 200.0) + 100.0;        // 100‥299
  float y = floor(i / 200.0) + 100.0;

  float k = x / 8.0 - 25.0;
  float e = y / 8.0 - 25.0;
  float o = length(vec2(k, e)) / 3.0;
  float d = 5.0 * cos(o);
  float t = u_time;

  float q = x / 2.0 + k / atan(9.0 * cos(e)) * sin(d * 4.0 - t);
  float c = d / 3.0 - t * 0.125;

  vec3 pos;
  pos.x = q * sin(c);
  pos.y = (y / 4.0 + 5.0 * o * o + q) * 0.5 * cos(c);
  pos.z = 0.0;

  pos.xy *= SCALE;

  vec2 posXY = pos.xy;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(posXY, 0.0, 1.0);
  gl_PointSize = u_pointSize;              // constant screen-space size
  v_alpha      = smoothstep(1.2, 0.0, length(posXY));
} 