class AudioProcessor {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  initialize() {
    this.audioElement.play();
  }

  getFrequencyData() {
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);
    return frequencyData;
  }
}

export { AudioProcessor };