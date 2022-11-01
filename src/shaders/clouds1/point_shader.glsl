uniform vec2 resolution;
uniform float uTime;
varying vec2 vUv;
void main()
{
    vec2 p = -1.0 + 2.0 *vUv;
    float r = length(p) * 4.;
    float a = atan(p.x,p.y);
    float e = smoothstep(0.,0.,1.-r); 
    
    vec3 col = vec3(e,e,e-0.5);

    gl_FragColor = vec4(col,1.0);
}