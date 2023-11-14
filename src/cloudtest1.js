import * as THREE from 'three'
import vertex from './shaders/clouds1/vertex.glsl';
import fragment from './shaders/clouds1/fragment.glsl';
import fragment_planet from './shaders/clouds1/fragment_planet.glsl';
import {  randomBtw, randomFromList } from './utils';

function clouds1(size, doubleSide, color, uniforms, planet, shape, orthoCam){
    const resolution = new THREE.Vector3(window.innerWidth, window.innerHeight, window.devicePixelRatio)

    let geometry = new THREE.SphereGeometry(size, 64, 64 );
    const a = orthoCam ? randomBtw(20.2, 2.7) : randomBtw(0.2, 0.7);
    const b = orthoCam ? randomBtw(0.8, 1.8) : randomBtw(0.08, 0.1)
    const geometry2 = new THREE.TorusKnotGeometry( a, b, 300, 16, randomFromList([2,4,1]) );
    const geometry3 = new THREE.OctahedronGeometry(size, 0)
    const geometry4 = new THREE.TorusGeometry( size * 0.5, randomBtw(0.01,0.2), 16, 100 )
    

    if(planet){
        if(shape.id === 2){
            geometry = geometry2
        }
        if(shape.id === 3){
            geometry = geometry3
        }
        if(shape.id === 4){
            geometry = geometry3
        }
        if(orthoCam){
            geometry = geometry4
        }
    }
    geometry.setAttribute("basePosition", new THREE.BufferAttribute().copy(geometry.attributes.position));

    const plane1Material = new THREE.ShaderMaterial({
        uniforms: {
            ...uniforms,
            uTime: { type: "f", value: fxrand() },
            mult: { type: "f", value: Math.random() * 99999 },
            resolution: { type: "v3", value: resolution },
            colorCloud: { type: "v3", value: color },
            color1: { type: "v3", value: [fxrand(),fxrand(),fxrand()] },
            color2: { type: "v3", value: [fxrand(),fxrand(),fxrand()] },
        },
        vertexShader: vertex,
        fragmentShader: planet ? fragment_planet : fragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: doubleSide ? THREE.DoubleSide : false
    });

    const plane1 = new THREE.Mesh(geometry, plane1Material)

    return {
        mesh: plane1,
        material: plane1Material
    }
}

function backgroundClouds(size, color){
    const uniforms = {
        cloudscale: {type: "f", value: 0.5},
        speed: {type: "f", value: 0.008},
        clouddark: {type: "f", value: .002},
        cloudlight: {type: "f", value: 0.08},
        cloudcover: {type: "f", value: 0.1},
        skytint: {type: "f", value: 0.}
     }
    const resolution = new THREE.Vector3(window.innerWidth, window.innerHeight, window.devicePixelRatio)

    let geometry = new THREE.SphereGeometry( 25, 32, 32 );
    const colorC = [0,0,0]
    const plane1Material = new THREE.ShaderMaterial({
        uniforms: {
            ...uniforms,
            uTime: { type: "f", value: 1 },
            mult: { type: "f", value: 0.2 },
            resolution: { type: "v3", value: resolution },
            colorCloud: { type: "v3", value: color },
            color1: { type: "v3", value: colorC },
            color2: { type: "v3", value: colorC },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    const plane1 = new THREE.Mesh(geometry, plane1Material)

    return {
        mesh: plane1,
        material: plane1Material
    }
}
export { backgroundClouds, clouds1 }