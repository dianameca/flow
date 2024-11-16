class Renderer {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      this.context = this.canvas.getContext('2d');
    }
  
    renderBars(frequencyData) {
      const barWidth = this.canvas.width / frequencyData.length;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      frequencyData.forEach((value, index) => {
        const barHeight = value;
        this.context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        this.context.fillRect(index * barWidth, this.canvas.height - barHeight, barWidth, barHeight);
      });
    }
  
    renderWaveform(frequencyData) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.beginPath();
      frequencyData.forEach((value, index) => {
        const x = (index / frequencyData.length) * this.canvas.width;
        const y = (value / 255) * this.canvas.height;
        if (index === 0) this.context.moveTo(x, y);
        else this.context.lineTo(x, y);
      });
      this.context.stroke();
    }
  }
  
  module.exports = Renderer;
  