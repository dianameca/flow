import * as THREE from 'three';

export class AudioProcessor {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; // low resolution - calmer
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

// rotating circular visualizer that responds to audio
function createRotatingCircleVisualizer() {
  const points = [];
  const radius = 30;
  const pointCount = 100;

  // create points arranged in a circle
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2; // full circle
    points.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0));
  }

  // CatmullRomCurve3 for a closed circular loop
  const curve = new THREE.CatmullRomCurve3(points);
  curve.closed = true;  // Ensure the curve is closed

  // geometry for the circle based on the initial points
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  // initial curve points
  for (let i = 0; i < pointCount; i++) {
    const point = curve.getPoint(i / pointCount);
    vertices.push(point.x, point.y, point.z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  // material for the line (blue color)
  const material = new THREE.LineBasicMaterial({
    color: 0x00aee3,
    linewidth: 3,
    opacity: 0.8,
    transparent: true
  });

  // create the line mesh from the geometry and material
  const line = new THREE.LineLoop(geometry, material);
  return { line, curve, geometry };
}

// init the scene, camera, and renderer
export function initScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}

// animate the circle with frequency data
export function animate(scene, camera, renderer, visualizer, audioProcessor) {
  requestAnimationFrame(() => animate(scene, camera, renderer, visualizer, audioProcessor));

  const frequencyData = audioProcessor.getFrequencyData();

  // modify the y positions of the circle points based on frequency data
  const curve = visualizer.curve;
  const positions = visualizer.geometry.attributes.position.array;

  let i = 1;
  for (let j = 0; j < frequencyData.length; j++) {
    const yPos = (frequencyData[j] / 255) * 5;  // scale the frequency data to move points up and down
    positions[i] = yPos * Math.sin(j * 0.05 + performance.now() * 0.002);  // smooth wave
    i += 3;
  }

  // update the geometry
  visualizer.geometry.attributes.position.needsUpdate = true;

  // rotate the line around center
  visualizer.line.rotation.z += 0.002;  // Slow rotation for smooth motion

  // render the scene
  renderer.render(scene, camera);
}

// init the audio element and scene
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
  const visualizer = createRotatingCircleVisualizer();
  scene.add(visualizer.line);

  // init the audio processor
  const audioProcessor = new AudioProcessor(audioElement);

  audioElement.addEventListener('play', () => {
    console.log('Audio started');
    audioProcessor.start();
    animate(scene, camera, renderer, visualizer, audioProcessor);
  });

  audioElement.addEventListener('pause', () => {
    console.log('Audio paused');
    audioProcessor.stop();
  });
}

init();