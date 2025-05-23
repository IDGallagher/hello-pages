uniform float time;
varying vec3  vNormal;
varying vec2  vUv;

void main(){
  /* Animated rainbow based on normals */
  vec3 color = 0.5 + 0.5 * cos(time + vNormal * 3.14159);
  gl_FragColor = vec4(color, 1.0);
} 