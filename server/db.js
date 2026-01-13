const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Create items table
		await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        weight TEXT NOT NULL,
        placed BOOLEAN NOT NULL DEFAULT false
      );
    `);

		// Create grid table
		await client.query(`
      CREATE TABLE IF NOT EXISTS grid (
        row INT NOT NULL,
        col INT NOT NULL,
        item_id TEXT NULL,
        PRIMARY KEY (row, col),
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
      );
    `);

		// Seed items if not present
		const res = await client.query('SELECT COUNT(*) FROM items');
		if (parseInt(res.rows[0].count, 10) === 0) {
			const items = [
				['barrel_a', 'Barrel A', 'Red', 'Heavy'],
				['barrel_b', 'Barrel B', 'Blue', 'Heavy'],
				['box_c', 'Box C', 'Red', 'Light'],
				['box_d', 'Box D', 'Blue', 'Light'],
				['crate_e', 'Crate E', 'Green', 'Heavy'],
				['crate_f', 'Crate F', 'Green', 'Light'],
			];

			for (const [id, name, color, weight] of items) {
				await client.query(
					'INSERT INTO items(id,name,color,weight,placed) VALUES($1,$2,$3,$4,false)',
					[id, name, color, weight],
				);
			}
		}

		// Seed grid 4x4 if empty
		const gres = await client.query('SELECT COUNT(*) FROM grid');
		if (parseInt(gres.rows[0].count, 10) === 0) {
			for (let r = 1; r <= 4; r++) {
				for (let c = 1; c <= 4; c++) {
					await client.query(
						'INSERT INTO grid(row,col,item_id) VALUES($1,$2,NULL)',
						[r, c],
					);
				}
			}
		}

		await client.query('COMMIT');
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
}

module.exports = { pool, init };
