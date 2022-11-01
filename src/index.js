import * as THREE from 'three'
import GUI from 'lil-gui';
import { createNoise3D } from 'simplex-noise';
import alea from 'alea';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { getStars } from './stars';
import { getClouds } from './clouds';
import { backgroundClouds, clouds1 } from './cloudtest1';

import { pallete, randomBtw, randomFromList } from './utils';
import { getShape, getCamera } from './features.js';
import { mapRange } from './utils';

function createImage(saveAsFileName) {

  var canvas = document.querySelector('canvas.webgl');

  var url = canvas.toDataURL();

  var link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('target', '_blank');
  link.setAttribute('download', saveAsFileName);

  link.click();
}

const noise3D = createNoise3D(alea(fxrand()*99999));

const f = {
  shape: getShape(),
  deformMainShape: fxrand() > 0.4,
  backgroundClouds: fxrand() > 0.7,
  blur: fxrand() > 0.4,
  orthoCam: fxrand() > 0.85,
  bloom: {
    strength: randomBtw(1,6),
    threshold: randomBtw(0.0001, 0.001)
  }
}

window.$fxhashFeatures = {
  "Core": f.shape.name,
  "Camera": f.orthoCam ? "Orthographic" : "Perspective"
}

const lilGlobal = {
  reload: function(){
    location.reload()
  }
}

const bloom = {
  enabled : true,
  strength : f.bloom.strength,
  radius : randomBtw(1, 1.165),
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

let frustumSize = 40;
const aspect = window.innerWidth / window.innerHeight;
let camera;
if(f.orthoCam){
  frustumSize = 50;
  camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
  camera.position.set(0,0,-6)
}else{
  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.set(0,0,-4)
}

scene.fog = new THREE.FogExp2(0x000000, 100.045)


scene.add(camera)

const controls = new OrbitControls(camera, canvas)
// controls.enabled = false;
controls.enablePan = false;
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    preserveDrawingBuffer: true
})

renderer.setClearColor('#000006')

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

let maxBlur = fxrand() > 0.8 ? 0.01 : 0.008
let bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.0003,
  maxblur: 0.006,
  width: window.innerWidth,
  height: window.innerHeight
})
if(f.blur && !f.orthoCam){
  effectComposer.addPass(bokehPass)
}

if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2){
  const smaaPass = new SMAAPass()
  effectComposer.addPass(smaaPass)
}


/**
 * Scene
*/
let countstars = f.orthoCam ? 6000 : randomBtw(60000, 80000)
const {stars, starsMaterial} = getStars(elapsedTime, renderer.getPixelRatio(), countstars);
scene.add(stars)

// Plane con muchas nubes
const { plane, cloudShaderMaterial } = getClouds();
// scene.add(plane)


const cPallete = randomFromList(pallete)
const tColor1 = new THREE.Color(randomFromList(cPallete))
const ccolor1 = [tColor1.r, tColor1.g, tColor1.b]

const sizeCloud1 = mapRange(fxrand(),0,1, 8, 14)
const plane1 = backgroundClouds(sizeCloud1, ccolor1);
if(f.backgroundClouds){
  scene.add(plane1.mesh)
}

const uniforms3 = {
  cloudscale: {type: "f", value: 1.2},
  speed: {type: "f", value: .04},
  clouddark: {type: "f", value: 0.1},
  cloudlight: {type: "f", value: 0.05},
  cloudcover: {type: "f", value: 0.1},
  skytint: {type: "f", value: 0.1}
}

const tColor3 = new THREE.Color(randomFromList(randomFromList(pallete)))
const ccolor3 = [tColor3.r, tColor3.g, tColor3.b];
let shapeSize = randomBtw(0.8, 1.2);
if(f.orthoCam){
  shapeSize = randomBtw(8, 14);
}
const plane3 = clouds1(shapeSize, true, ccolor3, uniforms3, true, f.shape, f.orthoCam);
// plane3.mesh.position.z = 0.
scene.add(plane3.mesh);

const uniforms2 = {
  cloudscale: {type: "f", value: 0.2},
  speed: {type: "f", value: 0.004},
  clouddark: {type: "f", value: .08},
  cloudlight: {type: "f", value: 0.01},
  cloudcover: {type: "f", value: 0.2},
  skytint: {type: "f", value: 0.0}
}

const tColor2 = new THREE.Color(randomFromList(randomFromList(pallete)))
const ccolor2 = [tColor2.r, tColor2.g, tColor2.b];
let shapeSize2 = randomBtw(1.5,2.5)
if(f.orthoCam && fxrand() > 0.6){
  shapeSize2 = randomBtw(2, 5);
}
const plane2 = clouds1(shapeSize2, false, ccolor2, uniforms2, false, f.orthoCam);
plane2.mesh.position.z = 0;
plane2.renderOrder = 0;
scene.add(plane2.mesh);

let offSets ={
  x: 0.1,
  y: 2.1,
  intensity: randomBtw(0.05, 0.2),
  speed: randomBtw(0.001, 0.03)
}

function setNoise(t=0){
  const basePositionAttribute = plane2.mesh.geometry.getAttribute("basePosition");
  const positionAttribute = plane2.mesh.geometry.getAttribute( 'position' );
  const vertex = new THREE.Vector3();

  for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {
      vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );
      var noise = noise3D(
          vertex.x + offSets.x,
          vertex.y + offSets.y + t * offSets.speed,
          vertex.z * 0.006 + t * 0.0002 );
      var ratio = noise * 0.4 * ( offSets.intensity + 0.1 ) + 0.8;
      vertex.multiplyScalar( ratio );
      positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z)
  }

  plane2.mesh.geometry.attributes.position.needsUpdate = true
  plane2.mesh.geometry.computeBoundingSphere()
}

const rSpeed1 = randomBtw(0.2, 2);
const rSpeed2 = f.orthoCam ? randomBtw(0.0008, 0.002) : randomBtw(0.000008, 0.00001);
let preview = true;
window.addEventListener('keydown', function (e) {
  if(e.key === "d"){
    createImage(Date.now())
  }
}, false);
const tick = () => {
    elapsedTime = clock.getElapsedTime()
    starsMaterial.uniforms.uTime.value = elapsedTime * 0.1;
    stars.rotation.y += rSpeed2;
    cloudShaderMaterial.uniforms.uTime.value = elapsedTime * 0.8;

    plane1.material.uniforms.uTime.value = elapsedTime * rSpeed1;
    plane2.material.uniforms.uTime.value = elapsedTime * -2.;
    plane3.material.uniforms.uTime.value = elapsedTime * 2.;

    if(f.deformMainShape){
      setNoise(elapsedTime*10.1)
    }

    plane1.mesh.lookAt( camera.position );
    plane2.mesh.lookAt( camera.position );
    plane3.mesh.lookAt( camera.position );

    controls.update()
    effectComposer.render()

    if( preview && elapsedTime > 1 ){
      fxpreview()
      preview = false
    }

    window.requestAnimationFrame(tick)
}
tick();

/*
* GUI
*/

function addGui(){
  const gui = new GUI();
  const gbloom = gui.addFolder("Bloom");
  gbloom.add(bloom, "enabled").onChange(val => {
    bloomPass.enabled = val
  });;
  gbloom.add(bloom, "strength",0,10).onChange(val => {
    bloomPass.strength = Number(val)
  });
  gbloom.add(bloom, "radius",0,5).onChange(val => {
    bloomPass.radius = Number(val)
  });;
  gbloom.add(bloom, "threshold",0.000001,0.1).onChange(val => {
    bloomPass.threshold = Number(val)
  });
  gui.add(lilGlobal, "reload")
}
// addGui();