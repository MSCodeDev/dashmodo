import { Button, Group, Loader, Modal, Stack, Tabs } from '@mantine/core';
import { useAdminLogout, useAdminSession } from '../../hooks/useAdmin';
import { useSettingsServers, useSettingsStacks } from '../../hooks/useSettings';
import { LoginForm } from './LoginForm';
import { StackSettingsTable } from './StackSettingsTable';
import { ServerSettingsTable } from './ServerSettingsTable';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function SettingsModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
	const session = useAdminSession();
	const logout = useAdminLogout();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title="Settings"
			size="xl"
			overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
		>
			{session.isLoading ? <Loader /> : null}
			{session.isError ? <ApiErrorAlert error={session.error} /> : null}

			{session.data && !session.data.authenticated ? <LoginForm /> : null}

			{session.data?.authenticated ? (
				<SettingsContent
					showLogout={session.data.passwordRequired}
					onLogout={() => logout.mutate()}
				/>
			) : null}
		</Modal>
	);
}

function SettingsContent({ showLogout, onLogout }: { showLogout: boolean; onLogout: () => void }) {
	const stacks = useSettingsStacks();
	const servers = useSettingsServers();

	return (
		<Stack>
			{showLogout ? (
				<Group justify="flex-end">
					<Button variant="subtle" size="xs" onClick={onLogout}>
						Log out
					</Button>
				</Group>
			) : null}

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
