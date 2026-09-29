import { Group, Table, TextInput, Tooltip } from '@mantine/core';
import { Info } from 'lucide-react';
import { rowOrder } from '../../lib/rowOrder';
import type { ServerSettingsRow } from '../../lib/types';
import type { PendingServerChange } from '../../hooks/useSettings';
import { OrderToolbar, SortableRow, SortableTableBody } from './SortableRows';

interface Props {
	rows: ServerSettingsRow[];
	pending: Record<string, PendingServerChange>;
	onChange: (id: string, patch: PendingServerChange) => void;
}

export function ServerSettingsTable({ rows, pending, onChange }: Props) {
	const { ordered, isCustom, onReorder, resetToAlphabetical } = rowOrder(rows, pending, onChange);

	return (
		<>
			<OrderToolbar isCustom={isCustom} onReset={resetToAlphabetical} />
			<Table verticalSpacing="sm">
				<Table.Thead>
					<Table.Tr>
						<Table.Th w={40} />
						<Table.Th>Name</Table.Th>
						<Table.Th>
							<Group gap={4} wrap="nowrap">
								Link host override
								<Tooltip
									label="Host used when deriving a stack's link from a published port, in place of what Komodo detects (shown as the placeholder below)."
									multiline
									w={260}
								>
									<Info size={14} style={{ opacity: 0.6, cursor: 'help' }} />
								</Tooltip>
							</Group>
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<SortableTableBody ids={ordered.map((row) => row.id)} onReorder={onReorder}>
					{ordered.map((row) => {
						const effective = pending[row.id]?.linkOverride ?? row.linkOverride ?? '';
						return (
							<SortableRow key={row.id} id={row.id} label={row.name}>
								<Table.Td>{row.name}</Table.Td>
								<Table.Td>
									<TextInput
										placeholder={row.detectedAddress ?? 'no address detected'}
										value={effective}
										onChange={(e) => onChange(row.id, { linkOverride: e.currentTarget.value })}
										size="xs"
										w={220}
									/>
								</Table.Td>
							</SortableRow>
						);
					})}
				</SortableTableBody>
			</Table>
		</>
	);
}
