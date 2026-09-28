import { useState } from 'react';
import { Alert, Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { Logo } from '../layout/Logo';
import { useOnboarding } from '../../hooks/useOnboarding';

export function OnboardingScreen() {
	const [komodoUrl, setKomodoUrl] = useState('');
	const [komodoApiKey, setKomodoApiKey] = useState('');
	const [komodoApiSecret, setKomodoApiSecret] = useState('');
	const [adminPassword, setAdminPassword] = useState('');
	const onboarding = useOnboarding();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onboarding.mutate({
			komodoUrl,
			komodoApiKey,
			komodoApiSecret,
			...(adminPassword ? { adminPassword } : {})
		});
	}

	return (
		<Center mih="100vh" p="md">
			<Card withBorder maw={420} w="100%" p="xl">
				<Stack>
					<Stack align="center" gap={6}>
						<Logo size={40} />
						<Title order={3}>Welcome to Dashmodo</Title>
						<Text size="sm" c="dimmed" ta="center">
							Connect to your Komodo instance to get started.
						</Text>
					</Stack>

					<form onSubmit={handleSubmit}>
						<Stack>
							<TextInput
								label="Komodo URL"
								placeholder="http://localhost:9120"
								value={komodoUrl}
								onChange={(e) => setKomodoUrl(e.currentTarget.value)}
								required
								autoFocus
							/>
							<PasswordInput
								label="API key"
								value={komodoApiKey}
								onChange={(e) => setKomodoApiKey(e.currentTarget.value)}
								required
							/>
							<PasswordInput
								label="API secret"
								value={komodoApiSecret}
								onChange={(e) => setKomodoApiSecret(e.currentTarget.value)}
								required
							/>
							<PasswordInput
								label="Admin password"
								description="Protects the Settings panel. Leave blank to leave it open on your LAN."
								value={adminPassword}
								onChange={(e) => setAdminPassword(e.currentTarget.value)}
							/>
							{onboarding.isError ? (
								<Alert color="red">
									{onboarding.error instanceof Error ? onboarding.error.message : 'Setup failed'}
								</Alert>
							) : null}
							<Button type="submit" loading={onboarding.isPending}>
								Connect
							</Button>
						</Stack>
					</form>
				</Stack>
			</Card>
		</Center>
	);
}
