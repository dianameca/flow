export function createWaveformMesh() {
  let geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
  let material = new THREE.MeshBasicMaterial({ color: 0x00aee3 });
  let mesh = new THREE.Group();

  for (let i = 0; i < 128; i++) {
      let cube = new THREE.Mesh(geometry, material);
      cube.position.x = i * 0.2 - 12;
      cube.position.y = 0;
      cube.position.z = 0;
      mesh.add(cube);
  }

  return mesh;
}