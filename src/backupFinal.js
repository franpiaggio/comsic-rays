import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ImprovedNoise } from "./ImprovedNoise.js";

import { getStars } from './stars';
import { randomBtw, randomFromList, shuffle, mapRange } from './utils';
function createImage(saveAsFileName) {

  var canvas = document.querySelector('canvas.webgl');

  var url = canvas.toDataURL();

  var link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('target', '_blank');
  link.setAttribute('download', saveAsFileName);

  link.click();
}

const f = {
  backgroundClouds: Math.random() > 0.7,
  blur: true,
  bloom: {
    strength: randomFromList([3,4,4.3]),
    threshold: 0.000001
  }
}

const bloom = {
  enabled : true,
  strength : f.bloom.strength,
  radius : randomBtw(1, 1.5),
  threshold : f.bloom.threshold
}


const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
let RenderTargetClass = null;
let effectComposer;
const clock = new THREE.Clock();
let elapsedTime = clock.getElapsedTime()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)
})

let camera = new THREE.PerspectiveCamera(randomFromList(shuffle([75,85])), sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,randomFromList([1,4]))
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enabled = true;
controls.enablePan = false;
controls.enableDamping = true;
controls.enableZoom = false;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    preserveDrawingBuffer: true
})

if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2){
  RenderTargetClass = THREE.WebGLRenderTarget 
  console.log('Using WebGLMultisampleRenderTarget')
}else{
  RenderTargetClass = THREE.WebGLRenderTarget
  console.log('Using WebGLRenderTarget')
}

const renderTarget = new RenderTargetClass(1920,1080,
  {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
  }
)

effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Bloom
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight ), 1.5, 0.4, 100)
bloomPass.enabled = bloom.enabled
bloomPass.strength = bloom.strength
bloomPass.radius = bloom.radius
bloomPass.threshold = bloom.threshold
effectComposer.addPass(bloomPass)

let bokehPass = new BokehPass(scene, camera, {
  focus: 2.0,
  aperture: 0.00001,
  maxblur: 0.006,
  width: window.innerWidth,
  height: window.innerHeight
})
effectComposer.addPass(bokehPass)


if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2){
  const smaaPass = new SMAAPass()
  effectComposer.addPass(smaaPass)
}

/**
 * Scene
*/
let countstars = randomBtw(60000, 90000)
const {stars, starsMaterial} = getStars(elapsedTime, renderer.getPixelRatio(), countstars);
scene.add(stars)
const radius = randomBtw(0.5,12);
const tubeLength =  randomFromList([350,650]);
const tubeGeo = new THREE.CylinderGeometry(radius, radius, tubeLength, randomFromList(shuffle([350,500,250, 800])), 2500, true);
const tubeVerts = tubeGeo.attributes.position;
const colors = [];
const noise = new ImprovedNoise();
let p = new THREE.Vector3();
let v3 = new THREE.Vector3();
const noiseFreqValues = shuffle([[0.1, 0.8], [0.1, 0.2], [0.12, 0.22], [0.5, 0.4], [0.1, 0.9], [0.2,1], [0.2,2], [0.4,1], [0.8,1]])
const nSelected = randomFromList(noiseFreqValues)
const noisefreq = nSelected[0];
const noiseAmp = nSelected[1];
const color = new THREE.Color();
const hueNoiseFreq = randomFromList([ 0.008,  0.01]);
for (let i = 0; i < tubeVerts.count; i += 1) {
  p.fromBufferAttribute(tubeVerts, i);
  v3.copy(p);
  let vertexNoise = noise.noise(
    v3.x * noisefreq,
    v3.y * noisefreq,
    v3.z
  );
  v3.addScaledVector(p, vertexNoise * noiseAmp);
  tubeVerts.setXYZ(i, v3.x, p.y, v3.z);
  let colorNoise = noise.noise(v3.x * hueNoiseFreq, v3.y * hueNoiseFreq, i * 0.001 * hueNoiseFreq);
  color.setHSL(0.8 - colorNoise, 1, 0.5);
  colors.push(color.r, color.g, color.b);
}
const mat = new THREE.PointsMaterial({ size: .000003, vertexColors: true });
function getTube(index) {
  const startPosZ =  -tubeLength * index;
  const endPosZ = tubeLength;
  const resetPosZ =  -tubeLength;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", tubeVerts);
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const points = new THREE.Points(geo, mat);
  points.rotation.x = Math.PI * 0.5;
  points.position.z = startPosZ;
  const speed = randomFromList([0.4, 0.8, 0.5]);
  function update() {
    points.rotation.y -= 0.005;
    points.position.z += speed * 0.25;
    if (points.position.z > endPosZ) {
      points.position.z = resetPosZ;
    }
  }
  return { points, update };
}

const tubeA = getTube(0);
const tubeB = getTube(1);
const tubes = [tubeA, tubeB]; 
scene.add(tubeA.points, tubeB.points);
/*
* Fin tubo
*/

window.addEventListener('keydown', function (e) {
  if(e.key === "d"){
    createImage(Date.now())
  }
}, false);

const rSpeed2 = 0.00002;
const tick = () => {
    elapsedTime = clock.getElapsedTime()
    starsMaterial.uniforms.uTime.value = elapsedTime * 0.05;
    stars.rotation.y += rSpeed2;
    tubes.forEach((tb) => tb.update());
    controls.update()
    effectComposer.render()
    window.requestAnimationFrame(tick)
}
tick();
