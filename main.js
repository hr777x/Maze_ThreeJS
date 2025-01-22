import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


// Grid dimensions
const rows = 10;
const cols = 10;
const cellSize = 1;

//Global declarations for the sphere mesh and body
let sphereMesh;
let sphereBody;
let wall
let wallBody

// Scene, Camera, and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.set(-4, 14, -4);
camera.rotation.set(45, 0,  0);

//adding directional light
const dirLight = new THREE.DirectionalLight(0xffffff,5);
scene.add(dirLight);
dirLight.position.set(0, 10, -8);
//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

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
    if(neighborY >= 0 && neighborX >= 0 && neighborY < rows && neighborX < cols){
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

renderer.setAnimationLoop(animate);
// Visualize the maze in Three.js
function addWall(x, y, direction) {
  //ThreeJs
    const geometry = new THREE.BoxGeometry(cellSize, cellSize / 2, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x91ECFD });
    wall = new THREE.Mesh(geometry, material);

  //CannonJs
  const wallshape = new CANNON.Box(new CANNON.Vec3(cellSize/2, cellSize/4, 0.05))
  wallBody = new CANNON.Body({
    mass: 0,
    shape: wallshape
  });
    switch (direction) {
      case "top":
        wall.position.set(x, 0, y - cellSize / 2);
        physicsWorld.addBody(wallBody)
        wallBody.position.set(x, 0, y - cellSize / 2);
        break;
      case "right":
        wall.position.set(x + cellSize / 2, 0, y);
        wall.rotation.y = Math.PI / 2;
        physicsWorld.addBody(wallBody)
        wallBody.position.set(x + cellSize / 2, 0, y);
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        break;
      case "bottom":
        wall.position.set(x, 0, y + cellSize / 2);
        physicsWorld.addBody(wallBody)
        wallBody.position.set(x, 0, y + cellSize / 2);
        break;
      case "left":
        wall.position.set(x - cellSize / 2, 0, y);
        wall.rotation.y = Math.PI / 2;
        physicsWorld.addBody(wallBody)
        wallBody.position.set(x - cellSize / 2, 0, y);
        // Rotate the wall to be vertical
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        break;
    }
  
    scene.add(wall);
  }
  
  function addFloor(x, y) {
    const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const material = new THREE.MeshStandardMaterial({ color: 0xFDEC91, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor to be horizontal pi = 180 degrees
    floor.position.set(x, -cellSize / 4, y);
    scene.add(floor);
  }
  
  function visualizeMaze(grid) {
    // Loop through each cell in the grid
    for (const row of grid) {
      for (const cell of row) {
        const { x, y, walls } = cell;
  
        if (walls.top) addWall(x, y, "top");
        if (walls.right) addWall(x, y, "right");
        if (walls.bottom) addWall(x, y, "bottom");
        if (walls.left) addWall(x, y, "left");
  
        addFloor(x, y);
      }
    }
  }

  //setting up the physics world (cannon-es)
  const physicsWorld = new CANNON.World({gravity: new CANNON.Vec3(0, -9.82, 0)}); //setting gravity


  // const cannondebug = new CannonDebugger(scene, physicsWorld);
  
  //creating a static ground plane
  const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane()
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsWorld.addBody(groundBody);
  groundBody.position.set(0,-0.25,0);
  
  //helps to visualize the world axis
  // const axisHelper = new THREE.AxesHelper(5);
  // scene.add(axisHelper);


  function createSphere(x, y) {
    //Three.js World
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.position.set(x, 5, y);
    scene.add(sphereMesh);

    //Cannon.js World
    const shape = new CANNON.Sphere(0.3);
    sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(x, 5, y),
      shape,
      linearDamping: 0.3,
    });
    //Add the sphere body to the physics world
    physicsWorld.addBody(sphereBody);

  }

  
    document.addEventListener("keydown", (e) => {

    const force = 40;

    switch(e.key){
        case "ArrowUp":
          sphereBody.applyForce(new CANNON.Vec3(0, 0, force), sphereBody.rotation);
            break;
        case "ArrowDown":
            sphereBody.applyForce(new CANNON.Vec3(0, 0, -force), sphereBody.rotation);
            break;
        case "ArrowLeft":
            sphereBody.applyForce(new CANNON.Vec3(force, 0, 0), sphereBody.rotation);
            break;
        case "ArrowRight":
          //Apply force to the right
            sphereBody.applyForce(new CANNON.Vec3(-force , 0, 0), sphereBody.rotation);
            break;
    }
  });

  document.addEventListener("keyup", (e) => {
    //on keyup, stop the sphere
    switch(e.key){
        case "ArrowUp":
        case "ArrowDown":
            sphereBody.velocity.z = 0;
            break;
        case "ArrowLeft":
        case "ArrowRight":
            sphereBody.velocity.x = 0;
            break;
    }
  });

  
  visualizeMaze(grid);
  createSphere(0, 0);

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( window.innerWidth, window.innerHeight );
  
  }

  function animate() {
    // requestAnimationFrame(animate);
    controls.update();
    physicsWorld.fixedStep();  //The physics world is updated in small, fixed intervals during each frame. Default is 1/60 seconds.
    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);
    // cannondebug.update();
    onWindowResize();
    renderer.render(scene, camera);
  }