import React from 'react';

export default function Inventory({ items }) {
	function handleDragStart(e, id) {
		e.dataTransfer.setData('text/plain', id);
	}

	return (
		<div className="inventory">
			<h2>Inventory</h2>
			<div className="items">
				{(Array.isArray(items) ? items : [])
					.filter((i) => !i.placed)
					.map((it) => (
						<div
							key={it.id}
							className={`inv-item ${it.color.toLowerCase()}`}
							draggable
							onDragStart={(e) => handleDragStart(e, it.id)}
						>
							<div className="name">{it.name}</div>
							<div className="meta">
								{it.color} • {it.weight}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
