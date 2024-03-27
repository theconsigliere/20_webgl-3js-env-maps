import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { RGBELoader } from "three/examples/jsm/Addons.js"
import { EXRLoader } from "three/examples/jsm/Addons.js"
import { GroundProjectedSkybox } from "three/examples/jsm/Addons.js"

/**
 * Base
 */
// Debug
const gui = new GUI()
const global = {
  envMapIntensity: 1,
  backgroundBlur: 0,
  backgroundIntensity: 1,
}
gui
  .add(global, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.0001)
  .onChange(() => {
    updateAllMaterials()
  })

gui
  .add(global, "backgroundBlur")
  .min(0)
  .max(1)
  .step(0.0001)
  .onChange(() => {
    scene.backgroundBlurriness = global.backgroundBlur
  })

gui
  .add(global, "backgroundIntensity")
  .min(0)
  .max(5)
  .step(0.0001)
  .onChange(() => {
    scene.backgroundIntensity = global.backgroundIntensity
  })

// LOADERS

const GLTFloader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const exrLoader = new EXRLoader()
const textureLoader = new THREE.TextureLoader()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// update all amterials

const updateAllMaterials = () => {
  // called for all children in the scene
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      //   child.material.envMap = scene.environment
      child.material.envMapIntensity = global.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    metalness: 1,
    roughness: 0.2,
    color: 0x00ff00,
  })
)
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

// LOAD MODEL
GLTFloader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(10, 10, 10)
  scene.add(gltf.scene)

  updateAllMaterials()
})

// LOAD CUBE TEXTURE
///LDR CUBE TER

// const environmentMap = cubeTextureLoader.load([
//   "/environmentMaps/0/px.png",
//   "/environmentMaps/0/nx.png",
//   "/environmentMaps/0/py.png",
//   "/environmentMaps/0/ny.png",
//   "/environmentMaps/0/pz.png",
//   "/environmentMaps/0/nz.png",
// ])

// scene.background = environmentMap
// scene.environment = environmentMap

// HDR CUBE TEXTURE
// rgbeLoader.load("/environmentMaps/0/2k.hdr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping
//   scene.background = texture
//   scene.environment = texture
//   updateAllMaterials()
// })

// EXR CUBE TEXTURE
// exrLoader.load("/environmentMaps/nvidiaCanvas-4k.exr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping
//   scene.background = texture
//   scene.environment = texture
//   updateAllMaterials()
// })

// TEXTURES
// const envMap = textureLoader.load(
//   "environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg"
// )
// envMap.mapping = THREE.EquirectangularReflectionMapping
// envMap.encoding = THREE.sRGBEncoding

// scene.background = envMap
// scene.environment = envMap

// GROUND PROJECTED SKYBOX
// rgbeLoader.load("/environmentMaps/2/2k.hdr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping
//   //scene.background = texture
//   scene.environment = texture

//   //skybox
//   const skybox = new GroundProjectedSkybox(texture)
//   skybox.scale.setScalar(50)
//   scene.add(skybox)

//   gui.add(skybox, "radius").min(0).max(200).step(0.01).name("skybox radius")
//   gui.add(skybox, "height").min(0).max(1).step(0.01).name("skybox height")
// })

// REAL TIME ENVIRONMENT MAP
const envMap = textureLoader.load(
  "environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg"
)
envMap.mapping = THREE.EquirectangularReflectionMapping
envMap.colorSpace = THREE.SRGBColorSpace

scene.background = envMap
//scene.environment = envMap

// HOLY DONUT
const donut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(10, 4, 2),
  })
)
donut.layers.enable(1)
donut.position.y = 3.5
scene.add(donut)

// cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
})

scene.environment = cubeRenderTarget.texture

// cube render camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
  // Time
  const elapsedTime = clock.getElapsedTime()

  // real time env map
  if (donut) {
    donut.rotation.x = Math.sin(elapsedTime) * 1.5
    cubeCamera.update(renderer, scene)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
