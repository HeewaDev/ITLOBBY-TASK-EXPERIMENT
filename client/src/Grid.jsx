import React from 'react';

function cellKey(r, c) {
	return `${r},${c}`;
}

export default function Grid({ cells, onDrop }) {
	// Build map for quick access
	const map = {};
	(Array.isArray(cells) ? cells : []).forEach((cell) => {
		map[cell.row + ',' + cell.col] = cell;
	});

	function handleDragOver(e) {
		e.preventDefault();
	}

	function handleDrop(e, row, col) {
		e.preventDefault();
		const itemId = e.dataTransfer.getData('text/plain');
		if (!itemId) return;
		onDrop(itemId, row, col);
	}

	// Render rows 1..4 top to bottom
	const rows = [1, 2, 3, 4];
	const cols = [1, 2, 3, 4];

	return (
		<div className="grid">
			{rows.map((r) => (
				<div className="grid-row" key={r}>
					{cols.map((c) => {
						const cell = map[cellKey(r, c)] || { row: r, col: c, item: null };
						return (
							<div
								key={c}
								className="grid-cell"
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, r, c)}
							>
								<div className="coord">{`R${r}C${c}`}</div>
								{cell.item ? (
									<div className={`item ${cell.item.color.toLowerCase()}`}>
										{cell.item.name}
										<div className="weight">{cell.item.weight}</div>
									</div>
								) : (
									<div className="empty">drop</div>
								)}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
