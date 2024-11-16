class AudioProcessor {
    constructor(audioElement) {
      this.audioElement = audioElement;
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.analyser.fftSize = 256;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }
  
    getFrequencyData() {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
  
    start() {
      this.audioElement.play();
    }
  
    stop() {
      this.audioElement.pause();
    }
  }
  
  module.exports = AudioProcessor;
  