import { reorderPatches, sortRows } from './sort';

/**
 * Display order + reorder actions for a settings table, layered over the pending (unsaved)
 * edits so dragging previews immediately and is committed by the modal's single Save button.
 */
export function rowOrder<T extends { id: string; name: string; sortOrder: number | null }>(
	rows: T[],
	pending: Record<string, { sortOrder?: number | null }>,
	onChange: (id: string, patch: { sortOrder: number | null }) => void
) {
	const orderOf = (row: T) => {
		const edited = pending[row.id]?.sortOrder;
		return edited !== undefined ? edited : row.sortOrder;
	};
	const orderById = new Map(rows.map((row) => [row.id, orderOf(row)]));

	return {
		ordered: sortRows(rows, orderOf),
		isCustom: rows.some((row) => orderOf(row) !== null),
		onReorder(orderedIds: string[]) {
			for (const { id, sortOrder } of reorderPatches(orderedIds, (id) => orderById.get(id))) {
				onChange(id, { sortOrder });
			}
		},
		resetToAlphabetical() {
			for (const row of rows) {
				if (orderOf(row) !== null) onChange(row.id, { sortOrder: null });
			}
		}
	};
}
