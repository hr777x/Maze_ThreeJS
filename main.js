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

function generateMaze(grid, currentCell){
    currentCell.visited = true;  // Mark the current cell as visited
    const directions = shuffle(["top", "right", "bottom", "left"]); // Randomize the order of exploration
    for(const direction of directions){
        const neighbor = getNeighbors(grid, currentCell, direction); // Get the neighboring cell in the given direction
        if(neighbor && !neighbor.visited){
            // Remove the walls between the current cell and the neighbor
            currentCell.walls[direction] = false;
            neighbor.walls[getOppositeDirection(direction)] = false;
            // Recursively call the function with the neighbor as the current cell(depth-first traversal)
            generateMaze(grid, neighbor);
        }
    }

}
generateMaze(grid, grid[0][0]);

function getNeighbors(grid, currentCell, direction){
    // Deltas for each direction ()
    // Deltas represent the relative x and y coordinate changes for each direction (top, right, bottom, left),
// used to calculate the position of neighboring cells in the grid.

    const deltas = {
        top: { x: 0, y: -1 },
        right: { x: 1, y: 0 },
        bottom: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
    };
    // Get the deltas for the direction
    const { x, y } = deltas[direction];

    const neighborY = currentCell.y + y;
    const neighborX = currentCell.x + x;

    // Check if the neighbor is within the grid
    if(neighborY < 0 && neighborX < 0 && neighborY > rows && neighborX > cols){
        return grid[neighborY][neighborX];
    }
    return null;
};

//shuffling the directions
function shuffle(arr){
    return arr.sort(() => Math.random() - 0.5);
}

// get opposite direction
function getOppositeDirection(direction){
    
    return {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
    }[direction];
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);



