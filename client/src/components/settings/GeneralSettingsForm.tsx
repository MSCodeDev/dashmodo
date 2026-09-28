import {
	ActionIcon,
	ColorSwatch,
	Divider,
	Group,
	NumberInput,
	PasswordInput,
	Select,
	Stack,
	TagsInput,
	Text,
	Textarea,
	TextInput,
	Title,
	Tooltip
} from '@mantine/core';
import { X } from 'lucide-react';
import { THEME_COLORS } from '../../lib/themeColors';
import type { AppSettings, ColorScheme, ConnectionSettings, IconStyle } from '../../lib/types';
import type { PendingAppChange } from '../../hooks/useSettings';

interface Props {
	settings: AppSettings;
	connection?: ConnectionSettings;
	pending: PendingAppChange;
	onChange: (patch: PendingAppChange) => void;
}

export function GeneralSettingsForm({ settings, connection, pending, onChange }: Props) {
	const effective = { ...settings, ...pending };

	return (
		<Stack gap="md">
			<TextInput
				label="Site name"
				description="Overrides the browser tab title. The header next to the logo always stays 'Dashmodo'."
				placeholder="Dashmodo"
				value={effective.siteName ?? ''}
				onChange={(e) => onChange({ siteName: e.currentTarget.value || null })}
			/>

			<Select
				label="Theme"
				data={[
					{ value: 'system', label: 'System' },
					{ value: 'light', label: 'Light' },
					{ value: 'dark', label: 'Dark' }
				]}
				value={effective.colorScheme}
				onChange={(v) => v && onChange({ colorScheme: v as ColorScheme })}
				allowDeselect={false}
			/>

			<Group grow>
				<NumberInput
					label="Servers columns"
					min={1}
					max={6}
					value={effective.serversColumns}
					onChange={(v) => typeof v === 'number' && onChange({ serversColumns: v })}
				/>
				<NumberInput
					label="Stacks columns"
					min={1}
					max={6}
					value={effective.stacksColumns}
					onChange={(v) => typeof v === 'number' && onChange({ stacksColumns: v })}
				/>
			</Group>

			<Select
				label="Default icon style"
				description='Appends the selfh.st "-light"/"-dark" suffix when an icon has that variant.'
				data={[
					{ value: 'default', label: 'Default' },
					{ value: 'light', label: 'Light' },
					{ value: 'dark', label: 'Dark' }
				]}
				value={effective.defaultIconStyle}
				onChange={(v) => v && onChange({ defaultIconStyle: v as IconStyle })}
				allowDeselect={false}
			/>

			<div>
				<Text size="sm" fw={500} mb={4}>
					Theme color
				</Text>
				<Text size="xs" c="dimmed" mb={8}>
					Colors the logo mark and a subtle background glow.
				</Text>
				<Group gap="xs">
					{THEME_COLORS.map((c) => (
						<Tooltip key={c.value} label={c.name}>
							<ColorSwatch
								color={c.value}
								size={28}
								style={{
									cursor: 'pointer',
									outline: effective.themeColor === c.value ? '2px solid white' : undefined,
									outlineOffset: 2
								}}
								onClick={() => onChange({ themeColor: c.value })}
							/>
						</Tooltip>
					))}
					{effective.themeColor ? (
						<Tooltip label="Clear">
							<ActionIcon variant="subtle" color="gray" onClick={() => onChange({ themeColor: null })}>
								<X size={16} />
							</ActionIcon>
						</Tooltip>
					) : null}
				</Group>
			</div>

			<Textarea
				label="Custom CSS"
				description="Injected into the page as a <style> tag."
				placeholder={':root {\n  /* ... */\n}'}
				autosize
				minRows={4}
				maxRows={10}
				value={effective.customCss ?? ''}
				onChange={(e) => onChange({ customCss: e.currentTarget.value || null })}
				styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
			/>

			<Divider label="Connection" labelPosition="left" mt="sm" />

			<TextInput
				label="Komodo URL"
				placeholder="http://localhost:9120"
				value={effective.komodoUrl ?? ''}
				onChange={(e) => onChange({ komodoUrl: e.currentTarget.value || null })}
			/>

			<PasswordInput
				label="API key"
				placeholder={connection?.komodoApiKeySet ? '•••••••• (unchanged)' : 'Not set'}
				value={pending.komodoApiKey ?? ''}
				onChange={(e) => onChange({ komodoApiKey: e.currentTarget.value })}
			/>

			<PasswordInput
				label="API secret"
				placeholder={connection?.komodoApiSecretSet ? '•••••••• (unchanged)' : 'Not set'}
				value={pending.komodoApiSecret ?? ''}
				onChange={(e) => onChange({ komodoApiSecret: e.currentTarget.value })}
			/>

			<PasswordInput
				label="Admin password"
				description="Protects this Settings panel. Leave blank to keep it unchanged."
				placeholder={connection?.adminPasswordSet ? '•••••••• (unchanged)' : 'Not set — admin routes are open'}
				value={pending.adminPassword ?? ''}
				onChange={(e) => onChange({ adminPassword: e.currentTarget.value })}
			/>

			<div>
				<Title order={6} fw={500} mb={4}>
					Port denylist
				</Title>
				<Text size="xs" c="dimmed" mb={8}>
					Extra ports to skip when deriving a stack link from its published container ports (e.g.
					internal-only sidecar ports). Common non-web ports are always excluded.
				</Text>
				<TagsInput
					placeholder="Add a port and press Enter"
					value={(effective.portDenylist ?? []).map(String)}
					onChange={(values) => {
						const ports = values.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
						onChange({ portDenylist: ports });
					}}
				/>
			</div>
		</Stack>
	);
}
