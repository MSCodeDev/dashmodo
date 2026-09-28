import { PasswordInput, Stack, TagsInput, Text, TextInput } from '@mantine/core';
import { FieldLabel } from '../common/FieldLabel';
import type { AppSettings, ConnectionSettings } from '../../lib/types';
import type { PendingAppChange } from '../../hooks/useSettings';

interface Props {
	settings: AppSettings;
	connection?: ConnectionSettings;
	pending: PendingAppChange;
	onChange: (patch: PendingAppChange) => void;
}

export function ConnectionSettingsForm({ settings, connection, pending, onChange }: Props) {
	const effective = { ...settings, ...pending };

	return (
		<Stack gap="md">
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
				label={
					<FieldLabel
						label="Admin password"
						tooltip="Protects this Settings panel. Leave blank to keep it unchanged."
					/>
				}
				placeholder={connection?.adminPasswordSet ? '•••••••• (unchanged)' : 'Not set'}
				value={pending.adminPassword ?? ''}
				onChange={(e) => onChange({ adminPassword: e.currentTarget.value })}
			/>

			<div>
				<Text size="sm" fw={500} mb={8}>
					<FieldLabel
						label="Port denylist"
						tooltip="Extra ports to skip when deriving a stack link from its published container ports (e.g. internal-only sidecar ports). Common non-web ports are always excluded."
					/>
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
