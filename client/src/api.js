const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function getGrid() {
	const r = await fetch(`${BASE}/grid`);
	if (!r.ok) throw new Error('Failed to fetch grid');
	return r.json();
}

export async function getInventory() {
	const r = await fetch(`${BASE}/inventory`);
	if (!r.ok) throw new Error('Failed to fetch inventory');
	return r.json();
}

export async function placeItem(itemId, row, col) {
	const r = await fetch(`${BASE}/place`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ itemId, row, col }),
	});
	if (!r.ok) {
		const body = await r.json().catch(() => ({}));
		throw new Error(body.error || 'Placement failed');
	}
	return r.json();
}
