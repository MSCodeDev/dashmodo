import { useState } from 'react';
import { AppShell, Stack } from '@mantine/core';
import { TopNav } from './components/layout/TopNav';
import { ServersSection } from './components/servers/ServersSection';
import { StacksSection } from './components/stacks/StacksSection';
import { SettingsModal } from './components/settings/SettingsModal';

export default function App() {
	const [settingsOpen, setSettingsOpen] = useState(false);

	return (
		<>
			<AppShell header={{ height: 56 }} padding="md">
				<TopNav onOpenSettings={() => setSettingsOpen(true)} />
				<AppShell.Main>
					<Stack gap="xl">
						<ServersSection />
						<StacksSection />
					</Stack>
				</AppShell.Main>
			</AppShell>
			<SettingsModal opened={settingsOpen} onClose={() => setSettingsOpen(false)} />
		</>
	);
}
