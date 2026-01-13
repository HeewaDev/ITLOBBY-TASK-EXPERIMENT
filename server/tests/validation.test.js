const { canPlace } = require('../validation');

// Helper to build grid map
function g(cells) {
	const grid = {};
	for (const [r, col, id] of cells) grid[`${r},${col}`] = id || null;
	return grid;
}

const items = {
	barrel_a: {
		id: 'barrel_a',
		name: 'Barrel A',
		color: 'Red',
		weight: 'Heavy',
		placed: false,
	},
	barrel_b: {
		id: 'barrel_b',
		name: 'Barrel B',
		color: 'Blue',
		weight: 'Heavy',
		placed: false,
	},
	box_c: {
		id: 'box_c',
		name: 'Box C',
		color: 'Red',
		weight: 'Light',
		placed: false,
	},
	box_d: {
		id: 'box_d',
		name: 'Box D',
		color: 'Blue',
		weight: 'Light',
		placed: false,
	},
	crate_e: {
		id: 'crate_e',
		name: 'Crate E',
		color: 'Green',
		weight: 'Heavy',
		placed: false,
	},
	crate_f: {
		id: 'crate_f',
		name: 'Crate F',
		color: 'Green',
		weight: 'Light',
		placed: false,
	},
};

test('gravity: cannot float', () => {
	const grid = g([[4, 1, null]]);
	const res = canPlace(grid, items, 'barrel_a', 2, 1);
	expect(res.ok).toBe(false);
	expect(res.reason).toBe('Gravity violation');
});

test('gravity: can place on bottom', () => {
	const grid = g([[4, 1, null]]);
	const res = canPlace(grid, items, 'barrel_a', 4, 1);
	expect(res.ok).toBe(true);
});

test('chemical: red next to blue rejected', () => {
	const grid = g([
		[3, 2, 'barrel_b'], // Blue at 3,2
		[4, 2, null],
	]);
	const res = canPlace(grid, items, 'barrel_a', 4, 2); // placing Red at 4,2 adjacent to 3,2
	expect(res.ok).toBe(false);
	expect(res.reason).toBe('Chemical incompatibility');
});

test('fragility: heavy cannot be on light', () => {
	const grid = g([
		[4, 2, 'box_c'], // Light at bottom
	]);
	const res = canPlace(grid, items, 'barrel_a', 3, 2); // Heavy on top of Light
	expect(res.ok).toBe(false);
	expect(res.reason).toBe('Fragility violation');
});

test('occupied cell rejected', () => {
	const grid = g([[4, 1, 'box_d']]);
	const res = canPlace(grid, items, 'barrel_a', 4, 1);
	expect(res.ok).toBe(false);
	expect(res.reason).toBe('Cell occupied');
});

test('unknown item rejected', () => {
	const grid = g([]);
	const res = canPlace(grid, items, 'nope', 4, 1);
	expect(res.ok).toBe(false);
	expect(res.reason).toBe('Unknown item');
});
