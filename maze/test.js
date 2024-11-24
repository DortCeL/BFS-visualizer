let n = 3;

let maze = [4, 5, 2, 1, 6, 7, 3, 2, 9];

for (let i = 0; i < n * n; i++) {
	console.log(`row ${Math.floor(i / n)}, column ${i % n} : ${maze[i]}`);
}
