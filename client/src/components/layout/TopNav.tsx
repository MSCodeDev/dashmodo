import { AppShell, Button, Group, Title, useComputedColorScheme } from '@mantine/core';
import { ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { GLASS } from '../../lib/glass';
import { Logo } from './Logo';

export function TopNav({ onOpenSettings }: { onOpenSettings: () => void }) {
	const config = useConfig();
	const scheme = useComputedColorScheme('dark');
	const glass = GLASS.header[scheme];

	return (
		<AppShell.Header
			style={{
				backgroundColor: glass.backgroundColor,
				backdropFilter: 'blur(14px)',
				WebkitBackdropFilter: 'blur(14px)',
				borderBottom: `1px solid ${glass.borderColor}`,
				position: 'relative',
				zIndex: 1
			}}
		>
			<Group h="100%" px="md" justify="space-between">
				<Group gap="xs">
					<Logo color={config.data?.appSettings.themeColor ?? undefined} size={28} />
					<Title order={3} fw={700}>
						Dashmodo
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
