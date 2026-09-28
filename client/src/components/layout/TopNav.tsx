import { AppShell, Box, Button, Group, Title, useComputedColorScheme } from '@mantine/core';
import { Settings as SettingsIcon } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { GLASS } from '../../lib/glass';
import { selfhstIconUrl } from '../../lib/icons';
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
						{config.data?.appSettings.siteName || 'Dashmodo'}
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
							leftSection={
								<img
									src={selfhstIconUrl('komodo', 'light')}
									alt=""
									width={16}
									height={16}
									style={{ borderRadius: 3 }}
								/>
							}
						>
							<Box visibleFrom="sm">Komodo</Box>
						</Button>
					) : null}
					<Button
						variant="default"
						size="sm"
						leftSection={<SettingsIcon size={16} />}
						onClick={onOpenSettings}
					>
						<Box visibleFrom="sm">Settings</Box>
					</Button>
				</Group>
			</Group>
		</AppShell.Header>
	);
}
