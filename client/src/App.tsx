import { useState } from 'react';
import { AppShell, Center, Loader, Stack } from '@mantine/core';
import { TopNav } from './components/layout/TopNav';
import { AppSettingsEffects } from './components/layout/AppSettingsEffects';
import { BackgroundGlow } from './components/layout/BackgroundGlow';
import { ServersSection } from './components/servers/ServersSection';
import { StacksSection } from './components/stacks/StacksSection';
import { SettingsModal } from './components/settings/SettingsModal';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { useConfig } from './hooks/useConfig';

export default function App() {
	const [settingsOpen, setSettingsOpen] = useState(false);
	const config = useConfig();

	if (config.isLoading) {
		return (
			<Center mih="100vh">
				<Loader />
			</Center>
		);
	}

	if (config.data?.needsOnboarding) {
		return <OnboardingScreen />;
	}

	return (
		<>
			<AppSettingsEffects />
			<BackgroundGlow color={config.data?.appSettings.themeColor} />
			<AppShell header={{ height: 56 }} padding="xl">
				<TopNav onOpenSettings={() => setSettingsOpen(true)} />
				<AppShell.Main
					style={{
						position: 'relative',
						zIndex: 1,
						paddingTop: 'calc(21px + var(--mantine-spacing-sm))'
					}}
				>
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
