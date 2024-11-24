const container = document.getElementById("container");

const ROWS = 12;
const COLUMNS = 20;

container.style.display = "grid";
container.style.gridTemplateColumns = `repeat(${COLUMNS}, 1fr)`;

const grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)); //! fill korsi 0 diya
// 0 means walkable... 1 eikhane source dhorsi, 2 eikhane target dhorsi LMAO
// 0 is walkable
// 1 is source
// 2 is target

const source = { x: 1, y: 1 };
const target = { x: 9, y: 16 };

grid[source.x][source.y] = 1; // 1 => source
grid[target.x][target.y] = 2; // 2 => target

for (let i = 0; i < ROWS; i++) {
	for (let j = 0; j < COLUMNS; j++) {
		const div = document.createElement("div");
		if (grid[i][j] !== 1 && grid[i][j] !== 2)
			div.addEventListener("click", () => {
				div.classList.toggle("isWall");
				grid[i][j] = grid[i][j] === 0 ? -1 : 0;
			});

		// const index = i * n + j;
		div.classList.add(`row-${i}`, `col-${j}`, "box");
		if (grid[i][j] === 1) {
			div.textContent = "S";
			div.classList.add("source");
		} else if (grid[i][j] === 2) {
			div.textContent = "T";
			div.classList.add("target");
		}

		container.appendChild(div);
	}
}

const parent = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
// parent is array of array [x, y]

function bfs() {
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

		if (x == target.x && y == target.y) {
			console.log(`found at (${x},${y})`);
			return true;
		}

		for (const [dx, dy] of direction) {
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
