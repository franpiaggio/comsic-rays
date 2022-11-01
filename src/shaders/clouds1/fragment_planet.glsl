uniform vec2 resolution;
uniform float uTime;
uniform float mult;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 colorCloud;

uniform float cloudscale;
uniform float speed;
uniform float clouddark;
uniform float cloudlight;
uniform float cloudcover;
uniform float cloudalpha;
uniform float skytint;

varying vec2 vUv;

// const float cloudscale = .1;
// const float speed = 0.008;
// const float clouddark = .05;
// const float cloudlight = 0.01;
// const float cloudcover = 0.0;
// const float cloudalpha = .0;
// const float skytint = 10.0;

const vec3 skycolour1 = vec3(0., 0., .0);
const vec3 skycolour2 = vec3(0., 0., 0.);
// const vec3 skycolour1 = vec3(0.0, 0.4, 0.6);
// const vec3 skycolour2 = vec3(0.4, 0.7, 1.0);

const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 hash( vec2 p ) {
	p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p ) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;
	vec2 i = floor(p + (p.x+p.y)*K1);	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot(n, vec3(70.0));	
}

float fbm(vec2 n) {
	float total = 0.0, amplitude = 0.1;
	for (int i = 0; i < 7; i++) {
        // aca agregue el uniform
		total += noise(n+mult) * amplitude;
		n = m * n;
		amplitude *= 0.4;
	}
	return total;
}

void main()	{

    vec2 p = -1.0 + 2.0 *vUv;
	vec2 uv = p*vec2(resolution.x/resolution.y,1.0); 
    float time = uTime * speed + mult;
    float q = fbm(uv * cloudscale * .5);

    //ridged noise shape
	float r = 0.0;
	uv *= cloudscale;
    uv -= q - time;
    float weight = 0.8;
    for (int i=0; i<8; i++){
		r += abs(weight*noise( uv ));
        uv = m*uv + time;
		weight *= 0.7;
    }

    //noise shape
	float f = 0.0;
    uv = p*vec2(resolution.x/resolution.y,1.0);
	uv *= cloudscale;
    uv -= q - time;
    weight = 0.7;
    for (int i=0; i<8; i++){
		f += weight*noise( uv );
        uv = m*uv + time;
		weight *= 0.6;
    }
    f *= r + f;

    //noise colour
    float c = 0.0;
    time = uTime * speed * 2.0;
    uv = p*vec2(resolution.x/resolution.y,1.0);
	uv *= cloudscale*2.0;
    uv -= q - time;
    weight = 0.4;
    for (int i=0; i<7; i++){
		c += weight*noise( uv );
        uv = m*uv + time;
		weight *= 0.6;
    }

    //noise ridge colour
    float c1 = 0.0;
    time = uTime * speed * 3.0;
    uv = p*vec2(resolution.x/resolution.y,1.0);
	uv *= cloudscale*3.0;
    uv -= q - time;
    weight = 0.4;
    for (int i=0; i<7; i++){
		c1 += abs(weight*noise( uv ));
        uv = m*uv + time;
		weight *= 0.6;
    }
    // Final
    c += c1; 

    // Original
    vec3 skycolour = mix(skycolour2, skycolour1, p.y);
    // Con uniforms
    // vec3 skycolour = mix(color1, color2, p.y);

    skycolour = mix(skycolour, vec3(.0, .0, .0), p.x);
    // skycolour = mix(skycolour, vec3(.1, .3, .1), p.x/p.y);

    // Color nube medio space rojo
    // vec3 cloudcolour = vec3(2.1, 1.1, 1.1) * clamp((clouddark + cloudlight*c), 0.0, 1.0);

    // Color nube uniform
    vec3 cloudcolour = colorCloud * clamp((clouddark + cloudlight*c), 0.0, 1.0);
    
    // vec3 skycolour = mix(skycolour2, skycolour1, p.y);
    // vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight*c), 0.0, 1.0);
   
    f = cloudcover + cloudalpha*f*r;
    
    vec3 result = mix(
        skycolour, 
        clamp(skytint * skycolour + cloudcolour, 0.0, 1.0), 
        clamp(f + c, 0.0, 1.0)
    );

    result.r -=  map(sin(uTime * 0.4), -1., 1., -0.06, 0.06);
    result.g -=  map(sin(uTime * 0.3), -1., 1., -0.02, 0.02);
    result.b -=  map(sin(uTime * 0.5), -1., 1., -0.01, 0.01);

    gl_FragColor = vec4(result, 1.);
}