import * as THREE from 'three';

export class AudioProcessor {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 128;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  start() {
    this.audioElement.play();
    this.audioContext.resume();
  }

  stop() {
    this.audioElement.pause();
  }
}

// custom shader material for the surface
function createShaderMaterial() {
  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;
    uniform float frequencies[64];

    void main() {
      vUv = uv;

      // Map UV to frequency index
      int frequencyIndex = int(uv.x * 63.0);
      float frequency = frequencies[frequencyIndex];

      // Compute elevation based on frequency
      vElevation = frequency / 256.0; // Normalize to [0, 1]

      // Smooth, rounded deformation
      vec3 newPosition = position;
      newPosition.z += sin((uv.x + time) * 10.0) * vElevation * 2.0; // Motion on X-axis
      newPosition.z += sin((uv.y + time) * 10.0) * vElevation * 2.0; // Motion on Y-axis

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;

    void main() {
      // Dynamic color gradient based on elevation
      vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.5, 0.0), vElevation);
      color += 0.2 * sin(time * 2.0 + vUv.y * 10.0); // Pulsating effect

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0.0 },
      frequencies: { value: new Array(64).fill(0) },
    },
    side: THREE.DoubleSide,
    wireframe: false,
  });
}

// large mesh for the audio surface
export function createWaveformSurface(material) {
  const geometry = new THREE.PlaneGeometry(20, 20, 64 - 1, 64 - 1);
  const surface = new THREE.Mesh(geometry, material);

  surface.rotation.x = -Math.PI / 2; // Lay it flat
  surface.position.y = 0;

  return surface;
}

// init
export function initScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // antialiasing for smooth visuals
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  camera.position.set(0, 8, 15); // position the camera
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}

// animation loop with audio data feeding the shader
export function animate(scene, camera, renderer, mesh, audioProcessor) {
  requestAnimationFrame(() => animate(scene, camera, renderer, mesh, audioProcessor));

  
  const frequencyData = audioProcessor.getFrequencyData();

  // update the shader uniform with frequency data
  mesh.material.uniforms.frequencies.value = Array.from(frequencyData.slice(0, 64));
  mesh.material.uniforms.time.value += 0.01;

  renderer.render(scene, camera);
}

function init() {
  const canvas = document.getElementById('visualizer');
  const audioElement = document.getElementById('audio');

  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (!audioElement) {
    console.error('Audio element not found');
    return;
  }

  const { scene, camera, renderer } = initScene(canvas);
  const audioProcessor = new AudioProcessor(audioElement);
  const shaderMaterial = createShaderMaterial();
  const waveformSurface = createWaveformSurface(shaderMaterial);

  scene.add(waveformSurface);

  audioElement.addEventListener('play', () => {
    console.log('Audio started');
    audioProcessor.start();
    animate(scene, camera, renderer, waveformSurface, audioProcessor);
  });

  audioElement.addEventListener('pause', () => {
    console.log('Audio paused');
    audioProcessor.stop();
  });
}

init();
