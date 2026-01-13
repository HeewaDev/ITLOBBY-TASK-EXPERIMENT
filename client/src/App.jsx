import React, { useEffect, useState } from 'react';
import { getGrid, getInventory, placeItem } from './api';
import Grid from './Grid';
import Inventory from './Inventory';

export default function App() {
	const [grid, setGrid] = useState([]);
	const [inventory, setInventory] = useState([]);
	const [message, setMessage] = useState(null);

	async function load() {
		try {
			const g = await getGrid();
			setGrid(g.cells || []);
			const inv = await getInventory();
			setInventory(inv || []);
		} catch (err) {
			console.error('Load failed', err);
			setMessage('Failed to load data: ' + err.message);
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function onDrop(itemId, row, col) {
		try {
			const res = await placeItem(itemId, row, col);
			await load();
			setMessage(null);
		} catch (err) {
			setMessage(err.message || 'Placement failed');
			// refresh inventory to snap back
			await load();
		}
	}

	async function onReset() {
		try {
			await fetch('http://localhost:4000/reset', { method: 'POST' });
			await load();
			setMessage('Grid reset');
		} catch (err) {
			setMessage('Reset failed: ' + err.message);
		}
	}

	return (
		<div className="app">
			<h1>Shelving Placement</h1>
			<div className="instructions">
				<strong>How to use:</strong> Drag items from the inventory on the left
				to place them on the 4x4 grid. Items must follow rules: Heavy items go
				on bottom, Red/Blue can't be next to each other horizontally/vertically,
				and Fragile items can't have Heavy items on top.
			</div>
			<button onClick={onReset}>Reset Grid</button>
			{message && <div className="message">{message}</div>}
			<div className="layout">
				<Inventory items={inventory} />
				<div>
					<h2>Shelving Grid</h2>
					<Grid cells={grid} onDrop={onDrop} />
				</div>
			</div>
		</div>
	);
}
