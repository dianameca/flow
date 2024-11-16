import { AudioProcessor } from './audioProcessor';
import { createShapes } from './shapes';
import { applyShaders } from './shaders';

class MusicVisualizer {
  constructor(audioElement, canvasElement) {
    this.audioProcessor = new AudioProcessor(audioElement);
    this.canvas = canvasElement;
    this.shapes = createShapes(this.canvas);
    this.shaders = applyShaders(this.canvas);
  }

  start() {
    this.audioProcessor.initialize();
    this.animate();
  }

  animate() {
    const frequencyData = this.audioProcessor.getFrequencyData();
    this.shapes.update(frequencyData);
    this.shaders.update(frequencyData);
    requestAnimationFrame(this.animate.bind(this));
  }
}

export default MusicVisualizer;