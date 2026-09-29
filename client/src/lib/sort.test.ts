import { describe, expect, it } from 'vitest';
import { reorderPatches, sortRows } from './sort';

type Row = { name: string; order?: number | null };
const sort = (rows: Row[]) => sortRows(rows, (r) => r.order).map((r) => r.name);

describe('sortRows', () => {
	it('defaults to alphabetical, case-insensitive, with natural number order', () => {
		expect(
			sort([{ name: 'plex' }, { name: 'app10' }, { name: 'Grafana' }, { name: 'app2' }])
		).toEqual(['app2', 'app10', 'Grafana', 'plex']);
	});

	it('puts manually ordered rows first, then the rest alphabetically', () => {
		expect(
			sort([
				{ name: 'new-b' },
				{ name: 'zeta', order: 0 },
				{ name: 'new-a' },
				{ name: 'alpha', order: 1 }
			])
		).toEqual(['zeta', 'alpha', 'new-a', 'new-b']);
	});

	it('does not mutate its input', () => {
		const rows = [{ name: 'b' }, { name: 'a' }];
		sort(rows);
		expect(rows.map((r) => r.name)).toEqual(['b', 'a']);
	});
});

describe('reorderPatches', () => {
	it('assigns dense positions, skipping rows already in place', () => {
		const current = new Map<string, number | null>([
			['a', 0],
			['b', 1],
			['c', 2]
		]);
		expect(reorderPatches(['a', 'c', 'b'], (id) => current.get(id))).toEqual([
			{ id: 'c', sortOrder: 1 },
			{ id: 'b', sortOrder: 2 }
		]);
	});

	it('numbers every row the first time, when none had an order', () => {
		expect(reorderPatches(['x', 'y'], () => null)).toEqual([
			{ id: 'x', sortOrder: 0 },
			{ id: 'y', sortOrder: 1 }
		]);
	});
});
