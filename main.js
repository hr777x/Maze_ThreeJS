import * as THREE from "three";


// Scene, Camera, and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid dimensions
const rows = 10;
const cols = 10;

// Create the maze grid
function createGrid(rows, cols) {
  const grid = []; // 2D array to store the cells(rows and cols)
  for (let y = 0; y < rows; y++) {
    const row = []; // 1D array to store the cells in a row
    for (let x = 0; x < cols; x++) {
        // Create the cell object that includes the cell's position, visited status, and walls
      row.push({
        x,
        y,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
      });
    }
    //push each row into the grid (10 x 10)
    grid.push(row);
  }
  return grid;
}
// Create the grid and store it in a variable
const grid = createGrid(rows, cols);
console.table(grid);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);



