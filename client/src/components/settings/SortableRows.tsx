import type { CSSProperties, ReactNode } from 'react';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Button, Group, Table } from '@mantine/core';
import { ArrowDownAZ, GripVertical } from 'lucide-react';
import { FieldLabel } from '../common/FieldLabel';

/** Toolbar shown above a sortable settings table. */
export function OrderToolbar({ isCustom, onReset }: { isCustom: boolean; onReset: () => void }) {
	return (
		<Group justify="space-between" mb="xs">
			<FieldLabel
				label="Order"
				tooltip="Sorted A–Z by default. Drag the handles to set your own order; anything you haven't ordered (e.g. something newly added in Komodo) stays alphabetical after the ones you have."
			/>
			<Button
				variant="subtle"
				size="xs"
				leftSection={<ArrowDownAZ size={14} />}
				onClick={onReset}
				disabled={!isCustom}
			>
				Sort A–Z
			</Button>
		</Group>
	);
}

export function SortableTableBody({
	ids,
	onReorder,
	children
}: {
	ids: string[];
	onReorder: (orderedIds: string[]) => void;
	children: ReactNode;
}) {
	const sensors = useSensors(
		// A small drag distance so a plain click on the handle doesn't start a drag.
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	function handleDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return;
		const from = ids.indexOf(String(active.id));
		const to = ids.indexOf(String(over.id));
		if (from < 0 || to < 0) return;
		onReorder(arrayMove(ids, from, to));
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<Table.Tbody>{children}</Table.Tbody>
			</SortableContext>
		</DndContext>
	);
}

/** A table row with a drag handle as its first cell; pass the remaining cells as children. */
export function SortableRow({
	id,
	label,
	children
}: {
	id: string;
	label: string;
	children: ReactNode;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id });

	const style: CSSProperties = {
		// Rows only ever move vertically.
		transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
		transition,
		position: 'relative',
		zIndex: isDragging ? 1 : undefined,
		opacity: isDragging ? 0.75 : undefined,
		background: isDragging ? 'var(--mantine-color-body)' : undefined
	};

	return (
		<Table.Tr ref={setNodeRef} style={style}>
			<Table.Td w={40} pr={0}>
				<ActionIcon
					ref={setActivatorNodeRef}
					variant="subtle"
					color="gray"
					size="sm"
					aria-label={`Drag to reorder ${label}`}
					style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
					{...attributes}
					{...listeners}
				>
					<GripVertical size={16} />
				</ActionIcon>
			</Table.Td>
			{children}
		</Table.Tr>
	);
}
