// validation.js
// Exports canPlace(grid, itemsById, itemId, row, col)

function keyFor(r, c) {
	return `${r},${c}`;
}

// grid: map 'r,c' -> itemId | null
// itemsById: map itemId -> { id, name, color, weight, placed }

function isOccupied(grid, row, col) {
	return !!grid[keyFor(row, col)];
}

function canPlace(grid, itemsById, itemId, row, col) {
	// Basic checks
	if (row < 1 || row > 4 || col < 1 || col > 4) {
		return { ok: false, reason: 'Invalid coordinates' };
	}
	const item = itemsById[itemId];
	if (!item) return { ok: false, reason: 'Unknown item' };
	if (item.placed) return { ok: false, reason: 'Item already placed' };
	if (isOccupied(grid, row, col)) return { ok: false, reason: 'Cell occupied' };

	// Rule 1: Gravity
	if (row !== 4) {
		const below = grid[keyFor(row + 1, col)];
		if (!below) return { ok: false, reason: 'Gravity violation' };
	}

	// Rule 2: Chemical Compatibility (orthogonal)
	// Red and Blue cannot be adjacent orthogonally
	const neighbors = [
		[row - 1, col],
		[row + 1, col],
		[row, col - 1],
		[row, col + 1],
	];
	for (const [nr, nc] of neighbors) {
		if (nr < 1 || nr > 4 || nc < 1 || nc > 4) continue;
		const neighborId = grid[keyFor(nr, nc)];
		if (!neighborId) continue;
		const neighbor = itemsById[neighborId];
		if (!neighbor) continue;
		if (
			(item.color === 'Red' && neighbor.color === 'Blue') ||
			(item.color === 'Blue' && neighbor.color === 'Red')
		) {
			return { ok: false, reason: 'Chemical incompatibility' };
		}
	}

	// Rule 3: Fragility (stacking)
	// If placing on top of another item, cannot place Heavy onto Light
	if (row !== 4) {
		const belowId = grid[keyFor(row + 1, col)];
		if (belowId) {
			const belowItem = itemsById[belowId];
			if (item.weight === 'Heavy' && belowItem.weight === 'Light') {
				return { ok: false, reason: 'Fragility violation' };
			}
		}
	}

	return { ok: true };
}

module.exports = { canPlace };
