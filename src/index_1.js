import * as THREE from 'three';

export class AudioProcessor {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
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

function createSmoothSurface() {
  const geometry = new THREE.BufferGeometry();
  
  const width = 50;
  const height = 50;
  const spacing = 0.5;
  
  const positions = [];
  
  // create points in a grid pattern with finer resolution
  for (let x = -width / 2; x < width / 2; x += spacing) {
    for (let z = -height / 2; z < height / 2; z += spacing) {
      positions.push(x, 0, z); // Add point position in 3D space
    }
  }

  // Set the positions array to the geometry
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x00aee3,
    size: 0.3,
    opacity: 0.8,
    transparent: true,
  });

  const points = new THREE.Points(geometry, material);
  return points;
}

export function initScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  camera.position.set(0, 20, 40); 
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}

export function animate(scene, camera, renderer, pointSurface, audioProcessor) {
  requestAnimationFrame(() => animate(scene, camera, renderer, pointSurface, audioProcessor));

  const frequencyData = audioProcessor.getFrequencyData();

  const positions = pointSurface.geometry.attributes.position.array;

  let i = 0;
  for (let x = -25; x < 25; x += 0.5) { // adjusted for fine density
    for (let z = -25; z < 25; z += 0.5) {
      const yPos = frequencyData[i % frequencyData.length] / 256; // map frequency to height
      // Apply fluid, synchronized wave motion to the entire surface
      positions[i + 1] = Math.sin(x * 0.1 + performance.now() * 0.005) * 3; // smooth undulation
      positions[i + 2] = Math.cos(z * 0.1 + performance.now() * 0.005) * 3; // smooth undulation
      positions[i + 1] += yPos * 5; // apply frequency data as undulation height

      i += 3;
    }
  }

  // Notify geometry that the positions have been updated
  pointSurface.geometry.attributes.position.needsUpdate = true;

  // apply continuous rotation to the surface for better viewing
  pointSurface.rotation.y += 0.001; // Slow rotation on Y axis

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
  const pointSurface = createSmoothSurface();
  scene.add(pointSurface);

  const audioProcessor = new AudioProcessor(audioElement);

  audioElement.addEventListener('play', () => {
    console.log('Audio started');
    audioProcessor.start();
    animate(scene, camera, renderer, pointSurface, audioProcessor);
  });

  audioElement.addEventListener('pause', () => {
    console.log('Audio paused');
    audioProcessor.stop();
  });
}

init();
