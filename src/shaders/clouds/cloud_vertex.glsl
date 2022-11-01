uniform float time;
uniform vec2 resolution;
attribute vec3 translate;
void main()	{
    // vec3 newpos = position + translate;
    gl_Position = vec4( position, 1.0 );
}