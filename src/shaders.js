export function applyShaders(canvas) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
  
    const vertexShader = `...`; 
    const fragmentShader = `...`;
  
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }
  
    function update(frequencyData) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
    }
  
    return { update };
  }
  