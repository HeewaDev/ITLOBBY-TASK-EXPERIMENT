const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool, init } = require('./db');
const { canPlace } = require('./validation');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function getGridMap(client) {
	const gres = await client.query('SELECT row, col, item_id FROM grid');
	const grid = {};
	for (const r of gres.rows) {
		grid[`${r.row},${r.col}`] = r.item_id;
	}
	return grid;
}

async function getItemsMap(client) {
	const ires = await client.query(
		'SELECT id, name, color, weight, placed FROM items',
	);
	const items = {};
	for (const it of ires.rows) items[it.id] = it;
	return items;
}

app.get('/inventory', async (req, res) => {
	const client = await pool.connect();
	try {
		const result = await client.query(
			'SELECT id, name, color, weight, placed FROM items',
		);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	} finally {
		client.release();
	}
});

app.get('/grid', async (req, res) => {
	const client = await pool.connect();
	try {
		const gridRows = await client.query(
			'SELECT g.row, g.col, g.item_id, i.name, i.color, i.weight FROM grid g LEFT JOIN items i ON g.item_id = i.id ORDER BY g.row, g.col',
		);
		const cells = gridRows.rows.map((r) => ({
			row: r.row,
			col: r.col,
			item: r.item_id
				? { id: r.item_id, name: r.name, color: r.color, weight: r.weight }
				: null,
		}));
		res.json({ cells });
	} catch (err) {
		res.status(500).json({ error: err.message });
	} finally {
		client.release();
	}
});

app.post('/place', async (req, res) => {
	const { itemId, row, col } = req.body;
	if (!itemId || typeof row !== 'number' || typeof col !== 'number')
		return res.status(400).json({ error: 'Invalid payload' });
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const grid = await getGridMap(client);
		const itemsById = await getItemsMap(client);

		const check = canPlace(grid, itemsById, itemId, row, col);
		if (!check.ok) {
			await client.query('ROLLBACK');
			return res.status(400).json({ error: check.reason });
		}

		// perform placement: set grid cell, mark item placed
		await client.query('UPDATE grid SET item_id=$1 WHERE row=$2 AND col=$3', [
			itemId,
			row,
			col,
		]);
		await client.query('UPDATE items SET placed=true WHERE id=$1', [itemId]);
		await client.query('COMMIT');

		// return updated cell
		const gres = await client.query(
			'SELECT g.row,g.col,g.item_id,i.name,i.color,i.weight FROM grid g LEFT JOIN items i ON g.item_id=i.id WHERE g.row=$1 AND g.col=$2',
			[row, col],
		);
		const r = gres.rows[0];
		res.json({
			cell: {
				row: r.row,
				col: r.col,
				item: r.item_id
					? { id: r.item_id, name: r.name, color: r.color, weight: r.weight }
					: null,
			},
		});
	} catch (err) {
		await client.query('ROLLBACK');
		res.status(500).json({ error: err.message });
	} finally {
		client.release();
	}
});

app.post('/reset', async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		await client.query('UPDATE grid SET item_id = NULL');
		await client.query('UPDATE items SET placed = false');
		await client.query('COMMIT');
		res.json({ ok: true });
	} catch (err) {
		await client.query('ROLLBACK');
		res.status(500).json({ error: err.message });
	} finally {
		client.release();
	}
});

const port = 4000;
init()
	.then(() => {
		app.listen(port, () => console.log(`Server listening on ${port}`));
	})
	.catch((err) => {
		console.error('Failed to initialize DB', err);
		process.exit(1);
	});
