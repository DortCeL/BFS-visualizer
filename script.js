// TODO: S ar T should be modifiable
// TODO: User manual : hover

// -1 -> wall
// 0  -> walkable
// 1  -> source
// 2  -> target
// 3  -> visited
// 4  -> taken Path

const container = document.getElementById("container");
const row_input = document.getElementById("row-input");
const col_input = document.getElementById("col-input");
const create_grid_btn = document.getElementById("create-grid-btn");
const run_bfs_btn = document.getElementById("run-bfs-btn");
const error_msg = document.getElementById("error-msg");
const reset_path_btn = document.getElementById("reset-path-btn");
const reset_everything_btn = document.getElementById("reset-everything-btn");
const stop_btn = document.getElementById("stop-btn");

// to resist creating grid over existing grid
let grid_exists = false;
let reset_required = false; // path show kora obosthay jate wall modify kora na jay sheta ensure korar jonno
let click_counter = 0;
let bfs_running = false;

let simulation_delay = 10;

let grid = [];
let cell_elements = [];
let parent = [];

let ROW = 0;
let COL = 0;
let source = [0, 0];
let target = [0, 0];

const set_error_msg = (message) => {
	error_msg.textContent = message;
};

create_grid_btn.addEventListener("click", () => {
	if (bfs_running) return;

	if (grid_exists) {
		set_error_msg("Grid already exists! Reset to create a new one.");
		return;
	}

	set_error_msg("");
	ROW = parseInt(row_input.value, 10);
	COL = parseInt(col_input.value, 10);

	// check for valid row and col input
	if (ROW <= 0 || COL <= 0 || isNaN(ROW) || isNaN(COL)) {
		set_error_msg("Please enter valid dimensions.");
		return;
	}

	// create grid and parent
	grid = Array.from({ length: ROW }, () => Array(COL).fill(0));
	parent = Array.from({ length: ROW }, () => Array(COL).fill(null));
	container.style.gridTemplateColumns = `repeat(${COL}, 1fr)`;

	for (let i = 0; i < ROW; i++) {
		for (let j = 0; j < COL; j++) {
			const cell = document.createElement("div");
			cell.classList.add(`row-${i}`, `col-${j}`, "cell");
			cell.dataset.row = i;
			cell.dataset.col = j;
			// now each cell has attrib => data-row="i", data-col="j"
			//! parseInt(... , 10) before use

			cell.addEventListener("click", () => {
				if (reset_required) {
					set_error_msg("Reset path before modifying");
					return;
				}

				click_counter++;
				if (click_counter === 1 && grid[i][j] !== 2) {
					grid[i][j] = 1;
					source = [i, j];
					cell.classList.add("isSource");
				} else if (click_counter === 2 && grid[i][j] !== 1) {
					grid[i][j] = 2;
					target = [i, j];
					cell.classList.add("isTarget");
				} else {
					if (grid[i][j] !== 1 && grid[i][j] !== 2) {
						grid[i][j] = grid[i][j] === -1 ? 0 : -1;
						cell.classList.toggle("isWall");
						if (cell.classList.contains("isVisited"))
							cell.classList.remove("isVisited");
						if (cell.classList.contains("isPath"))
							cell.classList.remove("isPath");
					}
				}
			});

			cell_elements.push(cell);
			container.appendChild(cell);
		}
	}
	grid_exists = true;
	set_error_msg("Click on cells to place Start & End positions and Bombs...");
});

// BFS ALGORITHM
async function bfs() {
	const visited = Array.from({ length: ROW }, () => Array(COL).fill(false));
	const queue = [[...source]];
	const direction = [
		[-1, 0],
		[0, 1],
		[1, 0],
		[0, -1],
	];

	visited[source[0]][source[1]] = true;

	while (queue.length > 0) {
		const [x, y] = queue.shift();

		// ! BFS kaj na korle eita un-comment korbo
		// if (x === target[0] && y === target[1]) return true;

		for (const [dx, dy] of direction) {
			const newX = x + dx;
			const newY = y + dy;

			//! let's see if this works
			if (newX === target[0] && newY === target[1]) {
				parent[newX][newY] = [x, y];
				return true;
			}

			// row bound, col bound, visitedBOund, walkable
			if (
				newX >= 0 &&
				newX < ROW &&
				newY >= 0 &&
				newY < COL &&
				!visited[newX][newY] &&
				grid[newX][newY] === 0
			) {
				visited[newX][newY] = true;
				grid[newX][newY] = 3;
				parent[newX][newY] = [x, y];

				// COLORING VISITED CELL
				await new Promise((resolve) => setTimeout(resolve, simulation_delay));

				const visitedCell = document.querySelector(`.row-${newX}.col-${newY}`);
				visitedCell.classList.add(`isVisited`);

				queue.push([newX, newY]);
			}
		}
	}
	return false;
}

