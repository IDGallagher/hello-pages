void main() {

  // Normalised texture coordinates for this fragment
  vec2 uv = gl_FragCoord.xy / resolution;

  // Current cell state
  // The 'textureState' uniform sampler2D is provided by GPUComputationRenderer
  float state = texture( textureState, uv ).r;

  // Count live neighbours (8-connected)
  float alive = 0.0;
  for ( int j = -1; j <= 1; ++j ) {
    for ( int i = -1; i <= 1; ++i ) {
      if ( i == 0 && j == 0 ) continue;
      vec2 offs      = vec2( float( i ), float( j ) );
      vec2 neighbour = ( gl_FragCoord.xy + offs ) / resolution;
      alive += texture( textureState, neighbour ).r;
    }
  }

  // Conway's rules
  float next = ( alive == 3.0 || ( state > 0.5 && alive == 2.0 ) ) ? 1.0 : 0.0;

  // Output the state (0.0 or 1.0) to the Red channel.
  // If the render target is truly RedFormat, GBA components are ignored.
  gl_FragColor = vec4( next, 0.0, 0.0, 1.0 );
} 