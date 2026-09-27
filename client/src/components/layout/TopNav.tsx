import { AppShell, Button, Group, Title } from '@mantine/core';
import { ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';

export function TopNav({ onOpenSettings }: { onOpenSettings: () => void }) {
	const config = useConfig();

	return (
		<AppShell.Header bg="dark.6" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
			<Group h="100%" px="md" justify="space-between">
				<Group gap="xs">
					<img src="/logo.png" alt="" width={28} height={28} />
					<Title order={3} fw={700}>
						dashmodo
					</Title>
				</Group>
				<Group gap="sm">
					{config.data?.komodoUrl ? (
						<Button
							component="a"
							href={config.data.komodoUrl}
							target="_blank"
							rel="noreferrer"
							variant="default"
							size="sm"
							leftSection={<ExternalLink size={16} />}
						>
							Komodo
						</Button>
					) : null}
					<Button
						variant="default"
						size="sm"
						leftSection={<SettingsIcon size={16} />}
						onClick={onOpenSettings}
					>
						Settings
					</Button>
				</Group>
			</Group>
		</AppShell.Header>
	);
}