run_bfs_btn.addEventListener("click", async () => {
	if (bfs_running) return;

	if (reset_required) {
		set_error_msg(
			"Shortest path is already shown. Reset path to run BFS again."
		);
		return;
	}
	if (!grid_exists) {
		set_error_msg("No grid found. Create a grid first.");
		return;
	}
	if (click_counter < 2) {
		set_error_msg("Source & Target must be specified first");
		return;
	}

	set_error_msg("");
	let path_found = await bfs(); // true if found, false if not

	if (path_found) {
		color_path();
	} else {
		// path not found
		set_error_msg(`Target is unreachable! :(`);
		reset_required = true;
	}

	bfs_running = false;
});

function color_path() {
	//coloring path
	let [x, y] = target;
	while (parent[x][y]) {
		const [prevX, prevY] = parent[x][y];
		if (prevX === source[0] && prevY === source[1]) break;

		grid[prevX][prevY] = 4;
		const pathCell = document.querySelector(`.row-${prevX}.col-${prevY}`);
		pathCell.classList.add("isPath");

		[x, y] = [prevX, prevY];
	}

	// calculation for stats
	let steps_taken = 0;
	let path_length = 0;

	for (let i = 0; i < ROW; i++) {
		for (let j = 0; j < COL; j++) {
			if (grid[i][j] === 4) path_length++;
			else if (grid[i][j] === 3) steps_taken++;
		}
	}
	set_error_msg(
		`Target found after visiting ${steps_taken + path_length} out of ${
			ROW * COL - 2
		} cells, shortest path length is ${path_length}`
	);
	reset_required = true;
}

reset_path_btn.addEventListener("click", () => {
	if (bfs_running) return;

	for (let i = 0; i < ROW; i++) {
		for (let j = 0; j < COL; j++) {
			// visited AND path
			if (grid[i][j] == 3 || grid[i][j] == 4) {
				grid[i][j] = 0;
				const cell_to_reset = document.querySelector(`.row-${i}.col-${j}`);
				cell_to_reset.classList = [];
				cell_to_reset.classList.add(`row-${i}`, `col-${j}`, "cell");
			}
		}
	}
	reset_required = false;
	error_msg.textContent = "";
});

reset_everything_btn.addEventListener("click", () => {
	if (bfs_running) return;

	if (grid_exists) {
		error_msg.textContent = "All cleared! :)";
	}
	container.innerHTML = "";
	grid_exists = false;
	click_counter = 0;
	cell_elements = [];
	parent = [];
	grid = [];
	reset_required = false;
});

stop_btn.addEventListener("click", () => {
	if (!bfs_running) return;
	else bfs_running = false;
});

// const cell = document.querySelectorAll(".cell");
// cell.addEventListener("click", (e) => {
// 	const row = parseInt(e.target.dataset.row, 10);
// 	const col = parseInt(e.target.dataset.col, 10);
// });

// error msg if S and T are not specified (Done)
// dont create another grid if one already exists (Done)
// Clear button to delete the grid (DONE)

// PROBLEM : ekbar run korar por jodi path er kono cell wall banai, oita wall hishebe count hocche na => reason : path color korar time e check kortesilo na je ashole bfs() ki true return kore naki false... now its resolved! :)

//$ color_path() =====> my OLD version
// let [curr_x, curr_y] = target;

// while (curr_x != source[0] || curr_y != source[1]) {
// 	p = parent[curr_x][curr_y];
// 	if (!p) break;
// 	curr_x = p[0];
// 	curr_y = p[1];

// 	if (curr_x == source[0] && curr_y == source[1]) break;

// 	// add path color
// 	grid[curr_x][curr_y] = 4;
// 	const pathCell = document.querySelector(`.row-${curr_x}.col-${curr_y}`);
// 	pathCell.classList.add(`isPath`);
// }
//$ ====================> end of my OLD version
