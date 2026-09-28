import { useState } from 'react';
import { Alert, Button, Card, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { Logo } from '../layout/Logo';
import { useAdminLogin } from '../../hooks/useAdmin';

export function LoginForm() {
	const [password, setPassword] = useState('');
	const login = useAdminLogin();

	return (
		<Card withBorder maw={420} w="100%" p="xl">
			<Stack>
				<Stack align="center" gap={6}>
					<Logo size={40} />
					<Title order={3}>Admin login</Title>
					<Text size="sm" c="dimmed" ta="center">
						Enter the admin password to continue.
					</Text>
				</Stack>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						login.mutate(password);
					}}
				>
					<Stack>
						<PasswordInput
							label="Password"
							value={password}
							onChange={(e) => setPassword(e.currentTarget.value)}
							autoFocus
						/>
						{login.isError ? (
							<Alert color="red">
								{login.error instanceof Error ? login.error.message : 'Login failed'}
							</Alert>
						) : null}
						<Button type="submit" loading={login.isPending} mt="lg">
							Log in
						</Button>
					</Stack>
				</form>
			</Stack>
		</Card>
	);
}
