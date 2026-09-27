import { useState } from 'react';
import { Alert, Button, Card, PasswordInput, Stack, Title } from '@mantine/core';
import { useAdminLogin } from '../../hooks/useAdmin';

export function LoginForm() {
	const [password, setPassword] = useState('');
	const login = useAdminLogin();

	return (
		<Card withBorder maw={360} p="lg">
			<Stack>
				<Title order={3}>Admin login</Title>
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
						<Button type="submit" loading={login.isPending}>
							Log in
						</Button>
					</Stack>
				</form>
			</Stack>
		</Card>
	);
}
