export function createShapes(canvas) {
  const ctx = canvas.getContext('2d');
  let shapes = [];

  function createCircle(radius, x, y) {
    return { radius, x, y };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fill();
    });
  }

  function update(frequencyData) {
    shapes = frequencyData.map((value, index) => createCircle(value / 2, index * 20, canvas.height / 2));
    draw();
  }

  return { update };
} 