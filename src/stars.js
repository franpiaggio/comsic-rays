import * as THREE from 'three'
import {randomBtw, randomFromList,  pallete, randomPointInSphere} from './utils'
import vertex from './shaders/stars/star_vertex.glsl';
import fragment from './shaders/stars/star_fragment.glsl';

function getStars(time, pixelratio, c){
    let count = c;
    let positions = new Float32Array(count * 1);
    let colorsStars = new Float32Array(count * 3);
    let scales = new Float32Array(count * 1);
    let showRays = new Float32Array(count * 1);
    let raysMult = new Float32Array(count * 1);
    let radius = 20;


    for (let i = 0; i < count; i += 1) {
        const i3 = i * 3

        let v = randomPointInSphere(radius);
        positions[i3] = v.x;
        positions[i3 + 1] = v.y;
        positions[i3 + 2] = v.z;

        let currColor;
        if(Math.random() > 0.85){
            const rColors = randomFromList(pallete);
            currColor = new THREE.Color(randomFromList(rColors));
        }else{
            currColor = new THREE.Color(0xffffff);
        }

        colorsStars[i3] = currColor.r;
        colorsStars[i3 + 1] = currColor.g;
        colorsStars[i3 + 2] = currColor.b;

        scales[i] = randomBtw(0.1,3);
        showRays[i] = Math.random();
        raysMult[i] = randomBtw(0.1,5);
    }

    let geometry = new THREE.BufferGeometry();
    let starsMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: false,
        uniforms: {
            uTime: { value: time },
            uSize: { value: 50 * pixelratio }
        },
        vertexShader: vertex,
        fragmentShader: fragment
    })

    let TBufferPos = new THREE.BufferAttribute(positions, 3);
    let TBufferColors = new THREE.BufferAttribute(colorsStars, 3);
    let TBufferScales = new THREE.BufferAttribute(scales, 1)
    let TBufferShowRays = new THREE.BufferAttribute(showRays, 1)
    let TBufferRaysMult =  new THREE.BufferAttribute(raysMult, 1)

    geometry.setAttribute("position", TBufferPos);
    geometry.setAttribute("color", TBufferColors);
    geometry.setAttribute('aScale', TBufferScales)
    geometry.setAttribute('showRays',TBufferShowRays)
    geometry.setAttribute('raysMult',TBufferRaysMult)

    const stars = new THREE.Points(geometry, starsMaterial)
    return {stars,starsMaterial};
}

export { getStars }