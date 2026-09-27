import { Button, Group, Loader, Stack, Tabs, Title } from '@mantine/core';
import { useAdminLogout, useAdminSession } from '../hooks/useAdmin';
import { useSettingsServers, useSettingsStacks } from '../hooks/useSettings';
import { LoginForm } from '../components/settings/LoginForm';
import { StackSettingsTable } from '../components/settings/StackSettingsTable';
import { ServerSettingsTable } from '../components/settings/ServerSettingsTable';
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
	const servers = useSettingsServers();

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

			<Tabs defaultValue="stacks">
				<Tabs.List>
					<Tabs.Tab value="stacks">Stacks</Tabs.Tab>
					<Tabs.Tab value="servers">Servers</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="stacks" pt="md">
					{stacks.isLoading ? <Loader /> : null}
					{stacks.isError ? <ApiErrorAlert error={stacks.error} /> : null}
					{stacks.data ? <StackSettingsTable rows={stacks.data} /> : null}
				</Tabs.Panel>

				<Tabs.Panel value="servers" pt="md">
					{servers.isLoading ? <Loader /> : null}
					{servers.isError ? <ApiErrorAlert error={servers.error} /> : null}
					{servers.data ? <ServerSettingsTable rows={servers.data} /> : null}
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
}
