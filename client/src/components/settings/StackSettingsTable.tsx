import { Avatar, Group, Switch, Table, TextInput, Tooltip } from '@mantine/core';
import { Info } from 'lucide-react';
import { selfhstIconUrl } from '../../lib/icons';
import type { IconStyle, StackSettingsRow } from '../../lib/types';
import type { PendingStackChange } from '../../hooks/useSettings';

interface Props {
	rows: StackSettingsRow[];
	pending: Record<string, PendingStackChange>;
	onChange: (id: string, patch: PendingStackChange) => void;
	iconStyle?: IconStyle;
}

export function StackSettingsTable({ rows, pending, onChange, iconStyle }: Props) {
	return (
		<Table verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>Hidden</Table.Th>
					<Table.Th>
						<Group gap={4} wrap="nowrap">
							Icon override
							<Tooltip
								label='selfh.st/icons reference, e.g. "jellyfin". Leave blank to use the auto-detected default shown as the placeholder.'
								multiline
								w={260}
							>
								<Info size={14} style={{ opacity: 0.6, cursor: 'help' }} />
							</Tooltip>
						</Group>
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{rows.map((row) => {
					const effective = { ...row, ...pending[row.id] };
					const iconRef = effective.iconOverride || row.defaultIcon;
					return (
						<Table.Tr key={row.id}>
							<Table.Td>
								<Group gap="xs" wrap="nowrap">
									<Avatar src={selfhstIconUrl(iconRef, iconStyle)} size="sm" radius="sm">
										{row.name.slice(0, 2).toUpperCase()}
									</Avatar>
									{row.name}
								</Group>
							</Table.Td>
							<Table.Td>
								<Switch
									checked={effective.hidden}
									onChange={(e) => onChange(row.id, { hidden: e.currentTarget.checked })}
								/>
							</Table.Td>
							<Table.Td>
								<TextInput
									placeholder={row.defaultIcon}
									value={effective.iconOverride ?? ''}
									onChange={(e) => onChange(row.id, { iconOverride: e.currentTarget.value })}
									size="xs"
									w={200}
								/>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
}
