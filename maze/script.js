const container = document.getElementById("container");

const ROWS = 15;
const COLUMNS = 20;

container.style.display = "grid";
container.style.gridTemplateColumns = `repeat(${COLUMNS}, 1fr)`;

const grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)); //! fill korsi 0 diya
// 0 is walkable
// 1 is source
// 2 is target
// 3 is FoundPath (used in reset)
// 4 is visitedPath => pale color hobe jegula visit hobe

const source = { x: 1, y: 1 };
const target = { x: 9, y: 16 };

grid[source.x][source.y] = 1; // 1 => source
grid[target.x][target.y] = 2; // 2 => target

// contains the HTML elements called "BOX" which are actually the cells
const boxes = [];

for (let i = 0; i < ROWS; i++) {
	for (let j = 0; j < COLUMNS; j++) {
		var box = document.createElement("box");

		box.dataset.row = i;
		box.dataset.col = j;

		// const index = i * n + j;
		box.classList.add(`row-${i}`, `col-${j}`, "box");
		if (grid[i][j] === 1) {
			box.textContent = "S";
			box.classList.add("source");
		} else if (grid[i][j] === 2) {
			box.textContent = "T";
			box.classList.add("target");
		}

		boxes.push(box);
		container.appendChild(box);
	}
}

boxes.forEach((box) => {
	box.addEventListener("click", (event) => {
		let x = event.target.dataset.row;
		let y = event.target.dataset.col;

		if (grid[x][y] == 0) {
			grid[x][y] = -1;
			event.target.classList.toggle("isWall");
		} else {
			grid[x][y] = 0;
			event.target.classList.toggle("isWall");
		}
	});
});

//* wall coloring
// if (grid[i][j] !== 1 && grid[i][j] !== 2)
// 	div.addEventListener("click", () => {
// 		div.classList.toggle("isWall");
// 		grid[i][j] = grid[i][j] === 0 ? -1 : 0;
// 	});

const parent = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

async function bfs() {
	const visited = Array.from({ length: ROWS }, () =>
		Array(COLUMNS).fill(false)
	);

	const queue = [source];
	visited[source.x][source.y] = true;

	const direction = [
		[-1, 0],
		[1, 0],
		[0, 1],
		[0, -1],
	];

	while (queue.length > 0) {
		const { x, y } = queue.shift();
		//! coloring grid cell with 3 => Found Path
		grid[x][y] = 3;

		if (x == target.x && y == target.y) {
			return true;
		}

		for (const [dx, dy] of direction) {
			// timeout
			// await new Promise((res) => setTimeout(res, 1));

			newX = x + dx;
			newY = y + dy;

			if (newX == target.x && newY == target.y) {
				console.log(`found at (${x},${y})`);
				parent[newX][newY] = { x: x, y: y }; // to keep track of path taken
				return true;
			}

			// bounds to check : row, col, visited, walkable (not wall)
			if (
				newX >= 0 &&
				newX < ROWS &&
				newY >= 0 &&
				newY < COLUMNS &&
				!visited[newX][newY] &&
				grid[newX][newY] === 0
			) {
				parent[newX][newY] = { x: x, y: y }; // to keep track of path taken

				// color visited
				grid[newX][newY] = 4;
				const visitedCell = document.querySelector(`.row-${newX}.col-${newY}`);
				visitedCell.classList.add(`isVisited`);

				visited[newX][newY] = true;

				queue.push({ x: newX, y: newY });
			}
		}
	}
	return false;
}

const startbtn = document.getElementById("run-bfs");
startbtn.addEventListener("click", () => {
	console.log(bfs());
	let curr_x = target.x;
	let curr_y = target.y;

	while (curr_x != source.x || curr_y != source.y) {
		p = parent[curr_x][curr_y];
		if (!p) break;
		curr_x = p.x;
		curr_y = p.y;

		// add path color
		const pathCell = document.querySelector(`.row-${curr_x}.col-${curr_y}`);
		pathCell.classList.add(`path`);
	}
});

const resetPathBtn = document.getElementById("reset-path");
resetPathBtn.addEventListener("click", () => {
	boxes.forEach((box) => {
		let x = box.dataset.row;
		let y = box.dataset.col;

		if (grid[x][y] == 3 || grid[x][y] == 4) {
			grid[x][y] = -1;

			box.className = "";

			box.classList.add(`row-${x}`, `col-${y}`, "box");
		}
	});
});
