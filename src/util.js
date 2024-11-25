export function initScene() {
  let scene = new THREE.Scene();
  let light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);
  return scene;
}
