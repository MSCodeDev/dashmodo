import { useState } from 'react';
import {
	Alert,
	Button,
	Card,
	Center,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import { Logo } from '../layout/Logo';
import { FieldLabel } from '../common/FieldLabel';
import { useOnboarding } from '../../hooks/useOnboarding';

export function OnboardingScreen() {
	const [setupToken, setSetupToken] = useState('');
	const [komodoUrl, setKomodoUrl] = useState('');
	const [komodoApiKey, setKomodoApiKey] = useState('');
	const [komodoApiSecret, setKomodoApiSecret] = useState('');
	const [adminPassword, setAdminPassword] = useState('');
	const onboarding = useOnboarding();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onboarding.mutate({
			setupToken,
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
							<PasswordInput
								label={
									<FieldLabel
										label="Setup token"
										tooltip="Printed to the server console (e.g. docker compose logs dashmodo) when the container starts, until onboarding is complete."
									/>
								}
								value={setupToken}
								onChange={(e) => setSetupToken(e.currentTarget.value)}
								required
								autoFocus
							/>
							<TextInput
								label={
									<FieldLabel
										label="Komodo URL"
										tooltip="The base URL where Dashmodo can reach your Komodo instance, including its port."
									/>
								}
								placeholder="http://localhost:9120"
								value={komodoUrl}
								onChange={(e) => setKomodoUrl(e.currentTarget.value)}
								required
							/>
							<PasswordInput
								label={
									<FieldLabel
										label="API key"
										tooltip="In Komodo: Settings → Users → click your user → API Keys section."
									/>
								}
								value={komodoApiKey}
								onChange={(e) => setKomodoApiKey(e.currentTarget.value)}
								required
							/>
							<PasswordInput
								label={
									<FieldLabel
										label="API secret"
										tooltip="Shown once alongside the API key when it's created in Komodo — copy it then, Komodo won't show it again."
									/>
								}
								value={komodoApiSecret}
								onChange={(e) => setKomodoApiSecret(e.currentTarget.value)}
								required
							/>
							<PasswordInput
								label={
									<FieldLabel
										label="Admin password"
										tooltip="Protects the Settings panel. Leave blank to leave it open on your LAN. At least 4 characters if set."
									/>
								}
								value={adminPassword}
								onChange={(e) => setAdminPassword(e.currentTarget.value)}
								minLength={4}
							/>
							{onboarding.isError ? (
								<Alert color="red">
									{onboarding.error instanceof Error ? onboarding.error.message : 'Setup failed'}
								</Alert>
							) : null}
							<Button type="submit" loading={onboarding.isPending} mt="lg">
								Connect
							</Button>
						</Stack>
					</form>
				</Stack>
			</Card>
		</Center>
	);
}
