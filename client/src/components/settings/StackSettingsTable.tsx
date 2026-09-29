import {
	ActionIcon,
	Avatar,
	FileButton,
	Group,
	Switch,
	Table,
	TextInput,
	Tooltip
} from '@mantine/core';
import { Info, Upload } from 'lucide-react';
import { resolveIconUrl } from '../../lib/icons';
import { rowOrder } from '../../lib/rowOrder';
import { useUploadIcon, type PendingStackChange } from '../../hooks/useSettings';
import type { IconStyle, StackSettingsRow } from '../../lib/types';
import { OrderToolbar, SortableRow, SortableTableBody } from './SortableRows';

interface Props {
	rows: StackSettingsRow[];
	pending: Record<string, PendingStackChange>;
	onChange: (id: string, patch: PendingStackChange) => void;
	iconStyle?: IconStyle;
}

export function StackSettingsTable({ rows, pending, onChange, iconStyle }: Props) {
	const upload = useUploadIcon();
	const { ordered, isCustom, onReorder, resetToAlphabetical } = rowOrder(rows, pending, onChange);

	return (
		<>
			<OrderToolbar isCustom={isCustom} onReset={resetToAlphabetical} />
			<Table verticalSpacing="sm">
				<Table.Thead>
					<Table.Tr>
						<Table.Th w={40} />
						<Table.Th>Name</Table.Th>
						<Table.Th>Hidden</Table.Th>
						<Table.Th>
							<Group gap={4} wrap="nowrap">
								Icon override
								<Tooltip
									label={
										'A reference or URL. Leave blank to use the auto-detected default (shown as the ' +
										'placeholder). Sources: bare name or "sh:name" for selfh.st/icons (default), ' +
										'"mdi:name" for Material Design Icons, "si:name" for Simple Icons, a direct ' +
										'https:// URL, or upload a file with the button.'
									}
									multiline
									w={280}
								>
									<Info size={14} style={{ opacity: 0.6, cursor: 'help' }} />
								</Tooltip>
							</Group>
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<SortableTableBody ids={ordered.map((row) => row.id)} onReorder={onReorder}>
					{ordered.map((row) => {
						const effective = { ...row, ...pending[row.id] };
						const iconRef = effective.iconOverride || row.defaultIcon;
						return (
							<SortableRow key={row.id} id={row.id} label={row.name}>
								<Table.Td>
									<Group gap="xs" wrap="nowrap">
										<Avatar src={resolveIconUrl(iconRef, iconStyle)} size="sm" radius="sm">
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
									<Group gap="xs" wrap="nowrap">
										<TextInput
											placeholder={row.defaultIcon}
											value={effective.iconOverride ?? ''}
											onChange={(e) => onChange(row.id, { iconOverride: e.currentTarget.value })}
											size="xs"
											w={200}
										/>
										<FileButton
											accept="image/png,image/jpeg,image/webp,image/gif"
											onChange={(file) => {
												if (!file) return;
												upload.mutate(file, {
													onSuccess: ({ ref }) => onChange(row.id, { iconOverride: ref })
												});
											}}
										>
											{(props) => (
												<Tooltip label="Upload a custom icon">
													<ActionIcon
														{...props}
														variant="default"
														size="input-xs"
														loading={upload.isPending}
													>
														<Upload size={14} />
													</ActionIcon>
												</Tooltip>
											)}
										</FileButton>
									</Group>
								</Table.Td>
							</SortableRow>
						);
					})}
				</SortableTableBody>
			</Table>
		</>
	);
}
