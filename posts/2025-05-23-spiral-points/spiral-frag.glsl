precision highp float;

/* soft, circular Gaussian – individual-point blur */
void main () {
  vec2  p  = gl_PointCoord - 0.5;        // centre at 0,0
  float d2 = dot(p,p) * 4.0;             // radius², 0‥2 range
  float g  = 0.5* exp(-d2 * 3.0);             // wider blur

  // if (g < 0.01) discard;                 // tidy edge
  gl_FragColor = vec4(vec3(0.1), g);       // additive white "ink"
} 