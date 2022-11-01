uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute float showRays;
attribute float raysMult;

varying vec3 vColor;
varying float vShowRays;
varying float vRaysMult;

void main()
{
    /**
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += uTime*0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    /**
     * Size
     */
    gl_PointSize = uSize * aScale;
    if(showRays > 0.992){
        gl_PointSize += uSize * aScale * raysMult;
    }


    gl_PointSize *= (1.0 / - viewPosition.z);

    /**
     * Color
     */
    vColor = color;
    /*
    * Show rays
    */
    vShowRays = showRays;
    vRaysMult = raysMult;
}