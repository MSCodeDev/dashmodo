/**
 * Must match server/src/lib/sort.ts: alphabetical by default (case-insensitive, natural number
 * order), with anything manually ordered first — so the settings tables preview exactly what the
 * dashboard will show once saved.
 */
export function sortRows<T extends { name: string }>(
	rows: T[],
	orderOf: (row: T) => number | null | undefined
): T[] {
	return [...rows].sort((a, b) => {
		const oa = orderOf(a) ?? null;
		const ob = orderOf(b) ?? null;
		if (oa !== null && ob !== null && oa !== ob) return oa - ob;
		if (oa !== null && ob === null) return -1;
		if (oa === null && ob !== null) return 1;
		return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
	});
}

/** The sortOrder updates needed to make `orderedIds` the saved order (only rows that change). */
export function reorderPatches(
	orderedIds: string[],
	currentOrder: (id: string) => number | null | undefined
): Array<{ id: string; sortOrder: number }> {
	return orderedIds
		.map((id, index) => ({ id, sortOrder: index }))
		.filter(({ id, sortOrder }) => currentOrder(id) !== sortOrder);
}
