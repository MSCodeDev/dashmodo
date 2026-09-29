import { describe, expect, it } from 'vitest';
import { sortByOrder } from './sort.js';

type Item = { name: string; order?: number | null };
const sort = (items: Item[]) =>
	sortByOrder(items, { name: (i) => i.name, order: (i) => i.order }).map((i) => i.name);

describe('sortByOrder', () => {
	it('defaults to alphabetical, case-insensitive', () => {
		expect(sort([{ name: 'plex' }, { name: 'Grafana' }, { name: 'authelia' }])).toEqual([
			'authelia',
			'Grafana',
			'plex'
		]);
	});

	it('sorts embedded numbers naturally', () => {
		expect(sort([{ name: 'app10' }, { name: 'app2' }, { name: 'app1' }])).toEqual([
			'app1',
			'app2',
			'app10'
		]);
	});

	it('puts manually ordered items first, in order, ignoring their names', () => {
		expect(
			sort([
				{ name: 'a', order: 2 },
				{ name: 'z', order: 0 },
				{ name: 'm', order: 1 }
			])
		).toEqual(['z', 'm', 'a']);
	});

	it('places unordered items after ordered ones, alphabetically', () => {
		expect(
			sort([
				{ name: 'new-b' },
				{ name: 'zeta', order: 0 },
				{ name: 'new-a' },
				{ name: 'alpha', order: null }
			])
		).toEqual(['zeta', 'alpha', 'new-a', 'new-b']);
	});

	it('falls back to name when two items share an order', () => {
		expect(
			sort([
				{ name: 'b', order: 1 },
				{ name: 'a', order: 1 }
			])
		).toEqual(['a', 'b']);
	});

	it('does not mutate its input', () => {
		const input = [{ name: 'b' }, { name: 'a' }];
		sort(input);
		expect(input.map((i) => i.name)).toEqual(['b', 'a']);
	});
});
