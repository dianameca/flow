const AudioProcessor = require('./audioProcessor');
const Renderer = require('./renderer');

class AudioDisplay {
  constructor(audioElement, canvasElement) {
    this.audioProcessor = new AudioProcessor(audioElement);
    this.renderer = new Renderer(canvasElement);
  }

  start() {
    this.audioProcessor.start();
    this.render();
  }

  stop() {
    this.audioProcessor.stop();
  }

  render() {
    requestAnimationFrame(() => this.render());
    const frequencyData = this.audioProcessor.getFrequencyData();
    this.renderer.renderBars(frequencyData);
  }
}

module.exports = AudioDisplay;
