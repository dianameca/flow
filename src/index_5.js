import * as THREE from 'three';

export class AudioProcessor {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
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

// high-resolution 3D mesh surface with rounded peaks
export function createWaveformSurface() {
  const width = 256; // increase resolution for smoother surface
  const height = 256;
  const geometry = new THREE.PlaneGeometry(20, 20, width - 1, height - 1);

  const material = new THREE.MeshStandardMaterial({
    color: 0x00aee3,
    side: THREE.DoubleSide,
    metalness: 0.7,
    roughness: 0.2,
  });

  const surface = new THREE.Mesh(geometry, material);

  surface.rotation.x = -Math.PI / 2; // align horizontally
  return surface;
}

export function initScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  camera.position.set(0, 15, 30); // adjust camera
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}

// animation loop to update the scene with frequency data and rounded peaks
export function animate(scene, camera, renderer, mesh, audioProcessor) {
  requestAnimationFrame(() => animate(scene, camera, renderer, mesh, audioProcessor));

  const frequencyData = audioProcessor.getFrequencyData();
  const positions = mesh.geometry.attributes.position.array;

  const widthSegments = Math.sqrt(positions.length / 3); // derive width from vertices count

  for (let i = 0; i < positions.length; i += 3) {
    const xIndex = Math.floor((i / 3) % widthSegments);
    const yIndex = Math.floor(i / (3 * widthSegments));

    const frequencyValue = frequencyData[xIndex % frequencyData.length];
    const smoothPeak = Math.sin(yIndex / widthSegments * Math.PI) * frequencyValue / 128;

    positions[i + 2] = smoothPeak * 5; // adjust peak height
  }

  mesh.geometry.attributes.position.needsUpdate = true; // mark geometry for update
  mesh.geometry.computeVertexNormals(); // smooth shading

  renderer.render(scene, camera);
}

// init all the things
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
  const waveformSurface = createWaveformSurface();

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