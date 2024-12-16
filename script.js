const gridElement = document.getElementById("grid");
const rows = 20, cols = 20;
let startNode = null, endNode = null, isRunning = false;
let animationDelay = 100; // in ms
const grid = [];

// Create grid
function createGrid() {
  gridElement.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
  gridElement.style.gridTemplateRows = `repeat(${rows}, 25px)`;

  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      grid[r][c] = { element: cell, type: "empty" }; // type: "empty", "start", "end", "obstacle"
      gridElement.appendChild(cell);

      // Add event listeners for interactions
      cell.addEventListener("mousedown", (e) => handleMouseDown(e, r, c));
      cell.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
}

// Handle cell clicks
function handleMouseDown(e, row, col) {
  const cell = grid[row][col];

  if (e.button === 0) {
    // Left click: Add obstacle
    if (cell.type === "empty") {
      cell.type = "obstacle";
      cell.element.classList.add("obstacle");
    }
  } else if (e.button === 2) {
    // Right click: Remove obstacle
    if (cell.type === "obstacle") {
      cell.type = "empty";
      cell.element.classList.remove("obstacle");
    }
  }
}

// Handle keyboard controls
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "s":
      setStart();
      break;
    case "e":
      setEnd();
      break;
    case "r":
      resetGrid();
      break;
    case "g":
      randomizeObstacles();
      break;
    case " ":
      if (!isRunning) runAlgorithm();
      break;
    case "f":
      toggleFreeMovement();
      break;
    case "arrowup":
      animationDelay = Math.max(50, animationDelay - 50);
      break;
    case "arrowdown":
      animationDelay += 50;
      break;
  }
});

// Set start and end points
function setStart() {
  if (startNode) startNode.element.classList.remove("start");
  startNode = getRandomEmptyCell();
  startNode.type = "start";
  startNode.element.classList.add("start");
}

function setEnd() {
  if (endNode) endNode.element.classList.remove("end");
  endNode = getRandomEmptyCell();
  endNode.type = "end";
  endNode.element.classList.add("end");
}

// Reset grid
function resetGrid() {
  grid.forEach(row => row.forEach(cell => {
    cell.type = "empty";
    cell.element.className = "cell";
  }));
  startNode = endNode = null;
}

// Randomize obstacles
function randomizeObstacles() {
  grid.forEach(row => row.forEach(cell => {
    if (Math.random() < 0.3 && cell.type === "empty") {
      cell.type = "obstacle";
      cell.element.classList.add("obstacle");
    }
  }));
}

// Get a random empty cell
function getRandomEmptyCell() {
  let cell;
  do {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    cell = grid[row][col];
  } while (cell.type !== "empty");
  return cell;
}

// Run A* algorithm
async function runAlgorithm() {
  if (!startNode || !endNode) return alert("Set both start and end points!");
  isRunning = true;

  const openSet = [startNode];
  const closedSet = [];
  const cameFrom = new Map();

  const gScore = new Map(grid.flat().map(cell => [cell, Infinity]));
  const fScore = new Map(grid.flat().map(cell => [cell, Infinity]));

  gScore.set(startNode, 0);
  fScore.set(startNode, heuristic(startNode, endNode));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    const current = openSet.shift();

    if (current === endNode) {
      reconstructPath(cameFrom, current);
      isRunning = false;
      return;
    }

    closedSet.push(current);

    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      if (closedSet.includes(neighbor) || neighbor.type === "obstacle") continue;

      const tentativeG = gScore.get(current) + 1;
      if (tentativeG < gScore.get(neighbor)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, endNode));

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }

    current.element.classList.add("visited");
    await delay(animationDelay);
  }

  alert("No path found!");
  isRunning = false;
}

// Heuristic function
function heuristic(a, b) {
  return Math.abs(a.element.dataset.row - b.element.dataset.row) +
         Math.abs(a.element.dataset.col - b.element.dataset.col);
}

// Get neighbors of a cell
function getNeighbors(cell) {
  const row = parseInt(cell.element.dataset.row);
  const col = parseInt(cell.element.dataset.col);
  const neighbors = [];

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < rows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < cols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

// Reconstruct the path
async function reconstructPath(cameFrom, current) {
  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    if (current !== startNode) current.element.classList.add("path");
    await delay(animationDelay);
  }
}

// Delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize grid
createGrid();