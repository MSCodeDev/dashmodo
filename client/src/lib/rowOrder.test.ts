import { describe, expect, it } from 'vitest';
import { rowOrder } from './rowOrder';

type Row = { id: string; name: string; sortOrder: number | null };
type Pending = Record<string, { sortOrder?: number | null }>;

const rows: Row[] = [
	{ id: '1', name: 'plex', sortOrder: null },
	{ id: '2', name: 'Grafana', sortOrder: null },
	{ id: '3', name: 'authelia', sortOrder: null }
];

/** Mimics the settings modal: onChange merges patches into a pending map. */
function harness(initialRows: Row[]) {
	const pending: Pending = {};
	const onChange = (id: string, patch: { sortOrder: number | null }) => {
		pending[id] = { ...pending[id], ...patch };
	};
	return {
		pending,
		view: () => rowOrder(initialRows, pending, onChange)
	};
}

const names = (ordered: Row[]) => ordered.map((r) => r.name);

describe('rowOrder', () => {
	it('starts alphabetical with no custom order', () => {
		const { view } = harness(rows);
		expect(names(view().ordered)).toEqual(['authelia', 'Grafana', 'plex']);
		expect(view().isCustom).toBe(false);
	});

	it('previews a drag immediately via pending edits', () => {
		const { view } = harness(rows);
		// Drag "plex" to the top: ids in the new visual order.
		view().onReorder(['1', '3', '2']);
		expect(names(view().ordered)).toEqual(['plex', 'authelia', 'Grafana']);
		expect(view().isCustom).toBe(true);
	});

	it('only touches rows whose position actually changed on later drags', () => {
		const saved = rows.map((r, i) => ({ ...r, sortOrder: [0, 1, 2][i] })); // plex, Grafana, authelia
		const { pending, view } = harness(saved);
		view().onReorder(['1', '3', '2']); // swap the last two
		expect(pending).toEqual({ '3': { sortOrder: 1 }, '2': { sortOrder: 2 } });
	});

	it('goes back to alphabetical when reset, clearing only rows that had an order', () => {
		const saved: Row[] = [
			{ id: '1', name: 'plex', sortOrder: 0 },
			{ id: '2', name: 'Grafana', sortOrder: null },
			{ id: '3', name: 'authelia', sortOrder: 1 }
		];
		const { pending, view } = harness(saved);
		view().resetToAlphabetical();
		expect(pending).toEqual({ '1': { sortOrder: null }, '3': { sortOrder: null } });
		expect(names(view().ordered)).toEqual(['authelia', 'Grafana', 'plex']);
		expect(view().isCustom).toBe(false);
	});
});
