/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index_3.js":
/*!************************!*\
  !*** ./src/index_3.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AudioProcessor: () => (/* binding */ AudioProcessor),\n/* harmony export */   animate: () => (/* binding */ animate),\n/* harmony export */   createWaveformSurface: () => (/* binding */ createWaveformSurface),\n/* harmony export */   initScene: () => (/* binding */ initScene)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\nclass AudioProcessor {\n  constructor(audioElement) {\n    this.audioElement = audioElement;\n    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();\n    this.analyser = this.audioContext.createAnalyser();\n    this.analyser.fftSize = 128; // smaller size for better resolution\n    this.bufferLength = this.analyser.frequencyBinCount;\n    this.dataArray = new Uint8Array(this.bufferLength);\n\n    this.source = this.audioContext.createMediaElementSource(audioElement);\n    this.source.connect(this.analyser);\n    this.analyser.connect(this.audioContext.destination);\n  }\n\n  getFrequencyData() {\n    this.analyser.getByteFrequencyData(this.dataArray);\n    return this.dataArray;\n  }\n\n  start() {\n    this.audioElement.play();\n    this.audioContext.resume();\n  }\n\n  stop() {\n    this.audioElement.pause();\n  }\n}\n\n// custom shader material for the spherical surface\nfunction createShaderMaterial() {\n  const vertexShader = `\n    varying vec2 vUv;\n    varying float vElevation;\n    uniform float time;\n    uniform float frequencies[64];\n\n    void main() {\n      vUv = uv;\n\n      // Map UV to frequency index\n      int frequencyIndex = int(uv.x * 63.0);\n      float frequency = frequencies[frequencyIndex];\n\n      // Compute elevation based on frequency\n      vElevation = frequency / 256.0; // Normalize to [0, 1]\n\n      // Apply deformation on the sphere\n      vec3 newPosition = position;\n      float wave = sin(time + position.x * 10.0 + position.y * 10.0) * vElevation * 2.0;\n      newPosition += normal * wave;\n\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);\n    }\n  `;\n\n  const fragmentShader = `\n    varying vec2 vUv;\n    varying float vElevation;\n    uniform float time;\n\n    void main() {\n      // Dynamic color gradient based on elevation\n      vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.5, 0.0), vElevation);\n      color += 0.2 * sin(time * 2.0 + vUv.y * 10.0); // Pulsating effect\n\n      gl_FragColor = vec4(color, 1.0);\n    }\n  `;\n\n  return new three__WEBPACK_IMPORTED_MODULE_0__.ShaderMaterial({\n    vertexShader,\n    fragmentShader,\n    uniforms: {\n      time: { value: 0.0 },\n      frequencies: { value: new Array(64).fill(0) },\n    },\n    side: three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide,\n    wireframe: false,\n  });\n}\n\n// spherical mesh for the audio surface\nfunction createWaveformSurface(material) {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(5, 128, 128);\n  const surface = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(geometry, material);\n  surface.rotation.x = Math.PI / 2; // rotate to position\n  surface.position.y = 0;\n\n  return surface;\n}\n\nfunction initScene(canvas) {\n  const scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\n  const camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\n\n  const renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({ canvas, antialias: true });\n  renderer.setSize(window.innerWidth, window.innerHeight);\n\n  const ambientLight = new three__WEBPACK_IMPORTED_MODULE_0__.AmbientLight(0xffffff, 0.8);\n  scene.add(ambientLight);\n\n  camera.position.set(0, 8, 15);\n  camera.lookAt(0, 0, 0);\n\n  return { scene, camera, renderer };\n}\n\nfunction animate(scene, camera, renderer, mesh, audioProcessor) {\n  requestAnimationFrame(() => animate(scene, camera, renderer, mesh, audioProcessor));\n\n  const frequencyData = audioProcessor.getFrequencyData();\n\n  mesh.material.uniforms.frequencies.value = Array.from(frequencyData.slice(0, 64));\n  mesh.material.uniforms.time.value += 0.02; // faster time progression for smoother movement\n\n  renderer.render(scene, camera);\n}\n\nfunction init() {\n  const canvas = document.getElementById('visualizer');\n  const audioElement = document.getElementById('audio');\n\n  if (!canvas) {\n    console.error('Canvas element not found');\n    return;\n  }\n\n  canvas.width = window.innerWidth;\n  canvas.height = window.innerHeight;\n\n  if (!audioElement) {\n    console.error('Audio element not found');\n    return;\n  }\n\n  const { scene, camera, renderer } = initScene(canvas);\n  const shaderMaterial = createShaderMaterial();\n  const waveformSurface = createWaveformSurface(shaderMaterial);\n\n  scene.add(waveformSurface);\n\n  const audioProcessor = new AudioProcessor(audioElement);\n\n  audioElement.addEventListener('play', () => {\n    console.log('Audio started');\n    audioProcessor.start();\n    animate(scene, camera, renderer, waveformSurface, audioProcessor);\n  });\n\n  audioElement.addEventListener('pause', () => {\n    console.log('Audio paused');\n    audioProcessor.stop();\n  });\n}\n\ninit();\n\n\n//# sourceURL=webpack://flow/./src/index_3.js?");

/***/ }),

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index_3.js");
/******/ 	
/******/ })()
;