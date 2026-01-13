const request = require('supertest');

// Only use the running server at localhost:4000
const app = request('http://localhost:4000');

test('place valid item on bottom succeeds', async () => {
	const res = await app
		.post('/place')
		.send({ itemId: 'barrel_a', row: 4, col: 1 });
	expect(res.status).toBe(200);
	expect(res.body.cell).toBeDefined();
	expect(res.body.cell.item.id).toBe('barrel_a');
});

test('place floating item rejected', async () => {
	const res = await app
		.post('/place')
		.send({ itemId: 'barrel_b', row: 2, col: 2 });
	expect(res.status).toBe(400);
	expect(res.body.error).toBe('Gravity violation');
});
