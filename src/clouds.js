import * as THREE from 'three'
import vertex from './shaders/clouds/cloud_vertex.glsl';
import fragment from './shaders/clouds/cloud_fragment.glsl';
function getClouds(time){
    const planeGeometry = new THREE.PlaneBufferGeometry(2,2);
    const bufferGeometry = new THREE.InstancedBufferGeometry();

    bufferGeometry.attributes = planeGeometry.attributes;
    bufferGeometry.index = planeGeometry.index;

    let count = 1000
    let translateAttribute = new Float32Array(count*3);

    for (let i = 0; i < count; i++) {
        translateAttribute.set(
            [
                Math.random(),
                Math.random(),
                Math.random(),
            ],
            3*i
        )
    }

    const TinstanceBufferTranslate = new THREE.InstancedBufferAttribute(translateAttribute, 3)
    bufferGeometry.setAttribute('translate', TinstanceBufferTranslate)

    const cloudShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() }
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true
    })
    cloudShaderMaterial.uniforms.resolution.value.x = window.innerWidth
    cloudShaderMaterial.uniforms.resolution.value.y = window.innerHeight

    const plane = new THREE.Mesh(planeGeometry, cloudShaderMaterial)
    plane.position.z = -1.2
    return {plane, cloudShaderMaterial}
}
export { getClouds }