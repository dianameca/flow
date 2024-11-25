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

  getTimeDomainData() {
      this.analyser.getByteTimeDomainData(this.dataArray);
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