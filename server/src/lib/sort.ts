export interface SortOptions<T> {
	name: (item: T) => string;
	/** Manual position set by dragging in Settings; null/undefined means "use the default". */
	order: (item: T) => number | null | undefined;
}

/**
 * Default is alphabetical (case-insensitive, "stack2" before "stack10"). Anything with a manual
 * order comes first, in that order; everything else follows alphabetically — so a stack that
 * newly appears in Komodo lands at the end of the list rather than scrambling it.
 */
export function sortByOrder<T>(items: T[], { name, order }: SortOptions<T>): T[] {
	return [...items].sort((a, b) => {
		const oa = order(a) ?? null;
		const ob = order(b) ?? null;
		if (oa !== null && ob !== null && oa !== ob) return oa - ob;
		if (oa !== null && ob === null) return -1;
		if (oa === null && ob !== null) return 1;
		return name(a).localeCompare(name(b), undefined, { sensitivity: 'base', numeric: true });
	});
}
