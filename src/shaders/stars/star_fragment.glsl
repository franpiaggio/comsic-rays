uniform float uTime;

const float PI = 3.14;
varying vec3 vColor;
varying float vShowRays;
varying float vRaysMult;

mat2 rotationMatrix(float angle)
{
	angle *= PI / 180.0;
    float s=sin(angle), c=cos(angle);
    return mat2( c, -s, s, c );
}
void main()
{
    
    vec2 uv = gl_PointCoord.xy;
    if(vShowRays > 0.999){
        uv *= rotationMatrix( vRaysMult * 0.1 ) * 1.;
    }
    // Light point
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // Final color
    vec3 color = mix(vec3(0.0), vColor, strength);
    
    if(vShowRays > 0.99){
        float rays = max(0., 1.-abs((uv.x-0.5)*(uv.y-0.5)*800.));
        color += rays;
    }

    color *= 0.5;
    gl_FragColor = vec4(color, 1.0);
}