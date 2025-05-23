precision highp float;
varying float v_alpha;
void main() {
  // soft round points
  float d = length(gl_PointCoord.xy - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = (1.0 - d) * v_alpha;
  gl_FragColor = vec4(vec3(0.9), a);
} 