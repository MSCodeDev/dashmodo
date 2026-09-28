import { useState } from 'react';
import { Button, Group, Loader, Modal, Stack, Tabs, Text } from '@mantine/core';
import { useAdminLogout, useAdminSession } from '../../hooks/useAdmin';
import { useConfig } from '../../hooks/useConfig';
import { useErrorToast } from '../../hooks/useErrorToast';
import {
	useSaveAllSettings,
	useSettingsServers,
	useSettingsStacks,
	type PendingAppChange,
	type PendingServerChange,
	type PendingStackChange
} from '../../hooks/useSettings';
import { LoginForm } from './LoginForm';
import { StackSettingsTable } from './StackSettingsTable';
import { ServerSettingsTable } from './ServerSettingsTable';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function SettingsModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
	const session = useAdminSession();
	const logout = useAdminLogout();
	const config = useConfig();
	const stacksQuery = useSettingsStacks();
	const serversQuery = useSettingsServers();
	const { save, isPending } = useSaveAllSettings();

	useErrorToast(session.isError, session.error, 'Failed to check admin session');
	useErrorToast(config.isError, config.error, 'Failed to load settings');
	useErrorToast(stacksQuery.isError, stacksQuery.error, 'Failed to load stack settings');
	useErrorToast(serversQuery.isError, serversQuery.error, 'Failed to load server settings');

	const [pendingStacks, setPendingStacks] = useState<Record<string, PendingStackChange>>({});
	const [pendingServers, setPendingServers] = useState<Record<string, PendingServerChange>>({});
	const [pendingApp, setPendingApp] = useState<PendingAppChange>({});

	const hasChanges =
		Object.keys(pendingStacks).length > 0 ||
		Object.keys(pendingServers).length > 0 ||
		Object.keys(pendingApp).length > 0;

	function resetPending() {
		setPendingStacks({});
		setPendingServers({});
		setPendingApp({});
	}

	async function handleSave() {
		const ok = await save(pendingStacks, pendingServers, pendingApp);
		if (ok) resetPending();
	}

	function handleClose() {
		resetPending();
		onClose();
	}

	const authenticated = session.data?.authenticated;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			size={960}
			overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
			title={
				authenticated ? (
					<Group justify="space-between" w="100%" pr="xs">
						<Text fw={700} size="lg">
							Settings
						</Text>
						<Button
							size="xs"
							color={config.data?.appSettings.themeColor ?? undefined}
							onClick={handleSave}
							loading={isPending}
							disabled={!hasChanges}
						>
							Save
						</Button>
					</Group>
				) : (
					<Text fw={700} size="lg">
						Settings
					</Text>
				)
			}
		>
			{session.isLoading ? <Loader /> : null}
			{session.isError ? <ApiErrorAlert error={session.error} /> : null}

			{session.data && !authenticated ? <LoginForm /> : null}

			{session.data && authenticated ? (
				<Stack>
					{session.data.passwordRequired ? (
						<Group justify="flex-end">
							<Button variant="subtle" size="xs" onClick={() => logout.mutate()}>
								Log out
							</Button>
						</Group>
					) : null}

					<Tabs defaultValue="general">
						<Tabs.List>
							<Tabs.Tab value="general">General</Tabs.Tab>
							<Tabs.Tab value="stacks">Stacks</Tabs.Tab>
							<Tabs.Tab value="servers">Servers</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="general" pt="md">
							{config.isLoading ? <Loader /> : null}
							{config.isError ? <ApiErrorAlert error={config.error} /> : null}
							{config.data ? (
								<GeneralSettingsForm
									settings={config.data.appSettings}
									pending={pendingApp}
									onChange={(patch) => setPendingApp((prev) => ({ ...prev, ...patch }))}
								/>
							) : null}
						</Tabs.Panel>

						<Tabs.Panel value="stacks" pt="md">
							{stacksQuery.isLoading ? <Loader /> : null}
							{stacksQuery.isError ? <ApiErrorAlert error={stacksQuery.error} /> : null}
							{stacksQuery.data ? (
								<StackSettingsTable
									rows={stacksQuery.data}
									pending={pendingStacks}
									onChange={(id, patch) =>
										setPendingStacks((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
									}
									iconStyle={config.data?.appSettings.defaultIconStyle}
								/>
							) : null}
						</Tabs.Panel>

						<Tabs.Panel value="servers" pt="md">
							{serversQuery.isLoading ? <Loader /> : null}
							{serversQuery.isError ? <ApiErrorAlert error={serversQuery.error} /> : null}
							{serversQuery.data ? (
								<ServerSettingsTable
									rows={serversQuery.data}
									pending={pendingServers}
									onChange={(id, patch) =>
										setPendingServers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
									}
								/>
							) : null}
						</Tabs.Panel>
					</Tabs>
				</Stack>
			) : null}
		</Modal>
	);
}
