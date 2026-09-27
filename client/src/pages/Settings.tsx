import { Button, Group, Loader, Stack, Title } from '@mantine/core';
import { useAdminLogout, useAdminSession } from '../hooks/useAdmin';
import { useSettingsStacks } from '../hooks/useSettings';
import { LoginForm } from '../components/settings/LoginForm';
import { StackSettingsTable } from '../components/settings/StackSettingsTable';
import { ApiErrorAlert } from '../components/common/ApiErrorAlert';

export function Settings() {
	const session = useAdminSession();
	const logout = useAdminLogout();

	if (session.isLoading) return <Loader />;
	if (session.isError) return <ApiErrorAlert error={session.error} />;

	if (!session.data?.authenticated) {
		return (
			<Stack>
				<Title order={2}>Settings</Title>
				<LoginForm />
			</Stack>
		);
	}

	return (
		<SettingsContent
			showLogout={session.data.passwordRequired}
			onLogout={() => logout.mutate()}
		/>
	);
}

function SettingsContent({ showLogout, onLogout }: { showLogout: boolean; onLogout: () => void }) {
	const stacks = useSettingsStacks();

	return (
		<Stack>
			<Group justify="space-between">
				<Title order={2}>Settings</Title>
				{showLogout ? (
					<Button variant="subtle" onClick={onLogout}>
						Log out
					</Button>
				) : null}
			</Group>

			{stacks.isLoading ? <Loader /> : null}
			{stacks.isError ? <ApiErrorAlert error={stacks.error} /> : null}
			{stacks.data ? <StackSettingsTable rows={stacks.data} /> : null}
		</Stack>
	);
}
