import { AppShell, Anchor, Button, Group, Text } from '@mantine/core';
import { useConfig } from '../../hooks/useConfig';

export function TopNav({ onOpenSettings }: { onOpenSettings: () => void }) {
	const config = useConfig();

	return (
		<AppShell.Header>
			<Group h="100%" px="md" justify="space-between">
				<Text fw={700}>dashmodo</Text>
				<Group gap="lg">
					{config.data?.komodoUrl ? (
						<Anchor href={config.data.komodoUrl} target="_blank" rel="noreferrer" size="sm">
							Komodo
						</Anchor>
					) : null}
					<Button variant="subtle" size="sm" onClick={onOpenSettings}>
						Settings
					</Button>
				</Group>
			</Group>
		</AppShell.Header>
	);
}
