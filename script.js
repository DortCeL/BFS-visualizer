const container = document.getElementById("container");
const row_input = document.getElementById("row-input");
const col_input = document.getElementById("col-input");
const create_grid_btn = document.getElementById("create-grid-btn");
const run_bfs_btn = document.getElementById("run-bfs-btn");
const error_msg = document.getElementById("error-msg");
const reset_path_btn = document.getElementById("reset-path-btn");
const reset_everything_btn = document.getElementById("reset-everything-btn");

// to resist creating grid over existing grid
let grid_exists = false;
let reset_required = false; // path show kora obosthay jate wall modify kora na jay sheta ensure korar jonno
let click_counter = 0;

let grid = [];
let cell_elements = [];
let parent = [];

let ROW = 0;
let COL = 0;
const source = [0, 0];
const target = [0, 0];

create_grid_btn.addEventListener("click", () => {
	if (grid_exists) {
		error_msg.textContent = "Grid already exists you DUMBASS!";
		return;
	}
	error_msg.textContent = "";
	ROW = parseInt(row_input.value, 10);
	COL = parseInt(col_input.value, 10);

	// create grid
	grid = Array.from({ length: ROW }, () => Array(COL).fill(0));
	container.style.gridTemplateColumns = `repeat(${COL}, 1fr)`;

	// populate parent
	parent = Array.from({ length: ROW }, () => Array(COL).fill(null));

	// -1 -> wall
	// 0  -> walkable
	// 1  -> source
	// 2  -> target
	// 3  -> visited
	// 4  -> taken Path

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
					error_msg.textContent = "Reset path before modifying";
					return;
				}

				click_counter++;
				if (click_counter === 1 && grid[i][j] !== 2) {
					grid[i][j] = 1;
					source[0] = i;
					source[1] = j;
					cell.textContent = "S";
					cell.classList.add("isSource");
				} else if (click_counter === 2 && grid[i][j] !== 1) {
					grid[i][j] = 2;
					target[0] = i;
					target[1] = j;
					cell.textContent = "T";
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
	error_msg.textContent = "Click on nodes to add Source, Target or Walls";
	grid_exists = true;
});

function bfs() {
	const visited = Array.from({ length: ROW }, () => Array(COL).fill(false));
	const queue = [[...source]];

	const direction = [
		[-1, 0],
		[0, 1],
		[1, 0],
		[0, -1],
	];

	while (queue.length > 0) {
		const [x, y] = queue.shift();

		if (x === target[0] && y === target[1]) {
			console.log(`found at x: ${x}, y: ${y}`);
			return true;
		}

		for (const [dx, dy] of direction) {
			const newX = x + dx;
			const newY = y + dy;

			if (newX === target[0] && newY === target[1]) {
				parent[newX][newY] = [x, y];
				console.log(`found at x: ${newX}, y: ${newY}`);
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
				const visitedCell = document.querySelector(`.row-${newX}.col-${newY}`);

				grid[newX][newY] = 3;

				visitedCell.classList.add(`isVisited`);

				parent[newX][newY] = [x, y];

				queue.push([newX, newY]);

				visited[newX][newY] = true;
			}
		}
	}
	return false;
}

run_bfs_btn.addEventListener("click", () => {
	if (reset_required) {
		error_msg.textContent = "OPEN YOUR EYES! result is already shown!";
		return;
	}

	if (!grid_exists) {
		error_msg.textContent = "No grid found";
	} else if (click_counter < 2) {
		error_msg.textContent = "Source & Target must be specified first";
	} else {
		error_msg.textContent = "";
		let path_found = bfs();

		// Stats or result
		let steps_taken = 0;
		let path_length = 0;

		// coloring path
		if (path_found) {
			let curr_x = target[0];
			let curr_y = target[1];

			while (curr_x != source[0] || curr_y != source[1]) {
				p = parent[curr_x][curr_y];
				if (!p) break;
				curr_x = p[0];
				curr_y = p[1];

				if (curr_x == source[0] && curr_y == source[1]) break;

				// add path color
				grid[curr_x][curr_y] = 4;
				const pathCell = document.querySelector(`.row-${curr_x}.col-${curr_y}`);
				pathCell.classList.add(`isPath`);
			}
			// calculation for stats
			for (let i = 0; i < ROW; i++) {
				for (let j = 0; j < COL; j++) {
					if (grid[i][j] === 4) path_length++;
					else if (grid[i][j] === 3) steps_taken++;
				}
			}
			error_msg.textContent = `Target found after visiting ${
				steps_taken + path_length
			} out of ${ROW * COL - 2} cells, shortest path length is ${path_length}`;
			reset_required = true;
		} else {
			// path not found
			error_msg.textContent = `Target is unreachable! :(`;
			reset_required = true;
		}
	}
});

reset_path_btn.addEventListener("click", () => {
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

// const cell = document.querySelectorAll(".cell");
// cell.addEventListener("click", (e) => {
// 	const row = parseInt(e.target.dataset.row, 10);
// 	const col = parseInt(e.target.dataset.col, 10);
// });

// error msg if S and T are not specified (Done)
// dont create another grid if one already exists (Done)
// Clear button to delete the grid (DONE)

// TODO: PROBLEM : ekbar run korar por jodi path er kono cell wall banai, oita wall hishebe count hocche na => reason : path color korar time e check kortesilo na je ashole bfs() ki true return kore naki false... now its resolved! :)
