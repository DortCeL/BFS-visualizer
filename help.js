const container = document.getElementById("container");
const rowInput = document.getElementById("row-input");
const colInput = document.getElementById("col-input");
const createGridBtn = document.getElementById("create-grid-btn");
const runBfsBtn = document.getElementById("run-bfs-btn");
const errorMsg = document.getElementById("error-msg");
const resetPathBtn = document.getElementById("reset-path-btn");
const resetEverythingBtn = document.getElementById("reset-everything-btn");

let gridExists = false;
let resetRequired = false;
let clickCounter = 0;

let grid = [];
let cellElements = [];
let parent = [];

let ROW = 0;
let COL = 0;
const source = [0, 0];
const target = [0, 0];

// Utility Functions
const showError = (message) => (errorMsg.textContent = message);
const clearError = () => (errorMsg.textContent = "");

const isValidCell = (x, y) =>
	x >= 0 && x < ROW && y >= 0 && y < COL && grid[x][y] === 0;

const resetCellClasses = (cell) => {
	cell.className = `cell row-${cell.dataset.row} col-${cell.dataset.col}`;
};

// Create Grid
createGridBtn.addEventListener("click", () => {
	if (gridExists) {
		showError("Grid already exists! Reset to create a new one.");
		return;
	}

	clearError();
	ROW = parseInt(rowInput.value, 10);
	COL = parseInt(colInput.value, 10);

	if (isNaN(ROW) || isNaN(COL) || ROW <= 0 || COL <= 0) {
		showError("Please enter valid dimensions.");
		return;
	}

	grid = Array.from({ length: ROW }, () => Array(COL).fill(0));
	parent = Array.from({ length: ROW }, () => Array(COL).fill(null));
	container.style.gridTemplateColumns = `repeat(${COL}, 1fr)`;

	for (let i = 0; i < ROW; i++) {
		for (let j = 0; j < COL; j++) {
			const cell = document.createElement("div");
			cell.className = `cell row-${i} col-${j}`;
			cell.dataset.row = i;
			cell.dataset.col = j;

			cell.addEventListener("click", () => handleCellClick(i, j, cell));
			cellElements.push(cell);
			container.appendChild(cell);
		}
	}

	gridExists = true;
	showError("Click cells to set Source, Target, or Walls.");
});

// Handle Cell Click
function handleCellClick(i, j, cell) {
	if (resetRequired) {
		showError("Reset path before modifying.");
		return;
	}

	clickCounter++;
	if (clickCounter === 1 && grid[i][j] !== 2) {
		setSource(i, j, cell);
	} else if (clickCounter === 2 && grid[i][j] !== 1) {
		setTarget(i, j, cell);
	} else {
		toggleWall(i, j, cell);
	}
}

function setSource(i, j, cell) {
	grid[i][j] = 1;
	[source[0], source[1]] = [i, j];
	cell.classList.add("isSource");
}

function setTarget(i, j, cell) {
	grid[i][j] = 2;
	[target[0], target[1]] = [i, j];
	cell.classList.add("isTarget");
}

function toggleWall(i, j, cell) {
	if (grid[i][j] !== 1 && grid[i][j] !== 2) {
		grid[i][j] = grid[i][j] === -1 ? 0 : -1;
		cell.classList.toggle("isWall");
	}
}

// BFS Algorithm
function bfs() {
	const visited = Array.from({ length: ROW }, () => Array(COL).fill(false));
	const queue = [[...source]];
	const directions = [
		[-1, 0],
		[0, 1],
		[1, 0],
		[0, -1],
	];

	visited[source[0]][source[1]] = true;

	while (queue.length > 0) {
		const [x, y] = queue.shift();

		if (x === target[0] && y === target[1]) {
			return true;
		}

		for (const [dx, dy] of directions) {
			const newX = x + dx;
			const newY = y + dy;

			if (isValidCell(newX, newY) && !visited[newX][newY]) {
				visited[newX][newY] = true;
				grid[newX][newY] = 3;
				parent[newX][newY] = [x, y];

				const cell = document.querySelector(`.row-${newX}.col-${newY}`);
				cell.classList.add("isVisited");

				queue.push([newX, newY]);
			}
		}
	}

	return false;
}

// Highlight Path
function highlightPath() {
	let [x, y] = target;
	while (parent[x][y]) {
		const [prevX, prevY] = parent[x][y];
		if (prevX === source[0] && prevY === source[1]) break;

		grid[prevX][prevY] = 4;
		const pathCell = document.querySelector(`.row-${prevX}.col-${prevY}`);
		pathCell.classList.add("isPath");

		[x, y] = [prevX, prevY];
	}
}

// Run BFS
runBfsBtn.addEventListener("click", () => {
	if (!gridExists) {
		showError("No grid found.");
		return;
	}

	if (clickCounter < 2) {
		showError("Please set Source and Target nodes.");
		return;
	}

	clearError();
	const pathFound = bfs();

	if (pathFound) {
		highlightPath();
		showError("Path found! Check the grid.");
	} else {
		showError("Target is unreachable.");
	}

	resetRequired = true;
});

// Reset Path
resetPathBtn.addEventListener("click", () => {
	for (let i = 0; i < ROW; i++) {
		for (let j = 0; j < COL; j++) {
			if (grid[i][j] === 3 || grid[i][j] === 4) {
				grid[i][j] = 0;
				const cell = document.querySelector(`.row-${i}.col-${j}`);
				resetCellClasses(cell);
			}
		}
	}
	resetRequired = false;
	clearError();
});

// Reset Everything
resetEverythingBtn.addEventListener("click", () => {
	container.innerHTML = "";
	gridExists = false;
	clickCounter = 0;
	cellElements = [];
	parent = [];
	grid = [];
	resetRequired = false;
	showError("Grid cleared!");
});
